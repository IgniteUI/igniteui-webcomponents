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
    minColumnWidth: {
      type: 'number',
      control: 'number',
      table: { defaultValue: { summary: '150' } },
    },
    minRowHeight: {
      type: 'number',
      control: 'number',
      table: { defaultValue: { summary: '200' } },
    },
  },
  args: {
    dragMode: 'slide',
    columnCount: 10,
    minColumnWidth: 150,
    minRowHeight: 200,
  },
};

export default metadata;

interface IgcTileManagerArgs {
  /** Determines whether the tiles slide or swap on drop. */
  dragMode: 'slide' | 'swap';
  columnCount: number;
  minColumnWidth: number;
  minRowHeight: number;
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
      <igc-tile
        .colSpan=${3}
        .rowSpan=${9}
        .disableResize=${i === 0}
        .disableDrag=${i === 0}
      >
        <igc-tile-header slot="header">
          <h3 slot="title">Tile ${i + 1} Title</h3>
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

const date = new Date();

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

export const FinDashboard: Story = {
  render: (args) => html`
    <igc-tile-manager>
      <igc-tile
        .colSpan=${3}
        .rowSpan=${5}
        @igcTileMaximize=${cancelStateChangeEvent}
      >
        <igc-tile-header slot="header">
          <span slot="title">Good morning, John</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${1}>
        <igc-tile-header slot="header">
          <span slot="title">Spendings</span>
        </igc-tile-header>

        <p>$10,230</p>
      </igc-tile>

      <igc-tile .colSpan=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Spendings</span>
        </igc-tile-header>

        <igc-list id="list" style="overflow-y: auto;">
          <igc-list-item>
            <igc-avatar
              slot="start"
              src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/building.svg"
              shape="circle"
              >H</igc-avatar
            >
            <h2 slot="title">Hotel</h2>
            <span slot="subtitle">Jun 21, 06:15</span>
            <div slot="end" class="stock-price">
              <span>- 400,00 $</span>
            </div>
          </igc-list-item>

          <igc-list-item>
            <igc-avatar
              slot="start"
              src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/atm.svg"
              shape="circle"
              >ATM</igc-avatar
            >
            <h2 slot="title">Cash at ATM 000000</h2>
            <span slot="subtitle">14:40</span>
            <div slot="end" class="stock-price">
              <span>- 140$</span>
            </div>
          </igc-list-item>
        </igc-list>
      </igc-tile>

      <igc-tile .colSpan=${4}>
        <igc-tile-header slot="header">
          <span slot="title">Your Progress</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${3}>
        <igc-tile-header slot="header">
          <span slot="title">Income Source</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${1}>
        <igc-tile-header slot="header">
          <span slot="title">Income</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${6}>
        <igc-tile-header slot="header">
          <span slot="title">Notifications</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${5}>
        <igc-tile-header slot="header">
          <span slot="title">Incomes & Expenses</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${5}>
        <igc-tile-header slot="header">
          <span slot="title">Assets</span>
        </igc-tile-header>

        <igc-rating
          class="size-large"
          label="Your level: Basic"
          value="2.5"
          step=".5"
          hover-preview
        ></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>
    </igc-tile-manager>

    <igc-button @click=${disableTileResize}>
      Toggle Tile 2 Resizing
    </igc-button>
  `,
};

export const FinDashboard1: Story = {
  render: (args) => html`
    <igc-tile-manager>
      <igc-tile .colSpan=${3} .rowSpan=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Good morning, John</span>
        </igc-tile-header>

        <igc-rating class="size-large" label="Your level: Basic" value="2.5" step=".5" hover-preview></igc-rating>
        <p>Total net worth: $123,000</p>
      </igc-tile>

      <igc-tile .colSpan=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Accounts</span>
        </igc-tile-header>

        <igc-list class="list">
          <igc-list-item>
            <igc-avatar src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              EUR
            </p>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              USD
            </p>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              BTC
            </p>
          </igc-list-item>
        </igc-list>
      </igc-tile>

      <igc-tile .colSpan=${5}>
        <igc-tile-header slot="header">
          <span slot="title">Get Verified</span>
        </igc-tile-header>

        <span slot="subtitle">Want to spend more and enjoy the full experience? Get verified today to lift your limits.</span>

        <igc-stepper id="stepper">
          <igc-step>
            <span slot="title">Personal Details</span>
            </br>
            <form>
              <igc-input required label="Full Name" type="text" name="fullName"></igc-input>
              <igc-input required label="Email" type="email" name="email"></igc-input>
              <br />
              <igc-button class="next" onclick="stepper.next()">NEXT</igc-button>
            </form>
          </igc-step>
          <igc-step>
            <span slot="title">Address Details</span>
            </br>
            <form>
              <igc-input required label="Country" type="text" name="country"></igc-input>
              <igc-input required label="Address" type="text" name="address"></igc-input>
              <br />
              <igc-button onclick="stepper.prev()">PREVIOUS</igc-button>
              <igc-button class="next" onclick="stepper.next()">NEXT</igc-button>
            </form>
          </igc-step>
          <igc-step>
            <span slot="title">KYC Verification</span>
            </br>
            <igc-button onclick="stepper.prev()">PREVIOUS</igc-button>
            <igc-button onclick="stepper.reset()">RESET</igc-button>
          </igc-step>
        </igc-stepper>
      </igc-tile>

      <igc-tile .colSpan=${3}>
        <igc-tile-header slot="header">
          <span slot="title">Spending overview</span>
        </igc-tile-header>
        <igc-tabs>
          <igc-tab panel="daily">Daily</igc-tab>
          <igc-tab panel="weekly">Weekly</igc-tab>
          <igc-tab panel="monthly">Monthly</igc-tab>

          <igc-tab-panel id="daily">
            <igc-list id="list" style="overflow-y: auto;">
              <igc-list-item>
                <igc-date-picker id="date-picker" .value=${date}></igc-date-picker>
                <igc-linear-progress value="54" label-format="Daily Limit: $1000"></igc-linear-progress>
              </igc-list-item>

              <igc-list-item>
                <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/building.svg" shape="circle">H</igc-avatar>
                <h2 slot="title">Hotel</h2>
                <span slot="subtitle">Jun 21, 06:15</span>
                <div slot="end" class="stock-price">
                  <span>- 400,00 $</span>
                </div>
              </igc-list-item>

              <igc-list-item>
                <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/atm.svg" shape="circle">ATM</igc-avatar>
                <h2 slot="title">Cash at ATM 000000</h2>
                <span slot="subtitle">14:40</span>
                <div slot="end" class="stock-price">
                  <span>- 140$</span>
                </div>
              </igc-list-item>

              <igc-list-item>
                <igc-chip>Total amount spent: $540</igc-chip>
              </igc-list-item>
            </igc-list>

          </igc-tab-panel>
          <igc-tab-panel id="weekly">Details tab panel</igc-tab-panel>
          <igc-tab-panel id="monthly">Custom tab panel</igc-tab-panel>
        </igc-tabs>
      </igc-tile>

      <igc-tile .colSpan=${3}>
        <igc-tile-header slot="header">
          <span slot="title">Your Cards</span>
        </igc-tile-header>
        <igc-card style="overflow-y: auto;" elevated>
          <igc-card-content>
            <igc-button class="size-small" variant="flat" class="add-card-btn">
              + Add Card
            </igc-button>
            <igc-list id="list" style="overflow-y: auto;">
              <igc-list-item>
                <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/mastercard.svg" shape="circle">MC</igc-avatar>
                <h2 slot="title">Standard **0000</h2>
                <span slot="subtitle">Expires on 11/26</span>
              </igc-list-item>
              <igc-list-item>
                <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/visa.svg" shape="circle">VISA</igc-avatar>
                <h2 slot="title">Rose gold **0000</h2>
                <span slot="subtitle">Expires on 11/24</span>
              </igc-list-item>
              <igc-list-item>
                <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/visa.svg" shape="circle">VISA</igc-avatar>
                <h2 slot="title">Virtual card **0000</h2>
                <span slot="subtitle">Expires on 10/22</span>
              </igc-list-item>
            </igc-list>
          </igc-card-content>
        </igc-card>
      </igc-tile>

      <igc-tile .colSpan=${4}>
      <igc-tile-header slot="header">
          <span slot="title">Latest Transactions</span>
        </igc-tile-header>
        <igc-list id="list" style="overflow-y: auto;">
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/cash-2.svg" shape="circle">AMZN</igc-avatar>
            <h2 slot="title">Money added via **0000</h2>
            <span slot="subtitle">14:40</span>
            <div slot="end" class="stock-price">
              <span>+ 2000$</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/cash-only.svg" shape="circle">SET</igc-avatar>
            <h2 slot="title">Sports Event Tickets</h2>
            <span slot="subtitle">Jun 21, 06:15, Declined because your card is inactive</span>
            <div slot="end" class="stock-price">
              <span style="text-decoration: line-through;">1017,08 $</span>
              <span style="color: lightgray;">900,08 $</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/cash-only.svg" shape="circle">AT</igc-avatar>
            <h2 slot="title">Airplane Tickets</h2>
            <span slot="subtitle">Jun 21, 06:15, Declined because your card is inactive</span>
            <div slot="end" class="stock-price">
              <span style="text-decoration: line-through;">985,00 $</span>
              <span style="color: lightgray;">980,00 $</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/building.svg" shape="circle">H</igc-avatar>
            <h2 slot="title">Hotel</h2>
            <span slot="subtitle">Jun 21, 06:15</span>
            <div slot="end" class="stock-price">
              <span>- 400,00 $</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/atm.svg" shape="circle">ATM</igc-avatar>
            <h2 slot="title">Cash at ATM 000000</h2>
            <span slot="subtitle">14:40</span>
            <div slot="end" class="stock-price">
              <span>- 140$</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/cash-1.svg" shape="circle">U</igc-avatar>
            <h2 slot="title">Utilities</h2>
            <span slot="subtitle">21/06/2021 16:00</span>
            <div slot="end" class="stock-price">
              <span>- 200$</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/atm.svg" shape="circle">ATM</igc-avatar>
            <h2 slot="title">Cash at ATM 000001</h2>
            <span slot="subtitle">10:10</span>
            <div slot="end" class="stock-price">
              <span>- 280$</span>
            </div>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar slot="start" src="https://raw.githubusercontent.com/IgniteUI/material-icons-extended/363c7f3e2da72df5fc2eb63b762a4e69f6fbc603/src/svgs/cash-2.svg" shape="circle">MA</igc-avatar>
            <h2 slot="title">Money added via **0000</h2>
            <span slot="subtitle">14:40</span>
            <div slot="end" class="stock-price">
              <span>+ 2000$</span>
            </div>
          </igc-list-item>
        </igc-list>
      </igc-tile>
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
  render: () => html`
    <style>
      igc-tile-manager {
        margin: 0 auto;
        height: 75lvh;
        width: 75lvw;
      }
    </style>

    <igc-tile-manager>
      <igc-tile
        id="max-tile"
        maximized
        @igcTileFullscreen=${cancelStateChangeEvent}
      >
        <igc-tile-header slot="header"></igc-tile-header>
        <h1>I am Maximized</h1>
        <igc-button @click=${toggleMaximizedTile}
          >Toggle maximized state</igc-button
        >
      </igc-tile>
      <igc-tile rowStart="5">
        <igc-tile-header slot="header"></igc-tile-header>
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
