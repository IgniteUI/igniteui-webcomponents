const TAG = 'igc-badge';
const OLD = 'outline';
const NEW = 'outlined';
// Comments and script, style and textarea contents are matched only to be skipped.
const OPENING_TAG = new RegExp(
  `<!--[\\s\\S]*?(?:-->|$)|<(script|style|textarea)(?=[\\s/>])[\\s\\S]*?(?:</\\1\\s*>|$)|(<${TAG})(?=[\\s/>])`,
  'gi'
);

/**
 * Renames `outline`, `?outline` and `.outline` to `outlined` on `igc-badge` in HTML files and Lit `html` templates;
 * drops `outline` when `outlined` is set.
 *
 * @param {import('../common/imports.js').MigrationHost} host
 */
export default function badgeOutline(host) {
  let ts;
  for (const file of host.files()) {
    const html = /\.html?$/.test(file);
    if (!html && !/\.[cm]?[jt]s$/.test(file)) {
      continue;
    }
    const text = host.read(file);
    if (!text.includes(TAG)) {
      continue;
    }

    // HTML files are scanned as they are; scripts only inside Lit `html` templates, which needs TypeScript.
    if (!html) {
      ts ??= loadTypeScript(host);
    }
    const edits = html ? markupEdits(text, 0) : templateEdits(ts, file, text);
    // Apply edits backwards so earlier offsets stay valid.
    const updated = edits
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
      `Migrating ${TAG} in scripts requires TypeScript from the CLI, which this igniteui-cli doesn't provide; update igniteui-cli`
    );
  }
  return host.typescript;
}

// `${}` expressions are masked; templates nested in them are visited on their own.
function templateEdits(ts, file, text) {
  const kind = /\.[cm]?ts$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  // shortcut: parseDiagnostics is internal (no program here for getSyntacticDiagnostics), recheck it on a TypeScript upgrade.
  if (source.parseDiagnostics.length) {
    // oxlint-disable-next-line no-console -- the CLI shows a migration's console output
    console.warn(
      `    Skipped ${file}: TypeScript ${ts.version} found syntax errors in it.`
    );
    return [];
  }
  const edits = [];

  const visit = (node) => {
    if (
      ts.isTaggedTemplateExpression(node) &&
      node.tag.getText(source) === 'html'
    ) {
      const start = node.template.getStart(source);
      let markup = text.slice(start, node.template.end);
      // Same-length mask, so offsets in `markup` still match the file.
      for (const span of node.template.templateSpans ?? []) {
        const from = span.expression.getFullStart() - start;
        const to = span.literal.getStart(source) - start;
        markup =
          markup.slice(0, from) + '_'.repeat(to - from) + markup.slice(to);
      }
      edits.push(...markupEdits(markup, start));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return edits;
}

function markupEdits(markup, offset) {
  const edits = [];
  for (const match of markup.matchAll(OPENING_TAG)) {
    // A comment or a script, style or textarea block, not a badge.
    if (!match[2]) {
      continue;
    }

    const attributes = readAttributes(markup, match.index + match[0].length);
    const old = attributes.filter((a) => a.base === OLD);
    const hasNew = attributes.some((a) => a.base === NEW);
    // Drop `outline` if `outlined` is already set; otherwise rename it, keeping any Lit `?` or `.` prefix.
    for (const { name, start, end } of old) {
      edits.push(
        hasNew
          ? {
              start: offset + trimStart(markup, start),
              end: offset + end,
              text: '',
            }
          : {
              start: offset + start,
              end: offset + start + name.length,
              text: name.slice(0, -OLD.length) + NEW,
            }
      );
    }
  }
  return edits;
}

/** `base`: the name without a Lit `?`/`.` prefix, lower-cased unless a `.` property */
function readAttributes(markup, index) {
  const attributes = [];
  let i = index;
  while (i < markup.length) {
    while (/\s/.test(markup[i])) {
      i++;
    }
    if (i >= markup.length || markup[i] === '>' || markup.startsWith('/>', i)) {
      break;
    }
    const start = i;
    while (
      i < markup.length &&
      !/[\s=>]/.test(markup[i]) &&
      !markup.startsWith('/>', i)
    ) {
      i++;
    }
    const name = markup.slice(start, i);
    // Skip the value, quoted or not.
    let j = i;
    while (/\s/.test(markup[j])) {
      j++;
    }
    if (markup[j] === '=') {
      j++;
      while (/\s/.test(markup[j])) {
        j++;
      }
      const quote = markup[j];
      if (quote === '"' || quote === "'") {
        const close = markup.indexOf(quote, j + 1);
        j = close < 0 ? markup.length : close + 1;
      } else {
        while (j < markup.length && !/[\s>]/.test(markup[j])) {
          j++;
        }
      }
      i = j;
    }
    const base =
      name[0] === '.' ? name.slice(1) : name.replace(/^\?/, '').toLowerCase();
    attributes.push({ name, base, start, end: i });
  }
  return attributes;
}

// A removed attribute takes its leading whitespace along.
function trimStart(text, start) {
  let index = start;
  while (index > 0 && /\s/.test(text[index - 1])) {
    index--;
  }
  return index;
}
