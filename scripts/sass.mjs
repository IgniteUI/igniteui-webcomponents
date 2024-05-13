import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

const stripComments = () => {
  return {
    postcssPlugin: 'postcss-strip-comments',
    OnceExit(root) {
      root.walkComments((node) => node.remove());
    },
  };
};
stripComments.postcss = true;

const _template = await readFile(
  resolve(process.argv[1], '../styles.tmpl'),
  'utf8'
);
const _postProcessor = postcss([autoprefixer, stripComments]);

export function fromTemplate(content) {
  return _template.replace(/<%\s*content\s*%>/, content);
}

export async function compileSass(src, compiler) {
  const compiled = await compiler.compileAsync(src, {
    style: 'compressed',
    loadPaths: ['node_modules', 'src'],
  });

  const out = _postProcessor.process(compiled.css).css;
  return out.charCodeAt(0) === 0xfeff ? out.slice(1) : out;
}
