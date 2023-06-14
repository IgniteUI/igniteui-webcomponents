import autoprefixer from 'autoprefixer';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import * as sass from 'sass';

export const template = path.resolve(process.argv[1], '../styles.tmpl');
const renderSass = sass.compile;

async function sassToCss(sassFile) {
  const result = renderSass(sassFile, {
    outputStyle: 'compressed',
  });

  let cssStr = result.css.toString();
  cssStr = postcss([autoprefixer]).process(cssStr).css;

  // Strip BOM if any
  if (cssStr.charCodeAt(0) === 0xfeff) {
    cssStr = cssStr.substring(1);
  }
  return cssStr;
}

export async function sassRender(sourceFile, templateFile, outputFile) {
  const regex = /<%\s*content\s*%>/;
  const template = await readFile(templateFile, 'utf-8');
  const replacement = await sassToCss(sourceFile);
  const newContent = template.replace(regex, replacement);

  return writeFile(outputFile, newContent, 'utf-8');
}
