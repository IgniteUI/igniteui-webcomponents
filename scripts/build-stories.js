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

function reportMissingFiles(files) {
  const msg = String.raw`
The following story files were not found:


${files.join('\n')}


Check if they are needed at all...`;
  report.warn(msg);
}

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

/**
 *
 * @param {object} meta
 * @returns
 */
function extractTags(meta) {
  return {
    component: meta.name,
    args: Array.from(meta.properties || [])
      .filter(
        (prop) =>
          prop.type &&
          (SUPPORTED_TYPES.some(
            (type) => prop.type === type || prop.type.startsWith(`${type} `)
          ) ||
            UNION_TYPE_REGEX.test(prop.type))
      )
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

const buildArgTypes = (meta, indent = '  ') => {
  // Skip ArgTypes for "dumb" components.
  if (!meta.args.length) {
    return '';
  }

  return [
    'interface ArgTypes {',
    ...meta.args.map(([name, obj]) => `${indent}${name}: ${obj.type};`),
    '}',
  ].join('\n');
};

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
  };

  meta.args.forEach((arg) => (storyMeta.argTypes[arg[0]] = arg[1]));
  let payload = `// region default\nconst metadata = ${JSON.stringify(
    storyMeta,
    undefined,
    2
  )}\nexport default metadata;\n${buildArgTypes(meta)}\n// endregion`;

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
