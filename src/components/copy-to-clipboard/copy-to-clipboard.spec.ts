import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  oneEvent,
} from '@open-wc/testing';
import { resetMouse, sendMouse } from '@web/test-runner-commands';
import type { TemplateResult } from 'lit';
import { type SinonFakeTimers, stub, useFakeTimers } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  compareStyles,
  finishAnimationsFor,
} from '#internals/testing/helpers.spec.js';
import { runHostAriaTests } from '#internals/testing/host-aria.spec.js';
import { simulateClick } from '#internals/testing/simulate.spec.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcCopyToClipboardComponent from './copy-to-clipboard.js';

describe('Copy to clipboard', () => {
  before(() => {
    defineComponents(IgcCopyToClipboardComponent);
  });

  let element: IgcCopyToClipboardComponent;
  let copyButton: IgcIconButtonComponent;
  let writeTextStub: ReturnType<typeof stub>;

  function getButton() {
    return element.renderRoot.querySelector<IgcIconButtonComponent>(
      'igc-icon-button'
    )!;
  }

  async function setup(
    template = html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
  ): Promise<void> {
    element = await fixture<IgcCopyToClipboardComponent>(template);
    copyButton = getButton();
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

  /** Sends the `--copy` command from a real invoker button. */
  async function sendCopyCommand(): Promise<void> {
    const invoker = document.createElement('button');
    invoker.command = '--copy';
    invoker.commandForElement = element;
    element.after(invoker);
    invoker.click();
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
    await setup(
      html`<igc-copy-to-clipboard>Sample text</igc-copy-to-clipboard>`
    );

    await expect(element).shadowDom.to.be.accessible();
    await expect(element).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    await setup(html`<igc-copy-to-clipboard></igc-copy-to-clipboard>`);

    expect(element.format).to.equal('plain');
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
    expect(copyButton.tagName.toLowerCase()).to.equal('igc-icon-button');
  });

  it('should have copy button with screen reader label', async () => {
    await setup();
    expect(copyButton.textContent.trim()).to.equal('Copy to clipboard');
  });

  runHostAriaTests({
    tagName: IgcCopyToClipboardComponent.tagName,
    template: html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`,
    getTarget: (host) => host.renderRoot.querySelector('igc-icon-button')!,
  });

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
      await setup(html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`);

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
      await setup(
        html`<igc-copy-to-clipboard>Sample text</igc-copy-to-clipboard>`
      );
    });

    afterEach(async () => {
      await resetMouse();
    });

    it('should keep the copy button enabled while hidden', () => {
      expect(isButtonShown()).to.be.false;
      expect(copyButton).to.not.have.attribute('disabled');
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

    it('should not show copy button when disableInteraction is true', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      await hover();

      expect(isButtonShown()).to.be.false;
      expect(copyButton).to.have.attribute('disabled');
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
  });

  describe('Copy Status', () => {
    let clock: SinonFakeTimers;

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      await setup();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should show the success icon and announce the result', async () => {
      expect(copyButton.part.contains('copy-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('copy_content');
      expect(announcement()).to.equal('');

      await clickCopy();

      expect(copyButton.part.contains('success-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('copy_success');
      expect(announcement()).to.equal(
        'Content copied to clipboard successfully.'
      );
    });

    it('should show the error icon and announce the failure', async () => {
      writeTextStub.rejects(new Error('Permission denied'));

      await clickCopy();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(copyButton.part.contains('error-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('error');
      expect(announcement()).to.equal(
        'Failed to copy content to clipboard. Please try again.'
      );
    });

    it('should keep the button label while the status changes', async () => {
      await clickCopy();

      expect(copyButton.textContent.trim()).to.equal('Copy to clipboard');
    });

    it('should return to the copy icon after the reset delay', async () => {
      await clickCopy();
      expect(copyButton.part.contains('success-button')).to.be.true;

      await clock.tickAsync(1000);
      await elementUpdated(element);

      expect(copyButton.part.contains('copy-button')).to.be.true;
      expect(announcement()).to.equal('');
    });

    it('should restart the reset delay when a copy action repeats', async () => {
      await clickCopy();
      await clock.tickAsync(800);

      await sendCopyCommand();
      await clock.tickAsync(400);
      await elementUpdated(element);

      expect(copyButton.part.contains('success-button')).to.be.true;

      await clock.tickAsync(600);
      await elementUpdated(element);

      expect(copyButton.part.contains('copy-button')).to.be.true;
    });

    it('should return to the copy icon after a reconnect', async () => {
      await clickCopy();
      expect(copyButton.part.contains('success-button')).to.be.true;

      const parent = element.parentElement!;
      element.remove();
      parent.append(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('copy-button')).to.be.true;
      expect(announcement()).to.equal('');
    });

    it('should copy through the --copy command when interaction is disabled', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      await sendCopyCommand();

      expect(writeTextStub).to.have.been.calledOnceWith('Text');
    });

    function isInState(state: 'ig-success' | 'ig-error'): boolean {
      return element.matches(`:state(${state})`);
    }

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
      writeTextStub.rejects(new Error('Permission denied'));
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

      await clock.tickAsync(1000);

      expect(isInState('ig-success')).to.be.false;
    });

    it('should be in the ig-error state after a failed write, until the reset delay ends', async () => {
      writeTextStub.rejects(new Error('Permission denied'));

      await clickCopy();

      expect(isInState('ig-error')).to.be.true;
      expect(isInState('ig-success')).to.be.false;

      await clock.tickAsync(1000);

      expect(isInState('ig-error')).to.be.false;
    });

    it('should switch from the ig-error state to ig-success on the next copy', async () => {
      writeTextStub.rejects(new Error('Permission denied'));
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
      await setup(html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`);

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
