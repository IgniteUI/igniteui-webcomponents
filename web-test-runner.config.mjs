import { litSsrPlugin } from '@lit-labs/testing/web-test-runner-ssr-plugin.js';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: ['dist/**/*.spec.js'],

  /** Configure bare import resolve plugin */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  plugins: [litSsrPlugin()],

  // See https://modern-web.dev/guides/test-runner/dev-server/ for all available options
});
