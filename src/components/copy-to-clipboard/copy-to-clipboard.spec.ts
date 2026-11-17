import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import {
  CopyToClipboardResourceStringsEN,
  registerI18n,
} from 'igniteui-i18n-core';
import { CopyToClipboardResourceStringsBG } from 'igniteui-i18n-resources';
import type { TemplateResult } from 'lit';
import { type SinonFakeTimers, spy, stub, useFakeTimers } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import { runFocusBeforeRenderTests } from '#internals/testing/focus-before-render.spec.js';
import {
  clickWithMouse,
  compareStyles,
  finishAnimationsFor,
} from '#internals/testing/helpers.spec.js';
import { runHostAriaTests } from '#internals/testing/host-aria.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import IgcButtonComponent from '../button/button.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcCopyToClipboardComponent from './copy-to-clipboard.js';

const {
  copy_to_clipboard_label: LABEL,
  copy_to_clipboard_success: SUCCESS_MESSAGE,
  copy_to_clipboard_error: ERROR_MESSAGE,
} = CopyToClipboardResourceStringsEN;

/** The delays of the component, in milliseconds. */
const ANNOUNCE_DELAY = 100;
const RESET_DELAY = 1000;

describe('Copy to clipboard', () => {
  before(() => {
    defineComponents(IgcCopyToClipboardComponent, IgcButtonComponent);
  });

  const template = html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`;

  let element: IgcCopyToClipboardComponent;
  let copyButton: IgcIconButtonComponent;
  let writeTextStub: ReturnType<typeof stub>;
  let clock: SinonFakeTimers;

  function getButton() {
    return element.renderRoot.querySelector<IgcIconButtonComponent>(
      'igc-icon-button'
    )!;
  }

  async function setup(content = template): Promise<void> {
    element = await fixture<IgcCopyToClipboardComponent>(content);
    copyButton = getButton();
  }

  /** Fakes the timers of the component in the calling `describe`. */
  function useFakeClock(): void {
    beforeEach(() => {
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      clock.restore();
    });
  }

  /** Waits on the fake clock until the live region gets the result. */
  async function waitForAnnouncement(): Promise<void> {
    await clock.tickAsync(ANNOUNCE_DELAY);
    await elementUpdated(element);
  }

  function iconName(): string | null {
    return copyButton.getAttribute('name');
  }

  function isInState(state: 'ig-success' | 'ig-error'): boolean {
    return element.matches(`:state(${state})`);
  }

  /** Whether the copy button is shown, after its fade transition ends. */
  function isButtonShown(): boolean {
    finishAnimationsFor(copyButton);
    return (
      copyButton.checkVisibility({ opacityProperty: true }) &&
      compareStyles(copyButton, { pointerEvents: 'auto' })
    );
  }

  async function hover(): Promise<void> {
    const { x, y } = getCenterPoint(element);
    await sendMouse({ type: 'move', position: [Math.round(x), Math.round(y)] });
  }

  function getLiveRegion() {
    return element.renderRoot.querySelector('[role="status"]')!;
  }

  function announcement(): string {
    return getLiveRegion().textContent.trim();
  }

  /** Clicks the copy button and waits for the clipboard write to settle. */
  async function clickCopy(): Promise<void> {
    simulateClick(copyButton);
    await nextFrame();
  }

  /** Renders `template`, copies its content and returns the copied text. */
  async function copy(template: TemplateResult): Promise<string> {
    await setup(template);
    simulateClick(copyButton);
    return writeTextStub.firstCall.args[0];
  }

  /**
   * Copies `text` from a `<pre>`, where `innerText` keeps its whitespace. Pass
   * it as a JS string: the formatter collapses whitespace in templates.
   */
  function copyPreformatted(text: string): Promise<string> {
    return copy(
      html`<igc-copy-to-clipboard><pre>${text}</pre></igc-copy-to-clipboard>`
    );
  }

  /** Sends `command` from a real invoker button. */
  async function sendCopyCommand(command = '--copy'): Promise<void> {
    const invoker = document.createElement('button');
    invoker.command = command;
    invoker.commandForElement = element;
    element.after(invoker);
    simulateClick(invoker);
    invoker.remove();
    await nextFrame();
  }

  beforeEach(() => {
    writeTextStub = stub(navigator.clipboard, 'writeText').resolves();
  });

  afterEach(() => {
    writeTextStub.restore();
  });

  it('passes the a11y audit', async () => {
    await setup();

    await expect(element).shadowDom.to.be.accessible();
    await expect(element).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    await setup(html`<igc-copy-to-clipboard></igc-copy-to-clipboard>`);

    expect(element).dom.to.equal(
      '<igc-copy-to-clipboard></igc-copy-to-clipboard>'
    );
  });

  it('should render content inside default slot', async () => {
    const content = 'Text to copy';
    await setup(
      html`<igc-copy-to-clipboard>${content}</igc-copy-to-clipboard>`
    );

    expect(element).dom.to.have.text(content);
  });

  it('should render copy button in shadow DOM', async () => {
    await setup();
    expect(copyButton).to.exist;
  });

  it('should have copy button with screen reader label', async () => {
    await setup();
    expect(copyButton.textContent.trim()).to.equal(LABEL);
  });

  runHostAriaTests({
    tagName: IgcCopyToClipboardComponent.tagName,
    template,
    getTarget: (host) => host.renderRoot.querySelector('igc-icon-button')!,
  });

  runFocusBeforeRenderTests(template);

  describe('Accessibility', () => {
    it('should name the native copy button by the host aria-label', async () => {
      await setup(
        html`<igc-copy-to-clipboard aria-label="Copy the install command"
          >npm install</igc-copy-to-clipboard
        >`
      );
      await elementUpdated(copyButton);

      expect(
        copyButton.renderRoot
          .querySelector('button')!
          .getAttribute('aria-label')
      ).to.equal('Copy the install command');
    });

    it('should name the native copy button by the host aria-labelledby', async () => {
      const container = await fixture<HTMLElement>(
        html`<div>
          <span id="copy-name">Copy the install command</span>
          <igc-copy-to-clipboard aria-labelledby="copy-name"
            >npm install</igc-copy-to-clipboard
          >
        </div>`
      );
      element = container.querySelector(IgcCopyToClipboardComponent.tagName)!;
      copyButton = getButton();
      await elementUpdated(copyButton);

      expect(
        copyButton.renderRoot.querySelector('button')!.ariaLabelledByElements
      ).to.eql([container.querySelector('#copy-name')]);
    });

    it('should expose the live region as a status without an explicit aria-live', async () => {
      await setup();

      expect(getLiveRegion()).to.not.have.attribute('aria-live');
    });

    it('passes the a11y audit when interaction is disabled', async () => {
      await setup(
        html`<igc-copy-to-clipboard disable-interaction
          >Sample text</igc-copy-to-clipboard
        >`
      );

      await expect(element).shadowDom.to.be.accessible();
      await expect(element).to.be.accessible();
    });
  });

  describe('User Interaction', () => {
    beforeEach(async () => {
      await setup();
    });

    afterEach(async () => {
      await resetMouse();
    });

    it('should keep the copy button in the page while it is not shown', () => {
      expect(isButtonShown()).to.be.false;
      expect(copyButton).to.not.have.attribute('hidden');
    });

    it('should show copy button on pointer enter', async () => {
      await hover();

      expect(isButtonShown()).to.be.true;
    });

    it('should hide copy button on pointer leave', async () => {
      await hover();
      expect(isButtonShown()).to.be.true;

      await resetMouse();

      expect(isButtonShown()).to.be.false;
    });

    it('should show copy button on focus', () => {
      copyButton.focus();

      expect(isButtonShown()).to.be.true;
    });

    it('should hide copy button on blur', () => {
      copyButton.focus();
      expect(isButtonShown()).to.be.true;

      copyButton.blur();

      expect(isButtonShown()).to.be.false;
    });

    it('should keep the focused copy button shown when the pointer leaves', async () => {
      copyButton.focus();
      await hover();
      await resetMouse();

      expect(isButtonShown()).to.be.true;
    });

    it('should hide copy button when disableInteraction is set while hovered', async () => {
      await hover();
      expect(isButtonShown()).to.be.true;

      element.disableInteraction = true;
      await elementUpdated(element);

      expect(isButtonShown()).to.be.false;
      expect(copyButton).to.have.attribute('hidden');
    });

    it('should not move the focus to the copy button on a click in the content', async () => {
      await clickWithMouse(element);

      expect(element.matches(':focus-within')).to.be.false;
    });

    it('should focus the copy button through focus() and blur it through blur()', () => {
      element.focus();

      expect(element.shadowRoot!.activeElement).to.equal(copyButton);
      expect(isButtonShown()).to.be.true;

      element.blur();

      expect(element.matches(':focus-within')).to.be.false;
    });

    it('should focus the copy button right after disableInteraction is turned off', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      element.disableInteraction = false;
      element.focus();

      expect(element.shadowRoot!.activeElement).to.equal(copyButton);
    });

    it('should focus the copy button when the host has autofocus', async () => {
      await setup(
        html`<igc-copy-to-clipboard autofocus>Text</igc-copy-to-clipboard>`
      );
      await elementUpdated(copyButton);

      expect(element.shadowRoot!.activeElement).to.equal(copyButton);
    });

    it('should not take the focus through focus() when disableInteraction is true', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      element.focus();

      expect(element.matches(':focus-within')).to.be.false;
    });

    it('should not show copy button when disableInteraction is true', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      await hover();

      expect(isButtonShown()).to.be.false;
      expect(copyButton).to.have.attribute('hidden');

      copyButton.focus();

      expect(isButtonShown()).to.be.false;
    });
  });

  describe('Copy Functionality', () => {
    it('should copy simple text content', async () => {
      const text = 'Simple text to copy';
      const copied = await copy(
        html`<igc-copy-to-clipboard>${text}</igc-copy-to-clipboard>`
      );

      expect(writeTextStub).to.have.been.calledOnce;
      expect(copied).to.equal(text);
    });

    it('should copy text with normalized whitespace', async () => {
      const copied = await copyPreformatted(
        '\n    Text  with   multiple    spaces and indentation\n  '
      );

      expect(copied).to.equal('Text with multiple spaces and indentation');
    });

    it('should strip excessive whitespace from multi-line content', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <pre>
Line 1


Line 2</pre>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('Line 1\nLine 2');
    });

    it('should separate adjacent block elements in plain format', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard
          ><p>First</p>
          <p>Second</p>
          <ul>
            <li>a</li>
            <li>b</li>
          </ul></igc-copy-to-clipboard
        >`
      );

      expect(copied).to.equal('First\nSecond\na\nb');
    });

    it('should not copy text of hidden elements', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <p>Visible</p>
          <p hidden>Hidden</p>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('Visible');
    });

    it('should copy content from nested elements', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <div>First line</div>
          <div>Second line</div>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('First line\nSecond line');
    });

    it('should handle empty content', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard></igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('');
    });

    it('should handle content with only whitespace', async () => {
      const copied = await copyPreformatted(' \t\n  \t ');

      expect(copied).to.equal('');
    });

    it('should copy nothing and emit the error status when the component is not rendered', async () => {
      await setup(
        html`<igc-copy-to-clipboard hidden>
          <span slot="copy-icon">Icon</span>
          <p>Visible</p>
          <p hidden>Secret</p>
        </igc-copy-to-clipboard>`
      );
      const event = oneEvent(element, 'igcCopy');

      await sendCopyCommand();

      expect((await event).detail).to.eql({ status: 'error', text: '' });
      expect(writeTextStub).to.not.have.been.called;
    });

    it('should emit the error status when the Clipboard API is not available', async () => {
      await setup();
      const clipboard = stub(navigator, 'clipboard').value(undefined);

      try {
        const event = oneEvent(element, 'igcCopy');
        simulateClick(copyButton);

        expect((await event).detail).to.eql({ status: 'error', text: 'Text' });
        expect(isInState('ig-error')).to.be.true;
      } finally {
        clipboard.restore();
      }
    });

    it('should copy through an igc-button invoker', async () => {
      const container = await fixture<HTMLElement>(
        html`<div>
          <igc-copy-to-clipboard id="snippet" disable-interaction
            >Text</igc-copy-to-clipboard
          >
          <igc-button command="--copy" commandfor="snippet">Copy</igc-button>
        </div>`
      );
      element = container.querySelector(IgcCopyToClipboardComponent.tagName)!;

      container.querySelector(IgcButtonComponent.tagName)!.click();
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnceWith('Text');
    });

    it('should copy the content through copy() before the first render', async () => {
      const container = await fixture<HTMLElement>(html`<div></div>`);
      element = document.createElement(IgcCopyToClipboardComponent.tagName);
      element.append('Text');
      container.append(element);

      expect(await element.copy()).to.eql({ status: 'success', text: 'Text' });
      expect(writeTextStub).to.have.been.calledOnceWith('Text');
    });

    it('should copy nothing and emit the error status when the component is invisible', async () => {
      await setup(
        html`<igc-copy-to-clipboard style="visibility: hidden"
          >Text</igc-copy-to-clipboard
        >`
      );
      const event = oneEvent(element, 'igcCopy');

      await sendCopyCommand();

      expect((await event).detail).to.eql({ status: 'error', text: '' });
      expect(writeTextStub).to.not.have.been.called;
    });
  });

  describe('Copy Status', () => {
    useFakeClock();

    beforeEach(async () => {
      await setup();
    });

    it('should show the success icon and announce the result', async () => {
      expect(iconName()).to.equal('copy_content');
      expect(announcement()).to.equal('');

      await clickCopy();

      expect(iconName()).to.equal('copy_success');

      await waitForAnnouncement();

      expect(announcement()).to.equal(SUCCESS_MESSAGE);
    });

    it('should show the error icon and announce the failure', async () => {
      writeTextStub.rejects();

      await clickCopy();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(iconName()).to.equal('error');

      await waitForAnnouncement();

      expect(announcement()).to.equal(ERROR_MESSAGE);
    });

    it('should have only the button part in each status', async () => {
      expect(copyButton.part.value).to.equal('button');

      await clickCopy();
      expect(copyButton.part.value).to.equal('button');

      writeTextStub.rejects();
      await clickCopy();
      expect(copyButton.part.value).to.equal('button');
    });

    it('should clear the live region and announce an equal result again', async () => {
      writeTextStub.rejects();
      await clickCopy();
      await waitForAnnouncement();
      expect(announcement()).to.equal(ERROR_MESSAGE);

      await clickCopy();

      expect(announcement()).to.equal('');

      await waitForAnnouncement();

      expect(announcement()).to.equal(ERROR_MESSAGE);
    });

    it('should keep the button label while the status changes', async () => {
      await clickCopy();

      expect(copyButton.textContent.trim()).to.equal(LABEL);
    });

    it('should return to the copy icon and clear the live region after the reset delay', async () => {
      await clickCopy();
      await waitForAnnouncement();
      expect(iconName()).to.equal('copy_success');
      expect(announcement()).to.equal(SUCCESS_MESSAGE);

      await clock.tickAsync(RESET_DELAY);
      await elementUpdated(element);

      expect(iconName()).to.equal('copy_content');
      expect(announcement()).to.equal('');
    });

    it('should restart the reset delay when a copy action repeats', async () => {
      await clickCopy();
      await clock.tickAsync(800);

      await sendCopyCommand();
      await clock.tickAsync(400);
      await elementUpdated(element);

      expect(iconName()).to.equal('copy_success');

      await clock.tickAsync(600);
      await elementUpdated(element);

      expect(iconName()).to.equal('copy_content');
    });

    it('should return to the copy icon after a reconnect', async () => {
      await clickCopy();
      await waitForAnnouncement();
      expect(iconName()).to.equal('copy_success');

      const parent = element.parentElement!;
      element.remove();
      parent.append(element);
      await elementUpdated(element);

      expect(iconName()).to.equal('copy_content');
      expect(announcement()).to.equal('');
    });

    it('should ignore other commands', async () => {
      await sendCopyCommand('--show');

      expect(writeTextStub).to.not.have.been.called;
    });

    it('should copy through the --copy command when interaction is disabled', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      await sendCopyCommand();

      expect(writeTextStub).to.have.been.calledOnceWith('Text');
    });

    it('should emit igcCopy with the success status and the copied text', async () => {
      const event = oneEvent(document, 'igcCopy');
      simulateClick(copyButton);

      const { detail, target, composed, cancelable } = await event;

      expect(target).to.equal(element);
      expect(detail).to.eql({ status: 'success', text: 'Text' });
      expect(composed).to.be.true;
      expect(cancelable).to.be.false;
    });

    it('should emit igcCopy with the error status and the text when the write fails', async () => {
      writeTextStub.rejects();
      const event = oneEvent(element, 'igcCopy');
      simulateClick(copyButton);

      const { detail } = await event;

      expect(detail).to.eql({ status: 'error', text: 'Text' });
    });

    it('should emit igcCopy for the --copy command when interaction is disabled', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);
      const event = oneEvent(element, 'igcCopy');

      await sendCopyCommand();

      expect((await event).detail).to.eql({ status: 'success', text: 'Text' });
    });

    it('should be in the ig-success state when igcCopy fires, until the reset delay ends', async () => {
      let inStateOnEvent = false;
      element.addEventListener(
        'igcCopy',
        () => (inStateOnEvent = isInState('ig-success')),
        { once: true }
      );
      expect(isInState('ig-success')).to.be.false;

      await clickCopy();

      expect(inStateOnEvent).to.be.true;
      expect(isInState('ig-error')).to.be.false;

      await clock.tickAsync(RESET_DELAY);

      expect(isInState('ig-success')).to.be.false;
    });

    it('should be in the ig-error state after a failed write, until the reset delay ends', async () => {
      writeTextStub.rejects();

      await clickCopy();

      expect(isInState('ig-error')).to.be.true;
      expect(isInState('ig-success')).to.be.false;

      await clock.tickAsync(RESET_DELAY);

      expect(isInState('ig-error')).to.be.false;
    });

    it('should switch from the ig-error state to ig-success on the next copy', async () => {
      writeTextStub.rejects();
      await clickCopy();
      expect(isInState('ig-error')).to.be.true;

      writeTextStub.resolves();
      await clickCopy();

      expect(isInState('ig-success')).to.be.true;
      expect(isInState('ig-error')).to.be.false;
    });

    it('should leave the result state on disconnect', async () => {
      await clickCopy();
      expect(isInState('ig-success')).to.be.true;

      element.remove();

      expect(isInState('ig-success')).to.be.false;
    });

    it('should change nothing when the component disconnects during the write', async () => {
      let resolveWrite!: () => void;
      writeTextStub.returns(
        new Promise<void>((resolve) => (resolveWrite = resolve))
      );
      const listener = spy();
      element.addEventListener('igcCopy', listener);

      simulateClick(copyButton);
      element.remove();
      resolveWrite();
      await nextFrame();

      expect(isInState('ig-success')).to.be.false;
      expect(listener).to.not.have.been.called;
      expect(clock.countTimers()).to.equal(0);
    });

    it('should keep the status of the latest copy action and emit igcCopy for each', async () => {
      let rejectFirst!: (reason: Error) => void;
      writeTextStub
        .onFirstCall()
        .returns(new Promise<void>((_, reject) => (rejectFirst = reject)));
      const listener = spy();
      element.addEventListener('igcCopy', listener);

      simulateClick(copyButton);
      await clickCopy();
      expect(isInState('ig-success')).to.be.true;

      rejectFirst(new Error('Permission denied'));
      await nextFrame();

      expect(isInState('ig-success')).to.be.true;
      expect(isInState('ig-error')).to.be.false;
      expect(
        listener.getCalls().map((call) => call.args[0].detail.status)
      ).to.eql(['success', 'error']);
    });

    it('should emit igcCopy for a click that a copy() call overtakes', async () => {
      let resolveFirst!: () => void;
      writeTextStub
        .onFirstCall()
        .returns(new Promise<void>((resolve) => (resolveFirst = resolve)));
      const listener = spy();
      element.addEventListener('igcCopy', listener);

      simulateClick(copyButton);
      await element.copy();
      resolveFirst();
      await nextFrame();

      expect(listener).to.have.been.calledOnce;
      expect(isInState('ig-success')).to.be.true;
    });

    it('should show the result and emit igcCopy when the component moves during the write', async () => {
      let resolveWrite!: () => void;
      writeTextStub.returns(
        new Promise<void>((resolve) => (resolveWrite = resolve))
      );
      const listener = spy();
      element.addEventListener('igcCopy', listener);

      simulateClick(copyButton);
      const parent = element.parentElement!;
      element.remove();
      parent.append(element);
      resolveWrite();
      await nextFrame();

      expect(isInState('ig-success')).to.be.true;
      expect(listener).to.have.been.calledOnce;
    });

    it('should set no status and start no timer for copy() on a disconnected component', async () => {
      element.remove();

      expect(await element.copy()).to.eql({ status: 'error', text: '' });
      expect(isInState('ig-error')).to.be.false;
      expect(clock.countTimers()).to.equal(0);
    });

    it('should copy through copy() and show the status, without igcCopy', async () => {
      const listener = spy();
      element.addEventListener('igcCopy', listener);

      const result = await element.copy();
      await waitForAnnouncement();

      expect(result).to.eql({ status: 'success', text: 'Text' });
      expect(isInState('ig-success')).to.be.true;
      expect(announcement()).to.equal(SUCCESS_MESSAGE);
      expect(listener).to.not.have.been.called;
    });

    it('should resolve copy() with the error status when the write fails', async () => {
      writeTextStub.rejects();

      expect(await element.copy()).to.eql({ status: 'error', text: 'Text' });
      expect(isInState('ig-error')).to.be.true;
    });

    it('should not copy a custom icon while a status change waits for its render', async () => {
      await setup(
        html`<igc-copy-to-clipboard>
          <span slot="success-icon">Done!</span>
          <p>Body</p>
        </igc-copy-to-clipboard>`
      );
      await clickCopy();

      // The status returns to copy, and the success icon still shows.
      clock.tick(RESET_DELAY);
      element.copy();

      expect(writeTextStub.secondCall.args[0]).to.equal('Body');
    });
  });

  describe('Localization', () => {
    before(() => registerI18n(CopyToClipboardResourceStringsBG, 'bg'));

    useFakeClock();

    it('should name the button and announce the result in its locale', async () => {
      await setup(
        html`<igc-copy-to-clipboard locale="bg">Text</igc-copy-to-clipboard>`
      );

      expect(copyButton.textContent.trim()).to.equal(
        CopyToClipboardResourceStringsBG.copy_to_clipboard_label
      );

      await clickCopy();
      await waitForAnnouncement();

      expect(announcement()).to.equal(
        CopyToClipboardResourceStringsBG.copy_to_clipboard_success
      );
    });

    it('should take the strings from resourceStrings', async () => {
      await setup();

      element.resourceStrings = {
        copy_to_clipboard_label: 'Kopieren',
        copy_to_clipboard_error: 'Fehler',
      };
      writeTextStub.rejects();
      await clickCopy();
      await waitForAnnouncement();

      expect(copyButton.textContent.trim()).to.equal('Kopieren');
      expect(announcement()).to.equal('Fehler');
    });
  });

  describe('Custom Icon Slot', () => {
    it('should support custom copy icon', async () => {
      await setup(
        html`<igc-copy-to-clipboard>
          Text
          <svg slot="copy-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
        </igc-copy-to-clipboard>`
      );
      const slot = copyButton.querySelector<HTMLSlotElement>(
        'slot[name="copy-icon"]'
      );
      expect(slot).to.exist;

      const assignedNodes = slot!.assignedElements();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].tagName.toLowerCase()).to.equal('svg');
      expect(copyButton).to.not.have.attribute('name');
    });

    it('should not copy the content of the icon slots', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <span slot="copy-icon">Copy!</span>
          <p>Body</p>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('Body');
    });

    it('should not copy the content of the icon slots in preserve format', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard format="preserve">
          <span slot="copy-icon">Copy!</span>
          <p>First</p>
          <p>Second</p>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('First\n\nSecond');
    });

    it('should not copy the success icon while it shows', async () => {
      await setup(
        html`<igc-copy-to-clipboard>
          <span slot="success-icon">Done!</span>
          <p>Body</p>
        </igc-copy-to-clipboard>`
      );

      await clickCopy();
      await clickCopy();

      expect(writeTextStub.secondCall.args[0]).to.equal('Body');
    });

    it('should not copy the error icon while it shows', async () => {
      await setup(
        html`<igc-copy-to-clipboard>
          <span slot="error-icon">Failed!</span>
          <p>Body</p>
        </igc-copy-to-clipboard>`
      );
      writeTextStub.rejects();

      await clickCopy();
      await clickCopy();

      expect(writeTextStub.secondCall.args[0]).to.equal('Body');
    });
  });

  describe('Whitespace Normalization', () => {
    it('should collapse multiple spaces to single space', async () => {
      const copied = await copyPreformatted('Text   with    spaces');

      expect(copied).to.equal('Text with spaces');
    });

    it('should collapse tabs to single space', async () => {
      const copied = await copyPreformatted('Text\twith\t\ttabs');

      expect(copied).to.equal('Text with tabs');
    });

    it('should collapse non-breaking spaces to single space', async () => {
      const nbsp = String.fromCodePoint(0xa0);
      const copied = await copyPreformatted(`Text${nbsp.repeat(3)}with${nbsp}`);

      expect(copied).to.equal('Text with');
    });

    it('should preserve single newlines', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <pre>
Line 1
Line 2
Line 3</pre>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('Line 1\nLine 2\nLine 3');
    });

    it('should trim leading and trailing whitespace', async () => {
      const copied = await copyPreformatted('  \t Trimmed content \t  ');

      expect(copied).to.equal('Trimmed content');
    });

    it('should handle mixed whitespace scenarios', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <pre>
First    line   with   spaces


Second		line	with	tabs

Third line</pre>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal(
        'First line with spaces\nSecond line with tabs\nThird line'
      );
    });
  });

  describe('Copy Format', () => {
    it('should default to plain format', async () => {
      await setup();

      expect(element.format).to.equal('plain');
      expect(element).to.not.have.attribute('format');
    });

    it('can be set to preserve via attribute', async () => {
      await setup(
        html`<igc-copy-to-clipboard format="preserve"
          >Text</igc-copy-to-clipboard
        >`
      );

      expect(element.format).to.equal('preserve');
    });

    it('plain format collapses whitespace', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('First paragraph\nSecond paragraph');
    });

    it('preserve format retains paragraph structure', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard format="preserve">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('First paragraph\n\nSecond paragraph');
    });

    it('preserve format retains code block indentation', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard format="preserve">
          <pre>
  function hello() {
    return 1;
  }</pre>
        </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('  function hello() {\n    return 1;\n  }');
    });
  });
});
