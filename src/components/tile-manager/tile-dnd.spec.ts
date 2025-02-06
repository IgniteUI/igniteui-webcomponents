import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import {
  simulateDragEnd,
  simulateDragOver,
  simulateDragStart,
  simulateDrop,
} from '../common/utils.spec.js';
import IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

describe.skip('Tile drag and drop', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;

  function getTiles() {
    return Array.from(tileManager.querySelectorAll('igc-tile'));
  }
  // function getTileBaseWrapper(element: IgcTileComponent) {
  //   return element.renderRoot.querySelector<HTMLDivElement>('[part~="base"]')!;
  // }

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
        <igc-tile id="tile${i}" colSpan="5" rowSpan="5">
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

  describe('Tile drag behavior', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    const dragAndDrop = async (draggedTile: Element, dropTarget: Element) => {
      simulateDragStart(draggedTile);
      simulateDragOver(dropTarget);
      simulateDrop(dropTarget);
      simulateDragEnd(draggedTile);
      await elementUpdated(tileManager);
    };

    it("should correctly fire 'dragStart' event", async () => {
      const eventSpy = spy(tileManager, 'emitEvent');

      const tile = first(tileManager.tiles);
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', 'Tile data for drag operation');

      simulateDragStart(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStarted', {
        detail: tile,
      });
    });

    it('should adjust reflected tiles positions in slide mode', async () => {
      const tiles = getTiles();
      const draggedTile = first(tiles);
      const dropTarget = tiles[1];

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

    it('should not change order when dragging a tile onto itself in slide mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      await dragAndDrop(tile, tile);

      expect(getTiles()).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should swap the dragged tile with the drop target in swap mode', async () => {
      const tiles = getTiles();
      const draggedTile = first(tiles);
      const dropTarget = last(tiles);

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

    it('should not change order when dragging a tile onto itself in swap mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      tileManager.dragAction = 'swap';
      await dragAndDrop(tile, tile);

      expect(getTiles()).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should prevent dragging when `disableDrag` is true', async () => {
      const draggedTile = last(tileManager.tiles);
      const dropTarget = first(tileManager.tiles);
      const eventSpy = spy(tileManager, 'emitEvent');
      const tileWrapper = getTileBaseWrapper(draggedTile);

      expect(draggedTile.draggable).to.be.true;
      expect(tileWrapper.getAttribute('part')).to.include('draggable');

      draggedTile.disableDrag = true;
      await elementUpdated(tileManager);

      expect(draggedTile.draggable).to.be.false;
      expect(tileWrapper.getAttribute('part')).to.not.include('draggable');

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.calledWith('igcTileDragStarted');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');
    });

    it('should swap positions only once while dragging smaller tile over bigger tile in slide mode', async () => {
      tileManager.columnCount = 5;
      const draggedTile = first(tileManager.tiles);
      const dropTarget = tileManager.tiles[1];

      draggedTile.rowSpan = 1;
      draggedTile.colSpan = 1;

      dropTarget.rowSpan = 3;
      dropTarget.colSpan = 3;
      await elementUpdated(tileManager);

      const dropTargetRect = dropTarget.getBoundingClientRect();

      simulateDragStart(draggedTile);
      simulateDragOver(dropTarget);
      await elementUpdated(tileManager);

      // Simulate second dragover event (inside dropTarget bounds)
      simulateDragOver(dropTarget, {
        clientX: dropTargetRect.left + dropTargetRect.width / 2,
        clientY: dropTargetRect.top + dropTargetRect.height / 3,
      });
      await elementUpdated(tileManager);

      expect(draggedTile.position).to.equal(1);
      expect(dropTarget.position).to.equal(0);
    });
  });
});
