// @ts-check

const fs = require('fs');
const path = require('path');
const util = require('util');
const prettier = require('prettier');
const report = require('./report');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

const VENDOR_PREFIX = 'igc-';
const SRC_DIR = path.resolve(__dirname, '../docs/json');
const DEST_DIR = path.resolve(__dirname, '../stories');

const REPLACE_REGEX = new RegExp(
  String.raw`// region default.*// endregion`,
  'gs'
);
const UNION_TYPE_REGEX = /^("\w+"|[\d-]+)\s\|/;
const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'Date'];

/**
 * @typedef ArgTypes
 * @prop {string} type
 * @prop {string} description
 *
 */

/**
 * @param {string[]} files
 */
function reportMissingFiles(files) {
  const msg = String.raw`
The following story files were not found:


${files.join('\n')}


Check if they are needed at all...`;
  report.warn(msg);
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

/**
 *
 * @param {string} value
 * @returns {string}
 */
function toPascalCase(value) {
  return (
    value
      .match(/[a-zA-Z0-9]+/g)
      ?.map(capitalize)
      .join('') ?? ''
  );
}

/**
 * Builds the story title based on the component tag.
 *
 * @param {string} tag
 * @returns {string}
 */
function storyTitle(tag, separator = '') {
  return tag.split('-').map(capitalize).join(separator);
}

/**
 * Fixes the TS types to appropriate controls in the storybook js presentation.
 *
 * @param {string} propType
 * @returns
 */
function fixControlProp(propType, options) {
  if (propType.startsWith('string')) {
    return 'text';
  }
  if (propType.startsWith('Date')) {
    return 'date';
  }
  if (propType.startsWith('number')) {
    return 'number';
  }

  if (options) {
    return {
      type: options.length > 4 ? 'select' : 'inline-radio',
    };
  }
  return propType;
}

/**
 *
 * @param {string} path
 * @returns
 */
async function processFileMeta(path) {
  let data = await readFile(path, 'utf8');
  data = await JSON.parse(data);
  return extractTags(data.tags[0]);
}

function isSupportedType(prop) {
  return (
    (prop.type &&
      !prop.deprecatedMessage &&
      SUPPORTED_TYPES.some(
        (type) => prop.type === type || prop.type.startsWith(`${type} `)
      )) ||
    UNION_TYPE_REGEX.test(prop.type)
  );
}

function fixDefaultValue(prop) {
  if (prop.default === undefined) {
    return undefined;
  }

  switch (prop.type) {
    case 'boolean':
      return prop.default === 'true' ? true : false;
    case 'number':
      return parseFloat(prop.default);
    case 'Date':
      return undefined;
    default:
      return prop.default.replace(/"/g, '');
  }
}

/**
 *
 * @param {object} meta
 * @returns
 */
function extractTags(meta) {
  return {
    component: meta.name,
    description: meta.description,
    argTypes: Array.from(meta.properties || [])
      .filter(isSupportedType)
      .map((prop) => {
        const options =
          UNION_TYPE_REGEX.test(prop.type) &&
          !SUPPORTED_TYPES.some(
            (type) => prop.type === type || prop.type.startsWith(`${type} `)
          )
            ? prop.type.split('|').map((part) => part.trim().replace(/"/g, ''))
            : undefined;
        return [
          prop.name,
          {
            type: prop.type,
            description: prop.description,
            options,
            control: fixControlProp(prop.type, options),
            defaultValue: fixDefaultValue(prop),
          },
        ];
      }),
  };
}

function setDefaultValue(props) {
  if ('defaultValue' in props) {
    return props.defaultValue;
  }
  switch (props.type) {
    case 'string':
      return '';
    case 'number':
      return 0;
  }
}

/**
 *
 * @param {string} description
 * @returns
 */
function buildComment(description) {
  if (!description) return '';
  const parts = description.split('\n');
  return parts.length > 1
    ? ['/**', ...parts.map((part) => `* ${part}`), '*/\n'].join('\n')
    : `/** ${description} */\n`;
}

function buildArgs(meta) {
  return Object.entries(meta.argTypes)
    .map(
      ([name, config]) =>
        `${buildComment(config.description)}${name}: ${config.type};`
    )
    .join('\n');
}

function buildTypes(component, meta) {
  return Object.entries(meta.argTypes).length
    ? `
interface ${component}Args {
  ${buildArgs(meta)}
}
type Story = StoryObj<${component}Args>;`
    : `type Story = StoryObj;`;
}

function buildStorySource(component, meta) {
  const componentName = toPascalCase(component);
  return String.raw`
// region default
const metadata: Meta<${componentName}Component> =
${JSON.stringify(meta)}

export default metadata;

${buildTypes(componentName, meta)}

// endregion
`;
}

/**
 *
 * @param {string} story
 * @param {object} meta
 * @returns
 */
async function buildStoryMeta(story, meta) {
  const storyMeta = {
    title: storyTitle(meta.component.replace(VENDOR_PREFIX, '')),
    component: meta.component,
    parameters: { docs: { description: { component: meta.description } } },
    argTypes: {},
    args: {},
  };

  meta.argTypes.forEach(([name, config]) => {
    storyMeta.args[name] = setDefaultValue(config);
    storyMeta.argTypes[name] = config;
  });

  const payload = await prettier.format(
    buildStorySource(meta.component, storyMeta),
    { singleQuote: true, parser: 'typescript' }
  );

  return story.toString().replace(REPLACE_REGEX, payload.trim());
}

async function buildStories() {
  const files = await readdir(SRC_DIR);
  const missing = [];

  for (const file of files) {
    const meta = await processFileMeta(path.join(SRC_DIR, file));
    const storyName = `${meta.component.replace(VENDOR_PREFIX, '')}.stories.ts`;
    const outFile = path.join(DEST_DIR, storyName);

    try {
      const story = await readFile(outFile, 'utf8');
      await writeFile(outFile, await buildStoryMeta(story, meta), 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') {
        missing.push(`\t${storyName}`);
      } else {
        report.error(e);
        process.exit(-1);
      }
    }
  }
  if (missing.length > 0) {
    reportMissingFiles(missing);
  }
}

(async () => {
  await buildStories();
  report.success('Stories metadata generation finished\n');
})();
