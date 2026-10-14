// @ts-check
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderThunked } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { html, unsafeStatic } from 'lit/static-html.js';
import report from './report.mjs';

/**
 * Renders one instance of every tag through the Lit SSR renderer, from the
 * built `dist`, and fails when a render throws. In Node, Lit installs the
 * minimal DOM shim of `@lit-labs/ssr-dom-shim`, so this exercises the
 * `isServer` guards of the components.
 *
 * Run `node scripts/build.mjs` first.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** @param {unknown} error */
const firstLine = (error) =>
  String(error instanceof Error ? (error.stack ?? error.message) : error)
    .split('\n')
    .slice(0, 2)
    .join(' | ');

/** @type {{ defineAllComponents: () => void }} */
const library = await import(pathToFileURL(path.join(DIST, 'index.js')).href);
library.defineAllComponents();

const manifest = JSON.parse(
  await readFile(path.join(DIST, 'custom-elements.json'), 'utf8')
);
/** @type {string[]} */
const tags = [];

for (const module of manifest.modules) {
  for (const declaration of module.declarations ?? []) {
    if (declaration.customElement && declaration.tagName) {
      tags.push(declaration.tagName);
    }
  }
}

/**
 * The registry of the DOM shim. The scripts compile without the DOM library.
 *
 * @type {{ get(tag: string): unknown }}
 */
const registry = Reflect.get(globalThis, 'customElements');

/** @type {string[]} */
const failures = [];
/** @type {string[]} */
const undefinedTags = [];

for (const tag of tags.sort()) {
  if (!registry.get(tag)) {
    undefinedTags.push(tag);
    continue;
  }

  const name = unsafeStatic(tag);

  try {
    await collectResult(renderThunked(html`<${name}>Label</${name}>`));
  } catch (error) {
    failures.push(`<${tag}>: ${firstLine(error)}`);
  }
}

if (undefinedTags.length) {
  report.warn(
    `[SSR] Not defined by defineAllComponents(): ${undefinedTags.join(', ')}`
  );
}

if (failures.length) {
  report.error(
    `\n[SSR] ✖ ${failures.length} of ${tags.length} tags threw:\n${failures.map((failure) => `  - ${failure}`).join('\n')}\n`
  );
  process.exit(1);
}

report.success(`[SSR] ✔ ${tags.length} tags rendered`);
