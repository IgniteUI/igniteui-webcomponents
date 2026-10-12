import {
  defineCE,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { type SinonSpy, spy } from 'sinon';
import {
  addHostListeners,
  type HostListenersConfig,
} from './host-listeners.js';

type ListenerHost = LitElement & { listener: SinonSpy };

describe('Host listeners controller', () => {
  function defineHost(
    config: (host: LitElement) => Partial<HostListenersConfig>
  ) {
    return unsafeStatic(
      defineCE(
        class extends LitElement {
          public readonly listener = spy();

          constructor() {
            super();
            addHostListeners(this, {
              events: ['click', 'keydown'],
              listener: this.listener,
              ...config(this),
            });
          }

          protected override render() {
            return html`<button>Inner</button>`;
          }
        }
      )
    );
  }

  it('listens on the host by default', async () => {
    const tag = defineHost(() => ({}));
    const host = await fixture<ListenerHost>(html`<${tag}></${tag}>`);

    host.dispatchEvent(new Event('click'));
    host.dispatchEvent(new Event('keydown'));

    expect(host.listener.callCount).to.equal(2);
  });

  it('listens on a target element', async () => {
    const target = document.createElement('div');
    const tag = defineHost(() => ({ target }));
    const host = await fixture<ListenerHost>(html`<${tag}></${tag}>`);

    host.dispatchEvent(new Event('click'));
    expect(host.listener.called).to.be.false;

    target.dispatchEvent(new Event('click'));
    expect(host.listener.calledOnce).to.be.true;
  });

  it('resolves a target function when the host connects', async () => {
    const tag = defineHost((host) => ({ target: () => host.renderRoot }));
    const host = await fixture<ListenerHost>(html`<${tag}></${tag}>`);
    const button = host.renderRoot.querySelector('button')!;

    button.dispatchEvent(new Event('click', { bubbles: true }));
    expect(host.listener.calledOnce).to.be.true;
  });

  it('removes the listeners on disconnect and adds them again on connect', async () => {
    const tag = defineHost(() => ({}));
    const host = await fixture<ListenerHost>(html`<${tag}></${tag}>`);
    const parent = host.parentElement!;

    host.remove();
    host.dispatchEvent(new Event('click'));
    expect(host.listener.called).to.be.false;

    parent.append(host);
    host.dispatchEvent(new Event('click'));
    expect(host.listener.calledOnce).to.be.true;
  });
});
