import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulatePointerDown } from '../common/utils.spec.js';
import IgcRippleComponent from './ripple.js';

describe('Ripple', () => {
  let ripple: IgcRippleComponent;
  let button: IgcButtonComponent;

  before(() => {
    defineComponents(IgcRippleComponent, IgcButtonComponent);
  });

  beforeEach(async () => {
    button = await fixture(
      html`<igc-button>Click me <igc-ripple></igc-ripple></igc-button>`
    );

    ripple = button.querySelector(IgcRippleComponent.tagName)!;
  });

  it('DOM state before and after ripple animation', async () => {
    ripple.addEventListener(
      'animationstart',
      () =>
        expect(ripple).shadowDom.to.equal('<span></span>', {
          ignoreAttributes: ['style'],
        }),
      { once: true }
    );

    ripple.addEventListener(
      'animationend',
      () => expect(ripple).shadowDom.to.equal('<!----><!--?-->'),
      { once: true }
    );

    simulatePointerDown(ripple);
  });

  it('No ripple on non-primary pointer button', async () => {
    ripple.addEventListener(
      'animationstart',
      () =>
        expect.fail('Ripple animation should not start on non-primary button'),
      { once: true }
    );

    simulatePointerDown(ripple, { button: 1 });
    await elementUpdated(ripple);
  });
});
