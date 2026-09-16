import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { range } from 'lit/directives/range.js';
import { spy } from 'sinon';
import { escapeKey } from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { viewTransitionComplete } from '#internals/testing/helpers.spec.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

describe('Tile resize', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;
  let firstTile: IgcTileComponent;
  let tileManagerStyles: CSSStyleDeclaration;
  let columnSize: number;
  let rowSize: number;

  function getTiles() {
    return Array.from(tileManager.querySelectorAll(IgcTileComponent.tagName));
  }

  function getColumns() {
    return tileManagerStyles.gridTemplateColumns.split(' ');
  }

  function getRows() {
    return tileManagerStyles.gridTemplateRows.split(' ');
  }

  function createTileManager() {
    const result = Array.from(range(3)).map((i) => {
      return html`
        <igc-tile id="tile${i}">
          <h3 slot="title">Tile ${i + 1}</h3>

          <div>
            <p>Content in tile ${i + 1}</p>
          </div>
        </igc-tile>
      `;
    });

    return html`<div style="width: 1000px;">
      <igc-tile-manager
        resize-mode="always"
        .minColumnWidth=${'200px'}
        .minRowHeight=${'200px'}
        >${result}</igc-tile-manager
      >
    </div>`;
  }

  describe('Tile resize behavior', () => {
    beforeEach(async () => {
      tileManager = (
        await fixture<IgcTileManagerComponent>(createTileManager())
      ).querySelector('igc-tile-manager')!;
      firstTile = firstOf(getTiles());
      tileManagerStyles = getComputedStyle(
        tileManager.shadowRoot!.querySelector('[part~="base"]')!
      );

      const gap = Number.parseFloat(tileManagerStyles.gap);

      columnSize = Number.parseFloat(firstOf(getColumns())) + gap;
      rowSize = Number.parseFloat(tileManager.minRowHeight!) + gap;
    });

    it('should add resizable part to the tile', async () => {
      const tile = Array.from(
        tileManager.querySelectorAll(IgcTileComponent.tagName)
      )[0];
      const getTileSlot = () =>
        tile.shadowRoot!.querySelector('div[part~="resizable"]');

      tileManager.resizeMode = 'always';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;

      tileManager.resizeMode = 'none';
      await elementUpdated(tileManager);

      expect(getTileSlot()).to.be.null;

      tileManager.resizeMode = 'hover';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;

      tile.disableResize = true;
      await elementUpdated(tileManager);

      expect(getTileSlot()).to.be.null;
    });

    it('should create new rows when resizing last row', async () => {
      const lastTile = lastOf(getTiles());
      const DOM = getTileDOM(lastTile);

      expect(getRows().length).to.eql(1);
      expect(getComputedStyle(lastTile).gridRow).to.eql('auto / span 1');

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(lastTile);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: rowSize * 4,
      });
      await elementUpdated(lastTile);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(lastTile);
      await nextFrame();

      expect(getRows().length).to.eql(4);
      expect(getComputedStyle(lastTile).gridRow).to.eql('auto / span 4');
    });

    it('should create a ghost element on resize start', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      expect(DOM.ghostElement).to.be.null;

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(DOM.ghostElement).to.not.be.null;
      expect(eventSpy).calledWith('igcTileResizeStart');
    });

    it('should update ghost element styles during pointer move', async () => {
      const DOM = getTileDOM(firstTile);

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(DOM.ghostElement.getBoundingClientRect()).to.eql(tileRect);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(firstTile);

      const ghostRect = DOM.ghostElement.getBoundingClientRect();

      expect(ghostRect.width).to.be.greaterThan(tileRect.width);
      expect(ghostRect.height).to.be.greaterThan(tileRect.height);
    });

    it('Should correctly resize column with auto grid', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 2,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.side);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileResizeEnd');
      expect(DOM.ghostElement).to.be.null;

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 2');
    });

    it('Should correctly shrink tile', async () => {
      firstTile.colSpan = 3;
      firstTile.rowSpan = 3;

      const DOM = getTileDOM(firstTile);

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 3');
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 3');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: columnSize,
        clientY: rowSize,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 1');
    });

    it('Should correctly create/remove implicit rows and resize row with auto grid', async () => {
      const DOM = getTileDOM(firstTile);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(firstTile);

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getColumns().length).to.eql(4);
      expect(getRows().length).to.eql(1);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 4,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 4');
      expect(getRows().length).to.eql(2);
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 1');

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(firstTile);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: rowSize * 2,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 2');

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: columnSize * 2 * -1,
        clientY: rowSize * 2 * -1,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getRows().length).to.eql(1);
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 1');
    });

    it('Should correctly set columnCount', async () => {
      expect(getColumns().length).to.eql(4);

      tileManager.columnCount = 10;
      await elementUpdated(tileManager);

      expect(getColumns().length).to.eql(10);
    });

    it('Should cap resizing to max col if greater than', async () => {
      const DOM = getTileDOM(firstTile);

      tileManager.columnCount = 10;
      await elementUpdated(tileManager);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(firstTile);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 20,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 10');
    });

    it('Should initialize tile colSpan as columnCount if it is greater than columnCount', async () => {
      tileManager.columnCount = 10;
      firstTile.colSpan = 15;
      await elementUpdated(tileManager);

      expect(getColumns().length).to.eql(10);
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 10');
    });

    it('Should preserve tile colStart when colStart is valid and colStart + colSpan is greater than columnCount', async () => {
      tileManager.columnCount = 10;
      firstTile.colStart = 5;
      firstTile.colSpan = 10;
      await elementUpdated(tileManager);

      expect(getColumns().length).to.eql(10);
      expect(getComputedStyle(firstTile).gridColumn).to.eql('5 / span 6');
    });

    it('Should set colStart to 0(auto) and colSpan to columnCount when both are greater than columnCount', async () => {
      tileManager.columnCount = 10;
      firstTile.colStart = 11;
      firstTile.colSpan = 12;
      await elementUpdated(tileManager);

      expect(getColumns().length).to.eql(10);
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 10');
    });

    it('Should maintain column position on resize when colStart is set', async () => {
      const DOM = getTileDOM(firstTile);

      tileManager.columnCount = 5;
      await elementUpdated(tileManager);

      firstTile.colStart = 2;
      await elementUpdated(firstTile);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(firstTile);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 3,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('2 / span 4');
    });

    it('Should maintain row position on resize when rowStart is set', async () => {
      const DOM = getTileDOM(firstTile);

      firstTile.rowStart = 2;

      const secondTile = getTiles()[1];
      secondTile.rowStart = 3;

      await elementUpdated(tileManager);

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(firstTile);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: columnSize * 2,
      });

      await elementUpdated(firstTile);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(firstTile);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridRow).to.eql('2 / span 2');
    });

    it('should cancel resize by pressing ESC key', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(firstTile);

      expect(DOM.ghostElement).not.to.be.null;

      simulateKeyboard(firstTile, escapeKey);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeCancel');
      expect(DOM.ghostElement).to.be.null;
      assertRectsAreEqual(firstTile.getBoundingClientRect(), tileRect);
    });

    it('should fire `igcTileResizeStart` when a resize operation begins', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');
    });

    it('should stop resize operations by canceling the `igcTileResizeStart` event', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      firstTile.addEventListener('igcTileResizeStart', (event) =>
        event.preventDefault()
      );

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner);
      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy.callCount).to.equal(1);
      expect(eventSpy).not.calledWith('igcTileResizeEnd');
    });

    it('should fire `igcTileResizeEnd` when a resize operation is performed successfully', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      const { colSpan: initialColumnSpan, rowSpan: initialRowSpan } = firstTile;

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      simulateLostPointerCapture(DOM.adorners.corner);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileResizeEnd');
      expect(DOM.ghostElement).to.be.null;

      const { colSpan, rowSpan } = firstTile;
      expect(initialColumnSpan).is.lessThan(colSpan);
      expect(initialRowSpan).is.lessThan(rowSpan);
    });

    it('should fire `igcTileResizeCancel` when canceling a resize operation', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(firstTile);

      expect(DOM.ghostElement).not.to.be.null;

      simulateKeyboard(firstTile, escapeKey);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeCancel');
      expect(DOM.ghostElement).to.be.null;
      assertRectsAreEqual(firstTile.getBoundingClientRect(), tileRect);
    });

    it('should disable resize behavior when `disableResize` is true', async () => {
      const DOM = getTileDOM(firstTile);

      expect(DOM.container).is.not.null;
      expect(DOM.adorners.corner).is.not.null;

      firstTile.disableResize = true;
      await elementUpdated(firstTile);

      expect(DOM.container).is.null;
      expect(DOM.adorners.corner).is.null;
    });

    it('should update tile parts on resizing', async () => {
      const DOM = getTileDOM(firstTile);
      const eventSpy = spy(firstTile, 'emitEvent');

      expect(firstTile.part.length).to.equal(0);

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(firstTile);

      expect(eventSpy).calledWith('igcTileResizeStart');
      expect(firstTile.part.length).to.be.greaterThan(0);
      expect(firstTile.part.contains('resizing')).to.be.true;
    });
  });
});

function getTileDOM(tile: IgcTileComponent) {
  const root = tile.renderRoot;

  return {
    adorners: {
      get side() {
        return root.querySelector<HTMLElement>('[part~="trigger-side"]')!;
      },
      get corner() {
        return root.querySelector<HTMLElement>('[part~="trigger"]')!;
      },
      get bottom() {
        return root.querySelector<HTMLElement>('[part~="trigger-bottom"]')!;
      },
    },
    get container() {
      return root.querySelector<HTMLElement>('[part~="tile-container"]')!;
    },
    /** The ghost element when in deferred mode */
    get ghostElement() {
      return document.querySelector<HTMLElement>('[data-resize-ghost]')!;
    },
  };
}

function assertRectsAreEqual(a: DOMRect, b: DOMRect, delta = 0.01) {
  const first: Record<string, number> = a.toJSON();
  const second: Record<string, number> = b.toJSON();

  for (const key of Object.keys(first)) {
    expect(first[key]).approximately(second[key], delta);
  }
}
