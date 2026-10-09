// @ts-check
import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import report from './report.mjs';

/**
 * Reports drift between the `## Test scenarios` section of each component's
 * `spec.md` and its spec files. Warns only; it never fails the build.
 *
 * - A `###` heading with no matching `describe` block, and a `describe` block
 *   with no heading. The blocks are the children of the single root
 *   `describe` of a spec file, or its top-level blocks when it has several.
 *   Titles match when one contains the other after normalizing. A heading
 *   that names a shared suite of `src/internals/testing` counts as covered,
 *   and a "Not covered…" heading is skipped.
 * - The spec files without an accessibility audit (`accessible(`).
 *
 * Pass `--details` to list each mismatch instead of the counts.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DETAILS = process.argv.includes('--details');

/** Compares titles regardless of case, plurals, `&`, `/`, punctuation and a "tests" suffix. */
const normalize = (/** @type {string} */ title) =>
  title
    .toLowerCase()
    .replaceAll('&', ' and ')
    .replaceAll('/', ' and ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\btests?\b/g, ' ')
    .replace(/\b(\w{3,})s\b/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The titles of the `describe` blocks that the scenario headings mirror.
 *
 * @param {string} file
 * @param {string} text
 */
function describeTitles(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);
  /** @type {{ title: string, depth: number }[]} */
  const blocks = [];

  /**
   * @param {ts.Node} node
   * @param {number} depth
   */
  const visit = (node, depth) => {
    let next = depth;

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'describe' &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      blocks.push({ title: node.arguments[0].text, depth });
      next = depth + 1;
    }

    ts.forEachChild(node, (child) => visit(child, next));
  };

  visit(source, 0);

  const roots = blocks.filter((block) => block.depth === 0);
  const level = roots.length === 1 ? 1 : 0;
  return blocks
    .filter((block) => block.depth === level)
    .map((block) => block.title);
}

/** @param {string} markdown */
function scenarioHeadings(markdown) {
  const section = markdown
    .split(/^## Test scenarios\s*$/m)[1]
    ?.split(/^## /m)[0];
  return section
    ? Array.from(section.matchAll(/^### (.+)$/gm), (match) => match[1].trim())
    : null;
}

/** @param {Set<string>} titles @param {string} title */
const matches = (titles, title) => {
  const wanted = normalize(title);
  return Array.from(titles).some(
    (candidate) =>
      candidate === wanted ||
      ` ${candidate} `.includes(` ${wanted} `) ||
      ` ${wanted} `.includes(` ${candidate} `)
  );
};

/** The `describe` titles of the shared suites, at any depth. */
const sharedSuites = new Set();

for await (const helper of glob('src/internals/testing/*.spec.ts', {
  cwd: ROOT,
})) {
  const source = ts.createSourceFile(
    helper,
    await readFile(path.join(ROOT, helper), 'utf8'),
    ts.ScriptTarget.Latest
  );

  ts.forEachChild(source, function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'describe' &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      sharedSuites.add(normalize(node.arguments[0].text));
    }

    ts.forEachChild(node, visit);
  });
}

/** @type {string[]} */
const lines = [];
let drift = 0;

for await (const specMd of glob('src/components/*/spec.md', { cwd: ROOT })) {
  const dir = path.dirname(specMd);
  const headings = scenarioHeadings(
    await readFile(path.join(ROOT, specMd), 'utf8')
  );

  if (!headings) {
    lines.push(`${dir}: spec.md has no "## Test scenarios" section`);
    drift++;
    continue;
  }

  /** @type {string[]} */
  const titles = [];

  for await (const spec of glob(`${dir}/*.spec.ts`, { cwd: ROOT })) {
    titles.push(
      ...describeTitles(spec, await readFile(path.join(ROOT, spec), 'utf8'))
    );
  }

  const scenarios = headings.filter((h) => !/^not covered/i.test(h));
  const described = new Set([...titles.map(normalize), ...sharedSuites]);
  const headed = new Set(scenarios.map(normalize));
  const missingBlocks = scenarios.filter((h) => !matches(described, h));
  const missingHeadings = titles.filter((t) => !matches(headed, t));

  if (missingBlocks.length || missingHeadings.length) {
    drift++;
    lines.push(
      DETAILS
        ? [
            `${dir}:`,
            ...missingBlocks.map((h) => `    heading without a describe: ${h}`),
            ...missingHeadings.map(
              (t) => `    describe without a heading: ${t}`
            ),
          ].join('\n')
        : `${dir}: ${missingBlocks.length} heading(s) without a describe, ${missingHeadings.length} describe(s) without a heading`
    );
  }
}

/** @type {string[]} */
const unaudited = [];

for await (const spec of glob('src/components/**/*.spec.ts', { cwd: ROOT })) {
  if (
    !(await readFile(path.join(ROOT, spec), 'utf8')).includes('accessible(')
  ) {
    unaudited.push(spec);
  }
}

if (drift) {
  report.warn(
    `[Spec scenarios] ${drift} spec.md file(s) out of step with their specs${DETAILS ? '' : ' (--details lists them)'}:\n${lines.map((line) => `  ${line}`).join('\n')}`
  );
}

if (unaudited.length) {
  report.warn(
    `[Spec scenarios] ${unaudited.length} spec file(s) without an accessibility audit:\n${unaudited
      .sort()
      .map((spec) => `  ${spec}`)
      .join('\n')}`
  );
}

if (!drift && !unaudited.length) {
  report.success('[Spec scenarios] ✔ in step');
}
