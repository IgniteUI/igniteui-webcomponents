import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { type nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { suppressResizeObserverLoopError } from '#internals/testing/helpers.spec.js';
import { simulateScroll } from '#internals/testing/simulate.spec.js';
import type { VirtualScrollDataRequest } from '../types.js';
import type {
  VirtualGridCellContext,
  VirtualGridColumnContext,
  VirtualGridState,
} from './types.js';
import IgcVirtualGridComponent, {
  type VirtualGridCellTemplate,
  type VirtualGridHeaderTemplate,
} from './virtual-grid.js';

interface Row {
  id: number;
}

interface Column {
  field: string;
  width: number;
}

type Grid = IgcVirtualGridComponent<Row, Column>;

/**
 * Widens a typed template for the property binding: the analyzer checks a
 * `.cellTemplate` binding against the bare type parameters of the class.
 */
function asTemplate(
  template: (
    ctx: VirtualGridCellContext<Row, Column>
  ) => TemplateResult | typeof nothing
): VirtualGridCellTemplate<unknown, unknown> {
  return template as VirtualGridCellTemplate<unknown, unknown>;
}

describe('VirtualGrid', () => {
  before(() => {
    defineComponents(IgcVirtualGridComponent);
    suppressResizeObserverLoopError();
  });

  function createRows(count: number): Row[] {
    return Array.from({ length: count }, (_, i) => ({ id: i }));
  }

  function createColumns(count: number, width = 100): Column[] {
    return Array.from({ length: count }, (_, i) => ({
      field: `col${i}`,
      width,
    }));
  }

  const cellTemplate = asTemplate(
    (ctx) => html`<span>${ctx.row.id}:${ctx.column.field}</span>`
  );

  /** A 30px tall header cell. Widened like `asTemplate`. */
  const headerTemplate = ((ctx: VirtualGridColumnContext<Column>) =>
    html`<div style="height: 30px">
      ${ctx.column.field}
    </div>`) as VirtualGridHeaderTemplate<unknown>;

  function header(el: Grid): HTMLElement | null {
    return el.querySelector<HTMLElement>(':scope > [part="header"]');
  }

  function cellAt(row: HTMLElement, columnIndex: number): HTMLElement {
    return row.querySelector<HTMLElement>(`[data-vg-column="${columnIndex}"]`)!;
  }

  /** The distance of `node` from the same edge of the grid. */
  function offset(el: Grid, node: Element, edge: 'left' | 'top'): number {
    return (
      node.getBoundingClientRect()[edge] - el.getBoundingClientRect()[edge]
    );
  }

  function renderedRows(el: Grid): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('[data-vg-row]'));
  }

  function renderedRowIndexes(el: Grid): number[] {
    return renderedRows(el).map((row) => Number(row.dataset.vgRow));
  }

  function renderedColumnIndexes(el: Grid): number[] {
    const first = renderedRows(el)[0];
    return first
      ? Array.from(
          first.querySelectorAll<HTMLElement>('[data-vg-column]'),
          (cell) => Number(cell.dataset.vgColumn)
        )
      : [];
  }

  function track(el: Grid): HTMLElement {
    return el.querySelector<HTMLElement>('[part="virtualization-track"]')!;
  }

  function content(el: Grid): HTMLElement {
    return el.querySelector<HTMLElement>('[part="virtualization-content"]')!;
  }

  interface GridOptions {
    rows?: number;
    columns?: number;
    template?: VirtualGridCellTemplate<unknown, unknown>;
    autoRowHeight?: boolean;
    role?: 'grid' | 'table';
    dir?: 'ltr' | 'rtl';
    header?: boolean;
    pinnedStart?: number;
    pinnedEnd?: number;
  }

  /** A 400 x 300 px grid of 100 px wide columns, settled. */
  async function createGrid({
    rows = 1000,
    columns = 50,
    template = cellTemplate,
    autoRowHeight = false,
    role,
    dir,
    header = false,
    pinnedStart = 0,
    pinnedEnd = 0,
  }: GridOptions = {}): Promise<Grid> {
    const el = await fixture<Grid>(
      html`<igc-virtual-grid
        style="width: 400px; height: 300px"
        role=${ifDefined(role)}
        dir=${ifDefined(dir)}
        ?auto-row-height=${autoRowHeight}
        .pinnedColumnsStart=${pinnedStart}
        .pinnedColumnsEnd=${pinnedEnd}
        .data=${createRows(rows)}
        .columns=${createColumns(columns)}
        .columnWidth=${100}
        .cellTemplate=${template}
        .headerTemplate=${header ? headerTemplate : null}
      ></igc-virtual-grid>`
    );
    await el.layoutComplete;
    return el;
  }

  describe('Accessibility', () => {
    it('passes the a11y audit', async () => {
      const el = await createGrid({ rows: 10, columns: 3 });

      await expect(el).lightDom.to.be.accessible();
    });

    it('defaults to a focusable grid role and reports the row and column counts', async () => {
      const el = await createGrid();

      expect(el.getAttribute('role')).to.equal('grid');
      expect(el.getAttribute('tabindex')).to.equal('0');
      expect(el.getAttribute('aria-rowcount')).to.equal('1000');
      expect(el.getAttribute('aria-colcount')).to.equal('50');
    });

    it('renders row and gridcell wrappers with one-based indexes', async () => {
      const el = await createGrid();
      const row = renderedRows(el)[3];
      const cell = row.querySelectorAll<HTMLElement>('[data-vg-column]')[2];

      expect(row.getAttribute('role')).to.equal('row');
      expect(row.getAttribute('aria-rowindex')).to.equal('4');
      expect(cell.getAttribute('role')).to.equal('gridcell');
      expect(cell.getAttribute('aria-colindex')).to.equal('3');
    });

    it('follows a table host role with cell wrappers', async () => {
      const el = await createGrid({ rows: 10, columns: 3, role: 'table' });

      expect(el.getAttribute('role')).to.equal('table');
      expect(
        el.querySelector('[data-vg-column]')!.getAttribute('role')
      ).to.equal('cell');
    });
  });

  describe('Default values', () => {
    it('initializes with correct defaults', async () => {
      const el = await fixture<Grid>(
        html`<igc-virtual-grid></igc-virtual-grid>`
      );

      expect(el.data).to.deep.equal([]);
      expect(el.columns).to.deep.equal([]);
      expect(el.cellTemplate).to.be.null;
      expect(el.rowHeight).to.equal(40);
      expect(el.autoRowHeight).to.be.false;
      expect(el.columnWidth).to.equal(120);
      expect(el.rowOverScan).to.equal(2);
      expect(el.columnOverScan).to.equal(1);
    });

    it('reflects the boolean attribute', async () => {
      const el = await fixture<Grid>(
        html`<igc-virtual-grid auto-row-height></igc-virtual-grid>`
      );

      expect(el.autoRowHeight).to.be.true;

      el.autoRowHeight = false;
      await elementUpdated(el);

      expect(el.hasAttribute('auto-row-height')).to.be.false;
    });
  });

  describe('Rendering', () => {
    it('renders nothing without a cellTemplate', async () => {
      const el = await fixture<Grid>(
        html`<igc-virtual-grid
          .data=${createRows(5)}
          .columns=${createColumns(5)}
        ></igc-virtual-grid>`
      );

      expect(el.querySelector('[part="virtualization-track"]')).to.be.null;
    });

    it('sizes the track from both axes', async () => {
      const el = await createGrid();

      expect(track(el).style.width).to.equal('5000px');
      expect(track(el).style.height).to.equal('40000px');
    });

    it('renders only the rows and columns in view, padded by the over-scan', async () => {
      const el = await createGrid();

      // 300px / 40px = 7.5 rows, 400px / 100px = 4 columns.
      expect(renderedRowIndexes(el)).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(renderedColumnIndexes(el)).to.eql([0, 1, 2, 3, 4, 5]);
    });

    it('drives every row from one column track template on the track', async () => {
      const el = await createGrid();
      const tracks = track(el).style.getPropertyValue('--igc-grid-cols');

      expect(tracks).to.equal(
        '0px [window-start] 100px 100px 100px 100px 100px 100px 1fr'
      );
      expect(getComputedStyle(renderedRows(el)[0]).display).to.equal('grid');
    });

    it('moves the row window with a vertical scroll', async () => {
      const el = await createGrid();

      await simulateScroll(el, { top: 4000 });

      // Row 100 is at 4000px; two rows of over-scan before it.
      expect(renderedRowIndexes(el)[0]).to.equal(98);
      expect(content(el).style.transform).to.equal('translateY(3920px)');
    });

    it('moves the column window with a horizontal scroll and offsets the spacer track', async () => {
      const el = await createGrid();

      await simulateScroll(el, { left: 1000 });

      expect(renderedColumnIndexes(el)[0]).to.equal(9);
      expect(
        track(el).style.getPropertyValue('--igc-grid-cols').startsWith('900px')
      ).to.be.true;
      expect(content(el).style.transform).to.equal('translateY(0px)');
    });

    it('positions the first rendered cell after the spacer track', async () => {
      const el = await createGrid();

      await simulateScroll(el, { left: 1000 });

      const row = renderedRows(el)[0];
      const cell = row.firstElementChild as HTMLElement;
      const rowLeft = row.getBoundingClientRect().left;

      expect(cell.getBoundingClientRect().left - rowLeft).to.equal(900);
    });

    it('does not render for a scroll that stays within the same windows', async () => {
      const el = await createGrid();
      const renderSpy = spy(el, 'render' as keyof Grid);

      await simulateScroll(el, { top: 10, left: 10 });

      expect(renderSpy).not.to.have.been.called;
    });

    it('passes the row, column, indexes and counts to the cell template', async () => {
      const templateSpy = spy(cellTemplate);
      const el = await createGrid({
        rows: 10,
        columns: 3,
        template: templateSpy,
      });

      const ctx = templateSpy.firstCall.args[0] as VirtualGridCellContext<
        Row,
        Column
      >;
      expect(ctx.row).to.equal(el.data[0]);
      expect(ctx.column).to.equal(el.columns[0]);
      expect(ctx.rowIndex).to.equal(0);
      expect(ctx.columnIndex).to.equal(0);
      expect(ctx.rowCount).to.equal(10);
      expect(ctx.columnCount).to.equal(3);
      expect(ctx.isFirstRow).to.be.true;
      expect(ctx.isFirstColumn).to.be.true;
      expect(ctx.isLastRow).to.be.false;

      const last = templateSpy.lastCall.args[0];
      expect(last.isLastRow).to.be.true;
      expect(last.isLastColumn).to.be.true;
    });
  });

  describe('Column widths', () => {
    it('applies a numeric width to every column', async () => {
      const el = await createGrid();

      el.columnWidth = 200;
      await el.layoutComplete;

      expect(track(el).style.width).to.equal('10000px');
      // 400px / 200px = 2 columns, the one at the edge, plus one of over-scan.
      expect(renderedColumnIndexes(el)).to.eql([0, 1, 2, 3]);
    });

    it('evaluates a width function per column', async () => {
      const el = await createGrid();

      el.columnWidth = (column, index) => (index % 2 === 0 ? column.width : 50);
      await el.layoutComplete;

      // 25 columns at 100px and 25 at 50px.
      expect(track(el).style.width).to.equal('3750px');
      expect(track(el).style.getPropertyValue('--igc-grid-cols')).to.equal(
        '0px [window-start] 100px 50px 100px 50px 100px 50px 100px 1fr'
      );
    });

    it('re-evaluates a width function when the columns change', async () => {
      const el = await createGrid();
      const widthSpy = spy((column: Column) => column.width);

      el.columnWidth = widthSpy;
      await el.layoutComplete;
      expect(widthSpy.callCount).to.equal(50);

      el.columns = createColumns(10, 60);
      await el.layoutComplete;

      expect(widthSpy.callCount).to.equal(60);
      expect(track(el).style.width).to.equal('600px');
    });

    it('falls back to the default for a non-positive numeric width', async () => {
      const el = await createGrid();

      el.columnWidth = 0;
      await el.layoutComplete;

      expect(track(el).style.width).to.equal(`${50 * 120}px`);
    });
  });

  describe('Row heights', () => {
    const tallCell = asTemplate(
      (ctx) => html`<div style="height: ${ctx.row.id % 2 ? 60 : 20}px"></div>`
    );

    it('does not measure rows by default', async () => {
      const el = await createGrid({
        rows: 100,
        columns: 3,
        template: tallCell,
      });
      const measureSpy = spy(el['_engine'].rows, 'measureItem');

      await simulateScroll(el, { top: 1000 });
      await el.layoutComplete;

      expect(measureSpy).not.to.have.been.called;
      expect(track(el).style.height).to.equal('4000px');
      expect(renderedRows(el)[0].getBoundingClientRect().height).to.equal(40);
    });

    it('applies a new rowHeight to every row', async () => {
      const el = await createGrid();

      el.rowHeight = 20;
      await el.layoutComplete;

      expect(track(el).style.height).to.equal('20000px');
    });

    it('measures rendered rows with autoRowHeight', async () => {
      const el = await createGrid({
        rows: 100,
        columns: 3,
        template: tallCell,
        autoRowHeight: true,
      });
      await el.layoutComplete;

      // Rows alternate 20px and 60px; the estimate was 40px for each, so the
      // total changes only where the rendered rows differ from it in sum.
      const rows = renderedRows(el);
      expect(rows[0].getBoundingClientRect().height).to.equal(20);
      expect(rows[1].getBoundingClientRect().height).to.equal(60);
      expect(el['_engine'].rows.getItemSize(0)).to.equal(20);
      expect(el['_engine'].rows.getItemSize(1)).to.equal(60);
    });

    it('retains measured heights on append and discards them on replacement', async () => {
      const el = await createGrid({
        rows: 100,
        columns: 3,
        template: tallCell,
        autoRowHeight: true,
      });
      await el.layoutComplete;
      const resizeSpy = spy(el['_engine'].rows, 'resize');

      el.data = [...el.data, ...createRows(20)];
      await elementUpdated(el);
      expect(resizeSpy.lastCall.args).to.eql([120, 40, 100]);

      el.data = createRows(120);
      await elementUpdated(el);
      expect(resizeSpy.lastCall.args).to.eql([120, 40, 0]);
    });
  });

  describe('Events', () => {
    it('emits igcStateChange with both windows and sizes', async () => {
      const el = await fixture<Grid>(
        html`<igc-virtual-grid
          style="width: 400px; height: 300px"
        ></igc-virtual-grid>`
      );
      const eventSpy = spy(el, 'emitEvent');

      el.data = createRows(1000);
      el.columns = createColumns(50);
      el.columnWidth = 100;
      el.cellTemplate = cellTemplate;
      await el.layoutComplete;

      expect(eventSpy).to.have.been.calledWith('igcStateChange');
      const detail = eventSpy.firstCall.args[1]!
        .detail as unknown as VirtualGridState;
      expect(detail).to.eql({
        rowStartIndex: 0,
        rowEndIndex: 9,
        columnStartIndex: 0,
        columnEndIndex: 5,
        viewportWidth: 400,
        viewportHeight: 300,
        totalWidth: 5000,
        totalHeight: 40000,
      });
    });

    it('does not re-emit igcStateChange when the windows are unchanged', async () => {
      const el = await createGrid();
      const eventSpy = spy(el, 'emitEvent');

      el.requestUpdate();
      await el.layoutComplete;

      expect(eventSpy).not.to.have.been.called;
    });
  });

  describe('Public API', () => {
    it('scrollToCell aligns both axes', async () => {
      const el = await createGrid();

      await el.scrollToCell(500, 20);

      expect(el.scrollTop).to.equal(500 * 40);
      expect(el.scrollLeft).to.equal(20 * 100);
    });

    it('scrollToCell honors block and inline alignment', async () => {
      const el = await createGrid();

      await el.scrollToCell(500, 20, { block: 'end', inline: 'center' });

      // Row 500 ends at 20040px; a 300px viewport puts its start at 19740px.
      expect(el.scrollTop).to.equal(500 * 40 + 40 - 300);
      // Column 20 spans 2000..2100; centered in 400px starts at 1850px.
      expect(el.scrollLeft).to.equal(2000 + 50 - 200);
    });

    it('scrollToRow and scrollToColumn leave the other axis alone', async () => {
      const el = await createGrid();

      await el.scrollToColumn(20);
      await el.scrollToRow(500);

      expect(el.scrollTop).to.equal(20000);
      expect(el.scrollLeft).to.equal(2000);
    });

    it('does not scroll for nearest on a cell already in view', async () => {
      const el = await createGrid();
      const scrollSpy = spy(el, 'scrollTo');

      await el.scrollToCell(2, 1, { block: 'nearest', inline: 'nearest' });

      expect(scrollSpy).not.to.have.been.called;
    });

    it('clamps an out-of-range cell to the last row and column', async () => {
      const el = await createGrid();

      await el.scrollToCell(5000, 500);

      expect(el.scrollTop).to.equal(el.scrollHeight - el.clientHeight);
      expect(el.scrollLeft).to.equal(el.scrollWidth - el.clientWidth);
    });

    it('keeps the requested row aligned once measured heights differ from the estimate', async () => {
      const el = await createGrid({
        rows: 500,
        columns: 3,
        template: asTemplate(() => html`<div style="height: 60px"></div>`),
        autoRowHeight: true,
      });

      await el.scrollToRow(300);

      const target = renderedRows(el).find(
        (row) => row.dataset.vgRow === '300'
      )!;
      const delta =
        target.getBoundingClientRect().top - el.getBoundingClientRect().top;
      expect(Math.abs(delta)).to.be.lessThan(1);
    });

    it('layoutComplete settles when nothing is pending', async () => {
      const el = await createGrid();

      await el.layoutComplete;
      expect(el.isUpdatePending).to.be.false;
    });
  });

  describe('Header row', () => {
    it('passes the a11y audit with a header', async () => {
      const el = await createGrid({ rows: 10, columns: 3, header: true });

      await expect(el).lightDom.to.be.accessible();
    });

    it('renders a sticky row of column headers and counts it as a row', async () => {
      const el = await createGrid({ header: true });
      const row = header(el)!;
      const cells = row.querySelectorAll<HTMLElement>('[data-vg-column]');

      expect(row.getAttribute('role')).to.equal('row');
      expect(row.getAttribute('aria-rowindex')).to.equal('1');
      expect(getComputedStyle(row).position).to.equal('sticky');
      expect(cells).to.have.length(6);
      expect(cells[0].getAttribute('part')).to.equal('header-cell');
      expect(cells[0].getAttribute('role')).to.equal('columnheader');
      expect(cells[0].getAttribute('aria-colindex')).to.equal('1');
      expect(cells[0].textContent!.trim()).to.equal('col0');

      expect(el.getAttribute('aria-rowcount')).to.equal('1001');
      expect(renderedRows(el)[0].getAttribute('aria-rowindex')).to.equal('2');
    });

    it('passes the column, its index and the count to the header template', async () => {
      const templateSpy = spy(headerTemplate);
      const el = await createGrid({ columns: 3 });

      el.headerTemplate = templateSpy;
      await el.layoutComplete;

      const ctx = templateSpy.firstCall
        .args[0] as VirtualGridColumnContext<Column>;
      expect(ctx.column).to.equal(el.columns[0]);
      expect(ctx.columnIndex).to.equal(0);
      expect(ctx.columnCount).to.equal(3);
      expect(ctx.isFirstColumn).to.be.true;
      expect(templateSpy.lastCall.args[0].isLastColumn).to.be.true;
    });

    it('reserves the header height from the row viewport', async () => {
      const el = await createGrid({ header: true });

      // 270px of rows below a 30px header: 6.75 rows, plus two of over-scan.
      expect(renderedRowIndexes(el)).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      expect(offset(el, renderedRows(el)[0], 'top')).to.equal(30);
    });

    it('stays at the top of the viewport while the rows scroll under it', async () => {
      const el = await createGrid({ header: true });

      await simulateScroll(el, { top: 4000 });

      const row = renderedRows(el).find((r) => r.dataset.vgRow === '100')!;
      expect(offset(el, header(el)!, 'top')).to.equal(0);
      expect(offset(el, row, 'top')).to.equal(30);
    });

    it('shares the column tracks with the rows', async () => {
      const el = await createGrid({ header: true });

      await simulateScroll(el, { left: 1000 });

      const row = header(el)!;
      expect(row.style.getPropertyValue('--igc-grid-cols')).to.equal(
        track(el).style.getPropertyValue('--igc-grid-cols')
      );
      expect(row.style.width).to.equal(track(el).style.width);
      expect(row.firstElementChild!.getAttribute('data-vg-column')).to.equal(
        '9'
      );
    });

    it('aligns scrolled-to rows against the viewport below the header', async () => {
      const el = await createGrid({ header: true });

      await el.scrollToRow(500);
      expect(el.scrollTop).to.equal(20_000);
      expect(
        offset(
          el,
          renderedRows(el).find((r) => r.dataset.vgRow === '500')!,
          'top'
        )
      ).to.equal(30);

      // Row 500 ends at 20040px; the 270px below the header end there.
      await el.scrollToRow(500, { block: 'end' });
      expect(el.scrollTop).to.equal(20_040 - 270);
    });

    it('removes the header and gives its height back to the rows', async () => {
      const el = await createGrid({ header: true });

      el.headerTemplate = null;
      await el.layoutComplete;

      expect(header(el)).to.be.null;
      expect(el.getAttribute('aria-rowcount')).to.equal('1000');
      expect(renderedRows(el)[0].getAttribute('aria-rowindex')).to.equal('1');
      expect(renderedRowIndexes(el)).to.have.length(10);
    });
  });

  describe('Pinned columns', () => {
    it('renders pinned columns in every row outside the scrollable window', async () => {
      const el = await createGrid({ pinnedStart: 2, pinnedEnd: 1 });

      // 100px of scrollable viewport between 300px of pinned columns: one
      // column, the one at its edge, plus one of over-scan.
      expect(renderedColumnIndexes(el)).to.eql([0, 1, 2, 3, 4, 49]);
      expect(track(el).style.width).to.equal('5000px');
      expect(track(el).style.getPropertyValue('--igc-grid-cols')).to.equal(
        '100px 100px 0px [window-start] 100px 100px 100px 1fr [pinned-end] 100px'
      );

      const row = renderedRows(el)[0];
      expect(cellAt(row, 0).dataset.vgPinned).to.equal('start');
      expect(cellAt(row, 1).dataset.vgPinned).to.equal('start');
      expect(cellAt(row, 2).dataset.vgLine).to.equal('window-start');
      expect(cellAt(row, 49).dataset.vgPinned).to.equal('end');
      expect(cellAt(row, 49).dataset.vgLine).to.equal('pinned-end');
    });

    it('keeps pinned cells in place during a horizontal scroll', async () => {
      const el = await createGrid({ pinnedStart: 2, pinnedEnd: 1 });

      await simulateScroll(el, { left: 1000 });

      const row = renderedRows(el)[0];
      expect(renderedColumnIndexes(el)).to.eql([0, 1, 11, 12, 13, 14, 49]);
      expect(offset(el, cellAt(row, 0), 'left')).to.equal(0);
      expect(offset(el, cellAt(row, 1), 'left')).to.equal(100);
      // The first column in view starts right after the pinned ones.
      expect(offset(el, cellAt(row, 12), 'left')).to.equal(200);
      expect(offset(el, cellAt(row, 49), 'left')).to.equal(300);
    });

    it('stacks several pinned end cells from the trailing edge', async () => {
      const el = await createGrid({ pinnedEnd: 2 });

      await simulateScroll(el, { left: 1000 });

      const row = renderedRows(el)[0];
      expect(renderedColumnIndexes(el).slice(-2)).to.eql([48, 49]);
      expect(offset(el, cellAt(row, 48), 'left')).to.equal(200);
      expect(offset(el, cellAt(row, 49), 'left')).to.equal(300);
    });

    it('pins header cells too', async () => {
      const el = await createGrid({ header: true, pinnedStart: 1 });

      await simulateScroll(el, { left: 1000 });

      const cell = cellAt(header(el)!, 0);
      expect(cell.dataset.vgPinned).to.equal('start');
      expect(offset(el, cell, 'left')).to.equal(0);
    });

    it('reports the scrollable window and the full width in igcStateChange', async () => {
      const el = await createGrid({ pinnedStart: 2, pinnedEnd: 1 });
      const eventSpy = spy(el, 'emitEvent');

      await simulateScroll(el, { left: 1000 });

      const detail = eventSpy.lastCall.args[1]!
        .detail as unknown as VirtualGridState;
      expect(detail).to.include({
        columnStartIndex: 11,
        columnEndIndex: 14,
        totalWidth: 5000,
      });
    });

    it('scrolls to a scrollable column and not to a pinned one', async () => {
      const el = await createGrid({ pinnedStart: 2, pinnedEnd: 1 });
      const scrollSpy = spy(el, 'scrollTo');

      await el.scrollToColumn(30);
      expect(el.scrollLeft).to.equal(2800);

      scrollSpy.resetHistory();
      await el.scrollToColumn(0);
      await el.scrollToColumn(49);
      expect(scrollSpy).not.to.have.been.called;
    });

    it('clamps the pinned counts to the columns', async () => {
      const el = await createGrid({ columns: 5 });

      el.pinnedColumnsStart = 3;
      el.pinnedColumnsEnd = 100;
      await el.layoutComplete;

      expect(renderedColumnIndexes(el)).to.eql([0, 1, 2, 3, 4]);
      expect(track(el).style.getPropertyValue('--igc-grid-cols')).to.equal(
        '100px 100px 100px 0px [window-start] 1fr [pinned-end] 100px 100px'
      );
    });
  });

  describe('Data requests', () => {
    async function createShortGrid(rows: number): Promise<{
      el: Grid;
      requests: VirtualScrollDataRequest[];
    }> {
      const requests: VirtualScrollDataRequest[] = [];
      const el = await fixture<Grid>(
        html`<igc-virtual-grid
          style="width: 400px; height: 300px"
          .columns=${createColumns(3)}
          .cellTemplate=${cellTemplate}
          @igcDataRequest=${(event: CustomEvent<VirtualScrollDataRequest>) =>
            requests.push(event.detail)}
        ></igc-virtual-grid>`
      );

      el.data = createRows(rows);
      await el.layoutComplete;
      return { el, requests };
    }

    it('emits igcDataRequest when the rendered rows come near the end of data', async () => {
      const { requests } = await createShortGrid(8);

      expect(requests).to.eql([{ startIndex: 8, count: 20 }]);
    });

    it('does not repeat a request until data grows', async () => {
      const { el, requests } = await createShortGrid(8);

      el.requestUpdate();
      await el.layoutComplete;
      el.data = createRows(8);
      await el.layoutComplete;
      expect(requests).to.have.length(1);

      el.data = createRows(12);
      await el.layoutComplete;
      expect(requests[1]).to.eql({ startIndex: 12, count: 20 });
    });

    it('does not request while the window is far from the end', async () => {
      const { requests } = await createShortGrid(1000);

      expect(requests).to.be.empty;
    });
  });

  describe('getCellElement', () => {
    it('returns the rendered wrapper of a cell and null for one out of view', async () => {
      const el = await createGrid({ pinnedEnd: 1 });

      const cell = el.getCellElement(3, 2)!;
      expect(cell.dataset.vgColumn).to.equal('2');
      expect(cell.parentElement!.dataset.vgRow).to.equal('3');
      expect(cell.getAttribute('part')).to.equal('cell');
      expect(el.getCellElement(0, 49)!.dataset.vgPinned).to.equal('end');
      expect(el.getCellElement(500, 0)).to.be.null;
      expect(el.getCellElement(0, 30)).to.be.null;
    });
  });

  describe('RTL', () => {
    it('normalizes a negative scrollLeft and scrolls with a negative left', async () => {
      const el = await createGrid({ rows: 100, dir: 'rtl' });
      const scrollSpy = spy(el, 'scrollTo');

      await el.scrollToColumn(20);

      expect(scrollSpy.firstCall.args[0]).to.include({ left: -2000 });
      expect(renderedColumnIndexes(el)[0]).to.equal(19);
    });
  });
});
