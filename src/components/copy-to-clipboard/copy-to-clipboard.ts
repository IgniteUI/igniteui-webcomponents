import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { addCommandController } from '../common/controllers/command.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { shadowOptions } from '../common/decorators/shadow-options.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { addSafeEventListener, bindIf } from '../common/util.js';
import type { CopyFormat } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';

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
 * It also supports disabling user interaction via the `disable-interaction` attribute,
 * which prevents the copy button from appearing and disables its functionality.
 *
 * It is integrated with the Invoker Commands API, allowing the copy action to be triggered programmatically through commands.
 *
 * @slot - The content to be displayed and copied. Accepts any HTML.
 * @slot copy-icon - Overrides the default copy icon inside the copy button.
 * @slot success-icon - Overrides the default success icon shown after a successful copy.
 * @slot error-icon - Overrides the default error icon shown if the copy action fails.
 *
 * @csspart copy-button - The copy icon-button positioned over the slotted content.
 * @csspart success-button - The icon displayed when the copy action succeeds.
 * @csspart error-button - The icon displayed when the copy action fails.
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
 *
 * @example
 * ```html
 * <!-- Disable the copy button entirely -->
 * <igc-copy-to-clipboard disable-interaction>
 *   <p>No default copy button is shown on hover or focus.</p>
 * </igc-copy-to-clipboard>
 * ```
 *
 * @example
 * ```html
 * <!-- Trigger the copy action programmatically via command -->
 * <igc-copy-to-clipboard id="copy-component">
 *   <p>Some text to copy.</p>
 * </igc-copy-to-clipboard>
 * <button command="--copy" commandfor="copy-component">
 *   Copy via command
 * </button>
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

    [part~='copy-button'],
    [part~='success-button'],
    [part~='error-button'] {
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

  private static readonly _statusIcons = {
    copy: 'copy_content',
    success: 'attach_document',
    error: 'thumb_down_active',
  } as const;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcCopyToClipboardComponent,
      IgcIconButtonComponent,
      IgcVisuallyHiddenComponent
    );
  }

  //#region Internal state and properties

  private readonly _slots = addSlotController(this, {
    slots: setSlots('copy-icon', 'success-icon', 'error-icon'),
  });

  @state()
  private _copyStatus: 'copy' | 'success' | 'error' = 'copy';

  @state()
  private _hasUserInteraction = false;

  //#endregion

  //#region Public properties and attributes

  /**
   * Disables the copy button and prevents it from appearing on hover or focus.
   *
   * @attr disable-interaction
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-interaction' })
  public disableInteraction = false;

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

    addCommandController(this).set('--copy', this._handleClick);

    addSafeEventListener(this, 'pointerenter', this._setUserInteraction);
    addSafeEventListener(this, 'pointerleave', this._unsetUserInteraction);
    addSafeEventListener(this, 'focusin', this._setUserInteraction);
    addSafeEventListener(this, 'focusout', this._unsetUserInteraction);
  }

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('disableInteraction') && this.disableInteraction) {
      this._hasUserInteraction = false;
    }

    super.update(properties);
  }

  //#region Event handlers

  private async _handleClick(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this._getContentToCopy());
      this._copyStatus = 'success';
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this._copyStatus = 'copy';
    } catch {
      // Clipboard API unavailable or permission denied — fail gracefully.
      this._copyStatus = 'error';
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this._copyStatus = 'copy';
    }
  }

  private _setUserInteraction(): void {
    if (this.disableInteraction) return;
    this._hasUserInteraction = true;
  }

  private _unsetUserInteraction(): void {
    if (this.disableInteraction) return;
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

  protected _renderButton(
    status: 'copy' | 'success' | 'error',
    message: string
  ): TemplateResult {
    const hasInteraction = this._hasUserInteraction;

    const iconName = bindIf(
      !this._slots.hasAssignedNodes(`${status}-icon`),
      IgcCopyToClipboardComponent._statusIcons[status]
    );
    const parts = partMap({
      [`${status}-button`]: true,
      visible: hasInteraction,
    });

    return html`
      <igc-icon-button
        part=${parts}
        tabindex=${hasInteraction ? 0 : -1}
        @click=${bindIf(status === 'copy', this._handleClick)}
        name=${iconName}
      >
        <igc-visually-hidden>${message}</igc-visually-hidden>
        <slot name="${status}-icon"></slot>
      </igc-icon-button>
    `;
  }

  protected override render(): TemplateResult {
    return html`
      <slot></slot>
      ${choose(this._copyStatus, [
        [
          'copy',
          () =>
            this._renderButton(
              'copy',
              'Copy content to clipboard. Click to copy.'
            ),
        ],
        [
          'success',
          () =>
            this._renderButton(
              'success',
              'Content copied to clipboard successfully.'
            ),
        ],
        [
          'error',
          () =>
            this._renderButton(
              'error',
              'Failed to copy content to clipboard. Please try again.'
            ),
        ],
      ])}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-copy-to-clipboard': IgcCopyToClipboardComponent;
  }
}
