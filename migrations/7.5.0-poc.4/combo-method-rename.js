// PoC only, synthetic: show() opens the combo and toggle() switches it, so they are not equivalent; never ship this.
import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgcComboComponent';
const TAG = 'igc-combo';
const OLD = 'show';
const NEW = 'toggle';

/**
 * Renames `show()` to `toggle()` on known combos: `igc-combo` elements looked up, created or cast as such, and
 * names declared as `IgcComboComponent` or as a `const` set to a combo.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function comboMethodRename(host) {
  migrateScripts(
    host,
    new RegExp(`${TAG}|${COMPONENT}`),
    ({ ts, source, isElement, replace }) => {
      const isCombo = isElement(COMPONENT, TAG);
      const edits = [];
      const visit = (node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === OLD &&
          isCombo(node.expression.expression)
        ) {
          edits.push(replace(node.expression.name, NEW));
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      return edits;
    }
  );
}
