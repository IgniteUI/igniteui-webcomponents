import { storybookPlugin } from '@web/dev-server-storybook';
import rollupPostcss from 'rollup-plugin-postcss';
import { fromRollup } from '@web/dev-server-rollup';
import baseConfig from '../web-dev-server.config.mjs';

const postCSS = fromRollup(rollupPostcss);

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  ...baseConfig,
  open: '/',
  mimeTypes: {
    '**/*.scss': 'js',
  },
  plugins: [
    storybookPlugin({ type: 'web-components' }),
    postCSS({ include: ['**/*.scss'], inject: false }),
    ...baseConfig.plugins,
  ],
});
