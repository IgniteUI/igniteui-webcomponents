import type { Meta, StoryObj } from '@storybook/web-components';
import { type TemplateResult, html } from 'lit';
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
      description: 'Sets the gap size between tiles in the tile manager.',
      control: 'text',
    },
  },
  args: { resizeMode: 'none', dragMode: 'none', columnCount: 0 },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Whether resize operations are enabled. */
  resizeMode: 'none' | 'hover' | 'always';
  /** Whether drag and drop operations are enabled. */
  dragMode: 'none' | 'tile-header' | 'tile';
  /**
   * Sets the number of columns for the tile manager.
   * Setting value <= than zero will trigger a responsive layout.
   */
  columnCount: number;
  /** Sets the minimum width for a column unit in the tile manager. */
  minColumnWidth: string;
  /** Sets the minimum height for a row unit in the tile manager. */
  minRowHeight: string;
  /** Sets the gap size between tiles in the tile manager. */
  gap: string;
}
type Story = StoryObj<IgcTileManagerArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

const indicatorIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M3.993 12.508V.765h-.979v11.743h.979ZM1.54 10.06V3.21H.56v6.85h.98Z" fill="#09F"/></svg>';

registerIconFromText('indicator', indicatorIcon);

const tiles = Array.from(
  map(
    range(10),
    (i) => html`
      <igc-tile .disableResize=${i === 0}>
        <h3 slot="title">Tile ${i + 1} Title</h3>

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
          <igc-tile disable-fullscreen disable-maximize>
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
  content?: TemplateResult;
}

const productsData = [
  {
    productID: 1,
    productName: 'Carnavon Tigers',
    quantity: 12,
    unitPrice: 50,
    discount: 0,
  },
  {
    productID: 2,
    productName: 'Guarana Fantastica',
    quantity: 10,
    unitPrice: 4,
    discount: 0,
  },
  {
    productID: 3,
    productName: 'Vegie-spread',
    quantity: 5,
    unitPrice: 35,
    discount: 0,
  },
  {
    productID: 4,
    productName: 'Rhonbrau Klosterbier',
    quantity: 7,
    unitPrice: 6,
    discount: 0,
  },
];

const listContent = () => html`
  <style>
    .content {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  </style>
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
  <igc-list class="list">
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> list_alt </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>OrderID</p>
        <p>10293</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> list_alt </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Customer Name</p>
        <p>Tortuga Restaurante</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> calendar_month </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Order Date</p>
        <p>August 29, 1996</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> calendar_month </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Shipped Date</p>
        <p>September 11, 1996</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> list_alt </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Product Name</p>
        <p>Carnavon Tigers</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> list_alt </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Shipper Name</p>
        <p>Federal Shipping</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> list_alt </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Ship Country</p>
        <p>Mexico</p>
      </div>
    </igc-list-item>
    <igc-list-item>
      <igc-avatar slot="start" shape="circle" class="avatar">
        <span class="material-icons"> calendar_month </span>
      </igc-avatar>
      <div slot="title" class="content">
        <p>Required Date</p>
        <p>September 26, 1996</p>
      </div>
    </igc-list-item>
  </igc-list>
`;

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

const stringContent = (value: string) => html`
  <style>
    .string {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
  <div class="string"><h1>${value}</h1></div>
`;

const imageContent = (img: string) => html`
  <style>
    .picture {
      display: flex;
      width: 100%;
      height: 80%;
      justify-content: center;

      img {
        max-width: 100%;
        height: auto;
      }
    }
  </style>
  <div class="picture"><img src="${img}" alt="picture" /></div>
`;

const cardContent = () =>
  html` <style>
      .group {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        flex-wrap: wrap;
      }
      .card {
        min-height: 30px;
        width: 320px;
        min-width: 320px;
        max-width: 320px;
        grid-column-start: 2;
        grid-row-start: 2;
        flex-direction: row;
      }
      .group_1 {
        flex-grow: 1;
      }
      .h5 {
        margin: 0 0 16px;
        height: max-content;
        min-width: min-content;
      }
      .body-content {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .column {
        display: flex;
        flex-direction: column;
      }
    </style>
    <div class="group">
      ${productsData.map(
        (item) =>
          html` <igc-card class="card">
            <div class="group_1">
              <igc-card-header>
                <div slot="thumbnail">
                  <igc-avatar shape="circle">
                    <span class="material-icons">
                      production_quantity_limits
                    </span>
                  </igc-avatar>
                </div>
                <h3 slot="title">${item.productName}</h3>
              </igc-card-header>
              <igc-card-content class="column">
                <div class="body-content">
                  <span>Quantity</span> <span>${item.quantity}</span>
                </div>
                <div class="body-content">
                  <span>Unit Price</span> <span>$${item.unitPrice}</span>
                </div>
              </igc-card-content>
            </div>
          </igc-card>`
      )}
    </div>`;

const renderDashboardTM = (
  items: Visualization[],
  args: IgcTileManagerArgs
) => html`
  <igc-tile-manager
    .gap=${args.gap}
    .resizeMode=${args.resizeMode}
    .dragMode=${args.dragMode}
    .columnCount=${60}
    .minColumnWidth=${'5px'}
    .minRowHeight=${'5px'}
  >
    ${items?.map(
      (viz) => html`
        <igc-tile
          .colSpan=${viz.columnSpan}
          .rowSpan=${viz.rowSpan}
          .disableResize=${false}
        >
          <span slot="title">${viz.title}</span>
          ${viz.content || 'TEST CONTENT'}
        </igc-tile>
      `
    )}
  </igc-tile-manager>
`;

const orderDetailsVisualizations: Visualization[] = [
  { title: '', columnSpan: 15, rowSpan: 60, content: listContent() },
  {
    title: 'Order Line Items',
    columnSpan: 45,
    rowSpan: 20,
    content: cardContent(),
  },
  {
    title: 'Order Value',
    columnSpan: 17,
    rowSpan: 10,
    content: stringContent('$8.66K'),
  },
  {
    title: 'Line Items',
    columnSpan: 13,
    rowSpan: 10,
    content: stringContent('4'),
  },
  {
    title: 'Avg Discount',
    columnSpan: 15,
    rowSpan: 10,
    content: stringContent('0.00'),
  },
  {
    title: 'Products',
    columnSpan: 45,
    rowSpan: 30,
    content: imageContent(
      'https://as2.ftcdn.net/v2/jpg/05/62/32/91/1000_F_562329142_K4HsDuOo3Thhf7rab7I4E0oz8en78nd9.jpg'
    ),
  },
];

const salesVisualizations: Visualization[] = [
  {
    title: 'Sales',
    columnSpan: 12,
    rowSpan: 15,
    content: trendContent(4592177, -40.86),
  },
  {
    title: 'Total Opportunities',
    columnSpan: 12,
    rowSpan: 15,
    content: trendContent(779903, 1.35),
  },
  {
    title: 'Leads by Year',
    columnSpan: 36,
    rowSpan: 35,
    content: imageContent(
      'https://community.tableau.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=0684T000001hlEa&operationContext=CHATTER&contentId=05T4T0000079c8R&page=0'
    ),
  },
  {
    title: 'Revenue by State',
    columnSpan: 24,
    rowSpan: 45,
    content: imageContent(
      'https://static01.nyt.com/newsgraphics/2021/02/24/state-tax-revenue-map/36b53ac5076ed3c055083850c07f5c2adbe3d43d/state-tax-revnue-map-1050.png'
    ),
  },
  {
    title: 'New Seats Avg by Employee',
    columnSpan: 16,
    rowSpan: 25,
    content: imageContent(
      'https://www.slideteam.net/media/catalog/product/cache/1280x720/h/o/horizontal_bar_graph_depicting_forecasted_and_actual_sales_slide01.jpg'
    ),
  },
  {
    title: 'Sales by Product',
    columnSpan: 20,
    rowSpan: 25,
    content: imageContent(
      'https://blog.logrocket.com/wp-content/uploads/2023/06/new-vs-recurring-revenue-chart-example-1.png'
    ),
  },
];

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
    ${renderDashboardTM(orderDetailsVisualizations, args)}
  `,
};

export const FinDashboard1: Story = {
  render: (args) => html` ${renderDashboardTM(salesVisualizations, args)} `,
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
      <igc-tile disable-resize>
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

    const actionsSlot = tile.querySelector('[slot="actions"]') as HTMLElement;
    const currentBtn = event.target as HTMLElement;

    if (currentBtn) {
      if (tile.maximized) {
        currentBtn.setAttribute('name', 'south_west');
        currentBtn.setAttribute('aria-label', 'collapse');

        const chartBtn = document.createElement('igc-icon-button');
        chartBtn.classList.add('additional-action');
        chartBtn.setAttribute('slot', 'actions');
        chartBtn.setAttribute('variant', 'flat');
        chartBtn.setAttribute('collection', 'material');
        chartBtn.setAttribute('name', 'chart');
        chartBtn.setAttribute('aria-label', 'chart');

        const moreBtn = document.createElement('igc-icon-button');
        moreBtn.classList.add('additional-action');
        moreBtn.setAttribute('slot', 'actions');
        moreBtn.setAttribute('variant', 'flat');
        moreBtn.setAttribute('collection', 'material');
        moreBtn.setAttribute('name', 'more');
        moreBtn.setAttribute('aria-label', 'more');

        tile.append(chartBtn);
        tile.append(moreBtn);
      } else {
        currentBtn.setAttribute('name', 'north_east');
        currentBtn.setAttribute('aria-label', 'expand');

        const additionalButtons =
          actionsSlot.parentElement?.querySelectorAll('.additional-action');
        additionalButtons?.forEach((btn) => btn.remove());
      }
    }
  }
}

export const CustomActions: Story = {
  render: (args) => html`
    <style>
      .side,
      .corner,
      .bottom {
        display: inline;
      }

      .corner {
        transform: rotate(220deg);
        bottom: 8px;
        right: 8px;
      }

      .bottom {
        transform: rotate(90deg);
      }

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
      <igc-tile disable-fullscreen disable-maximize>
        <h3 slot="title">Custom Actions</h3>
        <igc-icon slot="side-adorner" class="side" name="indicator"></igc-icon>
        <igc-icon
          slot="corner-adorner"
          class="corner"
          name="indicator"
        ></igc-icon>
        <igc-icon
          slot="bottom-adorner"
          class="bottom"
          name="indicator"
        ></igc-icon>

        <igc-icon-button
          slot="actions"
          variant="flat"
          collection="material"
          exportparts="icon"
          name="north_east"
          aria-label="north_east"
          @click=${handleMaximizeClick}
        ></igc-icon-button>

        <p>
          Set custom content for the default-actions slot based on maximized
          state of the tile
        </p>
      </igc-tile>
      <igc-tile col-span="2" disable-fullscreen>
        <h3 slot="title">No Fullscreen Action</h3>

        <p>Fullscreen is disabled via property</p>
      </igc-tile>
      <igc-tile col-span="2">
        <h3 slot="title">Default Actions</h3>

        <p>This tile has default actions and title</p>
      </igc-tile>
      <igc-tile>
        <p>Header with no title</p>
      </igc-tile>
      <igc-tile disable-fullscreen disable-maximize>
        <h3 slot="title">Only title</h3>

        <p>Display only title in the header</p>
      </igc-tile>
      <igc-tile disable-fullscreen disable-maximize>
        <igc-icon-button
          slot="actions"
          variant="flat"
          collection="material"
          exportparts="icon"
          name="north_east"
        ></igc-icon-button>
        <igc-icon-button
          slot="actions"
          variant="flat"
          collection="material"
          exportparts="icon"
          name="south_west"
        ></igc-icon-button>

        <p>Display only custom actions in the header</p>
      </igc-tile>
      <igc-tile disable-fullscreen disable-maximize>
        <p>No header</p>
      </igc-tile>
    </igc-tile-manager>
  `,
};
