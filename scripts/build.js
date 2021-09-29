const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);
const copyFile = promisify(fs.copyFile);


const DEST_DIR = path.resolve(__dirname, '../dist');


(async () => {
  await exec('npm run clean');

  console.log('Inlining styles...');
  await exec('npm run build:styles');

  console.log(`Transpiling...`);
  await exec(`tsc -p tsconfig.prod.json`);

  console.log(`Generating custom-elements.json file...`);
  await exec(`npm run build:docs:schema`);
  await copyFile('custom-elements.json', path.join(DEST_DIR, 'custom-elements.json'));

  console.log(`Generating VSCode custom data file...`);
  await exec(`npm run build:docs:vscode-schema`);
  await copyFile('vscode-html-custom-data.json', path.join(DEST_DIR, 'vscode-html-custom-data.json'));

  console.log(`Copying package.json and README...`);
  await copyFile('scripts/_package.json', path.join(DEST_DIR, 'package.json'));

  console.log(`Done! 🎉`);
 })();
