import { html, fixture, expect, elementUpdated } from '@open-wc/testing';
import { IgcCardComponent } from './card';
import '../../../igniteui-webcomponents.js';

const DEFAULT_CLASS = 'container';
const classValue = (classes: string) => {
  return `${DEFAULT_CLASS} ${classes}`;
};

describe('Card Component', () => {
  const DIFF_OPTIONS = {
    ignoreChildren: ['div'],
  };
  let el: IgcCardComponent;

  it('a11y audit', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
    expect(el).shadowDom.to.be.accessible();
  });

  it('check the default outlined value', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);

    expect(el.outlined).to.be.false;
  });

  it('change outlined property', async () => {
    el = await fixture<IgcCardComponent>(html`<igc-card></igc-card>`);
    el.outlined = true;
    await elementUpdated(el);

    expect(el.outlined).to.be.true;
    expect(el).shadowDom.to.equal(
      `<div class="${classValue('outlined')}">
      </div>`,
      DIFF_OPTIONS
    );
  });

  it('should render some content', async () => {
    const content = `
      <igc-card-header>
        <h1 slot="title">Title</h1>
        <h3 slot="title">Subtitle</h3>
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
