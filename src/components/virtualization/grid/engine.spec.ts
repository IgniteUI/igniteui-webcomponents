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
