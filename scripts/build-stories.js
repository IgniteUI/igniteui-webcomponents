const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);

const VENDOR_PREFIX = 'igc-';
const SRC_DIR = path.resolve(__dirname, '../docs/json');
const DEST_DIR = path.resolve(__dirname, '../stories');

const REPLACE_REGEX = /\/\/ region default.*\/\/ endregion/gs;
const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'Date'];

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
  if (propType === 'string') { return 'text'; }
  if (propType === 'Date') { return 'date'; }
  if (options) {
    return {
      type: options.length > 4 ? 'select': 'inline-radio',
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
    args: Array.from(meta.properties)
      .filter(prop =>
        SUPPORTED_TYPES.includes(prop.type) ||
        (prop.type.includes('|') && prop.type.startsWith('"')))
      .map(prop => {
        const options = prop.type.includes('|') ?
          prop.type.split('|').map(part => part.trim().replace(/"/g, '')) :
          undefined;
        return [
          prop.name,
          {
            type: prop.type,
            description: prop.description,
            options,
            control: fixControlProp(prop.type, options),
            table: prop.default ?
            {
              defaultValue: { summary: prop.type === 'boolean' ? prop.default === 'true' :
                prop.type === 'Date' ? undefined : prop.default.replace(/"/g, '') }
            } : undefined,
          }
        ]
      })
  };
}

const buildArgTypes = (meta, indent="  ") => ['interface ArgTypes {', ...meta.args.map(arg => `${indent}${arg[0]}: ${arg[1].type};`), '}'].join('\n');

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
    argTypes: {}
  };

  meta.args.forEach(arg => storyMeta.argTypes[arg[0]] = arg[1]);
  const payload = `// region default\nconst metadata = ${JSON.stringify(storyMeta, undefined, 2)}\nexport default metadata;\n${buildArgTypes(meta)}\n// endregion`;

  return story.toString().replace(REPLACE_REGEX, payload);
}

async function buildStories() {
  const files = await readdir(SRC_DIR);

  for (const file of files) {
    const meta = await processFileMeta(path.join(SRC_DIR, file));
    const outFile = path.join(DEST_DIR, `${meta.component.replace(VENDOR_PREFIX, '')}.stories.ts`);
    let story;

    try {
      story = await readFile(outFile, 'utf8');
    } catch {
      continue;
    }

    try {
      await writeFile(outFile, buildStoryMeta(story, meta), 'utf8');
    } catch (e) {
      console.error(e);
      process.exit(-1);
    }
  }

}



( async () => {
  buildStories();
  console.log('Stories metadata generation finished');
})();
