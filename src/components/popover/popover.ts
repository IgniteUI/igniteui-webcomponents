import {
  type Middleware,
  type MiddlewareData,
  type Placement,
  arrow,
  autoUpdate,
  computePosition,
  flip,
  inline,
  limitShift,
  offset,
  shift,
  size,
} from '@floating-ui/dom';
import { LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  first,
  getElementByIdFromRoot,
  isEmpty,
  isString,
  roundByDPR,
} from '../common/util.js';
import { styles } from './themes/light/popover.base.css.js';

/**
 * Describes the preferred placement of a toggle component.
 */
export type IgcPlacement =
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
 * @csspart container - The container wrapping the slotted content in the popover.
 */
export default class IgcPopoverComponent extends LitElement {
  public static readonly tagName = 'igc-popover';
  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcPopoverComponent);
  }

  private dispose?: ReturnType<typeof autoUpdate>;
  private target?: Element;

  @query('#container')
  private _container!: HTMLElement;

  @queryAssignedElements({ slot: 'anchor', flatten: true })
  private _anchors!: HTMLElement[];

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
  public placement: IgcPlacement = 'bottom-start';

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

  @watch('anchor')
  protected anchorChange() {
    const newTarget = isString(this.anchor)
      ? getElementByIdFromRoot(this, this.anchor)
      : this.anchor;

    if (newTarget) {
      this.target = newTarget;
      this._updateState();
    }
  }

  @watch('open', { waitUntilFirstUpdate: true })
  protected openChange() {
    this.open ? this.show() : this.hide();
  }

  @watch('arrow', { waitUntilFirstUpdate: true })
  @watch('flip', { waitUntilFirstUpdate: true })
  @watch('inline', { waitUntilFirstUpdate: true })
  @watch('offset', { waitUntilFirstUpdate: true })
  @watch('placement', { waitUntilFirstUpdate: true })
  @watch('sameWidth', { waitUntilFirstUpdate: true })
  @watch('shift', { waitUntilFirstUpdate: true })
  @watch('shiftPadding', { waitUntilFirstUpdate: true })
  protected floatingPropChange() {
    this._updateState();
  }

  public override async connectedCallback() {
    super.connectedCallback();

    await this.updateComplete;
    if (this.open) {
      this.show();
    }
  }

  public override disconnectedCallback() {
    this.hide();
    super.disconnectedCallback();
  }

  protected show() {
    if (!this.target) {
      return;
    }

    this._showPopover();

    this.dispose = autoUpdate(
      this.target,
      this._container,
      this._updatePosition.bind(this)
    );
  }

  protected async hide(): Promise<void> {
    this._hidePopover();

    return new Promise((resolve) => {
      this.dispose?.();
      this.dispose = undefined;
      resolve();
    });
  }

  private _showPopover() {
    this._container?.showPopover();
  }

  private _hidePopover() {
    this._container?.hidePopover();
  }

  private _createMiddleware(): Middleware[] {
    const middleware: Middleware[] = [];
    const styles = this._container.style;

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
          apply: ({ rects }) => {
            Object.assign(styles, { width: `${rects.reference.width}px` });
          },
        })
      );
    } else {
      Object.assign(styles, { width: '' });
    }

    return middleware;
  }

  private async _updateState() {
    if (this.open) {
      await this.hide();
      this.show();
    }
  }

  private async _updatePosition() {
    if (!(this.open && this.target)) {
      return;
    }

    const { x, y, middlewareData, placement } = await computePosition(
      this.target,
      this._container,
      {
        placement: this.placement ?? 'bottom-start',
        middleware: this._createMiddleware(),
        strategy: 'fixed',
      }
    );

    Object.assign(this._container.style, {
      left: 0,
      top: 0,
      transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
    });

    this._positionArrow(placement, middlewareData);
  }

  private _positionArrow(placement: Placement, data: MiddlewareData) {
    if (!(data.arrow && this.arrow)) {
      return;
    }

    const { x, y } = data.arrow;

    // The current placement of the popover along the x/y axis
    const currentPlacement = first(placement.split('-'));

    // The opposite side where the arrow element should render based on the `currentPlacement`
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[currentPlacement]!;

    this.arrow.part = currentPlacement;

    Object.assign(this.arrow.style, {
      left: x != null ? `${roundByDPR(x)}px` : '',
      top: y != null ? `${roundByDPR(y)}px` : '',
      [staticSide]: '-4px',
    });
  }

  private _anchorSlotChange() {
    if (this.anchor || isEmpty(this._anchors)) {
      return;
    }

    this.target = this._anchors[0];
    this._updateState();
  }

  protected override render() {
    return html`
      <slot name="anchor" @slotchange=${this._anchorSlotChange}></slot>
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
