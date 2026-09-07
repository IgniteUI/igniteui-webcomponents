import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { type SinonFakeTimers, stub, useFakeTimers } from 'sinon';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  simulateClick,
  simulatePointerEnter,
  simulatePointerLeave,
} from '#internals/testing/simulate.spec.js';
import IgcCopyToClipboardComponent from './copy-to-clipboard.js';

describe('Copy to clipboard', () => {
  before(() => {
    defineComponents(IgcCopyToClipboardComponent);
  });

  let element: IgcCopyToClipboardComponent;
  let copyButton: HTMLElement;
  let writeTextStub: ReturnType<typeof stub>;

  function getButton() {
    return element.renderRoot.querySelector('igc-icon-button') as HTMLElement;
  }

  function getLiveRegion() {
    return element.renderRoot.querySelector('[role="status"]') as HTMLElement;
  }

  /** Clicks the copy button and waits for the clipboard write to settle. */
  async function clickCopy() {
    simulateClick(getButton());
    await nextFrame();
  }

  /** Renders `template`, copies its content and returns the text written to the clipboard. */
  async function copy(template: ReturnType<typeof html>) {
    element = await fixture<IgcCopyToClipboardComponent>(template);
    await clickCopy();
    return writeTextStub.firstCall.args[0] as string;
  }

  function dispatchCopyCommand() {
    element.dispatchEvent(
      Object.assign(new Event('command'), { command: '--copy' })
    );
  }

  beforeEach(() => {
    writeTextStub = stub(navigator.clipboard, 'writeText').resolves();
  });

  afterEach(() => {
    writeTextStub.restore();
  });

  it('passes the a11y audit', async () => {
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard>Sample text</igc-copy-to-clipboard>`
    );

    await expect(element).shadowDom.to.be.accessible();
    await expect(element).to.be.accessible();
  });

  it('should initialize with default values', async () => {
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard></igc-copy-to-clipboard>`
    );

    expect(element.format).to.equal('plain');
    expect(element).dom.to.equal(
      '<igc-copy-to-clipboard format="plain"></igc-copy-to-clipboard>'
    );
  });

  it('should render content inside default slot', async () => {
    const content = 'Text to copy';
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard>${content}</igc-copy-to-clipboard>`
    );

    expect(element).dom.to.have.text(content);
  });

  it('should render copy button in shadow DOM', async () => {
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
    );

    copyButton = getButton();
    expect(copyButton).to.exist;
    expect(copyButton.tagName.toLowerCase()).to.equal('igc-icon-button');
  });

  it('should have copy button with screen reader label', async () => {
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
    );

    copyButton = getButton();
    expect(copyButton.textContent.trim()).to.equal(
      'Copy content to clipboard. Click to copy.'
    );
  });

  describe('User Interaction', () => {
    beforeEach(async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Sample text</igc-copy-to-clipboard>`
      );
      copyButton = getButton();
    });

    it('should keep the copy button enabled while hidden', () => {
      expect(copyButton.part.contains('visible')).to.be.false;
      expect(copyButton).to.not.have.attribute('disabled');
    });

    it('should show copy button on pointer enter', async () => {
      simulatePointerEnter(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.true;
    });

    it('should hide copy button on pointer leave', async () => {
      simulatePointerEnter(element);
      await elementUpdated(element);
      expect(copyButton.part.contains('visible')).to.be.true;

      simulatePointerLeave(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
    });

    it('should show copy button on focus', async () => {
      element.dispatchEvent(new FocusEvent('focusin'));
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.true;
    });

    it('should hide copy button on blur', async () => {
      element.dispatchEvent(new FocusEvent('focusin'));
      await elementUpdated(element);
      expect(copyButton.part.contains('visible')).to.be.true;

      element.dispatchEvent(new FocusEvent('focusout'));
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
    });

    it('should hide copy button when disableInteraction is set while hovered', async () => {
      simulatePointerEnter(element);
      await elementUpdated(element);
      expect(copyButton.part.contains('visible')).to.be.true;

      element.disableInteraction = true;
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
    });

    it('should not show copy button when disableInteraction is true', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      simulatePointerEnter(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
      expect(copyButton).to.have.attribute('disabled');

      element.dispatchEvent(new FocusEvent('focusin'));
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
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
      const copied = await copy(
        html`<igc-copy-to-clipboard>
          Text with multiple spaces and indentation
        </igc-copy-to-clipboard>`
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
      const copied = await copy(
        html`<igc-copy-to-clipboard> </igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('');
    });
  });

  describe('Copy Status', () => {
    let clock: SinonFakeTimers;

    beforeEach(async () => {
      clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
      );
      copyButton = getButton();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should show the success icon and announce the result', async () => {
      expect(copyButton.part.contains('copy-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('copy_content');
      expect(getLiveRegion().textContent.trim()).to.equal('');

      await clickCopy();

      expect(copyButton.part.contains('success-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('copy_success');
      expect(getLiveRegion().textContent.trim()).to.equal(
        'Content copied to clipboard successfully.'
      );
    });

    it('should show the error icon and announce the failure', async () => {
      writeTextStub.rejects(new Error('Permission denied'));

      await clickCopy();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(copyButton.part.contains('error-button')).to.be.true;
      expect(copyButton.getAttribute('name')).to.equal('error');
      expect(getLiveRegion().textContent.trim()).to.equal(
        'Failed to copy content to clipboard. Please try again.'
      );
    });

    it('should keep the button label while the status changes', async () => {
      await clickCopy();

      expect(copyButton.textContent.trim()).to.equal(
        'Copy content to clipboard. Click to copy.'
      );
    });

    it('should return to the copy icon after the reset delay', async () => {
      await clickCopy();
      expect(copyButton.part.contains('success-button')).to.be.true;

      await clock.tickAsync(1000);
      await elementUpdated(element);

      expect(copyButton.part.contains('copy-button')).to.be.true;
      expect(getLiveRegion().textContent.trim()).to.equal('');
    });

    it('should restart the reset delay when a copy action repeats', async () => {
      await clickCopy();
      await clock.tickAsync(800);

      dispatchCopyCommand();
      await nextFrame();
      await clock.tickAsync(400);
      await elementUpdated(element);

      expect(copyButton.part.contains('success-button')).to.be.true;

      await clock.tickAsync(600);
      await elementUpdated(element);

      expect(copyButton.part.contains('copy-button')).to.be.true;
    });

    it('should copy through the --copy command when interaction is disabled', async () => {
      element.disableInteraction = true;
      await elementUpdated(element);

      dispatchCopyCommand();
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnceWith('Text');
    });
  });

  describe('Custom Icon Slot', () => {
    it('should support custom copy icon', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          Text
          <svg slot="copy-icon" width="16" height="16">
            <circle cx="8" cy="8" r="8" />
          </svg>
        </igc-copy-to-clipboard>`
      );

      copyButton = getButton();
      const slot = copyButton.querySelector('slot[name="copy-icon"]');
      expect(slot).to.exist;

      const assignedNodes = (slot as HTMLSlotElement).assignedElements();
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
      const copied = await copy(
        html`<igc-copy-to-clipboard>Text with spaces</igc-copy-to-clipboard>`
      );

      expect(copied).to.equal('Text with spaces');
    });

    it('should collapse tabs to single space', async () => {
      const copied = await copy(
        html`<igc-copy-to-clipboard>Text with tabs</igc-copy-to-clipboard>`
      );

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
      const copied = await copy(
        html`<igc-copy-to-clipboard> Trimmed content </igc-copy-to-clipboard>`
      );

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
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
      );

      expect(element.format).to.equal('plain');
      expect(element.getAttribute('format')).to.equal('plain');
    });

    it('can be set to preserve via attribute', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
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
