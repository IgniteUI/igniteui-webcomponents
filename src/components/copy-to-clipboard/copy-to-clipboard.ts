import { CopyToClipboardResourceStringsEN } from 'igniteui-i18n-core';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { cancelDeferredFocus, deferFocus } from '#internals/deferred-focus.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { createTimer, type Timer } from '#internals/timing.js';
import { addSafeEventListeners } from '#internals/utils/events.js';
import { bindIf } from '#internals/utils/lit.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import type { CopyToClipboardFormat } from '../types.js';
import { formatCopiedText } from './format.js';
import { styles } from './themes/copy-to-clipboard.base.css.js';

/** The built-in icon and the announcement string of each status. */
const STATUSES = {
  copy: { icon: 'copy_content', message: undefined },
  success: { icon: 'copy_success', message: 'copy_to_clipboard_success' },
  error: { icon: 'error', message: 'copy_to_clipboard_error' },
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

const Slots = setSlots('copy-icon', 'success-icon', 'error-icon');

/** How long the success or error icon shows, in milliseconds. */
const STATUS_RESET_DELAY = 1000;

/** The live region stays empty this long before the result, so that an equal result is announced again. */
const ANNOUNCE_DELAY = 100;

const i18n = {
  defaultEN: CopyToClipboardResourceStringsEN,
};

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
 * @fires igcCopy - Emitted after each copy action of the user, with its status and the text.
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
export default class IgcCopyToClipboardComponent extends I18nMixin(
  EventEmitterMixin<IgcCopyToClipboardComponentEventMap>(
    HostAriaMixin(LitElement)
  ),
  i18n
) {
  public static readonly tagName = 'igc-copy-to-clipboard';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCopyToClipboardComponent, IgcIconButtonComponent);
  }

  //#region Internal state and properties

  private readonly _slots = addSlotController(this, { slots: Slots });

  private readonly _internals = addInternalsController(this);

  private _resetTimer?: Timer;
  private _announceTimer?: Timer;

  /** Only the latest copy action shows its result. */
  private _copyId = 0;

  @query('igc-icon-button')
  private readonly _button?: IgcIconButtonComponent;

  @state()
  private _copyStatus: CopyStatus = 'copy';

  @state()
  private _announced = false;

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the copy button is hidden. The `--copy` command and `copy()`
   * still copy the content.
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
  public format: CopyToClipboardFormat = 'plain';

  //#endregion

  constructor() {
    super();
    addSafeEventListeners(this, ['command'], this._handleCommand);
  }

  //#region Lit lifecycle methods

  protected override firstUpdated(): void {
    // The host does not take the focus, so native `autofocus` skips it.
    if (this.autofocus) {
      this.focus();
    }
  }

  public override disconnectedCallback(): void {
    this._resetTimer?.stop();
    this._announceTimer?.stop();
    this._resetStatus();
    super.disconnectedCallback();
  }

  //#endregion

  //#region Event handlers

  // `addSafeEventListener` takes only the events of `HTMLElementEventMap`, which has no `command` yet.
  private _handleCommand(event: Event): void {
    if ((event as CommandEvent).command === '--copy') {
      this._handleCopy();
    }
  }

  private async _handleCopy(): Promise<void> {
    const detail = await this.copy();

    if (this.isConnected) {
      this.emitEvent('igcCopy', { detail });
    }
  }

  //#endregion

  //#region Internal API

  private _setStatus(status: CopyStatus): void {
    this._copyStatus = status;
    this._internals.setState('ig-success', status === 'success');
    this._internals.setState('ig-error', status === 'error');
  }

  private _resetStatus(): void {
    this._announced = false;
    this._setStatus('copy');
  }

  private _showResult(status: CopyStatus): void {
    this._setStatus(status);
    this._announced = false;

    this._announceTimer ??= createTimer(
      () => (this._announced = true),
      ANNOUNCE_DELAY
    );
    this._resetTimer ??= createTimer(
      () => this._resetStatus(),
      STATUS_RESET_DELAY
    );
    this._announceTimer.start();
    this._resetTimer.start();
  }

  /** Renders now when a render is pending, so that the DOM matches the properties. */
  private _flushUpdate(): void {
    if (this.isConnected && this.isUpdatePending) {
      this.performUpdate();
    }
  }

  private _getContentToCopy(): string | null {
    // Before the first render, the content is not slotted.
    this._flushUpdate();

    // Without a visible layout box, `innerText` is empty, or returns all the
    // text, also that of hidden elements and of the icons.
    if (!this.checkVisibility({ visibilityProperty: true })) {
      return null;
    }

    return formatCopiedText(this._getRenderedText(), this.format);
  }

  /** `innerText` includes the shown icon, so its slot is hidden during the read. */
  private _getRenderedText(): string {
    const icon = this.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name]:not([hidden])'
    );

    if (!icon?.assignedNodes().length) {
      return this.innerText;
    }

    icon.hidden = true;
    const text = this.innerText;
    icon.hidden = false;
    return text;
  }

  //#endregion

  //#region Public API

  /**
   * Copies the content and resolves with the status and the text. The
   * component shows and announces the status, but does not emit `igcCopy`.
   * Use it where the browser does not support the `--copy` command.
   *
   * Browsers accept a clipboard write only during a user action, so call the
   * method directly from the event handler, with no `await` before it. A
   * component that is not rendered copies nothing and resolves with the
   * `error` status.
   */
  public async copy(): Promise<IgcCopyToClipboardEventArgs> {
    const copyId = ++this._copyId;
    const text = this._getContentToCopy();
    let status: IgcCopyToClipboardEventArgs['status'] = 'error';

    if (text !== null) {
      try {
        await navigator.clipboard.writeText(text);
        status = 'success';
      } catch {
        // The Clipboard API is not available, or the write was denied.
      }
    }

    if (copyId === this._copyId && this.isConnected) {
      this._showResult(status);
    }

    return { status, text: text ?? '' };
  }

  /* alternateName: focusComponent */
  /** Sets focus on the copy button. With `disable-interaction`, the component does not take the focus. */
  public override focus(options?: FocusOptions): void {
    // A pending render can still hide the button.
    this._flushUpdate();

    if (!this.disableInteraction) {
      this._button?.focus(options);
      deferFocus(this, options);
    }
  }

  /* alternateName: blurComponent */
  /** Removes focus from the copy button. */
  public override blur(): void {
    cancelDeferredFocus(this);
    this._button?.blur();
  }

  //#endregion

  protected override render(): TemplateResult {
    const status = this._copyStatus;
    const message = this._announced ? STATUSES[status].message : undefined;

    return html`
      <slot></slot>
      <igc-icon-button
        ${ariaBindings(hostAria(this))}
        part="button"
        name=${bindIf(
          !this._slots.hasAssignedNodes(`${status}-icon`),
          STATUSES[status].icon
        )}
        ?hidden=${this.disableInteraction}
        @click=${this._handleCopy}
      >
        <span>${this.resourceStrings.copy_to_clipboard_label}</span>
        <slot name="copy-icon" ?hidden=${status !== 'copy'}></slot>
        <slot name="success-icon" ?hidden=${status !== 'success'}></slot>
        <slot name="error-icon" ?hidden=${status !== 'error'}></slot>
      </igc-icon-button>
      <span role="status"
        >${message ? this.resourceStrings[message] : nothing}</span
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-copy-to-clipboard': IgcCopyToClipboardComponent;
  }
}
