// @ts-check
import { createHash } from 'node:crypto';
import { glob, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import * as sass from 'sass-embedded';
import report from './report.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @param {string} p */
const toPosix = (p) => p.split(path.sep).join('/');

/**
 * Repo-relative POSIX path — the form every path in this module and in the build
 * cache takes, so nothing depends on the process working directory.
 *
 * @param {string} absolute
 */
const toRelative = (absolute) => toPosix(path.relative(ROOT, absolute));

/** @param {string} relative */
const toAbsolute = (relative) => path.join(ROOT, relative);

/** @param {string} relative */
const exists = (relative) =>
  stat(toAbsolute(relative)).then(
    () => true,
    () => false
  );

/**
 * A file matched by one of these globs is an *entry*: it compiles to an output
 * artifact of its own. Every other `.scss` under `src` is a partial that only
 * reaches the output through an entry importing it, and must never be compiled
 * on its own — doing so yields a stray, mostly empty artifact while leaving the
 * entries that actually depend on it untouched.
 */
const ENTRY_GLOBS = /** @type {const} */ ({
  theme: 'src/styles/themes/{light,dark}/*.scss',
  component:
    'src/components/**/*.{base,common,shared,material,bootstrap,indigo,fluent}.scss',
});

const CACHE_FILE = 'node_modules/.cache/igniteui-webcomponents/styles.json';

/** Bump to invalidate every cached entry after a change to the build itself. */
const CACHE_VERSION = 1;

/** @type {import('postcss').Plugin} */
const stripComments = {
  postcssPlugin: 'postcss-strip-comments',
  OnceExit(root) {
    root.walkComments((node) => {
      node.remove();
    });
  },
};

const postProcessor = postcss([autoprefixer, stripComments]);

/**
 * @typedef {{ path: string, kind: keyof typeof ENTRY_GLOBS }} Entry
 *
 * @typedef {{ output: string, deps: string[], digest: string }} CacheRecord
 *   `deps` is every file the entry loaded, itself included; `digest` fingerprints
 *   their contents as of the build that produced `output`.
 *
 * @typedef {{
 *   version: number,
 *   files: string[],
 *   entries: Record<string, { output: string, deps: number[], digest: string }>,
 * }} SerializedCache
 *   The on-disk form, with each `deps` entry an index into the shared `files`
 *   table rather than a repeated path.
 */

/** @param {string} content */
const fromTemplate = (content) => `
  import { css } from 'lit';
  export const styles = css\`${content}\`;
  `;

/**
 * Hashes each file at most once per build pass. Promises rather than digests are
 * memoized so concurrent callers asking for the same partial — `_mixins.scss` is
 * pulled in by every one of the ~750 entries — share a single read.
 */
function createHasher() {
  /** @type {Map<string, Promise<string>>} */
  const hashes = new Map();

  /**
   * @param {string} file
   * @returns {Promise<string>} The digest, or `'\0'` when the file is gone, so a
   *   deleted dependency reads as a change rather than as an error.
   */
  const hash = (file) => {
    let pending = hashes.get(file);

    if (!pending) {
      pending = readFile(toAbsolute(file))
        .then((contents) => createHash('sha1').update(contents).digest('hex'))
        .catch(() => '\0');
      hashes.set(file, pending);
    }

    return pending;
  };

  return {
    hash,
    /** @param {string[]} files */
    async digest(files) {
      const parts = await Promise.all(files.map(hash));
      const digest = createHash('sha1');

      for (const part of parts) {
        digest.update(part);
      }

      return digest.digest('hex');
    },
  };
}

/** @typedef {ReturnType<typeof createHasher>} Hasher */

/**
 * Compiles the SCSS entries, skipping the ones whose inputs are unchanged since
 * the last build.
 *
 * Both the incremental check and the watcher need the same piece of information:
 * which files a given entry actually loaded. Sass reports that as `loadedUrls`
 * on every compilation, so the dependency graph is a by-product of building.
 */
class StyleBuilder {
  /** @type {Map<string, Entry>} */
  entries = new Map();

  /** @type {Map<string, CacheRecord>} */
  records = new Map();

  /**
   * @param {sass.AsyncCompiler} compiler
   * @param {boolean} production Release builds run against a freshly cleaned
   *   tree and are never incremental — a published artifact should not be able
   *   to come out of a stale cache.
   */
  constructor(compiler, production) {
    this.compiler = compiler;
    this.production = production;
  }

  /** Rebuilds the entry list from the globs, picking up added and removed files. */
  async scan() {
    /** @type {Map<string, Entry>} */
    const entries = new Map();

    await Promise.all(
      Object.entries(ENTRY_GLOBS).map(async ([kind, pattern]) => {
        for await (const match of glob(pattern, { cwd: ROOT })) {
          const file = toPosix(match);
          entries.set(file, {
            path: file,
            kind: /** @type {keyof typeof ENTRY_GLOBS} */ (kind),
          });
        }
      })
    );

    this.entries = entries;

    for (const entryPath of this.records.keys()) {
      if (!entries.has(entryPath)) {
        this.records.delete(entryPath);
      }
    }
  }

  /**
   * Deletes generated `.css.ts` modules no entry claims any more.
   *
   * They are gitignored, so a renamed or removed component leaves its artifacts
   * behind invisibly — and because they are still TypeScript under `src`, the
   * release build happily compiles them into `dist` and publishes dead modules.
   *
   * @returns {Promise<string[]>} The pruned paths.
   */
  async prune() {
    const expected = new Set(
      Array.from(this.entries.values(), (entry) => this.outputFor(entry).file)
    );

    /** @type {string[]} */
    const orphans = [];

    for await (const match of glob('src/**/*.css.ts', { cwd: ROOT })) {
      const file = toPosix(match);

      if (!expected.has(file)) {
        orphans.push(file);
      }
    }

    await Promise.all(orphans.map((file) => rm(toAbsolute(file))));

    return orphans;
  }

  /**
   * Component styles always compile to a sibling `.css.ts` module. Themes do too
   * during development, but a release build emits them as plain `.css` under
   * `dist/themes` for consumers to link directly.
   *
   * @param {Entry} entry
   * @returns {{ file: string, wrap: boolean }}
   */
  outputFor(entry) {
    return this.production && entry.kind === 'theme'
      ? {
          file: entry.path
            .replace(/\.scss$/, '.css')
            .replace('src/styles/', 'dist/'),
          wrap: false,
        }
      : { file: entry.path.replace(/\.scss$/, '.css.ts'), wrap: true };
  }

  /**
   * @param {Entry} entry
   * @param {Hasher} hasher
   */
  async isStale(entry, hasher) {
    const record = this.records.get(entry.path);

    if (!record || record.output !== this.outputFor(entry).file) {
      return true;
    }

    return (
      !(await exists(record.output)) ||
      (await hasher.digest(record.deps)) !== record.digest
    );
  }

  /**
   * @param {Entry} entry
   * @param {Hasher} hasher
   */
  async compile(entry, hasher) {
    const { css, loadedUrls } = await this.compiler.compileAsync(
      toAbsolute(entry.path),
      {
        style: 'compressed',
        loadPaths: [toAbsolute('node_modules'), toAbsolute('src')],
      }
    );

    const processed = postProcessor.process(css).css;
    const output =
      processed.charCodeAt(0) === 0xfeff ? processed.slice(1) : processed;
    const { file, wrap } = this.outputFor(entry);

    // Only the release theme output lands somewhere other than next to its
    // source, so it is the only case that can need a new directory.
    if (!wrap) {
      await mkdir(path.dirname(toAbsolute(file)), { recursive: true });
    }

    await writeFile(toAbsolute(file), wrap ? fromTemplate(output) : output, {
      encoding: 'utf-8',
    });

    const deps = loadedUrls
      .filter((url) => url.protocol === 'file:')
      .map((url) => toRelative(fileURLToPath(url)));

    this.records.set(entry.path, {
      output: file,
      deps,
      digest: await hasher.digest(deps),
    });
  }

  /**
   * @param {Entry[]} entries
   * @param {Hasher} hasher
   * @returns {Promise<number>} The number of entries that failed.
   */
  async compileAll(entries, hasher) {
    const results = await Promise.allSettled(
      entries.map((entry) => this.compile(entry, hasher))
    );

    let failed = 0;

    // A failed entry keeps whatever record it had, so it stays stale and is
    // retried on the next pass instead of being silently written off.
    for (const [index, result] of results.entries()) {
      if (result.status === 'rejected') {
        failed++;
        report.error(
          `${entries[index].path}\n${result.reason?.message ?? result.reason}`
        );
      }
    }

    return failed;
  }

  async loadCache() {
    if (this.production) {
      return;
    }

    try {
      /** @type {SerializedCache} */
      const cache = JSON.parse(await readFile(toAbsolute(CACHE_FILE), 'utf8'));

      if (cache.version !== CACHE_VERSION) {
        return;
      }

      for (const [entryPath, record] of Object.entries(cache.entries)) {
        this.records.set(entryPath, {
          ...record,
          deps: record.deps.map((index) => cache.files[index]),
        });
      }
    } catch {
      // A missing or corrupt cache is not an error; it just means a full build.
      this.records.clear();
    }
  }

  async saveCache() {
    if (this.production) {
      return;
    }

    // Dependency paths are interned: the same few hundred partials appear across
    // every entry, so storing indices keeps the cache small.
    /** @type {Map<string, number>} */
    const ids = new Map();

    /** @param {string} file */
    const idOf = (file) => {
      let id = ids.get(file);

      if (id === undefined) {
        id = ids.size;
        ids.set(file, id);
      }

      return id;
    };

    /** @type {SerializedCache['entries']} */
    const entries = {};

    for (const [entryPath, record] of this.records) {
      entries[entryPath] = { ...record, deps: record.deps.map(idOf) };
    }

    const target = toAbsolute(CACHE_FILE);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(
      target,
      JSON.stringify({
        version: CACHE_VERSION,
        files: Array.from(ids.keys()),
        entries,
      }),
      'utf-8'
    );
  }

  /**
   * Brings every entry up to date.
   *
   * @returns {Promise<{ total: number, compiled: number, failed: number, pruned: string[] }>}
   */
  async run() {
    await this.loadCache();
    await this.scan();

    const pruned = await this.prune();
    const hasher = createHasher();
    const entries = Array.from(this.entries.values());
    const flags = await Promise.all(
      entries.map((entry) => this.isStale(entry, hasher))
    );
    const stale = entries.filter((_, index) => flags[index]);

    const failed = await this.compileAll(stale, hasher);
    await this.saveCache();

    return { total: entries.length, compiled: stale.length, failed, pruned };
  }

  /**
   * Re-compiles every entry affected by `changed`, resolved through the
   * dependency graph so editing a shared partial rebuilds its dependents rather
   * than the partial itself.
   *
   * @param {Iterable<string>} changed Repo-relative POSIX paths.
   * @returns {Promise<{ compiled: number, failed: number }>}
   */
  async update(changed) {
    const files = new Set(changed);
    const known = new Set(this.entries.keys());

    for (const record of this.records.values()) {
      for (const dep of record.deps) {
        known.add(dep);
      }
    }

    // A path the graph has never seen is either a new entry or a new partial, so
    // the entry list is refreshed before dependents are resolved.
    if (Array.from(files).some((file) => !known.has(file))) {
      await this.scan();
    }

    const targets = Array.from(this.entries.values()).filter((entry) => {
      const record = this.records.get(entry.path);

      // An entry is always its own first dependency, so a record covers both
      // "this entry changed" and "something it imports changed".
      return record
        ? record.deps.some((dep) => files.has(dep))
        : files.has(entry.path);
    });

    const failed = await this.compileAll(targets, createHasher());
    await this.saveCache();

    return { compiled: targets.length, failed };
  }

  dispose() {
    return this.compiler.dispose();
  }
}

/** @param {boolean} isProduction */
export async function createStyleBuilder(isProduction = false) {
  return new StyleBuilder(await sass.initAsyncCompiler(), isProduction);
}

/** @param {boolean} isProduction */
export async function buildAll(isProduction = false) {
  const start = performance.now();
  const builder = await createStyleBuilder(isProduction);

  /** @type {Awaited<ReturnType<StyleBuilder['run']>>} */
  let result;

  try {
    result = await builder.run();
  } finally {
    await builder.dispose();
  }

  if (result.failed) {
    throw new Error(
      `${result.failed} of ${result.total} style entries failed to compile`
    );
  }

  if (result.pruned.length) {
    report.warn(
      `Removed ${result.pruned.length} orphaned style module(s):\n${result.pruned.map((file) => `  - ${file}`).join('\n')}`
    );
  }

  if (!isProduction) {
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);

    report.success(
      result.compiled
        ? `Styles generated in ${elapsed}s (${result.compiled} of ${result.total} entries)`
        : `Styles up to date in ${elapsed}s (${result.total} entries)`
    );
  }
}
