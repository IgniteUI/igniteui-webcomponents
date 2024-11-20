import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import {
  simulateDragEnd,
  simulateDragStart,
  simulateDrop,
} from '../common/utils.spec.js';
import IgcTileManagerComponent from './tile-manager.js';
import type IgcTileComponent from './tile.js';

describe('Tile drag and drop', () => {
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
      const dropTarget = tiles[2];

      expect(tileManager.dragMode).to.equal('slide');
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(`tile${index}`);
      });
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(2);

      await dragAndDrop(draggedTile, dropTarget);

      const expectedIdsAfterDrag = [
        'tile1',
        'tile2',
        'tile0',
        'tile3',
        'tile4',
      ];
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.id).to.equal(expectedIdsAfterDrag[index]);
      });
      expect(draggedTile.position).to.equal(2);
      expect(dropTarget.position).to.equal(1);
    });

    it('should not change order when dragging a tile onto itself in slide mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
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

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');
      expect(draggedTile.position).to.equal(0);
      expect(dropTarget.position).to.equal(4);

      tileManager.dragMode = 'swap';
      await dragAndDrop(draggedTile, dropTarget);

      expect(tileManager.tiles[0].id).to.equal('tile4');
      expect(tileManager.tiles[4].id).to.equal('tile0');
      expect(draggedTile.position).to.equal(4);
      expect(dropTarget.position).to.equal(0);
    });

    it('should not change order when dragging a tile onto itself in swap mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      tileManager.dragMode = 'swap';
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

      expect(tileWrapper.getAttribute('part')).to.include('draggable');

      draggedTile.disableDrag = true;
      await elementUpdated(tileManager);

      expect(tileWrapper.getAttribute('part')).to.not.include('draggable');

      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.calledWith('igcTileDragStarted');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');
    });
  });
});