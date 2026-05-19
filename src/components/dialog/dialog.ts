import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { fadeIn, fadeOut } from '../../animations/presets/fade/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { addCommandController } from '../common/controllers/command.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { bindIf, numberInRangeInclusive } from '../common/util.js';
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
 * A modal dialog component built on the native `<dialog>` element.
 *
 * The dialog traps focus while open and blocks interaction with the rest
 * of the page (modal semantics). It supports animated open/close
 * transitions, an optional backdrop overlay, and multiple content areas
 * through named slots.
 *
 * The component integrates with the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
 * an `igc-button` or a native `<button>` with `command="--show"` / `"--hide"` / `"--toggle"`
 * and `commandfor` pointing to this element will call the corresponding method
 * declaratively without any JavaScript.
 *
 * @element igc-dialog
 *
 * @fires igcClosing - Emitted just before the dialog closes. Cancelable —
 *   call `event.preventDefault()` to abort the closing sequence.
 * @fires igcClosed - Emitted after the dialog has fully closed and its
 *   exit animation has completed.
 *
 * @slot - General-purpose content area. Also the target for any
 *   `<form method="dialog">` placed inside the dialog.
 * @slot title - Content rendered in the dialog header. Falls back to the
 *   `title` attribute when empty.
 * @slot message - A dedicated message/body area rendered above the default
 *   slot. Hidden when no content is assigned.
 * @slot footer - Content rendered in the dialog footer. When empty, a
 *   default "OK" close button is shown (unless `hide-default-action` is set).
 *
 * @csspart base - The native `<dialog>` element.
 * @csspart title - The `<header>` element wrapping the title slot.
 * @csspart content - The `<section>` element wrapping the message and default slots.
 * @csspart footer - The `<footer>` element wrapping the footer slot.
 * @csspart backdrop - The decorative backdrop overlay element.
 * @csspart animating - Applied to the backdrop while an animation is running.
 *
 * @example
 * <!-- Basic dialog with a custom title and footer action -->
 * <igc-button onclick="dialog.show()">Open</igc-button>
 * <igc-dialog id="dialog" title="Confirm action">
 *   <p slot="message">Are you sure you want to continue?</p>
 *   <div slot="footer">
 *     <igc-button variant="flat" onclick="dialog.hide()">Cancel</igc-button>
 *     <igc-button onclick="dialog.hide()">Confirm</igc-button>
 *   </div>
 * </igc-dialog>
 *
 * @example
 * <!-- Declarative control via the Invoker Commands API -->
 * <igc-button command="--show" commandfor="cmd-dialog">Open</igc-button>
 * <igc-dialog id="cmd-dialog" title="Invoked dialog">
 *   Opened without JavaScript.
 * </igc-dialog>
 *
 * @example
 * <!-- Dialog with an embedded form (method="dialog") -->
 * <igc-dialog title="Enter your name">
 *   <form method="dialog">
 *     <igc-input name="name" label="Name"></igc-input>
 *     <igc-button type="submit">Submit</igc-button>
 *   </form>
 * </igc-dialog>
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

  private get _dialog(): HTMLDialogElement | undefined {
    return this._dialogRef.value;
  }

  //#endregion

  //#region Public properties

  /**
   * When set, pressing the `Escape` key will not close the dialog.
   *
   * By default the browser closes a modal dialog on `Escape`. Enable this
   * option when the dialog guards unsaved work and should require an explicit
   * user action to dismiss.
   * @attr keep-open-on-escape
   * @default false
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  /**
   * When set, clicking on the backdrop area outside the dialog surface
   * will close it (emitting `igcClosing` / `igcClosed`).
   *
   * Has no effect when the dialog is not yet open.
   * @attr close-on-outside-click
   * @default false
   */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /**
   * When set, the built-in "OK" close button in the footer is not rendered.
   *
   * Has no effect when content is projected into the `footer` slot, since
   * the slot content replaces the default button entirely.
   * @attr hide-default-action
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-default-action' })
  public hideDefaultAction = false;

  /**
   * Whether the dialog is open.
   *
   * Setting this property programmatically will open or close the dialog
   * without animation and without emitting `igcClosing` / `igcClosed`.
   * Prefer the `show()`, `hide()`, and `toggle()` methods for animated
   * transitions, and note that events are only emitted when the dialog is
   * closed through user interaction (the default action button, outside click,
   * or the Escape key).
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * The title displayed in the dialog header.
   *
   * Overridden by any content projected into the `title` slot.
   * @attr title
   */
  @property()
  public override title!: string;

  /**
   * The return value of the dialog.
   *
   * Automatically set to the `value` of the submitter element when a
   * `<form method="dialog">` inside the dialog is submitted. Can also
   * be set programmatically before calling `hide()`.
   */
  @property({ attribute: false })
  public returnValue?: string;

  //#endregion

  //#region Lifecycle

  constructor() {
    super();

    addThemingController(this, all);
    addCommandController(this)
      .set('--show', this.show)
      .set('--hide', this.hide)
      .set('--toggle', this.toggle);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open')) {
      this.open ? this._dialog?.showModal() : this._dialog?.close();
    }
  }

  //#endregion

  //#region Event handlers

  protected _handleFormSubmit(event: SubmitEvent): void {
    const form = event.target as HTMLFormElement;

    if (form.method === 'dialog') {
      if (hasSubmitter(event.submitter)) {
        this.returnValue = event.submitter.value ?? '';
      }

      if (!event.defaultPrevented) {
        this._closeWithEvent();
      }
    }
  }

  private _handleCancel(event: Event): void {
    event.preventDefault();

    if (!this.keepOpenOnEscape) {
      this._closeWithEvent();
    }
  }

  private _handleClose(): void {
    // When a non-cancelable close event is fired (e.g., from repeated Escape presses),
    // reopen the dialog to prevent the broken state with visible backdrop.
    // Note that this handler is invoked only when `keepOpenOnEscape` is true.
    if (this.open) {
      this._dialog?.showModal();
    }
  }

  private _handleClick({ clientX, clientY, target }: PointerEvent): void {
    if (this.closeOnOutsideClick && this._dialog === target) {
      const rect = this._dialog.getBoundingClientRect();
      const inX = numberInRangeInclusive(clientX, rect.left, rect.right);
      const inY = numberInRangeInclusive(clientY, rect.top, rect.bottom);

      if (!(inX && inY)) {
        this._closeWithEvent();
      }
    }
  }

  //#endregion

  //#region Internal API

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

  private _emitClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  private _closeWithEvent(): void {
    this._hide(true);
  }

  //#endregion

  //#region Public API

  /**
   * Opens the dialog with an animated fade-in transition.
   *
   * Returns `true` when the dialog was successfully opened, or `false` if
   * it was already open.
   */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this._player.playExclusive(fadeIn());
    return true;
  }

  /**
   * Closes the dialog with an animated fade-out transition.
   *
   * Returns `true` when the dialog was successfully closed, or `false` if
   * it was already closed.
   */
  public async hide(): Promise<boolean> {
    return this._hide();
  }

  /**
   * Toggles the dialog open or closed depending on its current state.
   *
   * Equivalent to calling `show()` when closed and `hide()` when open.
   * Returns `true` when the transition completed successfully.
   */
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
                <igc-button variant="flat" @click=${this._closeWithEvent}>
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
        aria-label=${bindIf(this.ariaLabel, this.ariaLabel)}
        aria-labelledby=${bindIf(labelledBy, labelledBy)}
        @click=${this._handleClick}
        @cancel=${this._handleCancel}
        @close=${bindIf(this.keepOpenOnEscape, this._handleClose)}
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
