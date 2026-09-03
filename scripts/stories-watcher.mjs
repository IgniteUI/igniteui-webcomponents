// @ts-check
/** @import { Package } from 'custom-elements-manifest/schema' */
import { watch } from 'node:fs';
import { readFile } from 'node:fs/promises';
import report from './report.mjs';
import { buildStories } from './stories.mjs';

const MANIFEST = 'custom-elements.json';

/**
 * The analyzer rewrites the manifest in more than one step, so a rebuild waits
 * for the writes to settle instead of starting on the first one.
 */
const DEBOUNCE_MS = 150;

const now = () => `[${new Date().toLocaleTimeString()}]`;

/** @type {NodeJS.Timeout | undefined} */
let timer;
let queued = false;
let draining = false;

async function drain() {
  // A rebuild already in flight loops again for anything queued while it ran, so
  // returning here coalesces rather than drops.
  if (draining) {
    return;
  }

  draining = true;

  try {
    while (queued) {
      queued = false;
      report.info(`${now()} Manifest updated, rebuilding stories...`);

      try {
        // Re-read rather than import: a module import would be cached, and every
        // pass after the first would regenerate from the manifest this process
        // happened to see first.
        const manifest = /** @type {Package} */ (
          JSON.parse(await readFile(MANIFEST, 'utf8'))
        );
        const { written, failed } = await buildStories(manifest);

        if (!failed) {
          report.success(
            written
              ? `${now()} Stories updated (${written} files)`
              : `${now()} Stories already up to date`
          );
        }
      } catch (error) {
        report.error(
          `${now()} ERROR: ${error instanceof Error ? error.message : error}`
        );
      }
    }
  } finally {
    draining = false;
  }
}

watch('.', (_, fileName) => {
  if (fileName !== MANIFEST) {
    return;
  }

  queued = true;
  clearTimeout(timer);
  timer = setTimeout(drain, DEBOUNCE_MS);
});

report.info(`${now()} Metadata watcher started...`);
