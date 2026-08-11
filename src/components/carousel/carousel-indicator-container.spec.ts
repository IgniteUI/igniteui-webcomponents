import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { tabKey } from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  simulateClick,
  simulateKeyboard,
  simulatePointerDown,
  simulatePointerUp,
} from '#internals/testing/simulate.spec.js';
import { firstOf } from '#internals/utils/arrays.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselIndicatorContainerComponent from './carousel-indicator-container.js';

describe('Carousel Indicator Container', () => {
  before(() => {
    defineComponents(
      IgcCarouselIndicatorContainerComponent,
      IgcCarouselIndicatorComponent
    );
  });

  const createIndicatorContainerComponent = () => html`
    <igc-carousel-indicator-container>
      <button>1</button>
      <button>2</button>
      <button>3</button>
    </igc-carousel-indicator-container>
  `;

  let container: IgcCarouselIndicatorContainerComponent;
  let buttons: HTMLButtonElement[];

  beforeEach(async () => {
    container = await fixture(createIndicatorContainerComponent());
    buttons = Array.from(container.querySelectorAll('button'));
  });

  it('is correctly initialized', () => {
    expect(container).dom.to.equal(
      `<igc-carousel-indicator-container>
        <button>1</button>
        <button>2</button>
        <button>3</button>
      </igc-carousel-indicator-container>`
    );
    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );
  });

  it('should apply `focused` part on keyup', async () => {
    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );

    simulateKeyboard(firstOf(buttons), tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );
  });

  it('should remove `focused` part on click', async () => {
    simulateKeyboard(firstOf(buttons), tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    simulatePointerDown(firstOf(buttons));
    simulatePointerUp(firstOf(buttons));
    simulateClick(firstOf(buttons));
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );
  });

  it('it should remove `focused` part on focusout', async () => {
    simulateKeyboard(firstOf(buttons), tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    firstOf(buttons).dispatchEvent(
      new FocusEvent('focusout', { bubbles: true })
    );
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );
  });

  it('it should not remove `focused` part on focusout if the target receiving focus is an `igc-carousel-indicator`', async () => {
    simulateKeyboard(firstOf(buttons), tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    const indicator = await fixture(
      html`<igc-carousel-indicator>
        <span>0</span>
        <span slot="active">1</span>
      </igc-carousel-indicator>`
    );

    firstOf(buttons).dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: indicator })
    );
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );
  });
});
