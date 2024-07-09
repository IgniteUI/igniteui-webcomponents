import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import watch from 'node-watch';
import report from './report.mjs';

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
  report.info(`Component change detected: ${fileName}`);
  updating = true;
  report.info('Building documentation metadata and updating stories...');

  const buildDocsPromise = exec('npm run build:meta');

  try {
    await buildDocsPromise;
    updating = false;
    report.info('Metadata build completed. Stories updated.');
  } catch (e) {
    report.error('ERROR:', e);
  }
}

report.info('Metadata watcher started...');
