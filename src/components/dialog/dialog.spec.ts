import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import { emulateMedia } from '@web/test-runner-commands';
import { DialogResourceStringsEN, registerI18n } from 'igniteui-i18n-core';
import { DialogResourceStringsBG } from 'igniteui-i18n-resources';
import { spy } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  finishAnimationsFor,
  getAnimationsFor,
  isFocused,
  withDocumentSheets,
} from '#internals/testing/helpers.spec.js';
import { runInvokerCommandsTests } from '#internals/testing/invoker-commands.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import IgcButtonComponent from '../button/button.js';
import IgcDialogComponent from './dialog.js';

describe('Dialog', () => {
  before(() => {
    defineComponents(IgcDialogComponent);
  });

  let dialog: IgcDialogComponent;
  let nativeDialog: HTMLDialogElement;

  describe('WAI-ARIA', () => {
    it('is accessible (closed state)', async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );

      await expect(dialog).dom.to.be.accessible();
      await expect(dialog).shadowDom.to.be.accessible();
    });

    it('is accessible (open state)', async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog open></igc-dialog>`
      );

      await expect(dialog).does.to.not.be.accessible();
      await expect(dialog).shadowDom.to.not.be.accessible();

      dialog.title = 'Default dialog';
      await elementUpdated(dialog);

      await expect(dialog).does.to.be.accessible();
      await expect(dialog).shadowDom.to.be.accessible();
    });

    it('is labelled only by `aria-label` when one is set', async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog aria-label="Keyboard shortcuts" open>
          <h2 slot="title">Keyboard shortcuts</h2>
          <button slot="title">Close</button>
        </igc-dialog>
      `);
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;

      expect(nativeDialog)
        .attribute('aria-label')
        .to.equal('Keyboard shortcuts');
      expect(nativeDialog).not.to.have.attribute('aria-labelledby');
    });
  });

  describe('Localization', () => {
    const defaultAction = () =>
      dialog.renderRoot.querySelector('footer igc-button')!.textContent!.trim();

    before(() => registerI18n(DialogResourceStringsBG, 'bg'));

    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
    });

    it('renders the English default action', () => {
      expect(defaultAction()).to.equal(
        DialogResourceStringsEN.dialog_default_action
      );
    });

    it('renders the default action in its locale', async () => {
      dialog.locale = 'bg';
      await elementUpdated(dialog);

      expect(defaultAction()).to.equal(
        DialogResourceStringsBG.dialog_default_action
      );
    });

    it('takes the default action from `resourceStrings`', async () => {
      dialog.resourceStrings = { dialog_default_action: 'Done' };
      await elementUpdated(dialog);

      expect(defaultAction()).to.equal('Done');
    });
  });

  describe('Host ARIA', () => {
    let container: HTMLElement;

    beforeEach(async () => {
      container = await fixture<HTMLElement>(html`
        <div>
          <span id="dialog-name">Shortcuts</span>
          <span id="dialog-hint">Press a key</span>
          <igc-dialog open>
            <h2 slot="title">Keyboard shortcuts</h2>
          </igc-dialog>
        </div>
      `);
      dialog = container.querySelector('igc-dialog')!;
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    it('prefers `aria-labelledby` over `aria-label` and the title', async () => {
      const titleId = dialog.renderRoot.querySelector('header')!.id;

      dialog.setAttribute('aria-label', 'Custom');
      dialog.setAttribute('aria-labelledby', 'dialog-name');
      await elementUpdated(dialog);

      expect(nativeDialog.ariaLabelledByElements).to.eql([
        container.querySelector('#dialog-name'),
      ]);
      expect(nativeDialog).not.to.have.attribute('aria-label');

      dialog.removeAttribute('aria-labelledby');
      await elementUpdated(dialog);

      expect(nativeDialog).attribute('aria-label').to.equal('Custom');
      expect(nativeDialog).not.to.have.attribute('aria-labelledby');

      dialog.removeAttribute('aria-label');
      await elementUpdated(dialog);

      expect(nativeDialog).attribute('aria-labelledby').to.equal(titleId);
    });

    it('keeps the title as the name with an empty `aria-label`', async () => {
      dialog.setAttribute('aria-label', '');
      await elementUpdated(dialog);

      expect(nativeDialog)
        .attribute('aria-labelledby')
        .to.equal(dialog.renderRoot.querySelector('header')!.id);
    });

    it('is described by the host `aria-describedby`', async () => {
      dialog.setAttribute('aria-describedby', 'dialog-hint');
      await elementUpdated(dialog);

      expect(nativeDialog.ariaDescribedByElements).to.eql([
        container.querySelector('#dialog-hint'),
      ]);
    });
  });

  describe('DOM', () => {
    const attributes = [
      'variant',
      'aria-label',
      'aria-disabled',
      'aria-hidden',
      'aria-labelledby',
      'part',
      'role',
      'id',
      'hidden',
      'open',
      'style',
    ];

    it('should render content inside the dialog', async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog>
          <span>Dialog content</span>
        </igc-dialog>
      `);

      await dialog.show();

      expect(dialog).dom.to.equal(
        `
        <igc-dialog>
          <span>
            Dialog content
          </span>
        </igc-dialog>`,
        { ignoreAttributes: attributes }
      );
    });

    it('`hide-default-action` is correctly applied', async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog hide-default-action>Message</igc-dialog>
      `);

      const footer = dialog.renderRoot.querySelector('footer')!;
      expect(footer).dom.to.equal(
        `<footer>
          <slot name="footer">
          </slot>
        </footer>`,
        {
          ignoreAttributes: ['part'],
        }
      );
    });
  });

  describe('API', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    it('initialized with proper default values', async () => {
      expect(dialog.keepOpenOnEscape).to.equal(false);
      expect(dialog.closeOnOutsideClick).to.equal(false);
      expect(dialog.title).to.be.undefined;
      expect(dialog.open).to.equal(false);
      expect(dialog.returnValue).to.be.undefined;
      expect(nativeDialog.getAttribute('aria-labelledby')).to.equal(
        dialog.renderRoot.querySelector('header')?.id
      );
    });

    it('`show` opens the dialog', async () => {
      await dialog.show();
      expect(dialog.open).to.be.true;
    });

    it('`hide` closes the dialog', async () => {
      dialog.open = true;
      await elementUpdated(dialog);
      expect(dialog.open).to.be.true;

      await dialog.hide();
      expect(dialog.open).to.be.false;
    });

    it('`toggle` switches between open states', async () => {
      await dialog.toggle();
      expect(dialog.open).to.be.true;

      await dialog.toggle();
      expect(dialog.open).to.be.false;
    });

    it('has correct ARIA attributes', async () => {
      dialog.ariaLabel = 'Custom label';
      await dialog.show();

      expect(nativeDialog).attribute('aria-label').to.equal('Custom label');
      expect(nativeDialog).attribute('role').to.equal('dialog');
    });

    it('calling `show/hide` is a no-op for existing state', async () => {
      dialog.open = true;
      await elementUpdated(dialog);
      expect(await dialog.show()).to.be.false;

      dialog.open = false;
      await elementUpdated(dialog);
      expect(await dialog.hide()).to.be.false;
    });

    it('does not emit events through API calls', async () => {
      const eventSpy = spy(dialog, 'emitEvent');

      await dialog.show();
      expect(dialog.open).to.be.true;
      expect(eventSpy.getCalls()).is.empty;

      await dialog.hide();
      expect(dialog.open).to.be.false;
      expect(eventSpy.getCalls()).is.empty;

      dialog.open = false;
      await elementUpdated(dialog);

      expect(dialog.open).to.be.false;
      expect(eventSpy.getCalls()).is.empty;
    });
  });

  describe('Interrupted transitions', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
    });

    it('reopening during the exit animation keeps the dialog open', async () => {
      await dialog.show();

      const closing = dialog.hide();
      const reopening = dialog.show();

      expect(await closing).to.be.false;
      expect(await reopening).to.be.true;
      expect(dialog.open).to.be.true;
    });

    it('does not emit `igcClosed` when the exit animation is interrupted', async () => {
      await dialog.show();

      const eventSpy = spy(dialog, 'emitEvent');

      simulateClick(
        dialog.renderRoot.querySelector(IgcButtonComponent.tagName)!
      );
      expect(await dialog.show()).to.be.true;

      expect(dialog.open).to.be.true;
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.calledWith('igcClosed')).to.be.false;
    });

    it('closes the dialog when a hide follows a show in the same task', async () => {
      const opening = dialog.show();
      const closing = dialog.hide();
      await elementUpdated(dialog);
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await opening).to.be.false;
      expect(await closing).to.be.true;
      expect(dialog.open).to.be.false;
    });
  });

  describe('Events & Behaviors', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog></igc-dialog>`
      );
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    it('should close the dialog when the user presses Escape', async () => {
      const eventSpy = spy(dialog, 'emitEvent');
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(eventSpy.getCalls()).lengthOf(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('should not close the dialog when the user presses Escape and `keepOpenOnEscape` is set', async () => {
      const eventSpy = spy(dialog, 'emitEvent');

      dialog.keepOpenOnEscape = true;
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('cancel'));
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(eventSpy.getCalls()).is.empty;
    });

    it('default action button emits closing events', async () => {
      const eventSpy = spy(dialog, 'emitEvent');
      await dialog.show();

      simulateClick(
        dialog.renderRoot.querySelector(IgcButtonComponent.tagName)!
      );
      await elementUpdated(dialog);
      await waitUntil(() => !dialog.open);

      expect(eventSpy.getCalls()).lengthOf(2);
      expect(eventSpy.firstCall).calledWith('igcClosing');
      expect(eventSpy.secondCall).calledWith('igcClosed');
    });

    it('can cancel `igcClosing` events when clicking outside the dialog area', async () => {
      dialog.closeOnOutsideClick = true;
      await dialog.show();

      const eventSpy = spy(dialog, 'emitEvent');
      dialog.addEventListener('igcClosing', (e) => e.preventDefault(), {
        once: true,
      });

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x - 1, clientY: y - 1 });
      await elementUpdated(dialog);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.calledWith('igcClosed');
    });

    it('does not close the dialog on clicking outside when `closeOnOutsideClick` is not set', async () => {
      await dialog.show();

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x - 1, clientY: y - 1 });
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
    });

    it('does close the dialog on clicking outside when `closeOnOutsideClick` is set', async () => {
      dialog.closeOnOutsideClick = true;
      await dialog.show();

      const eventSpy = spy(dialog, 'emitEvent');

      const { x, y } = dialog.getBoundingClientRect();
      simulateClick(nativeDialog, { clientX: x + 1, clientY: y - 1 });
      await elementUpdated(dialog);

      await waitUntil(() => eventSpy.calledWith('igcClosed'));
      expect(dialog.open).to.be.false;
    });

    it('issue 1983 - does not close the dialog when keepOpenOnEscape is true and a non-cancelable close event is fired', async () => {
      dialog.keepOpenOnEscape = true;
      await dialog.show();

      nativeDialog.dispatchEvent(new Event('close'));
      await elementUpdated(dialog);

      expect(dialog.open).to.be.true;
      expect(nativeDialog.open).to.be.true;
    });

    it('opens the dialog again when it closes while `open` stays true', async () => {
      const opener = await fixture<HTMLButtonElement>(
        html`<button>Open</button>`
      );
      opener.focus();
      await dialog.show();

      // As after a close request that the dialog cannot cancel.
      nativeDialog.close();
      await oneEvent(nativeDialog, 'close');

      expect(dialog.open).to.be.true;
      expect(nativeDialog.open).to.be.true;

      await dialog.hide();
      expect(isFocused(opener)).to.be.true;
    });
  });

  runInvokerCommandsTests({
    tagName: IgcDialogComponent.tagName,
    commandFor: 'invoker-dialog',
    template: html`
      <igc-dialog id="invoker-dialog" title="Invoked dialog"></igc-dialog>
    `,
  });

  describe('Form', () => {
    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(html`
        <igc-dialog>
          <form method="dialog">
            <button value="Done" type="submit">Submit</button>
          </form>
        </igc-dialog>
      `);
    });

    it('closes the dialog when a method="dialog" form is submitted with submitter value', async () => {
      const submitter = dialog.querySelector('button')!;
      await dialog.show();

      submitter.click();
      await elementUpdated(dialog);

      await waitUntil(() => !dialog.open);
      expect(dialog.returnValue).to.equal(submitter.value);

      // No submitter value
      submitter.value = '';
      await dialog.show();

      submitter.click();
      await elementUpdated(dialog);

      await waitUntil(() => !dialog.open);
      expect(dialog.returnValue).to.equal('');
    });
  });

  describe('Backdrop', () => {
    function backdropAnimations(): Animation[] {
      return getAnimationsFor(dialog.shadowRoot!).filter(
        ({ effect }) =>
          (effect as KeyframeEffect).pseudoElement === '::backdrop'
      );
    }

    function finishBackdrop(): CSSStyleDeclaration {
      for (const animation of backdropAnimations()) {
        animation.finish();
      }
      return getComputedStyle(nativeDialog, '::backdrop');
    }

    beforeEach(async () => {
      dialog = await fixture<IgcDialogComponent>(
        html`<igc-dialog style="--backdrop: rgb(1, 2, 3)"></igc-dialog>`
      );
      nativeDialog = dialog.renderRoot.querySelector('dialog')!;
    });

    async function openThroughProperty(): Promise<void> {
      dialog.open = true;
      await elementUpdated(dialog);
    }

    it('paints the native backdrop with the theme color', async () => {
      await openThroughProperty();

      const { backgroundColor, opacity } = finishBackdrop();
      expect(backgroundColor).to.equal('rgb(1, 2, 3)');
      expect(opacity).to.equal('1');
    });

    it('fades the backdrop out while the dialog is still modal', async () => {
      await openThroughProperty();

      const closing = dialog.hide();
      await elementUpdated(dialog);

      expect(finishBackdrop().opacity).to.equal('0');
      expect(nativeDialog.matches(':modal')).to.be.true;

      finishAnimationsFor(dialog.shadowRoot!);
      expect(await closing).to.be.true;
      expect(nativeDialog.open).to.be.false;
    });

    it('shows the backdrop again when a reopen interrupts the exit', async () => {
      await openThroughProperty();

      dialog.hide();
      await elementUpdated(dialog);
      const reopening = dialog.show();
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await reopening).to.be.true;
      expect(finishBackdrop().opacity).to.equal('1');
    });

    it('fades the backdrop out when a hide follows an interrupted exit', async () => {
      await openThroughProperty();

      dialog.hide();
      dialog.show();
      const closing = dialog.hide();
      // The interrupted first exit settles on the next frame.
      await nextFrame();

      expect(finishBackdrop().opacity).to.equal('0');

      finishAnimationsFor(dialog.shadowRoot!);
      expect(await closing).to.be.true;
    });

    /** Sets `open` to `false` and then to `true`, with an update after each, during the exit of `hide()`. */
    async function reopenDuringExit(): Promise<{ closing: Promise<boolean> }> {
      await openThroughProperty();

      const closing = dialog.hide();
      await elementUpdated(dialog);
      dialog.open = false;
      await elementUpdated(dialog);
      await openThroughProperty();
      return { closing };
    }

    it('cancels the exit when `open` is set to `false` and then to `true` during it', async () => {
      const { closing } = await reopenDuringExit();
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await closing).to.be.false;
      expect(dialog.open).to.be.true;
      expect(nativeDialog.matches(':modal')).to.be.true;
      expect(finishBackdrop().opacity).to.equal('1');
    });

    it('cancels the exit when `open` goes to `false` and back to `true` in one task', async () => {
      await openThroughProperty();

      const closing = dialog.hide();
      dialog.open = false;
      dialog.open = true;
      await elementUpdated(dialog);
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await closing).to.be.false;
      expect(dialog.open).to.be.true;
      expect(nativeDialog.matches(':modal')).to.be.true;
      expect(finishBackdrop().opacity).to.equal('1');
    });

    it('closes on a hide right after a direct `open` cancels the exit', async () => {
      const { closing } = await reopenDuringExit();

      const closingAgain = dialog.hide();
      await elementUpdated(dialog);
      // The canceled exit settles on the next frame and leaves this one alone.
      await nextFrame();

      expect(finishBackdrop().opacity).to.equal('0');

      finishAnimationsFor(dialog.shadowRoot!);
      expect(await closing).to.be.false;
      expect(await closingAgain).to.be.true;
      expect(dialog.open).to.be.false;
    });

    it('closes on a hide in the same task as a direct `open = true`', async () => {
      await openThroughProperty();

      const closing = dialog.hide();
      await elementUpdated(dialog);
      dialog.open = false;
      await elementUpdated(dialog);

      dialog.open = true;
      const closingAgain = dialog.hide();
      await elementUpdated(dialog);
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await closing).to.be.false;
      expect(await closingAgain).to.be.true;
      expect(dialog.open).to.be.false;
    });

    it('cancels a zero-duration exit when `open` is set to `false` and then to `true`', async () => {
      await emulateMedia({ reducedMotion: 'reduce' });

      try {
        await openThroughProperty();

        const closing = dialog.hide();
        dialog.open = false;
        dialog.open = true;

        expect(await closing).to.be.false;
        expect(dialog.open).to.be.true;
      } finally {
        await emulateMedia({ reducedMotion: 'no-preference' });
      }
    });

    it('cancels the entrance when `open` is set to `false` during it', async () => {
      const opening = dialog.show();
      await elementUpdated(dialog);
      dialog.open = false;
      const reopening = dialog.show();
      await elementUpdated(dialog);
      finishAnimationsFor(dialog.shadowRoot!);

      expect(await opening).to.be.false;
      expect(await reopening).to.be.true;
      expect(dialog.open).to.be.true;
      expect(nativeDialog.matches(':modal')).to.be.true;
    });

    it('takes the styles of `::part(base)::backdrop`', async () => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(
        'igc-dialog::part(base)::backdrop { background: rgb(4, 5, 6) }'
      );

      await withDocumentSheets([sheet], async () => {
        await openThroughProperty();
        expect(finishBackdrop().backgroundColor).to.equal('rgb(4, 5, 6)');
      });
    });

    it('does not animate the backdrop with reduced motion', async () => {
      await emulateMedia({ reducedMotion: 'reduce' });

      try {
        await dialog.show();

        expect(backdropAnimations()).to.be.empty;
        expect(finishBackdrop().opacity).to.equal('1');
      } finally {
        await emulateMedia({ reducedMotion: 'no-preference' });
      }
    });
  });
});
