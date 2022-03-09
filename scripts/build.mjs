import path from 'path';
import { mkdirSync as makeDir } from 'fs';
import { copyFile, writeFile } from 'fs/promises';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { globby } from 'globby';
import sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

const exec = promisify(_exec);
const renderSass = promisify(sass.render);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));
const THEMES_PATH = `src/styles/themes`;

async function buildThemes() {
  const paths = await globby(`${THEMES_PATH}/{light,dark}/*.scss`);

  for (const sassFile of paths) {
    const result = await renderSass({
      file: sassFile,
      outputStyle: 'compressed',
    });

    let outCss = await postcss([autoprefixer]).process(result.css.toString())
      .css;
    if (outCss.charCodeAt(0) === 0xfeff) {
      outCss = outCss.substring(1);
    }

    const outputFile = DEST_DIR(
      sassFile.replace(/\.scss$/, '.css').replace('src/styles/', '')
    );
    makeDir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, outCss, 'utf-8');
  }
}

(async () => {
  await exec('npm run clean');

  console.info('Inlining styles...');
  await exec('npm run build:styles');

  // https://github.com/microsoft/TypeScript/issues/14619
  console.info(`Building components...`);
  await exec(
    `tsc -p scripts/tsconfig.prod.json && tsc -p scripts/tsconfig.dts.prod.json`
  );

  console.info(`Generating theme files...`);
  await buildThemes();

  console.info(`Generating custom-elements.json file...`);
  await exec(`npm run build:docs:schema`);
  await copyFile('custom-elements.json', DEST_DIR('custom-elements.json'));

  console.info(`Generating VSCode custom data file...`);
  await exec(`npm run build:docs:vscode-schema`);
  await copyFile(
    'vscode-html-custom-data.json',
    DEST_DIR('vscode-html-custom-data.json')
  );

  console.info(`Generating package.json...`);
  await copyFile('scripts/_package.json', DEST_DIR('package.json'));

  console.info(`Copying CHANGELOG.md...`);
  await copyFile('CHANGELOG.md', DEST_DIR('CHANGELOG.md'));

  console.info(`Copying LICENSE...`);
  await copyFile('LICENSE', DEST_DIR('LICENSE'));

  console.info(`Copying README.md...`);
  await copyFile('README.md', DEST_DIR('README.md'));

  console.log(`Done! 🎉`);
})();
