import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
} from '@open-wc/testing';
import { resetMouse, sendKeys, sendMouse } from '@web/test-runner-commands';
import { range } from 'lit/directives/range.js';
import { match, restore, spy, stub } from 'sinon';
import { getActiveViewTransition } from '#animations/view-transition.js';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  isFocused,
  viewTransitionComplete,
} from '#internals/testing/helpers.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
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

  /** Clicks `element` with a real pointer, which gives the page user activation. */
  async function clickCenter(element: Element) {
    const { x, y } = getCenterPoint(element);
    await sendMouse({
      type: 'click',
      position: [Math.round(x), Math.round(y)],
    });
  }

  // A suite below replaces `document.exitFullscreen` with a stub.
  const exitFullscreen = () => Document.prototype.exitFullscreen.call(document);

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

  function createTileManagerWithPositions() {
    return html`<igc-tile-manager>
      <igc-tile id="tile1" position="2" col-span="2" row-span="2"> </igc-tile>
      <igc-tile id="tile2" position="1" col-start="4" row-start="4"> </igc-tile>
      <igc-tile id="tile3"> </igc-tile>
    </igc-tile-manager>`;
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
        <div id="tile-container" part="">
          <div part="base">
            <section part="header">
              <header part="title">
                <slot name="title"></slot>
              </header>
              <section id="tile-actions" part="actions">
                <slot name="maximize-action">
                  <igc-icon-button variant="flat" collection="default" exportparts="icon" name="expand_content" aria-label="Maximize" type="button"></igc-icon-button>
                </slot>
                <slot name="fullscreen-action">
                  <igc-icon-button variant="flat" collection="default" exportparts="icon" name="fullscreen" aria-label="Enter full screen" type="button"></igc-icon-button>
                </slot>
                <slot name="actions"></slot>
              </section>
            </section>
            <igc-divider aria-hidden="true" type="solid"></igc-divider>

            <div part="content-container">
                <slot></slot>
            </div>
          </div>
        </div>
        `
      );
    });

    it('issue 2051 - title content is hidden when disableFullscreen and disableMaximize are set to true', async () => {
      const tile = tileManager.tiles[0];

      tile.disableFullscreen = true;
      tile.disableMaximize = true;
      await elementUpdated(tile);

      const header =
        tile.renderRoot.querySelector<HTMLElement>('[part="header"]');
      expect(header?.hidden).to.be.false;
    });
  });

  describe('Accessibility', () => {
    let tile: IgcTileComponent;

    const labelledBy = (tile: IgcTileComponent) =>
      internalsOf(tile)?.getARIA('ariaLabelledByElements');

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile>
            <h3 slot="title">Revenue</h3>
            <p>Content</p>
          </igc-tile>
        </igc-tile-manager>
      `);
      tile = firstOf(tileManager.tiles);
    });

    it('is a region that its title names', () => {
      expect(internalsOf(tile)?.getARIA('role')).to.equal('region');
      expect(labelledBy(tile)).to.eql([tile.querySelector('h3')]);
    });

    it('follows a change of the title element', async () => {
      const title = document.createElement('span');
      title.slot = 'title';
      title.textContent = 'Orders';

      tile.querySelector('h3')!.replaceWith(title);
      await elementUpdated(tile);

      expect(labelledBy(tile)).to.eql([title]);

      title.remove();
      await elementUpdated(tile);

      expect(labelledBy(tile)).to.be.null;
    });

    it('lets an `aria-label` on the host name the region', async () => {
      tile.setAttribute('aria-label', 'Monthly revenue');
      await elementUpdated(tile);

      expect(labelledBy(tile)).to.be.null;

      tile.removeAttribute('aria-label');
      await elementUpdated(tile);

      expect(labelledBy(tile)).to.eql([tile.querySelector('h3')]);
    });

    it('names the default actions by what they do', async () => {
      expect(getActionButtons(tile).map(({ ariaLabel }) => ariaLabel)).to.eql([
        'Maximize',
        'Enter full screen',
      ]);

      tile.maximized = true;
      await elementUpdated(tile);

      expect(getActionButtons(tile).map(({ ariaLabel }) => ariaLabel)).to.eql([
        'Restore',
        'Enter full screen',
      ]);
    });

    it('hides the header divider from assistive technology', () => {
      const divider = tile.renderRoot.querySelector('igc-divider')!;
      expect(divider.getAttribute('aria-hidden')).to.equal('true');
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

    it('fits a responsive column into a manager that is narrower than the minimum column width', async () => {
      const container = await fixture<HTMLElement>(html`
        <div style="width: 150px">
          <igc-tile-manager min-column-width="300px">
            <igc-tile><p>Content</p></igc-tile>
          </igc-tile-manager>
        </div>
      `);
      const manager = container.querySelector('igc-tile-manager')!;
      await elementUpdated(manager);

      const grid =
        manager.renderRoot.querySelector<HTMLElement>('[part~="base"]')!;
      expect(grid.scrollWidth).to.equal(grid.clientWidth);
    });

    it('Should correctly set gap', async () => {
      const style = getComputedStyle(getTileManagerBase());

      expect(style.gap).to.equal('10px');

      tileManager.gap = '25px';
      await elementUpdated(tileManager);

      expect(style.gap).to.equal('25px');
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

  describe('Maximize', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it('issue 2029 - preserves grid container height when maximizing the only tile with the maximum row-span', async () => {
      const grid = getTileManagerBase();
      const tile = tileManager.tiles[0];

      // Make the first tile the sole contributor to the tallest row track.
      tile.rowSpan = 30;
      await elementUpdated(tileManager);

      const initialHeight = grid.offsetHeight;
      expect(grid.style.minHeight).to.equal('');

      tile.maximized = true;
      await elementUpdated(tileManager);

      // The grid height is locked so the maximized tile's content is not clipped.
      expect(grid.style.minHeight).to.equal(`${initialHeight}px`);
      expect(grid.offsetHeight).to.equal(initialHeight);
    });

    it('issue 2029 - releases the locked grid height once no tile is maximized', async () => {
      const grid = getTileManagerBase();
      const tile = tileManager.tiles[0];

      tile.rowSpan = 30;
      await elementUpdated(tileManager);

      tile.maximized = true;
      await elementUpdated(tileManager);
      expect(grid.style.minHeight).to.not.equal('');

      tile.maximized = false;
      await elementUpdated(tileManager);
      expect(grid.style.minHeight).to.equal('');
    });

    it('issue 2029 - keeps the grid height locked while any tile remains maximized', async () => {
      const grid = getTileManagerBase();
      const [firstTile, secondTile] = tileManager.tiles;

      firstTile.maximized = true;
      await elementUpdated(tileManager);

      const lockedHeight = grid.style.minHeight;
      expect(lockedHeight).to.not.equal('');

      secondTile.maximized = true;
      await elementUpdated(tileManager);

      // The lock is retained (and not re-measured) while another tile is still maximized.
      expect(grid.style.minHeight).to.equal(lockedHeight);

      firstTile.maximized = false;
      await elementUpdated(tileManager);
      expect(grid.style.minHeight).to.equal(lockedHeight);

      secondTile.maximized = false;
      await elementUpdated(tileManager);
      expect(grid.style.minHeight).to.equal('');
    });

    it('releases the locked grid height when the maximized tile is removed', async () => {
      const grid = getTileManagerBase();
      const tile = tileManager.tiles[0];

      tile.rowSpan = 30;
      await elementUpdated(tileManager);

      tile.maximized = true;
      await elementUpdated(tileManager);
      expect(grid.style.minHeight).to.not.equal('');

      tile.remove();
      await elementUpdated(tileManager);

      expect(grid.style.minHeight).to.equal('');
    });

    it('hides the tiles under a maximized tile', async () => {
      const [first, ...others] = tileManager.tiles;
      const isShown = (tile: IgcTileComponent) =>
        tile.checkVisibility({ visibilityProperty: true });

      first.maximized = true;
      await elementUpdated(tileManager);

      expect(isShown(first)).to.be.true;
      expect(others.some(isShown)).to.be.false;

      first.maximized = false;
      await elementUpdated(tileManager);

      expect(others.every(isShown)).to.be.true;
    });

    it('keeps content under a maximized tile out of reach, also with `visibility: visible`', async () => {
      const [first, second] = tileManager.tiles;
      const button = document.createElement('button');
      button.style.visibility = 'visible';
      second.append(button);

      first.maximized = true;
      await elementUpdated(tileManager);

      button.focus();
      expect(isFocused(button)).to.be.false;
      expect(button.checkVisibility({ visibilityProperty: true })).to.be.false;
    });

    it('shows a covered tile that goes fullscreen', async () => {
      const [first, second] = tileManager.tiles;
      const button = document.createElement('button');
      button.textContent = 'Full screen';
      button.addEventListener('click', () => second.requestFullscreen());
      tileManager.before(button);

      first.maximized = true;
      await elementUpdated(tileManager);

      const changed = oneEvent(second, 'fullscreenchange');

      try {
        await clickCenter(button);
        await changed;

        expect(second.checkVisibility({ visibilityProperty: true })).to.be.true;
      } finally {
        await resetMouse();
        if (second.matches(':fullscreen')) {
          await exitFullscreen();
        }
      }
    });

    it('marks the tile for a sharp transition while it maximizes', async () => {
      const tile = tileManager.tiles[0];

      simulateClick(getActionButtons(tile)[0]);

      expect(tile.style.viewTransitionClass).to.equal('igc-tile-resize');

      await getActiveViewTransition()?.finished;

      expect(tile.maximized).to.be.true;
      expect(tile.style.viewTransitionClass).to.equal('');
    });

    it('fades the new content of a maximizing tile in with a theme style sheet', async () => {
      const tile = tileManager.tiles[0];
      const adopted = [...document.adoptedStyleSheets];

      // The theme style sheets style the view transitions of the tiles.
      document.adoptedStyleSheets = [...adopted, bootstrap.styleSheet!];

      try {
        simulateClick(getActionButtons(tile)[0]);

        const transition = getActiveViewTransition()!;
        await transition.ready;

        const fadeIn = document
          .getAnimations()
          .find(
            (animation) =>
              animation instanceof CSSAnimation &&
              animation.animationName === 'igc-tile-fade-in' &&
              (animation.effect as KeyframeEffect).pseudoElement ===
                `::view-transition-new(${tile.style.viewTransitionName})`
          );

        expect(fadeIn).to.exist;
        await transition.finished;
      } finally {
        document.adoptedStyleSheets = adopted;
      }
    });

    it('aligns the transition of a right-to-left tile to its right edge', async () => {
      const tile = tileManager.tiles[0];
      tileManager.dir = 'rtl';

      simulateClick(getActionButtons(tile)[0]);

      expect(tile.style.viewTransitionClass).to.equal(
        'igc-tile-resize igc-tile-rtl'
      );
      await getActiveViewTransition()?.finished;
    });

    it('keeps the transition class until the last of two quick maximize clicks applies', async () => {
      const tile = tileManager.tiles[0];
      const [maximize] = getActionButtons(tile);

      simulateClick(maximize);
      simulateClick(maximize);
      // The second transition skips the first, which then finishes.
      await viewTransitionComplete();

      expect(tile.style.viewTransitionClass).to.equal('igc-tile-resize');

      await getActiveViewTransition()?.finished;

      expect(tile.style.viewTransitionClass).to.equal('');
    });

    it('takes the transition names of the covered tiles while a tile is maximized', async () => {
      const [first, ...others] = tileManager.tiles;
      const names = () =>
        others.map((tile) => getComputedStyle(tile).viewTransitionName);

      first.maximized = true;
      await elementUpdated(tileManager);

      expect(names().every((name) => name === 'none')).to.be.true;
      expect(getComputedStyle(first).viewTransitionName).to.equal(
        first.style.viewTransitionName
      );

      first.maximized = false;
      await elementUpdated(tileManager);

      expect(names()).to.eql(
        others.map((tile) => tile.style.viewTransitionName)
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

    const adornerParts: Record<string, string> = {
      'side-adorner': 'trigger-side',
      'corner-adorner': 'trigger',
      'bottom-adorner': 'trigger-bottom',
    };

    adornerTests.forEach(({ slotName, expectedText }) => {
      it(`should project adorners into the ${slotName} resize trigger slot`, async () => {
        const tile1 = tileManager.tiles[0];
        const resizeSlot = tile1.shadowRoot!.querySelector<HTMLSlotElement>(
          `slot[name="${slotName}"]`
        );

        expect(resizeSlot).to.exist;
        expect(resizeSlot!.part.contains(adornerParts[slotName])).to.be.true;
        expect(resizeSlot!.part.contains('custom')).to.be.true;
        expect(
          resizeSlot!
            .assignedNodes({ flatten: true })
            .some((node) => node.textContent?.trim() === expectedText)
        ).to.be.true;
        expect(resizeSlot!.assignedNodes()).lengthOf(1);
      });
    });

    it('should disable resize behavior when resize mode is "none"', async () => {
      const tile = tileManager.tiles[0];

      tileManager.resizeMode = 'none';
      await elementUpdated(tileManager);

      expect(tile.renderRoot.querySelector('[part~="tile-container"]')).is.null;
      expect(tile.renderRoot.querySelector('[part~="trigger"]')).is.null;
    });
  });

  describe('Tile manager context', () => {
    const managerFeatures = (tile: IgcTileComponent) => ({
      draggable: !!tile.renderRoot.querySelector('[part~="draggable"]'),
      resizable: !!tile.renderRoot.querySelector('[part~="trigger"]'),
    });

    it('drops the manager features when a tile leaves its manager', async () => {
      const container = await fixture<HTMLElement>(html`
        <div>
          <igc-tile-manager drag-mode="tile" resize-mode="always">
            <igc-tile><p>Content</p></igc-tile>
          </igc-tile-manager>
          <div id="outside"></div>
        </div>
      `);
      const tile = container.querySelector('igc-tile')!;
      await elementUpdated(tile);
      expect(managerFeatures(tile)).to.eql({
        draggable: true,
        resizable: true,
      });

      container.querySelector('#outside')!.append(tile);
      await elementUpdated(tile);

      expect(managerFeatures(tile)).to.eql({
        draggable: false,
        resizable: false,
      });
    });

    it('connects the tiles of a manager that the browser defines later', async () => {
      const tag = 'igc-late-tile-manager';
      const container = await fixture<HTMLElement>(html`<div></div>`);

      container.innerHTML = `<${tag} drag-mode="tile"><igc-tile><p>Content</p></igc-tile></${tag}>`;
      const tile = container.querySelector('igc-tile')!;
      await elementUpdated(tile);

      customElements.define(tag, class extends IgcTileManagerComponent {});
      const manager = container.querySelector<IgcTileManagerComponent>(tag)!;
      await elementUpdated(manager);
      await elementUpdated(tile);

      expect(managerFeatures(tile).draggable).to.be.true;
    });
  });

  describe('Native fullscreen', () => {
    let tile: IgcTileComponent;
    let plainTile: IgcTileComponent;

    function requestFullscreen({ currentTarget }: Event) {
      (currentTarget as Element).closest('igc-tile')!.requestFullscreen();
    }

    function requestChartFullscreen() {
      tile.querySelector('#chart')!.requestFullscreen();
    }

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(html`
        <igc-tile-manager>
          <igc-tile>
            <span slot="title">Report</span>
            <button slot="fullscreen-action" @click=${requestFullscreen}>
              Full screen
            </button>
            <div id="chart">
              <button @click=${requestChartFullscreen}>Chart</button>
            </div>
          </igc-tile>
          <igc-tile>
            <span slot="title">Notes</span>
          </igc-tile>
        </igc-tile-manager>
      `);
      [tile, plainTile] = tileManager.tiles;
    });

    afterEach(async () => {
      await resetMouse();

      for (const each of [tile, plainTile]) {
        while (each.matches(':fullscreen')) {
          await exitFullscreen();
        }
      }
    });

    it('follows a fullscreen request from a custom action', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const changed = oneEvent(tile, 'fullscreenchange');

      await clickCenter(tile.querySelector('button')!);
      await changed;
      await elementUpdated(tile);

      expect(tile.fullscreen).to.be.true;
      expect(getSlot(tile, 'maximize-action')).to.be.null;
      expect(eventSpy).calledOnceWithExactly('igcTileFullscreen', {
        detail: { tile, state: true },
        cancelable: false,
      });
    });

    it('follows the browser when it leaves fullscreen, also when a listener cancels the event', async () => {
      const [, btnFullscreen] = getActionButtons(plainTile);

      let changed = oneEvent(plainTile, 'fullscreenchange');
      await clickCenter(btnFullscreen);
      await changed;
      expect(plainTile.fullscreen).to.be.true;

      plainTile.addEventListener('igcTileFullscreen', (event) =>
        event.preventDefault()
      );
      const eventSpy = spy(plainTile, 'emitEvent');

      changed = oneEvent(plainTile, 'fullscreenchange');
      await exitFullscreen();
      await changed;
      await elementUpdated(plainTile);

      expect(plainTile.fullscreen).to.be.false;
      expect(eventSpy).calledOnceWithExactly('igcTileFullscreen', {
        detail: { tile: plainTile, state: false },
        cancelable: false,
      });
      expect(getActionButtons(plainTile).map(({ name }) => name)).to.eql([
        'expand_content',
        'fullscreen',
      ]);
    });

    it('leaves fullscreen when the tile is removed from the page', async () => {
      const changed = oneEvent(tile, 'fullscreenchange');
      await clickCenter(tile.querySelector('button')!);
      await changed;
      expect(tile.fullscreen).to.be.true;

      const exited = oneEvent(document, 'fullscreenchange');
      tile.remove();
      await exited;

      tileManager.append(tile);
      await elementUpdated(tile);

      expect(tile.fullscreen).to.be.false;
      expect(getSlot(tile, 'maximize-action')).to.exist;
    });

    it('stays fullscreen while an element inside it is fullscreen', async () => {
      let changed = oneEvent(tile, 'fullscreenchange');
      await clickCenter(tile.querySelector('button')!);
      await changed;

      const eventSpy = spy(tile, 'emitEvent');
      const chart = tile.querySelector('#chart')!;

      changed = oneEvent(chart, 'fullscreenchange');
      await clickCenter(chart.querySelector('button')!);
      await changed;
      await elementUpdated(tile);

      expect(chart.matches(':fullscreen')).to.be.true;
      expect(tile.fullscreen).to.be.true;

      changed = oneEvent(chart, 'fullscreenchange');
      await exitFullscreen();
      await changed;
      await elementUpdated(tile);

      expect(tile.fullscreen).to.be.true;
      expect(eventSpy).not.called;
    });
  });

  describe('Tile state change behavior', () => {
    let tile: any;

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
      tile = firstOf(tileManager.tiles);

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

    it('reports the rollback when the browser rejects the fullscreen request', async () => {
      tile.requestFullscreen = stub().rejects(new TypeError('Denied'));
      const eventSpy = spy(tile, 'emitEvent');

      simulateClick(getActionButtons(tile)[1]);
      await aTimeout(0);
      await elementUpdated(tile);

      expect(tile.fullscreen).to.be.false;
      expect(eventSpy.args).to.eql([
        [
          'igcTileFullscreen',
          { detail: { tile, state: true }, cancelable: true },
        ],
        [
          'igcTileFullscreen',
          { detail: { tile, state: false }, cancelable: false },
        ],
      ]);
      expect(getActionButtons(tile).map(({ name }) => name)).to.eql([
        'expand_content',
        'fullscreen',
      ]);
    });

    it('keeps the focus on the actions of a resizable tile', async () => {
      tileManager.resizeMode = 'always';
      await elementUpdated(tileManager);
      await elementUpdated(tile);

      const [btnMaximize, btnFullscreen] = getActionButtons(tile);

      btnMaximize.focus();
      simulateClick(btnMaximize);
      await viewTransitionComplete();

      expect(tile.maximized).to.be.true;
      expect(isFocused(btnMaximize)).to.be.true;

      simulateClick(btnMaximize);
      await viewTransitionComplete();

      btnFullscreen.focus();
      simulateClick(btnFullscreen);
      await elementUpdated(tile);

      expect(tile.fullscreen).to.be.true;
      expect(isFocused(btnFullscreen)).to.be.true;
    });

    it('names the fullscreen action after the next state', async () => {
      const btnFullscreen = getActionButtons(tile)[1];

      simulateClick(btnFullscreen);
      await elementUpdated(tile);

      expect(btnFullscreen.ariaLabel).to.equal('Exit full screen');
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

    it('should hide maximize action when a tile is in fullscreen mode', async () => {
      const btnMaximize = getActionButtons(tile)[0];
      const btnFullscreen = getActionButtons(tile)[1];

      expect(getActionButtons(tile)).lengthOf(2);
      expect(btnMaximize.name).equals('expand_content');
      expect(btnFullscreen.name).equals('fullscreen');

      simulateClick(btnFullscreen);
      await elementUpdated(tileManager);

      expect(tile.fullscreen).is.true;
      expect(getActionButtons(tile)).lengthOf(1);
      expect(getActionButtons(tile)[0].name).equals('fullscreen_exit');
    });

    it('should correctly fire `igcTileMaximize` event on clicking Maximize button', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const btnMaximize = getActionButtons(tile)[0];

      // Wait for maximized transition trigger from UI
      simulateClick(btnMaximize);
      await viewTransitionComplete();

      expect(eventSpy).calledWith('igcTileMaximize', {
        detail: { tile: tile, state: true },
        cancelable: true,
      });
      expect(tile.maximized).to.be.true;

      // Wait for maximized transition trigger from UI
      simulateClick(btnMaximize);
      await viewTransitionComplete();

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

    it('sets the state that its events report when maximize is clicked twice quickly', async () => {
      const eventSpy = spy(tile, 'emitEvent');
      const [btnMaximize] = getActionButtons(tile);

      simulateClick(btnMaximize);
      simulateClick(btnMaximize);
      await viewTransitionComplete();
      await viewTransitionComplete();

      const states = eventSpy.args.map(([, { detail }]) => detail.state);
      expect(states).to.eql([true, true]);
      expect(tile.maximized).to.be.true;
    });

    it('should properly switch the icons on maximized state change.', async () => {
      const btnMaximize = getActionButtons(tile)[0];

      expect(btnMaximize.name).equals('expand_content');

      // Wait for maximized transition trigger from UI
      simulateClick(btnMaximize);
      await viewTransitionComplete();

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
          maximized: false,
          position: 0,
          rowSpan: 1,
          rowStart: null,
          id: 'custom-id1',
        },
        {
          colSpan: 10,
          colStart: 8,
          disableFullscreen: true,
          disableMaximize: true,
          disableResize: true,
          maximized: false,
          position: 1,
          rowSpan: 7,
          rowStart: 7,
          id: 'custom-id2',
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

      expect(firstTileStyles.gridColumn).to.equal('auto');
      expect(firstTileStyles.gridRow).to.equal('auto');
      expect(secondTileStyles.gridColumn).to.equal('7 / span 3');
      expect(secondTileStyles.gridRow).to.equal('7 / span 3');
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

    it('should copy only the serialized tile properties from a layout', async () => {
      const [tile] = tileManager.tiles;
      const content = tile.innerHTML;

      tileManager.loadLayout(
        '[{"id":"custom-id1","colSpan":4,"innerHTML":"<img src=x>","__proto__":{},"slot":"x"}]'
      );
      await elementUpdated(tileManager);

      expect(tile.colSpan).to.equal(4);
      expect(tile.innerHTML).to.equal(content);
      expect(tile.slot).to.equal('');
      expect(Object.getPrototypeOf(tile)).to.equal(IgcTileComponent.prototype);
    });

    it('should ignore a layout that is not an array of tiles', async () => {
      const layout = tileManager.saveLayout();

      for (const data of ['{}', '"text"', '5', 'null', '[null, 1, "x"]']) {
        expect(() => tileManager.loadLayout(data)).not.to.throw();
      }
      await elementUpdated(tileManager);

      expect(tileManager.saveLayout()).to.equal(layout);
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
  });

  describe('Positioning', () => {
    const layout = () =>
      tileManager.tiles.map(({ id, position }) => [id, position]);

    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(
        createTileManagerWithPositions()
      );
    });

    it('keeps the positions when a tile moves in the DOM', async () => {
      const before = layout();

      tileManager.prepend(tileManager.tiles.at(-1)!);
      await elementUpdated(tileManager);

      expect(layout()).to.eql(before);
    });

    it('keeps the positions when several tiles move in one task', async () => {
      const before = layout();
      const [first, second] = getTiles();

      // A framework that reorders a list moves the nodes one by one.
      tileManager.append(first);
      tileManager.append(second);
      await elementUpdated(tileManager);

      expect(layout()).to.eql(before);
    });

    it('gives the tiles unique positions after a layout with duplicate positions', async () => {
      tileManager.loadLayout(
        JSON.stringify([
          { id: 'tile1', position: 5 },
          { id: 'tile2', position: 5 },
          { id: 'tile3', position: 0 },
        ])
      );
      await elementUpdated(tileManager);

      expect(layout()).to.eql([
        ['tile3', 0],
        ['tile1', 1],
        ['tile2', 2],
      ]);
    });

    it('uses a whole number for a fractional position', async () => {
      const tile = firstOf(getTiles());

      tile.position = 1.5;
      await elementUpdated(tile);

      expect(tile.position).to.equal(1);
      expect(tile.style.order).to.equal('1');
    });

    it('should preserve pre-set positions', async () => {
      const tile1 = tileManager.querySelector<IgcTileComponent>('#tile1');
      const tile2 = tileManager.querySelector<IgcTileComponent>('#tile2');
      const tile3 = tileManager.querySelector<IgcTileComponent>('#tile3');

      expect(tile1).to.exist;
      expect(tile1!.position).to.equal(2);

      expect(tile2).to.exist;
      expect(tile2!.position).to.equal(1);

      expect(tile3).to.exist;
      expect(tile3!.position).to.equal(0);
    });

    it('should correctly position tiles added dynamically after initialization', async () => {
      tileManager.replaceChildren();
      const tiles = Array.from(range(5)).map(() =>
        document.createElement(IgcTileComponent.tagName)
      );

      for (const tile of tiles) {
        tileManager.appendChild(tile);
      }

      await elementUpdated(tileManager);

      tileManager.tiles.forEach((tile, index) => {
        expect(tile.position).to.equal(index);
        expect(tile.style.order).to.equal(index.toString());
      });
    });

    it('should set proper CSS order based on position', async () => {
      const firstTile = firstOf(getTiles());
      firstTile.position = 6;

      await elementUpdated(tileManager);

      expect(firstTile.style.order).to.equal('6');
      expect(tileManager.tiles[2].position).to.equal(6);
    });

    it('should properly handle tile addition with specified position', async () => {
      const newTile = document.createElement('igc-tile');
      newTile.position = 1;

      tileManager.append(newTile);
      await elementUpdated(tileManager);

      const tiles = getTiles();
      expect(tiles[3]).to.equal(newTile);
      expect(tiles[3].position).to.equal(1);
      expect(tiles[1].position).to.equal(2);
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

  describe('Reading order', () => {
    async function tabOrder(tiles: ReturnType<typeof html>[]) {
      const container = await fixture<HTMLElement>(html`
        <div>
          <button>Start</button>
          <igc-tile-manager column-count="4">${tiles}</igc-tile-manager>
        </div>
      `);
      const manager = container.querySelector('igc-tile-manager')!;
      await elementUpdated(manager);

      container.querySelector('button')!.focus();
      const order: string[] = [];

      for (const _ of manager.tiles) {
        await sendKeys({ press: 'Tab' });
        order.push(document.activeElement!.textContent!.trim());
      }

      return order;
    }

    const tile = (name: string, attributes: Record<string, number>) => html`
      <igc-tile
        disable-maximize
        disable-fullscreen
        position=${attributes.position ?? -1}
        col-span=${attributes.colSpan ?? 1}
      >
        <button>${name}</button>
      </igc-tile>
    `;

    beforeEach(function () {
      // Only Chromium supports `reading-flow`. Elsewhere the DOM order stays.
      if (!CSS.supports('reading-flow', 'grid-rows')) {
        this.skip();
      }
    });

    it('moves the focus in the order of `position`', async () => {
      const order = await tabOrder([
        tile('A', { position: 3 }),
        tile('B', { position: 2 }),
        tile('C', { position: 1 }),
        tile('D', { position: 0 }),
      ]);

      expect(order).to.eql(['D', 'C', 'B', 'A']);
    });

    it('moves the focus in the order of a dense layout', async () => {
      // B does not fit in the first row, so C fills the gap before it.
      const order = await tabOrder([
        tile('A', { colSpan: 3 }),
        tile('B', { colSpan: 2 }),
        tile('C', { colSpan: 1 }),
        tile('D', { colSpan: 1 }),
      ]);

      expect(order).to.eql(['A', 'C', 'B', 'D']);
    });
  });
});
