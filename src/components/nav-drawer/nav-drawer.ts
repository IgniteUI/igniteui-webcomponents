import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
 * A side navigation container that provides
 * quick access between views within an application.
 *
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
 * @csspart base - The base wrapper of the drawer.
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
  private readonly _miniRef = createRef<HTMLElement>();

  private readonly _slots = addSlotController(this, {
    slots: setSlots('mini'),
    onChange: this._handleMiniState,
  });

  private get _dialog(): HTMLDialogElement | undefined {
    return this._dialogRef.value;
  }

  private get _mini(): HTMLElement | undefined {
    return this._miniRef.value;
  }

  private get _hasMiniContent(): boolean {
    return this._slots.hasAssignedElements('mini');
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

  /**
   * Sets an accessible label for the drawer.
   *
   * In non-relative positions this label is applied to the modal `<dialog>` element.
   * In `relative` position it labels the `<nav>` landmark.
   *
   * When multiple navigation landmarks exist on the page each should receive a
   * distinct label so screen-reader users can differentiate between them.
   *
   * @attr label
   */
  @property()
  public label?: string;

  //#endregion

  //#region Lit Lifecycle

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('position') && this._isRelative) {
      this._dialog?.close();
      const mini = this._mini;
      if (mini?.matches(':popover-open')) {
        mini.hidePopover();
      }
    }

    super.update(properties);
  }

  protected override updated(properties: PropertyValues<this>): void {
    if (properties.has('open') || properties.has('position')) {
      this._handleOpenState();
      this._handleMiniState();
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

  private _handleMiniState(): void {
    if (this._isRelative) {
      return;
    }

    const mini = this._mini;
    if (!mini) {
      return;
    }

    const isPopoverOpen = mini.matches(':popover-open');

    if (!this._hasMiniContent || this.open) {
      if (isPopoverOpen) {
        mini.hidePopover();
      }
    } else if (!isPopoverOpen) {
      mini.showPopover();
    }
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
      <nav
        ${ref(this._miniRef)}
        part=${partMap({
          mini: true,
          hidden: !this._hasMiniContent,
        })}
        .inert=${this.open}
        .popover=${!this._isRelative ? 'manual' : null}
      >
        <slot name="mini"></slot>
      </nav>
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
        aria-modal="true"
        aria-label=${ifDefined(this.label)}
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
      <nav part="base" aria-label=${ifDefined(this.label)} .inert=${!this.open}>
        ${this._renderContent()}
      </nav>
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
