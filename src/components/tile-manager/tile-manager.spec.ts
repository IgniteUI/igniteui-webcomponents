import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { range } from 'lit/directives/range.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { first } from '../common/util.js';
import { simulateDragStart } from '../common/utils.spec.js';
import IgcTileManagerComponent from './tile-manager.js';

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
          <igc-tile></igc-tile>
        </igc-tile-manager>
      `);
    });

    it('passes the a11y audit', async () => {
      await expect(tileManager).dom.to.be.accessible();
      await expect(tileManager).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(tileManager.columnCount).to.equal(0);
      expect(tileManager.rowCount).to.equal(0);
      expect(tileManager.dragMode).to.equal('slide');
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
          <igc-tile></igc-tile>
          <div></div>
          <igc-tile></igc-tile>
        </igc-tile-manager>
      `);
    });

    it('should only accept `igc-tile` elements', async () => {
      const slot = tileManager.renderRoot.querySelector('slot')!;
      expect(slot.assignedElements()).eql(tileManager.tiles);
    });
  });

  describe('Tile drag behavior', () => {
    beforeEach(async () => {
      tileManager = await fixture<IgcTileManagerComponent>(createTileManager());
    });

    it("should correctly fire 'dragStart' event", async () => {
      const eventSpy = spy(tileManager, 'emitEvent');

      const tile = first(tileManager.tiles);
      simulateDragStart(tile);
      await elementUpdated(tileManager);

      expect(eventSpy).calledOnceWithExactly('igcTileDragStarted', {
        detail: tile,
      });
    });
  });

  function createTileManager() {
    const result = Array.from(range(5)).map(
      (i) => html`
        <igc-tile colSpan="5" rowSpan="5">
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

// function getTileBaseWrapper(element: IgcTileComponent) {
//   return element.renderRoot.querySelector<HTMLDivElement>('#base')!;
// }
