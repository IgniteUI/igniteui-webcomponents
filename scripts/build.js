const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);
const copyFile = promisify(fs.copyFile);


const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));


(async () => {
  await exec('npm run clean');

  console.info('Inlining styles...');
  await exec('npm run build:styles');

  console.info(`Building...`);
  await exec(`tsc -p tsconfig.prod.json`);

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
