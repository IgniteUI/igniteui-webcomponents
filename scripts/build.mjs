import path from 'node:path';
import { exec as _exec } from 'node:child_process';
import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { generateVsCodeCustomElementData } from 'custom-element-vs-code-integration';
import { generateJetBrainsWebTypes } from 'custom-element-jet-brains-integration';
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
  await runTask(
    exec.bind(
      null,
      `tsc -p scripts/tsconfig.prod.json && tsc -p scripts/tsconfig.dts.prod.json`
    ),
    'Components'
  );

  await runTask(buildThemes, 'Themes');

  await runTask(
    copyFile.bind(
      null,
      'custom-elements.json',
      DEST_DIR('custom-elements.json')
    ),
    'custom-elements.json'
  );

  await runTask(
    generateVsCodeCustomElementData.bind(null, customElements, {
      outdir: 'dist',
      cssFileName: 'igniteui-webcomponents.css-custom-data.json',
      htmlFileName: 'igniteui-webcomponents.html-custom-data.json',
    }),
    'VSCode custom data'
  );

  await runTask(
    generateJetBrainsWebTypes.bind(null, customElements, { outdir: 'dist' }),
    'JetBrains web types'
  );

  await runTask(
    copyFile.bind(null, 'scripts/_package.json', DEST_DIR('package.json')),
    'package.json'
  );

  await runTask(
    copyFile.bind(null, 'CHANGELOG.md', DEST_DIR('CHANGELOG.md')),
    'CHANGELOG'
  );

  await runTask(copyFile.bind(null, 'LICENSE', DEST_DIR('LICENSE')), 'LICENSE');

  await runTask(
    copyFile.bind(null, 'README.md', DEST_DIR('README.md')),
    'README'
  );

  report.success('Done! 🎉');
})();
