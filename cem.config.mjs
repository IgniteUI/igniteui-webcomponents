import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expandTypesPlugin, getTsProgram } from 'cem-plugin-expanded-types';

/**
 * Maps each `#` subpath alias to the source directory it points at, derived
 * from the `imports` field so the two can never drift apart.
 *
 * @example '#internals' -> 'src/internals'
 */
const ALIAS_DIRECTORIES = new Map(
  Object.entries(
    JSON.parse(readFileSync('./package.json', 'utf8')).imports
  ).map(([key, target]) => [
    key.split('/', 1)[0],
    target.replace(/^\.\//, '').split('/*')[0],
  ])
);

const ALIASES = Array.from(ALIAS_DIRECTORIES.keys());

const aliasOf = (specifier) =>
  ALIASES.find((alias) => specifier.startsWith(`${alias}/`));

/** '#internals/part-map.js' -> 'src/internals/part-map.js' */
const toSourcePath = (specifier, alias) =>
  `${ALIAS_DIRECTORIES.get(alias)}${specifier.slice(alias.length)}`;

/**
 * The analyzer has no notion of subpath imports. It resolves a declaration's
 * origin by handing the raw specifier to `new URL(specifier, base)`, and a
 * leading `#` parses as a URL *fragment* - so every aliased import silently
 * collapses onto the importing module itself, and mixins, superclasses and
 * re-exports lose their real location.
 *
 * This plugin normalizes aliased specifiers back to file paths, producing a
 * manifest identical to the one the equivalent relative imports would.
 */
function resolveSubpathImportsPlugin() {
  return {
    name: 'IGC - RESOLVE SUBPATH IMPORTS',

    /**
     * Runs after `CORE - IMPORTS` has attached the module's imports to the
     * context, and before any class declaration in it is analyzed. Rewriting to
     * a root-relative path makes the analyzer's `new URL()` call resolve to the
     * real module.
     */
    analyzePhase({ ts, node, context }) {
      if (node.kind !== ts.SyntaxKind.SourceFile) {
        return;
      }

      for (const entry of context.imports ?? []) {
        const alias = aliasOf(entry.importPath);

        if (alias) {
          entry.importPath = `/${toSourcePath(entry.importPath, alias)}`;
        }
      }
    },

    /**
     * Re-exports keep the specifier verbatim rather than resolving it, so they
     * are rewritten on the finished module - relative to the module itself, the
     * form the analyzer emits for a relative import.
     */
    moduleLinkPhase({ moduleDoc }) {
      const relativize = (specifier, alias) => {
        const relative = path.posix.relative(
          path.posix.dirname(moduleDoc.path),
          toSourcePath(specifier, alias)
        );

        return relative.startsWith('.') ? relative : `./${relative}`;
      };

      const visit = (value) => {
        if (Array.isArray(value)) {
          for (const item of value) {
            visit(item);
          }
          return;
        }

        if (!value || typeof value !== 'object') {
          return;
        }

        for (const [key, entry] of Object.entries(value)) {
          if (key === 'module' && typeof entry === 'string') {
            const alias = aliasOf(entry);

            if (alias) {
              value[key] = relativize(entry, alias);
            }
          } else {
            visit(entry);
          }
        }
      };

      visit(moduleDoc);
    },
  };
}

/**
 * Fields wrapped by the coerced-property decorator must keep an explicit
 * `= undefined` initializer, which the analyzer records as
 * `default: "undefined"` - noise that downstream consumers (the story generator
 * among them) render as the literal string or coerce to `NaN`. These members
 * shipped without a default as accessor pairs, so drop the entry.
 */
function stripUndefinedDefaultsPlugin() {
  return {
    name: 'IGC - STRIP UNDEFINED DEFAULTS',

    moduleLinkPhase({ moduleDoc }) {
      for (const declaration of moduleDoc.declarations ?? []) {
        for (const member of declaration.members ?? []) {
          if (member.default === 'undefined') {
            delete member.default;
          }
        }
      }
    },
  };
}

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.spec.ts', 'src/**/*.css.ts', 'src/**/themes/**'],
  packagejson: true,
  outdir: './',
  litelement: true,
  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  plugins: [
    resolveSubpathImportsPlugin(),
    expandTypesPlugin({ hideLogs: true }),
    stripUndefinedDefaultsPlugin(),
  ],
};
