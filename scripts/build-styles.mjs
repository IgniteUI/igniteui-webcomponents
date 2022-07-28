import { globby } from 'globby';
import report from './report.js';
import { sassRender, template } from './sass.mjs';

(async () => {
  const startTime = new Date();
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
  report.success(`Styles generated in ${Math.round((Date.now() - startTime) / 1000)}s`);
})();
