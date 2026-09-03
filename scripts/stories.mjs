// @ts-check
/** @import { Package, Type, Reference } from 'custom-elements-manifest/schema' */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { format } from 'oxfmt';
import report from './report.mjs';

const NULL_UNDEFINED_RE = /undefined|null/;
const ARRAY_TYPE_RE = /\[\]/;
const GENERIC_TYPE_RE = /<.*>/;

/** A generic mixin leaks its bare type parameter — `T | null` — into the manifest. */
const TYPE_PARAM_RE = /^[A-Z]\d?$/;

/**
 * A `keyof` alias over the component's generic data — `Keys<T>` — is a string
 * key at the attribute level, unlike other generics which have no control.
 */
const KEYOF_ALIAS_RE = /\bKeys<[^>]*>/g;

const STRING_LITERAL_RE = /^(['"]).*\1$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const PRETTIFY_NAME_RE = /igc|component/gi;
const STORY_REGION_RE = /\/\/ region default.*?\/\/ endregion/gs;

const STORIES_PATH = '../stories/';
const OXFMTRC_PATH = '../.oxfmtrc.json';

/** @type {import('oxfmt').FormatConfig | undefined} */
let formatOptions;

/**
 * The generated region is written into a story file that `oxfmt` also formats
 * repo-wide, so it has to be produced with the repository's own options.
 *
 * @returns {Promise<import('oxfmt').FormatConfig>}
 */
async function getFormatOptions() {
  if (formatOptions) {
    return formatOptions;
  }

  const url = new URL(OXFMTRC_PATH, import.meta.url);
  const options = JSON.parse(await readFile(url, 'utf8'));

  delete options.$schema;
  delete options.ignorePatterns;

  formatOptions = options;
  return options;
}

/**
 * @typedef {{
 *   kind: 'field',
 *   name: string,
 *   description?: string,
 *   privacy?: 'public' | 'private' | 'protected',
 *   attribute?: string,
 *   default?: string,
 *   type?: Type,
 *   expandedType?: Type,
 *   inheritedFrom?: Reference,
 *   static?: boolean,
 *   readonly?: boolean,
 *   deprecated?: boolean | string,
 * }} ComponentField
 *
 * @typedef {{
 *   kind: 'class' | 'mixin',
 *   name: string,
 *   description?: string,
 *   tagName?: string,
 *   events?: Array<{ name: string }>,
 *   members?: ComponentField[],
 * }} ComponentDeclaration
 *
 * @typedef {'string' | 'number' | 'boolean' | 'date'} SBScalar
 *
 * @typedef {Array<string | number>} SBEnumValues
 *
 * @typedef {{ name: 'enum', value: SBEnumValues } | { name: 'other', value: string }} SBType
 *
 * @typedef {{
 *   type: SBScalar | SBType,
 *   description?: string,
 *   options?: SBEnumValues,
 *   control?: string | { type: string },
 *   table?: { defaultValue: { summary: string } },
 * }} ArgTypeEntry
 *
 * @typedef {{ name: string, tsType: string, description?: string }} ArgMember
 *
 * @typedef {{
 *   title: string,
 *   component: string | undefined,
 *   parameters: {
 *     docs: { description: { component: string } },
 *     actions?: { handles: string[] },
 *   },
 *   argTypes?: Record<string, ArgTypeEntry>,
 *   args?: Record<string, string | number | boolean>,
 * }} StoriesMetadata
 *
 * @typedef {{ metadata: StoriesMetadata, members: ArgMember[] }} StoryModel
 */

/**
 * @template T
 * @param {T | undefined} val
 * @returns {val is T}
 */
function isDefined(val) {
  return val !== undefined;
}

/** @param {string} part */
function unquote(part) {
  return part.replace(/["']/g, '');
}

/**
 * The types Storybook names outright, with the control each one takes. Everything
 * else has to be described to it as an `SBType` node.
 *
 * @type {Map<string, { sbType: SBScalar, control: string }>}
 */
const SCALARS = new Map([
  ['string', { sbType: 'string', control: 'text' }],
  ['number', { sbType: 'number', control: 'number' }],
  ['boolean', { sbType: 'boolean', control: 'boolean' }],
  ['Date', { sbType: 'date', control: 'date' }],
]);

/**
 * @param {string} tsType
 * @param {SBEnumValues | undefined} options
 * @returns {string | { type: string } | undefined} `undefined` leaves the key out, so
 *   that Storybook picks a control itself.
 */
function resolveControl(tsType, options) {
  return options
    ? { type: options.length > 3 ? 'select' : 'inline-radio' }
    : SCALARS.get(tsType)?.control;
}

/**
 * @param {string} tsType
 * @param {SBEnumValues | undefined} values The union members as values, when they are
 *   all literals.
 * @returns {SBScalar | SBType}
 */
function resolveSBType(tsType, values) {
  return (
    SCALARS.get(tsType)?.sbType ??
    (values
      ? { name: 'enum', value: values }
      : { name: 'other', value: tsType })
  );
}

/**
 * @param {string} tsType
 * @param {string | undefined} value
 * @param {SBEnumValues | undefined} options
 * @returns {string | number | boolean | undefined}
 */
function resolveDefaultValue(tsType, value, options) {
  if (!isDefined(value)) {
    return tsType === 'boolean' ? false : undefined;
  }

  switch (tsType) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number.parseFloat(value);
    default:
      // Follows the union it belongs to, so a numeric enum defaults to one of its
      // members rather than to the digits spelled as a string.
      return typeof options?.[0] === 'number'
        ? Number(unquote(value))
        : unquote(value);
  }
}

/** @param {ComponentDeclaration} element */
function getMembers(element) {
  return (element.members ?? []).filter(
    (member) =>
      member.privacy === 'public' &&
      member.kind === 'field' &&
      member.attribute &&
      !member.static &&
      !member.readonly &&
      !member.deprecated
  );
}

/** @param {string} component */
function getFilePath(component) {
  const name = `${component.replace(/igc-|component/gi, '')}.stories.ts`;
  return new URL(join(STORIES_PATH, name), import.meta.url);
}

class StoriesBuilder {
  /** @type {Map<string, ComponentDeclaration>} */
  cache = new Map();

  /** @param {Package['modules']} modules */
  makeCache(modules) {
    for (const module of modules) {
      for (const candidate of module.declarations ?? []) {
        if (candidate.kind === 'class' || candidate.kind === 'mixin') {
          this.cache.set(
            candidate.name,
            /** @type {ComponentDeclaration} */ (candidate)
          );
        }
      }
    }
  }

  /**
   * Resolves the CEM type of a field into the three forms the story needs it in: the
   * TS type its args interface member is written from, the `SBType` its arg type entry
   * takes, and the values its control offers.
   *
   * @param {ComponentField} property
   * @returns {{ tsType: string, sbType?: SBScalar | SBType, options?: SBEnumValues }}
   */
  parseType(property) {
    let rawType = 'string';

    if (property.expandedType) {
      rawType = property.expandedType.text;
    } else if (property.type) {
      rawType = property.type.text;
    } else if (property.inheritedFrom) {
      const parent = this.cache
        .get(property.inheritedFrom.name)
        ?.members?.find((member) => member.name === property.name);

      if (parent) {
        return this.parseType(parent);
      }
    }

    const parts = Array.from(
      new Set(
        rawType
          .replace(KEYOF_ALIAS_RE, 'string')
          .split('|')
          .map((part) => part.trim())
          .filter(
            (part) =>
              part &&
              !NULL_UNDEFINED_RE.test(part) &&
              !ARRAY_TYPE_RE.test(part) &&
              !GENERIC_TYPE_RE.test(part) &&
              !TYPE_PARAM_RE.test(part)
          )
      )
    );

    if (!parts.length) {
      return { tsType: '' };
    }

    // Only a union of literals stands for a set of values — `Element | string` is two
    // types, not two things to pick between.
    const literals = parts.every((part) => STRING_LITERAL_RE.test(part));

    // The analyzer quotes numeric literals as though they were strings, expanding
    // `SliderTickLabelRotation` (`0 | 90 | -90`) to `'0' | '90' | `.
    const numeric =
      literals && parts.every((part) => NUMBER_RE.test(unquote(part)));

    /** @type {SBEnumValues | undefined} */
    const values = literals
      ? parts.map((part) => (numeric ? Number(unquote(part)) : unquote(part)))
      : undefined;

    const tsType =
      values && numeric
        ? values.join(' | ')
        : parts.map((part) => part.replace(/'/g, '"')).join(' | ');

    return {
      tsType,
      sbType: resolveSBType(tsType, values),
      // A single member is a constant, not a choice worth a control.
      options: values && values.length > 1 ? values : undefined,
    };
  }

  /**
   * @param {ComponentField[]} properties
   * @returns {{
   *   args: Record<string, string | number | boolean>,
   *   argTypes: Record<string, ArgTypeEntry>,
   *   members: ArgMember[],
   * }}
   */
  makeArgs(properties) {
    /** @type {Record<string, ArgTypeEntry>} */
    const argTypes = {};
    /** @type {Record<string, string | number | boolean>} */
    const args = {};
    /** @type {ArgMember[]} */
    const members = [];

    for (const property of properties) {
      const { tsType, sbType, options } = this.parseType(property);

      if (!sbType) {
        continue;
      }

      const control = resolveControl(tsType, options);
      const defaultValue = resolveDefaultValue(
        tsType,
        property.default,
        options
      );

      /** @type {ArgTypeEntry} */
      const entry = { type: sbType };

      if (property.description) entry.description = property.description;
      if (options) entry.options = options;
      if (control) entry.control = control;

      if (isDefined(defaultValue)) {
        entry.table = { defaultValue: { summary: defaultValue.toString() } };
        args[property.name] = defaultValue;
      }

      argTypes[property.name] = entry;
      members.push({
        name: property.name,
        tsType,
        description: property.description,
      });
    }

    return { args, argTypes, members };
  }

  /**
   * @param {ComponentDeclaration} customElement
   * @returns {StoryModel}
   */
  makeDefinition(customElement) {
    const { description, name, events, tagName } = customElement;
    const { args, argTypes, members } = this.makeArgs(
      getMembers(customElement)
    );
    const actions = events?.map(({ name }) => name).filter(Boolean);

    /** @type {StoriesMetadata} */
    const metadata = {
      title: name.replace(PRETTIFY_NAME_RE, ''),
      component: tagName,
      parameters: {
        docs: { description: { component: description ?? '' } },
      },
    };

    if (actions?.length) metadata.parameters.actions = { handles: actions };
    if (members.length) metadata.argTypes = argTypes;
    if (Object.keys(args).length) metadata.args = args;

    return { metadata, members };
  }

  /**
   * @param {string} name
   * @param {StoryModel} model
   * @returns {Promise<boolean>} Whether the story file changed.
   */
  async writeStory(name, model) {
    const file = getFilePath(model.metadata.component ?? '');
    let data = '';

    try {
      data = await readFile(file, 'utf8');
    } catch {
      report.warn(`No story file found for ${name}, skipping.`);
      return false;
    }

    // `file` is a URL; oxfmt only needs an extension to pick the parser.
    const { code } = await format(
      'story.ts',
      template(name, model),
      await getFormatOptions()
    );
    const storyMeta = code.trim();

    const newContent = data.replace(STORY_REGION_RE, storyMeta);

    if (newContent === data) {
      return false;
    }

    await writeFile(file, newContent, { encoding: 'utf8', flush: true });
    return true;
  }

  /**
   * @param {Package} manifest
   * @returns {Promise<{ written: number, failed: number }>}
   */
  async build(manifest) {
    this.makeCache(manifest.modules);

    const results = await Promise.allSettled(
      Array.from(this.cache.values())
        .filter((element) => element.tagName)
        .map((element) =>
          this.writeStory(element.name, this.makeDefinition(element))
        )
    );

    let written = 0;
    let failed = 0;

    for (const result of results) {
      if (result.status === 'rejected') {
        const { reason } = result;
        report.error(`Failed to write story: ${reason?.message ?? reason}`);
        failed++;
      } else if (result.value) {
        written++;
      }
    }

    return { written, failed };
  }
}

/** @param {string | undefined} description */
function makeComment(description) {
  if (!description) return '';

  const parts = description.split('\n');

  return parts.length > 1
    ? ['/**', ...parts.map((part) => `* ${part}`), '*/\n'].join('\n')
    : `/** ${description} */\n`;
}

/**
 * @param {string} title
 * @param {ArgMember[]} members
 */
function templateArgsInterface(title, members) {
  if (!members.length) {
    return 'type Story = StoryObj';
  }

  const argsInterface = `Igc${title.replace(/\s/g, '')}Args`;
  const properties = members
    .map(
      ({ name, tsType, description }) =>
        `${makeComment(description)}${name}: ${tsType};`
    )
    .join('\n');

  return `interface ${argsInterface} {
      ${properties}
    }
  type Story = StoryObj<${argsInterface}>`;
}

/**
 * @param {string} name
 * @param {StoryModel} model
 */
function template(name, { metadata, members }) {
  return String.raw`
// region default
const metadata: Meta<${name}> =
${JSON.stringify(metadata)}

export default metadata;

${templateArgsInterface(metadata.title, members)}

// endregion`;
}

/**
 * Regenerates the `// region default` block of every story file from a custom elements
 * manifest.
 *
 * The manifest is passed in rather than read here, because the callers need it on
 * different terms: a one-shot build can import it as a module, while the watcher has to
 * re-read it every pass to see what the analyzer just wrote. A fresh builder per call,
 * since the declarations it caches are only valid for the manifest they came from.
 *
 * @param {Package} manifest
 * @returns {Promise<{ written: number, failed: number }>}
 */
export function buildStories(manifest) {
  return new StoriesBuilder().build(manifest);
}
