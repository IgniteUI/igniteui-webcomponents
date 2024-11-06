import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { escapeKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import {
  simulateDoubleClick,
  simulateDragEnd,
  simulateDragStart,
  simulateDrop,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcTileHeaderComponent from './tile-header.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

describe('Tile Manager component', () => {
  before(() => {
    defineComponents(IgcTileManagerComponent);
  });

  let tileManager: IgcTileManagerComponent;

  function getTileManagerBase() {
    return tileManager.renderRoot.querySelector<HTMLElement>('[part="base"]')!;
  }

  // function assertTileIsInert(element: IgcTileComponent) {
  //   expect(element.renderRoot.querySelector<HTMLElement>('#base')!.inert).to.be
  //     .true;
  // }

  describe('Initialization', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile tile-id="customId-1">
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile tile-id="customId-2">
            <igc-tile-header>
              <span>Tile Header 2</span>
            </igc-tile-header>
            <p>Content 2</p>
          </igc-tile>
        </igc-tile-manager>
      `);
    });

    // TODO: fails because of the POC styles
    // it('passes the a11y audit', async () => {
    //   await expect(tileManager).dom.to.be.accessible();
    //   await expect(tileManager).shadowDom.to.be.accessible();
    // });

    it('is correctly initialized with its default component state', () => {
      // TODO: Add checks for other settings when implemented
      expect(tileManager.columnCount).to.equal(0);
      expect(tileManager.rowCount).to.equal(0);
      expect(tileManager.dragMode).to.equal('slide');
    });

    it('should render properly', () => {
      expect(tileManager).dom.to.equal(
        `<igc-tile-manager>
          <igc-tile
            draggable="true"
            style="grid-area: span 3 / span 3;"
            tile-id="customId-1"
          >
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile
            draggable="true"
            style="grid-area: span 3 / span 3;"
            tile-id="customId-2"
          >
            <igc-tile-header>
              <span>Tile Header 2</span>
            </igc-tile-header>
            <p>Content 2</p>
          </igc-tile>
        </igc-tile-manager>`
      );

      expect(tileManager).shadowDom.to.equal(
        `<div
          part="base"
          style="grid-template-columns: repeat(auto-fit, minmax(20px, 1fr)); grid-template-rows: repeat(auto-fit, minmax(20px, 1fr));"
        >
          <slot></slot>
        </div>`
      );
    });

    it('should slot user provided content in the tile', () => {
      const tiles = Array.from(
        tileManager.querySelectorAll(IgcTileComponent.tagName)
      );

      expect(tiles[0]).dom.to.equal(
        `<igc-tile draggable="true" style="grid-area: span 3 / span 3;" tile-id="customId-1">
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>`
      );

      expect(tiles[0]).shadowDom.to.equal(
        `<div
          id="base"
          part=""
        >
          <div part="header">
            <slot name="header"></slot>
          </div>
          <div part="content-container">
            <slot></slot>
          </div>
          <div
            class="resize-handle"
            tabindex="-1"
          >
          </div>
        </div>`
      );
    });

    it('should slot user provided content for tile header', () => {
      // TODO: Add tests for the title and actions slots
      const tileHeaders = Array.from(
        tileManager.querySelectorAll(IgcTileHeaderComponent.tagName)
      );

      expect(tileHeaders[0]).dom.to.equal(
        `<igc-tile-header>
          <span>Tile Header 1</span>
        </igc-tile-header>`
      );

      expect(tileHeaders[0]).shadowDom.to.equal(
        `<section>
          <header part="header">
            <slot part="title" name="title"></slot>
            <slot part="actions" name="actions"></slot>
          </header>
          <slot></slot>
        </section>`
      );
    });
  });

  describe('Column spans', async () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should render tile manager with correct number of children', async () => {
      expect(tileManager.tiles).lengthOf(5);
    });

    it('each tile should have correct grid area (col and row span)', async () => {
      expect(
        tileManager.tiles.every(
          ({ style: { gridColumn, gridRow } }) =>
            gridColumn === 'span 5' && gridRow === 'span 5'
        )
      ).to.be.true;
    });

    it("should check tile manager's row and column template style props", async () => {
      let style = getTileManagerBase().style;

      expect(style.gridTemplateColumns).to.equal(
        'repeat(auto-fit, minmax(20px, 1fr))'
      );
      expect(style.gridTemplateRows).to.equal(
        'repeat(auto-fit, minmax(20px, 1fr))'
      );

      tileManager.columnCount = 15;
      tileManager.rowCount = 15;

      await elementUpdated(tileManager);

      style = getTileManagerBase().style;

      expect(style.gridTemplateColumns).to.equal('repeat(15, auto)');
      expect(style.gridTemplateRows).to.equal('repeat(15, auto)');
    });

    it('should respect tile row and col start properties', async () => {
      const tile = tileManager.tiles[2];

      tile.colStart = 7;
      tile.rowStart = 5;

      await elementUpdated(tile);

      expect(tile.style.gridArea).to.equal('5 / 7 / span 5 / span 5');
    });
  });

  describe('Manual slot assignment', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile id="tile1"></igc-tile>
          <div></div>
          <igc-tile id="tile2"></igc-tile>
        </igc-tile-manager>
      `);
    });

    it('should only accept `igc-tile` elements', async () => {
      const slot = tileManager.renderRoot.querySelector('slot')!;
      expect(slot.assignedElements()).eql(tileManager.tiles);
    });

    it('should initialize with the correct tiles in the tiles collection and light DOM', async () => {
      expect(tileManager.tiles.length).to.equal(2);
      expect(tileManager.tiles[0].id).to.equal('tile1');
      expect(tileManager.tiles[1].id).to.equal('tile2');

      const lightDomTiles = Array.from(
        tileManager.querySelectorAll('igc-tile')
      );
      expect(lightDomTiles.length).to.equal(2);
      expect(lightDomTiles[0].id).to.equal('tile1');
      expect(lightDomTiles[1].id).to.equal('tile2');
    });

    it('should update the light DOM when a tile is added to the tiles collection', async () => {
      // Fix the test logic as the tiles in only a getter now
      // const newTile = document.createElement('igc-tile') as IgcTileComponent;
      // newTile.id = 'tile3';
      // tileManager.tiles = [...tileManager.tiles, newTile];
      // await elementUpdated(tileManager);
      // const lightDomTiles = Array.from(
      //   tileManager.querySelectorAll('igc-tile')
      // );
      // expect(lightDomTiles.length).to.equal(3);
      // expect(lightDomTiles[2].id).to.equal('tile3');
    });

    it('should update the light DOM when a tile is removed from the tiles collection', async () => {
      // Fix the test logic as the tiles in only a getter now
      // tileManager.tiles = tileManager.tiles.slice(1);
      // await elementUpdated(tileManager);
      // const lightDomTiles = Array.from(
      //   tileManager.querySelectorAll('igc-tile')
      // );
      // expect(lightDomTiles.length).to.equal(1);
      // expect(lightDomTiles[0].id).to.equal('tile2');
    });

    it('should update the tiles collection when a tile is added to the light DOM', async () => {
      const newTile = document.createElement('igc-tile') as IgcTileComponent;
      newTile.id = 'tile3';

      tileManager.appendChild(newTile);
      await elementUpdated(tileManager);

      expect(tileManager.tiles.length).to.equal(3);
      expect(tileManager.tiles[2].id).to.equal('tile3');
    });

    it('should update the tiles collection when a tile is removed from the light DOM', async () => {
      const tileToRemove = tileManager.querySelector(
        '#tile1'
      ) as IgcTileComponent;

      tileManager.removeChild(tileToRemove);
      await elementUpdated(tileManager);

      expect(tileManager.tiles.length).to.equal(1);
      expect(tileManager.tiles[0].id).to.equal('tile2');
    });

    it('should update the slot when tile is added to the tiles collection', async () => {
      // Fix the test logic as the tiles in only a getter now
      // const slot = tileManager.renderRoot.querySelector('slot')!;
      // const newTile = document.createElement('igc-tile');
      // newTile.id = 'tile3';
      // tileManager.tiles = [...tileManager.tiles, newTile];
      // await tileManager.updateComplete;
      // expect(tileManager.tiles.length).to.equal(3);
      // expect(tileManager.tiles[2].id).to.equal('tile3');
      // expect(slot.assignedElements()).eql(tileManager.tiles);
    });

    it('should update the slot when a tile is removed from tiles collection', async () => {
      // Fix the test logic as the tiles in only a getter now
      // const slot = tileManager.renderRoot.querySelector('slot')!;
      // expect(tileManager.tiles.length).to.equal(2);
      // tileManager.tiles = tileManager.tiles.filter(
      //   (tile) => tile.id !== 'tile1'
      // );
      // await tileManager.updateComplete;
      // expect(tileManager.tiles.length).to.equal(1);
      // expect(tileManager.tiles[0].id).to.equal('tile2');
      // expect(slot.assignedElements()).eql(tileManager.tiles);
    });
  });

  describe('Tile resize behavior', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should create a ghost element on resize start', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      const resizeHandle = tile.shadowRoot?.querySelector('.resize-handle');

      simulatePointerDown(resizeHandle!);
      await elementUpdated(resizeHandle!);

      const ghostElement = tileManager.querySelector('#resize-ghost');
      expect(ghostElement).to.not.be.null;
      expect(tile.closest('igc-tile-manager')!.contains(ghostElement!)).to.be
        .true;
      expect(eventSpy).calledWith('igcResizeStart', {
        detail: tile,
        cancelable: true,
      });
    });

    it('should update ghost element styles during pointer move', async () => {
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

      expect(eventSpy.getCall(0)).calledWith('igcResizeStart', {
        detail: tile,
        cancelable: true,
      });

      expect(eventSpy.getCall(1)).calledWith('igcResizeMove', {
        detail: tile,
        cancelable: true,
      });

      const ghostElement = tileManager.querySelector(
        '#resize-ghost'
      ) as HTMLElement;
      expect(ghostElement.style.gridColumn).to.equal('span 9');
      expect(ghostElement.style.gridRow).to.equal('span 9');
    });

    it('should set the styles on the tile and remove the ghost element on resize end', async () => {
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

    it('should cancel resize by pressing ESC key', async () => {
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
      expect(tile.style.gridColumn).to.equal('span 5');
      expect(tile.style.gridRow).to.equal('span 5');
    });

    it('should not resize when `disableResize` is true', async () => {
      const tile = first(tileManager.tiles);
      const { x, y, width, height } = tile.getBoundingClientRect();
      const resizeHandle = tile.shadowRoot!.querySelector('.resize-handle')!;
      const eventSpy = spy(tile, 'emitEvent');

      tile.disableResize = true;
      await elementUpdated(tile);

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
      simulateDragStart(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStarted', {
        detail: tile,
      });
    });

    it('should move the dragged tile before the drop target in slide mode', async () => {
      const draggedTile = first(tileManager.tiles);
      const dropTarget = last(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[3].id).to.equal('tile3');

      await dragAndDrop(draggedTile, dropTarget);

      expect(tileManager.tiles[0].id).to.equal('tile1');
      expect(tileManager.tiles[3].id).to.equal('tile0');
    });

    it('should not change order when dragging a tile onto itself in slide mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should swap the dragged tile with the drop target in swap mode', async () => {
      const draggedTile = first(tileManager.tiles);
      const dropTarget = last(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');

      tileManager.dragMode = 'swap';
      await dragAndDrop(draggedTile, dropTarget);

      expect(tileManager.tiles[0].id).to.equal('tile4');
      expect(tileManager.tiles[4].id).to.equal('tile0');
    });

    it('should not change order when dragging a tile onto itself in swap mode', async () => {
      const initialTiles = tileManager.tiles;
      const tile = first(tileManager.tiles);

      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');

      tileManager.dragMode = 'swap';
      await dragAndDrop(tile, tile);

      expect(tileManager.tiles).eql(initialTiles);
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[1].id).to.equal('tile1');
    });

    it('should prevent dragging when `disableDrag` is true', async () => {
      const draggedTile = last(tileManager.tiles);
      const dropTarget = first(tileManager.tiles);
      const eventSpy = spy(tileManager, 'emitEvent');

      draggedTile.disableDrag = true;
      await elementUpdated(tileManager);
      await dragAndDrop(draggedTile, dropTarget);

      expect(eventSpy).not.calledWith('igcTileDragStarted');
      expect(tileManager.tiles[0].id).to.equal('tile0');
      expect(tileManager.tiles[4].id).to.equal('tile4');
    });
  });

  describe('Tile state change behavior', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    // TODO Mockup browser requestFullscreen/exitFullscreen
    xit('should correctly fire `igcTileFullscreen` event', async () => {
      const tile = first(tileManager.tiles);
      const tileWrapper = getTileBaseWrapper(tile);

      const eventSpy = spy(tile, 'emitEvent');

      simulateDoubleClick(tileWrapper);
      await elementUpdated(tile);

      expect(eventSpy).calledWith('igcTileFullscreen', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });

      // check if tile is fullscreen
    });

    // TODO Mockup browser requestFullscreen/exitFullscreen
    xit('can cancel `igcTileFullscreen` event', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileFullscreen', (ev) => {
        ev.preventDefault();
      });

      simulateDoubleClick(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileFullscreen', {
        detail: { tile: tile, state: false },
        cancelable: true,
      });
      // check if tile is not fullscreen
    });

    it('should correctly fire `igcTileMaximize` event', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      tile.toggleMaximize();
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });

      expect(tile.maximized).to.be.true;

      tile.toggleMaximize();
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: false },
        cancelable: true,
      });

      expect(tile.maximized).to.be.false;
    });

    it('can cancel `igcTileMaximize` event', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileMaximize', (ev) => {
        ev.preventDefault();
      });

      tile.toggleMaximize();
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });

      expect(tile.maximized).to.be.false;
    });
  });

  describe('Serialization', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile tile-id="custom-id1"> Tile content 1 </igc-tile>
          <igc-tile
            tile-id="custom-id2"
            colStart="8"
            colSpan="10"
            rowStart="7"
            rowSpan="7"
            disable-drag
            disable-resize
          >
            Tile content 2
          </igc-tile>
        </igc-tile-manager>
      `);
    });

    it('should serialize each tile with correct properties', async () => {
      const serializedData = JSON.parse(tileManager.saveLayout());
      const expectedData = [
        {
          tileId: 'custom-id1',
          colStart: null,
          colSpan: 3,
          disableDrag: false,
          disableResize: false,
          rowStart: null,
          rowSpan: 3,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
        },
        {
          tileId: 'custom-id2',
          colStart: 8,
          colSpan: 10,
          disableDrag: true,
          disableResize: true,
          rowStart: 7,
          rowSpan: 7,
          gridColumn: '8 / span 10',
          gridRow: '7 / span 7',
          maximized: false,
        },
      ];

      expect(serializedData).to.deep.equal(expectedData);
    });

    it('should deserialize tiles with proper properties values', async () => {
      const tilesData = [
        {
          tileId: 'id1',
          colStart: 1,
          colSpan: 5,
          disableDrag: true,
          disableResize: true,
          gridColumn: '1 / span 5',
          gridRow: '1 / span 5',
          maximized: false,
          rowStart: 1,
          rowSpan: 5,
        },
        {
          tileId: 'id2',
          colStart: null,
          colSpan: 3,
          disableDrag: false,
          disableResize: false,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
          rowStart: null,
          rowSpan: 3,
        },
      ];

      tileManager.loadLayout(JSON.stringify(tilesData));
      await elementUpdated(tileManager);

      const tiles = tileManager.tiles;
      expect(tiles.length).to.equal(2);

      expect(tiles[0].tileId).to.equal('id1');
      expect(tiles[0].colStart).to.equal(1);
      expect(tiles[0].colSpan).to.equal(5);
      expect(tiles[0].disableDrag).to.equal(true);
      expect(tiles[0].disableResize).to.equal(true);
      expect(tiles[0].maximized).to.be.false;
      expect(tiles[0].rowStart).to.equal(1);
      expect(tiles[0].rowSpan).to.equal(5);

      expect(tiles[1].tileId).to.equal('id2');
      expect(tiles[1].colStart).to.be.null;
      expect(tiles[1].colSpan).to.equal(3);
      expect(tiles[1].disableDrag).to.be.false;
      expect(tiles[1].disableResize).to.be.false;
      expect(tiles[1].maximized).to.be.false;
      expect(tiles[1].rowStart).to.be.null;
      expect(tiles[1].rowSpan).to.equal(3);

      const firstTileStyles = window.getComputedStyle(tiles[0]);
      const secondTileStyles = window.getComputedStyle(tiles[1]);

      expect(firstTileStyles.gridColumn).to.equal('1 / span 5');
      expect(firstTileStyles.gridRow).to.equal('1 / span 5');
      expect(secondTileStyles.gridColumn).to.equal('span 3');
      expect(secondTileStyles.gridRow).to.equal('span 3');
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should automatically assign unique `tileId` for tiles', async () => {
      const newTile = document.createElement('igc-tile');
      const existingIds = Array.from(tileManager.tiles).map(
        (tile) => tile.tileId
      );

      tileManager.appendChild(newTile);
      await elementUpdated(tileManager);

      expect(newTile.tileId).to.match(/^tile-\d+$/);
      expect(existingIds).not.to.include(newTile.tileId);
      expect(tileManager.tiles.length).to.equal(6);
    });

    it('should preserve the `tileId` if one is already set', async () => {
      const tile = document.createElement('igc-tile');
      tile.tileId = 'custom-id';

      tileManager.appendChild(tile);
      await elementUpdated(tileManager);

      expect(tileManager.tiles[5].tileId).to.equal('custom-id');
    });
  });

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
});

function getTileBaseWrapper(element: IgcTileComponent) {
  return element.renderRoot.querySelector<HTMLDivElement>('#base')!;
}
