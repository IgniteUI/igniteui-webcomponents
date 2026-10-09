// @ts-check
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import report from './report.mjs';

/**
 * Guards the public API against accidental changes.
 *
 * Reads the freshly built `custom-elements.json` and the exports of
 * `src/index.ts`, and compares them with the committed `public-api.json`
 * snapshot. A removal or a type change fails; an addition is printed.
 *
 * - `node scripts/public-api.mjs` checks against the snapshot.
 * - `node scripts/public-api.mjs --update` rewrites the snapshot.
 *
 * Run `npm run cem` first: the manifest is a build output and is not tracked.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = 'custom-elements.json';
const SNAPSHOT = 'public-api.json';
const ENTRY = 'src/index.ts';

/**
 * @typedef {Record<string, string>} Typed
 *   Name to type text, for attributes, properties, methods and events.
 *
 * @typedef {{
 *   class: string,
 *   attributes: Typed,
 *   properties: Typed,
 *   methods: Typed,
 *   events: Typed,
 *   slots: string[],
 *   cssParts: string[],
 *   cssProperties: string[],
 * }} ElementApi
 *
 * @typedef {{ exports: string[], elements: Record<string, ElementApi> }} PublicApi
 */

/** @param {any} member */
const isPublic = (member) => !member.privacy || member.privacy === 'public';

/**
 * The type text, with the members of an aliased literal union in sorted
 * order. A reordered union is not an API change, a removed member is.
 *
 * @param {any} entry
 */
function typeOf(entry) {
  const text = entry?.type?.text ?? 'unknown';
  const expanded = entry?.expandedType?.text;

  if (!expanded || expanded === text) {
    return text;
  }

  const members = expanded
    .split('|')
    .map((/** @type {string} */ member) => member.trim());
  return `${text} (${members.sort().join(' | ')})`;
}

/**
 * @template T
 * @param {Iterable<[string, T]>} entries
 * @returns {Record<string, T>}
 */
const sorted = (entries) =>
  Object.fromEntries(
    Array.from(entries).sort(([a], [b]) => a.localeCompare(b))
  );

/** @param {any[] | undefined} items */
const names = (items) =>
  Array.from(new Set((items ?? []).map((item) => item.name))).sort();

/**
 * @param {any} declaration
 * @returns {ElementApi}
 */
function describeElement(declaration) {
  /** @type {[string, string][]} */
  const properties = [];
  /** @type {[string, string][]} */
  const methods = [];

  for (const member of declaration.members ?? []) {
    if (!isPublic(member)) {
      continue;
    }

    const name = `${member.static ? 'static ' : ''}${member.name}`;

    if (member.kind === 'method') {
      const parameters = (member.parameters ?? []).map(
        (/** @type {any} */ p) =>
          `${p.rest ? '...' : ''}${p.name}${p.optional ? '?' : ''}: ${typeOf(p)}`
      );
      methods.push([
        name,
        `(${parameters.join(', ')}) => ${member.return?.type?.text ?? 'void'}`,
      ]);
    } else {
      properties.push([
        name,
        `${member.readonly ? 'readonly ' : ''}${typeOf(member)}`,
      ]);
    }
  }

  return {
    class: declaration.name,
    attributes: sorted(
      (declaration.attributes ?? []).map((/** @type {any} */ a) => [
        a.name,
        typeOf(a),
      ])
    ),
    properties: sorted(properties),
    methods: sorted(methods),
    // The analyzer also records unnamed events; they carry no API.
    events: sorted(
      (declaration.events ?? [])
        .filter((/** @type {any} */ e) => e.name)
        .map((/** @type {any} */ e) => [e.name, typeOf(e)])
    ),
    slots: names(declaration.slots),
    cssParts: names(declaration.cssParts),
    cssProperties: names(declaration.cssProperties),
  };
}

/** @returns {Promise<Record<string, ElementApi>>} */
async function readElements() {
  const manifest = JSON.parse(
    await readFile(path.join(ROOT, MANIFEST), 'utf8')
  );

  /** @type {[string, ElementApi][]} */
  const elements = [];

  for (const module of manifest.modules) {
    for (const declaration of module.declarations ?? []) {
      if (declaration.customElement && declaration.tagName) {
        elements.push([declaration.tagName, describeElement(declaration)]);
      }
    }
  }

  return sorted(elements);
}

/**
 * The names `src/index.ts` exports, values and types alike, as the
 * TypeScript checker resolves them (`export type *` included).
 *
 * @returns {string[]}
 */
function readExports() {
  const { config } = ts.readConfigFile(
    path.join(ROOT, 'tsconfig.json'),
    ts.sys.readFile
  );
  const { options } = ts.parseJsonConfigFileContent(config, ts.sys, ROOT);
  const entry = path.join(ROOT, ENTRY);
  const program = ts.createProgram([entry], { ...options, noEmit: true });
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);
  const symbol = source && checker.getSymbolAtLocation(source);

  if (!symbol) {
    throw new Error(`Cannot read the exports of ${ENTRY}`);
  }

  return checker
    .getExportsOfModule(symbol)
    .map((exported) => exported.name)
    .sort();
}

/**
 * @param {PublicApi} before
 * @param {PublicApi} after
 */
function compare(before, after) {
  /** @type {string[]} */
  const breaking = [];
  /** @type {string[]} */
  const added = [];

  /**
   * @param {string} scope
   * @param {Iterable<string>} was
   * @param {Iterable<string>} is
   */
  const compareNames = (scope, was, is) => {
    const next = new Set(is);
    const previous = new Set(was);

    for (const name of previous.difference(next)) {
      breaking.push(`${scope}: removed ${name || '(default)'}`);
    }

    for (const name of next.difference(previous)) {
      added.push(`${scope}: ${name || '(default)'}`);
    }
  };

  /**
   * @param {string} scope
   * @param {Typed} was
   * @param {Typed} is
   */
  const compareTyped = (scope, was, is) => {
    compareNames(scope, Object.keys(was), Object.keys(is));

    for (const [name, type] of Object.entries(was)) {
      if (name in is && is[name] !== type) {
        breaking.push(
          `${scope}: ${name} changed from \`${type}\` to \`${is[name]}\``
        );
      }
    }
  };

  compareNames('src/index.ts exports', before.exports, after.exports);
  compareNames(
    'elements',
    Object.keys(before.elements),
    Object.keys(after.elements)
  );

  for (const [tag, was] of Object.entries(before.elements)) {
    const is = after.elements[tag];

    if (!is) {
      continue;
    }

    if (was.class !== is.class) {
      breaking.push(`${tag}: class changed from ${was.class} to ${is.class}`);
    }

    compareTyped(`${tag} attributes`, was.attributes, is.attributes);
    compareTyped(`${tag} properties`, was.properties, is.properties);
    compareTyped(`${tag} methods`, was.methods, is.methods);
    compareTyped(`${tag} events`, was.events, is.events);
    compareNames(`${tag} slots`, was.slots, is.slots);
    compareNames(`${tag} CSS parts`, was.cssParts, is.cssParts);
    compareNames(`${tag} CSS properties`, was.cssProperties, is.cssProperties);
  }

  return { breaking, added };
}

/** @type {PublicApi} */
const current = { exports: readExports(), elements: await readElements() };
const snapshotPath = path.join(ROOT, SNAPSHOT);

if (process.argv.includes('--update')) {
  await writeFile(snapshotPath, `${JSON.stringify(current, null, 2)}\n`);
  report.success(`[Public API] ✔ ${SNAPSHOT} updated`);
  process.exit(0);
}

/** @type {PublicApi} */
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
const { breaking, added } = compare(snapshot, current);

if (added.length) {
  report.info(
    `[Public API] Additions, not yet in ${SNAPSHOT}:\n${added.map((line) => `  + ${line}`).join('\n')}`
  );
}

if (breaking.length) {
  report.error(
    `\n[Public API] ✖ ${breaking.length} removal(s) or type change(s):\n${breaking.map((line) => `  - ${line}`).join('\n')}\n\nIf the change is intended, run \`npm run public-api:update\` and commit ${SNAPSHOT}.\n`
  );
  process.exit(1);
}

report.success(
  added.length
    ? `[Public API] ✔ no removals; run \`npm run public-api:update\` to record the additions`
    : '[Public API] ✔ matches the snapshot'
);
