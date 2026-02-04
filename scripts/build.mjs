import { exec as _exec } from 'node:child_process';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { getWebTypesData } from 'custom-element-jet-brains-integration';
import {
  getVsCodeCssCustomData,
  getVsCodeHtmlCustomData,
} from 'custom-element-vs-code-integration';
import customElements from '../custom-elements.json' with { type: 'json' };
import report from './report.mjs';
import { buildComponents, buildThemes } from './sass.mjs';

const exec = promisify(_exec);

const DEST_DIR = path.join.bind(
  null,
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
);
const RELEASE_FILES = [
  'custom-elements.json',
  'CHANGELOG.md',
  'LICENSE',
  'README.md',
];

async function runTask(tag, cmd) {
  report.stdout.info(`[${tag}] Working...`);

  try {
    await cmd();
    report.stdout.clearLine();
    report.stdout.success(`[${tag}] Done\n`);
  } catch (e) {
    report.error(`[${tag}] Failed with: ${e.message}`);
  }
}

(async () => {
  await runTask('Clean up', () => exec('npm run clean'));
  await runTask('Component styles', () => buildComponents(true));
  await runTask('Themes', () => buildThemes(true));

  // https://github.com/microsoft/TypeScript/issues/14619
  await runTask('Components', () =>
    exec(
      'tsc -p scripts/tsconfig.prod.json && tsc -p scripts/tsconfig.dts.prod.json'
    )
  );

  await runTask('Copying release files', async () => {
    Promise.all([
      copyFile('scripts/_package.json', DEST_DIR('package.json')),
      ...RELEASE_FILES.map((file) => copyFile(file, DEST_DIR(file))),
    ]);
  });

  await runTask('VSCode custom data + Web types', () =>
    Promise.all([
      writeFile(
        DEST_DIR('igniteui-webcomponents.css-data.json'),
        getVsCodeCssCustomData(customElements, {
          hideCssPartsDocs: false,
          hideCssPropertiesDocs: false,
          hideLogs: true,
        }),
        'utf8'
      ),
      writeFile(
        DEST_DIR('igniteui-webcomponents.html-data.json'),
        getVsCodeHtmlCustomData(customElements, {
          hideMethodDocs: true,
          hideLogs: true,
        }),
        'utf8'
      ),
      writeFile(
        DEST_DIR('web-types.json'),
        getWebTypesData(customElements, {
          hideMethodDocs: true,
          hideCssPartsDocs: false,
          hideLogs: true,
        }),
        'utf8'
      ),
    ])
  );

  report.success('Done! 🎉');
})();
