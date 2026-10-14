import { html, LitElement, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addCommandController } from '#internals/controllers/command.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController } from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { createTimer } from '#internals/timing.js';
import { bindIf } from '#internals/utils/lit.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type { CopyFormat } from '../types.js';
import IgcVisuallyHiddenComponent from '../visually-hidden/visually-hidden.js';
import { styles } from './themes/copy-to-clipboard.base.css.js';

/** The icon and the live region message of each copy status. */
const STATUSES = {
  copy: { icon: 'copy_content', message: '' },
  success: {
    icon: 'copy_success',
    message: 'Content copied to clipboard successfully.',
  },
  error: {
    icon: 'error',
    message: 'Failed to copy content to clipboard. Please try again.',
  },
} as const;

type CopyStatus = keyof typeof STATUSES;

export interface IgcCopyToClipboardEventArgs {
  /** Whether the text reached the clipboard. */
  status: 'success' | 'error';
  /** The text that the component copied, or tried to copy. */
  text: string;
}

export interface IgcCopyToClipboardComponentEventMap {
  igcCopy: CustomEvent<IgcCopyToClipboardEventArgs>;
}

/** How long the success or error icon shows, in milliseconds. */
const STATUS_RESET_DELAY = 1000;

const BUTTON_LABEL = 'Copy to clipboard';

/**
 * Overlays a copy button on its slotted content. The button copies the
 * rendered text of the content to the clipboard.
 *
 * @element igc-copy-to-clipboard
 *
 * @remarks
 * The copy button shows on hover and on focus, and always on devices without
 * hover. It is in the tab sequence also when the content has no focusable
 * element. Hidden elements and custom icons are never copied. A live region
 * announces the result of each copy action. The `aria-label`, `aria-labelledby`
 * and `aria-describedby` of the component apply to the copy button.
 *
 * @fires igcCopy - Emitted after each copy action, with its status and the text.
 *
 * @cssstate ig-success - The component shows the success icon.
 * @cssstate ig-error - The component shows the error icon.
 *
 * @slot - The content to display and copy.
 * @slot copy-icon - Overrides the default copy icon.
 * @slot success-icon - Overrides the default success icon.
 * @slot error-icon - Overrides the default error icon.
 *
 * @csspart button - The copy button.
 * @csspart copy-button - The copy button while it shows the copy icon.
 * @csspart success-button - The copy button while it shows the success icon.
 * @csspart error-button - The copy button while it shows the error icon.
 *
 * @example
 * ```html
 * <igc-copy-to-clipboard format="preserve">
 *   <pre><code>function greet(name) {
 *   return `Hello, ${name}!`;
 * }</code></pre>
 * </igc-copy-to-clipboard>
 * ```
 *
 * @example
 * ```html
 * <!-- The --copy command works also with disable-interaction -->
 * <igc-copy-to-clipboard id="snippet" disable-interaction>
 *   <p>Some text to copy.</p>
 * </igc-copy-to-clipboard>
 * <button command="--copy" commandfor="snippet">Copy</button>
 * ```
 */
@shadowOptions({ delegatesFocus: true })
export default class IgcCopyToClipboardComponent extends EventEmitterMixin<
  IgcCopyToClipboardComponentEventMap,
  Constructor<LitElement>
>(HostAriaMixin(LitElement)) {
  public static readonly tagName = 'igc-copy-to-clipboard';
  public static styles = [componentBase, styles];

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
    slots: ['copy-icon', 'success-icon', 'error-icon'] as const,
  });

  private readonly _internals = addInternalsController(this);

  private readonly _resetTimer = createTimer(
    () => this._setStatus('copy'),
    STATUS_RESET_DELAY
  );

  @state()
  private _copyStatus: CopyStatus = 'copy';

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the copy button is hidden and disabled. The `--copy` command
   * still copies the content.
   *
   * @attr disable-interaction
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-interaction' })
  public disableInteraction = false;

  /**
   * How the copied text is formatted.
   * - `plain`: Collapses whitespace, with one line break between blocks.
   * - `preserve`: Keeps paragraph breaks and indentation.
   *
   * @attr format
   * @default 'plain'
   */
  @property()
  public format: CopyFormat = 'plain';

  //#endregion

  constructor() {
    super();
    addCommandController(this).set('--copy', this._handleCopy);
  }

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    // A reconnected component starts again from the copy icon.
    this._resetTimer.stop();
    this._setStatus('copy');
    super.disconnectedCallback();
  }

  //#endregion

  //#region Event handlers

  private async _handleCopy(): Promise<void> {
    const text = this._getContentToCopy();
    let status: IgcCopyToClipboardEventArgs['status'] = 'success';

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // The Clipboard API is not available, or the write was denied.
      status = 'error';
    }

    this._setStatus(status);
    this._resetTimer.start();
    this.emitEvent('igcCopy', { detail: { status, text } });
  }

  //#endregion

  //#region Internal API

  private _setStatus(status: CopyStatus): void {
    this._copyStatus = status;
    this._internals.setState('ig-success', status === 'success');
    this._internals.setState('ig-error', status === 'error');
  }

  private _getContentToCopy(): string {
    const text = this._getRenderedText();

    return this.format === 'preserve'
      ? text.replaceAll(/^\n+|\n+$/g, '')
      : text
          .replaceAll(/[ \t]+/g, ' ')
          .replaceAll(/[ \n]*\n[ \n]*/g, '\n')
          .trim();
  }

  /** `innerText` includes the visible icon slot, so it is hidden during the read. */
  private _getRenderedText(): string {
    const iconSlot = this.renderRoot.querySelector<HTMLSlotElement>(
      `slot[name="${this._copyStatus}-icon"]`
    );

    if (!iconSlot?.assignedNodes().length) {
      return this.innerText;
    }

    iconSlot.hidden = true;
    const text = this.innerText;
    iconSlot.hidden = false;
    return text;
  }

  //#endregion

  protected override render(): TemplateResult {
    const status = this._copyStatus;
    const { icon, message } = STATUSES[status];

    return html`
      <slot></slot>
      <igc-icon-button
        ${ariaBindings(hostAria(this))}
        part="button ${status}-button"
        name=${bindIf(!this._slots.hasAssignedNodes(`${status}-icon`), icon)}
        ?disabled=${this.disableInteraction}
        ?hidden=${this.disableInteraction}
        @click=${this._handleCopy}
      >
        <igc-visually-hidden>${BUTTON_LABEL}</igc-visually-hidden>
        <slot name="copy-icon" ?hidden=${status !== 'copy'}></slot>
        <slot name="success-icon" ?hidden=${status !== 'success'}></slot>
        <slot name="error-icon" ?hidden=${status !== 'error'}></slot>
      </igc-icon-button>
      <igc-visually-hidden role="status">${message}</igc-visually-hidden>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-copy-to-clipboard': IgcCopyToClipboardComponent;
  }
}
