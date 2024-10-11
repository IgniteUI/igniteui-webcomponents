// @ts-check
import { exec } from 'node:child_process';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { format } from 'prettier';

const execAsync = promisify(exec);

/**
 * @typedef {object} Config
 * @property {string} manifestPath
 * @property {string} storiesPath
 */

/**
 * @typedef {object} CEMSchema
 * @property {ModuleDeclaration[]} modules
 */

/**
 * @typedef {object} ModuleDeclaration
 * @property {CustomElementDeclaration[]} declarations
 */

/**
 * @typedef {object} CustomElementProperty
 * @property {'field' | 'method'} kind
 * @property {'private' | 'protected' | 'public'} privacy
 * @property {string} name
 * @property {string} description
 * @property {string=} attribute
 * @property {string=} default
 * @property {{ text: string }=} type
 * @property {{ text: string }=} expandedType
 * @property {{ name: string }=} inheritedFrom
 * @property {boolean=} static
 * @property {boolean=} readonly
 * @property {boolean=} deprecated
 */

/**
 * @typedef {object} CustomElementDeclaration
 * @property {'class' | 'mixin'} kind
 * @property {string} name
 * @property {string} description
 * @property {string=} tagName
 * @property {CustomElementProperty[]} members;
 * @property {{ name: string }[]=} events;
 */

/**
 *
 * @param {object} object
 */
function isDefined(object) {
  return object !== undefined;
}

/**
 *
 * @param {string} type
 */
function isUnion(type) {
  return type.includes('|');
}

/**
 *
 * @param {string} name
 */
function prettifyName(name) {
  return name.replace(/igc|component/gi, '');
}

class StoriesBuilder {
  /** @type {Config} */
  #config;

  /** @type {Map<string, CustomElementDeclaration>} */
  #cache = new Map();

  /** @type string */
  #tempDir;

  /**
   *
   * @param {string} parentName
   * @param {string} name
   * @returns {CustomElementProperty=}
   */
  #getMemberFrom(parentName, name) {
    return this.#cache
      .get(parentName)
      ?.members.find((member) => member.name === name);
  }

  /**
   *
   * @param {CustomElementProperty} property
   */
  #resolveType(property) {
    let type = 'string';

    if (property.expandedType) {
      type = property.expandedType.text;
    } else if (property.type) {
      type = property.type.text;
    } else if (property.inheritedFrom) {
      const parentProperty = this.#getMemberFrom(
        property.inheritedFrom.name,
        property.name
      );
      type = parentProperty ? this.#resolveType(parentProperty) : 'string';
    }

    const result = [];

    const isArray = (type) => type.includes('[]');
    const isGeneric = (type) => type.match(/<.*>/);

    const t = type.split('|').map((t) => {
      const part = t.trim().replace(/'/g, '"');
      if (
        part &&
        !part.match(/undefined|null/) &&
        !isArray(part) &&
        !isGeneric(part)
      ) {
        result.push(part);
      }
    });

    return result.join(' | ');
  }

  /**
   *
   * @param {string} type
   */
  #resolveOptions(type) {
    return isUnion(type)
      ? type.split('|').map((t) => {
          const part = t.trim();
          if (part && !part.match(/undefined|null/)) {
            return part.replace(/"|'/g, '');
          }
        })
      : undefined;
  }

  /**
   *
   * @param {string} type
   * @param {(string | undefined)[]=} options
   */
  #resolveControl(type, options) {
    if (type.startsWith('string')) {
      return 'text';
    }

    if (type.startsWith('number')) {
      return 'number';
    }

    if (type.startsWith('Date')) {
      return 'date';
    }

    if (options) {
      return { type: options.length > 3 ? 'select' : 'inline-radio' };
    }

    return type;
  }

  /**
   *
   * @param {string} type
   * @param {string} value
   */
  #resolveDefaultValue(type, value) {
    const valueDefined = isDefined(value);

    switch (type) {
      case 'boolean':
        return valueDefined ? value === 'true' : false;
      case 'number':
        return valueDefined ? Number.parseFloat(value) : undefined;
      default:
        return valueDefined ? value.replace(/"|'/g, '') : undefined;
    }
  }

  /**
   *
   * @param {Config} config
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * @returns {Promise<CEMSchema>}
   */
  async #parseManifest() {
    const file = new URL(this.#config.manifestPath, import.meta.url);
    try {
      return JSON.parse(await readFile(file, 'utf8'));
    } catch {
      await execAsync('npm run cem');
      return JSON.parse(await readFile(file, 'utf8'));
    }
  }

  /**
   *
   * @param {ModuleDeclaration[]} modules
   */
  #makeCache(modules) {
    for (const { declarations } of modules) {
      if (!declarations.length) {
        continue;
      }

      for (const candidate of declarations) {
        if (candidate.kind.match(/mixin|class/)) {
          this.#cache.set(candidate.name, candidate);
        }
      }
    }
  }

  async #createTmpDir() {
    this.#tempDir = await mkdtemp(join(tmpdir(), 'igc-'));
  }

  async #clearTmpDir() {
    rm(this.#tempDir, { recursive: true, force: true });
  }

  async #createDefinitions() {
    await this.#createTmpDir();
    await Promise.all(
      Array.from(this.#cache.values())
        .filter((element) => element.tagName)
        .map((element) =>
          this.#writeStory(element.name, this.#makeDefinition(element))
        )
    );
  }

  /**
   *
   * @param {CustomElementProperty[]} properties
   */
  #makeArgs(properties) {
    const argTypes = {};
    const args = {};

    for (const property of properties) {
      const parsed = {};
      const type = this.#resolveType(property);

      if (type) {
        parsed.type = type;
      } else {
        continue;
      }

      const options = this.#resolveOptions(type);
      const control = this.#resolveControl(type, options);
      // @ts-ignore
      const defaultValue = this.#resolveDefaultValue(type, property.default);

      if (property.description) {
        parsed.description = property.description;
      }

      if (options) {
        parsed.options = options;
      }
      if (control) {
        parsed.control = control;
      }
      if (isDefined(defaultValue)) {
        parsed.table = { defaultValue: { summary: defaultValue?.toString() } };
      }

      argTypes[property.name] = parsed;

      if (isDefined(defaultValue)) {
        args[property.name] = defaultValue;
      }
    }

    return { args, argTypes };
  }

  /**
   *
   * @param {CustomElementDeclaration} customElement
   * @returns
   */
  #makeDefinition(customElement) {
    const { description, name, events } = customElement;
    const { args, argTypes } = this.#makeArgs(getMembers(customElement));

    const actions = events
      ? events.map(({ name }) => name).filter(Boolean)
      : undefined;

    const result = {
      title: prettifyName(name),
      component: customElement.tagName,
      parameters: {
        docs: { description: { component: description } },
      },
    };

    if (actions?.length) {
      result.parameters.actions = { handles: actions };
    }
    if (Object.keys(argTypes).length) {
      result.argTypes = argTypes;
    }
    if (Object.keys(args).length) {
      result.args = args;
    }

    return result;
  }

  /**
   *
   * @param {string} component
   */
  #getFilePath(component) {
    const name = `${component.replace(/igc-|component/gi, '')}.stories.ts`;
    return new URL(join(this.#config.storiesPath, name), import.meta.url);
  }

  async #writeStory(name, definition) {
    const file = this.#getFilePath(definition.component);
    const tmpFile = join(this.#tempDir, `${name}.ts`);
    let data = '';

    try {
      data = await readFile(file, 'utf8');
    } catch (e) {
      return;
    }

    const storyMeta = (
      await format(template(name, definition), {
        singleQuote: true,
        parser: 'typescript',
      })
    ).trim();

    await writeFile(
      tmpFile,
      data.replace(/\/\/ region default.*\/\/ endregion/gs, storyMeta),
      {
        encoding: 'utf8',
        flush: true,
      }
    );

    await copyFile(tmpFile, file);
  }

  async build() {
    const { modules } = await this.#parseManifest();
    this.#makeCache(modules);
    await this.#createDefinitions();
    await this.#clearTmpDir();
  }
}

/**
 *
 * @param {string} description
 */
function makeComment(description) {
  if (!description) return '';
  const parts = description.split('\n');
  return parts.length > 1
    ? ['/**', ...parts.map((part) => `* ${part}`), '*/\n'].join('\n')
    : `/** ${description} */\n`;
}

function buildInterface(types) {
  return types
    .map(
      ([name, { description, type }]) =>
        `${makeComment(description)}${name}: ${type};`
    )
    .join('\n');
}

function templateArgsInterface(definition) {
  const argsInterface = `Igc${definition.title.replace(/\s/g, '')}Args`;
  const types = Array.from(Object.entries(definition.argTypes ?? {}));

  return types.length
    ? `interface ${argsInterface} {
      ${buildInterface(types)}
    }
  type Story = StoryObj<${argsInterface}>`
    : 'type Story = StoryObj';
}

function template(name, definition) {
  return String.raw`
// region default
const metadata: Meta<${name}> =
${JSON.stringify(definition)}

export default metadata;

${templateArgsInterface(definition)}

// endregion`;
}

/**
 *
 * @param {CustomElementDeclaration} element
 */
function getMembers(element) {
  return element.members.filter(
    (member) =>
      member.privacy === 'public' &&
      member.kind === 'field' &&
      member.attribute &&
      !member.static &&
      !member.readonly &&
      !member.deprecated
  );
}

new StoriesBuilder({
  manifestPath: '../custom-elements.json',
  storiesPath: '../stories/',
}).build();
