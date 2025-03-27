import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { restore, spy, stub } from 'sinon';

import { range } from 'lit/directives/range.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { getCenterPoint } from '../common/util.js';
import {
  simulateClick,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import type { TileManagerDragMode } from '../types.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

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

  function getTileContentContainer(element: IgcTileComponent) {
    return element.renderRoot.querySelector<HTMLDivElement>(
      '[part="content-container"]'
    )!;
  }

  function getActionButtons(tile: IgcTileComponent) {
    return Array.from(
      tile.renderRoot
        .querySelector('[part="header"]')
        ?.querySelectorAll(IgcIconButtonComponent.tagName) ?? []
    );
  }

  type DragOverOptions = {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };

  /**
   * Simulates drag over behavior for the given tile by firing two pointermove events
   * inside the tile's bounding box.
   */
  function simulateTileDragOver(
    tile: IgcTileComponent,
    options?: Partial<DragOverOptions>
  ) {
    const opts = Object.assign({ x: 0, y: 0, dx: 1, dy: 1 }, options);

    simulatePointerMove(
      tile,
      { clientX: opts.x, clientY: opts.y },
      { x: opts.dx, y: opts.dy },
      3
    );
  }

  async function dragAndDrop(tile: IgcTileComponent, target: IgcTileComponent) {
    const { x, y } = getCenterPoint(target);

    simulatePointerDown(tile);
    simulateTileDragOver(tile, { x, y });

    await viewTransitionComplete();

    simulateLostPointerCapture(tile);
    await elementUpdated(tileManager);
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
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      const eventSpy = spy(draggedTile, 'emitEvent');

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });

    it('should add draggable part to the tile', async () => {
      const tile = Array.from(
        tileManager.querySelectorAll(IgcTileComponent.tagName)
      )[0];
      const getTileSlot = () =>
        tile.shadowRoot!.querySelector('div[part~="draggable"]');

      tileManager.dragMode = 'tile';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;

      tileManager.dragMode = 'none';
      await elementUpdated(tileManager);

      expect(getTileSlot()).to.be.null;

      tileManager.dragMode = 'tile-header';
      await elementUpdated(tileManager);

      expect(getTileSlot()).not.to.be.null;
    });
  });

  describe('Tile drag', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManager('tile')
      );
    });

    it('should correctly fire `igcTileDragStart` event', async () => {
      const tile = getTile(0);
      const eventSpy = spy(tile, 'emitEvent');

      simulatePointerDown(tile);
      await elementUpdated(tile);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStart', {
        detail: tile,
        cancelable: true,
      });
    });

    it('should stop drag operation when `igcTileDragStart` is prevented', async () => {
      const [tile, target] = [getTile(0), getTile(4)];
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileDragStart', (event) => {
        event.preventDefault();
      });

      await dragAndDrop(tile, target);

      expect(eventSpy).calledOnceWith('igcTileDragStart');
      expect(eventSpy).not.calledWith('igcTileDragEnd');
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should correctly fire `igcTileDragEnd` event', async () => {
      const [tile, target] = [getTile(0), getTile(4)];
      const eventSpy = spy(tile, 'emitEvent');

      await dragAndDrop(tile, target);

      expect(eventSpy).calledTwice;
      expect(eventSpy).calledWith('igcTileDragEnd', {
        detail: tile,
      });
    });

    it('should cancel dragging with Escape', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(4);
      const eventSpy = spy(draggedTile, 'emitEvent');
      const { x, y } = getCenterPoint(dropTarget);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);

      simulatePointerDown(draggedTile);
      simulateTileDragOver(draggedTile, { x, y });

      await viewTransitionComplete();
      expect(draggedTile.position).to.equal(4);
      expect(dropTarget.position).to.equal(0);

      simulateKeyboard(tileManager, escapeKey);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileDragCancel');

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);
    });

    it('should adjust reflected tiles positions', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

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

    it('should not change order when dragging a tile onto itself', async () => {
      const initialTiles = tileManager.tiles;
      const tile = getTile(0);

      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should swap positions only once while dragging smaller tile over bigger tile', async () => {
      tileManager.columnCount = 5;
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.rowSpan = 1;
      draggedTile.colSpan = 1;

      dropTarget.rowSpan = 3;
      dropTarget.colSpan = 3;
      await elementUpdated(tileManager);

      const { x, y } = getCenterPoint(dropTarget);

      simulatePointerDown(draggedTile);
      simulateTileDragOver(draggedTile, { x, y });
      await viewTransitionComplete();

      // Simulate second dragover event (inside dropTarget bounds)
      simulateTileDragOver(draggedTile, { x: x + 5, y: y + 5 });

      await viewTransitionComplete();

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);

      simulateLostPointerCapture(draggedTile);
      await elementUpdated(draggedTile);
    });

    it('should swap positions properly in RTL mode', async () => {
      tileManager.dir = 'rtl';
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      await elementUpdated(tileManager);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });

    it('should swap positions properly when row, column and span are specified', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.colSpan = 2;
      draggedTile.rowSpan = 2;
      draggedTile.colStart = 3;
      draggedTile.rowStart = 3;

      await elementUpdated(tileManager);

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
      expect(draggedTile.colSpan).to.equal(2);
      expect(draggedTile.rowSpan).to.equal(2);
      expect(draggedTile.colStart).to.be.null;
      expect(draggedTile.rowStart).to.be.null;
      expect(dropTarget.position).to.equal(0);
      expect(dropTarget.colSpan).to.equal(1);
      expect(dropTarget.rowSpan).to.equal(1);
    });

    it('should adjust positions properly when both tiles have columns and rows specified', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);

      draggedTile.colStart = 2;
      draggedTile.rowStart = 2;

      dropTarget.colStart = 3;
      dropTarget.rowStart = 3;

      await elementUpdated(tileManager);

      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);

      await dragAndDrop(draggedTile, dropTarget);

      expect(draggedTile.position).to.equal(1);
      expect(draggedTile.colStart).to.equal(3);
      expect(draggedTile.rowStart).to.equal(3);

      expect(dropTarget.position).to.equal(0);
      expect(dropTarget.colStart).to.equal(2);
      expect(dropTarget.rowStart).to.equal(3);
    });
  });

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
      const header = tile.renderRoot.querySelector('[part="header"]')!;
      const { x, y } = getCenterPoint(target);

      simulatePointerDown(header);
      simulateTileDragOver(tile, { x, y });

      await viewTransitionComplete();

      simulateLostPointerCapture(tile);
      await elementUpdated(tileManager);
    }

    it('should rearrange tiles when the tile is dropped', async () => {
      const draggedTile = getTile(3);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

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
      const eventSpy = spy(draggedTile, 'emitEvent');

      const contentContainer = getTileContentContainer(draggedTile);
      const { x, y } = getCenterPoint(dropTarget);

      simulatePointerDown(contentContainer);

      simulateTileDragOver(draggedTile, { x, y });
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

    function createSlottedActionTile() {
      const tile = document.createElement(IgcTileComponent.tagName);
      const button = document.createElement('button');

      button.slot = 'actions';
      button.textContent = 'Custom action';
      tile.append(button);

      return { tile, button };
    }

    it('should disable drag and drop when tile is maximized', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

      draggedTile.maximized = true;
      await elementUpdated(tileManager);

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.called;
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(1);
    });

    it('should disable drag and drop when tile is in fullscreen mode', async () => {
      const draggedTile = getTile(0);
      const dropTarget = getTile(1);
      const eventSpy = spy(draggedTile, 'emitEvent');

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

      expect(eventSpy).not.calledWith('igcTileDragStart');
      expect(eventSpy).not.calledWith('igcTileDragEnd');

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

    it('should not start a drag operation when interacting with the default tile actions in `tile-header` drag mode', async () => {
      tileManager.dragMode = 'tile-header';
      const tile = getTile(0);
      const [maximize, _] = getActionButtons(tile);
      const eventSpy = spy(tile, 'emitEvent');

      maximize.click();
      await elementUpdated(tile);

      expect(tile.maximized).to.be.true;
      expect(eventSpy).not.calledWith('igcTileDragStart');

      maximize.click();
      await elementUpdated(tile);

      expect(tile.maximized).to.be.false;
    });

    it('should not start a drag operation when interacting with the default tile actions in `tile` drag mode', async () => {
      tileManager.dragMode = 'tile';
      const tile = getTile(0);
      const [maximize, _] = getActionButtons(tile);
      const eventSpy = spy(tile, 'emitEvent');

      maximize.click();
      await elementUpdated(tile);

      expect(tile.maximized).to.be.true;
      expect(eventSpy).not.calledWith('igcTileDragStart');

      maximize.click();
      await elementUpdated(tile);

      expect(tile.maximized).to.be.false;
    });

    it('should not start a drag operation when interacting with the slotted tile actions in `tile-header` drag mode', async () => {
      const { tile, button } = createSlottedActionTile();
      const eventSpy = spy(tile, 'emitEvent');

      tileManager.dragMode = 'tile-header';
      tileManager.append(tile);
      await elementUpdated(tileManager);

      button.click();
      await elementUpdated(tile);

      expect(eventSpy).not.calledWith('igcTileDragStart');
    });

    it('should not start a drag operation when interacting with the slotted tile actions in `tile` drag mode', async () => {
      const { tile, button } = createSlottedActionTile();
      const eventSpy = spy(tile, 'emitEvent');

      tileManager.dragMode = 'tile';
      tileManager.append(tile);
      await elementUpdated(tileManager);

      button.click();
      await elementUpdated(tile);

      expect(eventSpy).not.calledWith('igcTileDragStart');
    });
  });
});
