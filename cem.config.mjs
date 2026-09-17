import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';

/**
 * The type parser writes a warning for each type it does not expand: recursive DOM
 * interfaces, types above its property limit, and each component class it reaches as
 * a member type. A run writes approximately 35 of them, and all of them are about
 * expansions {@link pruneExpandedTypesPlugin} removes.
 *
 * The `debug` option does not gate `Logger.warn`, so no plugin option stops them, and
 * `cem:watch` puts them in the Storybook output. Only the analyzer CLI loads this
 * file, so the filter is safe for the full process.
 */
const { warn } = console;

console.warn = (...args) => {
  if (!args.some((arg) => String(arg).includes('[type-parser]'))) {
    warn(...args);
  }
};

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

/** Each member, attribute and event entry in a module. */
function* moduleEntries(moduleDoc) {
  for (const declaration of moduleDoc.declarations ?? []) {
    yield* declaration.members ?? [];
    yield* declaration.attributes ?? [];
    yield* declaration.events ?? [];
  }
}

/**
 * Fields wrapped by the coerced-property decorator must keep an explicit
 * `= undefined` initializer. The analyzer records it as `default: "undefined"`, which
 * downstream consumers (the story generator among them) show as the literal string or
 * change to `NaN`. These fields shipped without a default as accessor pairs, so drop
 * the entry from the member and from the attribute that mirrors it.
 */
function stripUndefinedDefaultsPlugin() {
  return {
    name: 'IGC - STRIP UNDEFINED DEFAULTS',

    moduleLinkPhase({ moduleDoc }) {
      for (const entry of moduleEntries(moduleDoc)) {
        if (entry.default === 'undefined') {
          delete entry.default;
        }
      }
    },
  };
}

/**
 * The type parser resolves a type through the TypeScript checker, and
 * `parseObjectTypes: 'none'` gates only the outermost type. It therefore still expands
 * an object it reaches through a union, an array element or a property. It also
 * narrows literal-valued fields (`tagName: string` -> `'igc-icon'`) and splits
 * `boolean` into `false | true`.
 *
 * The manifest carries `expandedType` for one consumer: the story generator reads it
 * to turn an aliased union of literals into a set of control values. Every other
 * expansion is noise or a worse form of `type.text`, so keep only literal unions.
 */
function pruneExpandedTypesPlugin() {
  const LITERAL = /^(['"]).*\1$|^-?\d+(\.\d+)?$|^(null|undefined)$/;

  const isLiteralUnion = (text) => {
    const members = text?.split('|').map((member) => member.trim()) ?? [];
    return (
      members.length > 1 && members.every((member) => LITERAL.test(member))
    );
  };

  return {
    name: 'IGC - PRUNE EXPANDED TYPES',

    moduleLinkPhase({ moduleDoc }) {
      for (const entry of moduleEntries(moduleDoc)) {
        if (!isLiteralUnion(entry.expandedType?.text)) {
          delete entry.expandedType;
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
    typeParserPlugin({ propertyName: 'expandedType' }),
    pruneExpandedTypesPlugin(),
    stripUndefinedDefaultsPlugin(),
  ],
};
