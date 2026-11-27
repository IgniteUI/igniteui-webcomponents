import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  getTsProgram,
  getTypeChecker,
  typeParserPlugin,
} from '@wc-toolkit/type-parser';

/**
 * The type parser writes a warning for each type it does not expand: recursive DOM
 * interfaces, types above its property limit, and each component class it reaches as
 * a member type. A run writes approximately 35 of them, and all of them are about
 * expansions {@link pruneExpandedTypesPlugin} removes.
 *
 * The `debug` option does not gate `Logger.warn`, so no plugin option stops them, and
 * `cem:watch` puts them in the Storybook output. Only the analyzer CLI loads this
 * file, so the filter is safe for the full process.
 *
 * The parser writes one other warning through the same channel, for a TypeScript
 * config it cannot read. Match the skipped-type text alone to keep that one visible.
 */
const SKIPPED_TYPE_WARNING = '[type-parser] - Skipped parsing type';

const { warn } = console;

console.warn = (...args) => {
  if (!args.some((arg) => String(arg).includes(SKIPPED_TYPE_WARNING))) {
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

/** `import("/abs/path/module").IChipResourceStrings` -> `IChipResourceStrings` */
const IMPORT_QUALIFIER = /import\("[^"]*"\)\./g;

/** The TypeScript module of the analyzer. */
let typescript;

/** The class nodes of the analyzed modules, by `path#name`. */
const classNodes = new Map();

/** Indexes the class nodes for the plugins that read types with the checker. */
function classIndexPlugin() {
  return {
    name: 'IGC - CLASS INDEX',

    analyzePhase({ ts, node, moduleDoc }) {
      typescript ??= ts;

      if (ts.isClassDeclaration(node) && node.name) {
        classNodes.set(`${moduleDoc.path}#${node.name.text}`, node);
      }
    },
  };
}

/** Each declaration of the manifest that has a class node, with the node. */
function* classDeclarations(manifest) {
  for (const moduleDoc of manifest.modules) {
    for (const declaration of moduleDoc.declarations ?? []) {
      const node = classNodes.get(`${moduleDoc.path}#${declaration.name}`);

      if (node) {
        yield { declaration, node };
      }
    }
  }
}

/** The symbol of `name`, through an import. */
function resolveSymbol(checker, name) {
  const symbol = checker.getSymbolAtLocation(name);

  return symbol && symbol.flags & typescript.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

/**
 * The analyzer copies an inherited member as written, so a member typed with a
 * type parameter (`TGet` of `I18nMixin`) keeps that name, also under an
 * override. It also gives an override the type of the member that it
 * overrides. Resolve both with the checker on each element.
 *
 * @example `TGet` -> `Required<IChipResourceStrings>` on `igc-chip`
 * @example `unknown` -> `Date | null` for the `defaultValue` override of `igc-date-picker`
 */
function resolveMemberTypesPlugin() {
  const typeParameterNames = new Set();

  /** Whether the class declares `name` with its own type annotation. */
  const declaresTyped = (node, name) =>
    node.members.some(
      (classMember) =>
        classMember.name?.getText() === name &&
        (classMember.type ?? classMember.parameters?.[0]?.type)
    );

  return {
    name: 'IGC - RESOLVE MEMBER TYPES',

    analyzePhase({ node }) {
      for (const param of node.typeParameters ?? []) {
        typeParameterNames.add(param.name.text);
      }
    },

    packageLinkPhase({ customElementsManifest }) {
      const checker = getTypeChecker();

      for (const { declaration, node } of classDeclarations(
        customElementsManifest
      )) {
        const instanceType = checker.getTypeAtLocation(node);

        for (const [index, member] of (declaration.members ?? []).entries()) {
          const shouldResolve =
            typeParameterNames.has(member.type?.text) ||
            (member.kind === 'field' && declaresTyped(node, member.name));

          if (!(member.inheritedFrom && shouldResolve)) {
            continue;
          }

          const property = checker.getPropertyOfType(instanceType, member.name);

          if (!property) {
            continue;
          }

          const text = checker
            .typeToString(
              checker.getTypeOfSymbolAtLocation(property, node),
              node,
              typescript.TypeFormatFlags.NoTruncation
            )
            .replaceAll(IMPORT_QUALIFIER, '');

          // The analyzer shares one inherited entry between all the elements.
          declaration.members[index] = { ...member, type: { text } };
        }
      }
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
 *
 * The checker orders union members by type creation, so any literal can reorder
 * them. An inline union drops its expansion, because `type.text` is its source. An
 * alias takes the order of its declaration.
 */
function pruneExpandedTypesPlugin() {
  const LITERAL = /^(['"]).*\1$|^-?\d+(\.\d+)?$|^(null|undefined)$/;

  const membersOf = (text) =>
    text?.split('|').map((member) => member.trim()) ?? [];

  const isLiteralUnion = (text) => {
    const members = membersOf(text);
    return (
      members.length > 1 && members.every((member) => LITERAL.test(member))
    );
  };

  /** Strips the quotes of a string literal. */
  const unquote = (member) => member.replace(/^(['"])(.*)\1$/, '$2');

  /**
   * The literal members of a type node in source order, through aliases,
   * or `null` when the node is not a union of literals.
   */
  const declaredOrder = (checker, node) => {
    const ts = typescript;

    if (ts.isParenthesizedTypeNode(node)) {
      return declaredOrder(checker, node.type);
    }

    if (ts.isUnionTypeNode(node)) {
      const order = [];

      for (const child of node.types) {
        const members = declaredOrder(checker, child);

        if (!members) {
          return null;
        }

        order.push(...members);
      }

      return order;
    }

    if (ts.isLiteralTypeNode(node)) {
      return ts.isStringLiteral(node.literal)
        ? [node.literal.text]
        : [node.literal.getText()];
    }

    if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
      return ['undefined'];
    }

    if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
      const alias = resolveSymbol(checker, node.typeName)?.declarations?.find(
        ts.isTypeAliasDeclaration
      );

      if (alias && !alias.typeParameters) {
        return declaredOrder(checker, alias.type);
      }
    }

    // `(typeof NAMES)[number]` of a `const NAMES = [...] as const`.
    if (
      ts.isIndexedAccessTypeNode(node) &&
      node.indexType.kind === ts.SyntaxKind.NumberKeyword &&
      ts.isTypeQueryNode(node.objectType)
    ) {
      let initializer = resolveSymbol(checker, node.objectType.exprName)
        ?.valueDeclaration?.initializer;

      while (initializer && ts.isAsExpression(initializer)) {
        initializer = initializer.expression;
      }

      if (
        initializer &&
        ts.isArrayLiteralExpression(initializer) &&
        initializer.elements.every(ts.isStringLiteral)
      ) {
        return initializer.elements.map((element) => element.text);
      }
    }

    return null;
  };

  /** The type node that declares the property `name` of a class type. */
  const declaredTypeNode = (checker, classType, name) => {
    const ts = typescript;

    for (const declaration of checker.getPropertyOfType(classType, name)
      ?.declarations ?? []) {
      const typeNode = ts.isSetAccessorDeclaration(declaration)
        ? declaration.parameters[0]?.type
        : declaration.type;

      if (typeNode) {
        return typeNode;
      }
    }

    return undefined;
  };

  return {
    name: 'IGC - PRUNE EXPANDED TYPES',

    moduleLinkPhase({ moduleDoc }) {
      for (const entry of moduleEntries(moduleDoc)) {
        if (
          !isLiteralUnion(entry.expandedType?.text) ||
          isLiteralUnion(entry.type?.text)
        ) {
          delete entry.expandedType;
        }
      }
    },

    packageLinkPhase({ customElementsManifest }) {
      const checker = getTypeChecker();

      for (const { declaration, node } of classDeclarations(
        customElementsManifest
      )) {
        const classType = checker.getTypeAtLocation(node);

        for (const entry of [
          ...(declaration.members ?? []),
          ...(declaration.attributes ?? []),
        ]) {
          if (!entry.expandedType) {
            continue;
          }

          const typeNode = declaredTypeNode(
            checker,
            classType,
            entry.fieldName ?? entry.name
          );
          const order = typeNode && declaredOrder(checker, typeNode);

          if (!order) {
            continue;
          }

          const members = membersOf(entry.expandedType.text);

          // A member the declaration does not name, such as the `undefined`
          // of an optional field, goes last.
          const rank = (member) => {
            const index = order.indexOf(unquote(member));
            return index < 0 ? order.length : index;
          };

          entry.expandedType = {
            text: members.toSorted((a, b) => rank(a) - rank(b)).join(' | '),
          };
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
    // The checker also reads the files of the config, so use one without specs.
    const program = getTsProgram(ts, globs, 'scripts/tsconfig.cem.json');
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  plugins: [
    classIndexPlugin(),
    resolveSubpathImportsPlugin(),
    typeParserPlugin({
      parseObjectTypes: 'none',
      propertyName: 'expandedType',
    }),
    pruneExpandedTypesPlugin(),
    stripUndefinedDefaultsPlugin(),
    resolveMemberTypesPlugin(),
  ],
};
