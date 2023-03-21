import { promisify } from 'node:util';
import { exec as exec_ } from 'node:child_process';
import watch from 'node-watch';

import report from './report.mjs';

const exec = promisify(exec_);

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /^((?!\.spec|.css\.).)*\.ts$/.test(path);
  },
};

watch(['src'], watchOptions, function (_event, fileName) {
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

  const buildDocsPromise = exec(
    'npm run build:docs:json && npm run build:meta'
  );

  try {
    await buildDocsPromise;
    updating = false;
    report.success('Metadata build completed. Stories updated.');
  } catch (e) {
    report.error('ERROR:', e);
  }
}

report.info('Metadata watcher started...');
