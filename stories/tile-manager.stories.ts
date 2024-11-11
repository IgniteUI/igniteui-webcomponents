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
import { disableStoryControls, randomIntBetween } from './story.js';

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
      table: { defaultValue: { summary: '10' } },
    },
  },
  args: { dragMode: 'slide', columnCount: 10 },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Determines whether the tiles slide or swap on drop. */
  dragMode: 'slide' | 'swap';
  columnCount: number;
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
          <h3>Tile ${i + 1} Title</h3>
          <igc-icon name="home" slot="actions"></igc-icon>
        </igc-tile-header>

        <p>Text in Tile ${i + 1}</p>
      </igc-tile>
    `
  )
);

const pictures = Array.from(range(25)).map(() => ({
  width: randomIntBetween(300, 600),
  height: randomIntBetween(300, 600),
}));

export const AutoInfer: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      :root {
        --ig-min-col-width: 600px;
        /* --ig-min-row-height: 300px; */
      }

      igc-tile {
        width: fit-content;
      }

      .picture {
        & img {
          margin: 0 auto;
          object-fit: scale-down;
        }
      }
    </style>
    <igc-tile-manager>
      ${pictures.map(
        ({ width, height }) => html`
          <igc-tile>
            <div class="picture">
              <img
                src="https://picsum.photos/${width}/${height}"
                alt="picture"
              />
            </div>
          </igc-tile>
        `
      )}
    </igc-tile-manager>
  `,
};

export const Default: Story = {
  render: (args) => html`
    <igc-tile-manager
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
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

function cancelStateChangeEvent(e: CustomEvent) {
  e.preventDefault();
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
      <igc-tile id="max-tile" @igcTileFullscreen=${cancelStateChangeEvent}>
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

function addTile() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('#tile-manager1')!;
  const tiles = tileManager.querySelectorAll('igc-tile');
  const newTile = document.createElement('igc-tile');
  const content = document.createElement('h2');
  content.textContent = `Tile ${tileManager.tiles.length + 1}`;
  newTile.position = 0;
  newTile.append(content);
  // tileManager.appendChild(newTile);
  tileManager.insertBefore(newTile, tiles[3]);
}

function removeTile() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('#tile-manager1')!;
  const lastTile = tileManager.querySelector('igc-tile:first-of-type');

  if (lastTile) {
    lastTile.remove();
  }
}

export const DynamicTiles: Story = {
  render: () => html`
    <igc-button @click=${addTile}>Add Tile</igc-button>
    <igc-button @click=${removeTile}>Remove Tile</igc-button>
    <igc-tile-manager id="tile-manager1">
      <igc-tile id="tile1" position="1">
        <h1>Tile1</h1>
      </igc-tile>
      <igc-tile id="tile2">
        <h2>Tile2</h2>
      </igc-tile>
      <igc-tile id="tile3">
        <h2>Tile3</h2>
      </igc-tile>
      <igc-tile id="tile4">
        <h2>Tile4</h2>
      </igc-tile>
      <igc-tile id="tile5">
        <h2>Tile5</h2>
      </igc-tile>
      <igc-tile id="tile6" position="2">
        <h2>Tile6</h2>
      </igc-tile>
    </igc-tile-manager>
  `,
};

let serializedData: string;

function saveTileManager() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('#tile-manager1')!;

  serializedData = tileManager.saveLayout();
}

function loadTileManager() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('#tile-manager1')!;

  tileManager.loadLayout(serializedData);
}

export const Serialization: Story = {
  render: () => html`
    <igc-button @click=${saveTileManager}>Save Layout</igc-button>
    <igc-button @click=${loadTileManager}>Load Layout</igc-button>
    <igc-button @click=${addTile}>Add Tile</igc-button>
    <igc-button @click=${removeTile}>Remove Tile</igc-button>
    <igc-tile-manager id="tile-manager1">
      <igc-tile disable-drag disable-resize>
        <igc-tile-header>Header 1</igc-tile-header>
        <h1>Tile1</h1>
      </igc-tile>
      <igc-tile id="tile2">
        <h2>Tile2</h2>
      </igc-tile>
      <igc-tile id="tile3">
        <h2>Tile3</h2>
      </igc-tile>
    </igc-tile-manager>
  `,
};
