import watch from 'node-watch';
import report from './report.js';
import { sassRender, template } from './sass.mjs';

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /.(?:scss)$/.test(path);
  },
};

watch(['src'], watchOptions, function(_event, fileName) {
  addToQueue(fileName);
});

let updating = false;

async function addToQueue(fileName) {
  const output = fileName.replace(/\.scss$/, '.css.ts');
  if (updating) {
    return;
  }
  report.warn(`Change detected: ${fileName}`);
  updating = true;
  console.log('Rebuilding styles...');

  await sassRender(fileName, template, output).catch((err) => {
    report.error(err);
  });
  report.success('Styles rebuilt 🎨');
  updating = false;
}

console.log('Styles watcher started...');
