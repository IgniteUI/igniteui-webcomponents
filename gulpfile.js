/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

const browserSync = require('browser-sync').create();
const rimraf = require('rimraf');
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const { series } = require('gulp');
const {spawnSync} = require('child_process');
const slash = require('slash');

const DOCS_OUTPUT_PATH = slash(path.join(__dirname, 'dist', 'docs'));

const TYPEDOC_THEME = {
    SRC: slash(path.join(__dirname, 'node_modules', 'igniteui-typedoc-theme', '*')),
    OUTPUT: slash(path.join(DOCS_OUTPUT_PATH, 'typescript'))
};

const typedocBuildTheme = (cb) => {
  spawnSync(`typedoc`, [TYPEDOC.PROJECT_PATH,
  "--tsconfig",
  path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true });
  cb();
};
typedocBuildTheme.displayName = 'typedoc-build:theme';

const browserReload = (cb) => {
  browserSync.reload();

  cb();
};

const typedocServe = (cb) => {
  const config = {
      server: {
          baseDir: TYPEDOC_THEME.OUTPUT
      },
      port: 3000
  }

  browserSync.init(config);

  cb();
};

function typedocWatchFunc(cb) {
  gulp.watch([
      slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'js', 'src', '/**/*.{ts,js}')),
      slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'css', '/**/*.{scss,sass}')),
      slash(path.join(TYPEDOC_THEME.SRC, '/**/*.hbs')),
      slash(path.join(TYPEDOC_THEME.SRC, 'assets', 'images', '/**/*.{png,jpg,gif}')),
    ], series(typedocBuildTheme, browserReload));

    cb();
}


const TYPEDOC = {
  EXPORT_JSON_PATH: slash(path.join(DOCS_OUTPUT_PATH, 'typescript-exported')),
  PROJECT_PATH: slash(path.join(__dirname, 'src/index.ts')),
  TEMPLATE_STRINGS_PATH: slash(path.join(__dirname, 'extras', 'template', 'strings', 'shell-strings.json'))
};

function typedocBuildExportFn(cb) {
  console.log(PROJECT_PATH);
  spawnSync('typedoc', [
      TYPEDOC.PROJECT_PATH,
      "--generate-json",
      TYPEDOC.EXPORT_JSON_PATH,
      "--tags",
      "--params",
      "--tsconfig",
      path.join(__dirname,"tsconfig.json")],
      { stdio: 'inherit', shell: true });
  cb();
}

function typedocImportJsonFn(cb) {
  spawnSync('typedoc', [
      TYPEDOC.PROJECT_PATH,
      "--generate-from-json",
      TYPEDOC.EXPORT_JSON_PATH,
      "--warns",
      "--tsconfig",
      path.join(__dirname,"tsconfig.json")],
      { stdio: 'inherit', shell: true});
  cb();
}

function createDocsOutputDirFn(cb) {
  !fs.existsSync(DOCS_OUTPUT_PATH) && fs.mkdirSync(DOCS_OUTPUT_PATH);
  cb();
}

function cleanTypedocOutputDirFn(cb) {
  rimraf(slash(path.join(DOCS_OUTPUT_PATH, 'typescript')), () => {});
  cb();
}

function typedocBuildDocsJA (cb) {
      spawnSync('typedoc',[
          TYPEDOC.PROJECT_PATH,
          '--generate-from-json',
          slash(path.join(__dirname, 'i18nRepo', 'typedoc', 'ja')),
          '--templateStrings',
          TYPEDOC.TEMPLATE_STRINGS_PATH,
          '--warns',
          '--localize',
          'jp',
          "--tsconfig",
          path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true });

      cb();
}

function typedocBuildDocsEN (cb) {
      spawnSync('typedoc', [
          TYPEDOC.PROJECT_PATH,
          '--localize',
          'en',
          "--tsconfig",
          path.join(__dirname,"tsconfig.json")], { stdio: 'inherit', shell: true});

      cb();
}

module.exports.createDocsOutputDir = createDocsOutputDirFn;
/**
 * Typedoc build tasks
 */
 module.exports.exportTypedocJson = typedocBuildExportFn;
 module.exports.cleanTypedocOutputDir = cleanTypedocOutputDirFn;
 module.exports.typedocBuildTheme = typedocBuildTheme;
 module.exports.importTypedocJson = typedocImportJsonFn;
 module.exports.typedocServe = series(
     typedocBuildTheme,
     typedocWatchFunc,
     typedocServe
 );
 module.exports.typedocBuildDocsJA = series(
     this.createDocsOutputDir,
     this.cleanTypedocOutputDir,
     typedocBuildDocsJA
 );
 module.exports.typedocBuildDocsEN = series(
     this.createDocsOutputDir,
     this.cleanTypedocOutputDir,
     typedocBuildDocsEN
 );
