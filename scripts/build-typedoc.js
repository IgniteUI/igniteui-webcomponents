const path = require('path');
const watch = require('node-watch');
const { promisify } = require('util');
const browserSync = require('browser-sync').create();
const exec = promisify(require('child_process').exec);

const ROOT = path.join.bind(null, path.resolve('./'));

const TYPEDOC_THEME = {
  SRC: ROOT('node_modules', 'igniteui-typedoc-theme'),
  OUTPUT: ROOT('dist', 'docs', 'typescript')
};
const TYPEDOC = {
  EXPORT_JSON_PATH: ROOT('dist', 'docs', 'typescript-exported'),
  PROJECT_PATH: ROOT('src', 'index.ts'),
  TEMPLATE_STRINGS_PATH: ROOT('extras', 'template', 'strings', 'shell-strings.json')
};


const browserReload = async () => browserSync.reload();

const serve = async () => {
  const config = {
    server: {
      baseDir: TYPEDOC_THEME.OUTPUT
    },
    port: 3000
  };
  browserSync.init(config);
};

const watchFunc = async () => {
  const options = {
    delay: 1000,
    recursive: true,
    filter: (path) => {
      return /.(?:ts|js|scss|sass|hbs|png|jpg|gif)$/.test(path);
    }
  };

  watch([TYPEDOC_THEME.SRC], options, async (event, path) => {
    await buildTheme();
    await browserReload();
  });
};

const buildTheme = async () => {
  await exec(`typedoc ${TYPEDOC.PROJECT_PATH} --tsconfig ${ROOT('tsconfig.json')}`, { shell: true });
};

const exportJSON = async () => {
  const args = [
    TYPEDOC.PROJECT_PATH,
    '--generate-json',
    TYPEDOC.EXPORT_JSON_PATH,
    '--tags',
    '--params',
    '--tsconfig',
    ROOT('tsconfig.json')
  ].join(' ');

  await exec(`typedoc ${args}`, { shell: true });
};

const importJSON = async () => {
  const args = [
    TYPEDOC.PROJECT_PATH,
    '--generate-from-json',
    TYPEDOC.EXPORT_JSON_PATH,
    '--warns',
    '--tsconfig',
    ROOT('tsconfig.json')
  ].join(' ');

  await exec(`typedoc ${args}`, { shell: true });
};

const buildJA = async () => {
  const args = [
    TYPEDOC.PROJECT_PATH,
    '--generate-from-json',
    ROOT('i18nRepo', 'typedoc', 'ja'),
    '--templateStrings',
    TYPEDOC.TEMPLATE_STRINGS_PATH,
    '--warns',
    '--localize',
    'jp',
    '--tsconfig',
    ROOT('tsconfig.json')
  ].join(' ');

  await exec(`typedoc ${args}`, { shell: true });
}

const buildEN = async () => {
  const args = [
    TYPEDOC.PROJECT_PATH,
    '--localize',
    'en',
    "--tsconfig",
    ROOT('tsconfig.json')
  ].join(' ');

  await exec(`typedoc ${args}`, { shell: true });
};


(async () => {
  if (process.argv.length < 3) {
    throw new Error('No action argument provided');
  }

  const action = process.argv[2];

  switch (action) {
    case 'export':
      await exportJSON();
      break;
    case 'import':
      await importJSON();
      break;
    case 'serve':
      await buildTheme();
      await serve();
      break;
    case 'watch':
      await watchFunc();
      break;
    case 'buildJA':
      await buildJA();
      break;
    case 'buildEN':
      await buildEN();
      break;
    default:
      throw new Error('Unrecognized action argument');
  }
})();
