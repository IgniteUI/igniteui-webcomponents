import path from 'node:path';
import TypeDoc from 'typedoc';
import watch from 'node-watch';
import { create } from 'browser-sync';

const browserSync = create();
const ROOT = path.join.bind(null, path.resolve('./'));

const TYPEDOC = {
  PLUGINS: {
    THEME: ROOT('node_modules', 'ig-typedoc-theme'),
    LOCALIZATION: ROOT('node_modules', 'typedoc-plugin-localization'),
  },
  OUTPUT: ROOT('dist', 'docs', 'typescript'),
  EXPORT_JSON_PATH: ROOT(
    'dist',
    'docs',
    'typescript-exported',
    'ignite-ui-web-components.json'
  ),
  IMPORT_JSON_PATH: ROOT(
    'i18nRepo',
    'typedoc',
    'ja',
    'ignite-ui-web-components.json'
  ),
  PROJECT_PATH: ROOT('src', 'index.ts'),
  TEMPLATE_STRINGS_PATH: ROOT(
    'extras',
    'template',
    'strings',
    'shell-strings.json'
  ),
};

const browserReload = async () => browserSync.reload();

const serve = async () => {
  const config = {
    server: {
      baseDir: TYPEDOC.OUTPUT,
    },
    port: 3000,
  };
  browserSync.init(config);
};

const buildTheme = async (app) => {
  const project = await app.convert();
  await app.generateDocs(project, TYPEDOC.OUTPUT);
};

const watchFunc = async (app) => {
  const options = {
    delay: 1000,
    recursive: true,
    filter: (path) => {
      return /.(?:ts|js|scss|sass|hbs|png|jpg|gif)$/.test(path);
    },
  };

  await buildTheme(app);
  await serve();

  watch([ROOT('src')], options, async () => {
    await buildTheme(app);
    await browserReload();
  });
};

async function main() {
  if (process.argv.length < 3) {
    throw new Error('No action argument provided');
  }

  const product = 'ignite-ui-web-components';
  const action = process.argv[2];
  const locale = action === 'buildJA' ? 'jp' : 'en';

  let entryPoints = TYPEDOC.PROJECT_PATH;
  let entryPointStrategy = 'resolve';

  if (locale === 'jp') {
    entryPoints = TYPEDOC.IMPORT_JSON_PATH;
    entryPointStrategy = 'merge';
  }

  if (action === 'import') {
    entryPoints = TYPEDOC.EXPORT_JSON_PATH;
    entryPointStrategy = 'merge';
  }

  const app = await TypeDoc.Application.bootstrapWithPlugins({
    entryPoints,
    entryPointStrategy,
    plugin: [TYPEDOC.PLUGINS.THEME, TYPEDOC.PLUGINS.LOCALIZATION],
    theme: 'igtheme',
    excludePrivate: true,
    excludeProtected: true,
    name: 'Ignite UI for Web Components',
    readme: 'none',
  });

  if (locale === 'jp') {
    app.options.setValue('templateStrings', TYPEDOC.TEMPLATE_STRINGS_PATH);
  }

  app.options.setValue('localize', locale);
  app.options.setValue('product', product);

  if (action === 'watch') {
    return watchFunc(app);
  }

  const project = await app.convert();

  switch (action) {
    case 'export':
      await app.generateJson(project, TYPEDOC.EXPORT_JSON_PATH);
      break;
    case 'import':
    case 'buildEN':
    case 'buildJA':
      await app.generateDocs(project, TYPEDOC.OUTPUT);
      break;
    case 'serve':
      await app.generateDocs(project, TYPEDOC.OUTPUT);
      await serve();
      break;
    case 'default':
      throw new Error('Unrecognized action argument');
  }
}

main().catch(console.error);
