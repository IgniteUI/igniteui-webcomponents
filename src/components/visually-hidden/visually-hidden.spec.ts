import { expect, fixture, html } from '@open-wc/testing';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcVisuallyHiddenComponent from './visually-hidden.js';

describe('VisuallyHidden', () => {
  before(() => {
    defineComponents(IgcVisuallyHiddenComponent);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcVisuallyHiddenComponent>(
      html`<igc-visually-hidden>Hidden text</igc-visually-hidden>`
    );

    await expect(el).to.be.accessible();
    await expect(el).shadowDom.to.be.accessible();
  });

  it('renders slotted content', async () => {
    const el = await fixture<IgcVisuallyHiddenComponent>(
      html`<igc-visually-hidden>Screen reader text</igc-visually-hidden>`
    );

    expect(el).dom.to.have.text('Screen reader text');
  });

  it('is hidden from visual layout when not focused', async () => {
    const el = await fixture<IgcVisuallyHiddenComponent>(
      html`<igc-visually-hidden>Hidden</igc-visually-hidden>`
    );

    const styles = getComputedStyle(el);
    expect(styles.position).to.equal('absolute');
    expect(styles.width).to.equal('1px');
    expect(styles.height).to.equal('1px');
  });

  it('becomes visible when focus is within', async () => {
    const el = await fixture<IgcVisuallyHiddenComponent>(
      html`<igc-visually-hidden><a href="#">Skip</a></igc-visually-hidden>`
    );

    const link = el.querySelector('a')!;
    link.focus();

    // When focused, :host(:not(:focus-within)) no longer matches,
    // so the element is no longer clipped to 1px
    const styles = getComputedStyle(el);
    expect(styles.position).to.not.equal('absolute');
  });

  it('renders a slot element in shadow DOM', async () => {
    const el = await fixture<IgcVisuallyHiddenComponent>(
      html`<igc-visually-hidden>text</igc-visually-hidden>`
    );

    expect(el).shadowDom.to.equal('<slot></slot>');
  });
});
