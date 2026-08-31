import { html, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import {
  addSlotController,
  type SlotChangeCallbackParameters,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { firstOf } from '#internals/utils/arrays.js';
import { getElementByIdFromRoot, isPopoverOpen } from '#internals/utils/dom.js';
import { isString } from '#internals/utils/types.js';
import type { PopoverScrollStrategy } from '../types.js';
import { FloatingPositionStrategy } from './position/floating.js';
import {
  NativePositionStrategy,
  shouldUseNativeAnchorPositioning,
} from './position/native.js';
import {
  type PopoverPositionStrategy,
  resolvePlacement,
} from './position/types.js';
import { styles } from './themes/light/popover.base.css.js';

/**
 * Describes the preferred placement of a toggle component.
 */
export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/**
 * The `scroll` event is not cancelable. A passive listener does not delay the
 * scroll, so the listener uses the passive option.
 */
const scrollListenerOptions: AddEventListenerOptions = {
  capture: true,
  passive: true,
};

/* blazorSuppress */
/**
 * @element igc-popover
 *
 * @slot - Content of the popover.
 * @slot anchor - The element the popover will be anchored to.
 *
 * @fires igcPopoverScrollClose - The popover emits this event when the document scrolls.
 * The popover emits it only if the popover is open and the scroll strategy is `close`.
 * The popover does not control its own `open` state. The component that owns that state must close the popover.
 * The event does not bubble. Add the listener directly on the popover element.
 *
 * @csspart container - The container wrapping the slotted content in the popover.
 */
export default class IgcPopoverComponent extends LitElement {
  public static readonly tagName = 'igc-popover';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcPopoverComponent);
  }

  //#region Internal properties and state

  private _target?: Element;
  private _positionStrategy?: PopoverPositionStrategy;

  /**
   * The anchor that the container currently shows against.
   *
   * The browser binds the implicit anchor only when `showPopover({ source })`
   * runs. Therefore the native strategy must hide the container and show it
   * again if the anchor changes while the popover is open.
   */
  private _shownSource?: Element;

  private readonly _slots = addSlotController(this, {
    slots: setSlots('anchor'),
    onChange: this._handleSlotChange,
  });

  @query('#container', true)
  private readonly _container!: HTMLElement;

  //#endregion

  //#region Public attributes and properties

  /**
   * Pass an IDREF or an DOM element reference to use as the
   * anchor target for the floating element.
   */
  @property()
  public anchor?: Element | string;

  /**
   * Element to render as an "arrow" element for the current popover.
   */
  @property({ attribute: false })
  public arrow: HTMLElement | null = null;

  /** Additional offset to apply to the arrow element if enabled. */
  @property({ type: Number, attribute: 'arrow-offset' })
  public arrowOffset = 0;

  /**
   * When enabled this changes the placement of the floating element in order to keep it
   * in view along the main axis.
   */
  @property({ type: Boolean, reflect: true })
  public flip = false;

  /**
   * Placement modifier which translates the floating element along the main axis.
   */
  @property({ type: Number })
  public offset = 0;

  /**
   * The visibility state of the popover component.
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /**
   * Where to place the floating element relative to the parent anchor element.
   */
  @property()
  public placement: PopoverPlacement = 'bottom-start';

  /**
   * When enabled the floating element will match the width of its parent anchor element.
   */
  @property({ type: Boolean, reflect: true, attribute: 'same-width' })
  public sameWidth = false;

  /**
   * Sets the behavior of the popover when an ancestor scroll container
   * scrolls and the popover is open.
   *
   * If the value is `hide`, the popover hides while the anchor is fully out
   * of view. The popover shows again when the anchor returns to view. `hide`
   * is the default value.
   *
   * If the value is `scroll`, the popover stays visible. The popover also
   * stays anchored while the anchor is out of view.
   *
   * If the value is `close`, the popover behaves as for `hide`. The popover
   * also emits `igcPopoverScrollClose` for each scroll. The component that
   * owns the `open` state must then close the popover.
   */
  @property({ attribute: 'scroll-strategy' })
  public scrollStrategy: PopoverScrollStrategy = 'hide';

  //#endregion

  //#region Life-cycle hooks

  protected override update(properties: PropertyValues<this>): void {
    if (this.hasUpdated) {
      if (properties.has('open') || properties.has('anchor')) {
        this._setOpenState(this.open);
      } else if (this.open) {
        this._positionStrategy?.update();
      }

      if (properties.has('scrollStrategy')) {
        this._syncScrollStrategy(this.open);
      }
    }

    super.update(properties);
  }

  protected override firstUpdated(): void {
    this._setOpenState(this.open);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();

    if (this.hasUpdated) {
      this._setOpenState(this.open);
    }
  }

  /** @internal */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._setOpenState(false);
  }

  //#endregion

  private _handleSlotChange({
    isDefault,
  }: SlotChangeCallbackParameters<unknown>): void {
    if (isDefault || this.anchor) {
      return;
    }

    this._setOpenState(this.open);
  }

  private _handleToggle(): void {
    if (!isPopoverOpen(this._container)) {
      this._positionStrategy?.detach();
    }
  }

  //#region Internal open state API

  private _getPositionStrategy(target: Element): PopoverPositionStrategy {
    const useNative = shouldUseNativeAnchorPositioning(target);
    const current = this._positionStrategy;

    if (current?.native === useNative) {
      return current;
    }

    if (current) {
      current.detach();
      current.clear();
    }

    const callbacks = { onAnchorRemoved: () => this._handleAnchorRemoved() };

    this._positionStrategy = useNative
      ? new NativePositionStrategy(this, callbacks)
      : new FloatingPositionStrategy(this, callbacks);

    return this._positionStrategy;
  }

  private _handleAnchorRemoved(): void {
    this._target = undefined;
    this._positionStrategy?.detach();
    this._setPopoverState(false);
  }

  /**
   * An unresolved IDREF keeps the current target, so that an anchor rendered
   * after this popover is picked up the next time it opens.
   */
  private _resolveTarget(): Element | undefined {
    if (isString(this.anchor)) {
      return getElementByIdFromRoot(this, this.anchor) ?? this._target;
    }

    return (
      this.anchor ??
      firstOf(this._slots.getAssignedElements('anchor', { flatten: true }))
    );
  }

  private _setOpenState(state: boolean): void {
    this._positionStrategy?.detach();

    if (state) {
      this._target = this._resolveTarget();

      if (this._target) {
        this._getPositionStrategy(this._target).attach(
          this._target,
          this._container
        );
      }
    }

    this._setPopoverState(state);
    this._syncScrollStrategy(state);
  }

  /**
   * The popover adds one listener on the document. It adds the listener only
   * when the popover is open and the scroll strategy is `close`. Every other
   * value adds no listener.
   *
   * The listener reference is stable. Therefore `addEventListener` and
   * `removeEventListener` are idempotent, and this method needs no state.
   */
  private _syncScrollStrategy(active: boolean): void {
    active && this.scrollStrategy === 'close'
      ? document.addEventListener(
          'scroll',
          this._handleRootScroll,
          scrollListenerOptions
        )
      : document.removeEventListener(
          'scroll',
          this._handleRootScroll,
          scrollListenerOptions
        );
  }

  private readonly _handleRootScroll = (): void => {
    this.dispatchEvent(new CustomEvent('igcPopoverScrollClose'));
  };

  private _setPopoverState(state: boolean): void {
    const container = this._container;

    if (!container) {
      return;
    }

    const shouldOpen = state && this._target != null;

    if (shouldOpen !== isPopoverOpen(container)) {
      shouldOpen ? this._showPopover() : this._hidePopover();
    } else if (
      shouldOpen &&
      this._positionStrategy?.native &&
      this._target !== this._shownSource
    ) {
      // Change the anchor while the popover stays open.
      // The browser combines the `toggle` events of a hide and a show in the
      // same task into one open-to-open transition. Therefore
      // `_handleToggle` does nothing here.
      // Two limitations are known and accepted. A CSS transition on
      // `:popover-open` of the container restarts, but the container has no
      // such transition today. The focus inside the popover moves out and
      // then back.
      this._hidePopover();
      this._showPopover();
    }
  }

  private _showPopover(): void {
    const container = this._container;
    const strategy = this._positionStrategy;

    if (strategy?.native) {
      container.showPopover({ source: this._target as HTMLElement });
      this._shownSource = this._target;
      // The browser positions the container now. Update the arrow to match.
      strategy.update();
    } else {
      container.showPopover();
    }
  }

  private _hidePopover(): void {
    this._shownSource = undefined;
    this._container.hidePopover();
  }

  //#endregion

  protected override render() {
    return html`
      <slot name="anchor"></slot>
      <div
        id="container"
        part="container"
        popover="manual"
        data-placement=${resolvePlacement(this)}
        data-scroll-strategy=${this.scrollStrategy}
        @toggle=${this._handleToggle}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-popover': IgcPopoverComponent;
  }
}
