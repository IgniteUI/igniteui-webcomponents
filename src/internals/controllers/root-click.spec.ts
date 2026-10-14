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
  simulateClick,
  simulatePointerDown,
} from '../testing/simulate.spec.js';
import {
  addRootClickController,
  type RootClickController,
} from './root-click.js';

type ClickHost = LitElement & {
  open: boolean;
  keepOpenOnOutsideClick: boolean;
  hide: SinonSpy;
  controller: RootClickController;
};

describe('Root click controller', () => {
  let outside: HTMLElement;
  let tagName: string;
  let tag: ReturnType<typeof unsafeStatic>;

  before(() => {
    tagName = defineCE(
      class extends LitElement {
        public static override properties = {
          open: { type: Boolean },
          keepOpenOnOutsideClick: { type: Boolean },
        };

        public open = false;
        public keepOpenOnOutsideClick = false;
        public readonly hide = spy();
        public readonly controller = addRootClickController(this);

        protected override updated(): void {
          this.controller.update();
        }

        protected override render() {
          return html`<button>Inside</button>`;
        }
      }
    );
    tag = unsafeStatic(tagName);
  });

  async function createHost(): Promise<ClickHost> {
    const container = await fixture<HTMLElement>(
      html`<div><${tag} open></${tag}><button id="outside">Outside</button></div>`
    );
    outside = container.querySelector('#outside')!;
    return container.querySelector(tagName) as ClickHost;
  }

  function clickOn(element: Element): void {
    simulatePointerDown(element);
    simulateClick(element);
  }

  it('calls `hide()` of the host on an outside click', async () => {
    const host = await createHost();

    clickOn(outside);
    expect(host.hide.calledOnce).to.be.true;
  });

  it('does not hide on a click inside the host', async () => {
    const host = await createHost();

    clickOn(host.renderRoot.querySelector('button')!);
    expect(host.hide.called).to.be.false;
  });

  it('calls `onHide` instead of `hide()` and ignores the configured target', async () => {
    const host = await createHost();
    const onHide = spy();

    host.controller.update({ onHide, target: outside });

    clickOn(outside);
    expect(onHide.called).to.be.false;

    clickOn(document.body);
    expect(onHide.calledOnce).to.be.true;
    expect(onHide.firstCall.thisValue).to.equal(host);
    expect(host.hide.called).to.be.false;
  });

  it('does not hide after a pointerdown inside and a click outside', async () => {
    const host = await createHost();

    simulatePointerDown(host);
    simulateClick(outside);

    expect(host.hide.called).to.be.false;
  });

  it('stops when the host closes or keeps open on an outside click', async () => {
    const host = await createHost();

    host.keepOpenOnOutsideClick = true;
    await host.updateComplete;
    clickOn(outside);

    host.keepOpenOnOutsideClick = false;
    host.open = false;
    await host.updateComplete;
    clickOn(outside);

    expect(host.hide.called).to.be.false;
  });
});
