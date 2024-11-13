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

  function getTileManagerSlot() {
    return tileManager.renderRoot.querySelector('slot')!;
  }

  function getTiles() {
    return Array.from(tileManager.querySelectorAll('igc-tile'));
  }
  function getTileBaseWrapper(element: IgcTileComponent) {
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
      expect(tileManager.columnCount).to.equal(10);
      expect(tileManager.dragMode).to.equal('slide');
      expect(tileManager.tiles).lengthOf(2);
    });

    it('should render properly', () => {
      expect(tileManager).dom.to.equal(
        `<igc-tile-manager>
          <igc-tile
            draggable="true"
            style="order: 0;"
            tile-id="customId-1"
          >
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile
            draggable="true"
            style="order: 1;"
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
        `<div part="base">
          <slot></slot>
        </div>`
      );
    });

    it('should slot user provided content in the tile', () => {
      const tiles = Array.from(
        tileManager.querySelectorAll(IgcTileComponent.tagName)
      );

      expect(tiles[0]).dom.to.equal(
        `<igc-tile draggable="true" style="order: 0;" tile-id="customId-1">
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>`
      );

      expect(tiles[0]).shadowDom.to.equal(
        `<div part="base draggable resizable">
          <slot name="header"></slot>
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
      // TODO: Add test for the actions slot
      const tileHeaders = Array.from(
        tileManager.querySelectorAll(IgcTileHeaderComponent.tagName)
      );

      expect(tileHeaders[0]).dom.to.equal(
        `<igc-tile-header>
          <span>Tile Header 1</span>
        </igc-tile-header>`
      );

      expect(tileHeaders[0]).shadowDom.to.equal(
        `<div part="header">
          <slot part="title" name="title"></slot>
          <span part="actions">
            <igc-icon-button
              collection="default"
              exportparts="icon"
              name="expand_content"
              type="button"
              variant="flat"
            >
            </igc-icon-button>
          </span>
          <span part="actions">
            <igc-icon-button
              collection="default"
              exportparts="icon"
              name="fullscreen"
              type="button"
              variant="flat"
            >
            </igc-icon-button>
          </span>
          <span part="actions">
            <slot name="actions"></slot>
          </span>
        </div>`
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

    xit('each tile should have correct grid area (col and row span)', async () => {
      expect(
        tileManager.tiles.every(
          ({ style: { gridColumn, gridRow } }) =>
            gridColumn === '' && gridRow === ''
        )
      ).to.be.true;
    });

    xit("should check tile manager's row and column template style props", async () => {
      let style = getComputedStyle(getTileManagerBase());

      expect(style.gridTemplateColumns).to.equal(
        'repeat(auto-fit, minmax(20px, 1fr))'
      );

      tileManager.columnCount = 15;

      await elementUpdated(tileManager);

      style = getTileManagerBase().style;

      expect(style.gridTemplateColumns).to.equal('repeat(15, auto)');
    });

    xit('should respect tile row and col start properties', async () => {
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
      const slot = getTileManagerSlot();
      expect(slot.assignedElements()).eql(tileManager.tiles);
    });

    it('should update the slot when tile is added', async () => {
      const slot = getTileManagerSlot();
      const newTile = document.createElement('igc-tile');
      newTile.id = 'tile3';

      tileManager.appendChild(newTile);
      await tileManager.updateComplete;

      expect(slot.assignedElements()).lengthOf(3);
      expect(slot.assignedElements()[2].id).to.equal('tile3');
    });

    it('should update the slot when a tile is removed', async () => {
      const slot = getTileManagerSlot();
      const tiles = getTiles();

      tileManager.removeChild(tiles[0]);
      await tileManager.updateComplete;

      expect(slot.assignedElements()).lengthOf(1);
      expect(slot.assignedElements()[0].id).to.equal('tile2');
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

      // TODO Fix or remove that check when the resize interaction is finalized
      // const ghostElement = tileManager.querySelector(
      //   '#resize-ghost'
      // ) as HTMLElement;
      // expect(ghostElement.style.gridColumn).to.equal('span 9');
      // expect(ghostElement.style.gridRow).to.equal('span 9');
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
      expect(tile.style.gridColumn).to.equal('');
      expect(tile.style.gridRow).to.equal('');
    });

    it('should not resize when `disableResize` is true', async () => {
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
          colStart: null,
          disableDrag: false,
          disableResize: false,
          gridColumn: 'auto',
          gridRow: 'auto',
          maximized: false,
          position: 0,
          rowStart: null,
          tileId: 'custom-id1',
        },
        {
          colSpan: 10,
          colStart: 8,
          disableDrag: true,
          disableResize: true,
          gridColumn: 'auto',
          gridRow: 'auto',
          maximized: false,
          position: 1,
          rowSpan: 7,
          rowStart: 7,
          tileId: 'custom-id2',
        },
      ];

      expect(serializedData).to.deep.equal(expectedData);
    });

    it('should deserialize tiles with proper properties values', async () => {
      const tilesData = [
        {
          colSpan: 5,
          colStart: 1,
          disableDrag: true,
          disableResize: true,
          gridColumn: '1 / span 5',
          gridRow: '1 / span 5',
          maximized: false,
          position: 0,
          rowSpan: 5,
          rowStart: 1,
          tileId: 'custom-id1',
        },
        {
          colSpan: 3,
          colStart: null,
          disableDrag: false,
          disableResize: false,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
          position: 1,
          rowSpan: 3,
          rowStart: null,
          tileId: 'custom-id2',
        },
        {
          colSpan: 3,
          colStart: null,
          disableDrag: false,
          disableResize: false,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
          position: 2,
          rowSpan: 3,
          rowStart: null,
          tileId: 'no-match-id',
        },
      ];

      tileManager.loadLayout(JSON.stringify(tilesData));
      await elementUpdated(tileManager);

      const tiles = tileManager.tiles;
      expect(tiles).lengthOf(2);

      expect(tiles[0].colSpan).to.equal(5);
      expect(tiles[0].colStart).to.equal(1);
      expect(tiles[0].disableDrag).to.equal(true);
      expect(tiles[0].disableResize).to.equal(true);
      expect(tiles[0].maximized).to.be.false;
      expect(tiles[0].position).to.equal(0);
      expect(tiles[0].rowSpan).to.equal(5);
      expect(tiles[0].rowStart).to.equal(1);
      expect(tiles[0].tileId).to.equal('custom-id1');

      expect(tiles[1].colSpan).to.equal(3);
      expect(tiles[1].colStart).to.be.null;
      expect(tiles[1].disableDrag).to.be.false;
      expect(tiles[1].disableResize).to.be.false;
      expect(tiles[1].maximized).to.be.false;
      expect(tiles[1].position).to.equal(1);
      expect(tiles[1].rowSpan).to.equal(3);
      expect(tiles[1].rowStart).to.be.null;
      expect(tiles[1].tileId).to.equal('custom-id2');

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
      expect(tileManager.tiles).lengthOf(6);
    });

    it('should preserve the `tileId` if one is already set', async () => {
      const tile = document.createElement('igc-tile');
      tile.tileId = 'custom-id';

      tileManager.appendChild(tile);
      await elementUpdated(tileManager);

      const matchingTiles = tileManager.tiles.filter(
        (tile) => tile.tileId === 'custom-id'
      );

      expect(matchingTiles).lengthOf(1);
    });

    it('should update the tiles collection when a tile is added to the light DOM', async () => {
      const newTile = document.createElement('igc-tile') as IgcTileComponent;
      newTile.id = 'tile5';

      tileManager.appendChild(newTile);
      await elementUpdated(tileManager);

      expect(tileManager.tiles).lengthOf(6);
      expect(tileManager.tiles[0].id).to.equal('tile5');
    });

    it('should update the tiles collection when a tile is removed from the light DOM', async () => {
      const tileToRemove = getTiles()[0];

      tileManager.removeChild(tileToRemove);
      await elementUpdated(tileManager);

      expect(tileManager.tiles).lengthOf(4);
      expect(tileManager.tiles[0].id).to.equal('tile1');
    });

    it('should automatically assign proper position', async () => {
      tileManager.tiles.forEach((tile, index) => {
        expect(tile.position).to.equal(index);
        expect(tile.style.order).to.equal(index.toString());
      });
    });

    it('should set proper CSS order based on position', async () => {
      const firstTile = first(getTiles());
      firstTile.position = 6;

      await elementUpdated(tileManager);

      expect(firstTile.style.order).to.equal('6');
      expect(tileManager.tiles[4].position).to.equal(6);
    });

    it('should properly handle tile addition with specified position', async () => {
      const newTile = document.createElement('igc-tile');
      newTile.position = 3;
      tileManager.append(newTile);
      await elementUpdated(tileManager);

      const tiles = getTiles();
      expect(tiles[5]).to.equal(newTile);
      expect(tiles[5].position).to.equal(3);
      expect(tiles[4].position).to.equal(4);
    });

    xit('should adjust positions correctly when a tile is removed', async () => {
      // TODO needs adjustment in the if statements in _observerCallback to handle the tile removal/addition properly
      const removedTile = getTiles()[2];
      tileManager.removeChild(removedTile);
      await elementUpdated(tileManager);

      const tiles = tileManager.tiles;
      expect(tiles).to.not.include(removedTile);
      tiles.forEach((tile, index) => {
        expect(tile.position).to.equal(index);
      });
    });
  });
});
