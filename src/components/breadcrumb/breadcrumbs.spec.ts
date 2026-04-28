import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import IgcBreadcrumbComponent from './breadcrumb.js';
import IgcBreadcrumbsComponent from './breadcrumbs.js';

describe('Breadcrumbs', () => {
  before(() => {
    defineComponents(IgcBreadcrumbsComponent);
  });

  const createDefaultBreadcrumbs = () => html`
    <igc-breadcrumbs>
      <igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>
      <igc-breadcrumb><a href="#">Products</a></igc-breadcrumb>
      <igc-breadcrumb current><a href="#">Laptop</a></igc-breadcrumb>
    </igc-breadcrumbs>
  `;

  describe('Initialization', () => {
    it('passes the a11y audit', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );
      await expect(el).to.be.accessible();
      await expect(el).shadowDom.to.be.accessible();
    });

    it('initializes igc-breadcrumb with current=false by default', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>`
      );
      expect(item.current).to.be.false;
    });
  });

  describe('current property', () => {
    it('reflects the current attribute', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb current><a href="#">Page</a></igc-breadcrumb>`
      );
      expect(item.current).to.be.true;
      expect(item).dom.to.equal(
        '<igc-breadcrumb current><a href="#">Page</a></igc-breadcrumb>'
      );
    });

    it('toggles current state programmatically', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );

      const lastBreadcrumb = last(
        Array.from(el.querySelectorAll(IgcBreadcrumbComponent.tagName))
      );

      expect(lastBreadcrumb.current).to.be.true;

      lastBreadcrumb.current = false;
      await elementUpdated(lastBreadcrumb);

      expect(lastBreadcrumb.current).to.be.false;
      expect(lastBreadcrumb.hasAttribute('current')).to.be.false;
    });

    it('sets current attribute when property changes to true', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb><a href="#">Page</a></igc-breadcrumb>`
      );

      expect(item.current).to.be.false;
      expect(item.hasAttribute('current')).to.be.false;

      item.current = true;
      await elementUpdated(item);

      expect(item.current).to.be.true;
      expect(item.hasAttribute('current')).to.be.true;
    });
  });

  describe('Separator', () => {
    it('hides the separator on the last breadcrumb item', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );
      const lastBreadcrumb = last(
        Array.from(el.querySelectorAll(IgcBreadcrumbComponent.tagName))
      );
      const separator =
        lastBreadcrumb.renderRoot.querySelector<HTMLElement>(
          '[part="separator"]'
        )!;

      expect(getComputedStyle(separator).display).to.equal('none');
    });

    it('renders a custom separator via the separator slot', async () => {
      const el = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb>
          <a href="#">Home</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
      `);

      const slot = el.renderRoot.querySelector<HTMLSlotElement>(
        'slot[name="separator"]'
      )!;
      const assigned = slot.assignedNodes();

      expect(assigned).to.have.lengthOf(1);
      expect(first(assigned).textContent).to.equal('/');
    });
  });

  describe('Prefix and Suffix slots', () => {
    it('renders content in the prefix slot', async () => {
      const el = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb>
          <span slot="prefix">★</span>
          <a href="#">Home</a>
        </igc-breadcrumb>
      `);

      const slot = el.renderRoot.querySelector<HTMLSlotElement>(
        'slot[name="prefix"]'
      )!;
      const assigned = slot.assignedNodes();

      expect(assigned).to.have.lengthOf(1);
      expect(first(assigned).textContent).to.equal('★');
    });

    it('renders content in the suffix slot', async () => {
      const el = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb>
          <a href="#">Home</a>
          <span slot="suffix">▸</span>
        </igc-breadcrumb>
      `);

      const slot = el.renderRoot.querySelector<HTMLSlotElement>(
        'slot[name="suffix"]'
      )!;
      const assigned = slot.assignedNodes();

      expect(assigned).to.have.lengthOf(1);
      expect(first(assigned).textContent).to.equal('▸');
    });
  });

  describe('Separator property', () => {
    it('defaults to tree_expand separator icon', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );
      expect(el.separator).to.equal('tree_expand');
    });

    it('reflects the separator attribute', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        html`<igc-breadcrumbs separator="chevron_right">
          <igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>
        </igc-breadcrumbs>`
      );
      expect(el.separator).to.equal('chevron_right');
      expect(el.getAttribute('separator')).to.equal('chevron_right');
    });

    it('propagates separator to child breadcrumb items', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        html`<igc-breadcrumbs separator="chevron_right">
          <igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>
          <igc-breadcrumb><a href="#">Products</a></igc-breadcrumb>
          <igc-breadcrumb current><a href="#">Item</a></igc-breadcrumb>
        </igc-breadcrumbs>`
      );

      const items = Array.from(
        el.querySelectorAll<IgcBreadcrumbComponent>(
          IgcBreadcrumbComponent.tagName
        )
      );
      for (const item of items) {
        await elementUpdated(item);
        const icon = item.renderRoot.querySelector('igc-icon');
        expect(icon?.getAttribute('name')).to.equal('chevron_right');
      }
    });

    it('updates separator icon when property changes', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );

      el.separator = 'chevron_right';
      await elementUpdated(el);

      const firstItem = el.querySelector<IgcBreadcrumbComponent>(
        IgcBreadcrumbComponent.tagName
      )!;
      await elementUpdated(firstItem);

      const icon = firstItem.renderRoot.querySelector('igc-icon');
      expect(icon?.getAttribute('name')).to.equal('chevron_right');
    });
  });
});
