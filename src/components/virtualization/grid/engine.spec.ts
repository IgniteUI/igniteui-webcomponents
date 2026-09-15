import { expect } from '@open-wc/testing';
import { spy } from 'sinon';
import { EMPTY_RANGE } from '../engine.js';
import { VirtualGridEngine } from './engine.js';

describe('VirtualGridEngine', () => {
  let engine: VirtualGridEngine;

  beforeEach(() => {
    engine = new VirtualGridEngine();
    engine.initMaxBrowserSize(document);
  });

  it('forwards one size-change callback to both axes', () => {
    const callback = spy();
    engine.onSizeChange = callback;

    engine.rows.resize(10, 40);
    engine.columns.resize(5, 100);

    expect(callback).to.have.been.calledTwice;
  });

  it('computes each window from its own axis, viewport size and over-scan', () => {
    engine.rows.fixed = true;
    engine.rows.resize(1000, 40);
    engine.columns.fixed = true;
    engine.columns.resize(100, 100);

    const window = engine.getVisibleWindow(
      { top: 400, left: 250 },
      { width: 500, height: 200 },
      { rows: 2, columns: 1 }
    );

    // Rows 10..15 are in view (400 / 40 to 600 / 40), padded by 2.
    expect(window.rows).to.eql({ startIndex: 8, endIndex: 17 });
    // Columns 2..7 are in view (250 / 100 to 750 / 100), padded by 1.
    expect(window.columns).to.eql({ startIndex: 1, endIndex: 8 });
  });

  it('returns empty ranges for an axis without items or without a viewport', () => {
    engine.rows.resize(10, 40);

    const window = engine.getVisibleWindow(
      { top: 0, left: 0 },
      { width: 0, height: 200 },
      { rows: 0, columns: 0 }
    );

    // Offset 200 is the leading edge of row 5, so that row is in view too.
    expect(window.rows).to.eql({ startIndex: 0, endIndex: 5 });
    expect(window.columns).to.eql(EMPTY_RANGE);
  });

  describe('Pinned columns and header', () => {
    /** Ten 100px columns, two pinned at the start and one at the end. */
    function setPinnedColumns(): void {
      engine.setColumns(
        Array.from({ length: 10 }, () => 100),
        {
          start: 2,
          end: 1,
        }
      );
    }

    it('keeps pinned columns out of the horizontal axis and sizes them with insets', () => {
      setPinnedColumns();

      expect(engine.columns.length).to.equal(7);
      expect(engine.columns.totalSize).to.equal(700);
      expect(engine.totalWidth).to.equal(1000);
      expect(engine.domWidth).to.equal(1000);
      expect(engine.pinned.start.map((t) => t.inset)).to.eql([0, 100]);
      expect(engine.pinned.end.map((t) => t.inset)).to.eql([0]);
      expect(engine.pinned.end[0].side).to.equal('end');
    });

    it('clamps the pinned counts to the columns', () => {
      engine.setColumns([100, 100, 100], { start: 2, end: 5 });

      expect(engine.pinned.start).to.have.length(2);
      expect(engine.pinned.end).to.have.length(1);
      expect(engine.columns.length).to.equal(0);
    });

    it('answers width and range offset in column indexes', () => {
      engine.setColumns([50, 60, 100, 100, 100, 70], { start: 2, end: 1 });

      expect(engine.getColumnWidth(0)).to.equal(50);
      expect(engine.getColumnWidth(2)).to.equal(100);
      expect(engine.getColumnWidth(5)).to.equal(70);
      // Column 3 is the second scrollable one, 100px in.
      expect(
        engine.getColumnRangeOffset({ startIndex: 3, endIndex: 4 })
      ).to.equal(100);
    });

    it('narrows the viewport by the pinned width and the header height', () => {
      setPinnedColumns();
      engine.rows.fixed = true;
      engine.rows.resize(100, 40);
      engine.headerSize = 40;

      const window = engine.getVisibleWindow(
        { top: 0, left: 0 },
        { width: 500, height: 200 },
        { rows: 0, columns: 0 }
      );

      // 200px of scrollable width: columns 2..4 in column indexes.
      expect(window.columns).to.eql({ startIndex: 2, endIndex: 4 });
      // 160px below the header: rows 0..4.
      expect(window.rows).to.eql({ startIndex: 0, endIndex: 4 });
      expect(engine.rows.domSize).to.equal(4000);
    });

    it('scrolls to a scrollable column by its column index and not to a pinned one', () => {
      setPinnedColumns();
      const current = { top: 0, left: 300 };
      const viewport = { width: 500, height: 200 };

      expect(
        engine.resolveScrollPosition({ column: 5 }, current, viewport).left
      ).to.equal(300);
      expect(
        engine.resolveScrollPosition({ column: 6 }, current, viewport).left
      ).to.equal(400);
      expect(
        engine.resolveScrollPosition({ column: 1 }, current, viewport).left
      ).to.equal(300);
      expect(
        engine.resolveScrollPosition({ column: 9 }, current, viewport).left
      ).to.equal(300);
    });
  });

  it('resolves a scroll position per axis and keeps an axis without a target', () => {
    engine.rows.fixed = true;
    engine.rows.resize(1000, 40);
    engine.columns.fixed = true;
    engine.columns.resize(100, 100);
    const current = { top: 100, left: 300 };
    const viewport = { width: 400, height: 200 };

    expect(
      engine.resolveScrollPosition({ row: 10, column: 5 }, current, viewport)
    ).to.eql({ top: 400, left: 500 });
    expect(engine.resolveScrollPosition({ row: 10 }, current, viewport)).to.eql(
      { top: 400, left: 300 }
    );
    expect(
      engine.resolveScrollPosition({ row: 10, column: 5 }, current, viewport, {
        block: 'end',
        inline: 'center',
      })
    ).to.eql({ top: 240, left: 350 });
  });
});
