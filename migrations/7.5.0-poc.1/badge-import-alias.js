// PoC only, synthetic: there was no change that made the alias necessary.
import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgcBadgeComponent';

/**
 * Replaces `import { IgcBadgeComponent as Badge }` by `import { IgcBadgeComponent }`, and `Badge` by `IgcBadgeComponent` wherever it refers
 * to that import. Skips a script with several aliases, or where `IgcBadgeComponent` names something else.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function badgeImportAlias(host) {
  migrateScripts(
    host,
    COMPONENT,
    ({ ts, imports, references, isFree, removeImport, replace }) => {
      const badges = imports().filter(
        ({ specifier }) =>
          specifier &&
          (specifier.propertyName ?? specifier.name).text === COMPONENT
      );
      const aliases = badges.filter(
        ({ specifier }) => specifier.name.text !== COMPONENT
      );
      const existing = badges.find(
        ({ specifier }) => specifier.name.text === COMPONENT
      );
      if (
        aliases.length !== 1 ||
        !isFree(COMPONENT, existing?.specifier.name) ||
        (existing &&
          existing.statement.moduleSpecifier.text !==
            aliases[0].statement.moduleSpecifier.text)
      ) {
        return [];
      }
      const { specifier } = aliases[0];
      return [
        existing ? removeImport(specifier) : replace(specifier, COMPONENT),
        ...references(specifier.name).flatMap((node) => {
          const { parent } = node;
          if (ts.isShorthandPropertyAssignment(parent)) {
            return [replace(node, `${node.text}: ${COMPONENT}`)];
          }
          if (ts.isExportSpecifier(parent) && parent.name === node) {
            // The exported name stays.
            return parent.propertyName
              ? []
              : [replace(node, `${COMPONENT} as ${node.text}`)];
          }
          return [replace(node, COMPONENT)];
        }),
      ];
    }
  );
}
