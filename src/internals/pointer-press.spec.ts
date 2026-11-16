import { aTimeout, expect, fixture, html, nextFrame } from '@open-wc/testing';
import { resetMouse, sendKeys, sendMouse } from '@web/test-runner-commands';
import { spy, useFakeTimers } from 'sinon';
import { afterPointerPress, trackPointerPress } from './pointer-press.js';
import { simulatePointerDown } from './testing/simulate.spec.js';
import { getCenterPoint } from './utils/dom.js';

describe('Pointer press', () => {
  let button: HTMLButtonElement;

  before(() => trackPointerPress());

  beforeEach(async () => {
    button = await fixture<HTMLButtonElement>(html`<button>Press</button>`);
  });

  afterEach(async () => {
    await resetMouse();
    // The release of a press runs in the next task.
    await aTimeout(0);
  });

  async function pressButton(): Promise<void> {
    const { x, y } = getCenterPoint(button);
    await sendMouse({ type: 'move', position: [Math.round(x), Math.round(y)] });
    await sendMouse({ type: 'down' });
  }

  it('does not queue a callback when no press is in progress', () => {
    expect(afterPointerPress(spy())).to.be.false;
  });

  it('runs a queued callback after the click of the press', async () => {
    const order: string[] = [];
    button.addEventListener('click', () => order.push('click'));

    await pressButton();
    expect(afterPointerPress(() => order.push('callback'))).to.be.true;
    await aTimeout(0);
    expect(order).to.be.empty;

    await sendMouse({ type: 'up' });
    await aTimeout(0);
    expect(order).to.deep.equal(['click', 'callback']);
  });

  it('runs a callback that is queued two times one time', async () => {
    const callback = spy();

    await pressButton();
    afterPointerPress(callback);
    afterPointerPress(callback);

    await sendMouse({ type: 'up' });
    await aTimeout(0);
    expect(callback.callCount).to.equal(1);
  });

  it('releases a press under fake timers', async () => {
    const clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const callback = spy();

    try {
      await pressButton();
      afterPointerPress(callback);
      await sendMouse({ type: 'up' });
      await nextFrame();
    } finally {
      clock.restore();
    }

    expect(callback.callCount).to.equal(1);
  });

  it('ends a press on a key press', async () => {
    const callback = spy();

    await pressButton();
    afterPointerPress(callback);
    await sendKeys({ press: 'Shift' });
    await nextFrame();

    expect(callback.callCount).to.equal(1);
  });

  it('ignores synthetic pointer events', () => {
    simulatePointerDown(button);
    expect(afterPointerPress(spy())).to.be.false;
  });
});
