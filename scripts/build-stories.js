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

const REPLACE_REGEX = /\/\/ region default.*\/\/ endregion/gs;
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
 *
 * @param {*} string
 */
const toPascalCase = (string) =>
  string
    .match(/[a-zA-Z0-9]+/g || [])
    .map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`)
    .concat(['Component'])
    .join('');

const capitalize = (str) => {
  const arr = str.split('-');

  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }

  return arr.join(' ');
};

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
      SUPPORTED_TYPES.some(
        (type) => prop.type === type || prop.type.startsWith(`${type} `)
      )) ||
    UNION_TYPE_REGEX.test(prop.type)
  );
}

/**
 *
 * @param {object} meta
 * @returns
 */
function extractTags(meta) {
  return {
    component: meta.name,
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
            defaultValue: prop.default
              ? prop.type === 'boolean'
                ? prop.default === 'true'
                : prop.type === 'Date'
                ? undefined
                : prop.default.replace(/"/g, '')
              : undefined,
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
 * @param {Buffer} story
 * @param {object} meta
 * @returns
 */
function buildStoryMeta(story, meta) {
  const storyMeta = {
    title: capitalize(meta.component.replace(VENDOR_PREFIX, '')),
    component: meta.component,
    argTypes: {},
    args: {},
  };

  meta.argTypes.forEach(
    (arg) => (storyMeta.args[arg[0]] = setDefaultValue(arg[1]))
  );
  meta.argTypes.forEach((arg) => (storyMeta.argTypes[arg[0]] = arg[1]));
  let payload = `// region default\nconst metadata: Meta<${toPascalCase(
    meta.component
  )}> = ${JSON.stringify(
    storyMeta,
    undefined,
    2
  )}\nexport default metadata;\n type Story = StoryObj & typeof metadata;\n\n// endregion`;

  payload = prettier
    .format(payload, { singleQuote: true, parser: 'babel' })
    .trim();

  return story.toString().replace(REPLACE_REGEX, payload);
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
      await writeFile(outFile, buildStoryMeta(story, meta), 'utf8');
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
