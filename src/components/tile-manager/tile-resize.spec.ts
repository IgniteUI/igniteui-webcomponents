import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import type Sinon from 'sinon';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import {
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
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
      firstTile = first(getTiles());
      tileManagerStyles = getComputedStyle(
        tileManager.shadowRoot!.querySelector('[part~="base"]')!
      );

      const gap = Number.parseFloat(tileManagerStyles.gap);

      columnSize = Number.parseFloat(first(getColumns())) + gap;
      rowSize = Number.parseFloat(tileManager.minRowHeight!) + gap;
    });

    it('should create a ghost element on resize start', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      expect(DOM.ghostElement).to.be.null;

      simulatePointerDown(DOM.adorners.corner);
      await elementUpdated(DOM.resizeElement);

      expect(DOM.ghostElement).to.not.be.null;
      expect(eventSpy).calledWith('igcResizeStart');
    });

    it('should update ghost element styles during pointer move', async () => {
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

    it('Should correctly resize column with auto grid', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      expect(eventSpy).calledWith('igcResizeStart');
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 2,
      });

      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');

      simulateLostPointerCapture(DOM.adorners.side);
      await elementUpdated(DOM.resizeElement);
      await nextFrame();

      expect(eventSpy).calledWith('igcResizeEnd');
      expect(DOM.ghostElement).to.be.null;

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 2');
    });

    it('Should correctly create/remove implicit rows and resize row with auto grid', async () => {
      const DOM = getResizeContainerDOM(firstTile);

      simulatePointerDown(DOM.adorners.side);
      await elementUpdated(DOM.container);

      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 1');
      expect(getColumns().length).to.eql(4);
      expect(getRows().length).to.eql(1);

      simulatePointerMove(DOM.adorners.side, {
        clientX: columnSize * 3,
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

    // REVIEW
    it('Should initialize tile span as columnCount if it is greater than columnCount', async () => {
      tileManager.columnCount = 10;
      await elementUpdated(tileManager);

      firstTile.colSpan = 15;
      await elementUpdated(firstTile);

      // REVIEW once we decide how to handle the scenario where colSpan is greater than column count
      // currently 0px columns are added to cover the difference
      expect(getColumns().length).to.eql(15);
      expect(getComputedStyle(firstTile).gridColumn).to.eql('auto / span 15');
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

      expect(getComputedStyle(firstTile).gridRow).to.eql('2 / span 2');
    });

    it('should cancel resize by pressing ESC key', async () => {
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
      const DOM = getTileDOM(firstTile);

      expect(DOM.resizeElement).not.to.be.null;

      firstTile.disableResize = true;
      await elementUpdated(firstTile);

      expect(DOM.resizeElement).to.be.null;
    });

    it('should update tile parts on resizing', async () => {
      const DOM = getResizeContainerDOM(firstTile);
      const eventSpy = spy(DOM.resizeElement, 'emitEvent');

      expect(firstTile.part.length).to.equal(0);

      simulatePointerDown(DOM.adorners.bottom);
      await elementUpdated(DOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');
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
      return resizeContainer.querySelector<HTMLElement>('[data-resize-ghost]')!;
    },
  };
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
