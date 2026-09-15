import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcInputComponent,
  IgcVirtualGridComponent,
  type VirtualGridCellTemplate,
  type VirtualGridHeaderTemplate,
  type VirtualGridState,
  type VirtualScrollDataRequest,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcVirtualGridComponent,
  IgcButtonComponent,
  IgcInputComponent
);

// region default
const metadata: Meta<IgcVirtualGridComponent> = {
  title: 'VirtualGrid',
  component: 'igc-virtual-grid',
  parameters: {
    docs: {
      description: {
        component:
          'A two-dimensional virtualization component. Only the rows and columns\nvisible in the viewport are rendered.\n\nRows are fixed height by default and columns always have a known width,\nso the offset math on both axes is arithmetic and any row count costs the\nsame. `autoRowHeight` switches rows to DOM measurement.',
      },
    },
    actions: { handles: ['igcStateChange', 'igcDataRequest'] },
  },
  argTypes: {
    rowHeight: {
      type: 'number',
      description:
        'The height of every row in pixels. With `autoRowHeight` set, the\nestimate used before a row is measured in the DOM.',
      control: 'number',
      table: { defaultValue: { summary: '40' } },
    },
    autoRowHeight: {
      type: 'boolean',
      description:
        "Whether rendered rows are measured in the DOM instead of all sharing\n`rowHeight`.\n\nA row's height then depends on the cells rendered in it. A tall cell in\na column that scrolls into view can grow the row and shift every row\nbelow it. For a stable layout keep rows fixed, or clamp cell content.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    pinnedColumnsStart: {
      type: 'number',
      description:
        'The number of leading columns that stay in view during a horizontal\nscroll. They are the first entries of `columns`, rendered in every row\nand in the header. Give their cells an opaque background, since the\nscrollable columns pass under them.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    pinnedColumnsEnd: {
      type: 'number',
      description:
        'The number of trailing columns that stay in view during a horizontal\nscroll. They are the last entries of `columns`. See `pinnedColumnsStart`.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    rowOverScan: {
      type: 'number',
      description:
        'Number of extra rows to render above and below the visible area.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    columnOverScan: {
      type: 'number',
      description:
        'Number of extra columns to render before and after the visible area.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
    },
  },
  args: {
    rowHeight: 40,
    autoRowHeight: false,
    pinnedColumnsStart: 0,
    pinnedColumnsEnd: 0,
    rowOverScan: 2,
    columnOverScan: 1,
  },
};

export default metadata;

interface IgcVirtualGridArgs {
  /**
   * The height of every row in pixels. With `autoRowHeight` set, the
   * estimate used before a row is measured in the DOM.
   */
  rowHeight: number;
  /**
   * Whether rendered rows are measured in the DOM instead of all sharing
   * `rowHeight`.
   *
   * A row's height then depends on the cells rendered in it. A tall cell in
   * a column that scrolls into view can grow the row and shift every row
   * below it. For a stable layout keep rows fixed, or clamp cell content.
   */
  autoRowHeight: boolean;
  /**
   * The number of leading columns that stay in view during a horizontal
   * scroll. They are the first entries of `columns`, rendered in every row
   * and in the header. Give their cells an opaque background, since the
   * scrollable columns pass under them.
   */
  pinnedColumnsStart: number;
  /**
   * The number of trailing columns that stay in view during a horizontal
   * scroll. They are the last entries of `columns`. See `pinnedColumnsStart`.
   */
  pinnedColumnsEnd: number;
  /** Number of extra rows to render above and below the visible area. */
  rowOverScan: number;
  /** Number of extra columns to render before and after the visible area. */
  columnOverScan: number;
}
type Story = StoryObj<IgcVirtualGridArgs>;

// endregion

interface Column {
  field: string;
  header: string;
}

const ROW_COUNT = 1_000_000;
const COLUMN_COUNT = 200;
const NUMBER_FORMAT = new Intl.NumberFormat();

/**
 * Rows are their own index. A million row objects with two hundred fields
 * each would cost more than the grid itself, and the cell value is a
 * function of both indexes anyway. Built on first use, so that stories
 * which do not need it do not pay for it.
 */
let allRows: number[] | undefined;

function rows(count = ROW_COUNT): number[] {
  allRows ??= Array.from({ length: ROW_COUNT }, (_, i) => i);
  return count === ROW_COUNT ? allRows : allRows.slice(0, count);
}

const COLUMNS: Column[] = Array.from({ length: COLUMN_COUNT }, (_, i) => ({
  field: `col${i}`,
  header: `Column ${i + 1}`,
}));

const TEXT_ROWS = rows(10_000);
const TEXT_COLUMNS = COLUMNS.slice(0, 20);

const cellTemplate = ((ctx) =>
  html`<div class="cell">
    ${NUMBER_FORMAT.format(ctx.row * COLUMN_COUNT + ctx.columnIndex)}
  </div>`) as VirtualGridCellTemplate<
  number,
  Column
> as VirtualGridCellTemplate<unknown, unknown>;

const headerTemplate = ((ctx) =>
  html`<div class="cell">
    ${ctx.column.header}
  </div>`) as VirtualGridHeaderTemplate<Column> as VirtualGridHeaderTemplate<unknown>;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const textTemplate = ((ctx) => {
  const words = 1 + ((ctx.row * 7 + ctx.columnIndex * 3) % 18);
  return html`<div style="padding-block: 6px; white-space: normal;">
    ${LOREM.split(' ').slice(0, words).join(' ')}
  </div>`;
}) as VirtualGridCellTemplate<number, Column> as VirtualGridCellTemplate<
  unknown,
  unknown
>;

const gridStyles = html`
  <style>
    igc-virtual-grid {
      height: 480px;
      border: 1px solid var(--ig-gray-300, #ccc);
      font:
        14px/1 system-ui,
        sans-serif;
      font-variant-numeric: tabular-nums;
    }

    igc-virtual-grid [part='cell'] {
      display: flex;
      align-items: center;
      padding-inline: 8px;
      border-inline-end: 1px solid var(--ig-gray-200, #e5e5e5);
      border-block-end: 1px solid var(--ig-gray-200, #e5e5e5);
    }

    igc-virtual-grid [part='header-cell'] {
      display: flex;
      align-items: center;
      min-height: 40px;
      padding-inline: 8px;
      font-weight: 600;
      background: var(--ig-gray-100, #f2f2f2);
      border-inline-end: 1px solid var(--ig-gray-200, #e5e5e5);
      border-block-end: 2px solid var(--ig-gray-300, #ccc);
    }

    /* Pinned cells paint over the columns that scroll under them. */
    igc-virtual-grid [part='cell'][data-vg-pinned] {
      background: var(--ig-surface-500, #fff);
    }

    igc-virtual-grid
      [data-vg-pinned='start']:not(:has(+ [data-vg-pinned='start'])) {
      border-inline-end: 2px solid var(--ig-gray-400, #999);
    }

    igc-virtual-grid [data-vg-line='pinned-end'] {
      border-inline-start: 2px solid var(--ig-gray-400, #999);
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: end;
      margin-block-end: 8px;
    }

    .readout {
      display: block;
      font:
        12px/1.5 ui-monospace,
        monospace;
      margin-block-start: 8px;
    }
  </style>
`;

//#region Readout

/**
 * One long-animation-frame observer for the whole module, writing to the
 * readout of the story that is on screen. A story switch swaps the target
 * through `ref`, so no observer or detached tree is kept per mount.
 */
let readout: HTMLElement | undefined;
let state: VirtualGridState | undefined;
let longFrames = 0;
let worstFrame = 0;

function updateReadout(): void {
  if (!readout) {
    return;
  }

  const window = state
    ? `rows ${state.rowStartIndex}–${state.rowEndIndex}, columns ${state.columnStartIndex}–${state.columnEndIndex}`
    : 'no window yet';
  readout.textContent = `${window} · long frames: ${longFrames}, worst: ${worstFrame.toFixed(0)}ms`;
}

function observeLongFrames(): void {
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        longFrames++;
        worstFrame = Math.max(worstFrame, entry.duration);
      }
      updateReadout();
    }).observe({ type: 'long-animation-frame', buffered: false });
  } catch {
    // Not supported in this browser; the readout shows the window only.
  }
}

observeLongFrames();

function handleStateChange(event: CustomEvent<VirtualGridState>): void {
  state = event.detail;
  updateReadout();
}

function setReadout(element?: Element): void {
  readout = element as HTMLElement | undefined;
  state = undefined;
  longFrames = 0;
  worstFrame = 0;
  updateReadout();
}

const readoutTemplate = html`<output
  class="readout"
  ${ref(setReadout)}
></output>`;

//#endregion

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'One million rows by two hundred columns with fixed row heights, a uniform column width and a sticky header. Neither axis is measured, so the offset math is constant time and the rows exceed the browser scroll limit through coordinate compression.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => html`
    ${gridStyles}
    <igc-virtual-grid
      row-height=${args.rowHeight}
      column-width="120"
      row-over-scan=${args.rowOverScan}
      column-over-scan=${args.columnOverScan}
      pinned-columns-start=${args.pinnedColumnsStart}
      pinned-columns-end=${args.pinnedColumnsEnd}
      ?auto-row-height=${args.autoRowHeight}
      .data=${rows()}
      .columns=${COLUMNS}
      .cellTemplate=${cellTemplate}
      .headerTemplate=${headerTemplate}
      @igcStateChange=${handleStateChange}
    ></igc-virtual-grid>
    ${readoutTemplate}
  `,
};

export const VariableColumnWidth: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Column widths from a function of the column. The function runs once per `columns` change and the widths are handed to the engine in bulk.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${gridStyles}
    <igc-virtual-grid
      .data=${rows()}
      .columns=${COLUMNS}
      .columnWidth=${(_: Column, index: number) => 80 + (index % 5) * 40}
      .cellTemplate=${cellTemplate}
      @igcStateChange=${handleStateChange}
    ></igc-virtual-grid>
    ${readoutTemplate}
  `,
};

export const PinnedColumns: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Two leading and one trailing pinned column. Pinned cells are sticky against the grid and render in every row and in the header; the scrollable window is computed over the space between them.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${gridStyles}
    <igc-virtual-grid
      pinned-columns-start="2"
      pinned-columns-end="1"
      .data=${rows()}
      .columns=${COLUMNS}
      .columnWidth=${(_: Column, index: number) => (index < 2 ? 90 : 140)}
      .cellTemplate=${cellTemplate}
      .headerTemplate=${headerTemplate}
      @igcStateChange=${handleStateChange}
    ></igc-virtual-grid>
    ${readoutTemplate}
  `,
};

export const InfiniteRows: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Rows loaded on demand. `igcDataRequest` fires when the rendered rows come near the end of `data`; the handler appends a page after a simulated delay and assigns a new array.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const PAGE_SIZE = 100;
    let loading = false;

    const grid = () =>
      document.getElementById('vg-infinite') as IgcVirtualGridComponent;

    const loadMore = (event: CustomEvent<VirtualScrollDataRequest>) => {
      if (loading) {
        return;
      }
      loading = true;

      // Simulate network delay.
      setTimeout(() => {
        const { startIndex, count } = event.detail;
        grid().data = rows(startIndex + Math.max(count, PAGE_SIZE));
        loading = false;
      }, 300);
    };

    return html`
      ${gridStyles}
      <igc-virtual-grid
        id="vg-infinite"
        pinned-columns-start="1"
        .data=${rows(PAGE_SIZE)}
        .columns=${TEXT_COLUMNS}
        .cellTemplate=${cellTemplate}
        .headerTemplate=${headerTemplate}
        @igcDataRequest=${loadMore}
        @igcStateChange=${handleStateChange}
      ></igc-virtual-grid>
      ${readoutTemplate}
    `;
  },
};

export const AutoRowHeight: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Ten thousand rows of wrapping text with `auto-row-height`. Each rendered row is measured by its border box and the estimate is corrected. A row can change height when a taller cell scrolls into view horizontally.',
      },
    },
    actions: { handles: [] },
  },
  render: () => html`
    ${gridStyles}
    <igc-virtual-grid
      auto-row-height
      row-height="48"
      column-width="220"
      .data=${TEXT_ROWS}
      .columns=${TEXT_COLUMNS}
      .cellTemplate=${textTemplate}
      @igcStateChange=${handleStateChange}
    ></igc-virtual-grid>
    ${readoutTemplate}
  `,
};

export const ScrollToCell: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Programmatic scrolling. `scrollToCell` aligns the row by `block` and the column by `inline`; `scrollToRow` and `scrollToColumn` move one axis and leave the other alone.',
      },
    },
    actions: { handles: [] },
  },
  render: () => {
    const grid = () =>
      document.getElementById('vg-scroll') as IgcVirtualGridComponent;
    const value = (id: string) =>
      Number((document.getElementById(id) as IgcInputComponent).value);

    return html`
      ${gridStyles}
      <div class="toolbar">
        <igc-input
          id="vg-row"
          type="number"
          label="Row"
          value="500000"
        ></igc-input>
        <igc-input
          id="vg-col"
          type="number"
          label="Column"
          value="100"
        ></igc-input>
        <igc-button
          @click=${() => grid().scrollToCell(value('vg-row'), value('vg-col'))}
          >Scroll to cell</igc-button
        >
        <igc-button
          @click=${() =>
            grid().scrollToCell(value('vg-row'), value('vg-col'), {
              block: 'center',
              inline: 'center',
              behavior: 'smooth',
            })}
          >Center smoothly</igc-button
        >
        <igc-button @click=${() => grid().scrollToRow(value('vg-row'))}
          >Row only</igc-button
        >
        <igc-button @click=${() => grid().scrollToColumn(value('vg-col'))}
          >Column only</igc-button
        >
      </div>
      <igc-virtual-grid
        id="vg-scroll"
        pinned-columns-start="1"
        .data=${rows()}
        .columns=${COLUMNS}
        .cellTemplate=${cellTemplate}
        .headerTemplate=${headerTemplate}
        @igcStateChange=${handleStateChange}
      ></igc-virtual-grid>
      ${readoutTemplate}
    `;
  },
};
