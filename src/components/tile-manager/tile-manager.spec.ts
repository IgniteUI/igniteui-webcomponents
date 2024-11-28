import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { range } from 'lit/directives/range.js';
import { spy } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import { simulateDoubleClick } from '../common/utils.spec.js';
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
      expect(tileManager.minColumnWidth).to.equal(150);
      expect(tileManager.minRowHeight).to.equal(200);
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
        `<div
          part="base"
          style="--ig-column-count:10;--ig-min-col-width:150px;--ig-min-row-height:200px;"
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
        `<igc-tile draggable="true" style="order: 0;" tile-id="customId-1">
            <igc-tile-header>
              <span>Tile Header 1</span>
            </igc-tile-header>
            <p>Content 1</p>
          </igc-tile>`
      );

      expect(tiles[0]).shadowDom.to.equal(
        `<igc-resize
          mode="deferred"
          part="resize"
        >
          <div
            part="base draggable resizable"
            style="--ig-col-span:1;--ig-row-span:1;--ig-col-start:null;--ig-row-start:null;"
          >
            <slot name="header"></slot>
            <div part="content-container">
              <slot></slot>
            </div>
          </div>
        </igc-resize>`
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
          <section part="actions">
            <igc-icon-button
              collection="default"
              exportparts="icon"
              name="expand_content"
              type="button"
              variant="flat"
            >
            </igc-icon-button>
            <igc-icon-button
              collection="default"
              exportparts="icon"
              name="fullscreen"
              type="button"
              variant="flat"
            >
            </igc-icon-button>
            <slot name="actions"></slot>
          </section>
        </div>
        <igc-divider type="solid">
        </igc-divider>`
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

    //TODO Fix test by selecting header icon and simulate click on it
    xit('should correctly fire `igcTileMaximize` event', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      //tile.toggleMaximize();
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });

      expect(tile.maximized).to.be.true;

      //tile.toggleMaximize();
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: false },
        cancelable: true,
      });

      expect(tile.maximized).to.be.false;
    });

    //TODO Fix test by selecting header icon and simulate click on it
    xit('can cancel `igcTileMaximize` event', async () => {
      const tile = first(tileManager.tiles);
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileMaximize', (ev) => {
        ev.preventDefault();
      });

      //tile.toggleMaximize();
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
          colSpan: 1,
          colStart: null,
          disableDrag: false,
          disableResize: false,
          gridColumn: 'auto / span 1',
          gridRow: 'auto / span 1',
          maximized: false,
          position: 0,
          rowSpan: 1,
          rowStart: null,
          tileId: 'custom-id1',
        },
        {
          colSpan: 10,
          colStart: 8,
          disableDrag: true,
          disableResize: true,
          gridColumn: '8 / span 10',
          gridRow: '7 / span 7',
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
      expect(tileManager.tiles[5].id).to.equal('tile5');
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
      expect(tiles[4].position).to.equal(5);
    });

    it('should adjust positions correctly when a tile is removed', async () => {
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
