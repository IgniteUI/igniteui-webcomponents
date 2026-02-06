import { mkdir, readFile, writeFile, glob } from 'node:fs/promises';
import path from 'node:path';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import * as sass from 'sass-embedded';
import report from './report.mjs';

const toDist = path.join.bind(
  null,
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
);

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

export async function buildThemes(isProduction = false) {
  const start = performance.now();

  const [compiler, paths] = await Promise.all([
    sass.initAsyncCompiler(),
    Array.fromAsync(glob('src/styles/themes/{light,dark}/*.scss')),
  ]);

  try {
    await Promise.all(
      paths.map(async (sassFile) => {
        const outputFile = isProduction
          ? toDist(
              sassFile.replace(/\.scss$/, '.css').replace('src/styles/', '')
            )
          : sassFile.replace(/\.scss$/, '.css.ts');

        if (isProduction) {
          await mkdir(path.dirname(outputFile), { recursive: true });
          writeFile(outputFile, await compileSass(sassFile, compiler), 'utf-8');
        } else {
          writeFile(
            outputFile,
            fromTemplate(await compileSass(sassFile, compiler)),
            'utf-8'
          );
        }
      })
    );
  } catch (err) {
    await compiler.dispose();
    report.error(err.message ?? err.toString());
    process.exit(1);
  }

  await compiler.dispose();

  if (!isProduction) {
    report.success(
      `Themes generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
  }
}

export async function buildComponents(isProduction = false) {
  const start = performance.now();
  const [compiler, paths] = await Promise.all([
    sass.initAsyncCompiler(),
    Array.fromAsync(
      glob(
        'src/components/**/*.{base,common,shared,material,bootstrap,indigo,fluent}.scss'
      )
    ),
  ]);

  try {
    await Promise.all(
      paths.map(async (path) =>
        writeFile(
          path.replace(/\.scss$/, '.css.ts'),
          fromTemplate(await compileSass(path, compiler)),
          'utf-8'
        )
      )
    );
  } catch (err) {
    await compiler.dispose();
    report.error(err.message ?? err.toString());
    process.exit(1);
  }

  await compiler.dispose();

  if (!isProduction) {
    report.success(
      `Component styles generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
  }
}
