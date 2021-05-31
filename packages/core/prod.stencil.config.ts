import { Config } from '@stencil/core';

export const config: Config = {
  buildDist: true,
  namespace: 'igniteui-webcomponents',
  tsconfig: 'prod.tsconfig.json',
  outputTargets: [
    // {
    //   type: 'dist',
    //   esmLoaderPath: '../loader',
    // },
    {
      type: 'dist-custom-elements-bundle',
    }
  ],
};
