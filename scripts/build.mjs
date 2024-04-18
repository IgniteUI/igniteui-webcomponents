import { exec as _exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { copyFile } from 'fs/promises';
import { buildThemes } from './build-styles.mjs';

const exec = promisify(_exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));

(async () => {
  await exec('npm run clean');

  console.info('Building styles...');
  await exec('npm run build:styles');

  // https://github.com/microsoft/TypeScript/issues/14619
  console.info(`Building components...`);
  await exec(
    `tsc -p scripts/tsconfig.prod.json && tsc -p scripts/tsconfig.dts.prod.json`
  );

  console.info(`Generating theme files...`);
  await buildThemes();

  console.info(`Generating custom-elements.json file...`);
  await exec(`npm run cem`);
  await copyFile('custom-elements.json', DEST_DIR('custom-elements.json'));

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
