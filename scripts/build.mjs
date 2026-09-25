import { exec as _exec } from 'node:child_process';
import { copyFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify, styleText } from 'node:util';
import { getWebTypesData } from 'custom-element-jet-brains-integration';
import {
  getVsCodeCssCustomData,
  getVsCodeHtmlCustomData,
} from 'custom-element-vs-code-integration';
import customElements from '../custom-elements.json' with { type: 'json' };
import report from './report.mjs';
import { buildAll } from './sass.mjs';

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

function spin(tag) {
  const frames = ['◑', '◒', '◐', '◓'];
  let frame = 0;

  const writeProgress = () =>
    report.stdout.plain(
      `\r${styleText('magentaBright', frames[frame])}  ${tag}`
    );

  writeProgress();

  return setInterval(() => {
    frame = (frame + 1) % frames.length;
    writeProgress();
  }, 120);
}

async function runTask(tag, cmd) {
  const timer = report.stdout.isTTY ? spin(tag) : undefined;

  try {
    await cmd();
    clearInterval(timer);
    report.stdout.clearLine();
    report.stdout.plain(styleText('greenBright', `[${tag}] ✔\n`));
  } catch (e) {
    clearInterval(timer);
    report.stdout.clearLine();
    report.error(`[${tag}] ✖\n${e.stderr || e.message}`);
    process.exit(1);
  }
}

(async () => {
  await runTask('Clean up', () => exec('npm run clean'));
  await runTask('Styles', () => buildAll(true));

  // Two passes with disjoint outputs, because one invocation cannot emit JS with
  // comments stripped and declarations with them intact:
  // https://github.com/microsoft/TypeScript/issues/14619
  await runTask('Components', () =>
    Promise.all([
      exec('tsc -p scripts/tsconfig.prod.json'),
      exec('tsc -p scripts/tsconfig.dts.prod.json'),
    ])
  );

  await runTask('Copying release files', async () => {
    await Promise.all([
      copyFile('scripts/_package.json', DEST_DIR('package.json')),
      ...RELEASE_FILES.map((file) => copyFile(file, DEST_DIR(file))),
    ]);
  });

  await runTask(
    'VSCode custom data + Web types',
    async () =>
      await Promise.all([
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

  await runTask('Copying skills directory', async () => {
    await cp('skills', DEST_DIR('skills'), { recursive: true });
  });

  report.success('\n🎉 Done! 🎉');
})();
