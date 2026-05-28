import { mkdir, writeFile, glob } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import * as sass from 'sass-embedded';
import report from './report.mjs';

const toDist = path.join.bind(
  null,
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
);

const stripComments = () => ({
  postcssPlugin: 'postcss-strip-comments',
  OnceExit(root) {
    root.walkComments((node) => node.remove());
  },
});
stripComments.postcss = true;

const _postProcessor = postcss([autoprefixer, stripComments]);

const THEME_GLOB = 'src/styles/themes/{light,dark}/*.scss';
const COMPONENT_GLOB =
  'src/components/**/*.{base,common,shared,material,bootstrap,indigo,fluent}.scss';

export function fromTemplate(content) {
  return `
  import { css } from 'lit';
  export const styles = css\`${content}\`;
  `;
}

export async function compileSass(src, compiler) {
  const compiled = await compiler.compileAsync(src, {
    style: 'compressed',
    loadPaths: ['node_modules', 'src'],
  });

  const out = _postProcessor.process(compiled.css).css;
  return out.charCodeAt(0) === 0xfeff ? out.slice(1) : out;
}

/**
 * Builds both themes and component styles using a single shared compiler.
 * All I/O (compiler init + both globs) is parallelized.
 *
 * @param {boolean} isProduction
 */
export async function buildAll(isProduction = false) {
  const start = performance.now();

  const [compiler, themePaths, componentPaths] = await Promise.all([
    sass.initAsyncCompiler(),
    Array.fromAsync(glob(THEME_GLOB)),
    Array.fromAsync(glob(COMPONENT_GLOB)),
  ]);

  // Cache mkdir promises per directory to avoid redundant syscalls.
  /** @type {Map<string, Promise<void>>} */
  const mkdirCache = new Map();
  const ensureDir = (dir) => {
    if (!mkdirCache.has(dir)) {
      mkdirCache.set(dir, mkdir(dir, { recursive: true }));
    }
    return /** @type {Promise<void>} */ (mkdirCache.get(dir));
  };

  try {
    await Promise.all([
      ...themePaths.map(async (sassFile) => {
        if (isProduction) {
          const outputFile = toDist(
            sassFile.replace(/\.scss$/, '.css').replace('src/styles/', '')
          );
          await ensureDir(path.dirname(outputFile));
          await writeFile(
            outputFile,
            await compileSass(sassFile, compiler),
            'utf-8'
          );
        } else {
          await writeFile(
            sassFile.replace(/\.scss$/, '.css.ts'),
            fromTemplate(await compileSass(sassFile, compiler)),
            'utf-8'
          );
        }
      }),
      ...componentPaths.map((filePath) =>
        compileSass(filePath, compiler).then((css) =>
          writeFile(
            filePath.replace(/\.scss$/, '.css.ts'),
            fromTemplate(css),
            'utf-8'
          )
        )
      ),
    ]);
  } finally {
    await compiler.dispose();
  }

  if (!isProduction) {
    report.success(
      `Styles generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
  }
}

export async function buildThemes(isProduction = false) {
  const start = performance.now();

  const [compiler, paths] = await Promise.all([
    sass.initAsyncCompiler(),
    Array.fromAsync(glob(THEME_GLOB)),
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
          await writeFile(
            outputFile,
            await compileSass(sassFile, compiler),
            'utf-8'
          );
        } else {
          await writeFile(
            outputFile,
            fromTemplate(await compileSass(sassFile, compiler)),
            'utf-8'
          );
        }
      })
    );
  } finally {
    await compiler.dispose();
  }

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
    Array.fromAsync(glob(COMPONENT_GLOB)),
  ]);

  try {
    await Promise.all(
      paths.map((filePath) =>
        compileSass(filePath, compiler).then((css) =>
          writeFile(
            filePath.replace(/\.scss$/, '.css.ts'),
            fromTemplate(css),
            'utf-8'
          )
        )
      )
    );
  } finally {
    await compiler.dispose();
  }

  if (!isProduction) {
    report.success(
      `Component styles generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
  }
}
