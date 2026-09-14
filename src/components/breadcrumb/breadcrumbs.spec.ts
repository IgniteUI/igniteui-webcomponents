import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
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

    it('passes the a11y audit with disabled and custom separator items', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(html`
        <nav aria-label="Breadcrumb">
          <igc-breadcrumbs>
            <igc-breadcrumb>
              <a href="#">Home</a>
              <span slot="separator">/</span>
            </igc-breadcrumb>
            <igc-breadcrumb disabled>
              <a href="#">Settings</a>
              <span slot="separator">/</span>
            </igc-breadcrumb>
            <igc-breadcrumb current><a href="#">Users</a></igc-breadcrumb>
          </igc-breadcrumbs>
        </nav>
      `);
      await expect(el).to.be.accessible();
    });

    it('initializes igc-breadcrumb with current=false by default', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>`
      );
      expect(item.current).to.be.false;
    });
  });

  describe('current property', () => {
    it('sets aria-current="page" through element internals', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );
      const [first, , last] = Array.from(
        el.querySelectorAll(IgcBreadcrumbComponent.tagName)
      );

      expect(internalsOf(first)!.getARIA('ariaCurrent')).to.be.null;
      expect(internalsOf(last)!.getARIA('ariaCurrent')).to.equal('page');

      last.current = false;
      await elementUpdated(last);
      expect(internalsOf(last)!.getARIA('ariaCurrent')).to.be.null;
    });

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

      const lastBreadcrumb = lastOf(
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
    it('hides the separator from assistive technology', async () => {
      const el = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb>
          <a href="#">Home</a>
          <span slot="separator">/</span>
        </igc-breadcrumb>
      `);
      const separator = el.renderRoot.querySelector('[part="separator"]')!;

      expect(separator.getAttribute('aria-hidden')).to.equal('true');
    });

    it('hides the separator on the last breadcrumb item', async () => {
      const el = await fixture<IgcBreadcrumbsComponent>(
        createDefaultBreadcrumbs()
      );
      const lastBreadcrumb = lastOf(
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
      expect(firstOf(assigned).textContent).to.equal('/');
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
      expect(firstOf(assigned).textContent).to.equal('★');
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
      expect(firstOf(assigned).textContent).to.equal('▸');
    });
  });

  describe('disabled property', () => {
    it('reflects the disabled attribute', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>`
      );

      item.disabled = true;
      await elementUpdated(item);

      expect(item.disabled).to.be.true;
      expect(item.hasAttribute('disabled')).to.be.true;
    });

    it('toggles aria-disabled through element internals', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb><a href="#">Home</a></igc-breadcrumb>`
      );
      const internals = internalsOf(item)!;

      expect(internals.getARIA('ariaDisabled')).to.be.null;

      item.disabled = true;
      await elementUpdated(item);
      expect(internals.getARIA('ariaDisabled')).to.equal('true');

      item.disabled = false;
      await elementUpdated(item);
      expect(internals.getARIA('ariaDisabled')).to.be.null;
    });

    it('removes slotted links from the tab sequence while disabled', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb>
          <a href="#">Home</a>
          <span><button type="button">Menu</button></span>
        </igc-breadcrumb>
      `);
      const anchor = item.querySelector('a')!;
      const button = item.querySelector('button')!;

      expect(anchor.hasAttribute('tabindex')).to.be.false;

      item.disabled = true;
      await elementUpdated(item);
      expect(anchor.tabIndex).to.equal(-1);
      expect(button.tabIndex).to.equal(-1);

      item.disabled = false;
      await elementUpdated(item);
      expect(anchor.hasAttribute('tabindex')).to.be.false;
      expect(button.hasAttribute('tabindex')).to.be.false;
    });

    it('restores an author-provided tabindex when re-enabled', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(html`
        <igc-breadcrumb disabled>
          <a href="#" tabindex="0">Home</a>
        </igc-breadcrumb>
      `);
      const anchor = item.querySelector('a')!;

      expect(anchor.tabIndex).to.equal(-1);

      item.disabled = false;
      await elementUpdated(item);
      expect(anchor.getAttribute('tabindex')).to.equal('0');
    });

    it('applies the disabled state to links slotted after initialization', async () => {
      const item = await fixture<IgcBreadcrumbComponent>(
        html`<igc-breadcrumb disabled></igc-breadcrumb>`
      );
      const anchor = document.createElement('a');
      anchor.href = '#';
      anchor.textContent = 'Late';

      item.append(anchor);
      await elementUpdated(item);
      await nextFrame();

      expect(anchor.tabIndex).to.equal(-1);
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
