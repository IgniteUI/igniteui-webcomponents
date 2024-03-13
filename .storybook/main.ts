import type { StorybookConfig } from '@storybook/web-components-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
  viteFinal: (config, options) => {
    if (options.configType === 'PRODUCTION') {
      return mergeConfig(config, {
        build: {
          rollupOptions: {
            output: {
              chunkFileNames: ({ name }) =>
                /^_/.test(name)
                  ? `assets/${name.replace(/^_/, '')}.[hash].js`
                  : 'assets/[name].[hash].js',
            },
          },
        },
      });
    }

    return config;
  },
};

export default config;
