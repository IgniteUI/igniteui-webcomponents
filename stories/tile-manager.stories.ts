import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { type TemplateResult, html, nothing } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';

import { gitMerge, pullRequest } from '@igniteui/material-icons-extended';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  type IgcDropdownItemComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  type IgcTileChangeStateEventArgs,
  type IgcTileComponent,
  IgcTileManagerComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  focusAfterUpdate,
  plural,
  prefersReducedMotion,
  readStored,
  renderInto,
  storyStyles,
  wholeDollars,
  writeStored,
} from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  IgcTileManagerComponent
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
      type: { name: 'enum', value: ['none', 'hover', 'always'] },
      description: 'The resize mode of the tiles. `none` turns resizing off.',
      options: ['none', 'hover', 'always'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
    dragMode: {
      type: { name: 'enum', value: ['none', 'tile-header', 'tile'] },
      description:
        'The drag mode of the tiles. `none` turns drag and drop off.',
      options: ['none', 'tile-header', 'tile'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
    columnCount: {
      type: 'number',
      description:
        'The number of columns. A value of 0 or less gives a responsive layout.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    minColumnWidth: {
      type: 'string',
      description: 'The minimum width of a column.',
      control: 'text',
    },
    minRowHeight: {
      type: 'string',
      description: 'The minimum height of a row.',
      control: 'text',
    },
    gap: {
      type: 'string',
      description: 'The gap between the tiles.',
      control: 'text',
    },
  },
  args: { resizeMode: 'none', dragMode: 'none', columnCount: 0 },
};

export default metadata;

interface IgcTileManagerArgs {
  /** The resize mode of the tiles. `none` turns resizing off. */
  resizeMode: 'none' | 'hover' | 'always';
  /** The drag mode of the tiles. `none` turns drag and drop off. */
  dragMode: 'none' | 'tile-header' | 'tile';
  /** The number of columns. A value of 0 or less gives a responsive layout. */
  columnCount: number;
  /** The minimum width of a column. */
  minColumnWidth: string;
  /** The minimum height of a row. */
  minRowHeight: string;
  /** The gap between the tiles. */
  gap: string;
}
type Story = StoryObj<IgcTileManagerArgs>;

// endregion

registerMaterialIcons(
  'adjust',
  'arrow-back',
  'arrow-forward',
  'check-circle',
  'close',
  'more-horiz',
  'plus',
  'sunny',
  'trending-down',
  'trending-up'
);

const styles = html`
  ${storyStyles}
  <style>
    /* The content of a tile fills the space under the header. */
    igc-tile::part(base) {
      display: flex;
      flex-direction: column;
    }

    igc-tile::part(content-container) {
      flex: 1;
      min-height: 0;
    }

    .tm-kpi {
      display: grid;
      align-content: center;
      gap: 0.25rem;
      height: 100%;
      padding-inline: 1rem;
    }

    .tm-kpi-value {
      font-size: 1.75rem;
      font-weight: 600;
    }

    .tm-trend {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .tm-trend igc-icon {
      --ig-icon-size: 1.25rem;

      flex: none;
    }

    .tm-up igc-icon {
      color: var(--ig-success-500);
    }

    .tm-down igc-icon {
      color: var(--ig-error-500);
    }

    .tm-list {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0.75rem 1rem;
      list-style: none;
    }

    .tm-list li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .tm-text {
      padding: 0.75rem 1rem;
    }

    .tm-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .tm-toolbar h3 {
      margin: 0 auto 0 0;
    }

    .tm-toolbar + p {
      min-height: 1.5em;
    }
  </style>
`;

const compactDollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const weekSales = [
  { day: 'Mon', value: 9120 },
  { day: 'Tue', value: 12_480 },
  { day: 'Wed', value: 10_340 },
  { day: 'Thu', value: 11_760 },
  { day: 'Fri', value: 15_210 },
  { day: 'Sat', value: 17_890 },
  { day: 'Sun', value: 8450 },
];

const bestWeekDay = Math.max(...weekSales.map(({ value }) => value));

const topProducts = [
  { name: 'Linen shirt', sold: 212 },
  { name: 'Canvas tote', sold: 187 },
  { name: 'Wool beanie', sold: 143 },
  { name: 'Leather wallet', sold: 121 },
  { name: 'Rain jacket', sold: 96 },
];

const kpiTile = (
  title: string,
  value: string,
  trend: 'up' | 'down',
  change: string
) => html`
  <igc-tile>
    <h3 slot="title">${title}</h3>
    <div class="tm-kpi">
      <span class="tm-kpi-value">${value}</span>
      <span class="tm-trend tm-${trend}">
        <igc-icon name="trending-${trend}"></igc-icon>
        ${change}
      </span>
    </div>
  </igc-tile>
`;

export const Default: Story = {
  args: {
    resizeMode: 'hover',
    dragMode: 'tile-header',
    minColumnWidth: '15rem',
    minRowHeight: '10rem',
    gap: '1rem',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The overview of an online store. With `column-count` at 0, the manager makes as many columns as fit `min-column-width`, so the tiles flow to the width of the page. `col-span` and `row-span` make the chart and the product list larger. Each title is a heading in the `title` slot, so screen reader users can go from tile to tile by heading. Drag a tile by its header to move it, and point at a tile to show the resize handles on its edges. The buttons in the header maximize a tile inside the manager or show it in full screen. Use the controls panel to change the modes and the grid.',
      },
    },
  },
  render: (args) => html`
    ${styles}
    <style>
      .tm-bars {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        box-sizing: border-box;
        height: 100%;
        margin: 0;
        padding: 0.75rem 1rem;
        list-style: none;
      }

      .tm-bars li {
        display: grid;
        grid-template-rows: auto 1fr auto;
        justify-items: center;
        gap: 0.25rem;
        min-height: 0;
        font-size: 0.875rem;
      }

      .tm-bar {
        align-self: end;
        width: 100%;
        height: calc(var(--share) * 100%);
        border-radius: 4px 4px 0 0;
        background: var(--ig-primary-500);
      }
    </style>
    <igc-tile-manager
      .columnCount=${args.columnCount}
      .minColumnWidth=${args.minColumnWidth}
      .minRowHeight=${args.minRowHeight}
      .gap=${args.gap}
      .dragMode=${args.dragMode}
      .resizeMode=${args.resizeMode}
    >
      ${kpiTile('Revenue', '$12,480', 'up', '8% more than last Tuesday')}
      ${kpiTile('Orders', '184', 'up', '12 more than last Tuesday')}
      ${kpiTile('Conversion', '3.2%', 'down', '0.4 points lower')}

      <igc-tile col-span="2" row-span="2">
        <h3 slot="title">Sales this week</h3>
        <ol class="tm-bars">
          ${weekSales.map(
            ({ day, value }) => html`
              <li>
                <span>${compactDollars.format(value)}</span>
                <span
                  class="tm-bar"
                  style=${styleMap({ '--share': value / bestWeekDay })}
                ></span>
                <span>${day}</span>
              </li>
            `
          )}
        </ol>
      </igc-tile>

      <igc-tile row-span="2">
        <h3 slot="title">Best sellers</h3>
        <ol class="tm-list">
          ${topProducts.map(
            ({ name, sold }) => html`
              <li>
                <span>${name}</span>
                <span class="muted">${sold} sold</span>
              </li>
            `
          )}
        </ol>
      </igc-tile>

      <igc-tile>
        <h3 slot="title">Low stock</h3>
        <ul class="tm-list">
          <li><span>Rain jacket, M</span><span class="muted">3 left</span></li>
          <li>
            <span>Wool beanie, grey</span><span class="muted">5 left</span>
          </li>
        </ul>
      </igc-tile>
    </igc-tile-manager>
  `,
};

type WidgetId = 'weather' | 'agenda' | 'tasks' | 'inbox' | 'steps' | 'notes';

interface Widget {
  title: string;
  colSpan?: number;
  rowSpan?: number;
  content: () => TemplateResult;
}

const widgets: Record<WidgetId, Widget> = {
  weather: {
    title: 'Weather',
    content: () => html`
      <div class="tm-kpi">
        <span class="tm-trend"><igc-icon name="sunny"></igc-icon> Lisbon</span>
        <span class="tm-kpi-value">21 °C</span>
        <span class="muted">Sunny, wind 12 km/h</span>
      </div>
    `,
  },
  agenda: {
    title: 'Agenda',
    rowSpan: 2,
    content: () => html`
      <ul class="tm-list">
        <li><span>Stand-up</span><span class="muted">9:30</span></li>
        <li><span>Design review</span><span class="muted">11:00</span></li>
        <li><span>Lunch with Maya</span><span class="muted">12:30</span></li>
        <li><span>Dentist</span><span class="muted">16:00</span></li>
      </ul>
    `,
  },
  tasks: {
    title: 'Tasks',
    rowSpan: 2,
    content: () => html`
      <ul class="tm-list">
        <li><span>Send the invoice</span><span class="muted">Today</span></li>
        <li><span>Book the flights</span><span class="muted">Today</span></li>
        <li>
          <span>Renew the passport</span><span class="muted">Friday</span>
        </li>
      </ul>
    `,
  },
  inbox: {
    title: 'Inbox',
    content: () => html`
      <div class="tm-kpi">
        <span class="tm-kpi-value">5 unread</span>
        <span class="muted">The last one is from Maya Robinson.</span>
      </div>
    `,
  },
  steps: {
    title: 'Steps',
    content: () => html`
      <div class="tm-kpi">
        <span class="tm-kpi-value">6,240</span>
        <igc-linear-progress
          value="62"
          hide-label
          aria-label="Daily goal"
        ></igc-linear-progress>
        <span class="muted">62% of the daily goal of 10,000</span>
      </div>
    `,
  },
  notes: {
    title: 'Notes',
    colSpan: 2,
    content: () => html`
      <p class="tm-text">
        Buy a present for Ana before Saturday. Call the plumber about the
        kitchen tap.
      </p>
    `,
  },
};

const layoutKey = 'igc-story-tile-manager-layout';

export const CustomizeLayout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A personal dashboard that the user arranges. Customize turns on `drag-mode="tile"` and `resize-mode="always"`: drag a tile to move it, and drag the grip in the `corner-adorner` slot or the handles on the edges to resize it. Dragging is a pointer action, so each tile also gets Move back and Move forward buttons in the `actions` slot, which swap the `position` of two tiles. Done saves `saveLayout()` in the local storage, and the story restores it with `loadLayout()` on the next visit. `loadLayout()` finds the tiles by `id`, so each tile has a fixed `id`. Cancel restores the layout from before Customize, and Reset to default restores the layout of the first render.',
      },
    },
  },
  render: () => {
    const manager = createRef<IgcTileManagerComponent>();
    const toggle = createRef<IgcButtonComponent>();
    const order = Object.keys(widgets) as WidgetId[];
    let editing = false;
    let defaults = '';
    let before = '';
    let message = '';

    const restore = async (element?: Element) => {
      const tiles = element as IgcTileManagerComponent | undefined;

      if (!tiles || defaults) {
        return;
      }

      await tiles.updateComplete;
      defaults = tiles.saveLayout();

      try {
        tiles.loadLayout(readStored(layoutKey) ?? '');
      } catch {
        writeStored(layoutKey, null);
      }
    };

    const finish = (text: string) => {
      editing = false;
      message = text;
      story.update();
      toggle.value?.focus();
    };

    const customize = () => {
      if (editing) {
        writeStored(layoutKey, manager.value!.saveLayout());
        finish('Saved your layout.');
        return;
      }

      before = manager.value!.saveLayout();
      editing = true;
      message = '';
      story.update();
    };

    const cancel = () => {
      manager.value!.loadLayout(before);
      finish('Discarded the changes.');
    };

    const reset = () => {
      manager.value!.loadLayout(defaults);
      message = 'Restored the default layout. Select Done to keep it.';
      story.update();
    };

    const move = (id: WidgetId, step: -1 | 1) => () => {
      const tiles = manager.value!.tiles;
      const index = tiles.findIndex((tile) => tile.id === `tm-home-${id}`);
      const other = tiles[index + step];
      const { title } = widgets[id];

      if (other) {
        [tiles[index].position, other.position] = [
          other.position,
          tiles[index].position,
        ];
        message = `Moved ${title} to place ${index + step + 1} of ${tiles.length}.`;
      } else {
        message = `${title} is already ${step < 0 ? 'first' : 'last'}.`;
      }

      story.update();
    };

    const editActions = (id: WidgetId) => html`
      <igc-icon-button
        slot="actions"
        variant="flat"
        name="arrow-back"
        aria-label="Move ${widgets[id].title} back"
        @click=${move(id, -1)}
      ></igc-icon-button>
      <igc-icon-button
        slot="actions"
        variant="flat"
        name="arrow-forward"
        aria-label="Move ${widgets[id].title} forward"
        @click=${move(id, 1)}
      ></igc-icon-button>
      <span slot="corner-adorner" class="tm-grip"></span>
    `;

    const story = renderInto(
      () => html`
        <div class="tm-toolbar">
          <h3>My dashboard</h3>
          ${
            editing
              ? html`
                  <igc-button variant="flat" @click=${reset}>
                    Reset to default
                  </igc-button>
                  <igc-button variant="outlined" @click=${cancel}>
                    Cancel
                  </igc-button>
                `
              : nothing
          }
          <igc-button ${ref(toggle)} @click=${customize}>
            ${editing ? 'Done' : 'Customize'}
          </igc-button>
        </div>
        <p role="status">${message}</p>
        <igc-tile-manager
          ${ref(manager)}
          ${ref(restore)}
          class=${editing ? 'tm-editing' : ''}
          drag-mode=${editing ? 'tile' : 'none'}
          resize-mode=${editing ? 'always' : 'none'}
          min-column-width="14rem"
          min-row-height="11rem"
        >
          ${order.map((id) => {
            const { title, colSpan = 1, rowSpan = 1, content } = widgets[id];

            return html`
              <igc-tile
                id="tm-home-${id}"
                col-span=${colSpan}
                row-span=${rowSpan}
                disable-fullscreen
              >
                <h4 slot="title">${title}</h4>
                ${editing ? editActions(id) : nothing} ${content()}
              </igc-tile>
            `;
          })}
        </igc-tile-manager>
      `
    );

    return html`
      ${styles}
      <style>
        .tm-editing igc-tile::part(base) {
          cursor: grab;
        }

        /* A resize grip like the one of a text area. */
        .tm-grip {
          display: block;
          width: 1rem;
          height: 1rem;
          background: linear-gradient(
            135deg,
            transparent 50%,
            var(--ig-gray-600) 50% 58%,
            transparent 58% 70%,
            var(--ig-gray-600) 70% 78%,
            transparent 78%
          );
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

export const WidgetGallery: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A dashboard that the user fills with widgets. Add widget opens a menu of the widgets that are not on the dashboard yet. The manager watches its children, so a tile that the app adds or removes joins or leaves the layout, and a new tile goes to the end. Each tile has a Remove button in the `actions` slot, and `disable-maximize` and `disable-fullscreen` hide the default actions. After a removal, the focus goes to the Remove button of the next tile, or to the menu button when the dashboard is empty. Drag a tile by its header to move it.',
      },
    },
  },
  render: () => {
    const menu = createRef<IgcDropdownComponent>();
    const manager = createRef<IgcTileManagerComponent>();
    let shown: WidgetId[] = ['agenda', 'tasks', 'inbox'];
    let message = '';

    const add = ({ detail }: CustomEvent<IgcDropdownItemComponent>) => {
      const id = detail.value as WidgetId;

      menu.value?.clearSelection();
      shown = [...shown, id];
      message = `Added ${widgets[id].title} at the end.`;
      story.update();
      story.host
        ?.querySelector(`[data-widget="${id}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    };

    const remove = (id: WidgetId) => () => {
      // The tiles in the order that the user sees.
      const visible = manager.value!.tiles.map(
        ({ dataset }) => dataset.widget as WidgetId
      );
      const index = visible.indexOf(id);
      const next = visible[index + 1] ?? visible[index - 1];

      shown = shown.filter((each) => each !== id);
      message = `Removed ${widgets[id].title}.`;
      story.update();

      const target = next
        ? story.host?.querySelector<HTMLElement>(`[data-remove="${next}"]`)
        : story.host?.querySelector<HTMLElement>('igc-button[slot="target"]');

      target?.focus();
    };

    const story = renderInto(() => {
      const hidden = (Object.keys(widgets) as WidgetId[]).filter(
        (id) => !shown.includes(id)
      );

      return html`
        <div class="tm-toolbar">
          <h3>Team space</h3>
          <igc-dropdown ${ref(menu)} @igcChange=${add}>
            <igc-button slot="target">
              <igc-icon slot="prefix" name="plus"></igc-icon>
              Add widget
            </igc-button>
            ${
              hidden.length
                ? hidden.map(
                    (id) => html`
                      <igc-dropdown-item value=${id}>
                        ${widgets[id].title}
                      </igc-dropdown-item>
                    `
                  )
                : html`
                    <igc-dropdown-item disabled>
                      Every widget is on the dashboard
                    </igc-dropdown-item>
                  `
            }
          </igc-dropdown>
        </div>
        <p role="status">
          ${message}
          ${
            shown.length
              ? nothing
              : 'The dashboard is empty. Add a widget from the menu.'
          }
        </p>
        <igc-tile-manager
          ${ref(manager)}
          drag-mode="tile-header"
          min-column-width="14rem"
          min-row-height="11rem"
        >
          ${repeat(
            shown,
            (id) => id,
            (id) => {
              const { title, colSpan = 1, rowSpan = 1, content } = widgets[id];

              return html`
                <igc-tile
                  data-widget=${id}
                  col-span=${colSpan}
                  row-span=${rowSpan}
                  disable-maximize
                  disable-fullscreen
                >
                  <h4 slot="title">${title}</h4>
                  <igc-icon-button
                    slot="actions"
                    data-remove=${id}
                    variant="flat"
                    name="close"
                    aria-label="Remove ${title}"
                    @click=${remove(id)}
                  ></igc-icon-button>
                  ${content()}
                </igc-tile>
              `;
            }
          )}
        </igc-tile-manager>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const regions = [
  { name: 'North America', quarters: [1.42, 1.51, 1.38, 1.66] },
  { name: 'Europe', quarters: [0.98, 1.04, 1.12, 1.21] },
  { name: 'Asia Pacific', quarters: [0.71, 0.76, 0.83, 0.92] },
  { name: 'Latin America', quarters: [0.33, 0.35, 0.31, 0.38] },
  { name: 'Middle East', quarters: [0.21, 0.24, 0.26, 0.29] },
  { name: 'Africa', quarters: [0.09, 0.11, 0.12, 0.14] },
].map(({ name, quarters }) => {
  const values = quarters.map((each) => each * 1_000_000);
  return { name, values, year: values.reduce((sum, each) => sum + each) };
});

const quarterTotals = [0, 1, 2, 3].map((quarter) =>
  regions.reduce((sum, { values }) => sum + values[quarter], 0)
);
const yearTotal = quarterTotals.reduce((sum, each) => sum + each);

export const QuarterlyReport: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A sales report whose tiles show more when they get more space. The revenue tile shows the three largest regions. Maximize it, or resize it to three columns, and it shows a table of every region by quarter. `igcTileMaximize` comes before the change and carries the new state, and `igcTileResizeEnd` comes after the new `col-span` is set, so the story renders the content from them. The one-sentence tile is a slide for a meeting: in full screen, a `:fullscreen` CSS rule makes its text large. The other tiles set `disable-resize`, and the small tiles set `disable-maximize`.',
      },
    },
  },
  render: () => {
    const revenue = createRef<IgcTileComponent>();
    let maximized = false;

    const maximize = ({ detail }: CustomEvent<IgcTileChangeStateEventArgs>) => {
      maximized = detail.state;
      story.update();
    };

    const summary = () => html`
      <ol class="tm-list">
        ${regions.slice(0, 3).map(
          ({ name, year }) => html`
            <li class="tm-region">
              <span>${name}</span>
              <span
                class="tm-meter"
                style=${styleMap({ '--share': year / regions[0].year })}
              ></span>
              <strong>${compactDollars.format(year)}</strong>
            </li>
          `
        )}
      </ol>
      <p class="tm-text muted">
        Maximize the tile, or make it three columns wide, to see every region by
        quarter.
      </p>
    `;

    const table = () => html`
      <table class="tm-table">
        <thead>
          <tr>
            <th scope="col">Region</th>
            ${quarterTotals.map(
              (_, quarter) => html`<th scope="col">Q${quarter + 1}</th>`
            )}
            <th scope="col">Year</th>
          </tr>
        </thead>
        <tbody>
          ${regions.map(
            ({ name, values, year }) => html`
              <tr>
                <th scope="row">${name}</th>
                ${values.map(
                  (value) => html`<td>${compactDollars.format(value)}</td>`
                )}
                <td>${compactDollars.format(year)}</td>
              </tr>
            `
          )}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            ${quarterTotals.map(
              (value) => html`<td>${compactDollars.format(value)}</td>`
            )}
            <td>${compactDollars.format(yearTotal)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const story = renderInto(() =>
      maximized || (revenue.value?.colSpan ?? 2) >= 3 ? table() : summary()
    );

    return html`
      ${styles}
      <style>
        .tm-scroll {
          height: 100%;
          overflow: auto;
        }

        .tm-list .tm-region {
          display: grid;
          grid-template-columns: 8rem 1fr auto;
          align-items: center;
        }

        .tm-meter {
          height: 0.5rem;
          width: calc(var(--share) * 100%);
          border-radius: 4px;
          background: var(--ig-primary-500);
        }

        .tm-table {
          width: 100%;
          border-collapse: collapse;
          font-variant-numeric: tabular-nums;
        }

        .tm-table :is(th, td) {
          padding: 0.5rem 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
          text-align: end;
        }

        .tm-table :is(thead th:first-child, tbody th, tfoot th) {
          text-align: start;
        }

        .tm-table tfoot {
          font-weight: 600;
        }

        .tm-slide {
          display: grid;
          place-items: center;
          height: 100%;
          padding: 1rem;
          text-align: center;
        }

        igc-tile:fullscreen .tm-slide {
          font-size: 3rem;
        }
      </style>
      <igc-tile-manager
        column-count="3"
        min-row-height="11rem"
        resize-mode="hover"
      >
        <igc-tile
          ${ref(revenue)}
          col-span="2"
          row-span="2"
          @igcTileMaximize=${maximize}
          @igcTileResizeEnd=${story.update}
        >
          <h3 slot="title" id="tm-revenue-title">Revenue by region</h3>
          <div
            ${story.mount}
            class="tm-scroll"
            role="region"
            tabindex="0"
            aria-labelledby="tm-revenue-title"
          ></div>
        </igc-tile>

        <igc-tile row-span="2" disable-resize>
          <h3 slot="title">Highlights</h3>
          <ul class="tm-list">
            <li>Revenue grew 18% over last year.</li>
            <li>Africa grew fastest: 56% from Q1 to Q4.</li>
            <li>The new Enterprise plan has 72 customers.</li>
          </ul>
        </igc-tile>

        <igc-tile disable-maximize disable-resize>
          <h3 slot="title">The year in one sentence</h3>
          <p class="tm-slide">
            Revenue grew to ${compactDollars.format(yearTotal)}, and every
            region grew.
          </p>
        </igc-tile>

        <igc-tile
          col-span="2"
          disable-maximize
          disable-fullscreen
          disable-resize
        >
          <h3 slot="title">Next quarter</h3>
          <p class="tm-text">
            We expect ${wholeDollars.format(4_900_000)} in revenue. The largest
            risk is the delay of the European data center, which moves 40
            customers to the second month of the quarter.
          </p>
        </igc-tile>
      </igc-tile-manager>
    `;
  },
};

type Status = 'todo' | 'progress' | 'review' | 'done';

interface BoardItem {
  ref: string;
  title: string;
  status: Status;
  pull?: boolean;
  labels: string[];
  priority: string;
  size: string;
  assignees: string[];
}

const statuses: Record<
  Status,
  { name: string; description: string; color: string; limit?: number }
> = {
  todo: {
    name: 'Todo',
    description: 'Work on these items has not started.',
    color: '#2da44e',
  },
  progress: {
    name: 'In progress',
    description: 'Someone works on these items now.',
    color: '#d4a72c',
    limit: 3,
  },
  review: {
    name: 'In review',
    description: 'These items wait for a code review.',
    color: '#218bff',
  },
  done: {
    name: 'Done',
    description: 'These items are complete.',
    color: '#8957e5',
  },
};

const statusIds = Object.keys(statuses) as Status[];

const labelColors: Record<string, string> = {
  accessibility: '#1a7f37',
  bug: '#d73a4a',
  checkout: '#8250df',
  feature: '#0969da',
  mobile: '#bf3989',
  performance: '#bf8700',
  search: '#1b7c83',
};

const people: Record<string, { name: string; color: string }> = {
  aisha: { name: 'Aisha Khan', color: '#bc4c00' },
  leo: { name: 'Leo Park', color: '#8250df' },
  maya: { name: 'Maya Robinson', color: '#0969da' },
  sofia: { name: 'Sofia Ruiz', color: '#bf3989' },
  tom: { name: 'Tom Becker', color: '#1a7f37' },
};

const boardItems: BoardItem[] = [
  {
    ref: 'storefront-web #241',
    title: 'Add Apple Pay to the checkout',
    status: 'todo',
    labels: ['feature', 'checkout'],
    priority: 'P2',
    size: 'M',
    assignees: ['leo'],
  },
  {
    ref: 'storefront-web #238',
    title: 'The size guide covers the cart button on phones',
    status: 'todo',
    labels: ['bug', 'mobile'],
    priority: 'P1',
    size: 'S',
    assignees: ['sofia'],
  },
  {
    ref: 'storefront-api #96',
    title: 'Send the order emails in German and French',
    status: 'todo',
    labels: ['feature'],
    priority: 'P3',
    size: 'M',
    assignees: [],
  },
  {
    ref: 'storefront-web #229',
    title: 'Sell gift cards and accept them at the checkout',
    status: 'progress',
    labels: ['feature', 'checkout'],
    priority: 'P1',
    size: 'L',
    assignees: ['maya', 'leo'],
  },
  {
    ref: 'storefront-api #91',
    title: 'The search for "café" finds no products',
    status: 'progress',
    labels: ['bug', 'search'],
    priority: 'P1',
    size: 'S',
    assignees: ['tom'],
  },
  {
    ref: 'storefront-web #233',
    title: 'Load the product images from the CDN',
    status: 'progress',
    labels: ['performance'],
    priority: 'P2',
    size: 'M',
    assignees: ['aisha'],
  },
  {
    ref: 'storefront-api #94',
    title: 'Cache the product list for five minutes',
    status: 'review',
    pull: true,
    labels: ['performance'],
    priority: 'P2',
    size: 'S',
    assignees: ['tom'],
  },
  {
    ref: 'storefront-web #236',
    title: 'Zoom the product images with the keyboard',
    status: 'review',
    pull: true,
    labels: ['accessibility'],
    priority: 'P1',
    size: 'M',
    assignees: ['sofia'],
  },
  {
    ref: 'storefront-api #88',
    title: 'Charge a card only once on a slow network',
    status: 'done',
    pull: true,
    labels: ['bug', 'checkout'],
    priority: 'P0',
    size: 'S',
    assignees: ['aisha'],
  },
  {
    ref: 'storefront-web #219',
    title: 'Save products to a wishlist',
    status: 'done',
    labels: ['feature'],
    priority: 'P2',
    size: 'L',
    assignees: ['maya'],
  },
  {
    ref: 'storefront-web #224',
    title: 'Add a dark theme',
    status: 'done',
    pull: true,
    labels: ['feature'],
    priority: 'P3',
    size: 'M',
    assignees: ['leo', 'sofia'],
  },
];

for (const { name, value } of [gitMerge, pullRequest]) {
  registerIconFromText(name, value);
}

const itemId = ({ ref }: BoardItem) => ref.replace(' #', '-');

/** The icon of an item. An item in Done is closed, or merged. */
function itemIcon({ pull, status }: BoardItem) {
  const done = status === 'done';
  const color = statuses[done ? 'done' : 'todo'].color;

  return pull
    ? {
        name: done ? 'git-merge' : 'pull-request',
        label: done ? 'Merged pull request' : 'Open pull request',
        color,
      }
    : {
        name: done ? 'check-circle' : 'adjust',
        label: done ? 'Closed issue' : 'Open issue',
        color,
      };
}

/** Runs `update` in a view transition, unless the user prefers less motion. */
function withTransition(update: () => void): Promise<void> {
  if (!('startViewTransition' in document) || prefersReducedMotion()) {
    update();
    return Promise.resolve();
  }

  const transition = document.startViewTransition(update);
  transition.ready.catch(() => {});
  return transition.updateCallbackDone;
}

export const ProjectBoard: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A project board in the style of GitHub Projects. Each status column is a tile with its own tile manager for its cards. Drag a card to change its place in its column, or drop it in another column to change its status. A manager swaps only its own tiles, so the story builds the move to another column from `igcTileDragStart`, `igcTileDragEnd` and the pointer position: a drop preview, which is also a tile, shows where the card goes. Drag the header of a column to move the column. Point at a column to show its resize handles. When a column is two columns wide, its cards go into two columns. Maximize a column to see more of its cards, or show it in full screen for a meeting. Dragging is a pointer action, so the menu of a card also moves it to the top or the bottom of its column, or to another status. Each card has a fixed `id`, so it keeps its view transition name, and a view transition moves it to the other column. The In progress column has a limit of three items. Its count and the drop preview change color when it has more.',
      },
    },
  },
  render: () => {
    const items = boardItems.map((item) => ({ ...item }));
    let startPosition = -1;
    let message = '';
    let tracking: AbortController | undefined;
    let drop:
      | { manager: IgcTileManagerComponent; status: Status; index: number }
      | undefined;

    const placeholder = Object.assign(document.createElement('igc-tile'), {
      className: 'tm-placeholder',
      disableMaximize: true,
      disableFullscreen: true,
    });
    placeholder.setAttribute('aria-hidden', 'true');

    const itemOf = (tile: IgcTileComponent) =>
      items.find((each) => itemId(each) === tile.dataset.item);

    const cardOf = (item: BoardItem) =>
      story.host?.querySelector<IgcTileComponent>(
        `[data-item="${itemId(item)}"]`
      );

    const place = (tile: IgcTileComponent) => {
      const { tiles } = tile.parentElement as IgcTileManagerComponent;
      return `place ${tiles.indexOf(tile) + 1} of ${tiles.length}`;
    };

    const within = (element: Element, x: number, y: number) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return x >= left && x <= right && y >= top && y <= bottom;
    };

    /** The column under the pointer, if the user can see it. */
    const columnAt = (x: number, y: number) =>
      [...story.host!.querySelectorAll<IgcTileComponent>('.tm-column')].find(
        (column) =>
          within(column, x, y) &&
          getComputedStyle(column).visibility !== 'hidden' &&
          (!document.fullscreenElement || document.fullscreenElement === column)
      );

    /** Moves the drop preview to `target`, or removes it without a target. */
    const preview = (target?: typeof drop) => {
      if (target?.manager === drop?.manager && target?.index === drop?.index) {
        return;
      }

      drop = target;

      if (target) {
        const { limit = Infinity } = statuses[target.status];
        const count = items.filter(
          ({ status }) => status === target.status
        ).length;
        placeholder.classList.toggle('tm-over', count >= limit);
      }

      withTransition(() => {
        if (!target) {
          placeholder.remove();
          return;
        }

        const { manager, index } = target;
        const order = manager.tiles
          .filter((tile) => tile !== placeholder)
          .toSpliced(index, 0, placeholder);

        if (placeholder.parentElement !== manager) {
          manager.append(placeholder);
        }
        for (const [position, tile] of order.entries()) {
          tile.position = position;
        }
      });
    };

    /** Follows a dragged card. Over another column, the preview shows its place. */
    const track =
      (dragged: IgcTileComponent) =>
      ({ clientX: x, clientY: y }: PointerEvent) => {
        const column = columnAt(x, y);
        const manager =
          column?.querySelector<IgcTileManagerComponent>('.tm-cards');

        if (!column || !manager || manager === dragged.parentElement) {
          preview();
          return;
        }

        const cards = manager.tiles.filter((tile) => tile !== placeholder);
        const over = cards.find((card) => within(card, x, y));
        let index = drop?.manager === manager ? drop.index : cards.length;

        // Before the card under the pointer, or after it from its lower half.
        if (over) {
          const { top, height } = over.getBoundingClientRect();
          index = cards.indexOf(over) + (y > top + height / 2 ? 1 : 0);
        }

        preview({ manager, status: column.dataset.status as Status, index });
      };

    const dragStart = ({ detail: tile }: CustomEvent<IgcTileComponent>) => {
      startPosition = tile.position;

      if (itemOf(tile)) {
        tracking?.abort();
        tracking = new AbortController();
        globalThis.addEventListener('pointermove', track(tile), {
          signal: tracking.signal,
        });
      }
    };

    const dragEnd = ({ detail: tile }: CustomEvent<IgcTileComponent>) => {
      tracking?.abort();

      if (drop) {
        const { status, index } = drop;
        drop = undefined;
        moveTo(tile, status, index);
        return;
      }

      if (startPosition === tile.position) {
        return;
      }

      const item = itemOf(tile);
      const column = statuses[(item?.status ?? tile.dataset.status) as Status];

      message = item
        ? `Moved ${item.ref} to ${place(tile)} in ${column.name}.`
        : `Moved the ${column.name} column to ${place(tile)}.`;
      story.update();
    };

    const dragCancel = () => {
      tracking?.abort();
      preview();
    };

    const reorder = (tile: IgcTileComponent, edge: 'top' | 'bottom') => {
      const item = itemOf(tile)!;
      const others = (
        tile.parentElement as IgcTileManagerComponent
      ).tiles.filter((each) => each !== tile);
      const order = edge === 'top' ? [tile, ...others] : [...others, tile];

      withTransition(() => {
        for (const [index, each] of order.entries()) {
          each.position = index;
        }
        message = `Moved ${item.ref} to the ${edge} of ${statuses[item.status].name}.`;
        story.update();
      });
    };

    /** Moves a card to the place of the drop preview, or to the bottom. */
    const moveTo = async (
      tile: IgcTileComponent,
      status: Status,
      index?: number
    ) => {
      const item = itemOf(tile)!;
      const { name, limit = Infinity } = statuses[status];
      const count = items.filter((each) => each.status === status).length + 1;
      const where =
        index === undefined
          ? 'the bottom of'
          : `place ${index + 1} of ${count} in`;

      // A dropped card appears in the preview and does not fly from its old place.
      if (index !== undefined) {
        tile.style.visibility = 'hidden';
        tile.style.viewTransitionName = 'none';
      }

      await withTransition(() => {
        item.status = status;
        message = `Moved ${item.ref} to ${where} ${name}.`;
        if (count > limit) {
          message += ` ${name} has ${count} items, and its limit is ${limit}.`;
        }
        story.update();

        // The new card takes the place of the preview before the manager sees it.
        if (index !== undefined) {
          placeholder.remove();
          cardOf(item)!.position = index;
        }
      });

      if (index === undefined) {
        await focusAfterUpdate(cardOf(item)?.querySelector('igc-icon-button'));
      }
    };

    const choose = (event: CustomEvent<IgcDropdownItemComponent>) => {
      const menu = event.currentTarget as IgcDropdownComponent;
      const tile = menu.closest('igc-tile')!;
      const { value } = event.detail;

      menu.clearSelection();

      if (value === 'top' || value === 'bottom') {
        reorder(tile, value);
      } else {
        moveTo(tile, value as Status);
      }
    };

    const card = (item: BoardItem) => {
      const icon = itemIcon(item);

      return html`
        <igc-tile
          id="tm-item-${itemId(item)}"
          class="tm-card"
          data-item=${itemId(item)}
          disable-maximize
          disable-fullscreen
          disable-resize
        >
          <div slot="title">
            <span class="tm-ref">
              <igc-icon
                name=${icon.name}
                aria-label=${icon.label}
                style=${styleMap({ color: icon.color })}
              ></igc-icon>
              ${item.ref}
            </span>
            <h5>${item.title}</h5>
          </div>
          <igc-dropdown
            slot="actions"
            placement="bottom-end"
            @igcChange=${choose}
          >
            <igc-icon-button
              slot="target"
              variant="flat"
              name="more-horiz"
              aria-label="Actions for ${item.ref}"
            ></igc-icon-button>
            <igc-dropdown-item value="top">Move to top</igc-dropdown-item>
            <igc-dropdown-item value="bottom">Move to bottom</igc-dropdown-item>
            <igc-dropdown-group>
              <span slot="label">Status</span>
              ${statusIds.map(
                (status) => html`
                  <igc-dropdown-item
                    value=${status}
                    ?disabled=${status === item.status}
                  >
                    ${statuses[status].name}
                  </igc-dropdown-item>
                `
              )}
            </igc-dropdown-group>
          </igc-dropdown>
          <div class="tm-card-body">
            <ul class="tm-labels" aria-label="Labels">
              ${item.labels.map(
                (label) => html`
                  <li
                    class="tm-label"
                    style=${styleMap({ '--label': labelColors[label] })}
                  >
                    ${label}
                  </li>
                `
              )}
            </ul>
            <div class="tm-meta">
              <span class="tm-token">
                <span class="sr-only">Priority</span> ${item.priority}
              </span>
              <span class="tm-token">
                <span class="sr-only">Size</span> ${item.size}
              </span>
              <span class="tm-avatars">
                ${item.assignees.map((id) => {
                  const { name, color } = people[id];
                  const initials = name.replace(/\B\w+|\s/g, '');

                  return html`
                    <igc-avatar
                      shape="circle"
                      initials=${initials}
                      alt=${name}
                      style=${styleMap({ '--ig-avatar-background': color })}
                    ></igc-avatar>
                  `;
                })}
              </span>
            </div>
          </div>
        </igc-tile>
      `;
    };

    const column = (status: Status) => {
      const { name, description, color, limit } = statuses[status];
      const cards = items.filter((item) => item.status === status);
      const count = plural(cards.length, 'item');

      return html`
        <igc-tile
          id="tm-column-${status}"
          class="tm-column"
          data-status=${status}
        >
          <h4 slot="title" class="tm-column-title">
            <span
              class="tm-dot"
              style=${styleMap({ '--status': color })}
            ></span>
            ${name}
            <span
              class="tm-count ${cards.length > (limit ?? Infinity) ? 'tm-over' : ''}"
              aria-hidden="true"
            >
              ${limit ? `${cards.length} / ${limit}` : cards.length}
            </span>
            <span class="sr-only">
              (${count}${limit ? `, limit ${limit}` : ''})
            </span>
          </h4>
          <div class="tm-column-body">
            <p class="tm-description muted">${description}</p>
            <igc-tile-manager
              class="tm-cards"
              drag-mode="tile"
              min-column-width="15rem"
              min-row-height="9.75rem"
              gap="0.5rem"
            >
              ${repeat(cards, itemId, card)}
            </igc-tile-manager>
          </div>
        </igc-tile>
      `;
    };

    const story = renderInto(
      () => html`
        <h3>Storefront: spring release</h3>
        <p role="status">${message}</p>
        <igc-tile-manager
          class="tm-board"
          drag-mode="tile-header"
          resize-mode="hover"
          min-column-width="17rem"
          min-row-height="48rem"
          gap="1rem"
          @igcTileDragStart=${dragStart}
          @igcTileDragEnd=${dragEnd}
          @igcTileDragCancel=${dragCancel}
        >
          ${statusIds.map(column)}
        </igc-tile-manager>
      `
    );

    return html`
      ${styles}
      <style>
        /*
         * The managers resolve the theme variables of their tiles: tinted
         * columns on the page, and cards with a border in the theme colors.
         */
        .tm-board {
          --tm-column: color-mix(
            in srgb,
            var(--ig-gray-500) 10%,
            var(--ig-surface-500)
          );
          --ig-tile-manager-background: transparent;
          --ig-tile-manager-tile-background: var(--tm-column);
          --ig-tile-manager-header-background: var(--tm-column);
          --ig-tile-manager-content-background: var(--tm-column);
        }

        .tm-cards {
          --ig-tile-manager-tile-background: initial;
          --ig-tile-manager-header-background: initial;
          --ig-tile-manager-content-background: initial;
          --ig-tile-manager-border-color: var(--ig-gray-300);
        }

        .tm-column-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tm-dot {
          flex: none;
          box-sizing: border-box;
          width: 0.875rem;
          height: 0.875rem;
          border: 2px solid var(--status);
          border-radius: 50%;
        }

        .tm-count {
          padding-inline: 0.5rem;
          border-radius: 1em;
          background: color-mix(in srgb, currentColor 12%, transparent);
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.25rem;
        }

        .tm-over {
          color: color-mix(
            in oklab,
            var(--ig-error-500) 50%,
            var(--ig-gray-900)
          );
          background: color-mix(in srgb, var(--ig-error-500) 15%, transparent);
        }

        .tm-column-body {
          height: 100%;
          overflow: auto;
        }

        .tm-description {
          margin: 0;
          padding: 0.5rem 1rem 0;
          font-size: 0.875rem;
        }

        /* The cards have no resize handles, so less space is enough. */
        .tm-cards::part(base) {
          padding: 0.5rem;
        }

        /* The drop preview of a card from another column. */
        .tm-placeholder {
          box-sizing: border-box;
          border: 2px dashed var(--ig-primary-500);
          border-radius: 0.375rem;
          background: color-mix(in srgb, var(--ig-primary-500) 8%, transparent);
        }

        .tm-placeholder.tm-over {
          border-color: var(--ig-error-500);
          background: color-mix(in srgb, var(--ig-error-500) 8%, transparent);
        }

        .tm-placeholder::part(base) {
          visibility: hidden;
        }

        .tm-card::part(header) {
          align-items: start;
          gap: 0.25rem;
          padding: 0.5rem 0.25rem 0 0.75rem;
        }

        .tm-card [slot='title'] {
          display: grid;
          gap: 0.25rem;
          font: inherit;
          letter-spacing: normal;
          white-space: normal;
        }

        .tm-ref {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--ig-gray-700);
          font-size: 0.75rem;
        }

        .tm-ref igc-icon {
          --ig-icon-size: 1rem;
        }

        .tm-card h5 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          margin: 0;
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.25rem;
        }

        .tm-card igc-icon-button {
          --ig-size: 1;
        }

        .tm-card-body {
          display: grid;
          align-content: end;
          gap: 0.5rem;
          box-sizing: border-box;
          height: 100%;
          padding: 0.5rem 0.75rem 0.75rem;
        }

        .tm-labels {
          display: flex;
          gap: 0.25rem;
          overflow: hidden;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tm-label {
          flex: none;
          padding-inline: 0.5rem;
          border: 1px solid color-mix(in srgb, var(--label) 50%, transparent);
          border-radius: 1em;
          background: color-mix(in srgb, var(--label) 15%, transparent);
          color: color-mix(in oklab, var(--label) 50%, var(--ig-gray-900));
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.25rem;
        }

        .tm-meta {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .tm-token {
          padding-inline: 0.375rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 0.375rem;
          line-height: 1.25rem;
        }

        .tm-avatars {
          display: flex;
          gap: 0.125rem;
          margin-inline-start: auto;
        }

        .tm-avatars igc-avatar {
          --ig-avatar-size: 1.5rem;
          --ig-avatar-color: white;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};
