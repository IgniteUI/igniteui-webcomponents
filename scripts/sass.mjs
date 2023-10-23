import autoprefixer from 'autoprefixer';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import * as sass from 'sass-embedded';

const stripComments = () => {
  return {
    postcssPlugin: 'postcss-strip-comments',
    OnceExit(root) {
      root.walkComments((node) => node.remove());
    },
  };
};

stripComments.postcss = true;

export const template = path.resolve(process.argv[1], '../styles.tmpl');
export const postProcessor = postcss([autoprefixer, stripComments]);

const renderSass = sass.compileAsync;

async function sassToCss(sassFile) {
  const result = await renderSass(sassFile, {
    style: 'compressed',
    loadPaths: ['node_modules', 'src']
  });

  let cssStr = postProcessor.process(result.css).css;

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
