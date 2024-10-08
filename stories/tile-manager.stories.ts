import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import {
  IgcIconComponent,
  IgcTileManagerComponent,
  defineComponents,
  registerIcon,
} from '../src/index.js';

defineComponents(IgcTileManagerComponent, IgcIconComponent);

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

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

const tiles = Array.from(
  map(
    range(10),
    (i) => html`
      <igc-tile>
        <igc-tile-header slot="header">
          <h3 slot="title">Tile ${i + 1} Title</h3>
          <igc-icon name="home" slot="actions"></igc-icon>
        </igc-tile-header>

        <igc-tile-content slot="content">
          <p>Text in Tile ${i + 1}</p>
        </igc-tile-content>
      </igc-tile>
    `
  )
);

const Template = () => html` <igc-tile-manager> ${tiles} </igc-tile-manager> `;

export const Basic: Story = Template.bind({});
