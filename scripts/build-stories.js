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
const STRIP_QUOTES = /("\\"|\\"")/gi;

const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;


/**
 * Fixes the TS types to appropriate controls in the storybook js presentation.
 *
 * @param {string} controlMeta
 * @returns
 */
function fixControlProp(controlMeta) {
  if (controlMeta === 'string') { return 'text'; }
  if (controlMeta.includes('|')) {
    const options = controlMeta.split('|').map(part => part.trim());
    return {
        type: options.length > 3 ? 'select': 'inline-radio',
        options
    };
  }
  return controlMeta;
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
    args: Array.from(meta.attributes, attr => [attr.name, {
      description: attr.description,
      defaultValue: attr.default,
      control: fixControlProp(attr.type)
    }])
  };
}

const writeControl = (control) => control.options ? control.options.join(' | ').replace(/"/g, "'") : control.replace(/text/g, 'string');
const buildArgTypes = (meta, indent="  ") => ['interface ArgTypes {', ...meta.args.map(arg => `${indent}${arg[0]}: ${writeControl(arg[1].control)};`), '}'].join('\n');

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
  const payload = `// region default\nexport default ${JSON.stringify(storyMeta, undefined, 2)}\n${buildArgTypes(meta)}\n// endregion`.replace(STRIP_QUOTES, "'");

  return story.toString().replace(REPLACE_REGEX, payload);
}

async function buildStories() {
  const files = await readdir(SRC_DIR);

  for (const file of files) {
    const meta = await processFileMeta(path.join(SRC_DIR, file));
    const outFile = path.join(DEST_DIR, `${meta.component.replace(VENDOR_PREFIX, '')}.stories.ts`);
    try {
      const story = await readFile(outFile, 'utf8');
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
