// @ts-check
/** @import { ClassMethod, CustomElementDeclaration, CustomElementField, Declaration, Package, Type } from 'custom-elements-manifest/schema' */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Writes the agent documentation of the published package, in the format of
 * https://llmstxt.org (v2):
 *
 * - `llms.txt`: the index. The usage notes from `templates/llms-header.md`, a
 *   link to the page of each element, the end-user skills and other resources.
 * - `docs/<tag>.md`: the API of one element. An agent reads only the pages
 *   that it needs.
 * - `llms-full.txt`: the usage notes and all the pages in one file.
 *
 * The pages come from the Custom Elements Manifest, so they match the version
 * that they ship with. An element is public when `src/index.ts` exports its
 * class. A member without a description is left out: most of them are
 * plumbing, for example `emitEvent`.
 */

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEADER = path.join(ROOT, 'scripts/templates/llms-header.md');
const SKILLS = path.join(ROOT, 'skills');
const ENTRY = 'src/index.ts';
const PAGES = 'docs';

const DOCS_INDEX =
  'https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/llms.txt';

/** A period followed by whitespace or the end of the text. */
const SENTENCE_END = /\.(?=\s|$)/;
const PARAGRAPH_BREAK = /\n\s*\n/;
const WHEN_TO_USE = ' WHEN TO USE:';

/**
 * @typedef {CustomElementField & { expandedType?: Type }} Field
 * @typedef {CustomElementDeclaration & { tagName: string }} Element
 * @typedef {{ name: string, description?: string, deprecated?: boolean | string }} Entry
 */

/**
 * Inline code. A code span that holds a backtick needs a longer fence.
 *
 * @param {string} text
 */
const code = (text) =>
  text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``;

/** @param {string} name */
const pagePath = (name) => `${PAGES}/${name}.md`;

/** @param {{ privacy?: string, static?: boolean, description?: string }} member */
const isDocumented = (member) =>
  (!member.privacy || member.privacy === 'public') &&
  !member.static &&
  Boolean(member.description?.trim());

/** @param {Entry} entry */
const deprecation = ({ deprecated }) =>
  typeof deprecated === 'string'
    ? `Deprecated: ${deprecated}`
    : deprecated
      ? 'Deprecated.'
      : '';

/**
 * A list item: the head, then the description, indented so that it stays in
 * the item. `inline` puts the first line of the description on the head line.
 *
 * @param {string} head
 * @param {string | undefined} description
 * @param {boolean} [inline]
 */
function listItem(head, description, inline = false) {
  const lines = (description ?? '').trim().split('\n');
  const first = inline ? `: ${lines.shift()}` : '';
  const indented = lines.map((line) => (line ? `  ${line}` : ''));

  return [`- ${head}${first}`, ...indented].join('\n').trimEnd();
}

/** @param {string | undefined} description */
function firstSentence(description) {
  const paragraph = (description ?? '').trim().split(PARAGRAPH_BREAK, 1)[0];
  const text = paragraph.replace(/\s+/g, ' ');
  const end = text.search(SENTENCE_END);

  return end === -1 ? text : text.slice(0, end + 1);
}

/**
 * @param {string} title
 * @param {string[]} items
 */
const section = (title, items) =>
  items.length ? [`## ${title}\n\n${items.join('\n')}`] : [];

/**
 * The type is the aliased literal union when the manifest has one:
 * `'small' | 'large'` tells more than `ButtonSize`.
 *
 * @param {Field} field
 */
function describeField(field) {
  const type = field.expandedType?.text ?? field.type?.text;
  const facts = [
    field.default ? `Default: ${code(field.default)}.` : '',
    field.readonly ? 'Read-only.' : '',
    field.attribute
      ? `Attribute: ${code(field.attribute)}${field.reflects ? ', reflected' : ''}.`
      : 'No attribute.',
    deprecation(field),
  ].filter(Boolean);

  return listItem(
    `${code(field.name)}${type ? `: ${code(type)}` : ''}. ${facts.join(' ')}`,
    field.description
  );
}

/** @param {ClassMethod} method */
function signatureOf(method) {
  const parameters = (method.parameters ?? []).map(
    (p) =>
      `${p.rest ? '...' : ''}${p.name}${p.optional ? '?' : ''}${p.type ? `: ${p.type.text}` : ''}${p.default ? ` = ${p.default}` : ''}`
  );

  return `${method.name}(${parameters.join(', ')}): ${method.return?.type?.text ?? 'void'}`;
}

/**
 * One entry for each signature. Overloads with the same text collapse.
 *
 * @param {ClassMethod[]} methods
 */
function describeMethods(methods) {
  const bySignature = new Map();

  for (const method of methods) {
    const signature = signatureOf(method);

    if (!bySignature.has(signature)) {
      bySignature.set(
        signature,
        listItem(
          [code(signature), deprecation(method)].filter(Boolean).join(' '),
          method.description
        )
      );
    }
  }

  return Array.from(bySignature.values());
}

/**
 * @param {Entry[] | undefined} entries
 * @param {(name: string) => string} [label]
 */
const describeEntries = (entries, label = code) =>
  (entries ?? [])
    .filter((entry) => entry.description?.trim())
    .map((entry) => listItem(label(entry.name), entry.description, true));

/** @param {Element} element */
function renderPage(element) {
  const members = (element.members ?? []).filter(isDocumented);
  const fields = /** @type {Field[]} */ (
    members.filter((m) => m.kind === 'field')
  );
  const methods = /** @type {ClassMethod[]} */ (
    members.filter((m) => m.kind === 'method')
  );
  const events = (element.events ?? []).filter(
    (event) => event.name && event.description?.trim()
  );

  return [
    `# ${element.tagName}`,
    element.description?.trim() ?? '',
    [
      '```ts',
      `import { defineComponents, ${element.name} } from 'igniteui-webcomponents';`,
      '',
      `defineComponents(${element.name});`,
      '```',
    ].join('\n'),
    ...section('Properties', fields.map(describeField)),
    ...section('Methods', describeMethods(methods)),
    ...section(
      'Events',
      events.map((event) =>
        listItem(
          `${code(event.name)}${event.type ? `: ${code(event.type.text)}` : ''}`,
          event.description
        )
      )
    ),
    ...section(
      'Slots',
      describeEntries(element.slots, (name) => (name ? code(name) : 'default'))
    ),
    ...section('CSS parts', describeEntries(element.cssParts)),
    ...section('CSS custom properties', describeEntries(element.cssProperties)),
    ...section('CSS custom states', describeEntries(element.cssStates)),
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * @param {Declaration} declaration
 * @returns {declaration is Element}
 */
const isElement = (declaration) =>
  'customElement' in declaration && Boolean(declaration.tagName);

/**
 * The custom elements whose classes the package root exports, by tag name.
 *
 * @param {Package} manifest
 */
function publicElements(manifest) {
  const entry = manifest.modules.find((module) => module.path === ENTRY);
  const exported = new Set((entry?.exports ?? []).map(({ name }) => name));

  return manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter(isElement)
    .filter((element) => exported.has(element.name))
    .sort((a, b) => a.tagName.localeCompare(b.tagName));
}

/**
 * The name and the summary of each end-user skill, from its frontmatter: the
 * description up to its `WHEN TO USE:` marker.
 *
 * @returns {Promise<Entry[]>}
 */
async function readSkills() {
  const directories = (await readdir(SKILLS, { withFileTypes: true })).filter(
    (entry) => entry.isDirectory()
  );

  const skills = await Promise.all(
    directories.map(async ({ name }) => {
      const text = await readFile(path.join(SKILLS, name, 'SKILL.md'), 'utf8');
      const raw = text.match(/^description:\s*(.*)$/m)?.[1] ?? '';
      /** @type {string} */
      const description = raw.startsWith('"') ? JSON.parse(raw) : raw;

      return { name, description: description.split(WHEN_TO_USE, 1)[0] };
    })
  );

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * @param {Package} manifest
 * @param {string} destination The `dist` directory.
 */
export async function buildLlmsFiles(manifest, destination) {
  const header = (await readFile(HEADER, 'utf8')).trim();
  const elements = publicElements(manifest);
  const pages = elements.map(renderPage);
  const skills = await readSkills();

  const index = [
    header,
    ...section(
      'Components',
      elements.map((element) => {
        const summary = firstSentence(element.description);
        return `- [${element.tagName}](${pagePath(element.tagName)})${summary ? `: ${summary}` : ''}`;
      })
    ),
    ...section(
      'Agent skills',
      skills.map(
        ({ name, description }) =>
          `- [${name}](skills/${name}/SKILL.md): ${description}`
      )
    ),
    ...section('Optional', [
      '- [Full reference](llms-full.txt): the usage notes and all the component pages in one file.',
      `- [Documentation index](${DOCS_INDEX}): the guides on the documentation site, and the grids, charts and dock manager.`,
      '- [Custom Elements Manifest](custom-elements.json): the API of all the elements as JSON.',
      '- [Changelog](CHANGELOG.md): the changes in each version.',
    ]),
  ];

  await mkdir(path.join(destination, PAGES), { recursive: true });
  await Promise.all([
    writeFile(
      path.join(destination, 'llms.txt'),
      `${index.join('\n\n')}\n`,
      'utf8'
    ),
    writeFile(
      path.join(destination, 'llms-full.txt'),
      `${[header, ...pages].join('\n\n')}\n`,
      'utf8'
    ),
    ...elements.map((element, i) =>
      writeFile(
        path.join(destination, pagePath(element.tagName)),
        `${pages[i]}\n`,
        'utf8'
      )
    ),
  ]);
}
