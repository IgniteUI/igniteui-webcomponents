import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  inline,
  limitShift,
  type Middleware,
  type MiddlewareData,
  offset,
  type Placement,
  shift,
  size,
} from '@floating-ui/dom';
import { html, LitElement, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import {
  addSlotController,
  type SlotChangeCallbackParameters,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { firstOf } from '#internals/utils/arrays.js';
import {
  getElementByIdFromRoot,
  hasStickyAncestor,
  isPopoverOpen,
  roundByDPR,
  setStyles,
} from '#internals/utils/dom.js';
import { isString } from '#internals/utils/types.js';
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

const OPPOSITE_SIDE = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
} as const;

type PopoverSide = keyof typeof OPPOSITE_SIDE;

const SIDES = Object.keys(OPPOSITE_SIDE) as PopoverSide[];

/* blazorSuppress */
/**
 * @element igc-popover
 *
 * @slot - Content of the popover.
 * @slot anchor - The element the popover will be anchored to.
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

  private _dispose?: ReturnType<typeof autoUpdate>;
  private _target?: Element;
  private _middleware?: Middleware[];
  private _positionId = 0;

  /**
   * The positioning strategy resolved when the popover is opened. The `fixed`
   * strategy is used when the anchor has a `position: sticky` ancestor, otherwise
   * the default `absolute` strategy is used. Cached here to avoid repeated DOM
   * traversals and style reflows on every scroll/resize reposition.
   *
   * Also, time to migrate to CSS Anchor positioning!!!
   */
  private _strategy: 'absolute' | 'fixed' = 'absolute';

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
   * Improves positioning for inline reference elements that span over multiple lines.
   * Useful for tooltips or similar components.
   */
  @property({ type: Boolean, reflect: true })
  public inline = false;

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
   * When enabled this tries to shift the floating element along the main axis
   * keeping it in view, preventing overflow while maintaining the desired placement.
   */
  @property({ type: Boolean, reflect: true })
  public shift = false;

  /**
   * Virtual padding for the resolved overflow detection offsets in pixels.
   */
  @property({ type: Number, attribute: 'shift-padding' })
  public shiftPadding = 0;

  //#endregion

  //#region Life-cycle hooks

  protected override update(properties: PropertyValues<this>): void {
    if (this.hasUpdated) {
      this._middleware = undefined;

      if (properties.has('sameWidth') && !this.sameWidth) {
        setStyles(this._container, { width: '' });
      }

      if (properties.has('open') || properties.has('anchor')) {
        this._setOpenState(this.open);
      } else if (this.open) {
        this._updatePosition();
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
      this._clearDispose();
    }
  }

  //#region Internal open state API

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
    this._clearDispose();

    if (state) {
      this._target = this._resolveTarget();

      if (this._target) {
        this._strategy = hasStickyAncestor(this._target) ? 'fixed' : 'absolute';
        this._dispose = autoUpdate(
          this._target,
          this._container,
          this._updatePosition.bind(this)
        );
      }
    }

    this._setPopoverState(state);
  }

  private _setPopoverState(state: boolean): void {
    const container = this._container;

    if (!container) {
      return;
    }

    const shouldOpen = state && this._target != null;

    if (shouldOpen !== isPopoverOpen(container)) {
      shouldOpen ? container.showPopover() : container.hidePopover();
    }
  }

  private _clearDispose(): void {
    this._dispose?.();
    this._dispose = undefined;
  }

  //#endregion

  //#region Internal position API

  private get _placement(): PopoverPlacement {
    return this.placement ?? 'bottom-start';
  }

  private _createMiddleware(): Middleware[] {
    const shiftMiddleware = this.shift
      ? shift({ padding: this.shiftPadding, limiter: limitShift() })
      : null;
    const flipMiddleware = this.flip ? flip() : null;

    // Aligned placements flip before shifting, base placements shift first.
    // See https://floating-ui.com/docs/flip
    const positioners = this._placement.includes('-')
      ? [flipMiddleware, shiftMiddleware]
      : [shiftMiddleware, flipMiddleware];

    const chain = [
      this.offset !== 0 ? offset(this.offset) : null,
      this.inline ? inline() : null,
      ...positioners,
      this.sameWidth
        ? size({
            apply: ({ rects }) =>
              setStyles(this._container, {
                width: `${rects.reference.width}px`,
              }),
          })
        : null,
      this.arrow ? arrow({ element: this.arrow }) : null,
    ];

    return chain.filter((entry): entry is Middleware => entry !== null);
  }

  private async _updatePosition(): Promise<void> {
    if (!this.open) {
      return;
    }

    if (!this._target?.isConnected) {
      this._target = undefined;
      this._clearDispose();
      this._setPopoverState(false);
      return;
    }

    const positionId = ++this._positionId;
    const strategy = this._strategy;

    const { x, y, middlewareData, placement } = await computePosition(
      this._target,
      this._container,
      {
        placement: this._placement,
        middleware: (this._middleware ??= this._createMiddleware()),
        strategy,
      }
    );

    if (positionId !== this._positionId || !this.open) {
      return;
    }

    setStyles(this._container, {
      position: strategy,
      left: '0',
      top: '0',
      transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
    });

    this._updateArrowPosition(placement, middlewareData);
  }

  private _updateArrowPosition(
    placement: Placement,
    data: MiddlewareData
  ): void {
    const element = this.arrow;

    if (!(data.arrow && element)) {
      return;
    }

    const { x, y } = data.arrow;
    const offset = this.arrowOffset;
    const [side] = placement.split('-') as [PopoverSide];
    const staticSide = OPPOSITE_SIDE[side];

    if (!element.part.contains(side)) {
      element.part.remove(...SIDES);
      element.part.add(side);
    }

    // Measured after the part switch, since it is what gives the arrow its size.
    const inset =
      staticSide === 'top' || staticSide === 'bottom'
        ? element.offsetHeight
        : element.offsetWidth;

    // Every side is reset, otherwise the inset of the previous placement is left
    // behind and over-constrains the arrow.
    const styles: Partial<CSSStyleDeclaration> = {
      top: y != null ? `${roundByDPR(y + offset)}px` : '',
      right: '',
      bottom: '',
      left: x != null ? `${roundByDPR(x + offset)}px` : '',
    };

    styles[staticSide] = `${-inset}px`;

    setStyles(element, styles);
  }

  //#endregion

  protected override render() {
    return html`
      <slot name="anchor"></slot>
      <div
        id="container"
        part="container"
        popover="manual"
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
