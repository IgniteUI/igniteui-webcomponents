import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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
export default class IgcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-rating';

  /** @private */
  public static styles = [styles];

  @query('[part="base"]', true)
  protected container!: HTMLElement;

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  protected get isInteractive() {
    return !(this.readonly || this.disabled);
  }

  /** The maximum value for the rating */
  @property({ type: Number })
  public max = 5;

  /** The minimum value change allowed. */
  @property({ type: Number })
  public step = 1;

  /** The symbol which the rating will display. */
  @property()
  public symbol = '⭐';

  /**
   * Callback for customizing the rendered symbols (e.g. svg, icons, etc.)
   * Takes precedence over symbol.
   */
  @property({ attribute: false })
  public symbolFormatter!: (index: number) => any;

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

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeyDown);
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

  @watch('max')
  protected handleMaxChange() {
    this.max = Math.max(0, this.max);
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
    this.step = clamp(this.step, 0.001, 1);
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

    switch (key) {
      case 'ArrowUp':
      case 'ArrowRight':
        result += this.isLTR ? this.step : -this.step;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        result -= this.isLTR ? this.step : -this.step;
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

  protected calcNewValue(x: number) {
    const { width, left, right } = this.container.getBoundingClientRect();
    const percent = this.isLTR ? (x - left) / width : (right - x) / width;
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

  protected get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
  }

  protected renderSymbol(index: number) {
    return this.symbolFormatter ? this.symbolFormatter(index) : this.symbol;
  }

  protected *renderSymbols() {
    for (let i = 0; i < this.max; i++) {
      yield html`
        <span part="symbol ${this.size}"> ${this.renderSymbol(i)} </span>
      `;
    }
  }

  protected renderFractionWrapper(styles: { width: string }) {
    return this.hover
      ? html` <div
          @click=${this.handleClick}
          @mouseenter=${this.handleMouseEnter}
          @mouseleave=${this.handleMouseLeave}
          @mousemove=${this.handleMouseMove}
        >
          <div style=${styleMap(styles)} part="fraction ${this.size}">
            <div part="symbols-wrapper fraction">${this.renderSymbols()}</div>
          </div>
          <div part="symbols-wrapper">${this.renderSymbols()}</div>
        </div>`
      : html`
          <div @click=${this.handleClick}>
            <div style=${styleMap(styles)} part="fraction ${this.size}">
              <div part="symbols-wrapper fraction">${this.renderSymbols()}</div>
            </div>
            <div part="symbols-wrapper">${this.renderSymbols()}</div>
          </div>
        `;
  }

  protected render() {
    const value = this.hoverState ? this.hoverValue : this.value;
    const styles = { width: `${Math.round((value / this.max) * 100)}%` };

    return html`
      <div part="rating">
        <label part="label ${this.size}" for="">${this.label}</label>
        <div
          part="base"
          role="slider"
          tabindex=${ifDefined(this.disabled ? undefined : 0)}
          aria-label=${this.label ?? nothing}
          aria-valuemin="0"
          aria-valuenow=${this.value}
          aria-valuemax=${this.max}
          aria-valuetext=${this.valueFormatter
            ? this.valueFormatter(value)
            : this.value}
        >
          ${this.renderFractionWrapper(styles)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-rating': IgcRatingComponent;
  }
}
