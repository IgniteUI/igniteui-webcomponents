import { html, fixture, expect } from '@open-wc/testing';

import { IgniteuiWebcomponents } from '../src/IgniteuiWebcomponents.js';
import '../igniteui-webcomponents.js';

describe('IgniteuiWebcomponents', () => {
  it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture<IgniteuiWebcomponents>(
      html`<igniteui-webcomponents></igniteui-webcomponents>`
    );

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });

  it('increases the counter on button click', async () => {
    const el = await fixture<IgniteuiWebcomponents>(
      html`<igniteui-webcomponents></igniteui-webcomponents>`
    );
    el.shadowRoot!.querySelector('button')!.click();

    expect(el.counter).to.equal(6);
  });

  it('can override the title via attribute', async () => {
    const el = await fixture<IgniteuiWebcomponents>(
      html`<igniteui-webcomponents
        title="attribute title"
      ></igniteui-webcomponents>`
    );

    expect(el.title).to.equal('attribute title');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgniteuiWebcomponents>(
      html`<igniteui-webcomponents></igniteui-webcomponents>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });
});
