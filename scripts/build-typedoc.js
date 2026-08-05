import { watch as fsWatch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { Application, OptionDefaults } from 'typedoc';
import report from './report.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const toPosix = (p) => p.replace(/\\/g, '/');
const ROOT = (...segments) =>
  toPosix(path.resolve(__dirname, '..', ...segments));

const TYPEDOC = {
  PLUGINS: {
    THEME: ROOT('node_modules', 'ig-typedoc-theme/dist/index.js'),
    LOCALIZATION: ROOT(
      'node_modules',
      'typedoc-plugin-localization/dist/index.js'
    ),
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

const serve = async () => {
  const server = await createServer({
    configFile: false,
    root: TYPEDOC.OUTPUT,
    appType: 'mpa',
    server: {
      port: 3000,
    },
  });
  await server.listen();
  server.printUrls();
  return server;
};

const buildTheme = async (app) => {
  const project = await app.convert();
  await app.generateDocs(project, TYPEDOC.OUTPUT);
};

const watchFunc = async (app) => {
  await buildTheme(app);
  const server = await serve();

  let debounceTimer = null;
  const filter = /\.(?:ts|js|scss|sass|hbs|png|jpg|gif)$/;

  fsWatch(ROOT('src'), { recursive: true }, (_, filename) => {
    if (!filename || !filter.test(filename)) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      await buildTheme(app);
      server.hot.send({ type: 'full-reload' });
    }, 1000);
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

  const app = await Application.bootstrapWithPlugins({
    entryPoints,
    entryPointStrategy,
    plugin: [TYPEDOC.PLUGINS.THEME, TYPEDOC.PLUGINS.LOCALIZATION],
    theme: 'igtheme',
    router: 'kind',
    excludePrivate: true,
    excludeProtected: true,
    blockTags: [
      ...OptionDefaults.blockTags,
      '@element',
      '@slot',
      '@fires',
      '@csspart',
      '@cssproperty',
      '@attr',
    ],
    suppressCommentWarningsInDeclarationFiles: true,
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
    default:
      throw new Error('Unrecognized action argument');
  }
}

try {
  await main();
} catch (e) {
  report.error(e.message ?? e.toString());
  process.exit(1);
}
