import { expect, fixture, html } from '@open-wc/testing';
import { IgcNavbarComponent } from './navbar';
import '../../../igniteui-webcomponents';

describe('Navbar component', () => {
  it('passes the a11y audit', async () => {
    const el = await fixture<IgcNavbarComponent>(
      html`<igc-navbar></igc-navbar>`
    );

    expect(el).shadowDom.to.be.accessible();
  });

  it('should display content', async () => {
    const content = 'Title';
    const el = await fixture<IgcNavbarComponent>(
      html`<igc-navbar>${content}</igc-navbar>`
    );

    expect(el).dom.to.have.text(content);
  });

  it('renders the start, content and end slots successfully', async () => {
    const el = await fixture<IgcNavbarComponent>(
      html`<igc-navbar></igc-navbar>`
    );

    expect(el).shadowDom.to.equal(`<div part="base">
          <span part="start"><slot name="start"></slot></span>
          <span part="middle"><slot></slot></span>
          <span part="end"><slot name="end"></slot></span>
        </div>`);
  });
});
