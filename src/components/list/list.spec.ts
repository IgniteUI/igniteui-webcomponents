import { expect, fixture, html } from '@open-wc/testing';

import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcListHeaderComponent from './list-header.js';
import type IgcListItemComponent from './list-item.js';
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

  describe('Headers', () => {
    it('exposes a header as a list item, the only role that a list owns', async () => {
      list = await fixture<IgcListComponent>(html`
        <igc-list>
          <igc-list-header><h3>Team</h3></igc-list-header>
          <igc-list-item><span slot="title">Jane Doe</span></igc-list-item>
        </igc-list>
      `);

      const header = list.querySelector(IgcListHeaderComponent.tagName)!;
      expect(internalsOf(header)?.getARIA('role')).to.equal('listitem');
    });
  });

  describe('Item structure', () => {
    it('adds no role around the title and the subtitle', async () => {
      const item = await fixture<IgcListItemComponent>(html`
        <igc-list-item>
          <span slot="title">Jane Doe</span>
          <span slot="subtitle">Product designer</span>
        </igc-list-item>
      `);

      // A `header` element in a `section` has the `sectionheader` role in Chromium.
      const container = item.renderRoot.querySelector('[part~="header"]')!;
      expect(container.localName).to.equal('div');
    });
  });
});
