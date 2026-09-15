import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { type nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { suppressResizeObserverLoopError } from '#internals/testing/helpers.spec.js';
import { simulateScroll } from '#internals/testing/simulate.spec.js';
import type { VirtualGridCellContext, VirtualGridState } from './types.js';
import IgcVirtualGridComponent, {
  type VirtualGridCellTemplate,
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
  }

  /** A 400 x 300 px grid of 100 px wide columns, settled. */
  async function createGrid({
    rows = 1000,
    columns = 50,
    template = cellTemplate,
    autoRowHeight = false,
    role,
    dir,
  }: GridOptions = {}): Promise<Grid> {
    const el = await fixture<Grid>(
      html`<igc-virtual-grid
        style="width: 400px; height: 300px"
        role=${ifDefined(role)}
        dir=${ifDefined(dir)}
        ?auto-row-height=${autoRowHeight}
        .data=${createRows(rows)}
        .columns=${createColumns(columns)}
        .columnWidth=${100}
        .cellTemplate=${template}
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
