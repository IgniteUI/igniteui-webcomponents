import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { addSafeEventListener, bindIf } from '../common/util.js';
import type { CopyFormat } from '../types.js';

// Regex patterns for normalizing whitespace in copied content
/** Matches multiple consecutive spaces or tabs */
const MULTIPLE_HORIZONTAL_WHITESPACE = /[ \t]+/g;
/** Matches whitespace around newlines (indentation and trailing spaces) */
const WHITESPACE_AROUND_NEWLINES = /[ \t]*\n[ \t]*/g;
/** Matches multiple consecutive newlines */
const MULTIPLE_NEWLINES = /\n+/g;

/**
 * A component that overlays a copy button on top of its slotted content,
 * allowing users to copy the text to the clipboard with a single click.
 *
 * @element igc-copy-to-clipboard
 *
 * @remarks
 * The copy button is hidden by default and becomes visible when the user hovers
 * over the component or moves keyboard focus inside it. The `format` attribute
 * controls how the content is serialized before being written to the clipboard:
 * - **`plain`** (default) — collapses all whitespace and newlines into a single,
 *   normalized body of text. Suitable for prose content.
 * - **`preserve`** — uses the browser's `innerText` algorithm to retain the
 *   visual structure of the content: paragraph breaks, indentation in `<pre>`
 *   blocks, etc. Ideal for code snippets or structured content.
 *
 * @slot - The content to be displayed and copied. Accepts any HTML.
 * @slot copy-icon - Overrides the default copy icon inside the copy button.
 *
 * @csspart copy-button - The copy icon-button positioned over the slotted content.
 *
 * @example
 * ```html
 * <!-- Basic usage: copy plain prose text -->
 * <igc-copy-to-clipboard>
 *   <p>Some text the user can copy to the clipboard.</p>
 * </igc-copy-to-clipboard>
 * ```
 *
 * @example
 * ```html
 * <!-- Preserve indentation of a code snippet -->
 * <igc-copy-to-clipboard format="preserve">
 *   <pre><code>function greet(name) {
 *   return `Hello, ${name}!`;
 * }</code></pre>
 * </igc-copy-to-clipboard>
 * ```
 *
 * @example
 * ```html
 * <!-- Supply a custom icon for the copy button -->
 * <igc-copy-to-clipboard>
 *   <igc-icon name="copy" slot="copy-icon"></igc-icon>
 *   <p>Content to copy.</p>
 * </igc-copy-to-clipboard>
 * ```
 *
 * @example
 * ```html
 * <!-- Wrap a focusable code block; the button appears on hover or focus -->
 * <igc-copy-to-clipboard format="preserve">
 *   <pre tabindex="0"><code>const x = 42;</code></pre>
 * </igc-copy-to-clipboard>
 * ```
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcCopyToClipboardComponent extends LitElement {
  public static readonly tagName = 'igc-copy-to-clipboard';
  public static override styles = css`
    :host {
      display: block;
      position: relative;
    }

    [part~='copy-button'] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease-in-out;
      inset-block-start: 0.25rem;
      inset-inline-end: 0.25rem;
      padding: 0.25rem;
      border-radius: 4px;
    }

    [part~='visible'] {
      opacity: 1;
      pointer-events: auto;
    }
  `;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCopyToClipboardComponent, IgcIconButtonComponent);
  }

  //#region Internal state and properties

  private readonly _slots = addSlotController(this, {
    slots: setSlots('copy-icon'),
  });

  @state()
  private _hasUserInteraction = false;

  //#endregion

  //#region Public properties and attributes

  /**
   * Controls how the text content is formatted when copied to the clipboard.
   * - `plain`: Normalizes all whitespace into a flat body of text (default).
   * - `preserve`: Retains the visual structure such as paragraphs and code indentation.
   *
   * @attr format
   * @default 'plain'
   */
  @property({ reflect: true })
  public format: CopyFormat = 'plain';

  //#endregion

  constructor() {
    super();

    addSafeEventListener(this, 'pointerenter', this._setUserInteraction);
    addSafeEventListener(this, 'pointerleave', this._unsetUserInteraction);
    addSafeEventListener(this, 'focusin', this._setUserInteraction);
    addSafeEventListener(this, 'focusout', this._unsetUserInteraction);
  }

  //#region Event handlers

  private async _handleClick(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this._getContentToCopy());
    } catch {
      // Clipboard API unavailable or permission denied — fail gracefully.
    }
  }

  private _setUserInteraction(): void {
    this._hasUserInteraction = true;
  }

  private _unsetUserInteraction(): void {
    this._hasUserInteraction = false;
  }

  //#endregion

  //#region Content processing

  private _getContentToCopy(): string {
    return this.format === 'preserve'
      ? this._getPreservedContent()
      : this._getPlainContent();
  }

  private _getPlainContent(): string {
    return this._slots
      .getAssignedNodes('[default]', true)
      .map((node) => node.textContent ?? '')
      .join('')
      .replaceAll(MULTIPLE_HORIZONTAL_WHITESPACE, ' ')
      .replaceAll(WHITESPACE_AROUND_NEWLINES, '\n')
      .replaceAll(MULTIPLE_NEWLINES, '\n')
      .trim();
  }

  private _getPreservedContent(): string {
    return this.innerText.replace(/^\n+|\n+$/g, '');
  }

  //#endregion

  protected _renderButton() {
    return html`
      <igc-icon-button
        part=${partMap({
          'copy-button': true,
          visible: this._hasUserInteraction,
        })}
        tabindex=${this._hasUserInteraction ? 0 : -1}
        @click=${this._handleClick}
        aria-label="Copy content to clipboard"
        name=${bindIf(
          !this._slots.hasAssignedNodes('copy-icon'),
          'copy_content'
        )}
      >
        <slot name="copy-icon"></slot>
      </igc-icon-button>
    `;
  }

  protected override render() {
    return html`<slot></slot>${this._renderButton()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-copy-to-clipboard': IgcCopyToClipboardComponent;
  }
}
