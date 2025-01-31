import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import type Sinon from 'sinon';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { asNumber, first, last } from '../common/util.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerEnter,
  simulatePointerLeave,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcResizeContainerComponent, {
  type IgcResizeContainerComponentEventMap,
} from '../resize-container/resize-container.js';
import type { ResizeCallbackParams } from '../resize-container/types.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

describe('Tile resize', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;
  let firstTile: IgcTileComponent;

  function getTiles() {
    return Array.from(tileManager.querySelectorAll(IgcTileComponent.tagName));
  }

  function createTileManager() {
    const result = Array.from(range(5)).map(
      (i) => html`
        <igc-tile id="tile${i}">
          <igc-tile-header slot="header">
            <h3 slot="title">Tile ${i + 1}</h3>
          </igc-tile-header>

          <div>
            <p>Content in tile ${i + 1}</p>
          </div>
        </igc-tile>
      `
    );
    return html`<igc-tile-manager>${result}</igc-tile-manager>`;
  }

  describe('Tile resize behavior', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
      firstTile = first(getTiles());
    });

    it('should create a ghost element on resize start', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      expect(DOM.ghostElement).to.be.null;

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(DOM.ghostElement).to.not.be.null;
      expect(eventSpy).calledWith('igcResizeStart');
    });

    it('should update ghost element styles during pointer move', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');
      expect(DOM.ghostElement.getBoundingClientRect()).to.eql(tileRect);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      const state = getResizeEventState(eventSpy);

      expect(eventSpy).calledWith('igcResize');
      expect(state.ghost).to.equal(DOM.ghostElement);
      expect(state.initial).to.eql(tileRect);
      // FIXME: Investigate why the the delta is so great
      assertRectsAreEqual(
        state.current,
        DOM.ghostElement.getBoundingClientRect()
      );
    });

    it('should set the styles on the tile and remove the ghost element on resize end', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      const state = getResizeEventState(eventSpy);
      const currentTileRect = firstTile.getBoundingClientRect();

      expect(eventSpy).calledWith('igcResizeEnd');
      expect(DOM.ghostElement).to.be.null;
      expect(state.initial).to.eql(tileRect);
      assertRectsAreEqual(state.current, currentTileRect);

      expect(currentTileRect.width).greaterThan(tileRect.width);
      expect(currentTileRect.height).greaterThan(tileRect.height);
    });

    it('should cancel resize by pressing ESC key', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      expect(DOM.ghostElement).not.to.be.null;

      simulateKeyboard(DOM.resizeElement, escapeKey);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeCancel');
      expect(DOM.ghostElement).to.be.null;
      assertRectsAreEqual(firstTile.getBoundingClientRect(), tileRect);
    });

    it('should not have resizeElement when `disableResize` is true', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getTileDOM(firstTile);

      expect(DOM.resizeElement).not.to.be.null;

      firstTile.disableResize = true;
      await elementUpdated(firstTile);

      expect(DOM.resizeElement).to.be.null;
    });

    it('should update tile parts on resizing', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      const tileRect = firstTile.getBoundingClientRect();

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');
      expect(firstTile.part.length).to.equal(0);

      simulatePointerMove(DOM.adorners.corner, {
        clientX: tileRect.right * 2,
        clientY: tileRect.bottom * 2,
      });
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');
      expect(firstTile.part.contains('resizing')).to.be.true;
    });

    it('tile should not span more columns than the column count', async () => {
      await setResizeActiveState(firstTile);

      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      tileManager.columnCount = 3;
      await elementUpdated(tileManager);

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(DOM.adorners.corner, {
        clientX: 3000,
      });
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');

      simulateLostPointerCapture(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeEnd');

      const value = asNumber(
        last(getComputedStyle(firstTile).gridColumn.split(' '))
      );
      expect(value).to.equal(tileManager.columnCount);
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
      return resizeContainer.querySelector<HTMLElement>('[data-resize-ghost]')!;
    },
  };
}

async function setResizeActiveState(tile: IgcTileComponent, state = true) {
  const { container, resizeElement } = getResizeContainerDOM(tile);
  state ? simulatePointerEnter(container) : simulatePointerLeave(container);
  await elementUpdated(resizeElement);
}

function getResizeEventState(
  eventSpy: Sinon.SinonSpy<
    [
      type: keyof IgcResizeContainerComponentEventMap,
      eventInitDict?: CustomEventInit<unknown> | undefined,
    ],
    boolean
  >
): ResizeCallbackParams['state'] {
  return eventSpy.lastCall.lastArg.detail.state;
}

function assertRectsAreEqual(a: DOMRect, b: DOMRect, delta = 0.01) {
  const first: Record<string, number> = a.toJSON();
  const second: Record<string, number> = b.toJSON();

  for (const key of Object.keys(first)) {
    expect(first[key]).approximately(second[key], delta);
  }
}
