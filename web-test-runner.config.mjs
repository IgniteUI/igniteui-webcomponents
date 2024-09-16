import { playwrightLauncher } from '@web/test-runner-playwright';
import { litSsrPlugin } from '@lit-labs/testing/web-test-runner-ssr-plugin.js';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: ['dist/**/*.spec.js'],
  browsers: [playwrightLauncher({ product: 'chromium', headless: true })],

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Configure bare import resolve plugin */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  coverageConfig: {
    exclude: [
      'node_modules/**/*',
      '**/themes/**',
      '**/*auto-register.js',
      '**/*.css.js',
    ],
  },

  plugins: [litSsrPlugin()],

  // See documentation for all available options
  // https://modern-web.dev/docs/test-runner/cli-and-configuration/#configuration-file
});
