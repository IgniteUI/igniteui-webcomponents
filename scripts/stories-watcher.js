import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
import { watch } from 'node:fs';
import report from './report.mjs';

const exec = promisify(_exec);
const now = () => `[${new Date().toLocaleTimeString()}]`;

let updating = false;

watch('.', (_, filename) => {
  if (filename !== 'custom-elements.json') return;
  trigger();
});

async function trigger() {
  if (updating) {
    return;
  }
  updating = true;
  report.info(`${now()} Manifest updated, rebuilding stories...`);

  try {
    await exec('npm run build:meta');
    report.info(`${now()} Stories updated.`);
  } catch (e) {
    report.error(`${now()} ERROR: ${e.message}`);
  } finally {
    updating = false;
  }
}

report.info(`${now()} Metadata watcher started...`);
