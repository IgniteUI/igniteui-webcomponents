import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcTileHeaderComponent from './tile-header.js';
import IgcTileManagerComponent from './tile-manager.js';
import IgcTileComponent from './tile.js';

describe('Tile Manager component', () => {
  before(() => {
    defineComponents(
      IgcTileComponent,
      IgcTileHeaderComponent,
      IgcTileManagerComponent
    );
  });

  let tileManager: IgcTileManagerComponent;

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
      expect(tileManager.childElementCount).to.equal(5);
    });

    it('each tile should have correct grid area (col and row span)', async () => {
      const tiles = tileManager.children;

      Array.from(tiles).forEach((tile) => {
        expect((tile as HTMLElement).style.gridColumn).to.equal('span 5');
        expect((tile as HTMLElement).style.gridRow).to.equal('span 5');
      });
    });

    it("should check tile manager's row and column template style props", async () => {
      let baseElement = tileManager.shadowRoot?.querySelector(
        '[part="base"]'
      ) as HTMLElement;

      expect(baseElement.style.gridTemplateColumns).to.equal(
        'repeat(auto-fit, minmax(20px, 1fr))'
      );
      expect(baseElement.style.gridTemplateRows).to.equal(
        'repeat(auto-fit, minmax(20px, 1fr))'
      );

      tileManager.columnCount = 15;
      tileManager.rowCount = 15;

      await elementUpdated(tileManager);

      baseElement = tileManager.shadowRoot?.querySelector(
        '[part="base"]'
      ) as HTMLElement;

      expect(baseElement.style.gridTemplateColumns).to.equal(
        'repeat(15, auto)'
      );
      expect(baseElement.style.gridTemplateRows).to.equal('repeat(15, auto)');
    });

    it('should respect tile row and col start properties', async () => {
      const tileElement = tileManager.children[2];
      const tile = tileElement as IgcTileComponent;

      tile.colStart = 7;
      tile.rowStart = 5;

      await elementUpdated(tile);

      expect((tileElement as HTMLElement).style.gridArea).to.equal(
        '5 / 7 / span 5 / span 5'
      );
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
      const slot = tileManager.shadowRoot?.querySelector('slot');
      const assignedNodes = slot?.assignedNodes();
      const assignedTiles = assignedNodes?.filter(
        (node) => node.nodeName.toLocaleLowerCase() === IgcTileComponent.tagName
      );
      const assignedDivs = assignedNodes?.filter(
        (node) => node.nodeName.toLocaleLowerCase() === 'div'
      );

      expect(assignedTiles?.length).to.equal(2);
      expect(assignedDivs?.length).to.equal(0);
    });
  });

  function createTileManager() {
    const tiles = Array.from(
      map(
        range(5),
        (i) => html`
          <igc-tile .colSpan=${5} .rowSpan=${5} id="tile">
            <igc-tile-header slot="header">
              <h3 slot="title">Tile ${i + 1} Title</h3>
            </igc-tile-header>

            <p>Text in Tile ${i + 1}</p>
          </igc-tile>
        `
      )
    );

    return html` <igc-tile-manager> ${tiles} </igc-tile-manager> `;
  }
});
