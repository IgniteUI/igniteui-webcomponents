import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import PopperTestComponent from './test.component.spec.js';
import type { IgcToggleOptions } from './types';

describe('Toggle directive', () => {
  let popper: any;
  let target: HTMLElement;

  before(() => {
    customElements.define('test-popper', PopperTestComponent);
  });
  beforeEach(async () => {
    target = (await fixture(html`<span>Toggle</span>`)) as HTMLSpanElement;
  });

  afterEach(() => {
    [...document.getElementsByTagName('test-popper')].forEach((el) => {
      el.remove();
    });
  });

  it('successfully creates & shows the popper element.', async () => {
    popper = await createPopper(target, { open: true });

    await expect(popper).to.be.accessible();
    const style =
      popper.renderRoot.children[0].attributes.getNamedItem('style')?.value;
    expect(style).not.to.contain('display: none');
  });

  it('successfully creates the popper element with default options.', async () => {
    popper = await createPopper(target, { open: false });

    const popperEl = popper.renderRoot.children[0];
    const attributes = popperEl.attributes;

    const style = attributes.getNamedItem('style')?.value;
    expect(style).to.contain('display: none');
    expect(style).to.contain('position: absolute');
  });

  it('creates a popper with the passed options.', async () => {
    popper = await createPopper(target, {
      open: true,
      placement: 'bottom-end',
      positionStrategy: 'fixed',
    });

    const attributes = getAttributes(popper);
    expect(getStyleValue(attributes)).to.contain('position: fixed');
  });

  it('does not create the popper without a target.', async () => {
    const div = document.querySelector('input') as HTMLElement;
    popper = await createPopper(div, {
      open: true,
      placement: 'bottom-end',
      positionStrategy: 'absolute',
    });

    const popperEl = popper.renderRoot.children[0];
    const attributes = popperEl.attributes;
    expect(getStyleValue(attributes)).to.eq('position:absolute;');
  });

  it('honors the flip option.', async () => {
    popper = await createPopper(target, {
      open: true,
      placement: 'left-start',
      positionStrategy: 'fixed',
      flip: true,
    });

    let targetRect = target.getBoundingClientRect();
    let toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.x).to.eq(targetRect.right);
    expect(toggleRect.y).to.eq(targetRect.y);

    popper = await createPopper(target, {
      open: true,
      placement: 'left-start',
      positionStrategy: 'absolute',
      flip: false,
    });

    targetRect = target.getBoundingClientRect();
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(Math.round(toggleRect.right)).to.eq(targetRect.x);
    expect(toggleRect.y).to.eq(targetRect.y);
  });

  it('properly reflects the offset if specified.', async () => {
    popper = await createPopper(target, {
      open: true,
      placement: 'right-start',
      positionStrategy: 'absolute',
      distance: 100,
    });

    let targetRect = target.getBoundingClientRect();
    let toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.x).to.eq(targetRect.right + 100);
    expect(toggleRect.y).to.eq(Math.round(targetRect.y));

    document.getElementsByTagName('test-popper')[0].remove();

    popper = await createPopper(target, {
      open: true,
      placement: 'bottom-end',
      positionStrategy: 'absolute',
      distance: 10,
    });

    targetRect = target.getBoundingClientRect();
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.left).to.eq(0);
    expect(toggleRect.y).to.eq(Math.round(targetRect.bottom + 10));

    document.getElementsByTagName('test-popper')[0].remove();

    popper = await createPopper(target, {
      open: true,
      placement: 'bottom-start',
      positionStrategy: 'absolute',
    });

    targetRect = target.getBoundingClientRect();
    toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.x).to.eq(targetRect.x);
    expect(toggleRect.y).to.eq(Math.round(targetRect.bottom));
  });

  it('honors the sameWidth option.', async () => {
    popper = await createPopper(target, {
      open: true,
      placement: 'bottom',
      positionStrategy: 'absolute',
      sameWidth: true,
    });

    const targetRect = target.getBoundingClientRect();
    const toggleRect = popper.renderRoot.children[0].getBoundingClientRect();

    expect(toggleRect.width).to.eq(targetRect.width);
  });

  const createPopper = async (
    target: HTMLElement,
    options: IgcToggleOptions
  ) => {
    const el = await fixture(new PopperTestComponent(target, options));

    await elementUpdated(el);
    await nextFrame();
    return el;
  };

  const getAttributes = (popper: LitElement) => {
    const popperEl = popper.renderRoot.children[0];
    return popperEl.attributes;
  };

  const getStyleValue = (attributes: any) => {
    return attributes.getNamedItem('style')?.value;
  };
});
