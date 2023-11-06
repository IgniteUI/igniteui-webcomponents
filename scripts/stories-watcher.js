const watch = require('node-watch');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

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
