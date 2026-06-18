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
} from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  first,
  getElementByIdFromRoot,
  getRoot,
  isString,
  roundByDPR,
  setStyles,
} from '../common/util.js';
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
 * Walks up the DOM tree of the given element, crossing shadow boundaries, and
 * returns whether any ancestor is positioned as `sticky`.
 */
function hasStickyAncestor(element: Element): boolean {
  let node: Element | null = element;

  while (node) {
    if (getComputedStyle(node).position === 'sticky') {
      return true;
    }

    const root = getRoot(node);
    node =
      node.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }

  return false;
}

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

  private static _oppositeArrowSide = new Map(
    Object.entries({
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    })
  );

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcPopoverComponent);
  }

  //#region Internal properties and state

  private _dispose?: ReturnType<typeof autoUpdate>;
  private _target?: Element;

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
    let targetChanged = false;

    if (properties.has('anchor')) {
      const target = isString(this.anchor)
        ? getElementByIdFromRoot(this, this.anchor)
        : this.anchor;

      if (target) {
        this._target = target;
        targetChanged = true;
      }
    }

    if (this.hasUpdated && properties.has('open')) {
      this._setOpenState(this.open);
    } else if (this.hasUpdated && this.open) {
      targetChanged ? this._resetAutoUpdate() : this._updatePosition();
    }

    super.update(properties);
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this._setOpenState(this.open);
    });
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
    if (isDefault) {
      return;
    }

    const possibleTarget = first(
      this._slots.getAssignedElements('anchor', { flatten: true })
    );

    if (this.anchor || !possibleTarget) {
      return;
    }

    this._target = possibleTarget;

    if (this.open) {
      this._resetAutoUpdate();
    }
  }

  //#region Internal open state API
  private _setOpenState(state: boolean): void {
    state ? this._setDispose() : this._clearDispose();
    this._setPopoverState(state);
  }

  private _setPopoverState(open: boolean): void {
    if (!this._target) {
      return;
    }
    open ? this._container?.showPopover() : this._container?.hidePopover();
  }

  private _setDispose(): void {
    if (!this._target) {
      return;
    }

    this._strategy = hasStickyAncestor(this._target) ? 'fixed' : 'absolute';

    this._dispose = autoUpdate(
      this._target,
      this._container,
      this._updatePosition.bind(this)
    );
  }

  private _clearDispose(): void {
    this._dispose?.();
    this._dispose = undefined;
  }

  private _resetAutoUpdate(): void {
    this._clearDispose();
    this._setDispose();
  }
  //#endregion

  //#region Internal position API

  private _createMiddleware(): Middleware[] {
    const middleware: Middleware[] = [];
    const container = this._container;

    if (this.offset) {
      middleware.push(offset(this.offset));
    }

    if (this.inline) {
      middleware.push(inline());
    }

    if (this.shift) {
      middleware.push(
        shift({
          padding: this.shiftPadding,
          limiter: limitShift(),
        })
      );
    }

    if (this.arrow) {
      middleware.push(arrow({ element: this.arrow }));
    }

    if (this.flip) {
      middleware.push(flip());
    }

    if (this.sameWidth) {
      middleware.push(
        size({
          apply: ({ rects }) =>
            setStyles(container, { width: `${rects.reference.width}px` }),
        })
      );
    } else {
      setStyles(container, { width: '' });
    }

    return middleware;
  }

  private async _updatePosition(): Promise<void> {
    if (!(this.open && this._target)) {
      return;
    }

    const strategy = this._strategy;

    const { x, y, middlewareData, placement } = await computePosition(
      this._target,
      this._container,
      {
        placement: this.placement ?? 'bottom-start',
        middleware: this._createMiddleware(),
        strategy,
      }
    );

    setStyles(this._container, {
      position: strategy,
      left: '0',
      top: '0',
      transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
    });

    this._updateArrowPosition(placement, middlewareData);
  }

  private _updateArrowPosition(placement: Placement, data: MiddlewareData) {
    if (!(data.arrow && this.arrow)) {
      return;
    }

    const { x, y } = data.arrow;
    const arrow = this.arrow;
    const offset = this.arrowOffset;

    // The current placement of the popover along the x/y axis
    const currentPlacement = first(placement.split('-'));

    // The opposite side where the arrow element should render based on the `currentPlacement`
    const staticSide =
      IgcPopoverComponent._oppositeArrowSide.get(currentPlacement)!;

    arrow.part = currentPlacement;

    setStyles(arrow, {
      left: x != null ? `${roundByDPR(x + offset)}px` : '',
      top: y != null ? `${roundByDPR(y + offset)}px` : '',
      [staticSide]: '-4px',
    });
  }

  //#endregion

  protected override render() {
    return html`
      <slot name="anchor"></slot>
      <div id="container" part="container" popover="manual">
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
