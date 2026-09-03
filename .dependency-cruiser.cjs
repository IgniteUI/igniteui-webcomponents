/**
 * Cross-cutting directories that are imported through a `#` subpath alias
 * declared in the `imports` field of `package.json` / `scripts/_package.json`.
 */
const ALIASED_DIRS = ['internals', 'theming', 'animations'];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      severity: 'error',
      comment:
        'Detects actual runtime circular dependencies while completely ignoring type-only imports.',
      from: {},
      to: {
        circular: true,
        dependencyTypesNot: ['type-only'],
      },
    },
    ...ALIASED_DIRS.map((dir) => ({
      name: `no-relative-${dir}-imports`,
      severity: 'error',
      comment:
        `Modules under src/${dir} must be imported through the #${dir} alias instead of a ` +
        `relative path, e.g. '#${dir}/foo.js' rather than '../../${dir}/foo.js'. Only ` +
        `src/${dir} itself may reference its own files relatively.`,
      from: {
        pathNot: `^src/${dir}/`,
      },
      to: {
        path: `^src/${dir}/`,
        dependencyTypesNot: ['aliased-subpath-import'],
      },
    })),
  ],
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },

    exclude: {
      path: '(node_modules|dist|build|\\.spec\\.|\\.test\\.)',
    },

    moduleSystems: ['es6', 'cjs'],
  },
};
