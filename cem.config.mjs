import { getTsProgram, expandTypesPlugin } from 'cem-plugin-expanded-types';

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.spec.ts', 'src/**/*.css.ts', 'src/**/themes/**'],
  packagejson: true,
  outdir: './',
  litelement: true,
  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },

  plugins: [expandTypesPlugin({ hideLogs: true })],
};
