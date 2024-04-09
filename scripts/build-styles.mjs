import { globby } from 'globby';
import report from './report.mjs';
import { fromTemplate, compileSass } from './sass.mjs';
import path from 'node:path';
import { mkdirSync as makeDir } from 'node:fs';
import * as sass from 'sass-embedded';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.join.bind(null, path.resolve(__dirname, '../dist'));

export async function buildThemes() {
  const compiler = await sass.initAsyncCompiler();
  const paths = await globby(`src/styles/themes/{light,dark}/*.scss`);

  for (const sassFile of paths) {
    const css = await compileSass(sassFile, compiler);

    const outputFile = DEST_DIR(
      sassFile.replace(/\.scss$/, '.css').replace('src/styles/', '')
    );
    makeDir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, css, 'utf-8');
  }

  await compiler.dispose();
}

(async () => {
  const compiler = await sass.initAsyncCompiler();
  const start = performance.now();

  const paths = await globby([
    'src/components/**/*.base.scss',
    'src/components/**/*.common.scss',
    'src/components/**/*.shared.scss',
    'src/components/**/*.material.scss',
    'src/components/**/*.bootstrap.scss',
    'src/components/**/*.indigo.scss',
    'src/components/**/*.fluent.scss',
  ]);

  try {
    await Promise.all(
      paths.map(async (path) => {
        writeFile(
          path.replace(/\.scss$/, '.css.ts'),
          fromTemplate(await compileSass(path, compiler)),
          'utf8'
        );
      })
    );
  } catch (err) {
    await compiler.dispose();
    report.error(err);
    process.exit(1);
  }

  await compiler.dispose();

  report.success(
    `Styles generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
  );
})();
