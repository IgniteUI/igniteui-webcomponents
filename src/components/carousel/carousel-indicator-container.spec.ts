import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { tabKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick, simulateKeyboard } from '../common/utils.spec.js';
import IgcCarouselIndicatorContainerComponent from './carousel-indicator-container.js';

describe('Carousel Indicator Container', () => {
  before(() => {
    defineComponents(IgcCarouselIndicatorContainerComponent);
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
    container = await fixture<IgcCarouselIndicatorContainerComponent>(
      createIndicatorContainerComponent()
    );
    buttons = container.querySelectorAll(
      'button'
    ) as unknown as HTMLButtonElement[];
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

    simulateKeyboard(buttons[0], tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );
  });

  it('should remove `focused` part on click', async () => {
    simulateKeyboard(buttons[0], tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    simulateClick(buttons[0]);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );
  });

  it('it should remove `focused` part on focusout', async () => {
    simulateKeyboard(buttons[0], tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    buttons[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base">
        <slot></slot>
      </div>`
    );
  });

  it('it should not remove `focused` part if a slotted element loses focus and a sibling element gains focus', async () => {
    simulateKeyboard(buttons[0], tabKey);
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );

    buttons[0].dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: buttons[1] })
    );
    await elementUpdated(container);

    expect(container).shadowDom.to.equal(
      `<div part="base focused">
        <slot></slot>
      </div>`
    );
  });
});
