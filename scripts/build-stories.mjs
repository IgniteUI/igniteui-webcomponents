// @ts-check
/** @import { Package } from 'custom-elements-manifest/schema' */
import { exec } from 'node:child_process';
import { access } from 'node:fs/promises';
import { promisify } from 'node:util';
import report from './report.mjs';
import { buildStories } from './stories.mjs';

const MANIFEST = new URL('../custom-elements.json', import.meta.url);

// The manifest is generated rather than committed, so there may be nothing to
// import yet on a fresh clone.
const found = await access(MANIFEST).then(
  () => true,
  () => false
);

if (!found) {
  report.info('No manifest found, running the analyzer first...');
  await promisify(exec)('npm run cem');
}

// A URL specifier rather than a literal one, so that the import stays inside the
// guard above and TypeScript is not asked to infer a type for three megabytes of
// JSON it would only end up discarding.
const { default: manifest } = await import(MANIFEST.href, {
  with: { type: 'json' },
});

const { written, failed } = await buildStories(
  /** @type {Package} */ (manifest)
).catch((error) => {
  report.error(
    `Stories build failed: ${error instanceof Error ? error.message : error}`
  );
  process.exit(1);
});

if (failed) {
  process.exit(1);
}

report.success(
  written ? `Stories updated (${written} files)` : 'Stories up to date'
);
