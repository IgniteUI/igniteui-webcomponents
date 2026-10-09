import { fileURLToPath } from 'node:url';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { defaultReporter } from '@web/test-runner';
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

/**
 * Reads an integer of at least `min` from the environment variable `name`. Returns
 * `fallback` when the variable is unset or empty. Throws for other values.
 */
function readInteger(name, { min = 1, fallback } = {}) {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value)) {
    throw new Error(`${name} must be an integer, got "${raw}".`);
  }

  if (value < min) {
    throw new Error(`${name} must be at least ${min}, got "${raw}".`);
  }

  return value;
}

/**
 * The fast-check settings from `FC_SEED` and `FC_NUM_RUNS`. `FC_SEED=random` picks a new
 * seed. See CONTRIBUTING.md.
 */
function fastCheckSettings() {
  return {
    seed:
      process.env.FC_SEED?.trim() === 'random'
        ? Math.floor(Math.random() * 0x7fffffff)
        : readInteger('FC_SEED', { min: -Infinity }),
    numRuns: readInteger('FC_NUM_RUNS'),
  };
}

const fastCheck = JSON.stringify(fastCheckSettings());

/**
 * Loads `assertion-errors.spec.ts` ahead of the test framework so that every
 * test file gets the chai patch that keeps failed assertions on non-cloneable
 * subjects (sinon spies, DOM nodes) reportable. See the module itself for the
 * details.
 *
 * Also sets the {@link fastCheckSettings} for `fast-check-setup.spec.ts`.
 */
function testRunnerHtml(testFramework) {
  return `<!DOCTYPE html>
<html>
  <body>
    <script type="module" src="/src/internals/testing/assertion-errors.spec.ts"></script>
    <script>globalThis.__FAST_CHECK__ = ${fastCheck};</script>
    <script type="module" src="${testFramework}"></script>
  </body>
</html>`;
}

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  // The helpers in `src/internals/testing` are not test files.
  files: ['src/**/*.spec.ts', '!src/internals/testing/**'],
  browsers: [playwrightLauncher({ product: 'chromium', headless: true })],

  testRunnerHtml,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Configure bare import resolve plugin */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  coverageConfig: {
    exclude: ['node_modules/**/*', '**/themes/**', 'src/internals/testing/**'],
  },

  testFramework: {
    config: {
      timeout: readInteger('TEST_TIMEOUT', { fallback: 3000 }),
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
