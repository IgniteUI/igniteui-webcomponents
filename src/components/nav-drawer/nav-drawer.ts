import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref } from 'lit/directives/ref.js';
import {
  type ARIABindings,
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
import { partMap } from '#internals/part-map.js';
import {
  getDeepActiveElement,
  getRoot,
  isPointInsideElement,
} from '#internals/utils/dom.js';
import { all } from '#themes/nav-drawer/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { NavDrawerPosition } from '../types.js';
import IgcNavDrawerHeaderItemComponent from './nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from './nav-drawer-item.js';
import { styles } from './themes/container.base.css.js';
import { styles as shared } from './themes/shared/container/nav-drawer.common.css.js';

export interface IgcNavDrawerComponentEventMap {
  igcClosing: CustomEvent<void>;
  igcClosed: CustomEvent<void>;
}

/** Names the drawer by the host `aria-labelledby`, `label`, or `aria-label`. */
function drawerAria(drawer: IgcNavDrawerComponent): ARIABindings {
  const aria = hostAria(drawer);
  return { ...aria, label: drawer.label ?? aria.label };
}

/**
 * A side navigation container that provides
 * quick access between views within an application.
 *
 * The edge positions (`start`, `end`, `top`, `bottom`) render a modal `<dialog>`
 * with a focus trap and a backdrop. The `relative` position renders an inline
 * `<nav>` landmark.
 *
 * Content in the `mini` slot renders a compact variant, which shows while the
 * drawer is closed.
 *
 * The component integrates with the
 * [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):
 * an Ignite button or a native `<button>` with `command="--show"` / `"--hide"` / `"--toggle"`
 * and `commandfor` pointing to this element calls the corresponding method
 * declaratively without any JavaScript.
 *
 * @element igc-nav-drawer
 *
 * @fires igcClosing - Emitted before a user interaction closes the drawer. Cancelable -
 *   call `event.preventDefault()` to abort the closing sequence.
 * @fires igcClosed - Emitted after a user interaction closes the drawer and the exit ends.
 *
 * @slot - Renders the main navigation content of the drawer.
 * @slot mini - Renders the compact mini variant of the drawer.
 *
 * @csspart base - The base wrapper of the drawer.
 * @csspart main - The main content container of the drawer.
 * @csspart mini - The mini variant container of the drawer.
 * @csspart hidden - Added to the mini part when the mini slot has no content.
 */
export default class IgcNavDrawerComponent extends EventEmitterMixin<IgcNavDrawerComponentEventMap>(
  HostAriaMixin(LitElement)
) {
  public static readonly tagName = 'igc-nav-drawer';
  public static override styles = [componentBase, styles, shared];

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

  /** The focused element at the first open. It gets the focus back after the close. */
  private _opener: HTMLElement | null = null;

  /** The running exit. It settles when the dialog closes or opens again. */
  private _exit?: Promise<void>;

  private readonly _toggleController = addToggleController(this, {
    transition: async (open) => {
      this.open = open;
      await this.updateComplete;

      if (!open) {
        await this._exit;
      }

      return true;
    },
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots('mini'),
  });

  private get _dialog(): HTMLDialogElement | undefined {
    return this._dialogRef.value;
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
   * The position of the drawer.
   *
   * - `start` - anchored to the inline-start edge (default).
   * - `end` - anchored to the inline-end edge.
   * - `top` - anchored to the block-start edge.
   * - `bottom` - anchored to the block-end edge.
   * - `relative` - rendered inline within the page flow; no modal backdrop.
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
  @coercedProperty<boolean, IgcNavDrawerComponent>({
    onChange: ({ host, value }) => host._toggleController.sync(value),
  })
  public open = false;

  /**
   * Whether the drawer stays open when the user presses Escape. Applies only to the
   * edge positions, because Escape does not close a relative drawer.
   *
   * @attr keep-open-on-escape
   * @default false
   */
  @property({ type: Boolean, attribute: 'keep-open-on-escape' })
  public keepOpenOnEscape = false;

  /**
   * The accessible label of the `<dialog>`, or of the `<nav>` landmark in the `relative`
   * position, and of the mini variant. Give each navigation landmark on a page a distinct label.
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
    addToggleCommands(this);
  }

  protected override update(properties: PropertyValues<this>): void {
    // `cache` keeps the dialog while the drawer is relative. A modal dialog that leaves the
    // document comes back open but not modal, and `showModal()` then throws, so close it.
    // A relative drawer does not return the focus, so drop the opener.
    if (properties.has('position') && this._isRelative) {
      this._dialog?.close();
      this._opener = null;
    }

    super.update(properties);
  }

  protected override updated(): void {
    // The opener can be in the mini variant, so hide the mini variant after the dialog opens,
    // and show it before the dialog closes. A slot change also requests an update.
    if (this.open) {
      this._syncDialog();
      this._handleMiniState();
    } else {
      this._handleMiniState();
      this._syncDialog();
    }
  }

  //#endregion

  //#region Event handlers

  private _handleMiniState(): void {
    if (!this._isRelative) {
      this._miniRef.value?.togglePopover(this._hasMiniContent && !this.open);
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
   * Matches the dialog to `open`. It also runs on `close`, so it opens a dialog again that the
   * platform closed while `open` stays true, as on a second Escape. A dialog that opens again
   * records the focus at that time, so the drawer keeps the first opener.
   */
  private _syncDialog(): void {
    const dialog = this._dialog;

    if (this.open) {
      if (dialog && !dialog.open) {
        this._opener ??= getDeepActiveElement(getRoot(this));
        dialog.showModal();
      }
    } else if (dialog?.open) {
      this._exit ??= this._closeAfterExit(dialog);
    } else {
      this._returnFocus();
    }
  }

  /**
   * Closes the dialog when its exit transitions end, so that the exit runs in the top layer
   * also without `overlay` support.
   */
  private async _closeAfterExit(dialog: HTMLDialogElement): Promise<void> {
    const running = () =>
      dialog
        .getAnimations({ subtree: true })
        .filter((animation) => animation instanceof CSSTransition);

    // A reopen or a change of the position replaces the transitions.
    for (
      let exit = running();
      exit.length > 0 && !this.open;
      exit = running()
    ) {
      await Promise.allSettled(exit.map(({ finished }) => finished));
    }
    this._exit = undefined;

    // A reopen during the exit keeps the dialog.
    if (!this.open) {
      dialog.close();
      this._returnFocus();
    }
  }

  /** Focuses the opener when the dialog did not. */
  private _returnFocus(): void {
    if (this._opener?.matches(':focus-within') === false) {
      this._opener.focus({ preventScroll: true });
    }
    this._opener = null;
  }

  //#endregion

  //#region Public API

  /** Opens the drawer. Returns `true` on success, or `false` when it is already open. */
  public async show(): Promise<boolean> {
    return this._toggleController.show();
  }

  /**
   * Closes the drawer. Returns `true` after the exit, or `false` when it is already closed or a
   * reopen ends the exit.
   */
  public async hide(): Promise<boolean> {
    return this._toggleController.hide();
  }

  /** Toggles the open state of the drawer. */
  public toggle(): Promise<boolean> {
    return this._toggleController.toggle();
  }

  //#endregion

  private _renderMiniVariant(aria: ARIABindings) {
    const empty = !this._hasMiniContent;

    return html`
      <nav
        ${ref(this._miniRef)}
        ${ariaBindings({ ...aria, describedBy: null })}
        part=${partMap({ mini: true, hidden: empty })}
        .inert=${this.open || empty}
        .popover=${this._isRelative ? null : 'manual'}
      >
        <slot name="mini"></slot>
      </nav>
    `;
  }

  private _renderBase(aria: ARIABindings) {
    const content = html`
      <div part="main">
        <slot></slot>
      </div>
    `;

    return this._isRelative
      ? html`
          <nav part="base" ${ariaBindings(aria)} .inert=${!this.open}>
            ${content}
          </nav>
        `
      : html`
          <dialog
            ${ref(this._dialogRef)}
            part="base"
            aria-modal="true"
            ${ariaBindings(aria)}
            @click=${this._handleClick}
            @cancel=${this._handleCancel}
            @close=${this._syncDialog}
          >
            ${content}
          </dialog>
        `;
  }

  protected override render() {
    const aria = drawerAria(this);

    return html`
      ${cache(this._renderBase(aria))} ${this._renderMiniVariant(aria)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-nav-drawer': IgcNavDrawerComponent;
  }
}
