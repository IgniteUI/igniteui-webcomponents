import { html, LitElement, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';

import { addThemingController } from '../../theming/theming-controller.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/forms/associated.js';
import {
  createFormValueState,
  defaultNumberTransformers,
  type FormValueOf,
} from '../common/mixins/forms/form-value.js';
import {
  asNumber,
  clamp,
  formatString,
  isEmpty,
  isLTR,
  numberOfDecimals,
  roundPrecise,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcRatingSymbolComponent from './rating-symbol.js';
import { styles } from './themes/rating.base.css.js';
import { styles as shared } from './themes/shared/rating.common.css.js';
import { all } from './themes/themes.js';

export interface IgcRatingComponentEventMap {
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
export default class IgcRatingComponent extends FormAssociatedMixin(
  EventEmitterMixin<IgcRatingComponentEventMap, Constructor<LitElement>>(
    LitElement
  )
) {
  public static readonly tagName = 'igc-rating';
  public static styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcRatingComponent,
      IgcIconComponent,
      IgcRatingSymbolComponent
    );
  }

  protected override readonly _formValue: FormValueOf<number> =
    createFormValueState(this, {
      initialValue: 0,
      transformers: defaultNumberTransformers,
    });

  private _max = 5;
  private _step = 1;
  private _single = false;

  @queryAssignedElements({
    selector: IgcRatingSymbolComponent.tagName,
    slot: 'symbol',
  })
  protected ratingSymbols!: IgcRatingSymbolComponent[];

  @query('[part="symbols"]', true)
  protected container!: HTMLElement;

  @queryAssignedNodes({ slot: 'value-label', flatten: true })
  protected valueLabel!: Node[];

  @state()
  protected hoverValue = -1;

  @state()
  protected hoverState = false;

  protected get isInteractive() {
    return !(this.readOnly || this.disabled);
  }

  protected get hasProjectedSymbols() {
    return this.ratingSymbols.length > 0;
  }

  protected get valueText() {
    // Skip IEEE 754 representation for screen readers
    const value = this.round(this.value);
    return this.valueFormat
      ? formatString(this.valueFormat, value, this.max)
      : `${value} of ${this.max}`;
  }

  /**
   * The maximum value for the rating.
   *
   * If there are projected symbols, the maximum value will be resolved
   * based on the number of symbols.
   * @attr max
   * @default 5
   */
  @property({ type: Number })
  public set max(value: number) {
    this._max = this.hasProjectedSymbols
      ? this.ratingSymbols.length
      : Math.max(0, value);

    if (this._max < this.value) {
      this.value = this._max;
    }
  }

  public get max(): number {
    return this._max;
  }

  /**
   * The minimum value change allowed.
   *
   * Valid values are in the interval between 0 and 1 inclusive.
   * @attr step
   * @default 1
   */
  @property({ type: Number })
  public set step(value: number) {
    this._step = this.single ? 1 : clamp(value, 0.001, 1);
  }

  public get step(): number {
    return this._step;
  }

  /**
   * The label of the control.
   * @attr label
   */
  @property()
  public label!: string;

  /**
   * A format string which sets aria-valuetext. Instances of '{0}' will be replaced
   * with the current value of the control and instances of '{1}' with the maximum value for the control.
   *
   * Important for screen-readers and useful for localization.
   * @attr value-format
   */
  @property({ attribute: 'value-format' })
  public valueFormat!: string;

  /* @tsTwoWayProperty(true, "igcChange", "detail", false) */
  /**
   * The current value of the component
   * @attr value
   * @default 0
   */
  @property({ type: Number })
  public set value(number: number) {
    const value = this.hasUpdated
      ? clamp(asNumber(number), 0, this.max)
      : Math.max(asNumber(number), 0);
    this._formValue.setValueAndFormState(value);
  }

  public get value(): number {
    return this._formValue.value;
  }

  /**
   * Sets hover preview behavior for the component
   * @attr hover-preview
   */
  @property({ type: Boolean, reflect: true, attribute: 'hover-preview' })
  public hoverPreview = false;

  /**
   * Makes the control a readonly field.
   * @attr readonly
   */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  /**
   * Toggles single selection visual mode.
   * @attr single
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public set single(value: boolean) {
    this._single = Boolean(value);

    if (this._single) {
      this.step = 1;
      this.value = Math.ceil(this.value);
    }
  }

  public get single(): boolean {
    return this._single;
  }

  /**
   * Whether to reset the rating when the user selects the same value.
   * @attr allow-reset
   */
  @property({ type: Boolean, reflect: true, attribute: 'allow-reset' })
  public allowReset = false;

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      skip: () => !this.isInteractive,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowUp, () => this.emitValueUpdate(this.value + this.step))
      .set(arrowRight, () =>
        this.emitValueUpdate(
          isLTR(this) ? this.value + this.step : this.value - this.step
        )
      )
      .set(arrowDown, () => this.emitValueUpdate(this.value - this.step))
      .set(arrowLeft, () =>
        this.emitValueUpdate(
          isLTR(this) ? this.value - this.step : this.value + this.step
        )
      )
      .set(homeKey, () => this.emitValueUpdate(this.step))
      .set(endKey, () => this.emitValueUpdate(this.max));
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this._formValue.setValueAndFormState(clamp(this.value, 0, this.max));
    this._pristine = true;
  }

  protected handleClick({ clientX }: PointerEvent) {
    const value = this.calcNewValue(clientX);
    const sameValue = this.value === value;

    if (this.allowReset && sameValue) {
      this.emitValueUpdate(0);
    } else if (!sameValue) {
      this.emitValueUpdate(value);
    }
  }

  protected handlePointerMove({ clientX }: PointerEvent) {
    const value = this.calcNewValue(clientX);

    if (this.hoverValue !== value) {
      // Since pointermove spams a lot, only emit on a value change
      this.hoverValue = value;
      this.emitEvent('igcHover', { detail: this.hoverValue });
    }
  }

  protected emitValueUpdate(value: number) {
    this._setTouchedState();
    this.value = clamp(value, 0, this.max);
    if (value === this.value) {
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  protected handleSlotChange() {
    if (this.hasProjectedSymbols) {
      this.max = this.ratingSymbols.length;
      this.requestUpdate();
    }
  }

  protected handleHoverEnabled() {
    this.hoverState = true;
  }

  protected handleHoverDisabled() {
    this.hoverState = false;
  }

  protected calcNewValue(x: number) {
    const { width, left, right } = this.container.getBoundingClientRect();
    const percent = isLTR(this) ? (x - left) / width : (right - x) / width;
    const value = this.round(this.max * percent);

    return clamp(value, this.step, this.max);
  }

  protected round(value: number) {
    return roundPrecise(
      Math.ceil(value / this.step) * this.step,
      numberOfDecimals(this.step)
    );
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
          collection="default"
          name="star_filled"
          style=${styleMap({ clipPath: forward })}
        ></igc-icon>
        <igc-icon
          collection="default"
          name="star_outlined"
          style=${styleMap({ clipPath: backward })}
          slot="empty"
        ></igc-icon>
      </igc-rating-symbol>`;
    }
  }

  protected clipProjected() {
    const ltr = isLTR(this);
    const partFull = '[part="symbol full"]';
    const partEmpty = '[part="symbol empty"]';

    for (const [i, symbol] of this.ratingSymbols.entries()) {
      const full = symbol.renderRoot.querySelector<HTMLElement>(partFull);
      const empty = symbol.renderRoot.querySelector<HTMLElement>(partEmpty);
      const { forward, backward } = this.clipSymbol(i, ltr);

      if (full) {
        full.style.clipPath = forward;
      }

      if (empty) {
        empty.style.clipPath = backward;
      }
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

    const hoverActive = this.hoverPreview && this.isInteractive;

    return html`
      <label part="label" id="rating-label" ?hidden=${!this.label}
        >${this.label}</label
      >
      <div
        part="base"
        role="slider"
        tabindex=${ifDefined(this.disabled ? undefined : 0)}
        aria-labelledby="rating-label"
        aria-valuemin="0"
        aria-valuenow=${this.value}
        aria-valuemax=${this.max}
        aria-valuetext=${this.valueText}
      >
        <div
          aria-hidden="true"
          part="symbols"
          @click=${this.isInteractive ? this.handleClick : nothing}
          @pointerenter=${hoverActive ? this.handleHoverEnabled : nothing}
          @pointerleave=${hoverActive ? this.handleHoverDisabled : nothing}
          @pointermove=${hoverActive ? this.handlePointerMove : nothing}
        >
          <slot name="symbol" @slotchange=${this.handleSlotChange}>
            ${guard(props, () =>
              this.hasProjectedSymbols
                ? this.clipProjected()
                : this.renderSymbols()
            )}
          </slot>
        </div>
        <label part="value-label" ?hidden=${isEmpty(this.valueLabel)}>
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
