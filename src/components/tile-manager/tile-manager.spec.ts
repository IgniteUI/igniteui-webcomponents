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

  function getSlot(tile: IgcTileComponent, slotName: string): HTMLSlotElement {
    return tile.shadowRoot?.querySelector(
      `slot[name="${slotName}"]`
    ) as HTMLSlotElement;
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

  function expectSlotContent(
    tile: IgcTileComponent,
    slotName: string,
    expectedContent: string | null
  ) {
    const slot = getSlot(tile, slotName);
    if (expectedContent) {
      expect(slot?.assignedNodes()?.[0]?.textContent?.trim()).to.equal(
        expectedContent
      );
    } else {
      expect(slot?.assignedNodes()).to.have.length(0);
    }
  }

  describe('Initialization', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile id="customId-1">
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile id="customId-2">
            <h1 slot="title">Tile Header 2</h1>
            <p>Content 2</p>
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
      expect(tileManager.dragMode).to.equal('none');
      expect(tileManager.gap).to.equal(undefined);
      expect(tileManager.minColumnWidth).to.equal(undefined);
      expect(tileManager.minRowHeight).to.equal(undefined);
      expect(tileManager.resizeMode).to.equal('none');
      expect(tileManager.tiles).lengthOf(2);
    });

    it('should render properly', () => {
      expect(tileManager).dom.to.equal(
        `<igc-tile-manager>
          <igc-tile
            style="view-transition-name: tile-transition-customId-1; order: 0;"
            id="customId-1"
          >
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>
          <igc-tile
            style="view-transition-name: tile-transition-customId-2; order: 1;"
            id="customId-2"
          >
            <h1 slot="title">Tile Header 2</h1>
            <p>Content 2</p>
          </igc-tile>
        </igc-tile-manager>`
      );

      expect(tileManager).shadowDom.to.equal(
        `</div>
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
        `<igc-tile style="view-transition-name: tile-transition-customId-1; order: 0;" id="customId-1">
            <span slot="title">Tile Header 1</span>
            <p>Content 1</p>
          </igc-tile>`
      );

      expect(tiles[0]).shadowDom.to.equal(
        `
        <igc-resize
          exportparts="trigger-side, trigger, trigger-bottom"
          mode="deferred"
          part="resize">
          <div
            part="base"
            style="--ig-col-span:1;--ig-row-span:1;"
          >
            <section part="header">
              <header part="title">
                <slot name="title"></slot>
              </header>
              <section id="tile-actions" part="actions">
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
                <slot name="actions"></slot>
              </section>
            </section>
            <igc-divider type="solid"></igc-divider>
            <div part="content-container">
              <slot></slot>
            </div>
          </div>
          <slot name="side-adorner" slot="side-adorner">
            </slot>

            <slot name="corner-adorner" slot="corner-adorner">
            </slot>

            <slot name="bottom-adorner" slot="bottom-adorner">
            </slot>
        </igc-resize>
        `
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

  describe('Header slot assignment', () => {
    let tiles: IgcTileComponent[];

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile id="customId-1">
            <span>Show only default actions</span>
          </igc-tile>
          <igc-tile id="customId-2">
            <h1 slot="title">Header 2</h1>
            <span>Show title and default actions</span>
          </igc-tile>
          <igc-tile id="customId-3" disable-fullscreen disable-maximize>
            <h1 slot="title">Header 3</h1>
            <span>Show only title</span>
          </igc-tile>
          <igc-tile id="customId-4" disable-fullscreen disable-maximize>
            <span>No header</span>
          </igc-tile>
          <igc-tile id="customId-5">
            <span slot="title">Customize maximize and fullscreen</span>
            <button slot="maximize-action">Maximize</button>
            <button slot="fullscreen-action">Fullscreen</button>
          </igc-tile>
          <igc-tile id="customId-6">
            <igc-icon-button slot="actions">A</igc-icon-button>
            <igc-icon-button slot="actions">B</igc-icon-button>
            <span>Add custom actions</span>
          </igc-tile>
          <igc-tile id="customId-7" disable-fullscreen>
            <span>Hide fullscreen action</span>
          </igc-tile>
          <igc-tile id="customId-8" disable-maximize>
            <span>Hide maximize action</span>
          </igc-tile>
        </igc-tile-manager>
      `);

      tiles = tileManager.tiles;
    });

    it('should render only maximize and fullscreen actions by default', () => {
      const tile = tiles[0];
      const titleSlot = getSlot(tile, 'title');
      const actionButtons = getActionButtons(tile);
      const btnMaximize = actionButtons[0];
      const btnFullscreen = actionButtons[1];
      const actionsSlot = getSlot(tile, 'actions');

      expect(titleSlot.assignedNodes()).lengthOf(0);
      expect(btnFullscreen.name).equals('fullscreen');
      expect(btnMaximize.name).equals('expand_content');
      expect(actionsSlot.assignedNodes()).lengthOf(0);
    });

    it('should slot user provided content in the title', () => {
      expectSlotContent(tiles[1], 'title', 'Header 2');
      expectSlotContent(tiles[2], 'title', 'Header 3');
    });

    it('should render only title when fullscreen and maximize are disabled', () => {
      const tile = tiles[2];

      expectSlotContent(tiles[2], 'title', 'Header 3');
      expect(getActionButtons(tile)).lengthOf(0);
    });

    it('should display no header when maximize and fullscreen actions are disabled', () => {
      const tile = tiles[3];
      const titleSlot = getSlot(tile, 'title');
      const actionsSlot = getSlot(tile, 'actions');

      expect(titleSlot.assignedNodes()).lengthOf(0);
      expect(getActionButtons(tile)).lengthOf(0);
      expect(actionsSlot.assignedNodes()).lengthOf(0);
    });

    it('should override maximize and fullscreen actions', async () => {
      const tile = tiles[4];

      expectSlotContent(tile, 'maximize-action', 'Maximize');
      expectSlotContent(tile, 'fullscreen-action', 'Fullscreen');
    });

    it('should slot custom actions after the default ones', () => {
      const tile = tiles[5];
      const actionsContainer =
        tile.shadowRoot?.querySelector('[part="actions"]');
      expect(actionsContainer).to.exist;

      const elements = Array.from(actionsContainer!.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];

      const [maximizeSlot, fullscreenSlot, actionsSlot] = [
        'maximize-action',
        'fullscreen-action',
        'actions',
      ].map((name) =>
        elements.find(
          (node) => node instanceof HTMLSlotElement && node.name === name
        )
      );

      expect(maximizeSlot).to.exist;
      expect(fullscreenSlot).to.exist;
      expect(actionsSlot).to.exist;

      // Ensure maximize and fullscreen slots appear before actions slot
      const maxIndex = elements.indexOf(maximizeSlot!);
      const fullIndex = elements.indexOf(fullscreenSlot!);
      const actionsIndex = elements.indexOf(actionsSlot!);

      expect(maxIndex).to.be.lessThan(actionsIndex);
      expect(fullIndex).to.be.lessThan(actionsIndex);

      // Get assigned buttons
      const actionButtons = getSlot(tile, 'actions').assignedNodes();
      expect(actionButtons).to.have.length(2);
      expect(actionButtons?.[0].textContent?.trim()).to.equal('A');
      expect(actionButtons?.[1].textContent?.trim()).to.equal('B');
    });

    it('should hide fullscreen action when disableFullscreen is true', () => {
      const tile = tiles[6];
      const actionButtons = getActionButtons(tile);
      const btnMaximize = actionButtons[0];

      expect(actionButtons).lengthOf(1);
      expect(btnMaximize.name).equals('expand_content');
    });

    it('should hide maximize action when disableMaximize is true', () => {
      const tile = tiles[7];
      const actionButtons = getActionButtons(tile);
      const btnFullscreen = actionButtons[0];

      expect(btnFullscreen.name).equals('fullscreen');
    });
  });

  describe('Resize adorners slot assignment', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager resize-mode="always">
          <igc-tile>
            <div slot="side-adorner">Side Adorner</div>
            <div slot="corner-adorner">Corner Adorner</div>
            <div slot="bottom-adorner">Bottom Adorner</div>
          </igc-tile>
          <igc-tile id="tile2"></igc-tile>
        </igc-tile-manager>
      `);
    });

    const adornerTests: { slotName: string; expectedText: string }[] = [
      { slotName: 'side-adorner', expectedText: 'Side Adorner' },
      { slotName: 'corner-adorner', expectedText: 'Corner Adorner' },
      { slotName: 'bottom-adorner', expectedText: 'Bottom Adorner' },
    ];

    adornerTests.forEach(({ slotName, expectedText }) => {
      it(`should assign content to the ${slotName} slot`, () => {
        const slot =
          tileManager.tiles[0].shadowRoot!.querySelector<HTMLSlotElement>(
            `slot[name="${slotName}"]`
          );
        expect(slot).to.exist;
        expect(
          slot!
            .assignedNodes()
            .some((node) => node.textContent?.trim() === expectedText)
        ).to.be.true;
      });
    });

    adornerTests.forEach(({ slotName, expectedText }) => {
      it(`should correctly project adorners into the igc-resize ${slotName} slot`, async () => {
        const tile1 = tileManager.tiles[0];
        const resize = tile1.shadowRoot?.querySelector(
          'igc-resize'
        ) as HTMLElement;
        const resizeSlot = resize.shadowRoot!.querySelector<HTMLSlotElement>(
          `slot[name="${slotName}"]`
        );
        expect(resizeSlot).to.exist;
        expect(
          resizeSlot!
            .assignedNodes({ flatten: true })
            .some((node) => node.textContent?.trim() === expectedText)
        ).to.be.true;
        expect(resizeSlot!.assignedNodes()).lengthOf(1);
      });
    });

    it('should disable igc-resize component when resize mode is "none"', async () => {
      const tile = tileManager.tiles[0];

      tileManager.resizeMode = 'none';
      await elementUpdated(tileManager);

      const resize = tile.renderRoot.querySelector('igc-resize')!;

      expect(resize).is.not.null;
      expect(resize.enabled).to.be.false;
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
          <igc-tile id="custom-id1"> Tile content 1 </igc-tile>
          <igc-tile
            id="custom-id2"
            col-start="8"
            col-span="10"
            row-start="7"
            row-span="7"
            disable-resize
            disable-fullscreen
            disable-maximize
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
          disableFullscreen: false,
          disableMaximize: false,
          disableResize: false,
          gridColumn: 'auto / span 1',
          gridRow: 'auto / span 1',
          maximized: false,
          position: 0,
          rowSpan: 1,
          rowStart: null,
          id: 'custom-id1',
          width: null,
          height: null,
        },
        {
          colSpan: 10,
          colStart: 8,
          disableFullscreen: true,
          disableMaximize: true,
          disableResize: true,
          gridColumn: '8 / span 10',
          gridRow: '7 / span 7',
          maximized: false,
          position: 1,
          rowSpan: 7,
          rowStart: 7,
          id: 'custom-id2',
          width: null,
          height: null,
        },
      ];

      expect(serializedData).to.deep.equal(expectedData);
    });

    it('should deserialize tiles with proper properties values', async () => {
      const tilesData = [
        {
          colSpan: 5,
          colStart: 1,
          disableFullscreen: false,
          disableMaximize: false,
          disableResize: true,
          gridColumn: '1 / span 5',
          gridRow: '1 / span 5',
          maximized: true,
          position: 0,
          rowSpan: 5,
          rowStart: 1,
          id: 'custom-id1',
        },
        {
          colSpan: 3,
          colStart: 7,
          disableFullscreen: false,
          disableMaximize: false,
          disableResize: false,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
          position: 1,
          rowSpan: 3,
          rowStart: 7,
          id: 'custom-id2',
        },
        {
          colSpan: 3,
          colStart: null,
          disableFullscreen: false,
          disableMaximize: false,
          disableResize: false,
          gridColumn: 'span 3',
          gridRow: 'span 3',
          maximized: false,
          position: 2,
          rowSpan: 3,
          rowStart: null,
          id: 'no-match-id',
        },
      ];

      tileManager.loadLayout(JSON.stringify(tilesData));
      await elementUpdated(tileManager);

      const tiles = tileManager.tiles;
      expect(tiles).lengthOf(2);

      expect(tiles[0].colSpan).to.equal(5);
      expect(tiles[0].colStart).to.equal(1);
      expect(tiles[0].disableFullscreen).is.false;
      expect(tiles[0].disableMaximize).is.false;
      expect(tiles[0].disableResize).is.true;
      expect(tiles[0].maximized).is.true;
      expect(tiles[0].position).to.equal(0);
      expect(tiles[0].rowSpan).to.equal(5);
      expect(tiles[0].rowStart).to.equal(1);
      expect(tiles[0].id).to.equal('custom-id1');

      expect(tiles[1].colSpan).to.equal(3);
      expect(tiles[1].colStart).to.equal(7);
      expect(tiles[1].disableFullscreen).is.false;
      expect(tiles[1].disableMaximize).is.false;
      expect(tiles[1].disableResize).is.false;
      expect(tiles[1].maximized).is.false;
      expect(tiles[1].position).to.equal(1);
      expect(tiles[1].rowSpan).to.equal(3);
      expect(tiles[1].rowStart).to.equal(7);
      expect(tiles[1].id).to.equal('custom-id2');

      const firstTileStyles = window.getComputedStyle(tiles[0]);
      const secondTileStyles = window.getComputedStyle(tiles[1]);

      expect(firstTileStyles.gridColumn).to.equal('1 / span 5');
      expect(firstTileStyles.gridRow).to.equal('1 / span 5');
      expect(secondTileStyles.gridColumn).to.equal('span 3');
      expect(secondTileStyles.gridRow).to.equal('span 3');
    });

    it('should handle tiles with missing `id` correctly when deserializing', async () => {
      const tilesData = [
        {
          colSpan: 4,
          rowSpan: 4,
          position: 0,
        },
        {
          colSpan: 2,
          rowSpan: 2,
          position: 1,
          id: 'custom-id1',
        },
      ];

      tileManager.loadLayout(JSON.stringify(tilesData));
      await elementUpdated(tileManager);

      const tiles = tileManager.tiles;

      for (const tile of tiles) {
        expect(tile.id).to.not.be.empty;
        expect(tile.colSpan).not.equal(4);
      }
    });

    it('should not throw an error when passing undefined data to `loadLayout`', async () => {
      const tilesData = undefined;

      expect(() =>
        tileManager.loadLayout(JSON.stringify(tilesData))
      ).not.to.throw();
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('should automatically assign unique `id` for tiles', async () => {
      const newTile = document.createElement('igc-tile');
      const existingIds = Array.from(tileManager.tiles).map((tile) => tile.id);

      tileManager.appendChild(newTile);
      await elementUpdated(tileManager);

      expect(newTile.id).to.match(/^tile-\d+$/);
      expect(existingIds).not.to.include(newTile.id);
      expect(tileManager.tiles).lengthOf(6);
    });

    it('should preserve the `id` if one is already set', async () => {
      const tile = document.createElement('igc-tile');
      tile.id = 'custom-id';

      tileManager.appendChild(tile);
      await elementUpdated(tileManager);

      const matchingTiles = tileManager.tiles.filter(
        (tile) => tile.id === 'custom-id'
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
