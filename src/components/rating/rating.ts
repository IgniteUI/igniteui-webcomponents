import { html, LitElement, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import { directive } from 'lit/directive.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import ClipDirective from '../common/directives/clip.js';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { Direction } from '../common/types.js';
import { clamp } from '../common/util.js';
import type IgcRatingSymbolComponent from './rating-symbol';
import { styles } from './rating.base.css.js';
import { styles as bootstrap } from './rating.bootstrap.css.js';
import { styles as fluent } from './rating.fluent.css.js';
import { styles as indigo } from './rating.indigo.css.js';

const clip = directive(ClipDirective);

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
 * @csspart symbol - The part for a single symbol.
 * @csspart selected -The part for the selected symbols.
 * @csspart empty - The part for the empty  symbols.
 * @csspart symbols-wrapper - The wrapper that holds all symbols.
 * @csspart large - A part responsible for the symbols size.
 * @csspart medium - A part responsible for the symbols size.
 * @csspart small- A part responsible for the symbols size.
 */
@themes({ fluent, bootstrap, indigo })
export default class IgcRatingComponent extends SizableMixin(
  EventEmitterMixin<IgcRatingEventMap, Constructor<LitElement>>(LitElement)
) {
  public static readonly tagName = 'igc-rating';

  public static styles = [styles];

  @query('[part="symbols"]', true)
  protected container!: HTMLElement;

  @queryAssignedNodes({ slot: 'value-label', flatten: true })
  protected valueLabel!: Array<Node>;

  @queryAssignedElements({ selector: 'igc-rating-symbol:not([empty])' })
  protected ratingSymbols!: Array<IgcRatingSymbolComponent>;

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

  protected get isLTR() {
    return (
      window.getComputedStyle(this).getPropertyValue('direction') === 'ltr'
    );
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

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: Direction = 'auto';

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

  protected handleSlotChange() {
    if (this.hasProjectedSymbols) {
      this.max = this.ratingSymbols.length;
    }
    this.requestUpdate();
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

  protected clipSymbol(index: number, direction: 'forward' | 'backward') {
    const value = this.hoverState ? this.hoverValue : this.value;
    const progress = index + 1 - value;
    const exclusive = progress === 0 || this.value === index + 1 ? 0 : 1;
    const selection = this.single ? exclusive : progress;
    const activate = (p: number) => clamp(p * 100, 0, 100);

    const forward = `inset(0 ${activate(
      this.dir === 'ltr' ? selection : 1 - selection
    )}% 0 0)`;
    const backward = `inset(0 0 0 ${activate(
      this.dir === 'ltr' ? 1 - selection : selection
    )}%)`;

    switch (direction) {
      case 'backward':
        return this.dir === 'ltr' ? backward : forward;
      case 'forward':
      default:
        return this.dir === 'ltr' ? forward : backward;
    }
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
    const value = this.hoverState ? this.hoverValue : this.value;
    const rtl = this.dir === 'rtl';

    for (let i = 0; i < this.max; i++) {
      yield html`<igc-rating-symbol part="symbol ${this.size}">
        <igc-icon
          collection="internal"
          name="star"
          ${clip({
            width: i + 1,
            clip: value,
            exact: this.single,
            matcher: this.value,
            rtl,
          })}
          .size="${this.size}"
        ></igc-icon>
        <igc-icon
          ${clip({
            width: i + 1,
            clip: value,
            direction: 'backward',
            exact: this.single,
            matcher: this.value,
            rtl,
          })}
          part="symbol"
          collection="internal"
          name="star_border"
          .size="${this.size}"
          empty
        ></igc-icon>
      </igc-rating-symbol>`;
    }
  }

  protected renderProjected() {
    return html`${this.ratingSymbols.map((each, i) => {
      const clone = each.cloneNode(true) as IgcRatingSymbolComponent;
      const symbols = Array.from(clone.children);
      clone.setAttribute('part', `symbol ${this.size}`);

      if (symbols.length > 1) {
        symbols?.forEach((symbol) => {
          if (symbol instanceof HTMLElement) {
            if (symbol.hasAttribute('empty')) {
              symbol.style.clipPath = this.clipSymbol(i, 'backward');
            } else {
              symbol.style.clipPath = this.clipSymbol(i, 'forward');
            }
          }
        });
      }

      return clone;
    })}`;
  }

  protected renderSymbolsWrapper() {
    return html`<div
      aria-hidden="true"
      part="symbols"
      @click=${this.handleClick}
      @mouseenter=${this.hoverPreview ? this.handleMouseEnter : nothing}
      @mouseleave=${this.hoverPreview ? this.handleMouseLeave : nothing}
      @mousemove=${this.hoverPreview ? this.handleMouseMove : nothing}
    >
      <slot hidden @slotchange=${this.handleSlotChange}></slot>
      ${this.hasProjectedSymbols
        ? this.renderProjected()
        : this.renderSymbols()}
    </div>`;
  }

  protected override render() {
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
        ${this.renderSymbolsWrapper()}
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
