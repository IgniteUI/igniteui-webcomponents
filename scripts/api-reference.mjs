// @ts-check
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPages } from './build-llms.mjs';
import report from './report.mjs';

/**
 * Keeps the committed `api-reference/<tag>.md` pages in step with the Custom
 * Elements Manifest. They are the `docs/<tag>.md` pages of the published
 * package. The repository keeps a copy for tools that read only the
 * repository, for example Context7 (see `context7.json`).
 *
 * - `node scripts/api-reference.mjs` checks the committed pages.
 * - `node scripts/api-reference.mjs --update` rewrites them.
 *
 * Run `npm run cem` first: the manifest is a build output and is not tracked.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = 'custom-elements.json';
const FOLDER = 'api-reference';
const directory = path.join(ROOT, FOLDER);

/**
 * The committed pages, by file name. A checkout on Windows can have CRLF
 * line endings.
 *
 * @returns {Promise<Map<string, string>>}
 */
async function readCommitted() {
  /** @type {string[]} */
  let files = [];

  try {
    files = (await readdir(directory)).filter((file) => file.endsWith('.md'));
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'ENOENT') {
      throw error;
    }
  }

  return new Map(
    await Promise.all(
      files.map(async (file) => {
        const text = await readFile(path.join(directory, file), 'utf8');
        return /** @type {[string, string]} */ ([
          file,
          text.replaceAll('\r\n', '\n'),
        ]);
      })
    )
  );
}

const pages = renderPages(
  JSON.parse(await readFile(path.join(ROOT, MANIFEST), 'utf8'))
);
const committed = await readCommitted();
const stale = new Set(committed.keys()).difference(new Set(pages.keys()));

if (process.argv.includes('--update')) {
  await mkdir(directory, { recursive: true });
  await Promise.all([
    ...Array.from(stale, (file) => rm(path.join(directory, file))),
    ...Array.from(pages, ([file, page]) =>
      writeFile(path.join(directory, file), page, 'utf8')
    ),
  ]);
  report.success(`[API reference] ✔ ${FOLDER} updated`);
  process.exit(0);
}

const changes = [
  ...Array.from(pages.keys())
    .filter((file) => committed.get(file) !== pages.get(file))
    .map((file) => `${committed.has(file) ? 'changed' : 'missing'} ${file}`),
  ...Array.from(stale, (file) => `stale ${file}`),
];

if (changes.length) {
  report.error(
    `\n[API reference] ✖ ${changes.length} page(s) out of step with the manifest:\n${changes.map((line) => `  - ${line}`).join('\n')}\n\nRun \`npm run public-api:update\` and commit ${FOLDER}.\n`
  );
  process.exit(1);
}

report.success(`[API reference] ✔ ${pages.size} pages match the manifest`);
