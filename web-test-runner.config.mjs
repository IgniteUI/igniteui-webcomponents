import { fileURLToPath } from 'node:url';
import { defaultReporter } from '@web/test-runner';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

/**
 * Chromium reports the "ResizeObserver loop completed with undelivered
 * notifications" condition as an uncaught exception with no associated
 * `Error` object. Test code (see `suppressResizeObserverLoopError` in
 * `utils.spec.ts`) can prevent it from failing a test via `window.onerror`,
 * but web-test-runner's browser log collection picks the (error-less)
 * exception up independently of that, printing it as a bare `null` line.
 * This reporter strips those specific single-`null`-argument log entries
 * before the default reporter prints anything, without hiding other,
 * legitimate `console.*` output from tests.
 */
function filterBenignBrowserLogs() {
  return {
    reportTestFileResults({ sessionsForTestFile }) {
      for (const session of sessionsForTestFile) {
        session.logs = session.logs.filter(
          (args) => !(args.length === 1 && args[0] === null)
        );
      }
    },
  };
}

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

  reporters: [filterBenignBrowserLogs(), defaultReporter()],

  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
  ],

  // See documentation for all available options
  // https://modern-web.dev/docs/test-runner/cli-and-configuration/#configuration-file
});
