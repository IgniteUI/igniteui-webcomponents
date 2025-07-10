import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { numberInRangeInclusive } from '../common/util.js';
import { styles } from './themes/dialog.base.css.js';
import { styles as shared } from './themes/shared/dialog.common.css.js';
import { all } from './themes/themes.js';

export interface IgcDialogComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

let nextId = 1;

/* blazorAdditionalDependency: IgcButtonComponent */
/**
 * Represents a Dialog component.
 *
 * @element igc-dialog
 *
 * @fires igcClosing - Emitter just before the dialog is closed. Cancelable.
 * @fires igcClosed - Emitted after closing the dialog.
 *
 * @slot - Renders content inside the default slot of the dialog.
 * @slot title - Renders content in the title slot of the dialog header.
 * @slot message - Renders the message content of the dialog.
 * @slot footer - Renders content in the dialog footer.
 *
 * @csspart base - The base wrapper of the dialog.
 * @csspart title - The title container of the dialog.
 * @csspart footer - The footer container of the dialog.
 * @csspart overlay - The backdrop overlay of the dialog.
 */
export default class IgcDialogComponent extends EventEmitterMixin<
  IgcDialogComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-dialog';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDialogComponent, IgcButtonComponent);
  }

  //#region Private state and properties

  private readonly _titleId = `title-${nextId++}`;

  private readonly _slots = addSlotController(this, {
    slots: setSlots('title', 'message', 'footer'),
  });

  private readonly _dialogRef = createRef<HTMLDialogElement>();
  private readonly _player = addAnimationController(this, this._dialogRef);

  /**
   * Backdrop animation helper.
   */
  @state()
  private _animating = false;

  private get _dialog(): HTMLDialogElement {
    return this._dialogRef.value!;
  }

  //#endregion

  //#region Public properties

  /**
   * Whether the dialog should be kept open when pressing the 'Escape' button.
   * @attr keep-open-on-escape
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  /**
   * Whether the dialog should be closed when clicking outside of it.
   * @attr close-on-outside-click
   */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /**
   * Whether to hide the default action button for the dialog.
   *
   * When there is projected content in the `footer` slot this property
   * has no effect.
   * @attr hide-default-action
   */
  @property({ type: Boolean, attribute: 'hide-default-action' })
  public hideDefaultAction = false;

  /**
   * Whether the dialog is opened.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Sets the title of the dialog.
   * @attr
   */
  @property()
  public override title!: string;

  /** Sets the return value for the dialog. */
  @property({ attribute: false })
  public returnValue!: string;

  //#endregion

  //#region Internal API

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override firstUpdated(): void {
    if (this.open) {
      this._dialog.showModal();
    }
  }

  @watch('open', { waitUntilFirstUpdate: true })
  protected _handleOpenState(): void {
    this.open ? this._dialog.showModal() : this._dialog.close();
  }

  private _emitClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  private async _hide(emitEvent = false): Promise<boolean> {
    if (!this.open || (emitEvent && !this._emitClosing())) {
      return false;
    }

    this._animating = true;
    await this._player.playExclusive(fadeOut());
    this.open = false;
    this._animating = false;

    if (emitEvent) {
      await this.updateComplete;
      this.emitEvent('igcClosed');
    }

    return true;
  }

  protected _handleFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement;

    if (form.method === 'dialog') {
      if (hasSubmitter(event.submitter)) {
        this.returnValue = event.submitter.value ?? '';
      }

      if (!event.defaultPrevented) {
        this._hide(true);
      }
    }
  }

  private _handleCancel(event: Event): void {
    event.preventDefault();

    if (!this.keepOpenOnEscape) {
      this._hide(true);
    }
  }

  private _handleClick({ clientX, clientY, target }: PointerEvent): void {
    if (this.closeOnOutsideClick && this._dialog === target) {
      const rect = this._dialog.getBoundingClientRect();
      const inX = numberInRangeInclusive(clientX, rect.left, rect.right);
      const inY = numberInRangeInclusive(clientY, rect.top, rect.bottom);

      if (!(inX && inY)) {
        this._hide(true);
      }
    }
  }

  //#endregion

  //#region Public API

  /** Opens the dialog. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this._player.playExclusive(fadeIn());
    return true;
  }

  /** Closes the dialog. */
  public async hide(): Promise<boolean> {
    return this._hide();
  }

  /** Toggles the open state of the dialog. */
  public async toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  //#endregion

  //#region Render methods

  protected _renderBackdrop() {
    return html`
      <div
        aria-hidden=${!this.open}
        part=${partMap({ backdrop: true, animating: this._animating })}
      ></div>
    `;
  }

  protected _renderHeader() {
    return html`
      <header part="title" id=${this._titleId}>
        <slot name="title">
          <span>${this.title}</span>
        </slot>
      </header>
    `;
  }

  protected _renderContent() {
    const hasMessage = this._slots.hasAssignedElements('message');
    return html`
      <section part="content">
        <slot name="message" ?hidden=${!hasMessage}></slot>
        <slot @submit=${this._handleFormSubmit}></slot>
      </section>
    `;
  }

  protected _renderFooter() {
    return html`
      <footer part="footer">
        <slot name="footer">
          ${this.hideDefaultAction
            ? nothing
            : html`
                <igc-button variant="flat" @click=${() => this._hide(true)}>
                  OK
                </igc-button>
              `}
        </slot>
      </footer>
    `;
  }

  protected override render() {
    const hasTitle = this._slots.hasAssignedElements('title') || !!this.title;
    const hasFooter =
      this._slots.hasAssignedElements('footer') || !this.hideDefaultAction;
    const labelledBy = this.ariaLabel ?? this._titleId;

    return html`
      ${this._renderBackdrop()}
      <dialog
        ${ref(this._dialogRef)}
        part=${partMap({ base: true, titled: hasTitle, footed: hasFooter })}
        role="dialog"
        aria-label=${this.ariaLabel || nothing}
        aria-labelledby=${labelledBy || nothing}
        @click=${this._handleClick}
        @cancel=${this._handleCancel}
      >
        ${this._renderHeader()} ${this._renderContent()} ${this._renderFooter()}
      </dialog>
    `;
  }

  //#endregion
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dialog': IgcDialogComponent;
  }
}

function hasSubmitter(
  submitter: SubmitEvent['submitter']
): submitter is HTMLButtonElement | HTMLInputElement {
  return submitter != null;
}
