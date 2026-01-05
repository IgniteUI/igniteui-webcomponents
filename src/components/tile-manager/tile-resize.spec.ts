import { range } from 'lit/directives/range.js';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  elementUpdated,
  fixture,
  html,
  nextFrame,
} from '../common/helpers.spec.js';
import { first, last } from '../common/util.js';
import {
  expectCalledWith,
  expectNotCalledWith,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcResizeContainerComponent from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import IgcTileComponent from './tile.js';
import IgcTileManagerComponent from './tile-manager.js';

describe('Tile resize', () => {
  beforeAll(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;
  let firstTile: IgcTileComponent;
  let tileManagerStyles: CSSStyleDeclaration;
  let columnSize: number;
  let rowSize: number;

  /** Wait tile dragging view transition(s) to complete. */
  async function viewTransitionComplete() {
    await nextFrame();
    await nextFrame();
  }

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
      firstTile = first(getTiles());
      tileManagerStyles = getComputedStyle(
        tileManager.shadowRoot!.querySelector('[part~="base"]')!
      );

      const gap = Number.parseFloat(tileManagerStyles.gap);

      columnSize = Number.parseFloat(first(getColumns())) + gap;
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
      const lastTile = last(getTiles());
      const DOM = getResizeContainerDOM(lastTile);

      expect(getRows().length).to.eql(1);
      expect(getComputedStyle(lastTile).gridRow).to.eql('auto / span 1');

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: rowSize * 4,
      });
      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getRows().length).to.eql(4);
      expect(getComputedStyle(lastTile).gridRow).to.eql('auto / span 4');
    });

    it('should create a ghost element on resize start', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(DOM.resizeElement, 'emitEvent');

      expect(DOM.ghostElement).to.be.null;

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(DOM.ghostElement).to.not.be.null;
      expectCalledWith(eventSpy, 'igcResizeStart');
    });

    it('should update ghost element styles during pointer move', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expectCalledWith(eventSpy, 'igcResizeStart');
      expect(DOM.ghostElement.getBoundingClientRect()).to.eql(tileRect);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      const state = getResizeEventState(eventSpy);

      expectCalledWith(eventSpy, 'igcResize');
      expect(state.ghost).to.equal(DOM.ghostElement);
      expect(state.initial).to.eql(tileRect);
      assertRectsAreEqual(
        state.current,
        DOM.ghostElement.getBoundingClientRect()
      );
    });

    it('Should correctly resize column with auto grid', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(DOM.resizeElement, 'emitEvent');

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      expectCalledWith(eventSpy, 'igcResizeStart');
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 2,
      });

      await elementUpdated(DOM.resizeElement);

      expectCalledWith(eventSpy, 'igcResize');

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expectCalledWith(eventSpy, 'igcResizeEnd');
      expect(DOM.ghostElement).to.be.null;

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 2');
    });

    it('Should correctly shrink tile', async () => {
      firstTile.colSpan = 3;
      firstTile.rowSpan = 3;

      const DOM = getResizeContainerDOM(firstTile);

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.container);

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 3');
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 3');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: columnSize,
        clientY: rowSize,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 1');
    });

    it('Should correctly create/remove implicit rows and resize row with auto grid', async () => {
      const DOM = getResizeContainerDOM(firstTile);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getColumns().length).to.eql(4);
      expect(getRows().length).to.eql(1);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 4,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 4');
      expect(getRows().length).to.eql(2);
      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 1');

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(DOM.container);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: rowSize * 2,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridRow).to.eql('auto / span 2');

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.container);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: columnSize * 2 * -1,
        clientY: rowSize * 2 * -1,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);
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
      const DOM = getResizeContainerDOM(firstTile);

      tileManager.columnCount = 10;
      await elementUpdated(tileManager);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 20,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(DOM.resizeElement);
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
      const DOM = getResizeContainerDOM(firstTile);

      tileManager.columnCount = 5;
      await elementUpdated(tileManager);

      firstTile.colStart = 2;
      await elementUpdated(firstTile);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 3,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridColumn).to.eql('2 / span 4');
    });

    it('Should maintain row position on resize when rowStart is set', async () => {
      const DOM = getResizeContainerDOM(firstTile);

      firstTile.rowStart = 2;

      const secondTile = getTiles()[1];
      secondTile.rowStart = 3;

      await elementUpdated(tileManager);

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(DOM.container);

      simulatePointerMove(DOM.adorners.bottom, {
        clientY: columnSize * 2,
      });

      await elementUpdated(DOM.resizeElement);

      simulateLostPointerCapture(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(getComputedStyle(firstTile).gridRow).to.eql('2 / span 3');
    });

    it('should cancel resize by pressing ESC key', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expectCalledWith(eventSpy, 'igcResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      expect(DOM.ghostElement).not.to.be.null;

      simulateKeyboard(DOM.resizeElement, escapeKey);
      await elementUpdated(DOM.resizeElement);

      expectCalledWith(eventSpy, 'igcResizeCancel');
      expect(DOM.ghostElement).to.be.null;
      assertRectsAreEqual(firstTile.getBoundingClientRect(), tileRect);
    });

    it('should fire `igcTileResizeStart` when a resize operation begins', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(firstTile, 'emitEvent');

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expectCalledWith(eventSpy, 'igcTileResizeStart');
    });

    it('should stop resize operations by canceling the `igcTileResizeStart` event', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(firstTile, 'emitEvent');

      firstTile.addEventListener('igcTileResizeStart', (event) =>
        event.preventDefault()
      );

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expectCalledWith(eventSpy, 'igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner);
      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expectNotCalledWith(eventSpy, 'igcTileResizeEnd');
    });

    it('should fire `igcTileResizeEnd` when a resize operation is performed successfully', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(firstTile, 'emitEvent');

      const { colSpan: initialColumnSpan, rowSpan: initialRowSpan } = firstTile;

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expectCalledWith(eventSpy, 'igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      simulateLostPointerCapture(DOM.adorners.corner);
      await viewTransitionComplete();

      expectCalledWith(eventSpy, 'igcTileResizeEnd');
      expect(DOM.ghostElement).to.be.null;

      const { colSpan, rowSpan } = firstTile;
      expect(initialColumnSpan).is.lessThan(colSpan);
      expect(initialRowSpan).is.lessThan(rowSpan);
    });

    it('should fire `igcTileResizeCancel` when canceling a resize operation', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(firstTile, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(firstTile);

      expectCalledWith(eventSpy, 'igcTileResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(firstTile);

      expect(DOM.ghostElement).not.to.be.null;

      simulateKeyboard(DOM.resizeElement, escapeKey);
      await elementUpdated(firstTile);

      expectCalledWith(eventSpy, 'igcTileResizeCancel');
      expect(DOM.ghostElement).to.be.null;
      assertRectsAreEqual(firstTile.getBoundingClientRect(), tileRect);
    });

    it('should disable igc-resize behavior when `disableResize` is true', async () => {
      const DOM = getTileDOM(firstTile);

      expect(DOM.resizeElement).is.not.null;

      firstTile.disableResize = true;
      await elementUpdated(firstTile);

      expect(DOM.resizeElement).is.null;
    });

    it('should update tile parts on resizing', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = vi.spyOn(DOM.resizeElement, 'emitEvent');

      expect(firstTile.part.length).to.equal(0);

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);

      expectCalledWith(eventSpy, 'igcResizeStart');
      expect(firstTile.part.length).to.be.greaterThan(0);
      expect(firstTile.part.contains('resizing')).to.be.true;
    });
  });
});

function getTileDOM(tile: IgcTileComponent) {
  const root = tile.renderRoot;

  return {
    get resizeElement() {
      return root.querySelector(IgcResizeContainerComponent.tagName)!;
    },
  };
}

function getResizeContainerDOM(tile: IgcTileComponent) {
  const resizeContainer = tile.renderRoot.querySelector(
    IgcResizeContainerComponent.tagName
  )!;
  const root = resizeContainer.renderRoot;

  return {
    adorners: {
      get side() {
        return root.querySelector<HTMLElement>('[part="trigger-side"]')!;
      },
      get corner() {
        return root.querySelector<HTMLElement>('[part="trigger"]')!;
      },
      get bottom() {
        return root.querySelector<HTMLElement>('[part="trigger-bottom"]')!;
      },
    },
    get container() {
      return root.querySelector<HTMLElement>('[part~="resize-base"]')!;
    },
    get resizeElement() {
      return resizeContainer;
    },
    /** The ghost element when in deferred mode */
    get ghostElement() {
      return document.querySelector<HTMLElement>('[data-resize-ghost]')!;
    },
  };
}

function getResizeEventState(
  eventSpy: ReturnType<typeof vi.spyOn>
): ResizeCallbackParams['state'] {
  const calls = eventSpy.mock.calls;
  const lastCall = calls[calls.length - 1] as [
    string,
    CustomEventInit<{ state: ResizeCallbackParams['state'] }>,
  ];
  return lastCall[1]!.detail!.state;
}

function assertRectsAreEqual(a: DOMRect, b: DOMRect, delta = 0.01) {
  const first: Record<string, number> = a.toJSON();
  const second: Record<string, number> = b.toJSON();

  for (const key of Object.keys(first)) {
    expect(first[key]).approximately(second[key], delta);
  }
}
