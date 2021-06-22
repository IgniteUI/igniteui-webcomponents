const watch = require('node-watch');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

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
  if (updating) {
    return;
  }
  console.log(`Styles change detected: ${fileName}`);
  updating = true;
  console.log('Building styles...');
  execPromise = exec('npm run build:styles');

  try {
    const {stdout} = await execPromise;
    console.log(stdout);
  } catch ({stdout, stderr}) {
    console.log(stdout);
    console.log('ERROR:', stderr);
  }
  console.log('Styles build completed.');
  updating = false;
}

console.log('Styles watcher started...');
