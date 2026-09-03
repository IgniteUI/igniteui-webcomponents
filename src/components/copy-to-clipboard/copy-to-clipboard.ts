import { html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addCommandController } from '#internals/controllers/command.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import { partMap } from '#internals/part-map.js';
import { createTimer } from '#internals/timing.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type { CopyFormat } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { styles } from './themes/copy-to-clipboard.base.css.js';

type CopyStatus = 'copy' | 'success' | 'error';

/** Time in milliseconds the success/error icon stays before the copy icon returns. */
const STATUS_RESET_DELAY = 1000;

const BUTTON_LABEL = 'Copy content to clipboard. Click to copy.';

/** Events that show (enter/focusin) or hide (leave/focusout) the copy button. */
const INTERACTION_EVENTS = [
  'pointerenter',
  'pointerleave',
  'focusin',
  'focusout',
] as const;

const STATUS_ICONS: Record<CopyStatus, string> = {
  copy: 'copy_content',
  success: 'copy_success',
  error: 'error',
};

/** Messages for the live region. The default state announces nothing. */
const STATUS_MESSAGES: Record<CopyStatus, string> = {
  copy: '',
  success: 'Content copied to clipboard successfully.',
  error: 'Failed to copy content to clipboard. Please try again.',
};

/**
 * A component that overlays a copy button on top of its slotted content,
 * allowing users to copy the text to the clipboard with a single click.
 *
 * @element igc-copy-to-clipboard
 *
 * @remarks
 * The copy button is hidden by default and becomes visible when the user hovers
 * over the component or moves keyboard focus inside it. The button itself is part
 * of the tab sequence, so keyboard users reach it even when the slotted content
 * has no focusable element.
 *
 * Both `format` values read the rendered text of the content (the `innerText`
 * algorithm), so hidden elements and custom icons are never copied.
 *
 * The copy action can also be triggered through the `--copy` command of the
 * Invoker Commands API, which works even when `disable-interaction` is set.
 * The result of every copy action is announced through a visually hidden live region.
 *
 * @slot - The content to be displayed and copied. Accepts any HTML.
 * @slot copy-icon - Overrides the default copy icon inside the copy button.
 * @slot success-icon - Overrides the default success icon shown after a successful copy.
 * @slot error-icon - Overrides the default error icon shown if the copy action fails.
 *
 * @csspart button - The icon-button positioned over the slotted content.
 * @csspart copy-button - The icon-button while it shows the copy icon.
 * @csspart success-button - The icon-button while it shows the success icon after a copy action succeeds.
 * @csspart error-button - The icon-button while it shows the error icon after a copy action fails.
 * @csspart visible - Applied to the icon-button while it is shown on hover or focus.
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
 * <!-- Hide the copy button and trigger the copy action through a command -->
 * <igc-copy-to-clipboard id="copy-component" disable-interaction>
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
  public static override styles = styles;

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

  private readonly _resetTimer = createTimer(() => {
    this._copyStatus = 'copy';
  }, STATUS_RESET_DELAY);

  @state()
  private _copyStatus: CopyStatus = 'copy';

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
   * - `plain`: Collapses whitespace into single spaces and block boundaries into single newlines (default).
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

    for (const type of INTERACTION_EVENTS) {
      addSafeEventListener(this, type, this._handleInteraction);
    }
  }

  //#region Lit lifecycle

  public override disconnectedCallback(): void {
    this._resetTimer.stop();
    super.disconnectedCallback();
  }

  //#endregion

  //#region Event handlers

  private async _handleClick(): Promise<void> {
    let status: CopyStatus = 'success';

    try {
      await navigator.clipboard.writeText(this._getContentToCopy());
    } catch {
      // Clipboard API unavailable or permission denied — fail gracefully.
      status = 'error';
    }

    this._copyStatus = status;
    this._resetTimer.start();
  }

  private _handleInteraction(event: Event): void {
    this._hasUserInteraction =
      event.type === 'pointerenter' || event.type === 'focusin';
  }

  //#endregion

  //#region Internal API

  private _getContentToCopy(): string {
    const text = this._getRenderedText();

    return this.format === 'preserve'
      ? text.replaceAll(/^\n+|\n+$/g, '')
      : text
          .replaceAll(/[ \t]+/g, ' ')
          .replaceAll(/[ \t]*\n[ \t]*/g, '\n')
          .replaceAll(/\n+/g, '\n')
          .trim();
  }

  /**
   * Returns the rendered text of the slotted content.
   *
   * `innerText` walks the light DOM, so content assigned to the icon slot
   * would be included as well. The slot is hidden for the duration of
   * the read, which removes its assigned nodes from the rendered text.
   */
  private _getRenderedText(): string {
    const iconSlot =
      this.renderRoot.querySelector<HTMLSlotElement>('slot[name]');

    if (iconSlot) {
      iconSlot.hidden = true;
    }

    try {
      return this.innerText;
    } finally {
      if (iconSlot) {
        iconSlot.hidden = false;
      }
    }
  }

  //#endregion

  protected override render(): TemplateResult {
    const status = this._copyStatus;
    const parts = partMap({
      button: true,
      [`${status}-button`]: true,
      visible: this._hasUserInteraction && !this.disableInteraction,
    });
    const iconName = bindIf(
      !this._slots.hasAssignedNodes(`${status}-icon`),
      STATUS_ICONS[status]
    );

    return html`
      <slot></slot>
      <igc-icon-button
        part=${parts}
        name=${iconName}
        ?disabled=${this.disableInteraction}
        @click=${this._handleClick}
      >
        <igc-visually-hidden>${BUTTON_LABEL}</igc-visually-hidden>
        <slot name="${status}-icon"></slot>
      </igc-icon-button>
      <igc-visually-hidden role="status" aria-live="polite">
        ${STATUS_MESSAGES[status]}
      </igc-visually-hidden>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-copy-to-clipboard': IgcCopyToClipboardComponent;
  }
}
