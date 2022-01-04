import { html, LitElement } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { watch } from '../common/decorators/watch';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { SizableMixin } from '../common/mixins/sizable';
import { styles } from './rating.material.css';
import { clamp } from '../common/util';

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
 */
export default class igcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-rating';

  /** @private */
  public static styles = [styles];

  @queryAll('span[part="rating-symbol"]')
  protected elements!: NodeListOf<HTMLSpanElement>;

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  protected navigationKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ]);

  /** The maximum value for the rating */
  @property({ type: Number })
  public max = 5;

  /** The minimum value change allowed. */
  @property({ type: Number })
  public precision = 1;

  /**
   * The symbol which the rating will display.
   * It also accepts a callback function which gets the current symbol
   * index so the symbol can be resolved per position.
   */
  @property()
  public symbol: string | ((index: number) => string) = '⭐';

  /** The name attribute of the control */
  @property()
  public name!: string;

  /** The label of the control. */
  @property()
  public label!: string;

  /**
   * A callback function which gets the value for the position
   * and returns a user-friendly representation of the value setting it as aria-valuetext.
   * Important for screen-readers and useful for localization.
   */
  @property({ attribute: false })
  public valueFormatter!: (value: number) => string;

  /**
   * A callback function which gets the index for each symbol in the control
   * and returns a user-friendly representation for it setting it as aria-label.
   * Important for screen-readers and useful for localization.
   */
  @property({ attribute: false })
  public labelFormatter!: (index: number) => string;

  /** The current value of the component */
  @property({ type: Number })
  public value = 0;

  /** Sets the disabled state of the component */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Sets hover preview behavior for the component */
  @property({ type: Boolean, reflect: true })
  public hover = false;

  /** Sets the readonly state of the component */
  @property({ type: Boolean, reflect: true })
  public readonly = false;

  /**
   * Increments the value of the control by `n` steps multiplied by the
   * precision factor.
   */
  public stepUp(n = 1) {
    this.value += this.round(n * this.precision, this.precision);
  }

  /**
   * Decrements the value of the control by `n` steps multiplied by
   * the precision factor.
   */
  public stepDown(n = 1) {
    this.value -= this.round(n * this.precision, this.precision);
  }

  protected render() {
    const value = this.hoverState ? this.hoverValue : this.value;
    const percentage = Math.round((value / this.max) * 100);
    return html`
      <div
        part="base"
        role="slider"
        tabindex=${ifDefined(this.readonly ? undefined : 0)}
        aria-labelledby=${ifDefined(this.label)}
        aria-valuemin="0"
        aria-valuenow=${ifDefined(this.value > 0 ? this.value : undefined)}
        aria-valuemax=${this.max}
        aria-valuetext=${ifDefined(
          this.valueFormatter ? this.valueFormatter(value) : undefined
        )}
        @keydown=${this.handleKeyDown}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
        @mousemove=${this.handleMouseMove}
        @click=${this.handleClick}
      >
        ${this.renderSymbols()}
        <div
          part="overlay"
          class=${classMap({ start: this.isLTR, end: !this.isLTR })}
          style=${styleMap({ width: `${100 - percentage}%` })}
        ></div>
      </div>
    `;
  }

  @watch('max')
  protected handleMaxChange(newValue: number) {
    this.max = Math.max(0, newValue);
    if (this.max < this.value) {
      this.value = this.max;
    }
  }

  @watch('value')
  protected handleValueChange(newValue: number) {
    this.value = clamp(newValue, 0, this.max);
  }

  @watch('precision')
  protected handlePrecisionChange(newValue: number) {
    this.precision = clamp(newValue, 0.001, 1);
  }

  protected handleClick({ clientX }: MouseEvent) {
    if (this.disabled || this.readonly) {
      return;
    }

    const value = this.calcNewValue(clientX);

    if (this.value === value) {
      this.value = 0;
    } else {
      this.value = value;
    }

    this.emitEvent('igcChange', { detail: this.value });
  }

  protected handleMouseMove({ clientX }: MouseEvent) {
    if (!this.hover || this.readonly || this.disabled) {
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
    if (!(this.readonly || this.disabled) && this.hover) {
      this.hoverState = true;
    }
  }

  protected handleMouseLeave() {
    if (!(this.readonly || this.disabled) && this.hover) {
      this.hoverState = false;
    }
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (!this.navigationKeys.has(event.key)) {
      return;
    }

    let result = this.value;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        result += this.isLTR ? this.precision : -this.precision;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        result -= this.isLTR ? this.precision : -this.precision;
        break;
      case 'Home':
        result = this.precision;
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

  protected calcNewValue(x: number) {
    const { width, left, right } = this.getBoundingClientRect();
    const percent = this.isLTR ? (x - left) / width : (right - x) / width;
    const value = this.round(
      this.max * percent + this.precision / 2,
      this.precision
    );
    return clamp(value, this.precision, this.max);
  }

  protected *renderSymbols() {
    for (let i = 0; i < this.max; i++) {
      yield html`
        <span
          part="rating-symbol"
          aria-label=${this.labelFormatter
            ? this.labelFormatter(i)
            : `${i + 1} out of ${this.max}`}
        >
          ${this.renderSymbol(i)}
        </span>
      `;
    }
  }

  protected renderSymbol(index: number) {
    return typeof this.symbol === 'function' ? this.symbol(index) : this.symbol;
  }

  protected getPrecision(num: number) {
    const [_, decimal] = num.toString().split('.');
    return decimal ? decimal.length : 0;
  }

  protected round(value: number, precision: number) {
    value = Math.round(value / precision) * precision;
    return Number(value.toFixed(this.getPrecision(precision)));
  }

  protected get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating': igcRatingComponent;
  }
}
