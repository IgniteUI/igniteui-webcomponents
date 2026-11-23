// Shared by the script migrations: finds what a name in a script is bound to, through the TypeScript checker.
const PACKAGES = ['igniteui-webcomponents'];

/**
 * What `ig update` passes to a migration.
 *
 * @typedef {object} MigrationHost
 * @property {string} root The project directory.
 * @property {() => string[]} files Project-relative, `/`-separated paths.
 * @property {(path: string) => string} read
 * @property {(path: string, content: string) => void} write Staged until the migration completes.
 * @property {typeof import('typescript')} typescript The CLI's, to parse scripts without the project's.
 */

/**
 * Applies the edits `migrate` returns for each script that contains or matches `keyword`.
 *
 * @param {MigrationHost} host
 * @param {string | RegExp} keyword
 * @param {(script: Script) => Edit[]} migrate
 */
export function migrateScripts(host, keyword, migrate) {
  let ts;
  for (const file of host.files()) {
    if (!/\.[cm]?[jt]s$/.test(file)) {
      continue;
    }
    const text = host.read(file);
    // Cheap text check first, so we only parse files that can contain a match.
    if (
      typeof keyword === 'string'
        ? !text.includes(keyword)
        : !keyword.test(text)
    ) {
      continue;
    }

    // Load TypeScript only once a file actually needs it.
    ts ??= loadTypeScript(host);
    const script = parse(ts, file, text);
    if (!script) {
      // oxlint-disable-next-line no-console -- the CLI shows a migration's console output
      console.warn(
        `    Skipped ${file}: TypeScript ${ts.version} found syntax errors in it.`
      );
      continue;
    }
    // Edits point into the original text, so apply them backwards to keep earlier offsets valid.
    const updated = migrate(script)
      .sort((a, b) => b.start - a.start)
      .reduce(
        (result, edit) =>
          result.slice(0, edit.start) + edit.text + result.slice(edit.end),
        text
      );
    if (updated !== text) {
      host.write(file, updated);
    }
  }
}

// From the CLI: igniteui-webcomponents doesn't depend on TypeScript, and the project may not have it.
function loadTypeScript(host) {
  if (!host.typescript) {
    throw new Error(
      `Migrating scripts requires TypeScript from the CLI, which this igniteui-cli doesn't provide; update igniteui-cli`
    );
  }
  return host.typescript;
}

/** @typedef {{ start: number, end: number, text: string }} Edit */
/** @typedef {NonNullable<ReturnType<typeof parse>>} Script */

// A program of this file alone: enough to bind its names, without resolving modules; undefined on syntax errors.
function parse(ts, file, text) {
  const kind = /\.[cm]?ts$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  const options = {
    allowJs: true,
    noLib: true,
    noResolve: true,
    types: [],
  };
  const program = ts.createProgram([file], options, {
    getSourceFile: (name) => (name === file ? source : undefined),
    fileExists: (name) => name === file,
    readFile: () => undefined,
    writeFile: () => {},
    getDefaultLibFileName: () => 'lib.d.ts',
    getCurrentDirectory: () => '',
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  });
  // The parser recovers from syntax errors, but then its tree may not match the code.
  if (program.getSyntacticDiagnostics(source).length) {
    return undefined;
  }
  const checker = program.getTypeChecker();

  /** The symbol an identifier refers to; for `{ a }` and `export { a }`, that of the local `a` */
  const symbolOf = (node) =>
    ts.isShorthandPropertyAssignment(node.parent)
      ? checker.getShorthandAssignmentValueSymbol(node.parent)
      : ts.isExportSpecifier(node.parent)
        ? checker.getExportSpecifierLocalTargetSymbol(node.parent)
        : checker.getSymbolAtLocation(node);

  /** The identifiers that refer to the symbol `name` declares, but `name` */
  const references = (name) => {
    const symbol = checker.getSymbolAtLocation(name);
    return identifiers(name.text).filter(
      (node) => node !== name && symbolOf(node) === symbol
    );
  };

  const identifiers = (text) => {
    const found = [];
    const visit = (node) => {
      if (ts.isIdentifier(node) && node.text === text) {
        found.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return found;
  };

  /** Imports from the package, `{ statement, specifier }` or `{ statement, namespace }`; type-only ones with `types` */
  const imports = (types = false) =>
    source.statements.flatMap((statement) => {
      const bindings = statement.importClause?.namedBindings;
      if (
        !ts.isImportDeclaration(statement) ||
        !PACKAGES.includes(statement.moduleSpecifier.text) ||
        (!types && statement.importClause?.isTypeOnly) ||
        !bindings
      ) {
        return [];
      }
      return ts.isNamespaceImport(bindings)
        ? [{ statement, namespace: bindings }]
        : bindings.elements
            .filter((specifier) => types || !specifier.isTypeOnly)
            .map((specifier) => ({ statement, specifier }));
    });

  /**
   * Whether a node refers to `component`, imported by name, alias or namespace: an identifier, `UI.Component`,
   * or a type, possibly `| null` or `| undefined`.
   */
  const isComponent = (component) => {
    const all = imports(true);
    // Compare symbols, not names, so a local variable with the same name doesn't match.
    const named = new Set(
      all
        .filter(
          ({ specifier }) =>
            specifier &&
            (specifier.propertyName ?? specifier.name).text === component
        )
        .map(({ specifier }) => checker.getSymbolAtLocation(specifier.name))
    );
    const namespaces = new Set(
      all
        .filter(({ namespace }) => namespace)
        .map(({ namespace }) => checker.getSymbolAtLocation(namespace.name))
    );
    const isNullish = (type) =>
      type.kind === ts.SyntaxKind.UndefinedKeyword ||
      (ts.isLiteralTypeNode(type) &&
        type.literal.kind === ts.SyntaxKind.NullKeyword);
    const is = (node) => {
      if (ts.isTypeReferenceNode(node)) {
        return !node.typeArguments && is(node.typeName);
      }
      if (ts.isUnionTypeNode(node)) {
        return (
          node.types.some(is) &&
          node.types.every((type) => is(type) || isNullish(type))
        );
      }
      if (ts.isIdentifier(node)) {
        return named.has(symbolOf(node));
      }
      // `UI.Component`: also check that `UI` is really one of our namespace imports.
      const [left, right] = ts.isPropertyAccessExpression(node)
        ? [node.expression, node.name]
        : ts.isQualifiedName(node)
          ? [node.left, node.right]
          : [];
      return (
        right?.text === component &&
        ts.isIdentifier(left) &&
        namespaces.has(symbolOf(left))
      );
    };
    return is;
  };

  /**
   * Whether an expression is a `tag` element of class `component`: a lookup or creation of the tag, a cast to
   * the class, or a name declared as one, by its type or as a `const` set to one.
   */
  const isElement = (component, tag) => {
    const isClass = isComponent(component);
    // The tag, possibly with an id, classes, attributes or pseudo-classes, but no other element
    const selector = new RegExp(`^${tag}(?:[#.[:][^\\s>+~,]*)?$`, 'i');
    // Variables, parameters and properties known to hold the element.
    const elements = new Set();
    const skip = (node) =>
      ts.isParenthesizedExpression(node) || ts.isNonNullExpression(node)
        ? skip(node.expression)
        : node;
    const is = (node) => {
      const expression = skip(node);
      // A cast to the class.
      if (
        ts.isAsExpression(expression) ||
        ts.isTypeAssertionExpression(expression)
      ) {
        return isClass(expression.type) || is(expression.expression);
      }
      // `querySelector<Class>(...)`, `querySelector('tag')` or `createElement('tag')`.
      if (ts.isCallExpression(expression)) {
        const callee = skip(expression.expression);
        const method =
          ts.isPropertyAccessExpression(callee) && callee.name.text;
        const [argument] = expression.arguments;
        const literal =
          argument && ts.isStringLiteralLike(argument) ? argument.text : '';
        return method === 'querySelector'
          ? (expression.typeArguments?.length === 1 &&
              isClass(expression.typeArguments[0])) ||
              selector.test(literal)
          : method === 'createElement' && literal.toLowerCase() === tag;
      }
      // A name we already know holds the element.
      const name = ts.isIdentifier(expression)
        ? expression
        : ts.isPropertyAccessExpression(expression) && expression.name;
      return !!name && elements.has(symbolOf(name));
    };
    // Remember names typed as the class, or consts set to a known element.
    // Anything else, like a `let`, could hold something else later, so it's ignored.
    const visit = (node) => {
      if (
        (ts.isVariableDeclaration(node) ||
          ts.isParameter(node) ||
          ts.isPropertyDeclaration(node)) &&
        ts.isIdentifier(node.name) &&
        (node.type
          ? isClass(node.type)
          : ts.isVariableDeclaration(node) &&
            node.parent.flags & ts.NodeFlags.Const &&
            node.initializer &&
            is(node.initializer))
      ) {
        elements.add(checker.getSymbolAtLocation(node.name));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return is;
  };

  /**
   * Whether `name` names nothing in the script but `existing`, the import it may already have,
   * so it can replace the references to another import of the same component.
   */
  const isFree = (name, existing) =>
    identifiers(name).every((node) => {
      const { parent } = node;
      // `obj.Name`, `UI.Name` and the `Name` in `Name as Alias` don't claim the name.
      return (
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isQualifiedName(parent) && parent.right === node) ||
        (ts.isImportSpecifier(parent) && parent.propertyName === node) ||
        (existing && symbolOf(node) === checker.getSymbolAtLocation(existing))
      );
    });

  /** Removes a specifier or namespace import, with its comma, or the whole statement if nothing else is left */
  const removeImport = (node) => {
    const elements = ts.isImportSpecifier(node) ? node.parent.elements : [node];
    const index = elements.indexOf(node);
    // Take a comma along: the one after the specifier, or the one before it when it's last.
    if (elements.length > 1) {
      return index < elements.length - 1
        ? {
            start: node.getStart(source),
            end: elements[index + 1].getStart(source),
            text: '',
          }
        : { start: elements[index - 1].end, end: node.end, text: '' };
    }
    const clause = ts.isImportSpecifier(node)
      ? node.parent.parent
      : node.parent;
    // `import Default, { Name }`: keep the default import.
    if (clause.name) {
      return {
        start: clause.name.end,
        end: clause.namedBindings.end,
        text: '',
      };
    }
    // Nothing else is left, so drop the whole statement and its line break.
    const statement = clause.parent;
    const lineBreak = /^\r?\n/.exec(text.slice(statement.end))?.[0] ?? '';
    return {
      start: statement.getStart(source),
      end: statement.end + lineBreak.length,
      text: '',
    };
  };

  const replace = (node, replacement) => ({
    start: node.getStart(source),
    end: node.end,
    text: replacement,
  });

  return {
    ts,
    source,
    text,
    symbolOf,
    imports,
    references,
    isComponent,
    isElement,
    isFree,
    removeImport,
    replace,
  };
}
