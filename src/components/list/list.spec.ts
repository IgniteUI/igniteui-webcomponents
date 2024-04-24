import { expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcListComponent from './list.js';

describe('List', () => {
  before(() => {
    defineComponents(IgcListComponent);
  });

  let list: IgcListComponent;

  describe('List with items', () => {
    beforeEach(async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-item></igc-list-item>
          <igc-list-item></igc-list-item>
        </igc-list>
      `);
    });

    it('is accessible', async () => {
      await expect(list).dom.to.be.accessible();
      await expect(list).shadowDom.to.be.accessible();
    });

    it('list items are projected', async () => {
      expect(list.children.length).to.equal(2);
    });
  });

  describe('List with items and headers', () => {
    beforeEach(async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-header></igc-list-header>
          <igc-list></igc-list>
          <igc-list-header></igc-list-header>
          <igc-list></igc-list>
        </igc-list>
      `);
    });

    it('is accessible', async () => {
      await expect(list).dom.to.be.accessible();
      await expect(list).shadowDom.to.be.accessible();
    });

    it('list items are projected', async () => {
      expect(list.children.length).to.equal(4);
    });
  });
});
