import { globby } from 'globby';
import report from './report.js';
import { sassRender, template, postProcessor } from './sass.mjs';
import path from 'path';
import { mkdirSync as makeDir } from 'fs';
import * as sass from 'sass';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

const renderSass = sass.compile;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));
const THEMES_PATH = `src/styles/themes`;

export async function buildThemes() {
  const paths = await globby(`${THEMES_PATH}/{light,dark}/*.scss`);

  for (const sassFile of paths) {
    const result = renderSass(sassFile, {
      style: 'compressed',
      loadPaths: ['node_modules', 'src']
    });

    let outCss = postProcessor.process(result.css).css;
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
  const startTime = new Date();
  const paths = await globby([
    'src/components/**/*.base.scss',
    'src/components/**/*.common.scss',
    'src/components/**/*.material.scss',
    'src/components/**/*.bootstrap.scss',
    'src/components/**/*.indigo.scss',
    'src/components/**/*.fluent.scss',
  ]);

  for (const sourceFile of paths) {
    const output = sourceFile.replace(/\.scss$/, '.css.ts');
    await sassRender(sourceFile, template, output).catch((err) => {
      report.error(err);
      process.exit(-1);
    });
  }

  report.success(
    `Styles generated in ${Math.round((Date.now() - startTime) / 1000)}s`
  );
})();
