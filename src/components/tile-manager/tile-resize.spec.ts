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

  function getTileBaseWrapper(element: IgcTileComponent) {
    const resizeElement = element.renderRoot.querySelector('igc-resize');

    if (resizeElement) {
      return resizeElement.querySelector<HTMLDivElement>('[part~="base"]')!;
    }

    return element.renderRoot.querySelector<HTMLDivElement>('[part~="base"]')!;
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

  // TODO: Review and modify the tests to correspond to the new resize logic
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

    it('should update ghost element styles during pointer move - columns', async () => {
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
      });
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResize');
      // FIXME: Check event arguments, ghost dimensions etc.

      simulateLostPointerCapture(tileDOM.resizeTrigger);
      await elementUpdated(tileDOM.resizeElement);

      expect(eventSpy).calledWith('igcResizeEnd');
    });

    xit('should set the styles on the tile and remove the ghost element on resize end', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      const { x, y, width, height } = tile.getBoundingClientRect();
      const resizeHandle = tile.shadowRoot!.querySelector('.resize-handle');

      simulatePointerDown(resizeHandle!);
      await elementUpdated(resizeHandle!);

      simulatePointerMove(resizeHandle!, {
        clientX: x + width * 2,
        clientY: y + height * 2,
      });
      await elementUpdated(resizeHandle!);

      let ghostElement = tileManager.querySelector('#resize-ghost');
      const ghostGridColumn = (ghostElement! as HTMLElement).style.gridColumn;
      const ghostGridRow = (ghostElement! as HTMLElement).style.gridRow;

      simulateLostPointerCapture(resizeHandle!);
      await elementUpdated(resizeHandle!);

      expect(eventSpy).calledWith('igcResizeEnd', {
        detail: tile,
        cancelable: true,
      });

      ghostElement = tileManager.querySelector('#resize-ghost');
      expect(tile.style.gridColumn).to.equal(ghostGridColumn);
      expect(tile.style.gridRow).to.equal(ghostGridRow);
      expect(ghostElement).to.be.null;
    });

    it.skip('should cancel resize by pressing ESC key', async () => {
      const tile = first(tileManager.tiles);
      const { x, y, width, height } = tile.getBoundingClientRect();
      const resizeHandle = tile.shadowRoot!.querySelector('.resize-handle')!;

      simulatePointerDown(resizeHandle);
      await elementUpdated(resizeHandle);

      simulatePointerMove(resizeHandle!, {
        clientX: x + width * 2,
        clientY: y + height * 2,
      });
      await elementUpdated(resizeHandle);

      let ghostElement = tileManager.querySelector('#resize-ghost');
      expect(ghostElement).not.to.be.null;

      simulateKeyboard(resizeHandle, escapeKey);
      await elementUpdated(resizeHandle);

      ghostElement = tileManager.querySelector('#resize-ghost');
      expect(ghostElement).to.be.null;
      expect(tile.style.gridColumn).to.equal('');
      expect(tile.style.gridRow).to.equal('');
    });

    xit('should not resize when `disableResize` is true', async () => {
      const tile = first(tileManager.tiles);
      const { x, y, width, height } = tile.getBoundingClientRect();
      const resizeHandle = tile.shadowRoot!.querySelector(
        '.resize-handle'
      )! as HTMLElement;
      const eventSpy = spy(tile, 'emitEvent');
      const tileWrapper = getTileBaseWrapper(tile);

      expect(tileWrapper.getAttribute('part')).to.include('resizable');
      expect(resizeHandle.hasAttribute('hidden')).to.be.false;

      tile.disableResize = true;
      await elementUpdated(tile);

      expect(tileWrapper.getAttribute('part')).to.not.include('resizable');
      expect(resizeHandle.hasAttribute('hidden')).to.be.true;

      simulatePointerDown(resizeHandle);
      await elementUpdated(resizeHandle);

      expect(eventSpy).not.calledWith('igcResizeStart');

      simulatePointerMove(resizeHandle!, {
        clientX: x + width * 2,
        clientY: y + height * 2,
      });
      await elementUpdated(tile);

      expect(eventSpy).not.calledWith('igcResizeMove');

      const ghostElement = tileManager.querySelector('#resize-ghost');
      expect(ghostElement).to.be.null;

      simulateLostPointerCapture(resizeHandle!);
      await elementUpdated(resizeHandle!);

      expect(eventSpy).not.calledWith('igcResizeEnd');
    });
  });
});
