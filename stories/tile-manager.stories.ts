import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import {
  IgcButtonComponent,
  IgcIconComponent,
  type IgcTileComponent,
  IgcTileManagerComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(IgcTileManagerComponent, IgcIconComponent, IgcButtonComponent);

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
    actions: { handles: ['igcTileDragStarted'] },
  },
  argTypes: {
    dragMode: {
      type: '"slide" | "swap"',
      description: 'Determines whether the tiles slide or swap on drop.',
      options: ['slide', 'swap'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
    columnCount: {
      type: 'number',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    rowCount: {
      type: 'number',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: { dragMode: 'slide', columnCount: 0, rowCount: 0 },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Determines whether the tiles slide or swap on drop. */
  dragMode: 'slide' | 'swap';
  columnCount: number;
  rowCount: number;
}
type Story = StoryObj<IgcTileManagerArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

const tiles = Array.from(
  map(
    range(10),
    (i) => html`
      <igc-tile .colSpan=${3} .rowSpan=${9}>
        <igc-tile-header slot="header">
          <h3 slot="title">Tile ${i + 1} Title</h3>
          <igc-icon name="home" slot="actions"></igc-icon>
        </igc-tile-header>

        <p>Text in Tile ${i + 1}</p>
      </igc-tile>
    `
  )
);

export const Default: Story = {
  render: (args) => html`
    <igc-tile-manager
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .rowCount=${args.rowCount}
    >
      <p>This text won't be displayed in Tile Manager</p>
      ${tiles}
    </igc-tile-manager>
  `,
};

function toggleMaximizedTile() {
  const tile = document.querySelector<IgcTileComponent>('#max-tile')!;
  tile.maximized = !tile.maximized;
}

export const Maximized: Story = {
  render: () => html`
    <style>
      igc-tile-manager {
        margin: 0 auto;
        height: 75lvh;
        width: 75lvw;
      }
    </style>

    <igc-tile-manager>
      <igc-tile id="max-tile">
        <h1>I am Maximized</h1>
        <igc-button @click=${toggleMaximizedTile}
          >Toggle maximized state</igc-button
        >
      </igc-tile>
      <igc-tile rowStart="5">
        <h2>I am not maximized and will be under the maximized tile</h2>
      </igc-tile>
    </igc-tile-manager>
  `,
};
