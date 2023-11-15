import {
  Middleware,
  autoUpdate,
  computePosition,
  flip,
  limitShift,
  offset,
  shift,
  size,
} from '@floating-ui/dom';
import { LitElement, html } from 'lit';
import { property, query, queryAssignedElements } from 'lit/decorators.js';

import { styles } from './themes/light/popover.base.css.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { getElementByIdFromRoot } from '../common/util.js';

function roundByDPR(value: number) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(value * dpr) / dpr;
}

export type IgcPopoverPlacement =
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
 * @element igc-popover
 *
 * @slot - Content of the popover.
 * @slot anchor - The element the popover will be anchored to.
 */
export default class IgcPopoverComponent extends LitElement {
  public static readonly tagName = 'igc-popover';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  private dispose?: ReturnType<typeof autoUpdate>;
  private target?: Element;

  @query('#container', true)
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
  public placement: IgcPopoverPlacement = 'bottom-start';

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
   * The type of CSS position property to use.
   */
  @property()
  public strategy: 'absolute' | 'fixed' = 'absolute';

  @watch('anchor')
  protected async anchorChange() {
    if (!this.anchor) {
      // Fallback to slotted anchor if present
      this._anchorSlotChange();
      return;
    }

    const newTarget =
      typeof this.anchor === 'string'
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

  @watch('flip', { waitUntilFirstUpdate: true })
  @watch('offset', { waitUntilFirstUpdate: true })
  @watch('placement', { waitUntilFirstUpdate: true })
  @watch('sameWidth', { waitUntilFirstUpdate: true })
  @watch('shift', { waitUntilFirstUpdate: true })
  @watch('strategy', { waitUntilFirstUpdate: true })
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
    if (!this.target) return;

    this.dispose = autoUpdate(
      this.target,
      this._container,
      this._updatePosition.bind(this)
    );
  }

  protected async hide(): Promise<void> {
    return new Promise((resolve) => {
      if (this.dispose) {
        this.dispose();
        this.dispose = undefined;
        resolve();
      } else {
        resolve();
      }
    });
  }

  private _createMiddleware(): Middleware[] {
    const middleware: Middleware[] = [];
    const styles = this._container.style;

    if (this.offset) {
      middleware.push(offset(this.offset));
    }

    if (this.shift) {
      middleware.push(
        shift({
          limiter: limitShift(),
        })
      );
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
    if (!this.open || !this.target) {
      return;
    }

    const { x, y } = await computePosition(this.target, this._container, {
      placement: this.placement ?? 'bottom-start',
      middleware: this._createMiddleware(),
      strategy: this.strategy ?? 'absolute',
    });

    Object.assign(this._container.style, {
      left: 0,
      top: 0,
      transform: `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`,
    });
  }

  private _anchorSlotChange() {
    if (this.anchor || this._anchors.length < 1) return;

    this.target = this._anchors[0];
    this._updateState();
  }

  protected override render() {
    return html`
      <slot name="anchor" @slotchange=${this._anchorSlotChange}></slot>
      <div id="container" part=${this.strategy}>
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
