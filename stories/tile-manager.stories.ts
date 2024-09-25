import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import { IgcTileManagerComponent, defineComponents } from '../src/index.js';

defineComponents(IgcTileManagerComponent);

// region default
const metadata: Meta<IgcTileManagerComponent> = {
  title: 'TileManager',
  component: 'igc-tile-manager',
  parameters: {
    docs: {
      description: {
        component:
          'The tile manager component enables the dynamic arrangement, resizing, and interaction of tiles.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

const tiles = Array.from(
  map(range(10), (i) => html`<igc-tile> Text in Tile ${i + 1} </igc-tile>`)
);

const Template = () => html` <igc-tile-manager> ${tiles} </igc-tile-manager> `;

export const Basic: Story = Template.bind({});
