import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import report from './report.mjs';

/**
 * The `#`-prefixed subpath aliases are declared twice: once in the root
 * `package.json` (pointing at the TypeScript sources under `src/`) and once in
 * `scripts/_package.json`, which is shipped as the published `package.json`
 * with `dist` as the package root.
 *
 * Adding an alias to only one of them type-checks and tests green locally,
 * and breaks exclusively for consumers of the published package. This script
 * guards against that and runs as part of `npm run check`.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEV_MANIFEST = 'package.json';
const DIST_MANIFEST = 'scripts/_package.json';

/** The directory the dev targets are expected to live under. */
const SOURCE_ROOT = 'src';

const readImports = async (file) => {
  const { imports } = JSON.parse(await readFile(path.join(ROOT, file), 'utf8'));
  return imports ?? {};
};

/** `#theming/*.js` -> `#theming` */
const aliasOf = (key) => key.split('/', 1)[0];

/** `./src/theming/*.ts` -> `src/theming` */
const targetDirOf = (target) => path.posix.dirname(target.replace(/^\.\//, ''));

const isDirectory = (dir) =>
  stat(path.join(ROOT, dir)).then(
    (entry) => entry.isDirectory(),
    () => false
  );

// A single alias has two dev keys (`#x/*.js` and `#x/*`), so the same
// published target can be flagged more than once.
const errors = new Set();
const fail = (message) => errors.add(message);

const [dev, dist] = await Promise.all([
  readImports(DEV_MANIFEST),
  readImports(DIST_MANIFEST),
]);

const devAliases = new Set(Object.keys(dev).map(aliasOf));
const distAliases = new Set(Object.keys(dist).map(aliasOf));

for (const alias of devAliases.difference(distAliases)) {
  fail(
    `${alias} is declared in ${DEV_MANIFEST} but missing from ${DIST_MANIFEST}`
  );
}

for (const alias of distAliases.difference(devAliases)) {
  fail(
    `${alias} is declared in ${DIST_MANIFEST} but missing from ${DEV_MANIFEST}`
  );
}

// Every dev target must point at a real source directory, and the published
// target must be the same directory with the `src/` prefix stripped, since
// `dist` mirrors `src` one-to-one.
for (const [key, target] of Object.entries(dev)) {
  const dir = targetDirOf(target);

  if (!dir.startsWith(`${SOURCE_ROOT}/`)) {
    fail(
      `${DEV_MANIFEST}: "${key}" -> "${target}" must resolve under ${SOURCE_ROOT}/`
    );
    continue;
  }

  if (!(await isDirectory(dir))) {
    fail(
      `${DEV_MANIFEST}: "${key}" -> "${target}" points at a missing directory`
    );
    continue;
  }

  const alias = aliasOf(key);
  const expected = dir.slice(SOURCE_ROOT.length + 1);

  for (const [distKey, distTarget] of Object.entries(dist)) {
    if (aliasOf(distKey) !== alias) {
      continue;
    }

    const actual = targetDirOf(distTarget);

    if (actual !== expected) {
      fail(
        `${DIST_MANIFEST}: "${distKey}" -> "${distTarget}" resolves to "${actual}", expected "${expected}" to mirror ${DEV_MANIFEST}`
      );
    }
  }
}

if (errors.size) {
  report.error(
    `\n[Import aliases] ✖\n${Array.from(errors, (e) => `  - ${e}`).join('\n')}\n`
  );
  process.exit(1);
}

report.success(
  `[Import aliases] ✔ ${devAliases.size} alias(es) in sync across ${DEV_MANIFEST} and ${DIST_MANIFEST}`
);
