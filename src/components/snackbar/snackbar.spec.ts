import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { tabKey } from '#internals/controllers/keys.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runAlertTests } from '#internals/testing/alert.spec.js';
import { finishAnimationsFor } from '#internals/testing/helpers.spec.js';
import { runInvokerCommandsTests } from '#internals/testing/invoker-commands.spec.js';
import {
  simulateKeyboard,
  simulatePointerEnter,
  simulatePointerLeave,
} from '#internals/testing/simulate.spec.js';
import { isPopoverOpen } from '#internals/utils/dom.js';
import { configureTheme } from '#theming/config.js';
import { styles as bootstrap } from '../../styles/themes/light/bootstrap.css.js';
import { styles as fluent } from '../../styles/themes/light/fluent.css.js';
import { styles as indigo } from '../../styles/themes/light/indigo.css.js';
import { styles as material } from '../../styles/themes/light/material.css.js';
import IgcButtonComponent from '../button/button.js';
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
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
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

      await clock.tickAsync(1);

      finishAnimationsFor(snackbar);
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
      await snackbar.toggle();
      expect(snackbar.open).to.be.true;
      checkOpenState(true);

      await snackbar.toggle();
      expect(snackbar.open).to.be.false;
      checkOpenState(false);
    });

    describe('display time', () => {
      it('waits while the focus is in the snackbar', async () => {
        const hide = spy(snackbar, 'hide');
        snackbar.actionText = defaultActionText;
        snackbar.displayTime = 400;
        await snackbar.show();

        const action = snackbar.renderRoot.querySelector(
          IgcButtonComponent.tagName
        )!;
        action.focus();
        await clock.tickAsync(800);
        expect(hide).not.called;

        simulatePointerEnter(snackbar);
        simulatePointerLeave(snackbar);
        await clock.tickAsync(800);
        expect(hide).not.called;

        action.blur();
        await clock.tickAsync(399);
        expect(hide).not.called;

        await clock.tickAsync(1);
        expect(hide).calledOnce;
      });

      it('does not wait after a pointer click on the action', async () => {
        const hide = spy(snackbar, 'hide');
        snackbar.actionText = defaultActionText;
        snackbar.displayTime = 400;
        await snackbar.show();

        const action = snackbar.renderRoot.querySelector(
          IgcButtonComponent.tagName
        )!;
        const { x, y, width, height } = action.getBoundingClientRect();
        await sendMouse({
          type: 'click',
          position: [Math.round(x + width / 2), Math.round(y + height / 2)],
        });
        await sendMouse({ type: 'move', position: [0, 0] });
        expect(action.matches(':focus')).to.be.true;

        await clock.tickAsync(400);
        expect(hide).calledOnce;
        await resetMouse();
      });
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

  describe('Styles', () => {
    const globalThemes = [
      ['bootstrap', bootstrap],
      ['material', material],
      ['fluent', fluent],
      ['indigo', indigo],
    ] as const;
    let adopted: CSSStyleSheet[];

    beforeEach(() => {
      adopted = [...document.adoptedStyleSheets];
    });

    afterEach(() => {
      document.adoptedStyleSheets = adopted;
      configureTheme('bootstrap');
    });

    async function focusStyle(button: IgcButtonComponent) {
      button.focus();
      simulateKeyboard(button, tabKey);
      await elementUpdated(button);

      const base = button.renderRoot.querySelector('[part~="base"]')!;
      finishAnimationsFor(base, { subtree: true });

      const { boxShadow, backgroundColor } = getComputedStyle(base);
      const after = getComputedStyle(base, '::after');
      return {
        boxShadow,
        backgroundColor,
        after: `${after.display} ${after.boxShadow}`,
      };
    }

    it('the default action ignores a global flat button background', async () => {
      document.documentElement.style.setProperty(
        '--ig-flat-button-background',
        'rgb(255, 0, 0)'
      );

      try {
        snackbar = await fixture<IgcSnackbarComponent>(
          html`<igc-snackbar action-text="Undo" open
            >Item deleted</igc-snackbar
          >`
        );
        const base = snackbar.renderRoot
          .querySelector(IgcButtonComponent.tagName)!
          .renderRoot.querySelector('[part~="base"]')!;

        expect(getComputedStyle(base).backgroundColor).to.equal(
          'rgba(0, 0, 0, 0)'
        );
      } finally {
        document.documentElement.style.removeProperty(
          '--ig-flat-button-background'
        );
      }
    });

    for (const [theme, { styleSheet }] of globalThemes) {
      it(`the default action keeps the keyboard focus style of a flat button (${theme})`, async () => {
        document.adoptedStyleSheets = [...adopted, styleSheet!];
        configureTheme(theme);

        const container = await fixture<HTMLElement>(html`
          <div>
            <igc-button variant="flat">Flat</igc-button>
            <igc-snackbar action-text="Undo" keep-open open>
              Item deleted
            </igc-snackbar>
          </div>
        `);
        const flat = container.querySelector(IgcButtonComponent.tagName)!;
        snackbar = container.querySelector(IgcSnackbarComponent.tagName)!;
        await elementUpdated(snackbar);
        const action = snackbar.renderRoot.querySelector(
          IgcButtonComponent.tagName
        )!;

        const flatStyle = await focusStyle(flat);
        expect(flatStyle).not.to.eql({
          boxShadow: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          after: 'block none',
        });
        expect(await focusStyle(action)).to.eql(flatStyle);
      });
    }
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

  runAlertTests(IgcSnackbarComponent.tagName);

  runInvokerCommandsTests({
    tagName: IgcSnackbarComponent.tagName,
    commandFor: 'invoker-snackbar',
    template: html`
      <igc-snackbar id="invoker-snackbar" keep-open
        >${defaultContent}</igc-snackbar
      >
    `,
  });
});
