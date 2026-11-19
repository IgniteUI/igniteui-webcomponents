import { migrateScripts } from '../common/imports.js';

const COMPONENT = 'IgcComboComponent';
const TAG = 'igc-combo';
const OLD = 'igcOpening';
const NEW = 'igcOpened';
// Comments are matched only to be skipped.
const OPENING_TAG = new RegExp(
  `<!--[\\s\\S]*?(?:-->|$)|<${TAG}(?=[\\s/>])(?:[^>"']|"[^"]*"|'[^']*')*`,
  'gi'
);

/**
 * Renames the `igcOpening` event of `igc-combo` to `igcOpened`: in `addEventListener` and `removeEventListener`
 * calls on a known combo, and in `@igcOpening` bindings on `igc-combo` in Lit `html` templates. Skips a binding
 * on an element that has `@igcOpened` already.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function comboEventRename(host) {
  migrateScripts(host, OLD, ({ ts, source, text, isElement }) => {
    const isCombo = isElement(COMPONENT, TAG);
    const edits = [];
    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ['addEventListener', 'removeEventListener'].includes(
          node.expression.name.text
        )
      ) {
        // Only for listeners on an element we know is a combo.
        const [type] = node.arguments;
        if (
          type &&
          ts.isStringLiteralLike(type) &&
          type.text === OLD &&
          isCombo(node.expression.expression)
        ) {
          // Inside the quotes
          edits.push({
            start: type.getStart(source) + 1,
            end: type.end - 1,
            text: NEW,
          });
        }
      } else if (
        ts.isTaggedTemplateExpression(node) &&
        node.tag.getText(source) === 'html'
      ) {
        edits.push(...bindingEdits(source, text, node.template));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    return edits;
  });
}

// `${}` expressions and attribute values are masked; templates nested in them are visited on their own.
function bindingEdits(source, text, template) {
  const start = template.getStart(source);
  let markup = text.slice(start, template.end);
  // Same-length mask, so offsets in `markup` still match the file.
  for (const span of template.templateSpans ?? []) {
    const from = span.expression.getFullStart() - start;
    const to = span.literal.getStart(source) - start;
    markup = markup.slice(0, from) + '_'.repeat(to - from) + markup.slice(to);
  }

  const edits = [];
  for (const match of markup.matchAll(OPENING_TAG)) {
    if (match[0].startsWith('<!--')) {
      continue;
    }
    // Blank out quoted values, so text like `title="@igcOpening"` isn't matched.
    const tag = match[0].replace(/"[^"]*"|'[^']*'/g, (quoted) =>
      '_'.repeat(quoted.length)
    );
    const bindings = [
      ...tag.matchAll(new RegExp(`\\s@(${OLD}|${NEW})(?=[\\s=/>]|$)`, 'g')),
    ];
    // Skip the tag if it already has `@igcOpened`, or `@igcOpening` more than once.
    if (bindings.length === 1 && bindings[0][1] === OLD) {
      // After the whitespace and the `@`
      const at = start + match.index + bindings[0].index + 2;
      edits.push({ start: at, end: at + OLD.length, text: NEW });
    }
  }
  return edits;
}
