import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { isPopoverOpen } from '../common/util.js';
import { finishAnimationsFor } from '../common/utils.spec.js';
import IgcSnackbarComponent from './snackbar.js';

describe('Snackbar', () => {
  before(() => {
    defineComponents(IgcSnackbarComponent, IgcButtonComponent);
  });

  const defaultActionText = 'Action';
  const defaultContent = 'Hello world';

  let snackbar: IgcSnackbarComponent;
  let clock: SinonFakeTimers;

  describe('DOM', () => {
    beforeEach(async () => {
      snackbar = await fixture<IgcSnackbarComponent>(
        html`<igc-snackbar>${defaultContent}</igc-snackbar>`
      );
    });

    it('is accessible with no action DOM', async () => {
      await expect(snackbar).to.be.accessible();
      await expect(snackbar).shadowDom.to.be.accessible();
    });

    it('is accessible with action DOM', async () => {
      snackbar.actionText = defaultActionText;
      await elementUpdated(snackbar);

      await expect(snackbar).to.be.accessible();
      await expect(snackbar).shadowDom.to.be.accessible();
    });

    it('correct Shadow DOM with no actions present', async () => {
      expect(snackbar).shadowDom.to.equal(`
        <div part="base" inert>
          <span part="message">
            <slot></slot>
          </span>
          <slot name="action" part="action-container"></slot>
        </div>
      `);
    });

    it('correct Shadow DOM with `actionText` present', async () => {
      snackbar.actionText = defaultActionText;
      await elementUpdated(snackbar);

      expect(snackbar).shadowDom.to.equal(
        `
        <div part="base" inert>
          <span part="message">
            <slot></slot>
          </span>
          <slot name="action" part="action-container">
            <igc-button part="action" variant="flat" type="button">
              ${defaultActionText}
            </igc-button>
          </slot>
        </div>
      `
      );
    });

    it('correct Shadow DOM with `action` slot projection', async () => {
      const button = document.createElement('button');
      Object.assign(button, {
        textContent: 'Projected Action',
        slot: 'action',
      });
      snackbar.appendChild(button);
      await elementUpdated(snackbar);

      expect(snackbar).shadowDom.to.equal(`
        <div part="base" inert>
          <span part="message">
            <slot></slot>
          </span>
          <slot name="action" part="action-container"></slot>
        </div>
      `);
    });
  });

  describe('Public API', () => {
    const checkOpenState = (state = false) => {
      if (state) {
        expect(snackbar).dom.to.have.attribute('open');
        expect(isPopoverOpen(snackbar)).to.be.true;
        expect(snackbar).shadowDom.to.equal(`<div part="base"></div>`, {
          ignoreTags: ['span', 'slot'],
        });
      } else {
        expect(snackbar).dom.not.to.have.attribute('open');
        expect(isPopoverOpen(snackbar)).to.be.false;
        expect(snackbar).shadowDom.to.equal(`<div part="base" inert></div>`, {
          ignoreTags: ['span', 'slot'],
        });
      }
    };

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout'] });
      snackbar = await fixture<IgcSnackbarComponent>(
        html`<igc-snackbar>${defaultContent}</igc-snackbar>`
      );
    });

    afterEach(() => {
      clock.restore();
    });

    it('`open` property', async () => {
      checkOpenState(false);

      snackbar.open = true;
      await elementUpdated(snackbar);
      checkOpenState(true);

      snackbar.open = false;
      await elementUpdated(snackbar);
      checkOpenState(false);
    });

    it('`displayTime` property', async () => {
      snackbar.displayTime = 400;
      await snackbar.show();
      checkOpenState(true);

      await clock.tickAsync(399);
      checkOpenState(true);
      expect(snackbar.open).to.be.true;

      // hide timer triggers after this tick
      await clock.tickAsync(1);

      // Stop running animations and repaint
      finishAnimationsFor(snackbar.shadowRoot!);
      await nextFrame();

      expect(snackbar.open).to.be.false;
      checkOpenState(false);
    });

    it('`keepOpen` overrides `displayTime`', async () => {
      snackbar.displayTime = 200;
      snackbar.keepOpen = true;

      await snackbar.show();
      checkOpenState(true);

      await clock.tickAsync(400);
      expect(snackbar.open).to.be.true;
      checkOpenState(true);
    });

    it('`show()` and `hide()`', async () => {
      await snackbar.show();
      checkOpenState(true);

      await snackbar.hide();
      checkOpenState(false);
    });

    it('`show()` and `hide()` are no-op in their respective states', async () => {
      snackbar.open = true;
      expect(await snackbar.show()).to.be.false;
      checkOpenState(true);

      snackbar.open = false;
      expect(await snackbar.hide()).to.be.false;
      checkOpenState(false);
    });

    it('`toggle()`', async () => {
      // close -> open
      await snackbar.toggle();
      expect(snackbar.open).to.be.true;
      checkOpenState(true);

      // open -> close
      await snackbar.toggle();
      expect(snackbar.open).to.be.false;
      checkOpenState(false);
    });

    describe('positioning', () => {
      it('defaults to `viewport` with no inline anchor styles', async () => {
        expect(snackbar.positioning).to.equal('viewport');

        await snackbar.show();

        expect(isPopoverOpen(snackbar)).to.be.true;
        expect(snackbar.style.top).to.equal('');
        expect(snackbar.style.left).to.equal('');
      });

      it('`container` positioning shows popover when there is a visible ancestor', async () => {
        snackbar.positioning = 'container';
        await snackbar.show();

        expect(isPopoverOpen(snackbar)).to.be.true;
      });

      it('switching `container → viewport` while open maintains open state', async () => {
        snackbar.positioning = 'container';
        await snackbar.show();

        snackbar.positioning = 'viewport';
        await elementUpdated(snackbar);

        expect(isPopoverOpen(snackbar)).to.be.true;
      });

      it('switching `viewport → container` while open maintains open state', async () => {
        await snackbar.show();

        snackbar.positioning = 'container';
        await elementUpdated(snackbar);

        expect(isPopoverOpen(snackbar)).to.be.true;
      });

      it('`position` changes in `viewport` mode do not set inline styles', async () => {
        await snackbar.show();

        snackbar.position = 'top';
        await elementUpdated(snackbar);

        expect(isPopoverOpen(snackbar)).to.be.true;
        expect(snackbar.style.top).to.equal('');
        expect(snackbar.style.left).to.equal('');
      });
    });
  });

  describe('Events', () => {
    const getDefaultActionButton = () =>
      snackbar.renderRoot.querySelector(IgcButtonComponent.tagName)!;

    beforeEach(async () => {
      snackbar = await fixture<IgcSnackbarComponent>(
        html`<igc-snackbar>${defaultContent}</igc-snackbar>`
      );
    });

    it('emit `igcAction` when default action is clicked', async () => {
      snackbar.actionText = defaultActionText;
      await elementUpdated(snackbar);

      const eventSpy = spy(snackbar, 'emitEvent');

      getDefaultActionButton().click();
      expect(eventSpy).calledOnceWithExactly('igcAction');
    });

    it('emit `igcAction` with slotted content', async () => {
      const button = document.createElement('button');
      Object.assign(button, {
        textContent: 'Projected Action',
        slot: 'action',
      });
      snackbar.appendChild(button);
      await elementUpdated(snackbar);

      const eventSpy = spy(snackbar, 'emitEvent');

      button.click();
      expect(eventSpy).calledOnceWithExactly('igcAction');
    });
  });

  describe('Invoker Commands API', () => {
    afterEach(async () => {
      if (snackbar.open) {
        await snackbar.hide();
      }
    });

    describe('with igc-button', () => {
      let invoker: IgcButtonComponent;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button command="--show" commandfor="invoker-snackbar"
              >Show</igc-button
            >
            <igc-snackbar id="invoker-snackbar" keep-open
              >${defaultContent}</igc-snackbar
            >
          </div>
        `);

        invoker = container.querySelector<IgcButtonComponent>('igc-button')!;
        snackbar =
          container.querySelector<IgcSnackbarComponent>('igc-snackbar')!;
      });

      it('`--show` opens the snackbar', async () => {
        expect(snackbar.open).to.be.false;

        invoker.click();
        await waitUntil(() => snackbar.open);

        expect(snackbar.open).to.be.true;
      });

      it('`--hide` closes an open snackbar', async () => {
        await snackbar.show();
        expect(snackbar.open).to.be.true;

        invoker.command = '--hide';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !snackbar.open);

        expect(snackbar.open).to.be.false;
      });

      it('`--toggle` opens a closed snackbar', async () => {
        expect(snackbar.open).to.be.false;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => snackbar.open);

        expect(snackbar.open).to.be.true;
      });

      it('`--toggle` closes an open snackbar', async () => {
        await snackbar.show();
        expect(snackbar.open).to.be.true;

        invoker.command = '--toggle';
        await elementUpdated(invoker);

        invoker.click();
        await waitUntil(() => !snackbar.open);

        expect(snackbar.open).to.be.false;
      });

      it('a disabled igc-button does not invoke commands', async () => {
        invoker.disabled = true;
        await elementUpdated(invoker);

        invoker.click();
        await elementUpdated(snackbar);

        expect(snackbar.open).to.be.false;
      });
    });

    describe('with native button', () => {
      let invoker: HTMLButtonElement;

      beforeEach(async () => {
        const container = await fixture<HTMLElement>(html`
          <div>
            <button>Show</button>
            <igc-snackbar id="native-invoker-snackbar" keep-open
              >${defaultContent}</igc-snackbar
            >
          </div>
        `);

        invoker = container.querySelector<HTMLButtonElement>('button')!;
        snackbar =
          container.querySelector<IgcSnackbarComponent>('igc-snackbar')!;

        invoker.setAttribute('command', '--show');
        invoker.setAttribute('commandfor', 'native-invoker-snackbar');
      });

      it('`--show` opens the snackbar', async () => {
        expect(snackbar.open).to.be.false;

        invoker.click();
        await waitUntil(() => snackbar.open);

        expect(snackbar.open).to.be.true;
      });

      it('`--hide` closes an open snackbar', async () => {
        await snackbar.show();
        expect(snackbar.open).to.be.true;

        invoker.setAttribute('command', '--hide');

        invoker.click();
        await waitUntil(() => !snackbar.open);

        expect(snackbar.open).to.be.false;
      });

      it('`--toggle` opens a closed snackbar', async () => {
        expect(snackbar.open).to.be.false;

        invoker.setAttribute('command', '--toggle');

        invoker.click();
        await waitUntil(() => snackbar.open);

        expect(snackbar.open).to.be.true;
      });

      it('`--toggle` closes an open snackbar', async () => {
        await snackbar.show();
        expect(snackbar.open).to.be.true;

        invoker.setAttribute('command', '--toggle');

        invoker.click();
        await waitUntil(() => !snackbar.open);

        expect(snackbar.open).to.be.false;
      });

      it('a disabled native button does not invoke commands', async () => {
        invoker.disabled = true;

        invoker.click();
        await elementUpdated(snackbar);

        expect(snackbar.open).to.be.false;
      });
    });
  });
});
