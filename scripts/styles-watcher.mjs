import { watch } from 'node:fs';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import * as sass from 'sass-embedded';
import report from './report.mjs';
import { compileSass, fromTemplate } from './sass.mjs';

let updating = false;
const compiler = await sass.initAsyncCompiler();
const filter = (path) => /.(?:scss)$/.test(path);
const now = () => `[${new Date().toLocaleTimeString()}]`;

watch('src', { recursive: true }, async (_, fileName) => {
  if (!fileName || !filter(fileName) || updating) return;

  const filePath = join('src', fileName);
  report.warn(`${now()} 🎨 change detected: ${filePath}`);
  updating = true;

  try {
    await writeFile(
      filePath.replace(/\.scss$/, '.css.ts'),
      fromTemplate(await compileSass(filePath, compiler)),
      'utf8'
    );
    report.success(`${now()} 🎨 Styles rebuilt`);
  } catch (err) {
    report.error(`${now()} ERROR: ${err.message ?? err.toString()}`);
  } finally {
    updating = false;
  }
}).on('close', () => compiler.dispose());

report.info(`${now()} Styles watcher started...`);
