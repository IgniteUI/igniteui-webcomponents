import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const externalize = (sources: string[]) => ({
  name: 'externalize-deps',
  resolveId(source: string) {
    return sources.includes(source) ? { id: source, external: true } : null;
  },
});

// Utilities for certain test suites in the library
const IGNORED_TESTS = [
  '**/stepper-utils.spec.ts',
  '**/date-range-picker.utils.spec.ts',
  '**/helpers.spec.ts',
  '**/tree-utils.spec.ts',
  '**/validity-helpers.spec.ts',
  '**/utils.spec.ts',
];

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['lit'],
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ['node_modules', 'src'],
      },
    },
  },
  test: {
    mockReset: true,
    onConsoleLog(log, type) {
      return !(type === 'stderr' && log.startsWith('Lit is in dev mode'));
    },
    exclude: [...configDefaults.exclude, ...IGNORED_TESTS],
    include: ['src/**/*.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium', headless: true }],
      screenshotFailures: false,
    },
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      enabled: false,
      provider: 'v8',
      reportOnFailure: true,
      reporter: ['lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/themes/**',
        'src/animations/presets/**',
        'src/index.ts',
        'src/extras/**',
      ],
    },
  },
  plugins: [externalize(['/__web-dev-server__web-socket.js'])],
});
