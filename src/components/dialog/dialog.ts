import { DialogResourceStringsEN } from 'igniteui-i18n-core';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '#animations/player.js';
import { fadeIn, fadeOut } from '#animations/presets/fade/index.js';
import {
  ariaBindings,
  hostAria,
} from '#internals/controllers/aria-projection.js';
import { addToggleCommands } from '#internals/controllers/command.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { addToggleController } from '#internals/controllers/toggle.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import { isPointInsideElement } from '#internals/utils/dom.js';
import { createIdGenerator } from '#internals/utils/strings.js';
import { all } from '#themes/dialog/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcButtonComponent from '../button/button.js';
import { styles } from './themes/dialog.base.css.js';
import { styles as shared } from './themes/shared/dialog.common.css.js';

export interface IgcDialogComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

const nextId = createIdGenerator('title');

const i18n = {
  defaultEN: DialogResourceStringsEN,
};

/* blazorAdditionalDependency: IgcButtonComponent */
/**
 * A modal dialog component built on the native `<dialog>` element.
 *
 * The dialog traps focus while open and blocks interaction with the rest
 * of the page (modal semantics). It supports animated open/close
 * transitions, a backdrop overlay, and multiple content areas
 * through named slots.
 *
 * The component supports the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
 * A button with `command="--show"`, `"--hide"` or `"--toggle"` and a `commandfor`
 * that points to this element calls the matching method.
 *
 * @element igc-dialog
 *
 * @fires igcClosing - Emitted before the dialog closes on a user action. Cancelable -
 *   call `event.preventDefault()` to abort the closing sequence.
 * @fires igcClosed - Emitted after the dialog closes on a user action and its
 *   exit animation completes.
 *
 * @slot - General-purpose content area. A `<form method="dialog">` in this
 *   slot closes the dialog on submit.
 * @slot title - Content rendered in the dialog header. Falls back to the
 *   `title` attribute when empty.
 * @slot message - A dedicated message/body area rendered above the default
 *   slot. Hidden when no content is assigned.
 * @slot footer - Content rendered in the dialog footer. When empty, a
 *   default action button is shown (unless `hide-default-action` is set).
 *
 * @csspart base - The native `<dialog>` element. Style the backdrop with `::part(base)::backdrop`.
 * @csspart titled - Added to the base part when the dialog has a title.
 * @csspart footed - Added to the base part when the footer has slotted content or a default action.
 * @csspart title - The `<header>` element wrapping the title slot.
 * @csspart content - The `<section>` element wrapping the message and default slots.
 * @csspart footer - The `<footer>` element wrapping the footer slot.
 */
export default class IgcDialogComponent extends I18nMixin(
  EventEmitterMixin<IgcDialogComponentEventMap>(HostAriaMixin(LitElement)),
  i18n
) {
  public static readonly tagName = 'igc-dialog';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDialogComponent, IgcButtonComponent);
  }

  //#region Private state and properties

  private readonly _titleId = nextId();

  private readonly _slots = addSlotController(this, {
    slots: setSlots('title', 'message', 'footer'),
  });

  private readonly _dialogRef = createRef<HTMLDialogElement>();
  private readonly _player = addAnimationController(this, this._dialogRef);

  private readonly _toggleController = addToggleController(this, {
    transition: async (open, signal) => {
      if (open) {
        this.open = true;
        return this._player.playExclusive(fadeIn(), signal);
      }

      this._closing = true;
      // In the same task, so the render after the abort has the backdrop.
      signal.addEventListener('abort', () => (this._closing = false), {
        once: true,
      });
      const completed = await this._player.playExclusive(fadeOut(), signal);

      // A newer request or a direct change of `open` took over.
      if (signal.aborted) {
        return false;
      }

      this._closing = false;

      if (completed) {
        this.open = false;
      }

      return completed;
    },
  });

  @state()
  private _closing = false;

  private get _dialog(): HTMLDialogElement | undefined {
    return this._dialogRef.value;
  }

  //#endregion

  //#region Public properties

  /**
   * Whether the dialog stays open when the user presses the `Escape` key.
   *
   * Use it when the dialog guards unsaved work and needs an explicit user
   * action to close.
   * @attr keep-open-on-escape
   * @default false
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  /**
   * Whether a click on the backdrop, outside the dialog surface, closes the
   * dialog. The close emits the close events.
   *
   * Has no effect when the dialog is not yet open.
   * @attr close-on-outside-click
   * @default false
   */
  @property({ type: Boolean, attribute: 'close-on-outside-click' })
  public closeOnOutsideClick = false;

  /**
   * Whether the default action button in the footer is hidden.
   *
   * Has no effect when content is projected into the `footer` slot, because
   * the slot content replaces the default button.
   * @attr hide-default-action
   * @default false
   */
  @property({ type: Boolean, attribute: 'hide-default-action' })
  public hideDefaultAction = false;

  /**
   * Whether the dialog is open.
   *
   * Setting it skips the animation and the close events. Use the `show()`,
   * `hide()` and `toggle()` methods for an animated transition.
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  @coercedProperty<boolean, IgcDialogComponent>({
    onChange: ({ host, value }) => host._toggleController.sync(value),
  })
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
    addToggleCommands(this);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open')) {
      this._syncDialog();
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

  private _handleClick({ clientX, clientY, target }: PointerEvent): void {
    if (
      this.closeOnOutsideClick &&
      this._dialog === target &&
      !isPointInsideElement(this._dialog, clientX, clientY)
    ) {
      this._closeWithEvent();
    }
  }

  //#endregion

  //#region Internal API

  private _closeWithEvent(): void {
    this._toggleController.hide(true);
  }

  /**
   * Opens or closes the dialog to match `open`. It also runs on the `close`
   * event, so a close that the component cannot cancel, such as a second
   * Escape, does not leave it open with a closed dialog.
   */
  private _syncDialog(): void {
    this.open ? this._dialog?.showModal() : this._dialog?.close();
  }

  //#endregion

  //#region Public API

  /**
   * Opens the dialog with an animated fade-in transition.
   *
   * Returns `true` when the dialog was successfully opened, or `false` if it
   * was already open or opening, the transition was superseded by a newer one,
   * or `open` was set to `false` during it.
   */
  public async show(): Promise<boolean> {
    return this._toggleController.show();
  }

  /**
   * Closes the dialog with an animated fade-out transition.
   *
   * Returns `true` when the dialog was successfully closed, or `false` if it
   * was already closed or closing, the transition was superseded by a newer
   * one, or `open` was set to `false` and then to `true` during it.
   */
  public async hide(): Promise<boolean> {
    return this._toggleController.hide();
  }

  /**
   * Toggles the dialog open or closed depending on its current state.
   *
   * Equivalent to calling `show()` when closed and `hide()` when open.
   * Returns `true` when the transition completed successfully, with the same
   * `false` cases as these methods.
   */
  public async toggle(): Promise<boolean> {
    return this._toggleController.toggle();
  }

  //#endregion

  //#region Render methods

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
          ${
            this.hideDefaultAction
              ? nothing
              : html`
                  <igc-button variant="flat" @click=${this._closeWithEvent}>
                    ${this.resourceStrings.dialog_default_action}
                  </igc-button>
                `
          }
        </slot>
      </footer>
    `;
  }

  protected override render() {
    const hasTitle = this._slots.hasAssignedElements('title') || !!this.title;
    const hasFooter =
      this._slots.hasAssignedElements('footer') || !this.hideDefaultAction;

    return html`
      <dialog
        ${ref(this._dialogRef)}
        part=${partMap({ base: true, titled: hasTitle, footed: hasFooter })}
        ?data-closing=${this._closing}
        role="dialog"
        ${ariaBindings(hostAria(this, { ownLabel: !this.ariaLabel && this._titleId }))}
        @click=${this._handleClick}
        @cancel=${this._handleCancel}
        @close=${this._syncDialog}
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
