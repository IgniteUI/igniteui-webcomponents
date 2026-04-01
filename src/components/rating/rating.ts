import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { range } from 'lit/directives/range.js';
import { repeat } from 'lit/directives/repeat.js';
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
import {
  addSlotController,
  type InferSlotNames,
  type SlotChangeCallbackParameters,
  setSlots,
} from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { FormAssociatedMixin } from '../common/mixins/forms/associated.js';
import { FormValueNumberTransformers } from '../common/mixins/forms/form-transformers.js';
import { createFormValueState } from '../common/mixins/forms/form-value.js';
import {
  asNumber,
  bindIf,
  clamp,
  formatString,
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

const Slots = setSlots('symbol', 'value-label');

/**
 * A rating component that allows users to view and provide ratings using customizable symbols.
 * It supports fractional values, hover previews, keyboard navigation, single-selection mode,
 * and integrates with forms as a number input.
 *
 * @example
 * ```html
 * <!-- Basic rating -->
 * <igc-rating value="3" max="5" label="Rate this product"></igc-rating>
 * ```
 *
 * @example
 * ```html
 * <!-- Half-star rating with hover preview -->
 * <igc-rating step="0.5" hover-preview value-format="{0} out of {1} stars"></igc-rating>
 * ```
 *
 * @example
 * ```html
 * <!-- Custom symbols via projected rating symbols -->
 * <igc-rating>
 *   <igc-rating-symbol>
 *     <igc-icon name="heart_filled" collection="default"></igc-icon>
 *     <igc-icon name="heart_outlined" collection="default" slot="empty"></igc-icon>
 *   </igc-rating-symbol>
 *   <igc-rating-symbol>
 *     <igc-icon name="heart_filled" collection="default"></igc-icon>
 *     <igc-icon name="heart_outlined" collection="default" slot="empty"></igc-icon>
 *   </igc-rating-symbol>
 * </igc-rating>
 * ```
 *
 * @element igc-rating
 *
 * @slot symbol - Slot for projecting custom `igc-rating-symbol` elements. When used, the number of symbols determines the `max` value.
 * @slot value-label - Slot for custom content displayed alongside the rating value.
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
  public static register(): void {
    registerComponent(
      IgcRatingComponent,
      IgcIconComponent,
      IgcRatingSymbolComponent
    );
  }

  //#region Internal state and properties

  protected readonly _slots = addSlotController(this, {
    slots: Slots,
    onChange: this._handleSlotChange,
    initial: true,
  });

  protected override readonly _formValue = createFormValueState(this, {
    initialValue: 0,
    transformers: FormValueNumberTransformers,
  });

  private _max = 5;
  private _step = 1;
  private _single = false;
  private _symbols: IgcRatingSymbolComponent[] = [];

  @query('[part="symbols"]', true)
  private _container?: HTMLElement;

  @state()
  private _hoverValue = -1;

  @state()
  private _hoverState = false;

  private get _isInteractive(): boolean {
    return !(this.readOnly || this.disabled);
  }

  private get _hasProjectedSymbols(): boolean {
    return this._symbols.length > 0;
  }

  private get _valueText(): string {
    // Skip IEEE 754 representation for screen readers
    const value = this._round(this.value);
    return this.valueFormat
      ? formatString(this.valueFormat, value, this.max)
      : `${value} of ${this.max}`;
  }

  //#endregion

  //#region Public attributes and properties

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
    this._max = this._hasProjectedSymbols
      ? this._symbols.length
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
  public label?: string;

  /**
   * A format string which sets aria-valuetext. Instances of '{0}' will be replaced
   * with the current value of the control and instances of '{1}' with the maximum value for the control.
   *
   * Important for screen-readers and useful for localization.
   * @attr value-format
   */
  @property({ attribute: 'value-format' })
  public valueFormat?: string;

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
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'allow-reset' })
  public allowReset = false;

  //#endregion

  //#region Lit lifecycle hooks

  constructor() {
    super();

    addThemingController(this, all);

    addKeybindings(this, {
      skip: () => !this._isInteractive,
    })
      .set(arrowUp, () => this._emitValueUpdate(this.value + this.step))
      .set(arrowRight, () =>
        this._emitValueUpdate(
          isLTR(this) ? this.value + this.step : this.value - this.step
        )
      )
      .set(arrowDown, () => this._emitValueUpdate(this.value - this.step))
      .set(arrowLeft, () =>
        this._emitValueUpdate(
          isLTR(this) ? this.value - this.step : this.value + this.step
        )
      )
      .set(homeKey, () => this._emitValueUpdate(this.step))
      .set(endKey, () => this._emitValueUpdate(this.max));
  }

  protected override firstUpdated(): void {
    this._formValue.setValueAndFormState(clamp(this.value, 0, this.max));
    this._pristine = true;
  }

  protected override updated(): void {
    if (this._hasProjectedSymbols) {
      this._updateProjectedSymbols();
    }
  }

  //#endregion

  //#region Event handlers

  private _handleClick({ clientX }: PointerEvent): void {
    const value = this._calcNewValue(clientX);
    const sameValue = this.value === value;

    if (this.allowReset && sameValue) {
      this._emitValueUpdate(0);
    } else if (!sameValue) {
      this._emitValueUpdate(value);
    }
  }

  private _handlePointerMove({ clientX }: PointerEvent): void {
    const value = this._calcNewValue(clientX);

    if (this._hoverValue !== value) {
      // Since pointermove spams a lot, only emit on a value change
      this._hoverValue = value;
      this.emitEvent('igcHover', { detail: this._hoverValue });
    }
  }

  private _handleSlotChange({
    slot,
  }: SlotChangeCallbackParameters<InferSlotNames<typeof Slots>>): void {
    if (slot === 'symbol') {
      this._symbols = this._slots.getAssignedElements('symbol', {
        selector: IgcRatingSymbolComponent.tagName,
      });

      if (this._hasProjectedSymbols) {
        this.max = this._symbols.length;
      }
    }
  }

  private _handleHoverEnabled(): void {
    this._hoverState = true;
  }

  private _handleHoverDisabled(): void {
    this._hoverState = false;
  }

  //#endregion

  //#region Private methods

  private _emitValueUpdate(next: number): void {
    this._setTouchedState();

    const clamped = clamp(next, 0, this.max);
    if (clamped !== this.value) {
      this.value = clamped;
      this.emitEvent('igcChange', { detail: this.value });
    }
  }

  private _calcNewValue(x: number): number {
    const { width, left, right } =
      this._container?.getBoundingClientRect() ?? new DOMRect(1, 1, 1, 1);
    const percent = isLTR(this) ? (x - left) / width : (right - x) / width;
    const value = this._round(this.max * percent);

    return clamp(value, this.step, this.max);
  }

  private _round(value: number): number {
    return roundPrecise(
      Math.ceil(value / this.step) * this.step,
      numberOfDecimals(this.step)
    );
  }

  private _updateProjectedSymbols(): void {
    const ltr = isLTR(this);
    const partFull = '[part="symbol full"]';
    const partEmpty = '[part="symbol empty"]';

    for (const [i, symbol] of this._symbols.entries()) {
      const full = symbol.renderRoot.querySelector<HTMLElement>(partFull);
      const empty = symbol.renderRoot.querySelector<HTMLElement>(partEmpty);
      const { forward, backward } = this._clipSymbol(i, ltr);

      if (full) {
        full.style.clipPath = forward;
      }

      if (empty) {
        empty.style.clipPath = backward;
      }
    }
  }

  private _clipSymbol(index: number, isLTR = true) {
    const value = this._hoverState ? this._hoverValue : this.value;
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

  //#endregion

  //#region Public methods

  /**
   * Increments the value of the control by `n` steps multiplied by the
   * step factor.
   */
  public stepUp(n = 1): void {
    this.value += this._round(n * this.step);
  }

  /**
   * Decrements the value of the control by `n` steps multiplied by
   * the step factor.
   */
  public stepDown(n = 1): void {
    this.value -= this._round(n * this.step);
  }

  //#endregion

  private _renderSymbols() {
    const ltr = isLTR(this);

    return html`
      ${repeat(
        range(this.max),
        (i) => i,
        (i) => {
          const { forward, backward } = this._clipSymbol(i, ltr);
          return html`
            <igc-rating-symbol exportparts="symbol, full, empty">
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
            </igc-rating-symbol>
          `;
        }
      )}
    `;
  }

  protected override render() {
    const hoverActive = this.hoverPreview && this._isInteractive;
    const valueLabelHidden = !this._slots.hasAssignedNodes('value-label', true);

    return html`
      <label part="label" id="rating-label" ?hidden=${!this.label}
        >${this.label}</label
      >
      <div
        part="base"
        role="slider"
        tabindex=${this.disabled ? -1 : 0}
        aria-labelledby="rating-label"
        aria-valuemin="0"
        aria-valuenow=${this.value}
        aria-valuemax=${this.max}
        aria-valuetext=${this._valueText}
      >
        <div
          aria-hidden="true"
          part="symbols"
          @click=${bindIf(this._isInteractive, this._handleClick)}
          @pointerenter=${bindIf(hoverActive, this._handleHoverEnabled)}
          @pointerleave=${bindIf(hoverActive, this._handleHoverDisabled)}
          @pointercancel=${bindIf(hoverActive, this._handleHoverDisabled)}
          @pointermove=${bindIf(hoverActive, this._handlePointerMove)}
        >
          <slot name="symbol">
            ${this._hasProjectedSymbols ? nothing : this._renderSymbols()}
          </slot>
        </div>
        <label part="value-label" ?hidden=${valueLabelHidden}>
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
