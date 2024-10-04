import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import { ifDefined } from 'lit/directives/if-defined.js';
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
  argTypes: {
    dragMode: {
      type: '"slide" | "swap"',
      description: 'Determines whether the tiles slide or swap on drop.',
      options: ['slide', 'swap'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
  },
  args: { dragMode: 'slide' },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Determines whether the tiles slide or swap on drop. */
  dragMode: 'slide' | 'swap';
}
type Story = StoryObj<IgcTileManagerArgs>;

// endregion

const tiles = Array.from(
  map(range(10), (i) => html`<igc-tile> Text in Tile ${i + 1} </igc-tile>`)
);

const Template = ({ dragMode }: IgcTileManagerArgs) => html`
  <igc-tile-manager dragMode="${ifDefined(dragMode)}">
    ${tiles}
  </igc-tile-manager>
`;

export const Basic: Story = Template.bind({});
