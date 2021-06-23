import { html, fixture, expect } from '@open-wc/testing';

import { IgniteuiWebcomponents } from '../src/IgniteuiWebcomponents.js';
import '../igniteui-webcomponents.js';

describe('IgniteuiWebcomponents', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<IgniteuiWebcomponents>(
      html`<igniteui-webcomponents></igniteui-webcomponents>`
    );

    expect(el).shadowDom.to.be.accessible();
  });
});
