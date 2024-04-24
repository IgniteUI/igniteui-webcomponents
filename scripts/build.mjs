import { exec as _exec } from 'node:child_process';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { generateJetBrainsWebTypes } from 'custom-element-jet-brains-integration';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';
import customElements from '../custom-elements.json' assert { type: 'json' };
import { buildThemes } from './build-styles.mjs';
import report from './report.mjs';

const exec = promisify(_exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));

async function runTask(cmd, tag) {
  report.info(`[${tag}] Building...`);
  try {
    await cmd();
    report.success(`[${tag}] Done`);
  } catch (e) {
    report.error(`[${tag}] Failed with: ${e}`);
  }
}

(async () => {
  await exec('npm run clean');

  await runTask(exec.bind(null, 'npm run build:styles'), 'Styles');

  // https://github.com/microsoft/TypeScript/issues/14619
  console.info('Building components...');
  await exec(
    'tsc -p scripts/tsconfig.prod.json && tsc -p scripts/tsconfig.dts.prod.json'
  );

  console.info('Generating theme files...');
  await buildThemes();

  console.info('Generating custom-elements.json file...');
  await exec('npm run cem');
  await copyFile('custom-elements.json', DEST_DIR('custom-elements.json'));

  console.info('Generating package.json...');
  await copyFile('scripts/_package.json', DEST_DIR('package.json'));

  console.info('Copying CHANGELOG.md...');
  await copyFile('CHANGELOG.md', DEST_DIR('CHANGELOG.md'));

  console.info('Copying LICENSE...');
  await copyFile('LICENSE', DEST_DIR('LICENSE'));

  console.info('Copying README.md...');
  await copyFile('README.md', DEST_DIR('README.md'));

  console.log('Done! 🎉');
})();
