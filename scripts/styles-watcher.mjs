import { writeFile } from 'node:fs/promises';
import watch from 'node-watch';
import * as sass from 'sass-embedded';
import report from './report.mjs';
import { compileSass, fromTemplate } from './sass.mjs';

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /.(?:scss)$/.test(path);
  },
};

let updating = false;
const compiler = await sass.initAsyncCompiler();

const watcher = watch(['src'], watchOptions, async (_, fileName) => {
  if (updating) {
    return;
  }

  report.warn(`Change detected: ${fileName}`);
  updating = true;

  try {
    await writeFile(
      fileName.replace(/\.scss$/, '.css.ts'),
      fromTemplate(await compileSass(fileName, compiler)),
      'utf8'
    );
  } catch (err) {
    report.error(err);
  }

  report.success('Styles rebuilt 🎨');
  updating = false;
});

watcher.on('close', () => compiler.dispose());

report.info('Styles watcher started...');
