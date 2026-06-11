// @ts-check
/** @import { Package, Type, Reference } from 'custom-elements-manifest/schema' */
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { format } from 'prettier';
import report from './report.mjs';

const execAsync = promisify(exec);

/** Pre-compiled regexes */
const NULL_UNDEFINED_RE = /undefined|null/;
const ARRAY_TYPE_RE = /\[\]/;
const GENERIC_TYPE_RE = /<.*>/;
const PRETTIFY_NAME_RE = /igc|component/gi;
const STORY_REGION_RE = /\/\/ region default.*?\/\/ endregion/gs;

/** @typedef {{ manifestPath: string, storiesPath: string }} Config */

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
 */

/**
 * @typedef {{
 *   kind: 'class' | 'mixin',
 *   name: string,
 *   description?: string,
 *   tagName?: string,
 *   events?: Array<{ name: string }>,
 *   members?: ComponentField[],
 * }} ComponentDeclaration
 */

/**
 * @typedef {{
 *   type: string,
 *   description?: string,
 *   options?: string[],
 *   control?: string | { type: string },
 *   table?: { defaultValue: { summary: string } },
 * }} ArgTypeEntry
 */

/**
 * @typedef {{
 *   title: string,
 *   component: string | undefined,
 *   parameters: {
 *     docs: { description: { component: string } },
 *     actions?: { handles: string[] },
 *   },
 *   argTypes?: Record<string, ArgTypeEntry>,
 *   args?: Record<string, string | number | boolean>,
 * }} StoriesDefinition
 */

/**
 * @template T
 * @param {T | undefined} val
 * @returns {val is T}
 */
function isDefined(val) {
  return val !== undefined;
}

/**
 * @param {string} name
 * @returns {string}
 */
function prettifyName(name) {
  return name.replace(PRETTIFY_NAME_RE, '');
}

class StoriesBuilder {
  /** @type {Config} */
  #config;

  /** @type {Map<string, ComponentDeclaration>} */
  #cache = new Map();

  /**
   * @param {string} parentName
   * @param {string} memberName
   * @returns {ComponentField | undefined}
   */
  #getMemberFrom(parentName, memberName) {
    return this.#cache
      .get(parentName)
      ?.members?.find((m) => m.name === memberName);
  }

  /**
   * Parses the CEM type string for a field into a normalized type string and
   * optional union options in a single pass.
   *
   * @param {ComponentField} property
   * @returns {{ type: string, options: string[] | undefined }}
   */
  #parseType(property) {
    let rawType = 'string';

    if (property.expandedType) {
      rawType = property.expandedType.text;
    } else if (property.type) {
      rawType = property.type.text;
    } else if (property.inheritedFrom) {
      const parent = this.#getMemberFrom(
        property.inheritedFrom.name,
        property.name
      );
      if (parent) {
        return this.#parseType(parent);
      }
    }

    /** @type {string[]} */
    const parts = [];

    for (const raw of rawType.split('|')) {
      const part = raw.trim();
      if (
        part &&
        !NULL_UNDEFINED_RE.test(part) &&
        !ARRAY_TYPE_RE.test(part) &&
        !GENERIC_TYPE_RE.test(part)
      ) {
        parts.push(part);
      }
    }

    if (!parts.length) {
      return { type: '', options: undefined };
    }

    const type = parts.map((p) => p.replace(/'/g, '"')).join(' | ');
    const options =
      parts.length > 1 ? parts.map((p) => p.replace(/"|'/g, '')) : undefined;

    return { type, options };
  }

  /**
   * @param {string} type
   * @param {string[] | undefined} options
   * @returns {string | { type: string }}
   */
  #resolveControl(type, options) {
    if (type.startsWith('string')) return 'text';
    if (type.startsWith('number')) return 'number';
    if (type.startsWith('Date')) return 'date';
    if (options)
      return { type: options.length > 3 ? 'select' : 'inline-radio' };
    return type;
  }

  /**
   * @param {string} type
   * @param {string | undefined} value
   * @returns {string | number | boolean | undefined}
   */
  #resolveDefaultValue(type, value) {
    switch (type) {
      case 'boolean':
        return isDefined(value) ? value === 'true' : false;
      case 'number':
        return isDefined(value) ? Number.parseFloat(value) : undefined;
      default:
        return isDefined(value) ? value.replace(/"|'/g, '') : undefined;
    }
  }

  /**
   * @param {Config} config
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * @returns {Promise<Package>}
   */
  async #parseManifest() {
    const file = new URL(this.#config.manifestPath, import.meta.url);
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if (
        !(
          error instanceof Error &&
          /** @type {NodeJS.ErrnoException} */ (error).code === 'ENOENT'
        )
      ) {
        throw error;
      }
      await execAsync('npm run cem');
      return JSON.parse(await readFile(file, 'utf8'));
    }
  }

  /**
   * @param {Package['modules']} modules
   */
  #makeCache(modules) {
    for (const module of modules) {
      for (const candidate of module.declarations ?? []) {
        if (/mixin|class/.test(candidate.kind)) {
          this.#cache.set(
            candidate.name,
            /** @type {ComponentDeclaration} */ (candidate)
          );
        }
      }
    }
  }

  async #createDefinitions() {
    const results = await Promise.allSettled(
      Array.from(this.#cache.values())
        .filter((element) => element.tagName)
        .map((element) =>
          this.#writeStory(element.name, this.#makeDefinition(element))
        )
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        const reason = result.reason;
        report.error(`Failed to write story: ${reason?.message ?? reason}`);
      }
    }
  }

  /**
   * @param {ComponentField[]} properties
   * @returns {{ args: Record<string, string | number | boolean>, argTypes: Record<string, ArgTypeEntry> }}
   */
  #makeArgs(properties) {
    /** @type {Record<string, ArgTypeEntry>} */
    const argTypes = {};
    /** @type {Record<string, string | number | boolean>} */
    const args = {};

    for (const property of properties) {
      const { type, options } = this.#parseType(property);
      if (!type) continue;

      const control = this.#resolveControl(type, options);
      const defaultValue = this.#resolveDefaultValue(type, property.default);

      /** @type {ArgTypeEntry} */
      const entry = { type };
      if (property.description) entry.description = property.description;
      if (options) entry.options = options;
      if (control) entry.control = control;
      if (isDefined(defaultValue)) {
        entry.table = { defaultValue: { summary: defaultValue.toString() } };
      }

      argTypes[property.name] = entry;

      if (isDefined(defaultValue)) {
        args[property.name] = defaultValue;
      }
    }

    return { args, argTypes };
  }

  /**
   * @param {ComponentDeclaration} customElement
   * @returns {StoriesDefinition}
   */
  #makeDefinition(customElement) {
    const { description, name, events } = customElement;
    const { args, argTypes } = this.#makeArgs(this.#getMembers(customElement));
    const actions = events?.map(({ name }) => name).filter(Boolean);

    /** @type {StoriesDefinition} */
    const result = {
      title: prettifyName(name),
      component: customElement.tagName,
      parameters: {
        docs: { description: { component: description ?? '' } },
      },
    };

    if (actions?.length) result.parameters.actions = { handles: actions };
    if (Object.keys(argTypes).length) result.argTypes = argTypes;
    if (Object.keys(args).length) result.args = args;

    return result;
  }

  /**
   * @param {string} component
   * @returns {URL}
   */
  #getFilePath(component) {
    const name = `${component.replace(/igc-|component/gi, '')}.stories.ts`;
    return new URL(join(this.#config.storiesPath, name), import.meta.url);
  }

  /**
   * @param {string} name
   * @param {StoriesDefinition} definition
   * @returns {Promise<void>}
   */
  async #writeStory(name, definition) {
    const file = this.#getFilePath(definition.component ?? '');
    let data = '';

    try {
      data = await readFile(file, 'utf8');
    } catch {
      report.warn(`No story file found for ${name}, skipping.`);
      return;
    }

    const storyMeta = (
      await format(template(name, definition), {
        singleQuote: true,
        parser: 'typescript',
      })
    ).trim();

    const newContent = data.replace(STORY_REGION_RE, storyMeta);

    if (newContent !== data) {
      await writeFile(file, newContent, { encoding: 'utf8', flush: true });
    }
  }

  async build() {
    const { modules } = await this.#parseManifest();
    this.#makeCache(modules);
    await this.#createDefinitions();
  }

  /**
   * @param {ComponentDeclaration} element
   * @returns {ComponentField[]}
   */
  #getMembers(element) {
    return /** @type {ComponentField[]} */ (element.members ?? []).filter(
      (member) =>
        member.privacy === 'public' &&
        member.kind === 'field' &&
        member.attribute &&
        !member.static &&
        !member.readonly &&
        !member.deprecated
    );
  }
}

/**
 * @param {string} description
 * @returns {string}
 */
function makeComment(description) {
  if (!description) return '';
  const parts = description.split('\n');
  return parts.length > 1
    ? ['/**', ...parts.map((part) => `* ${part}`), '*/\n'].join('\n')
    : `/** ${description} */\n`;
}

/**
 * @param {Array<[string, ArgTypeEntry]>} types
 * @returns {string}
 */
function buildInterface(types) {
  return types
    .map(
      ([name, { description, type }]) =>
        `${makeComment(description ?? '')}${name}: ${type};`
    )
    .join('\n');
}

/**
 * @param {StoriesDefinition} definition
 * @returns {string}
 */
function templateArgsInterface(definition) {
  const argsInterface = `Igc${definition.title.replace(/\s/g, '')}Args`;
  const types = /** @type {Array<[string, ArgTypeEntry]>} */ (
    Object.entries(definition.argTypes ?? {})
  );

  return types.length
    ? `interface ${argsInterface} {
      ${buildInterface(types)}
    }
  type Story = StoryObj<${argsInterface}>`
    : 'type Story = StoryObj';
}

/**
 * @param {string} name
 * @param {StoriesDefinition} definition
 * @returns {string}
 */
function template(name, definition) {
  return String.raw`
// region default
const metadata: Meta<${name}> =
${JSON.stringify(definition)}

export default metadata;

${templateArgsInterface(definition)}

// endregion`;
}

new StoriesBuilder({
  manifestPath: '../custom-elements.json',
  storiesPath: '../stories/',
})
  .build()
  .catch((error) => {
    report.error(
      `Stories build failed: ${error instanceof Error ? error.message : error}`
    );
    process.exit(1);
  });
