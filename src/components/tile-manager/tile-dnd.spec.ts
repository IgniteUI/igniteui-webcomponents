import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { restore, spy, stub } from 'sinon';

import { range } from 'lit/directives/range.js';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  simulateClick,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import type { TileManagerDragMode } from '../types.js';
import IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

describe('Tile drag and drop', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;

  /** Wait tile dragging view transition(s) to complete. */
  async function viewTransitionComplete() {
    await nextFrame();
    await nextFrame();
  }

  function getTile(index: number): IgcTileComponent {
    return tileManager.tiles[index];
  }

  async function dragAndDrop(tile: IgcTileComponent, target: IgcTileComponent) {
    const { top, left, width, height } = target.getBoundingClientRect();

    simulatePointerDown(tile);
    simulatePointerMove(tile, {
      clientX: left + width * 0.5,
      clientY: top + height * 0.5,
    });

    await viewTransitionComplete();

    simulateLostPointerCapture(tile);
    await elementUpdated(tileManager);
  }

  function getTileContentContainer(element: IgcTileComponent) {
    return element.renderRoot.querySelector<HTMLDivElement>(
      '[part="content-container"]'
    )!;
  }

  function createTileManager(mode: TileManagerDragMode = 'none') {
    const result = Array.from(range(5)).map(
      (i) => html`
        <igc-tile id="tile${i}">
          <h3 slot="title">Tile ${i + 1}</h3>

          <div>
            <p>Content in tile ${i + 1}</p>
          </div>
        </igc-tile>
      `
    );
    return html`
      <igc-tile-manager .dragMode=${mode}>${result}</igc-tile-manager>
    `;
  }

  describe('Default', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should not allow dragging tiles', async () => {
      const eventSpy = spy(tileManager, 'emitEvent');

      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });
  });

  describe('Tile drag', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile')
      );
    });

    it('should correctly fire `igcTileDragStarted` event', async () => {
      const eventSpy = spy(tileManager, 'emitEvent');

      const tile = getTile(0);

      simulatePointerDown(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStarted', {
        detail: tile,
      });
    });

    it('should correctly fire `igcTileDragEnded` event', async () => {
      const eventSpy = spy(tileManager, 'emitEvent');

      const [tile, target] = [getTile(0), getTile(4)];

      await dragAndDrop(tile, target);

      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWith('igcTileDragEnded', {
        detail: tile,
      });
    });

    // REVIEW when the logic is implemented
    it('should cancel dragging with Escape', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(4);
      const dropTargetRect = dropTarget.getBoundingClientRect();

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);

      simulatePointerDown(draggedTile);
      simulatePointerMove(draggedTile, {
        clientX: dropTargetRect.left + dropTargetRect.width * 0.5,
        clientY: dropTargetRect.top + dropTargetRect.height * 0.5,
      });

      await viewTransitionComplete();
      expect(draggedTile.position).to.equal(4);
      expect(dropTarget.position).to.equal(0);

      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);
    });

    it('should adjust reflected tiles positions when using slide action', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      expect(tileManager.dragAction).to.equal('slide');
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(`tile${index}`);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile1',
        'tile0',
        'tile2',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });

    it('should not change order when dragging a tile onto itself when using slide action', async () => {
      const initialTiles = tileManager.tiles;
      const tile = getTile(0);

      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should swap the dragged tile with the drop target when using swap action', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(4);

      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);

      tileManager.dragAction = 'swap';
      await dragAndDrop(draggedTile, dropTarget);

      expect(tileManager.tiles[0].id).to.equal('tile4');
      expect(tileManager.tiles[4].id).to.equal('tile0');
      expect(draggedTile.position).to.equal(4);
      expect(dropTarget.position).to.equal(0);
    });

    it('should not change order when dragging a tile onto itself when using swap action', async () => {
      const initialTiles = tileManager.tiles;
      const tile = getTile(0);

      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      tileManager.dragAction = 'swap';
      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    // REVIEW
    it('should swap positions only once while dragging smaller tile over bigger tile when using slide action', async () => {
      tileManager.columnCount = 5;
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const dropTargetRect = dropTarget.getBoundingClientRect();

      draggedTile.rowSpan = 1;
      draggedTile.colSpan = 1;

      dropTarget.rowSpan = 3;
      dropTarget.colSpan = 3;
      await elementUpdated(tileManager);

      simulatePointerDown(draggedTile);
      simulatePointerMove(draggedTile, {
        clientX: dropTargetRect.left + dropTargetRect.width * 0.5,
        clientY: dropTargetRect.top + dropTargetRect.height * 0.5,
      });
      await viewTransitionComplete();

      // Simulate second dragover event (inside dropTarget bounds)
      simulatePointerMove(draggedTile, {
        clientX: dropTargetRect.left + dropTargetRect.width * 0.5 + 5,
        clientY: dropTargetRect.top + dropTargetRect.height * 0.5 + 5,
      });
      await viewTransitionComplete();

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });
  });

  // REVIEW after tile header is finalized
  describe('Tile header drag', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile-header')
      );
    });

    async function dragAndDropFromHeader(
      tile: IgcTileComponent,
      target: IgcTileComponent
    ) {
      const header = tile.renderRoot.querySelector('[part="title"]')!;
      const { top, left, width, height } = target.getBoundingClientRect();

      simulatePointerDown(header);
      simulatePointerMove(tile, {
        clientX: left + width * 0.5,
        clientY: top + height * 0.5,
      });

      await viewTransitionComplete();

      simulateLostPointerCapture(tile);
      await elementUpdated(tileManager);
    }

    it('should rearrange tiles when the tile is dropped', async () => {
      const draggedTile = getTile(3);
      const dropTarget = getTile(1);
      const eventSpy = spy(tileManager, 'emitEvent');

      await dragAndDropFromHeader(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile0',
        'tile3',
        'tile2',
        'tile1',
        'tile4',
      ];

      expect(eventSpy).calledTwice;
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(3);
    });

    it('should not start dragging if pointer is not over the header', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(tileManager, 'emitEvent');

      const contentContainer = getTileContentContainer(draggedTile);
      const dropTargetRect = dropTarget.getBoundingClientRect();

      simulatePointerDown(contentContainer);

      simulatePointerMove(draggedTile, {
        clientX: dropTargetRect.left + dropTargetRect.width * 0.5,
        clientY: dropTargetRect.top + dropTargetRect.height * 0.5,
      });
      await viewTransitionComplete();

      simulateLostPointerCapture(draggedTile);
      await elementUpdated(tileManager);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });
  });

  describe('Special scenarios', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile')
      );
    });

    it('should disable drag and drop when tile is maximized', async () => {
      const eventSpy = spy(tileManager, 'emitEvent');
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.maximized = true;
      await elementUpdated(tileManager);

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });

    it('should disable drag and drop when tile is in fullscreen mode', async () => {
      const eventSpy = spy(tileManager, 'emitEvent');
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      const buttonFullscreen = draggedTile.renderRoot.querySelector(
        '[name="fullscreen"]'
      )!;

      draggedTile.requestFullscreen = stub().callsFake(() => {
        Object.defineProperty(document, 'fullscreenElement', {
          value: draggedTile,
          configurable: true,
        });
        return Promise.resolve();
      });

      simulateClick(buttonFullscreen);
      await elementUpdated(tileManager);

      expect(draggedTile.fullscreen).to.be.true;

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;

      const expectedIdsAfterDrag = [
        'tile0',
        'tile1',
        'tile2',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
      });

      restore();
    });
  });
});
