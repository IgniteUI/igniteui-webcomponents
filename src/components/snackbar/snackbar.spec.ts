import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';

import IgcButtonComponent from '../button/button.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { finishAnimationsFor } from '../common/utils.spec.js';
import IgcSnackbarComponent from './snackbar.js';

describe('Snackbar', () => {
  before(() => {
    defineComponents(IgcSnackbarComponent);
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
      `,
        { ignoreAttributes: ['style', 'size'] }
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
        expect(snackbar).shadowDom.to.equal(`<div part="base"></div>`, {
          ignoreTags: ['span', 'slot'],
        });
      } else {
        expect(snackbar).dom.not.to.have.attribute('open');
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
});
