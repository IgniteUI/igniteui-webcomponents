import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcAvatarComponent from './avatar.js';

describe('Avatar', () => {
  const DIFF_OPTIONS = {
    ignoreAttributes: ['style'],
  };

  before(() => {
    defineComponents(IgcAvatarComponent);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar></igc-avatar>`
    );

    await expect(el).shadowDom.to.be.accessible();
    await expect(el).to.be.accessible();
  });

  it('should initialize avatar component with default values', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar></igc-avatar>`
    );
    expect(el.shape).to.equal('square');
  });

  it('should set avatar shape correctly', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar shape="square"></igc-avatar>`
    );

    expect(el.shape).to.equal('square');

    el.shape = 'rounded';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="small" shape="rounded"></igc-avatar>`,
      DIFF_OPTIONS
    );

    el.shape = 'circle';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="small" shape="circle"></igc-avatar>`,
      DIFF_OPTIONS
    );
  });

  it('should fallback to initials avatar when no image or wrong image source is provided', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar initials="ab"></igc-avatar>`
    );

    expect(el.src).to.be.undefined;
    expect(el).shadowDom.to.equal(
      `<div part="base">
      <span part="initials">ab</span>
      </div>`
    );

    el.setAttribute('src', 'abs');
    expect(el).shadowDom.to.equal(
      `<div part="base">
      <span part="initials">ab</span>
      </div>`
    );
  });
});
