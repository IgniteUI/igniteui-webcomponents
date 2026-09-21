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
import { toggleEventListener } from '#internals/utils/events.js';
import { isString } from '#internals/utils/types.js';
import type { PopoverScrollStrategy } from '../types.js';
import { FloatingPositionStrategy } from './position/floating.js';
import {
  NativePositionStrategy,
  shouldUseNativeAnchorPositioning,
} from './position/native.js';
import type { PopoverPositionStrategy } from './position/strategy.js';
import {
  type PopoverPositionStrategyMode,
  resolvePlacement,
  SCROLL_LISTENER_OPTIONS,
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

/* blazorSuppress */
/**
 * @element igc-popover
 *
 * @slot - Content of the popover.
 * @slot anchor - The element the popover will be anchored to.
 *
 * @fires igcPopoverScrollClose - The popover emits this event on each document scroll,
 * but only while it shows against its anchor and the scroll strategy is `close`.
 * The popover does not control its own `open` state, so the component that owns that state must close it.
 * The event does not bubble, so add the listener on the popover element.
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
  private _positionMode?: PopoverPositionStrategyMode;

  private readonly _slots = addSlotController(this, {
    slots: setSlots('anchor'),
    onChange: this._handleSlotChange,
  });

  @query('#container', true)
  private readonly _container!: HTMLElement;

  //#endregion

  //#region Public attributes and properties

  /**
   * Pass an IDREF or a DOM element reference to use as the
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
        this._syncScrollStrategy();
      }
    }

    super.update(properties);
  }

  protected override firstUpdated(): void {
    this._setOpenState(this.open);
  }

  /**
   * Also waits for the position strategy. The fallback strategy positions
   * asynchronously, so the container has no position when Lit finishes the
   * update.
   */
  protected override async getUpdateComplete(): Promise<boolean> {
    const complete = await super.getUpdateComplete();
    await this._positionStrategy?.whenPositioned();

    return complete;
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

  //#region Internal open state API

  private _getPositionStrategy(target: Element): PopoverPositionStrategy {
    const mode = shouldUseNativeAnchorPositioning(target)
      ? 'native'
      : 'floating';

    if (this._positionStrategy && this._positionMode === mode) {
      return this._positionStrategy;
    }

    this._positionStrategy?.detach();
    this._positionStrategy?.clear();

    this._positionMode = mode;
    this._positionStrategy =
      mode === 'native'
        ? new NativePositionStrategy(this, this._handleAnchorRemoved)
        : new FloatingPositionStrategy(this, this._handleAnchorRemoved);

    return this._positionStrategy;
  }

  /**
   * Hides the container if the anchor leaves the DOM. The `open` property
   * keeps its value, so the popover shows again when a new anchor resolves.
   */
  private readonly _handleAnchorRemoved = (): void => {
    this._target = undefined;
    this._setOpenState(false);
  };

  /**
   * An unresolved IDREF keeps the current target. Thus the popover finds an
   * anchor that renders after it, at the next open.
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
    if (state) {
      this._target = this._resolveTarget();
    }

    if (state && this._target) {
      // `attach` also detaches the previous open cycle.
      this._getPositionStrategy(this._target).attach(
        this._target,
        this._container
      );
    } else {
      this._positionStrategy?.detach();
    }

    this._syncContainerState(state);
  }

  /**
   * Binds one document `scroll` listener while the container shows and the
   * scroll strategy is `close`. It reads the container, because the container
   * can stay closed while `open` is true.
   */
  private _syncScrollStrategy(): void {
    toggleEventListener(
      document,
      isPopoverOpen(this._container) && this.scrollStrategy === 'close',
      'scroll',
      this._handleRootScroll,
      SCROLL_LISTENER_OPTIONS
    );
  }

  private readonly _handleRootScroll = (): void => {
    this.dispatchEvent(new CustomEvent('igcPopoverScrollClose'));
  };

  /** Shows or hides the container and then syncs the scroll listener. */
  private _syncContainerState(state: boolean): void {
    if (!this._container) {
      return;
    }

    if (state && this._target) {
      this._positionStrategy?.show();
    } else {
      this._positionStrategy?.hide();
    }

    this._syncScrollStrategy();
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
