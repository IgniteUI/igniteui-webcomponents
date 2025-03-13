import { fileURLToPath } from 'node:url';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  files: ['src/**/*.spec.ts'],
  browsers: [playwrightLauncher({ product: 'chromium', headless: true })],

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Configure bare import resolve plugin */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  coverageConfig: {
    exclude: ['node_modules/**/*', '**/themes/**'],
  },

  testFramework: {
    config: {
      timeout: 3000,
    },
  },

  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
  ],

  // See documentation for all available options
  // https://modern-web.dev/docs/test-runner/cli-and-configuration/#configuration-file
});
