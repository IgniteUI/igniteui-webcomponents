import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
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
import IgcResizeComponent from './resize-element.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

type ResizeCallbackParams = {
  event: PointerEvent;
  state: {
    initial: DOMRect;
    current: DOMRect;
    dx: number;
    dy: number;
    ghost: HTMLElement | null;
  };
};

describe('Tile resize', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;

  function getTiles() {
    return Array.from(tileManager.querySelectorAll(IgcTileComponent.tagName));
  }

  function getTileDOM(tile: IgcTileComponent) {
    const root = tile.shadowRoot!;

    return {
      get resizeElement() {
        return root.querySelector(IgcResizeComponent.tagName)!;
      },
      get resizeTrigger() {
        return this.resizeElement.renderRoot.querySelector<HTMLElement>(
          '[part="trigger"]'
        )!;
      },
      get resizeGhost() {
        return this.resizeElement.children.length < 2
          ? null
          : (this.resizeElement.children.item(1) as HTMLElement);
      },
    };
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
    });

    it('should create a ghost element on resize start', async () => {
      const tileDOM = getTileDOM(first(getTiles()));
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      expect(tileDOM.resizeGhost).to.be.null;

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(tileDOM.resizeGhost).to.exist;
      expect(eventSpy).calledWith('igcResizeStart');
    });

    it('should update ghost element styles during pointer move', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);
      const tileRect = tile.getBoundingClientRect();
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');
      expect(tileDOM.resizeGhost).to.exist;
      expect(tileRect).to.eql(tileDOM.resizeGhost!.getBoundingClientRect());

      simulatePointerMove(tileDOM.resizeTrigger, {
        clientX: (tileRect.x + tileRect.width) * 2,
        clientY: (tileRect.y + tileRect.height) * 2,
      });
      await elementUpdated(tileDOM.resizeElement);

      const resizeCall = eventSpy.getCall(1);
      expect(resizeCall).to.exist;
      expect(resizeCall.args[0]).to.equal('igcResize');

      const { detail } = resizeCall
        .args[1] as CustomEvent<ResizeCallbackParams>;
      expect(detail).to.not.be.null;
      expect(detail.event).to.be.an.instanceOf(PointerEvent);
      expect(detail.state.initial).to.eql(tile.getBoundingClientRect());
      // FIXME rounding issue here; why?
      //expect(detail.state.current).to.eql(tileDOM.resizeGhost!.getBoundingClientRect());
      expect(detail.state.ghost).to.eql(tileDOM.resizeGhost);
    });

    it('should set the styles on the tile and remove the ghost element on resize end', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);
      const tileRect = tile.getBoundingClientRect();
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(tileDOM.resizeTrigger, {
        clientX: (tileRect.x + tileRect.width) * 2,
        clientY: (tileRect.y + tileRect.height) * 2,
      });
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');

      simulateLostPointerCapture(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      const resizeCall = eventSpy.getCall(2);
      expect(resizeCall).to.exist;
      expect(resizeCall.args[0]).to.equal('igcResizeEnd');

      const { detail } = resizeCall
        .args[1] as CustomEvent<ResizeCallbackParams>;
      expect(detail).to.not.be.null;
      expect(detail.event).to.be.an.instanceOf(PointerEvent);
      expect(detail.state.initial).to.eql(tileRect); // Should the initial be the current of resizeMove i.e. the updated tile?
      // FIXME
      //expect(detail.state.ghost).to.eql(tileDOM.resizeGhost); // Should the detail.state.ghost be null here
      expect(tileDOM.resizeGhost).to.be.null;
      expect(tile.getBoundingClientRect().width).to.be.greaterThan(
        tileRect.width
      );
      expect(tile.getBoundingClientRect().height).to.be.greaterThan(
        tileRect.height
      );
    });

    it('should cancel resize by pressing ESC key', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);
      const tileRect = tile.getBoundingClientRect();
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(tileDOM.resizeTrigger, {
        clientX: (tileRect.x + tileRect.width) * 2,
        clientY: (tileRect.y + tileRect.height) * 2,
      });
      await elementUpdated(tileDOM.resizeElement);

      expect(tileDOM.resizeGhost).not.to.be.null;

      simulateKeyboard(tileDOM.resizeElement, escapeKey);
      await elementUpdated(tileDOM.resizeElement);

      expect(tileDOM.resizeGhost).to.be.null;
      expect(tile.getBoundingClientRect()).to.eql(tileRect);
    });

    it('should not have resizeElement when `disableResize` is true', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);

      expect(tileDOM.resizeElement).to.exist;

      tile.disableResize = true;
      await elementUpdated(tile);

      expect(tileDOM.resizeElement).to.not.exist;
    });

    it('should update tile parts on resizing', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);
      const tileRect = tile.getBoundingClientRect();
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(tile.getAttribute('part')).to.be.null;
      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(tileDOM.resizeTrigger, {
        clientX: (tileRect.x + tileRect.width) * 2,
        clientY: (tileRect.y + tileRect.height) * 2,
      });
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');
      expect(tile.getAttribute('part')).to.include('resizing');
    });

    it('tile should not span more columns than the column count', async () => {
      const tile = first(getTiles());
      const tileDOM = getTileDOM(tile);
      const eventSpy = spy(tileDOM.resizeElement, 'emitEvent');

      tileManager.columnCount = 3;

      simulatePointerDown(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeStart');

      simulatePointerMove(tileDOM.resizeTrigger, {
        clientX: 3000,
      });
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');

      simulateLostPointerCapture(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeEnd');

      expect(
        Number.parseFloat(getComputedStyle(tile).gridColumn.split(' ')[1])
      ).to.equal(tileManager.columnCount);
    });
  });
});
