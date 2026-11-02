import { expect } from '@open-wc/testing';
import type { ReactiveControllerHost } from 'lit';
import { spy } from 'sinon';
import { addFullscreenController } from './fullscreen.js';

describe('Fullscreen controller', () => {
  it('runs `onChange` with the host as `this`', () => {
    const host = Object.assign(document.createElement('div'), {
      addController: () => {},
      removeController: () => {},
      requestUpdate: () => {},
      updateComplete: Promise.resolve(true),
    }) as ReactiveControllerHost & HTMLElement;
    const onChange = spy(() => false);

    addFullscreenController(host, { onChange }).setState(true);

    expect(onChange.firstCall.thisValue).to.equal(host);
  });
});
