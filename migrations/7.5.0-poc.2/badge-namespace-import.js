import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgcBadgeComponent';

/**
 * Replaces `UI.IgcBadgeComponent` by `IgcBadgeComponent` for `import * as UI` from igniteui-webcomponents, importing `IgcBadgeComponent` by name;
 * the namespace import goes once nothing else uses it. Skips a script where `IgcBadgeComponent` names something else.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function badgeNamespaceImport(host) {
  migrateScripts(
    host,
    COMPONENT,
    ({ ts, text, imports, references, isFree, removeImport, replace }) => {
      const all = imports();
      const existing = all.find(
        ({ specifier }) =>
          specifier &&
          specifier.name.text === COMPONENT &&
          (specifier.propertyName ?? specifier.name).text === COMPONENT
      );
      // Skip the file if IgcBadgeComponent already means something else here.
      if (!isFree(COMPONENT, existing?.specifier.name)) {
        return [];
      }
      const newLine = text.includes('\r\n') ? '\r\n' : '\n';
      // Once IgcBadgeComponent is imported by name, reuse that import,
      // and leave namespaces from other modules alone.
      let imported = existing?.statement.moduleSpecifier.text;

      return all.flatMap(({ statement, namespace }) => {
        const module = statement.moduleSpecifier.text;
        if (!namespace || (imported && imported !== module)) {
          return [];
        }
        // Every use of `UI`, by symbol, then the `UI.IgcBadgeComponent` ones among them.
        const uses = references(namespace.name);
        const badges = uses.filter(({ parent }) =>
          ts.isPropertyAccessExpression(parent)
            ? parent.name.text === COMPONENT
            : ts.isQualifiedName(parent) && parent.right.text === COMPONENT
        );
        if (!badges.length) {
          return [];
        }

        const edits = badges.map((node) => replace(node.parent, COMPONENT));
        // Keep the namespace import if something else still uses it, like `UI.defineComponents`.
        const unused = badges.length === uses.length;
        if (imported) {
          if (unused) {
            edits.push(removeImport(namespace));
          }
        } else if (unused) {
          // Turn `* as UI` into `{ IgcBadgeComponent }`.
          edits.push(replace(namespace, `{ ${COMPONENT} }`));
        } else {
          // The namespace is still needed, so add a named import on the next line.
          const semicolon = statement.getText().endsWith(';') ? ';' : '';
          const line = `import { ${COMPONENT} } from ${statement.moduleSpecifier.getText()}${semicolon}`;
          edits.push({
            start: statement.end,
            end: statement.end,
            text: newLine + line,
          });
        }
        imported = module;
        return edits;
      });
    }
  );
}
