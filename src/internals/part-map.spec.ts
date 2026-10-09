import { expect, fixture, html } from '@open-wc/testing';
import { render } from 'lit';
import { type PartMapInfo, partMap } from './part-map.js';

describe('partMap directive', () => {
  const message =
    'partMap() can only be used in the `part` attribute, and must be the only binding in it.';

  let container: HTMLElement;

  beforeEach(async () => {
    container = await fixture<HTMLElement>(html`<div></div>`);
  });

  function renderParts(parts: PartMapInfo): HTMLElement {
    render(html`<span part=${partMap(parts)}></span>`, container);
    return container.querySelector('span')!;
  }

  it('sets the truthy names and updates them across renders', () => {
    let span = renderParts({ base: true, active: false, focused: null });
    expect([...span.part]).to.eql(['base']);

    span = renderParts({ base: true, active: true });
    expect([...span.part]).to.eql(['base', 'active']);

    span = renderParts({ active: true });
    expect([...span.part]).to.eql(['active']);
  });

  it('throws in an attribute other than `part`', () => {
    expect(() =>
      render(html`<span class=${partMap({ base: true })}></span>`, container)
    ).to.throw(message);
  });

  it('throws next to static text in the `part` attribute', () => {
    expect(() =>
      render(
        html`<span part="base ${partMap({ active: true })}"></span>`,
        container
      )
    ).to.throw(message);
  });

  it('throws in a child expression', () => {
    expect(() =>
      render(html`<span>${partMap({ base: true })}</span>`, container)
    ).to.throw(message);
  });
});
