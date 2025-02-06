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
        <igc-tile-header slot="header">
          <h3 slot="title">Tile ${i + 1} Title</h3>
          <igc-icon name="home" slot="actions"></igc-icon>
        </igc-tile-header>

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

export const FinDashboard: Story = {
  render: (args) => html`
    <style>
      igc-tile::part(content-container) {
        padding: 1rem;
      }
    </style>

    <igc-tile-manager
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
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
    <igc-button @click=${toggleFullscreen}>
      Toggle Tile 1 Fullscreen prop
    </igc-button>
  `,
};

export const FinDashboard1: Story = {
  render: (args) => html`
    <igc-tile-manager
      .gap=${args.gap}
      .resizeMode=${args.resizeMode}
      .dragMode=${args.dragMode}
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
    >
      <igc-tile .colSpan=${2} .rowSpan=${1} .colStart=${2} .rowStart=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Accounts</span>
        </igc-tile-header>
      </igc-tile>


      <igc-tile .colSpan=${3} .rowSpan=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Good morning, John</span>
        </igc-tile-header>

        <div>
          <igc-rating class="size-large" label="Your level: Basic" value="2.5" step=".5" hover-preview></igc-rating>
          <p>Total net worth: $123,000</p>
          <h4>Spending Overview</h4>
        </div>

        <igc-divider></igc-divider>

        <igc-tabs>
          <igc-tab panel="daily">Daily</igc-tab>
          <igc-tab panel="weekly">Weekly</igc-tab>
          <igc-tab panel="monthly">Monthly</igc-tab>

          <igc-tab-panel id="daily">
            <igc-list id="list" style="overflow-y: auto;">
              <igc-list-item>
                <igc-date-picker id="date-picker" .value=${date}></igc-date-picker>
                <igc-linear-progress value="74" label-format="Daily Limit: $1000"></igc-linear-progress>
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
                <igc-chip>Total amount spent: $740</igc-chip>
              </igc-list-item>
            </igc-list>

          </igc-tab-panel>
          <igc-tab-panel id="weekly">Details tab panel</igc-tab-panel>
          <igc-tab-panel id="monthly">Custom tab panel</igc-tab-panel>
        </igc-tabs>
      </igc-tile>

      <igc-tile .colSpan=${2}>
        <igc-tile-header slot="header">
          <span slot="title">Accounts</span>
        </igc-tile-header>

        <igc-list class="list">
          <igc-list-item>
            <igc-avatar src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV7nAPFKxnp1qbtogJya1mdIzIFTZXg4P_kw&s" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              EUR
            </p>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar src="https://media.istockphoto.com/id/1151557689/vector/vector-image-of-a-flat-isolated-icon-dollar-sign-currency-exchange-dollar-united-states.jpg?s=612x612&w=0&k=20&c=XxoU_vrc2LCsrlRnmZHysq6HG_tBIUsPVVxi0VeTCKA=" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              USD
            </p>
          </igc-list-item>
          <igc-list-item>
            <igc-avatar src="https://static.vecteezy.com/system/resources/thumbnails/006/060/118/small_2x/bitcoin-logo-crypto-currency-symbol-free-vector.jpg" shape="rounded" slot="start"></igc-avatar>
            <p class="typography__subtitle-2 text_1">
              BTC
            </p>
          </igc-list-item>
        </igc-list>
      </igc-tile>

      <igc-tile .colSpan=${2}>
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

      <igc-tile .colSpan=${3}>
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
        </igc-list>
      </igc-tile>

      <igc-tile .colSpan=${7} .disableDrag=${true} .disableResize=${true}>
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

function toggleFullscreen() {
  const tileManager =
    document.querySelector<IgcTileManagerComponent>('igc-tile-manager')!;
  tileManager.tiles[1].fullscreen = !tileManager.tiles[1].fullscreen;
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
        <igc-tile-header slot="header"></igc-tile-header>
        <h1>I am Maximized</h1>
        <igc-button @click=${toggleMaximizedTile}
          >Toggle maximized state</igc-button
        >
      </igc-tile>
      <igc-tile row-start="5">
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
        <igc-tile-header slot="header">
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
        </igc-tile-header>

        <p>
          Set custom content for the default-actions slot based on maximized
          state of the tile
        </p>
      </igc-tile>
      <igc-tile col-span="2">
        <igc-tile-header slot="header">
          <h3 slot="title">Empty Fullscreen Action</h3>
          <div slot="fullscreen-action"></div>
        </igc-tile-header>

        <p>Empty div added to the fullscreen action slot</p>
      </igc-tile>
      <igc-tile col-span="2">
        <igc-tile-header slot="header">
          <h3 slot="title">Default Actions</h3>
        </igc-tile-header>

        <p>This tile has default actions</p>
      </igc-tile>
    </igc-tile-manager>
  `,
};
