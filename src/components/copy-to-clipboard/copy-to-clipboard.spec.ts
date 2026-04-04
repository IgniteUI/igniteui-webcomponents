import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';
import { stub } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  simulateClick,
  simulatePointerEnter,
  simulatePointerLeave,
} from '../common/utils.spec.js';
import IgcCopyToClipboardComponent from './copy-to-clipboard.js';

describe('Copy Content', () => {
  before(() => {
    defineComponents(IgcCopyToClipboardComponent);
  });

  let element: IgcCopyToClipboardComponent;
  let copyButton: HTMLElement;
  let writeTextStub: ReturnType<typeof stub>;

  async function getButton() {
    return element.shadowRoot!.querySelector(
      '[part~="copy-button"]'
    ) as HTMLElement;
  }

  beforeEach(async () => {
    // Stub the clipboard API
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

    copyButton = await getButton();
    expect(copyButton).to.exist;
    expect(copyButton.tagName.toLowerCase()).to.equal('igc-icon-button');
  });

  it('should have copy button with proper aria-label', async () => {
    element = await fixture<IgcCopyToClipboardComponent>(
      html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
    );

    copyButton = await getButton();
    expect(copyButton.getAttribute('aria-label')).to.equal(
      'Copy content to clipboard'
    );
  });

  describe('User Interaction', () => {
    beforeEach(async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Sample text</igc-copy-to-clipboard>`
      );
      copyButton = await getButton();
    });

    it('should show copy button on pointer enter', async () => {
      expect(copyButton.part.contains('visible')).to.be.false;
      expect(copyButton.getAttribute('tabindex')).to.equal('-1');

      simulatePointerEnter(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.true;
      expect(copyButton.getAttribute('tabindex')).to.equal('0');
    });

    it('should hide copy button on pointer leave', async () => {
      simulatePointerEnter(element);
      await elementUpdated(element);
      expect(copyButton.part.contains('visible')).to.be.true;

      simulatePointerLeave(element);
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
      expect(copyButton.getAttribute('tabindex')).to.equal('-1');
    });

    it('should show copy button on focus', async () => {
      expect(copyButton.part.contains('visible')).to.be.false;

      element.dispatchEvent(new FocusEvent('focusin'));
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.true;
      expect(copyButton.getAttribute('tabindex')).to.equal('0');
    });

    it('should hide copy button on blur', async () => {
      element.dispatchEvent(new FocusEvent('focusin'));
      await elementUpdated(element);
      expect(copyButton.part.contains('visible')).to.be.true;

      element.dispatchEvent(new FocusEvent('focusout'));
      await elementUpdated(element);

      expect(copyButton.part.contains('visible')).to.be.false;
    });
  });

  describe('Copy Functionality', () => {
    it('should copy simple text content', async () => {
      const text = 'Simple text to copy';
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>${text}</igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(writeTextStub).to.have.been.calledWith(text);
    });

    it('should copy text with normalized whitespace', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          Text with multiple spaces and indentation
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnce;
      const copiedText = writeTextStub.firstCall.args[0] as string;

      // Should preserve newlines but trim whitespace
      expect(copiedText).to.include('Text with multiple spaces');
      expect(copiedText).to.include('and indentation');
      // Should not have multiple consecutive spaces within lines
      expect(copiedText).to.not.match(/ {2,}/);
      // Should not have leading/trailing whitespace around newlines
      expect(copiedText).to.not.match(/\n /);
      expect(copiedText).to.not.match(/ \n/);
    });

    it('should strip excessive whitespace from multi-line content', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          <pre>
Line 1


Line 2</pre
          >
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;

      // Should not have multiple consecutive newlines
      expect(copiedText).to.not.match(/\n\n+/);
      expect(copiedText).to.equal('Line 1\nLine 2');
    });

    it('should copy content from nested elements', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          <div>First line</div>
          <div>Second line</div>
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnce;
      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.include('First line');
      expect(copiedText).to.include('Second line');
    });

    it('should handle empty content', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard></igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(writeTextStub).to.have.been.calledWith('');
    });

    it('should handle content with only whitespace', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard> </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledOnce;
      expect(writeTextStub).to.have.been.calledWith('');
    });

    it('should fail gracefully when clipboard API rejects', async () => {
      writeTextStub.restore();
      const rejectStub = stub(navigator.clipboard, 'writeText').rejects(
        new Error('Permission denied')
      );

      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Text</igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);

      // Wait for the async handler to settle
      await nextFrame();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(rejectStub).to.have.been.calledOnce;

      rejectStub.restore();
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

      copyButton = await getButton();
      const slot = copyButton.querySelector('slot[name="copy-icon"]');
      expect(slot).to.exist;

      const assignedNodes = (slot as HTMLSlotElement).assignedElements();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].tagName.toLowerCase()).to.equal('svg');
    });
  });

  describe('Whitespace Normalization', () => {
    it('should collapse multiple spaces to single space', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Text with spaces</igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      expect(writeTextStub).to.have.been.calledWith('Text with spaces');
    });

    it('should collapse tabs to single space', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>Text with tabs</igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.equal('Text with tabs');
    });

    it('should preserve single newlines', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          <pre>
Line 1
Line 2
Line 3</pre
          >
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.equal('Line 1\nLine 2\nLine 3');
    });

    it('should trim leading and trailing whitespace', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard> Trimmed content </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.equal('Trimmed content');
      expect(copiedText.startsWith(' ')).to.be.false;
      expect(copiedText.endsWith(' ')).to.be.false;
    });

    it('should handle mixed whitespace scenarios', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          <pre>
First    line   with   spaces


Second		line	with	tabs

Third line</pre
          >
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.equal(
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
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.not.match(/\n\n+/);
    });

    it('preserve format retains paragraph structure', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard format="preserve">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.include('First paragraph');
      expect(copiedText).to.include('Second paragraph');
      expect(copiedText).to.match(/First paragraph\n+Second paragraph/);
    });

    it('preserve format retains code block indentation', async () => {
      element = await fixture<IgcCopyToClipboardComponent>(
        html`<igc-copy-to-clipboard format="preserve">
          <pre>
  function hello() {
    return 1;
  }</pre
          >
        </igc-copy-to-clipboard>`
      );

      copyButton = await getButton();
      simulateClick(copyButton);
      await nextFrame();

      const copiedText = writeTextStub.firstCall.args[0] as string;
      expect(copiedText).to.include('  function hello() {');
      expect(copiedText).to.include('    return 1;');
    });
  });
});
