import { html, LitElement, nothing } from 'lit';
import { property, query, queryAssignedNodes, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { guard } from 'lit/directives/guard.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { clamp, isLTR } from '../common/util.js';
import { styles } from './rating.base.css.js';
import { styles as bootstrap } from './rating.bootstrap.css.js';
import { styles as fluent } from './rating.fluent.css.js';
import { styles as indigo } from './rating.indigo.css.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcRatingSymbolComponent from './rating-symbol.js';
import IgcIconComponent from '../icon/icon.js';

defineComponents(IgcRatingSymbolComponent, IgcIconComponent);

export interface IgcRatingEventMap {
  igcChange: CustomEvent<number>;
  igcHover: CustomEvent<number>;
}

/**
 * Rating provides insight regarding others' opinions and experiences,
 * and can allow the user to submit a rating of their own
 *
 * @element igc-rating
 *
 * @fires igcChange - Emitted when the value of the control changes.
 * @fires igcHover - Emitted when hover is enabled and the user mouses over a symbol of the rating.
 *
 * @csspart base - The main wrapper which holds all of the rating elements.
 * @csspart label - The label part.
 * @csspart value-label - The value label part.
 * @csspart symbols - A wrapper for all rating symbols.
 * @csspart symbol - The part of the encapsulated default symbol.
 * @csspart full - The part of the encapsulated full symbols.
 * @csspart empty - The part of the encapsulated empty symbols.
 *
 * @cssproperty --symbol-size - The size of the symbols.
 * @cssproperty --symbol-full-color - The color of the filled symbol.
 * @cssproperty --symbol-empty-color - The color of the empty symbol.
 * @cssproperty --symbol-full-filter - The filter(s) used for the filled symbol.
 * @cssproperty --symbol-empty-filter - The filter(s) used for the empty symbol.
 */
@themes({ fluent, bootstrap, indigo })
export default class IgcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-rating';

  public static styles = [styles];

  protected ratingSymbols: Array<IgcRatingSymbolComponent> = [];

  @query('[part="symbols"]', true)
  protected container!: HTMLElement;

  @queryAssignedNodes({ slot: 'value-label', flatten: true })
  protected valueLabel!: Array<Node>;

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  protected get isInteractive() {
    return !(this.readonly || this.disabled);
  }

  protected get hasProjectedSymbols() {
    return this.ratingSymbols.length > 0;
  }

  protected get valueText() {
    return this.valueFormat
      ? this.valueFormat.replace(/\{0\}/gm, `${this.value}`)
      : this.value;
  }

  /** The maximum value for the rating */
  @property({ type: Number })
  public max = 5;

  /** The minimum value change allowed. */
  @property({ type: Number })
  public step = 1;

  /** The name attribute of the control */
  @property()
  public name!: string;

  /** The label of the control. */
  @property()
  public label!: string;

  /**
   * A format string which sets aria-valuetext. All instances of '{0}' will be replaced
   * with the current value of the control.
   * Important for screen-readers and useful for localization.
   */
  @property({ attribute: 'value-format' })
  public valueFormat!: string;

  /** The current value of the component */
  @property({ type: Number })
  public value = 0;

  /** Sets the disabled state of the component */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets hover preview behavior for the component */
  @property({ type: Boolean, reflect: true, attribute: 'hover-preview' })
  public hoverPreview = false;

  /** Sets the readonly state of the component */
  @property({ type: Boolean, reflect: true })
  public readonly = false;

  /** Toggles single selection visual mode. */
  @property({ type: Boolean })
  public single = false;

  @watch('max')
  protected handleMaxChange() {
    this.hasProjectedSymbols
      ? (this.max = this.ratingSymbols.length)
      : (this.max = Math.max(0, this.max));
    if (this.max < this.value) {
      this.value = this.max;
    }
  }

  @watch('value')
  protected handleValueChange() {
    this.value = clamp(this.value, 0, this.max);
  }

  @watch('step')
  protected handlePrecisionChange() {
    this.step = !this.single ? clamp(this.step, 0.001, 1) : 1;
  }

  @watch('single')
  protected handleSelectionChange() {
    if (this.single) {
      this.step = 1;
      this.value = Math.ceil(this.value);
    }
  }

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeyDown);
  }

  protected handleClick({ clientX }: MouseEvent) {
    if (!this.isInteractive) {
      return;
    }

    const value = this.calcNewValue(clientX);
    this.value === value ? (this.value = 0) : (this.value = value);
    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleMouseMove({ clientX }: MouseEvent) {
    if (!this.isInteractive) {
      return;
    }

    const value = this.calcNewValue(clientX);

    if (this.hoverValue !== value) {
      // Since mousemove spams a lot, only emit on a value change
      this.hoverValue = value;
      this.emitEvent('igcHover', { detail: this.hoverValue });
    }
  }

  protected handleMouseEnter() {
    if (this.isInteractive) {
      this.hoverState = true;
    }
  }

  protected handleMouseLeave() {
    if (this.isInteractive) {
      this.hoverState = false;
    }
  }

  protected handleKeyDown({ key }: KeyboardEvent) {
    if (!this.isInteractive) {
      return;
    }

    let result = this.value;
    const ltr = isLTR(this);

    switch (key) {
      case 'ArrowUp':
      case 'ArrowRight':
        result += ltr ? this.step : -this.step;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        result -= ltr ? this.step : -this.step;
        break;
      case 'Home':
        result = this.step;
        break;
      case 'End':
        result = this.max;
        break;
      default:
        return;
    }

    // Verify new value is in bounds and emit
    this.value = clamp(result, 0, this.max);

    if (result === this.value) {
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;

    this.ratingSymbols = slot
      .assignedElements()
      .filter(
        (el) => el instanceof IgcRatingSymbolComponent
      ) as IgcRatingSymbolComponent[];

    if (this.hasProjectedSymbols) {
      this.max = this.ratingSymbols.length;
    }

    this.requestUpdate();
  }

  protected calcNewValue(x: number) {
    const { width, left, right } = this.container.getBoundingClientRect();
    const percent = isLTR(this) ? (x - left) / width : (right - x) / width;
    const value = this.round(this.max * percent + this.step / 2);

    return clamp(value, this.step, this.max);
  }

  protected getPrecision(num: number) {
    const [_, decimal] = num.toString().split('.');
    return decimal ? decimal.length : 0;
  }

  protected round(value: number) {
    value = Math.round(value / this.step) * this.step;
    return Number(value.toFixed(this.getPrecision(this.step)));
  }

  protected clipSymbol(index: number, isLTR = true) {
    const value = this.hoverState ? this.hoverValue : this.value;
    const progress = index + 1 - value;
    const exclusive = progress === 0 || this.value === index + 1 ? 0 : 1;
    const selection = this.single ? exclusive : progress;
    const activate = (p: number) => clamp(p * 100, 0, 100);

    const forward = `inset(0 ${activate(
      isLTR ? selection : 1 - selection
    )}% 0 0)`;
    const backward = `inset(0 0 0 ${activate(
      isLTR ? 1 - selection : selection
    )}%)`;

    return {
      backward: isLTR ? backward : forward,
      forward: isLTR ? forward : backward,
    };
  }

  /**
   * Increments the value of the control by `n` steps multiplied by the
   * step factor.
   */
  public stepUp(n = 1) {
    this.value += this.round(n * this.step);
  }

  /**
   * Decrements the value of the control by `n` steps multiplied by
   * the step factor.
   */
  public stepDown(n = 1) {
    this.value -= this.round(n * this.step);
  }

  protected *renderSymbols() {
    const ltr = isLTR(this);
    for (let i = 0; i < this.max; i++) {
      const { forward, backward } = this.clipSymbol(i, ltr);
      yield html`<igc-rating-symbol exportparts="symbol, full, empty">
        <igc-icon
          collection="internal"
          name="star"
          style=${styleMap({ clipPath: forward })}
        ></igc-icon>
        <igc-icon
          collection="internal"
          name="star_border"
          style=${styleMap({ clipPath: backward })}
          slot="empty"
        ></igc-icon>
      </igc-rating-symbol>`;
    }
  }

  protected clipProjected() {
    if (this.hasProjectedSymbols) {
      const ltr = isLTR(this);
      this.ratingSymbols.forEach((symbol: IgcRatingSymbolComponent, i) => {
        const full = symbol.shadowRoot?.querySelector(
          '[part="symbol full"]'
        ) as HTMLElement;

        const empty = symbol.shadowRoot?.querySelector(
          '[part="symbol empty"]'
        ) as HTMLElement;
        const { forward, backward } = this.clipSymbol(i, ltr);

        if (full) {
          full.style.clipPath = forward;
        }

        if (empty) {
          empty.style.clipPath = backward;
        }
      });
    }
  }

  protected override render() {
    const props = [
      this.value,
      this.hoverValue,
      this.max,
      this.step,
      this.single,
      this.hoverState,
      this.ratingSymbols,
    ];

    return html`
      <label part="label" ?hidden=${!this.label}>${this.label}</label>
      <div
        part="base"
        role="slider"
        tabindex=${ifDefined(this.disabled ? undefined : 0)}
        aria-label=${this.label ?? nothing}
        aria-valuemin="0"
        aria-valuenow=${this.value}
        aria-valuemax=${this.max}
        aria-valuetext=${this.valueText}
      >
        <div
          aria-hidden="true"
          part="symbols"
          @click=${this.handleClick}
          @mouseenter=${this.hoverPreview ? this.handleMouseEnter : nothing}
          @mouseleave=${this.hoverPreview ? this.handleMouseLeave : nothing}
          @mousemove=${this.hoverPreview ? this.handleMouseMove : nothing}
        >
          <slot @slotchange=${this.handleSlotChange}>
            ${guard(props, () => {
              this.clipProjected();
              return this.renderSymbols();
            })}
          </slot>
        </div>
        <label part="value-label" ?hidden=${this.valueLabel.length === 0}>
          <slot name="value-label"></slot>
        </label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating': IgcRatingComponent;
  }
}
