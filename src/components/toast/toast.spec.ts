import { html, fixture, expect } from '@open-wc/testing';
import { defineComponents, IgcToastComponent } from '../../index.js';

describe('Toast', () => {
  before(() => {
    defineComponents(IgcToastComponent);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcToastComponent>(html`<igc-toast></igc-toast>`);

    await expect(el).shadowDom.to.be.accessible();
  });

  it('should initialize toast component with default values', async () => {
    console.log(window.customElements.get('igc-toast'));
    const el = await fixture<IgcToastComponent>(html`<igc-toast></igc-toast>`);

    expect(el.position).to.equal('bottom');
  });
});
