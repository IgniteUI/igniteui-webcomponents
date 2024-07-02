import { expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcDividerComponent from './divider.js';

describe('Divider', () => {
  before(() => {
    defineComponents(IgcDividerComponent);
  });

  const createDefaultDivider = () => html` <igc-divider></igc-divider> `;

  const createVerticalDashedDivider = () => html`
    <igc-divider vertical type="dashed"></igc-divider>
  `;

  let divider: IgcDividerComponent;

  beforeEach(async () => {
    divider = await fixture<IgcDividerComponent>(createDefaultDivider());
  });

  describe('Initialization Tests', () => {
    it('passes the a11y audit', async () => {
      await expect(divider).to.be.accessible();
      await expect(divider).shadowDom.to.be.accessible();
    });

    it('is correctly initialized and rendered with its default component state', () => {
      expect(divider.middle).to.be.false;
      expect(divider.vertical).to.be.false;
      expect(divider.type).to.be.equal('solid');
      expect(divider).dom.to.equal('<igc-divider type="solid"></igc-divider>');
    });

    it('should correctly render when vertical and dashed properties are set', async () => {
      divider = await fixture<IgcDividerComponent>(
        createVerticalDashedDivider()
      );

      expect(divider.middle).to.be.false;
      expect(divider.vertical).to.be.true;
      expect(divider.type).to.be.equal('dashed');
      expect(divider).dom.to.equal(
        '<igc-divider vertical type="dashed"></igc-divider>'
      );
    });
  });
});
