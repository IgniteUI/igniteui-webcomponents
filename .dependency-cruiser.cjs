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
