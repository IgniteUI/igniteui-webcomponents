const fs = require('fs');
const path = require('path');
const sass = require('sass');
const globby = require('globby');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);
const getDirName = path.dirname;
const makeDir = fs.mkdirSync;
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);
const renderSass = promisify(sass.render);


const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));
const THEMES_PATH = `src/styles/themes`;

async function buildThemes() {
  const paths = await globby(`${THEMES_PATH}/**/*.scss`);

  for (const sassFile of paths) {
    const result = await renderSass({
      file: sassFile,
      outputStyle: 'compressed'
    });

    let outCss = await postcss([autoprefixer]).process(result.css.toString()).css;
    if (outCss.charCodeAt(0) === 0xfeff) {
      outCss = outCss.substr(1);
    }

    const outputFile = DEST_DIR(sassFile.replace(/\.scss$/, '.css').replace('src/', ''));
    makeDir(getDirName(outputFile), { recursive: true });
    await writeFile(outputFile, outCss, 'utf-8');
  }
}


(async () => {
  await exec('npm run clean');

  console.info('Inlining styles...');
  await exec('npm run build:styles');

  console.info(`Building components...`);
  await exec(`tsc -p tsconfig.prod.json`);

  console.info(`Generating theme files...`);
  await buildThemes();

  console.info(`Generating custom-elements.json file...`);
  await exec(`npm run build:docs:schema`);
  await copyFile('custom-elements.json', DEST_DIR('custom-elements.json'));

  console.info(`Generating VSCode custom data file...`);
  await exec(`npm run build:docs:vscode-schema`);
  await copyFile('vscode-html-custom-data.json', DEST_DIR('vscode-html-custom-data.json'));

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
