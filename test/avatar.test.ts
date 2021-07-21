import { html, fixture, expect, elementUpdated } from '@open-wc/testing';
import { IgcAvatarComponent } from '../src/components/avatar/avatar';
import '../igniteui-webcomponents.js';

describe('Avatar', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar></igc-avatar>`
    );

    expect(el).shadowDom.to.be.accessible();
  });

  it('should initialize avatar component with default values', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar></igc-avatar>`
    );

    expect(el.size).to.equal('small');
    expect(el.shape).to.equal('square');
  });

  it('should set avatar size correctly', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar size="small"></igc-avatar>`
    );

    expect(el.size).to.equal('small');

    el.size = 'medium';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="medium" shape="square"></igc-avatar>`
    );

    el.size = 'large';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="large" shape="square"></igc-avatar>`
    );
  });

  it('should set avatar shape correctly', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar shape="square"></igc-avatar>`
    );

    expect(el.shape).to.equal('square');

    el.shape = 'rounded';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="small" shape="rounded"></igc-avatar>`
    );

    el.shape = 'circle';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar size="small" shape="circle"></igc-avatar>`
    );
  });

  it('should fallback to initials avatar when no image or wrong image source is provided', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar initials="ab"></igc-avatar>`
    );

    expect(el.src).to.be.undefined;
    expect(el).shadowDom.to.equal(
      `<div part="base" role="img" aria-label="avatar" aria-roledescription="small square" class="square small">
      <span part="initials">ab</span>
      </div>`
    );

    el.setAttribute('src', 'abs');
    expect(el).shadowDom.to.equal(
      `<div part="base" role="img" aria-label="avatar" aria-roledescription="small square" class="square small">
      <span part="initials">ab</span>
      </div>`
    );
  });
});
