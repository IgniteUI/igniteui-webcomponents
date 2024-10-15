import { expect, fixture, html } from '@open-wc/testing';

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
});
