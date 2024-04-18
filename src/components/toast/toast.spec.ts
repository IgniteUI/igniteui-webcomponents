import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { finishAnimationsFor, getAnimationsFor } from '../common/utils.spec.js';
import IgcToastComponent from './toast.js';

describe('Toast', () => {
  before(() => defineComponents(IgcToastComponent));

  beforeEach(async () => {
    toast = await fixture<IgcToastComponent>(
      html`<igc-toast>Hello world</igc-toast>`
    );
  });

  let toast: IgcToastComponent;

  const checkOpenState = (state = false) => {
    if (state) {
      expect(toast).dom.to.have.attribute('open');
      expect(toast).shadowDom.to.equal(`<slot></slot>`);
    } else {
      expect(toast).dom.not.to.have.attribute('open');
      expect(toast).shadowDom.to.equal(`<slot inert></slot>`);
    }
  };

  const showSkipAnimation = () => {
    const show = toast.show();
    finishAnimationsFor(toast);
    return show;
  };

  it('is accessible', async () => {
    await expect(toast).dom.to.be.accessible();
    await expect(toast).shadowDom.to.be.accessible();
  });

  it('`open` property', async () => {
    checkOpenState(false);

    toast.open = true;
    await elementUpdated(toast);
    checkOpenState(true);

    toast.open = false;
    await elementUpdated(toast);
    checkOpenState(false);
  });

  it('`displayTime` property', async () => {
    toast.displayTime = 400;
    await showSkipAnimation();
    checkOpenState(true);

    await aTimeout(400);
    checkOpenState(true);
    finishAnimationsFor(toast);

    await aTimeout(50);
    expect(toast.open).to.be.false;
    checkOpenState(false);
  });

  it('`keepOpen` overrides `displayTime`', async () => {
    toast.displayTime = 200;
    toast.keepOpen = true;

    await showSkipAnimation();
    checkOpenState(true);

    await aTimeout(400);
    expect(toast.open).to.be.true;
    checkOpenState(true);
  });

  it('`show()` and `hide()`', async () => {
    await toast.show();
    checkOpenState(true);

    await toast.hide();
    checkOpenState(false);
  });

  it('`show()` and `hide()` are no-op in their respective states', async () => {
    toast.open = true;
    await elementUpdated(toast);

    toast.show();
    checkOpenState(true);
    expect(getAnimationsFor(toast).length).to.equal(0);

    toast.open = false;
    await elementUpdated(toast);

    toast.hide();
    checkOpenState(false);
    expect(getAnimationsFor(toast).length).to.equal(0);
  });

  it('`toggle()`', async () => {
    // close -> open
    toast.toggle();
    finishAnimationsFor(toast);
    await nextFrame();

    expect(toast.open).to.be.true;
    checkOpenState(true);

    // open -> close
    toast.toggle();
    finishAnimationsFor(toast);
    await nextFrame();

    expect(toast.open).to.be.false;
    checkOpenState(false);
  });
});
