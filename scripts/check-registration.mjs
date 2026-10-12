// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import report from './report.mjs';

/**
 * Checks two registration invariants that hold today only by convention:
 *
 * 1. Every component class that `src/index.ts` exports is in the list of
 *    `defineAllComponents()`, and the list has nothing else.
 * 2. Every `<igc-*>` tag a component renders is in the *direct* dependency list
 *    of its `static register()`. A transitive registration (through another
 *    dependency) breaks when that dependency drops it.
 *
 * A component renders the templates of its own module, of the modules without
 * a component that it imports (helpers and templates) and of its superclasses.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = path.join(ROOT, 'src/index.ts');
const DEFINE_ALL = path.join(
  ROOT,
  'src/internals/definitions/defineAllComponents.ts'
);
const TAG = /<(igc-[a-z0-9-]+)/g;

const { config } = ts.readConfigFile(
  path.join(ROOT, 'tsconfig.json'),
  ts.sys.readFile
);
const { options } = ts.parseJsonConfigFileContent(config, ts.sys, ROOT);
const program = ts.createProgram([ENTRY, DEFINE_ALL], {
  ...options,
  noEmit: true,
});
const checker = program.getTypeChecker();

/** @type {string[]} */
const errors = [];

/** @param {ts.Symbol} symbol */
const resolve = (symbol) =>
  symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;

/** @param {ts.Node} node */
const symbolOf = (node) => {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol && resolve(symbol);
};

/** @param {ts.SourceFile} file */
const isSource = (file) =>
  file.fileName.startsWith(`${ROOT}/src/`) &&
  !file.fileName.endsWith('.spec.ts') &&
  !file.isDeclarationFile;

/** @param {string} file */
const relative = (file) => path.relative(ROOT, file);

/**
 * @typedef {{
 *   name: string,
 *   tag: string,
 *   node: ts.ClassDeclaration,
 *   file: ts.SourceFile,
 * }} Component
 */

/** @type {Map<ts.Symbol, Component>} */
const components = new Map();

for (const file of program.getSourceFiles().filter(isSource)) {
  for (const statement of file.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) {
      continue;
    }

    for (const member of statement.members) {
      if (
        !ts.isPropertyDeclaration(member) ||
        member.name.getText(file) !== 'tagName' ||
        !member.initializer ||
        !ts
          .getModifiers(member)
          ?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)
      ) {
        continue;
      }

      // A string literal, or a constant that holds one.
      const type = checker.getTypeAtLocation(member.initializer);
      const symbol = symbolOf(statement.name);

      if (symbol && type.isStringLiteral()) {
        components.set(symbol, {
          name: statement.name.text,
          tag: type.value,
          node: statement,
          file,
        });
      }
    }
  }
}

const componentFiles = new Set(
  Array.from(components.values(), (component) => component.file)
);
const byTag = new Map(
  Array.from(components.values(), (component) => [component.tag, component])
);

// 1. index.ts exports <-> defineAllComponents()

/** @param {string} fileName */
function sourceSymbol(fileName) {
  const file = program.getSourceFile(fileName);
  const symbol = file && checker.getSymbolAtLocation(file);

  if (!symbol) {
    throw new Error(`Cannot read ${relative(fileName)}`);
  }

  return /** @type {[ts.SourceFile, ts.Symbol]} */ ([file, symbol]);
}

const [, indexSymbol] = sourceSymbol(ENTRY);
const exported = new Set(
  checker
    .getExportsOfModule(indexSymbol)
    .map(resolve)
    .filter((symbol) => components.has(symbol))
);

const [defineAllFile] = sourceSymbol(DEFINE_ALL);
/** @type {Set<ts.Symbol>} */
const defined = new Set();

ts.forEachChild(defineAllFile, function visit(node) {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(defineAllFile) === 'allComponents' &&
    node.initializer &&
    ts.isArrayLiteralExpression(node.initializer)
  ) {
    for (const element of node.initializer.elements) {
      const symbol = symbolOf(element);

      if (symbol) {
        defined.add(symbol);
      }
    }
  }

  ts.forEachChild(node, visit);
});

/** @param {ts.Symbol} symbol */
const nameOf = (symbol) => components.get(symbol)?.name ?? symbol.name;

for (const symbol of exported.difference(defined)) {
  errors.push(
    `${nameOf(symbol)} is exported from src/index.ts but missing from defineAllComponents()`
  );
}

for (const symbol of defined.difference(exported)) {
  errors.push(
    `${nameOf(symbol)} is in defineAllComponents() but not exported from src/index.ts`
  );
}

// 2. Rendered tags <-> direct register() dependencies

/**
 * The component classes an expression names: an identifier, or the spread
 * of an array constant of identifiers.
 *
 * @param {ts.Expression} expression
 * @returns {ts.Symbol[]}
 */
function classesOf(expression) {
  const target = ts.isSpreadElement(expression)
    ? expression.expression
    : expression;
  const symbol = symbolOf(target);

  if (!symbol) {
    return [];
  }

  if (components.has(symbol)) {
    return [symbol];
  }

  const declaration = symbol.valueDeclaration;

  if (
    declaration &&
    ts.isVariableDeclaration(declaration) &&
    declaration.initializer &&
    ts.isArrayLiteralExpression(declaration.initializer)
  ) {
    return declaration.initializer.elements.flatMap(classesOf);
  }

  return [];
}

/** @param {Component} component */
function directDependencies(component) {
  /** @type {Set<ts.Symbol>} */
  const dependencies = new Set();

  for (const member of component.node.members) {
    if (
      !ts.isMethodDeclaration(member) ||
      member.name.getText(component.file) !== 'register'
    ) {
      continue;
    }

    ts.forEachChild(member, function visit(node) {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(component.file) === 'registerComponent'
      ) {
        for (const argument of node.arguments.slice(1)) {
          for (const symbol of classesOf(argument)) {
            dependencies.add(symbol);
          }
        }
      }

      ts.forEachChild(node, visit);
    });
  }

  return dependencies;
}

/** @type {Map<ts.SourceFile, Set<string>>} */
const templateTags = new Map();

/** @param {ts.SourceFile} file */
function tagsInTemplates(file) {
  let tags = templateTags.get(file);

  if (!tags) {
    const found = new Set();

    ts.forEachChild(file, function visit(node) {
      if (ts.isTaggedTemplateExpression(node)) {
        const template = node.template;
        const parts = ts.isNoSubstitutionTemplateLiteral(template)
          ? [template.text]
          : [
              template.head.text,
              ...template.templateSpans.map((span) => span.literal.text),
            ];

        for (const part of parts) {
          for (const [, tag] of part.matchAll(TAG)) {
            found.add(tag);
          }
        }
      }

      ts.forEachChild(node, visit);
    });

    tags = found;
    templateTags.set(file, tags);
  }

  return tags;
}

/**
 * The module and the modules without a component it imports, transitively,
 * at runtime.
 *
 * @param {ts.SourceFile} file
 * @param {Set<ts.SourceFile>} [seen]
 */
function ownModules(file, seen = new Set()) {
  if (seen.has(file)) {
    return seen;
  }

  seen.add(file);

  for (const statement of file.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      statement.importClause?.isTypeOnly
    ) {
      continue;
    }

    const target = checker.getSymbolAtLocation(
      statement.moduleSpecifier
    )?.valueDeclaration;

    if (
      target &&
      ts.isSourceFile(target) &&
      isSource(target) &&
      !componentFiles.has(target)
    ) {
      ownModules(target, seen);
    }
  }

  return seen;
}

/**
 * The classes a component inherits from, nearest first, while they are
 * declared under `src`.
 *
 * @param {ts.ClassDeclaration} node
 */
function superclasses(node) {
  /** @type {ts.ClassDeclaration[]} */
  const chain = [];
  let current = node;

  while (current) {
    const base = current.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword
    )?.types[0]?.expression;

    if (!base) {
      break;
    }

    // A mixin call: follow its last argument, the class it extends.
    const target =
      ts.isCallExpression(base) && base.arguments.length
        ? base.arguments[base.arguments.length - 1]
        : base;
    const declaration = symbolOf(target)?.valueDeclaration;

    if (
      !declaration ||
      !ts.isClassDeclaration(declaration) ||
      !isSource(declaration.getSourceFile())
    ) {
      break;
    }

    chain.push(declaration);
    current = declaration;
  }

  return chain;
}

for (const component of components.values()) {
  const files = new Set([component.file]);

  for (const base of superclasses(component.node)) {
    files.add(base.getSourceFile());
  }

  /** @type {Set<string>} */
  const rendered = new Set();

  for (const file of files) {
    for (const module of ownModules(file)) {
      for (const tag of tagsInTemplates(module)) {
        rendered.add(tag);
      }
    }
  }

  rendered.delete(component.tag);

  const registered = new Set(
    Array.from(
      directDependencies(component),
      (dependency) => components.get(dependency)?.tag
    )
  );

  for (const tag of rendered) {
    if (!byTag.has(tag)) {
      errors.push(
        `${component.name} renders <${tag}>, which no component defines`
      );
    } else if (!registered.has(tag)) {
      errors.push(
        `${component.name} renders <${tag}> but its register() does not list ${byTag.get(tag)?.name}`
      );
    }
  }
}

if (errors.length) {
  report.error(
    `\n[Registration] ✖\n${errors.map((error) => `  - ${error}`).join('\n')}\n`
  );
  process.exit(1);
}

report.success(
  `[Registration] ✔ ${components.size} components, ${exported.size} exported and defined`
);
