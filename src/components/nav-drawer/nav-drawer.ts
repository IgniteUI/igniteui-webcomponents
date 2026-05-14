import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import { bindIf, numberInRangeInclusive } from '../common/util.js';
import type { NavDrawerPosition } from '../types.js';
import IgcNavDrawerHeaderItemComponent from './nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from './nav-drawer-item.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/container/nav-drawer.common.css.js';

export interface IgcNavDrawerComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/**
 * `igc-nav-drawer` is a side navigation container that provides
 * quick access between views within an application.
 *
 * For non-relative positions the drawer is rendered as a native modal `<dialog>` element,
 * providing built-in accessibility support and Escape key handling.
 * In `relative` position mode it renders as an inline element and applies `inert`
 * to the content when closed.
 *
 * When content is provided in the `mini` slot, a compact icon-only variant is
 * displayed alongside the main drawer.
 *
 * @element igc-nav-drawer
 *
 * @fires igcClosing - Emitted just before the drawer is closed by a user interaction. Cancelable.
 * @fires igcClosed - Emitted just after the drawer is closed by a user interaction.
 *
 * @slot - Renders the main navigation content of the drawer.
 * @slot mini - Renders the compact mini variant of the drawer.
 *
 * @csspart base - The base wrapper of the drawer. A `<dialog>` element for non-relative positions, a `<div>` for relative.
 * @csspart main - The main content container of the drawer.
 * @csspart mini - The mini variant container of the drawer.
 */
export default class IgcNavDrawerComponent extends EventEmitterMixin<
  IgcNavDrawerComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-nav-drawer';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcNavDrawerComponent,
      IgcNavDrawerHeaderItemComponent,
      IgcNavDrawerItemComponent
    );
  }

  //#region Internal state

  private readonly _dialogRef = createRef<HTMLDialogElement>();

  private readonly _slots = addSlotController(this, {
    slots: setSlots('mini'),
  });

  private get _dialog(): HTMLDialogElement | undefined {
    return this._dialogRef.value;
  }

  private get _isRelative(): boolean {
    return this.position === 'relative';
  }

  //#endregion

  //#region Public properties

  /**
   * Sets the position of the drawer.
   *
   * - `start` — anchored to the inline-start edge (default).
   * - `end` — anchored to the inline-end edge.
   * - `top` — anchored to the block-start edge.
   * - `bottom` — anchored to the block-end edge.
   * - `relative` — rendered inline within the page flow; no modal backdrop.
   *
   * @attr position
   * @default 'start'
   */
  @property({ reflect: true })
  public position: NavDrawerPosition = 'start';

  /**
   * Whether the drawer is open.
   *
   * @attr open
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Determines whether the drawer should remain open when the Escape key is pressed.
   *
   * This attribute is only applicable when the drawer is in a non-relative position,
   * as the Escape key does not trigger the closing of relative drawers.
   *
   * @attr keep-open-on-escape
   * @default false
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  //#endregion

  //#region Lit Lifecycle

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('position') && this._isRelative) {
      this._dialog?.close();
    }

    super.update(properties);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open') || properties.has('position')) {
      this._handleOpenState();
    }
  }

  //#endregion

  //#region Event handlers

  private _handleOpenState(): void {
    if (this._isRelative) {
      return;
    }

    this.open ? this._dialog?.showModal() : this._dialog?.close();
  }

  private _handleCancel(event: Event): void {
    event.preventDefault();

    if (!this.keepOpenOnEscape) {
      this._closeWithEvent();
    }
  }

  private _handleClose(): void {
    if (this.open) {
      this._dialog?.showModal();
    }
  }

  private _handleClick({ clientX, clientY, target }: PointerEvent): void {
    if (this._dialog === target) {
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

  private _emitClosing(): boolean {
    return this.emitEvent('igcClosing', { cancelable: true });
  }

  private async _closeWithEvent(): Promise<boolean> {
    if (!(this.open && this._emitClosing())) {
      return false;
    }

    this.open = false;
    await this.updateComplete;

    this.emitEvent('igcClosed');
    return true;
  }

  //#endregion

  //#region Public API

  /** Opens the drawer. Returns `true` if the operation was successful, `false` if the drawer was already open. */
  public async show(): Promise<boolean> {
    if (this.open) {
      return false;
    }

    this.open = true;
    await this.updateComplete;

    return true;
  }

  /** Closes the drawer. Returns `true` if the operation was successful, `false` if the drawer was already closed. */
  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    this.open = false;
    await this.updateComplete;

    return true;
  }

  /** Toggles the open state of the drawer. Delegates to `show()` or `hide()` depending on the current state. */
  public toggle(): Promise<boolean> {
    return this.open ? this.hide() : this.show();
  }

  //#endregion

  private _renderMiniVariant() {
    return html`
      <div
        part=${partMap({
          mini: true,
          hidden: !this._slots.hasAssignedElements('mini'),
        })}
      >
        <slot name="mini"></slot>
      </div>
    `;
  }

  private _renderContent() {
    return html`
      <div part="main">
        <slot></slot>
      </div>
    `;
  }

  private _renderDialog() {
    return html`
      <dialog
        ${ref(this._dialogRef)}
        part="base"
        @click=${this._handleClick}
        @cancel=${this._handleCancel}
        @close=${bindIf(this.keepOpenOnEscape, this._handleClose)}
      >
        ${this._renderContent()}
      </dialog>
      ${this._renderMiniVariant()}
    `;
  }

  private _renderRelative() {
    return html`
      <div part="base" .inert=${!this.open}>${this._renderContent()}</div>
      ${this._renderMiniVariant()}
    `;
  }

  protected override render() {
    return html`${cache(
      this._isRelative ? this._renderRelative() : this._renderDialog()
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer': IgcNavDrawerComponent;
  }
}
