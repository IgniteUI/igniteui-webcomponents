import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-links',
    '@storybook/addon-docs',
  ],
  core: {
    builder: '@storybook/builder-vite',
  },
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  viteFinal: async (config, options) => {
    const { mergeConfig } = await import('vite');

    if (options.configType === 'PRODUCTION') {
      return mergeConfig(config, {
        build: {
          rollupOptions: {
            output: {
              chunkFileNames: ({ name }: { name: string }) =>
                name.startsWith('_')
                  ? `assets/${name.replace(/^_/, '')}.[hash].js`
                  : 'assets/[name].[hash].js',
            },
          },
        },
      });
    }

    return mergeConfig(config, {});
  },
};

export default config;
