import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCalendarComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardMediaComponent,
  IgcChipComponent,
  IgcDatePickerComponent,
  IgcDividerComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcListItemComponent,
  IgcRatingComponent,
  IgcRippleComponent,
  IgcStepComponent,
  IgcStepperComponent,
  IgcTabPanelComponent,
  IgcTabsComponent,
  type IgcTileComponent,
  IgcTileManagerComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls, randomIntBetween } from './story.js';

defineComponents(
  IgcTileManagerComponent,
  IgcIconComponent,
  IgcButtonComponent,
  IgcRatingComponent,
  IgcInputComponent,
  IgcStepComponent,
  IgcStepperComponent,
  IgcLinearProgressComponent,
  IgcDatePickerComponent,
  IgcChipComponent,
  IgcCalendarComponent,
  IgcListComponent,
  IgcTabPanelComponent,
  IgcListItemComponent,
  IgcAvatarComponent,
  IgcTabsComponent,
  IgcCardComponent,
  IgcCardMediaComponent,
  IgcCardActionsComponent,
  IgcIconButtonComponent,
  IgcRippleComponent,
  IgcDividerComponent,
  IgcCardContentComponent
);

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
    actions: { handles: ['igcTileDragStarted', 'igcTileDragEnded'] },
  },
  argTypes: {
    resizeMode: {
      type: '"none" | "hover" | "always"',
      description: 'Whether resize operations are enabled.',
      options: ['none', 'hover', 'always'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
    dragMode: {
      type: '"none" | "tile-header" | "tile"',
      description: 'Whether drag and drop operations are enabled.',
      options: ['none', 'tile-header', 'tile'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
    dragAction: {
      type: '"slide" | "swap"',
      description:
        'Whether the tiles will slide or swap on drop during a drag and drop operation.',
      options: ['slide', 'swap'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
    columnCount: {
      type: 'number',
      description:
        'Sets the number of columns for the tile manager.\nSetting value <= than zero will trigger a responsive layout.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    minColumnWidth: {
      type: 'string',
      description:
        'Sets the minimum width for a column unit in the tile manager.',
      control: 'text',
    },
    minRowHeight: {
      type: 'string',
      description:
        'Sets the minimum height for a row unit in the tile manager.',
      control: 'text',
    },
    gap: {
      type: 'string',
      description: 'Sets the gap size of the the tile manager.',
      control: 'text',
    },
  },
  args: {
    resizeMode: 'none',
    dragMode: 'none',
    dragAction: 'slide',
    columnCount: 0,
  },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Whether resize operations are enabled. */
  resizeMode: 'none' | 'hover' | 'always';
  /** Whether drag and drop operations are enabled. */
  dragMode: 'none' | 'tile-header' | 'tile';
  /** Whether the tiles will slide or swap on drop during a drag and drop operation. */
  dragAction: 'slide' | 'swap';
  /**
   * Sets the number of columns for the tile manager.
   * Setting value <= than zero will trigger a responsive layout.
   */
  columnCount: number;
  /** Sets the minimum width for a column unit in the tile manager. */
  minColumnWidth: string;
  /** Sets the minimum height for a row unit in the tile manager. */
  minRowHeight: string;
  /** Sets the gap size of the the tile manager. */
  gap: string;
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
      <igc-tile .disableResize=${i === 0} .disableDrag=${i === 0}>
        <h3 slot="title">Tile ${i + 1} Title</h3>
        <igc-icon name="home" slot="actions"></igc-icon>

        <p>Text in Tile ${i + 1}</p>
        <div class="picture">
          <img
            src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=320&q=180"
          />
        </div>
      </igc-tile>
    `
  )
);

const pictures = Array.from(range(25)).map(() => ({
  width: randomIntBetween(300, 600),
  height: randomIntBetween(300, 600),
}));

const date = new Date();

export const AutoInfer: Story = {
  argTypes: disableStoryControls(metadata),
  render: (args) => html`
    <style>
      igc-tile::part(content-container) {
        height: 100%;
      }

      .picture {
        display: flex;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    </style>
    <igc-tile-manager
      .gap=${args.gap}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
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

interface Visualization {
  title: string;
  columnSpan: string | number;
  rowSpan: string | number;
  value?: number;
  trend?: number;
  img?: string;
}

const campaignVisualizations: Visualization[] = [
  { title: 'Spend vs Budget', columnSpan: 15, rowSpan: 10 },
  { title: 'Website Traffic', columnSpan: 15, rowSpan: 10 },
  { title: 'Conversions', columnSpan: 15, rowSpan: 10 },
  { title: 'New Seats', columnSpan: 15, rowSpan: 10 },
  { title: 'Actual Spend vs Budget', columnSpan: 30, rowSpan: 30 },
  { title: 'Website Traffic Breakdown', columnSpan: 30, rowSpan: 30 },
  { title: 'Conversions', columnSpan: 45, rowSpan: 20 },
  { title: 'Conversions by Territory', columnSpan: 15, rowSpan: 20 },
];

const salesVisualizations: Visualization[] = [
  {
    title: 'Sales',
    columnSpan: 12,
    rowSpan: 15,
    value: 4592177,
    trend: -40.86,
  },
  {
    title: 'Total Opportunities',
    columnSpan: 12,
    rowSpan: 15,
    value: 779903,
    trend: 1.35,
  },
  {
    title: 'Leads by Year',
    columnSpan: 36,
    rowSpan: 35,
    img: 'https://community.tableau.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=0684T000001hlEa&operationContext=CHATTER&contentId=05T4T0000079c8R&page=0',
  },
  {
    title: 'Revenue by State',
    columnSpan: 24,
    rowSpan: 45,
    img: 'https://static01.nyt.com/newsgraphics/2021/02/24/state-tax-revenue-map/36b53ac5076ed3c055083850c07f5c2adbe3d43d/state-tax-revnue-map-1050.png',
  },
  {
    title: 'New Seats Avg by Employee',
    columnSpan: 16,
    rowSpan: 25,
    img: 'https://www.slideteam.net/media/catalog/product/cache/1280x720/h/o/horizontal_bar_graph_depicting_forecasted_and_actual_sales_slide01.jpg',
  },
  {
    title: 'Sales by Product',
    columnSpan: 20,
    rowSpan: 25,
    img: 'https://blog.logrocket.com/wp-content/uploads/2023/06/new-vs-recurring-revenue-chart-example-1.png',
  },
];

const trendContent = (value: number, trend: number) => html`
  <style>
    h3 {
      margin-bottom: 0px;
    }
    h4,
    h6 {
      margin: 0px;
    }

    .trends {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .decrease {
      color: palevioletred;
    }
    .increase {
      color: lightseagreen;
    }
  </style>
  <div class="trends">
    <h3>${value.toLocaleString()}</h3>
    <h4 class="${trend > 0 ? 'increase' : 'decrease'}">
      ${trend.toLocaleString()}%
    </h4>
    <h6>vs previous year</h6>
  </div>
`;

const imageContent = (img: string) => html`
  <style>
    .picture {
      display: flex;
      width: 100%;
      height: 100%;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  </style>
  <div class="picture"><img src="${img}" alt="picture" /></div>
`;

export const FinDashboard: Story = {
  args: {
    resizeMode: 'hover',
    dragMode: 'tile-header',
  },

  render: (args) => html`
    <style>
      igc-tile::part(content-container) {
        padding: 1rem;
      }
    </style>

    <igc-tile-manager
      .columnCount=${60}
      .rowCount=${60}
      .minColumnWidth=${'5px'}
      .minRowHeight=${'5px'}
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
    >
      ${campaignVisualizations?.map(
        (viz) => html`
          <igc-tile
            .colSpan=${viz.columnSpan}
            .rowSpan=${viz.rowSpan}
            .disableResize=${false}
            .disableDragging=${false}
          >
            <span slot="title">${viz.title}</span>
            TEST CONTENT
          </igc-tile>
        `
      )}
    </igc-tile-manager>
  `,
};

export const FinDashboard1: Story = {
  render: (args) => html`
    <igc-tile-manager
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
      .columnCount=${60}
      .rowCount=${60}
      .minColumnWidth=${'5px'}
      .minRowHeight=${'5px'}
    >
      ${salesVisualizations?.map(
        (viz) => html`
          <igc-tile
            .colSpan=${viz.columnSpan}
            .rowSpan=${viz.rowSpan}
            .disableResize=${false}
            .disableDragging=${false}
          >
            <span slot="title">${viz.title}</span>
            ${(viz.value && trendContent(viz.value, viz.trend || 0)) ||
            (viz.img && imageContent(viz.img)) ||
            'TEST CONTENT'}
          </igc-tile>
        `
      )}
    </igc-tile-manager>
  `,
};

export const Default: Story = {
  render: (args) => html`
    <style>
      .picture {
        display: flex;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    </style>
    <igc-tile-manager
      .gap=${args.gap}
      .dragMode=${args.dragMode}
      .resizeMode=${args.resizeMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
      <p>This text won't be displayed in Tile Manager</p>
      ${tiles}
    </igc-tile-manager>

    <igc-button @click=${disableTileResize}>
      Toggle Tile 2 Resizing
    </igc-button>
  `,
};

function toggleMaximizedTile() {
  const tile = document.querySelector<IgcTileComponent>('#max-tile')!;
  tile.maximized = !tile.maximized;
}

function disableTileResize() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('igc-tile-manager')!;
  tileManager.tiles[1].disableResize = !tileManager.tiles[1].disableResize;
}

function cancelStateChangeEvent(e: CustomEvent) {
  e.preventDefault();
}

export const Maximized: Story = {
  render: (args) => html`
    <igc-tile-manager
      .gap=${args.gap}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
      <igc-tile
        id="max-tile"
        maximized
        @igcTileFullscreen=${cancelStateChangeEvent}
      >
        <h1>I am Maximized</h1>
        <igc-button @click=${toggleMaximizedTile}
          >Toggle maximized state</igc-button
        >
      </igc-tile>
      <igc-tile row-start="5">
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
  const firstTile = tileManager.querySelector('igc-tile:first-of-type');

  if (firstTile) {
    firstTile.remove();
  }
}

export const DynamicTiles: Story = {
  render: (args) => html`
    <igc-button @click=${addTile}>Add Tile</igc-button>
    <igc-button @click=${removeTile}>Remove Tile</igc-button>
    <igc-tile-manager
      id="tile-manager1"
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
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
  render: (args) => html`
    <igc-button @click=${saveTileManager}>Save Layout</igc-button>
    <igc-button @click=${loadTileManager}>Load Layout</igc-button>
    <igc-button @click=${addTile}>Add Tile</igc-button>
    <igc-button @click=${removeTile}>Remove Tile</igc-button>
    <igc-tile-manager
      id="tile-manager1"
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
      <igc-tile disable-drag disable-resize>
        <span slot="title">Header 1</span>
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

const northEast =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m216-160-56-56 464-464H360v-80h400v400h-80v-264L216-160Z"/></svg>';
registerIconFromText('north_east', northEast, 'material');
const southWest =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z"/></svg>';
registerIconFromText('south_west', southWest, 'material');
const more =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>';
registerIconFromText('more', more, 'material');
const chart =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z"/></svg>';
registerIconFromText('chart', chart, 'material');

function handleMaximizeClick(event: Event) {
  const tile = (event.target as HTMLElement).closest('igc-tile');

  if (tile) {
    tile.maximized = !tile.maximized;

    const defaultActionsSlot = tile.querySelector(
      '[slot="default-actions"]'
    ) as HTMLElement;
    const currentButton = event.target as HTMLElement;

    if (currentButton) {
      if (tile.maximized) {
        currentButton.setAttribute('name', 'south_west');
        currentButton.setAttribute('aria-label', 'collapse');

        const chartBtn = document.createElement('igc-icon-button');
        chartBtn.classList.add('additional-action');
        chartBtn.setAttribute('variant', 'flat');
        chartBtn.setAttribute('collection', 'material');
        chartBtn.setAttribute('name', 'chart');
        chartBtn.setAttribute('aria-label', 'chart');

        const moreBtn = document.createElement('igc-icon-button');
        moreBtn.classList.add('additional-action');
        moreBtn.setAttribute('variant', 'flat');
        moreBtn.setAttribute('collection', 'material');
        moreBtn.setAttribute('name', 'more');
        moreBtn.setAttribute('aria-label', 'more');

        defaultActionsSlot.insertBefore(chartBtn, currentButton);
        defaultActionsSlot.insertBefore(moreBtn, currentButton);
      } else {
        currentButton.setAttribute('name', 'north_east');
        currentButton.setAttribute('aria-label', 'expand');

        const additionalButtons =
          defaultActionsSlot.querySelectorAll('.additional-action');
        additionalButtons.forEach((btn) => btn.remove());
      }
    }
  }
}

export const CustomActions: Story = {
  render: (args) => html`
    <style>
      p {
        padding: 1rem;
      }
    </style>
    <igc-tile-manager
      .dragMode=${args.dragMode}
      .resizeMode=${args.resizeMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
      <igc-tile>
        <h3 slot="title">Custom Actions</h3>
        <div slot="default-actions" id="default-actions">
          <igc-icon-button
            slot="default-actions"
            variant="flat"
            collection="material"
            exportparts="icon"
            name="north_east"
            aria-label="north_east"
            @click=${handleMaximizeClick}
          ></igc-icon-button>
        </div>

        <p>
          Set custom content for the default-actions slot based on maximized
          state of the tile
        </p>
      </igc-tile>
      <igc-tile col-span="2">
        <h3 slot="title">Empty Fullscreen Action</h3>
        <div slot="fullscreen-action"></div>

        <p>Empty div added to the fullscreen action slot</p>
      </igc-tile>
      <igc-tile col-span="2">
        <h3 slot="title">Default Actions</h3>

        <p>This tile has default actions</p>
      </igc-tile>
    </igc-tile-manager>
  `,
};
