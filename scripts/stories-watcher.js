import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import watch from 'node-watch';

const exec = promisify(_exec);

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /^((?!\.spec|.css\.).)*\.ts$/.test(path);
  },
};

watch(['src'], watchOptions, (_, fileName) => {
  addToQueue(fileName);
});

let updating = false;

async function addToQueue(fileName) {
  if (updating) {
    return;
  }
  console.log(`Component change detected: ${fileName}`);
  updating = true;
  console.log('Building documentation metadata and updating stories...');

  const buildDocsPromise = exec('npm run build:meta');

  try {
    await buildDocsPromise;
    updating = false;
    console.log('Metadata build completed. Stories updated.');
  } catch (e) {
    console.error('ERROR:', e);
  }
}

console.log('Metadata watcher started...');
