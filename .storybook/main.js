const postCSS = require('rollup-plugin-postcss');

module.exports = {
  stories: ['../dist/stories/**/*.stories.{js,md,mdx}'],

  rollupConfig(config) {
    config.plugins.push(postCSS({ include: ['**/*.scss'], inject: false }));

    return config;
  }
};
