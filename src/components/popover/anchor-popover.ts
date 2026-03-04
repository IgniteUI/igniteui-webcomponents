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
  formatString,
  getElementByIdFromRoot,
  isString,
} from '../common/util.js';
import type { PopoverPlacement } from './popover.js';
import { styles } from './themes/light/popover.base.css.js';

const POSITION_AREA_MAP = new Map<PopoverPlacement, string>(
  Object.entries({
    top: 'start center',
    'top-start': 'start start',
    'top-end': 'start end',
    bottom: 'end center',
    'bottom-start': 'end start',
    'bottom-end': 'end end',
    right: 'center end',
    'right-start': 'start end',
    'right-end': 'end end',
    left: 'center start',
    'left-start': 'start start',
    'left-end': 'end start',
  }) as [PopoverPlacement, string][]
);

const OFFSET_MAP = Object.freeze({
  top: '0 0 {0} 0',
  right: '0 0 0 {0}',
  bottom: '{0} 0 0 0',
  left: '0 {0} 0 0',
});

const POPOVER_CSS_VARIABLES = Object.freeze({
  placement: { name: '--ig-popover-position-area', value: 'end center' },
  sameWidth: { name: '--ig-popover-same-size', value: 'anchor-size(width)' },
  flip: { name: '--ig-popover-fallbacks', value: 'none' },
  offset: { name: '--ig-popover-offset', value: '0' },
});

export default class IgcAnchorPopoverComponent extends LitElement {
  public static readonly tagName = 'igc-anchor-popover';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcAnchorPopoverComponent);
  }

  private readonly _slots = addSlotController(this, {
    slots: setSlots('anchor'),
    onChange: this._handleSlotChange,
  });

  private _target?: HTMLElement;

  @query('#container')
  private readonly _container!: HTMLElement;

  @property()
  public anchor?: HTMLElement | string;

  @property({ type: Boolean, reflect: true })
  public open = false;

  @property()
  public placement: PopoverPlacement = 'bottom';

  @property()
  public offset = '0';

  @property({ type: Boolean, reflect: true, attribute: 'same-width' })
  public sameWidth = false;

  @property({ type: Boolean, reflect: true })
  public flip = false;

  @property({ type: Boolean, reflect: true })
  public shift = false;

  protected override update(properties: PropertyValues<this>): void {
    if (properties.has('anchor')) {
      const target = isString(this.anchor)
        ? getElementByIdFromRoot(this, this.anchor)
        : this.anchor;

      if (target) {
        this._target = target;
      }
    }

    this._updateState();
    super.update(properties);
  }

  private _handleSlotChange({
    isDefault,
  }: SlotChangeCallbackParameters<unknown>): void {
    if (isDefault) {
      return;
    }

    const anchor = first(
      this._slots.getAssignedElements('anchor', {
        flatten: true,
      }) as HTMLElement[]
    );

    if (this.anchor || !anchor) {
      return;
    }

    this._target = anchor;
    this._updateState();
  }

  private _setStyles() {
    if (!this.open) {
      for (const property of Object.values(POPOVER_CSS_VARIABLES)) {
        this.style.removeProperty(property.name);
      }
      return;
    }

    this.style.setProperty(
      POPOVER_CSS_VARIABLES.placement.name,
      POSITION_AREA_MAP.get(this.placement) || 'auto'
    );

    if (this.sameWidth) {
      this.style.setProperty(
        POPOVER_CSS_VARIABLES.sameWidth.name,
        POPOVER_CSS_VARIABLES.sameWidth.value
      );
    }

    if (this.flip) {
      this.style.setProperty(
        POPOVER_CSS_VARIABLES.flip.name,
        this.placement.match(/^(top|bottom)/) ? 'flip-block' : 'flip-inline'
      );
    }

    if (this.offset) {
      const position = this.placement.split('-')[0] as keyof typeof OFFSET_MAP;
      const value = OFFSET_MAP[position];
      this.style.setProperty(
        POPOVER_CSS_VARIABLES.offset.name,
        formatString(value, this.offset)
      );
    }

    if (this.shift) {
      if (this.flip) {
        const currentFlipFallbacks = this.style.getPropertyValue(
          POPOVER_CSS_VARIABLES.flip.name
        );
        this.style.setProperty(
          POPOVER_CSS_VARIABLES.flip.name,
          `${currentFlipFallbacks}, ${currentFlipFallbacks} flip-inline, flip-inline`
        );
      } else {
        this.style.setProperty(POPOVER_CSS_VARIABLES.flip.name, 'flip-inline');
      }
    }
  }

  private _setPopoverState(open: boolean): void {
    if (!this._target) {
      return;
    }
    open
      ? (this._container as any)?.showPopover({ source: this._target })
      : this._container?.hidePopover();
  }

  private _updateState(): void {
    this._setStyles();
    this._setPopoverState(this.open);
  }

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
    'igc-anchor-popover': IgcAnchorPopoverComponent;
  }
}
