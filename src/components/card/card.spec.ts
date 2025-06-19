import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { defineComponents, IgcCardComponent } from '../../index.js';

describe('Card Component', () => {
  before(() => {
    defineComponents(IgcCardComponent);
  });

  let el: IgcCardComponent;

  it('a11y audit', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
    await expect(el).shadowDom.to.be.accessible();
  });

  it('check the default elevated value', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);

    expect(el.elevated).to.be.false;
  });

  it('change elevated property', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
    el.elevated = true;
    await elementUpdated(el);

    expect(el.elevated).to.be.true;
    expect(el).dom.to.equal('<igc-card elevated></igc-card>');
  });

  it('should render some content', async () => {
    const content = `
      <igc-card-header>
        <h1 slot="title">Title</h1>
        <h3 slot="subtitle">Subtitle</h3>
      </igc-card-header>
      <igc-card-media>
        <img src="someLink">
      </igc-card-media>
      <igc-card-content>
        <p>Some content</po>
      </igc-card-content>
      <igc-card-actions>
        <button slot="buttons">Like</button>
        <igc-icon slot="icons"></igc-icon>
      </igc-card-actions>
    `;
    el = await fixture(html`<igc-card>${content}</igc-card>`);

    expect(el).dom.to.have.text(content);
  });
});
