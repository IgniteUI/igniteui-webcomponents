import path from 'path';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import sass from 'sass';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import report from './report.js';

const renderSass = promisify(sass.render);

async function sassToCss(sassFile) {
  const result = await renderSass({
    file: sassFile,
    outputStyle: 'compressed',
  });

  let cssStr = result.css.toString();

  cssStr = await postcss([autoprefixer]).process(cssStr).css;

  // Strip BOM if any
  if (cssStr.charCodeAt(0) === 0xfeff) {
    cssStr = cssStr.substring(1);
  }
  return cssStr;
}

async function sassRender(sourceFile, templateFile, outputFile) {
  const regex = /<%\s*content\s*%>/;
  const template = await readFile(templateFile, 'utf-8');
  const replacement = await sassToCss(sourceFile);
  const newContent = template.replace(regex, replacement);

  return writeFile(outputFile, newContent, 'utf-8');
}

(async () => {
  const template = path.resolve(process.argv[1], '../styles.tmpl');
  const paths = await globby([
    'src/components/**/*.base.scss',
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
  report.success('Styles generation finished');
})();
