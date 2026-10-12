// @ts-check
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import esbuild from 'esbuild';
import ts from 'typescript';

/**
 * Writes the per-theme aggregators that the `#themes/*.js` conditions of the
 * published package select, and verifies them. Runs on `dist`, after `tsc` and
 * after the published `package.json` is copied.
 *
 * Next to each aggregator (a `themes` module that exports `all`), it writes
 * `<aggregator>.<theme>.js`: the same module with only the entries of that
 * theme and without the imports that nothing reads. A consumer who sets the
 * `igc-theme-<theme>` condition then bundles only the styles of that theme.
 *
 * The verification fails the build when:
 * - the conditions of `#themes/*.js` do not match the theme list;
 * - a module imports an aggregator with a relative path, which bypasses the
 *   conditions;
 * - a per-theme aggregator does not hold the same style sheets as the
 *   default aggregator for its theme, or holds those of another theme;
 * - a bundle built with a theme condition includes a `themes/**` style sheet
 *   named after another theme, for example one that a component imports
 *   directly instead of through its aggregator.
 */

const ALIAS = '#themes/*.js';
const AGGREGATOR = /^export const all = /m;
const SOURCE_MAP = /\n\/\/# sourceMappingURL=.*$/;

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listModules(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/**
 * @param {string} file
 * @param {string} text
 */
const parse = (file, text) =>
  ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

/**
 * The absolute paths of the modules that `text` imports.
 *
 * @param {string} file
 * @param {string} text
 */
function importsOf(file, text) {
  return parse(file, text)
    .statements.filter(ts.isImportDeclaration)
    .map(
      (statement) =>
        /** @type {ts.StringLiteral} */ (statement.moduleSpecifier).text
    )
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) => path.resolve(path.dirname(file), specifier));
}

/**
 * Removes the entries of the other themes from every object literal, then the
 * imports that nothing reads.
 *
 * @param {string} file
 * @param {string} text
 * @param {Set<string>} others
 */
function keepTheme(file, text, others) {
  const source = parse(file, text);
  /** @type {[number, number][]} */
  const removals = [];

  /** @param {ts.Node} node */
  const visit = (node) => {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit);
      return;
    }

    for (const property of node.properties) {
      if (property.name && others.has(property.name.getText(source))) {
        const end = property.getEnd();
        removals.push([
          property.getFullStart(),
          text[end] === ',' ? end + 1 : end,
        ]);
      } else {
        visit(property);
      }
    }
  };

  visit(source);

  let result = text;

  for (const [start, end] of removals.sort(([a], [b]) => b - a)) {
    result = result.slice(0, start) + result.slice(end);
  }

  const filtered = parse(file, result);
  /** @type {Set<string>} */
  const read = new Set();

  /** @param {ts.Node} node */
  const collect = (node) => {
    if (ts.isIdentifier(node)) {
      read.add(node.text);
    }

    ts.forEachChild(node, collect);
  };

  for (const statement of filtered.statements) {
    if (!ts.isImportDeclaration(statement)) {
      collect(statement);
    }
  }

  const unused = filtered.statements.filter((statement) => {
    const bindings = ts.isImportDeclaration(statement)
      ? statement.importClause?.namedBindings
      : undefined;

    return (
      bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.every((element) => !read.has(element.name.text))
    );
  });

  for (const statement of unused.reverse()) {
    result =
      result.slice(0, statement.getFullStart()) +
      result.slice(statement.getEnd());
  }

  return `${result.replace(SOURCE_MAP, '').trim()}\n`;
}

/** @param {unknown} entry */
const sheetsOf = (entry) => [entry].flat().filter(Boolean);

/**
 * @param {unknown[]} a
 * @param {unknown[]} b
 */
const sameSheets = (a, b) =>
  a.length === b.length && a.every((sheet, i) => sheet === b[i]);

/** @param {string} distDir */
export async function buildThemeEntries(distDir) {
  const dist = path.resolve(distDir);
  const { THEMES } = /** @type {{ THEMES: readonly string[] }} */ (
    await import(pathToFileURL(path.join(dist, 'theming/types.js')).href)
  );
  const manifest = JSON.parse(
    await readFile(path.join(dist, 'package.json'), 'utf8')
  );

  const expected = {
    ...Object.fromEntries(
      THEMES.map((theme) => [
        `igc-theme-${theme}`,
        `./components/*.${theme}.js`,
      ])
    ),
    default: './components/*.js',
  };

  if (JSON.stringify(manifest.imports?.[ALIAS]) !== JSON.stringify(expected)) {
    throw new Error(
      `The "${ALIAS}" entry of scripts/_package.json must be ${JSON.stringify(expected, null, 2)}`
    );
  }

  const components = path.join(dist, 'components');
  const sources = new Map(
    await Promise.all(
      (await listModules(components)).map(
        async (file) =>
          /** @type {const} */ ([file, await readFile(file, 'utf8')])
      )
    )
  );
  const aggregators = new Set(
    Array.from(sources.keys()).filter(
      (file) =>
        file.includes(`${path.sep}themes${path.sep}`) &&
        AGGREGATOR.test(/** @type {string} */ (sources.get(file)))
    )
  );
  const themed = new RegExp(`/themes/.*\\.(${THEMES.join('|')})\\.css\\.js$`);
  /** @type {string[]} */
  const errors = [];

  for (const [file, text] of sources) {
    for (const module of importsOf(file, text)) {
      if (aggregators.has(module)) {
        errors.push(
          `${path.relative(dist, file)} imports ${path.relative(dist, module)} with a relative path instead of #themes/`
        );
      }
    }
  }

  for (const file of aggregators) {
    const text = /** @type {string} */ (sources.get(file));
    const base = path.basename(file);
    const { all: themes } = await import(pathToFileURL(file).href);

    for (const theme of THEMES) {
      const target = file.replace(/\.js$/, `.${theme}.js`);
      const others = new Set(THEMES.filter((other) => other !== theme));

      await writeFile(
        target,
        `// Generated from ${base} with only the ${theme} entries.\n${keepTheme(file, text, others)}`,
        { flag: 'wx' }
      );

      const { all: single } = await import(pathToFileURL(target).href);

      for (const variant of Object.keys(themes)) {
        for (const key of ['shared', ...THEMES]) {
          const want =
            key === 'shared' || key === theme
              ? themes[variant][key]
              : undefined;

          if (!sameSheets(sheetsOf(single[variant][key]), sheetsOf(want))) {
            errors.push(
              `${path.relative(dist, target)}: ${variant}.${key} differs from ${base}`
            );
          }
        }
      }
    }
  }

  for (const theme of THEMES) {
    const { metafile } = await esbuild.build({
      stdin: {
        contents: `import { defineAllComponents } from './index.js'; defineAllComponents();`,
        resolveDir: dist,
      },
      absWorkingDir: dist,
      bundle: true,
      write: false,
      metafile: true,
      format: 'esm',
      conditions: [`igc-theme-${theme}`],
      logLevel: 'silent',
    });

    for (const input of Object.keys(metafile.inputs)) {
      const owner = input.match(themed)?.[1];

      if (owner && owner !== theme) {
        errors.push(`The igc-theme-${theme} bundle includes ${input}`);
      }
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return aggregators.size;
}
