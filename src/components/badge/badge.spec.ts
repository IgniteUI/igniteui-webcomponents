import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcIconComponent from '../icon/icon.js';
import IgcBadgeComponent from './badge.js';

describe('Badge', () => {
  before(() => {
    defineComponents(IgcBadgeComponent, IgcIconComponent);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcBadgeComponent>(html`<igc-badge></igc-badge>`);

    await expect(el).shadowDom.to.be.accessible();
    await expect(el).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    const el = await fixture<IgcBadgeComponent>(html`<igc-badge></igc-badge>`);

    expect(el).dom.to.equal(
      `<igc-badge shape="rounded" variant="primary"></igc-badge>`
    );
  });

  it('should render content inside', async () => {
    const content = '12';
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge>${content}</igc-badge>`
    );
    expect(el).dom.to.have.text(content);
  });

  it('can change variant', async () => {
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge variant="info"></igc-badge>`
    );

    expect(el.variant).to.equal('info');

    el.variant = 'success';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-badge shape="rounded" variant="success"></igc-badge>`
    );
  });

  it('can change shape', async () => {
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge shape="square"></igc-badge>`
    );

    expect(el.shape).to.equal('square');

    el.shape = 'rounded';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-badge shape="rounded" variant="primary"></igc-badge>`
    );
  });

  it('can be outlined', async () => {
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge outlined></igc-badge>`
    );

    expect(el.outlined).to.be.true;

    el.outlined = false;
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-badge shape="rounded" variant="primary"></igc-badge>`
    );
  });

  it('can be a dot badge', async () => {
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge dot></igc-badge>`
    );

    expect(el.dot).to.be.true;

    el.dot = false;
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-badge shape="rounded" variant="primary"></igc-badge>`
    );
  });

  it('dot badge works with all variants', async () => {
    const el = await fixture<IgcBadgeComponent>(
      html`<igc-badge dot variant="success"></igc-badge>`
    );

    expect(el.dot).to.be.true;
    expect(el.variant).to.equal('success');
  });

  describe('Icon part', () => {
    function hasIconPart(element: IgcBadgeComponent): boolean {
      return element.renderRoot.querySelector('[part~="icon"]') !== null;
    }

    it('should apply the icon part when an igc-icon is the only slotted element', async () => {
      const el = await fixture<IgcBadgeComponent>(
        html`<igc-badge><igc-icon name="home"></igc-icon></igc-badge>`
      );

      expect(hasIconPart(el)).to.be.true;
    });

    it('should not apply the icon part when the icon is accompanied by text', async () => {
      const el = await fixture<IgcBadgeComponent>(
        html`<igc-badge><igc-icon name="home"></igc-icon>12</igc-badge>`
      );

      expect(hasIconPart(el)).to.be.false;
    });

    it('should not apply the icon part for text-only content', async () => {
      const el = await fixture<IgcBadgeComponent>(
        html`<igc-badge>12</igc-badge>`
      );

      expect(hasIconPart(el)).to.be.false;
    });

    it('should clear the icon part when the icon is removed', async () => {
      const el = await fixture<IgcBadgeComponent>(
        html`<igc-badge><igc-icon name="home"></igc-icon></igc-badge>`
      );

      expect(hasIconPart(el)).to.be.true;

      el.querySelector('igc-icon')!.remove();
      await elementUpdated(el);

      expect(hasIconPart(el)).to.be.false;
    });

    it('should keep the inline padding of a badge that is not icon-only', async () => {
      const el = await fixture<HTMLElement>(
        html`<div style="--ig-spacing: 1; --ig-spacing-inline: 1">
          <igc-badge id="icon"><igc-icon name="home"></igc-icon></igc-badge>
          <igc-badge id="mixed"><igc-icon name="home"></igc-icon>12</igc-badge>
          <igc-badge id="text">12</igc-badge>
        </div>`
      );

      const paddingOf = (id: string) => {
        const badge = el.querySelector<IgcBadgeComponent>(`#${id}`)!;
        const base = badge.renderRoot.querySelector('[part~="base"]')!;
        return getComputedStyle(base).paddingInline;
      };

      // An icon-only badge renders as a circle.
      expect(paddingOf('icon')).to.equal('0px');
      expect(paddingOf('mixed')).to.not.equal('0px');
      expect(paddingOf('text')).to.equal(paddingOf('mixed'));
    });
  });

  describe('ARIA', () => {
    it('should expose a static role description that ignores the variant', async () => {
      const el = await fixture<IgcBadgeComponent>(
        html`<igc-badge variant="success">1</igc-badge>`
      );
      const internals = internalsOf(el)!;

      expect(internals.getARIA('role')).to.equal('status');
      expect(internals.getARIA('ariaRoleDescription')).to.equal('badge');

      el.variant = 'danger';
      await elementUpdated(el);
      expect(internals.getARIA('ariaRoleDescription')).to.equal('badge');
    });
  });
});
