import { beforeAll, describe, expect, it } from 'vitest';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { fixture, html } from '../common/helpers.spec.js';
import IgcNavbarComponent from './navbar.js';

describe('Navbar component', () => {
  beforeAll(() => {
    defineComponents(IgcNavbarComponent);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcNavbarComponent>(
      html`<igc-navbar></igc-navbar>`
    );

    await expect(el).shadowDom.to.be.accessible();
  });

  it('displays content', async () => {
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

  it('displays the elements defined in the slots', async () => {
    const el = await fixture<IgcNavbarComponent>(
      html`<igc-navbar>
        <button slot="start">IG</button>
        <h1>This is the title</h1>
        <input slot="end" type="text" value="Search" />
      </igc-navbar>`
    );

    expect(el).dom.to.have.descendant('button');
    expect(el).dom.to.have.descendant('h1');
    expect(el).dom.to.have.descendant('input');
  });
});
