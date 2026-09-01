import {
  elementUpdated,
  expect,
  fixture,
  html,
  waitUntil,
} from '@open-wc/testing';

import { internalsOf } from '#internals/controllers/internals.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import IgcAvatarComponent from './avatar.js';

describe('Avatar', () => {
  const DIFF_OPTIONS = {
    ignoreAttributes: ['style'],
  };

  /** A 1x1 transparent GIF. Data URIs keep the network out of these tests. */
  const ValidImage =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  /** Undecodable payload - errors locally, without a 404 in the test log. */
  const BrokenImage = 'data:image/gif;base64,bm90LWFuLWltYWdl';

  function getImage(element: IgcAvatarComponent): HTMLImageElement | null {
    return element.renderRoot.querySelector('img');
  }

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
      `<igc-avatar shape="rounded"></igc-avatar>`,
      DIFF_OPTIONS
    );

    el.shape = 'circle';
    await elementUpdated(el);
    expect(el).dom.to.equal(
      `<igc-avatar shape="circle"></igc-avatar>`,
      DIFF_OPTIONS
    );
  });

  it('should fallback to initials avatar when no image is provided', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar initials="ab"></igc-avatar>`
    );

    expect(el.src).to.be.undefined;
    expect(el).shadowDom.to.equal(
      `<div part="base">
      <span part="initials">ab</span>
      </div>`
    );
  });

  it('should render the image alongside the initials until it fails to load', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar initials="ab" src=${BrokenImage}></igc-avatar>`
    );

    expect(getImage(el)).to.exist;

    await waitUntil(
      () => getImage(el) === null,
      'The avatar did not drop the image after a load error'
    );

    expect(el).shadowDom.to.equal(
      `<div part="base">
      <span part="initials">ab</span>
      </div>`
    );
  });

  it('should retry rendering the image when the source changes after an error', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar src=${BrokenImage}></igc-avatar>`
    );

    await waitUntil(() => getImage(el) === null);

    el.src = ValidImage;
    await elementUpdated(el);

    expect(getImage(el)?.src).to.equal(ValidImage);
  });

  it('should mark the image as decorative when no alt text is provided', async () => {
    const el = await fixture<IgcAvatarComponent>(
      html`<igc-avatar src=${ValidImage}></igc-avatar>`
    );

    expect(getImage(el)!.getAttribute('alt')).to.equal('');

    el.alt = 'John Doe';
    await elementUpdated(el);
    expect(getImage(el)!.getAttribute('alt')).to.equal('John Doe');
  });

  describe('ARIA', () => {
    function ariaOf(element: IgcAvatarComponent) {
      const internals = internalsOf(element)!;
      return {
        role: internals.getARIA('role'),
        label: internals.getARIA('ariaLabel'),
        roleDescription: internals.getARIA('ariaRoleDescription'),
      };
    }

    it('should expose an image role, a role description and no name of its own', async () => {
      const el = await fixture<IgcAvatarComponent>(
        html`<igc-avatar></igc-avatar>`
      );

      expect(ariaOf(el)).to.eql({
        role: 'img',
        roleDescription: 'avatar',
        label: null,
      });
    });

    it('should derive the accessible name from alt, then initials', async () => {
      const el = await fixture<IgcAvatarComponent>(
        html`<igc-avatar initials="ab"></igc-avatar>`
      );

      expect(ariaOf(el).label).to.equal('ab');

      el.alt = 'John Doe';
      await elementUpdated(el);
      expect(ariaOf(el).label).to.equal('John Doe');

      el.alt = undefined;
      await elementUpdated(el);
      expect(ariaOf(el).label).to.equal('ab');
    });
  });
});
