import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { range } from 'lit/directives/range.js';
import { match, restore, spy, stub } from 'sinon';
import IgcIconButtonComponent from '../button/icon-button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import { simulateClick } from '../common/utils.spec.js';
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

  function getActionButtons(tile: IgcTileComponent) {
    return Array.from(
      tile.renderRoot
        .querySelector('[part="header"]')
        ?.querySelectorAll(IgcIconButtonComponent.tagName) ?? []
    );
  }

  function createTileManager() {
    const result = Array.from(range(5)).map(
      (i) => html`
        <igc-tile id="tile${i}" col-span="5" row-span="5">
          <h3 slot="title">Tile ${i + 1}</h3>

          <div>
            <p>Content in tile ${i + 1}</p>
          </div>
        </igc-tile>
      `
    );
    return html`<igc-tile-manager>${result}</igc-tile-manager>`;
  }

  describe('Initialization', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile tile-id="customId-1">
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile tile-id="customId-2">
            <h1 slot="title">Tile Header 2</h1>
            <p>Content 2</p>
          </igc-tile>
          <igc-tile tile-id="customId-3">
            <span slot="title">Customize default actions</span>
            <button slot="default-actions">Action</button>
          </igc-tile>
          <igc-tile tile-id="customId-4">
            <span slot="title">Customize maximize and fullscreen</span>
            <button slot="maximize-action">Maximize</button>
            <button slot="fullscreen-action">Fullscreen</button>
          </igc-tile>
          <igc-tile tile-id="customId-5">
            <span slot="title">Customize maximize and fullscreen</span>
            <div slot="actions">
              <igc-icon-button>A</igc-icon-button>
              <igc-icon-button>B</igc-icon-button>
            </div>
          </igc-tile>
        </igc-tile-manager>
      `);
    });

    it('passes the a11y audit', async () => {
      await expect(tileManager).dom.to.be.accessible();
      await expect(tileManager).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(tileManager.columnCount).to.equal(0);
      expect(tileManager.dragAction).to.equal('slide');
      expect(tileManager.dragMode).to.equal('none');
      expect(tileManager.gap).to.equal(undefined);
      expect(tileManager.minColumnWidth).to.equal(undefined);
      expect(tileManager.minRowHeight).to.equal(undefined);
      expect(tileManager.resizeMode).to.equal('none');
      expect(tileManager.tiles).lengthOf(5);
    });

    it('should render properly', () => {
      expect(tileManager).dom.to.equal(
        `<igc-tile-manager>
          <igc-tile
            style="view-transition-name: tile-transition-customId-1; order: 0;"
            tile-id="customId-1"
          >
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile
            style="view-transition-name: tile-transition-customId-2; order: 1;"
            tile-id="customId-2"
          >
            <h1 slot="title">Tile Header 2</h1>
            <p>Content 2</p>
          </igc-tile>
          <igc-tile
          style="view-transition-name: tile-transition-customId-3; order: 2;"
          tile-id="customId-3"
        >
          <span slot="title">
            Customize default actions
          </span>
          <button slot="default-actions">
            Action
          </button>
        </igc-tile>
        <igc-tile
          style="view-transition-name: tile-transition-customId-4; order: 3;"
          tile-id="customId-4"
        >
          <span slot="title">
            Customize maximize and fullscreen
          </span>
          <button slot="maximize-action">
            Maximize
          </button>
          <button slot="fullscreen-action">
            Fullscreen
          </button>
        </igc-tile>
        <igc-tile
          style="view-transition-name: tile-transition-customId-5; order: 4;"
          tile-id="customId-5"
        >
          <span slot="title">
            Customize maximize and fullscreen
          </span>
          <div slot="actions">
            <igc-icon-button
              type="button"
              variant="contained"
            >
              A
            </igc-icon-button>
            <igc-icon-button
              type="button"
              variant="contained"
            >
              B
            </igc-icon-button>
          </div>
        </igc-tile>
        </igc-tile-manager>`
      );

      expect(tileManager).shadowDom.to.equal(
        `<div part="overlay">
        </div>
        <div
          part="base"
          style=""
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
        `<igc-tile style="view-transition-name: tile-transition-customId-1; order: 0;" tile-id="customId-1">
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>`
      );

      expect(tiles[0]).shadowDom.to.equal(
        `
          <div
            part="base draggable resizable"
            style="--ig-col-span:1;--ig-row-span:1;"
          >
            <section part="header">
              <header part="title">
                <slot name="title"></slot>
              </header>
              <section part="actions">
                <slot name="default-actions">
                  <slot name="maximize-action">
                    <igc-icon-button
                      aria-label="expand_content"
                      collection="default"
                      exportparts="icon"
                      name="expand_content"
                      type="button"
                      variant="flat"
                    >
                  </slot>
                  <slot name="fullscreen-action">
                    <igc-icon-button
                      aria-label="fullscreen"
                      collection="default"
                      exportparts="icon"
                      name="fullscreen"
                      type="button"
                      variant="flat"
                    >
                  </slot>
                </slot>
                <slot name="actions"></slot>
              </section>
            </section>
            <igc-divider type="solid"></igc-divider>
            <div part="content-container">
              <slot></slot>
            </div>
          </div>
        `
      );
    });

    it('should slot user provided content in the title', () => {
      const tiles = tileManager.tiles;
      const titleSlot1 = tiles[0].shadowRoot?.querySelector(
        'slot[name="title"]'
      ) as HTMLSlotElement;
      const titleSlot2 = tiles[1].shadowRoot?.querySelector(
        'slot[name="title"]'
      ) as HTMLSlotElement;

      expect(titleSlot1.assignedNodes()?.[0]?.textContent?.trim()).to.equal(
        'Tile Header 1'
      );
      expect(titleSlot2.assignedNodes()?.[0]?.textContent?.trim()).to.equal(
        'Tile Header 2'
      );
    });

    it('should slot custom default actions', () => {
      const tile = tileManager.tiles[2];
      const defaultActionsSLot = tile?.shadowRoot?.querySelector(
        'slot[name="default-actions"]'
      ) as HTMLSlotElement;
      const defaultActions = defaultActionsSLot.assignedNodes();

      expect(defaultActions?.[0]?.textContent?.trim()).to.equal('Action');
    });

    it('should override maximize and fullscreen actions when provided', async () => {
      const tile = tileManager.tiles[3];

      const maximizeActionSlot = tile?.shadowRoot?.querySelector(
        'slot[name="maximize-action"]'
      ) as HTMLSlotElement;
      const maximizeAction = maximizeActionSlot.assignedNodes();
      expect(maximizeAction?.[0]?.textContent?.trim()).to.equal('Maximize');

      const fullscreenActionSlot = tile?.shadowRoot?.querySelector(
        'slot[name="fullscreen-action"]'
      ) as HTMLSlotElement;
      const fullscreenAction = fullscreenActionSlot.assignedNodes();
      expect(fullscreenAction?.[0]?.textContent?.trim()).to.equal('Fullscreen');
    });

    it('should slot custom actions after the default ones', () => {
      const tile = tileManager.tiles[4];
      const actionsSlot = (
        tile?.shadowRoot?.querySelector(
          'slot[name="actions"]'
        ) as HTMLSlotElement
      ).assignedNodes();

      expect(actionsSlot).to.have.length(1);

      const actionButtons = (actionsSlot?.[0] as HTMLElement).querySelectorAll(
        'igc-icon-button'
      );
      expect(actionButtons).to.have.length(2);
      expect(actionButtons?.[0].textContent?.trim()).to.equal('A');
      expect(actionButtons?.[1].textContent?.trim()).to.equal('B');
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
            gridColumn === '' && gridRow === ''
        )
      ).to.be.true;
    });

    it("should check tile manager's row and column template style props", async () => {
      const style = getComputedStyle(getTileManagerBase());

      expect(style.gridTemplateColumns).to.equal(
        '234.656px 234.656px 234.656px 0px 0px'
      );

      tileManager.columnCount = 15;
      await elementUpdated(tileManager);

      expect(style.gridTemplateColumns).to.equal(
        '200px 200px 200px 200px 200px 200px 200px 200px 200px 200px 200px 200px 200px 200px 200px'
      );
    });

    it('should respect tile row and col start properties', async () => {
      const tile = tileManager.tiles[2];
      tile.colStart = 7;
      tile.rowStart = 5;

      await elementUpdated(tile);

      expect(getComputedStyle(tile).gridArea).to.equal(
        '5 / 7 / span 5 / span 5'
      );
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
    let tile: any;

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
      tile = first(tileManager.tiles);

      // Mock `requestFullscreen`
      tile.requestFullscreen = stub().callsFake(() => {
        Object.defineProperty(document, 'fullscreenElement', {
          value: tile,
          configurable: true,
        });
        return Promise.resolve();
      });

      // Mock `exitFullscreen`
      Object.defineProperty(document, 'exitFullscreen', {
        value: stub().callsFake(() => {
          Object.defineProperty(document, 'fullscreenElement', {
            value: null,
            configurable: true,
          });
          return Promise.resolve();
        }),
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
      });

      restore();
    });

    it('should correctly change fullscreen state on button click', async () => {
      const btnFullscreen = getActionButtons(tile)[1];
      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);

      expect(tile.requestFullscreen).to.have.been.calledOnce;
      expect(document.exitFullscreen).to.not.have.been.called;
      expect(tile.fullscreen).to.be.true;

      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);

      expect(document.exitFullscreen).to.have.been.calledOnce;
      expect(tile.fullscreen).to.be.false;
    });

    it('should correctly fire `igcTileFullscreen` event', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const fullscreenButton = getActionButtons(tile)[1];

      simulateClick(fullscreenButton!);
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileFullscreen', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });
      expect(tile.fullscreen).to.be.true;

      simulateClick(fullscreenButton!);
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileFullscreen', {
        detail: { tile: tile, state: false },
        cancelable: true,
      });
      expect(tile.fullscreen).to.be.false;
    });

    it('can cancel `igcTileFullscreen` event', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const fullscreenButton = getActionButtons(tile)[1];

      tile.addEventListener('igcTileFullscreen', (ev: CustomEvent) => {
        ev.preventDefault();
      });

      simulateClick(fullscreenButton!);
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith(
        'igcTileFullscreen',
        match({
          detail: { tile: tile, state: true },
          cancelable: true,
        })
      );
      expect(tile.fullscreen).to.be.false;
      expect(tile.requestFullscreen).not.to.have.been.called;
    });

    it('should update fullscreen property on fullscreenchange (e.g. Esc key is pressed)', async () => {
      const btnFullscreen = getActionButtons(tile)[1];
      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);

      expect(tile.fullscreen).to.be.true;

      // Mock the browser removing fullscreen element and firing a fullscreenchange event
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: null,
      });
      tile.dispatchEvent(new Event('fullscreenchange'));
      await elementUpdated(tileManager);

      expect(tile.fullscreen).to.be.false;
    });

    it('should properly switch the icons on fullscreen state change.', async () => {
      const btnFullscreen = getActionButtons(tile)[1];

      expect(btnFullscreen.name).equals('fullscreen');

      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);
      expect(btnFullscreen.name).equals('fullscreen_exit');

      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);
      expect(btnFullscreen.name).equals('fullscreen');
    });

    it('should correctly fire `igcTileMaximize` event on clicking Maximize button', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const btnMaximize = getActionButtons(tile)[0];

      simulateClick(btnMaximize);
      await elementUpdated(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });
      expect(tile.maximized).to.be.true;

      simulateClick(btnMaximize);
      await elementUpdated(tileManager);

      expect(eventSpy).to.have.been.calledTwice;
      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: false },
        cancelable: true,
      });
      expect(tile.maximized).to.be.false;
    });

    it('can cancel `igcTileMaximize` event', async () => {
      const eventSpy = spy(tile, 'emitEvent');

      tile.addEventListener('igcTileMaximize', (event: Event) => {
        event.preventDefault();
      });

      const btnMaximize = getActionButtons(tile)[0];
      simulateClick(btnMaximize);
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });
      expect(tile.maximized).to.be.false;
    });

    it('should properly switch the icons on maximized state change.', async () => {
      const btnMaximize = getActionButtons(tile)[0];

      expect(btnMaximize.name).equals('expand_content');
      simulateClick(btnMaximize);
      await elementUpdated(tileManager);

      expect(btnMaximize.name).equals('collapse_content');

      tile.maximized = !tile.maximized;
      await elementUpdated(tileManager);

      expect(btnMaximize.name).equals('expand_content');
    });
  });

  describe('Serialization', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile tile-id="custom-id1"> Tile content 1 </igc-tile>
          <igc-tile
            tile-id="custom-id2"
            col-start="8"
            col-span="10"
            row-start="7"
            row-span="7"
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

    it('should correctly position tiles added dynamically after initialization', async () => {
      tileManager.replaceChildren();
      const tiles = Array.from(range(5)).map(() =>
        document.createElement(IgcTileComponent.tagName)
      );

      tiles.forEach((tile) => tileManager.appendChild(tile));
      await elementUpdated(tileManager);

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
