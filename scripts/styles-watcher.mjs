// @ts-check
import { watch } from 'node:fs';
import path from 'node:path';
import report from './report.mjs';
import { createStyleBuilder } from './sass.mjs';

/**
 * `fs.watch` reports a single save as several events, and one editor action can
 * touch a whole directory, so changes are collected for a moment before a
 * rebuild starts.
 */
const DEBOUNCE_MS = 100;

const now = () => `[${new Date().toLocaleTimeString()}] 🎨`;

const builder = await createStyleBuilder();

/** @type {Set<string>} */
const pending = new Set();
/** @type {NodeJS.Timeout | undefined} */
let timer;
let draining = false;

async function drain() {
  // A drain already in flight picks up whatever has just been queued on its next
  // pass, so bailing out here coalesces the batch rather than dropping it.
  if (draining) {
    return;
  }

  draining = true;

  try {
    while (pending.size) {
      const changed = new Set(pending);
      pending.clear();

      report.warn(
        `${now()} change detected: ${Array.from(changed).join(', ')}`
      );

      const { compiled, failed } = await builder.update(changed);

      if (failed) {
        continue;
      }

      if (compiled) {
        report.success(`${now()} Styles rebuilt (${compiled} entries)`);
      } else {
        // Nothing imports the changed file yet — a partial added ahead of the
        // `@use` that will pull it in.
        report.info(`${now()} No entry depends on the change yet`);
      }
    }
  } finally {
    draining = false;
  }
}

const { total, compiled, pruned } = await builder.run();

if (pruned.length) {
  report.warn(
    `${now()} Removed ${pruned.length} orphaned style module(s):\n${pruned.map((file) => `  - ${file}`).join('\n')}`
  );
}

report.success(
  compiled
    ? `${now()} Styles built (${compiled} of ${total} entries)`
    : `${now()} Styles up to date (${total} entries)`
);

watch('src', { recursive: true }, (_, fileName) => {
  if (!fileName?.endsWith('.scss')) {
    return;
  }

  pending.add(path.posix.join('src', fileName.split(path.sep).join('/')));

  clearTimeout(timer);
  timer = setTimeout(drain, DEBOUNCE_MS);
}).on('close', () => builder.dispose());

report.info(`${now()} Styles watcher started...`);
