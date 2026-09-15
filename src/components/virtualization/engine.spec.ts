import { expect } from '@open-wc/testing';
import {
  EMPTY_RANGE,
  normalizeOverScan,
  normalizeSize,
  rangesEqual,
  sliceRange,
  VirtualScrollEngine,
} from './engine.js';

describe('VirtualScrollEngine', () => {
  const ESTIMATE = 50;

  function createEngine(
    length = 100,
    estimate = ESTIMATE
  ): VirtualScrollEngine {
    const engine = new VirtualScrollEngine();
    engine.resize(length, estimate);
    return engine;
  }

  /**
   * A stand-in document whose probe reports `maxSize` as the largest
   * reachable coordinate, without a change to the real document. `scrollTop`
   * models a document that is already scrolled when the probe runs: the
   * probe's rect is viewport-relative, so it comes back short by that
   * amount. `probes` counts how often the probe element was created.
   */
  function createProbeDocument(maxSize: number, scrollTop = 0) {
    const probe = {
      style: {} as CSSStyleDeclaration,
      getBoundingClientRect: () => ({ top: maxSize - scrollTop }),
    };
    const state = { probes: 0 };
    const doc = {
      body: { appendChild: () => undefined, removeChild: () => undefined },
      documentElement: { scrollTop },
      createElement: () => {
        state.probes++;
        return probe;
      },
    } as unknown as Document;

    return { doc, state };
  }

  /**
   * Builds an engine whose probed maximum browser size is `maxSize`. A total
   * size past that point makes the engine compress its virtual coordinate
   * space into the DOM one.
   */
  function createEngineWithMaxSize(
    maxSize: number,
    length: number,
    estimate = ESTIMATE
  ): VirtualScrollEngine {
    const engine = new VirtualScrollEngine();
    engine.initMaxBrowserSize(createProbeDocument(maxSize).doc);
    engine.resize(length, estimate);
    return engine;
  }

  describe('Sizing', () => {
    it('fills new items with the estimated size', () => {
      const engine = createEngine(10);

      expect(engine.totalSize).to.equal(500);
      expect(engine.domSize).to.equal(500);
      expect(engine.getScrollOffsetForIndex(0)).to.equal(0);
      expect(engine.getScrollOffsetForIndex(3)).to.equal(150);
    });

    it('reports zero size before it is sized', () => {
      const engine = new VirtualScrollEngine();

      expect(engine.totalSize).to.equal(0);
      expect(engine.getScrollOffsetForIndex(5)).to.equal(0);
      expect(engine.getPhysicalRangeSize(0, 10)).to.equal(0);
      expect(engine.getVisibleRange(0, 300, 2)).to.eql({
        startIndex: 0,
        endIndex: -1,
      });
    });

    it('applies a measured size to subsequent offsets', () => {
      const engine = createEngine(10);
      engine.measureItem(2, 120);

      expect(engine.totalSize).to.equal(570);
      expect(engine.getScrollOffsetForIndex(2)).to.equal(100);
      expect(engine.getScrollOffsetForIndex(3)).to.equal(220);
      expect(engine.getPhysicalRangeSize(2, 2)).to.equal(120);
    });

    it('ignores measurements for out of range indices', () => {
      const engine = createEngine(10);
      engine.measureItem(10, 120);
      engine.measureItem(-1, 120);

      expect(engine.totalSize).to.equal(500);
    });

    it('clamps offsets to the item count', () => {
      const engine = createEngine(10);

      expect(engine.getScrollOffsetForIndex(10)).to.equal(500);
      expect(engine.getScrollOffsetForIndex(999)).to.equal(500);
      expect(engine.getScrollOffsetForIndex(-5)).to.equal(0);
    });

    it('sums only the requested range, clamped to the item count', () => {
      const engine = createEngine(10);

      expect(engine.getPhysicalRangeSize(2, 4)).to.equal(150);
      expect(engine.getPhysicalRangeSize(-5, 1)).to.equal(100);
      expect(engine.getPhysicalRangeSize(8, 999)).to.equal(100);
      expect(engine.getPhysicalRangeSize(4, 3)).to.equal(0);
    });
  });

  describe('Estimated size', () => {
    it('applies a new estimate to unmeasured items only', () => {
      const engine = createEngine(10);
      engine.measureItem(0, 30);
      engine.updateEstimatedSize(100);

      expect(engine.totalSize).to.equal(30 + 9 * 100);
      expect(engine.getScrollOffsetForIndex(1)).to.equal(30);
    });

    it('treats a measurement equal to the current size as measured', () => {
      const engine = createEngine(10);
      // The same value as the estimate: no size change, but the item must
      // still be flagged as measured, so a later estimate cannot overwrite it.
      engine.measureItem(0, ESTIMATE);
      engine.updateEstimatedSize(100);

      expect(engine.totalSize).to.equal(ESTIMATE + 9 * 100);
    });
  });

  describe('Resizing', () => {
    it('preserves measured sizes when items are appended', () => {
      const engine = createEngine(10);
      engine.measureItem(1, 30);
      engine.resize(20, ESTIMATE);

      expect(engine.totalSize).to.equal(30 + 19 * ESTIMATE);
      expect(engine.getScrollOffsetForIndex(2)).to.equal(80);
    });

    it('preserves measured sizes when items are removed', () => {
      const engine = createEngine(10);
      engine.measureItem(1, 30);
      engine.resize(5, ESTIMATE);

      expect(engine.totalSize).to.equal(30 + 4 * ESTIMATE);
    });

    it('discards measured sizes at and beyond retainCount', () => {
      const engine = createEngine(10);
      engine.measureItem(1, 30);
      engine.measureItem(6, 30);
      engine.resize(10, ESTIMATE, 4);

      // Item 1 is retained. Item 6 is set back to the estimate.
      expect(engine.totalSize).to.equal(30 + 9 * ESTIMATE);
      expect(engine.getScrollOffsetForIndex(2)).to.equal(80);
    });

    it('re-marks discarded items as unmeasured', () => {
      const engine = createEngine(10);
      engine.measureItem(6, 30);
      engine.resize(10, ESTIMATE, 4);
      engine.updateEstimatedSize(100);

      // Nothing is measured now, so each item follows the new estimate.
      expect(engine.totalSize).to.equal(10 * 100);
    });

    it('is a no-op when the length matches and everything is retained', () => {
      const engine = createEngine(10);
      engine.measureItem(1, 30);

      let notified = false;
      engine.onSizeChange = () => {
        notified = true;
      };
      engine.resize(10, ESTIMATE);

      expect(notified).to.be.false;
      expect(engine.totalSize).to.equal(30 + 9 * ESTIMATE);
    });
  });

  describe('Change notifications', () => {
    it('notifies on resize, measurement and estimate changes', () => {
      const engine = new VirtualScrollEngine();
      let count = 0;
      engine.onSizeChange = () => {
        count++;
      };

      engine.resize(10, ESTIMATE);
      expect(count).to.equal(1);

      engine.measureItem(0, 30);
      expect(count).to.equal(2);

      engine.updateEstimatedSize(80);
      expect(count).to.equal(3);
    });

    it('does not notify when nothing actually changes', () => {
      const engine = createEngine(10);
      let count = 0;
      engine.onSizeChange = () => {
        count++;
      };

      engine.measureItem(0, ESTIMATE);
      engine.updateEstimatedSize(ESTIMATE);

      expect(count).to.equal(0);
    });
  });

  describe('Visible range', () => {
    it('returns an empty range without items or viewport', () => {
      expect(createEngine(0).getVisibleRange(0, 300, 2)).to.eql({
        startIndex: 0,
        endIndex: -1,
      });
      expect(createEngine(10).getVisibleRange(0, 0, 2)).to.eql({
        startIndex: 0,
        endIndex: -1,
      });
    });

    it('covers the viewport from the top', () => {
      const engine = createEngine(100);

      expect(engine.getVisibleRange(0, 300, 0)).to.eql({
        startIndex: 0,
        endIndex: 6,
      });
    });

    it('resolves an offset that falls exactly on an item boundary', () => {
      const engine = createEngine(100);

      expect(engine.getVisibleRange(100, 100, 0)).to.eql({
        startIndex: 2,
        endIndex: 4,
      });
    });

    it('expands by the over-scan and clamps to the item count', () => {
      const engine = createEngine(100);

      expect(engine.getVisibleRange(0, 300, 2)).to.eql({
        startIndex: 0,
        endIndex: 8,
      });
      expect(engine.getVisibleRange(5000, 300, 2)).to.eql({
        startIndex: 97,
        endIndex: 99,
      });
    });

    it('accounts for measured sizes', () => {
      const engine = createEngine(100);
      for (let i = 0; i < 10; i++) {
        engine.measureItem(i, 100);
      }

      expect(engine.getVisibleRange(0, 300, 0)).to.eql({
        startIndex: 0,
        endIndex: 3,
      });
    });
  });

  describe('Alignment', () => {
    it('aligns to the leading edge', () => {
      const engine = createEngine(100);

      expect(engine.getAlignedScrollOffset(10, 300, 'start')).to.equal(500);
    });

    it('centers the item within the viewport', () => {
      const engine = createEngine(100);

      // 500 - (300 - 50) / 2
      expect(engine.getAlignedScrollOffset(10, 300, 'center')).to.equal(375);
    });

    it('aligns to the trailing edge', () => {
      const engine = createEngine(100);

      // 500 - (300 - 50)
      expect(engine.getAlignedScrollOffset(10, 300, 'end')).to.equal(250);
    });

    it('never returns a negative offset', () => {
      const engine = createEngine(100);

      expect(engine.getAlignedScrollOffset(0, 300, 'center')).to.equal(0);
      expect(engine.getAlignedScrollOffset(1, 300, 'end')).to.equal(0);
    });

    it('clamps to the largest reachable scroll offset', () => {
      const engine = createEngine(100);
      const maxOffset = engine.domSize - 300;

      expect(maxOffset).to.equal(5000 - 300);
      expect(engine.getAlignedScrollOffset(99, 300, 'start')).to.equal(
        maxOffset
      );
    });

    it('reports whether an item is fully in view', () => {
      const engine = createEngine(100);

      expect(engine.isIndexInView(0, 0, 300)).to.be.true;
      expect(engine.isIndexInView(5, 0, 300)).to.be.true;
      // Item 6 spans 300-350, so it is only partially visible.
      expect(engine.isIndexInView(6, 0, 300)).to.be.false;
      expect(engine.isIndexInView(20, 0, 300)).to.be.false;
    });

    it('treats an item larger than the viewport as in view once it covers it', () => {
      const engine = createEngine(10);
      engine.measureItem(0, 1000);

      // The item cannot fit inside the viewport. While it spans the whole
      // viewport, there is nothing to scroll to, as with native
      // `scrollIntoView({ block: 'nearest' })`.
      expect(engine.isIndexInView(0, 0, 300)).to.be.true;
      expect(engine.isIndexInView(0, 350, 300)).to.be.true;
      // Scrolled past its trailing edge, the item no longer covers the viewport.
      expect(engine.isIndexInView(0, 800, 300)).to.be.false;
    });

    it('clamps an out of range index the same way as the alignment math', () => {
      const engine = createEngine(100);
      const last = engine.getAlignedScrollOffset(99, 300, 'start');

      expect(engine.getAlignedScrollOffset(999, 300, 'start')).to.equal(last);
      expect(engine.isIndexInView(999, last, 300)).to.equal(
        engine.isIndexInView(99, last, 300)
      );
    });

    it('stays within range on an empty tree', () => {
      const engine = createEngine(0);

      expect(engine.getAlignedScrollOffset(0, 300, 'center')).to.equal(0);
      expect(engine.isIndexInView(0, 0, 300)).to.be.false;
    });
  });

  describe('Coordinate compression', () => {
    const MAX_SIZE = 10_000;
    const ITEMS = 1000; // 50_000px total, a ratio of 5

    it('clamps the DOM size to the maximum browser size', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);

      expect(engine.totalSize).to.equal(50_000);
      expect(engine.domSize).to.equal(MAX_SIZE);
    });

    it('leaves the DOM size untouched below the maximum', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, 100);

      expect(engine.totalSize).to.equal(5000);
      expect(engine.domSize).to.equal(5000);
    });

    it('maps DOM scroll positions onto the virtual space', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);

      // Halfway down the DOM range is halfway down the virtual range.
      expect(engine.getVisibleRange(MAX_SIZE / 2, 300, 0).startIndex).to.equal(
        500
      );
      expect(engine.getScrollOffsetForIndex(500)).to.equal(MAX_SIZE / 2);
    });

    it('sizes the rendered window by the viewport, not by the ratio', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);
      const compressed = engine.getVisibleRange(MAX_SIZE / 2, 300, 0);

      // A 300px viewport of 50px items shows 6 items at any compression of
      // the virtual space, because the items render at their real size.
      expect(compressed.endIndex - compressed.startIndex).to.equal(6);
    });

    it('converts the alignment slack into DOM space', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, ITEMS);
      const start = engine.getAlignedScrollOffset(500, 300, 'start');
      const centered = engine.getAlignedScrollOffset(500, 300, 'center');

      // The slack is 125 virtual px, which is 25 DOM px at a ratio of 5.
      expect(start).to.equal(MAX_SIZE / 2);
      expect(centered).to.equal(MAX_SIZE / 2 - 25);
    });

    it('probes a given document only once', () => {
      const { doc, state } = createProbeDocument(MAX_SIZE);

      new VirtualScrollEngine().initMaxBrowserSize(doc);
      new VirtualScrollEngine().initMaxBrowserSize(doc);

      expect(state.probes).to.equal(1);
    });

    it('probes the full extent from an already scrolled document', () => {
      const { doc } = createProbeDocument(MAX_SIZE, 2500);
      const engine = new VirtualScrollEngine();

      engine.initMaxBrowserSize(doc);
      engine.resize(ITEMS, ESTIMATE);

      // If the document scroll offset were not added back, the probe would
      // report 7500 and the content would be compressed into it.
      expect(engine.domSize).to.equal(MAX_SIZE);
    });
  });

  describe('Fixed sizes', () => {
    function createFixedEngine(
      length = 100,
      size = ESTIMATE
    ): VirtualScrollEngine {
      const engine = new VirtualScrollEngine();
      engine.fixed = true;
      engine.resize(length, size);
      return engine;
    }

    it('agrees with the measured index on every query', () => {
      const size = 37;
      const fixed = createFixedEngine(1000, size);
      const measured = createEngine(1000, size);

      expect(fixed.totalSize).to.equal(measured.totalSize);
      expect(fixed.getPhysicalRangeSize(5, 20)).to.equal(
        measured.getPhysicalRangeSize(5, 20)
      );

      for (const offset of [0, 1, 36, 37, 38, 500, 36_999, 37_000, 1e6]) {
        expect(fixed.getVisibleRange(offset, 300, 2)).to.eql(
          measured.getVisibleRange(offset, 300, 2)
        );
        expect(fixed.isIndexInView(400, offset, 300)).to.equal(
          measured.isIndexInView(400, offset, 300)
        );
      }

      for (const index of [0, 1, 17, 999, 1000, 5000]) {
        expect(fixed.getScrollOffsetForIndex(index)).to.equal(
          measured.getScrollOffsetForIndex(index)
        );
        for (const align of ['start', 'center', 'end'] as const) {
          expect(fixed.getAlignedScrollOffset(index, 300, align)).to.equal(
            measured.getAlignedScrollOffset(index, 300, align)
          );
        }
      }
    });

    it('ignores measurements', () => {
      const engine = createFixedEngine(10);
      let notifications = 0;
      engine.onSizeChange = () => notifications++;

      engine.measureItem(3, 100);

      expect(engine.totalSize).to.equal(500);
      expect(engine.getScrollOffsetForIndex(4)).to.equal(200);
      expect(notifications).to.equal(0);
    });

    it('applies a new estimate to every item', () => {
      const engine = createFixedEngine(10);
      let notifications = 0;
      engine.onSizeChange = () => notifications++;

      engine.updateEstimatedSize(20);
      engine.updateEstimatedSize(20);

      expect(engine.totalSize).to.equal(200);
      expect(engine.getScrollOffsetForIndex(5)).to.equal(100);
      expect(notifications).to.equal(1);
    });

    it('resizes to the new count and skips a resize to the same count', () => {
      const engine = createFixedEngine(10);
      let notifications = 0;
      engine.onSizeChange = () => notifications++;

      engine.resize(20, ESTIMATE);
      expect(engine.totalSize).to.equal(1000);

      // There are no measurements to discard, so a partial retain is a no-op.
      engine.resize(20, ESTIMATE, 5);
      expect(notifications).to.equal(1);
    });

    it('does not notify when the mode is set again or before sizing', () => {
      const engine = new VirtualScrollEngine();
      let notifications = 0;
      engine.onSizeChange = () => notifications++;

      engine.fixed = true;
      engine.fixed = true;
      expect(engine.fixed).to.be.true;
      expect(notifications).to.equal(0);

      engine.resize(10, ESTIMATE);
      expect(engine.totalSize).to.equal(500);
      expect(notifications).to.equal(1);
    });

    it('discards measured sizes on a switch in either direction', () => {
      const engine = createEngine(10);
      engine.measureItem(0, 100);
      expect(engine.totalSize).to.equal(550);

      engine.fixed = true;
      expect(engine.totalSize).to.equal(500);

      engine.fixed = false;
      expect(engine.totalSize).to.equal(500);

      engine.measureItem(0, 100);
      expect(engine.totalSize).to.equal(550);
    });

    it('compresses the scroll range like the measured index', () => {
      const engine = new VirtualScrollEngine();
      engine.initMaxBrowserSize(createProbeDocument(1000).doc);
      engine.fixed = true;
      engine.resize(100, ESTIMATE);

      expect(engine.totalSize).to.equal(5000);
      expect(engine.domSize).to.equal(1000);
      expect(engine.getVisibleRange(500, 100, 0)).to.eql({
        startIndex: 50,
        endIndex: 52,
      });
    });

    it('stays in range with a zero size', () => {
      const engine = createFixedEngine(10, 0);

      expect(engine.totalSize).to.equal(0);
      expect(engine.getVisibleRange(100, 300, 0)).to.eql({
        startIndex: 0,
        endIndex: 0,
      });
      expect(engine.getAlignedScrollOffset(5, 300, 'end')).to.equal(0);
    });
  });

  describe('Explicit sizes', () => {
    it('adopts the given sizes as measured', () => {
      const engine = new VirtualScrollEngine();
      let notifications = 0;
      engine.onSizeChange = () => notifications++;

      engine.setSizes([10, 20, 30]);

      expect(engine.totalSize).to.equal(60);
      expect(engine.getScrollOffsetForIndex(2)).to.equal(30);
      expect(notifications).to.equal(1);

      engine.updateEstimatedSize(100);
      expect(engine.totalSize).to.equal(60);
    });

    it('leaves fixed mode', () => {
      const engine = new VirtualScrollEngine();
      engine.fixed = true;
      engine.resize(3, ESTIMATE);

      engine.setSizes(new Float64Array([10, 20, 30]));

      expect(engine.fixed).to.be.false;
      engine.measureItem(0, 15);
      expect(engine.totalSize).to.equal(65);
    });

    it('keeps the sizes across an append', () => {
      const engine = new VirtualScrollEngine();
      engine.setSizes([10, 20, 30]);

      engine.resize(5, ESTIMATE);

      expect(engine.totalSize).to.equal(60 + 2 * ESTIMATE);
      expect(engine.getScrollOffsetForIndex(3)).to.equal(60);
    });
  });

  describe('Item sizes and scroll positions', () => {
    it('getItemSize returns the current size of one item and 0 outside the list', () => {
      const engine = createEngine(3);
      engine.measureItem(1, 70);

      expect(engine.getItemSize(0)).to.equal(ESTIMATE);
      expect(engine.getItemSize(1)).to.equal(70);
      expect(engine.getItemSize(3)).to.equal(0);
      expect(engine.getItemSize(-1)).to.equal(0);
    });

    it('getRangeOffset places a range at its first item and clamps it to the track', () => {
      const engine = createEngine(100);

      expect(engine.getRangeOffset({ startIndex: 10, endIndex: 15 })).to.equal(
        10 * ESTIMATE
      );
      // The last range must end at the track end, whatever its first item.
      expect(engine.getRangeOffset({ startIndex: 98, endIndex: 99 })).to.equal(
        98 * ESTIMATE
      );
    });

    it('resolveScrollOffset keeps the current offset for nearest on an item in view', () => {
      const engine = createEngine(100);

      expect(engine.resolveScrollOffset(5, 100, 200, 'nearest')).to.equal(100);
      expect(engine.resolveScrollOffset(50, 100, 200, 'nearest')).to.equal(
        50 * ESTIMATE
      );
    });

    it('resolveScrollOffset maps every other position onto an alignment', () => {
      const engine = createEngine(100);

      expect(engine.resolveScrollOffset(10, 0, 200)).to.equal(500);
      expect(engine.resolveScrollOffset(10, 0, 200, 'start')).to.equal(500);
      expect(engine.resolveScrollOffset(10, 0, 200, 'end')).to.equal(350);
      expect(engine.resolveScrollOffset(10, 0, 200, 'center')).to.equal(425);
    });
  });

  describe('Reserved size', () => {
    const MAX_SIZE = 10_000;

    it('shrinks the track by the reserved size only under compression', () => {
      const engine = createEngineWithMaxSize(MAX_SIZE, 100);
      engine.reservedSize = 400;

      // 5000px of items fit into the 9600px left, so nothing is compressed.
      expect(engine.domSize).to.equal(5000);

      engine.resize(1000, ESTIMATE);
      expect(engine.domSize).to.equal(MAX_SIZE - 400);
      expect(engine.getScrollOffsetForIndex(1000)).to.equal(MAX_SIZE - 400);
    });

    it('starts compression once the items no longer fit next to the reserved size', () => {
      // 5000px of items into 10_000px is uncompressed; into 4800px it is not.
      const engine = createEngineWithMaxSize(MAX_SIZE, 100);
      let changes = 0;
      engine.onSizeChange = () => changes++;

      engine.reservedSize = 5200;
      expect(engine.domSize).to.equal(4800);
      expect(changes).to.equal(1);

      engine.reservedSize = 5200;
      expect(changes).to.equal(1);

      engine.reservedSize = -10;
      expect(engine.domSize).to.equal(5000);
    });
  });

  describe('Range helpers', () => {
    it('compares ranges by their indexes', () => {
      expect(rangesEqual(EMPTY_RANGE, { startIndex: 0, endIndex: -1 })).to.be
        .true;
      expect(rangesEqual(EMPTY_RANGE, { startIndex: 0, endIndex: 0 })).to.be
        .false;
    });

    it('slices the items of a range and nothing for an empty one', () => {
      const items = ['a', 'b', 'c', 'd'];

      expect(sliceRange(items, { startIndex: 1, endIndex: 2 })).to.eql([
        'b',
        'c',
      ]);
      expect(sliceRange(items, EMPTY_RANGE)).to.eql([]);
    });

    it('normalizes consumer input for over-scan and sizes', () => {
      expect(normalizeOverScan(2.7, 1)).to.equal(2);
      expect(normalizeOverScan(-3, 1)).to.equal(0);
      expect(normalizeOverScan('abc', 1)).to.equal(1);
      expect(normalizeSize(30, 50)).to.equal(30);
      expect(normalizeSize(0, 50)).to.equal(50);
      expect(normalizeSize(Number.NaN, 50)).to.equal(50);
    });
  });
});
