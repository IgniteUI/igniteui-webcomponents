import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcBadgeComponent from './badge.js';

describe('Badge', () => {
  before(() => {
    defineComponents(IgcBadgeComponent);
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
});
