import {
  html,
  LitElement,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import {
  type ARIABindings,
  ariaBindings,
} from '#internals/controllers/aria-projection.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  escapeKey,
  homeKey,
  isKey,
  isModifierKey,
  pageDownKey,
  pageUpKey,
} from '#internals/controllers/key-bindings.js';
import { blazorDeepImport } from '#internals/decorators/blazorDeepImport.js';
import { createTimer } from '#internals/timing.js';
import { isLTR, pointToFraction } from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  toggleEventListener,
} from '#internals/utils/events.js';
import {
  asNumber,
  asPercent,
  clamp,
  numberOfDecimals,
  roundPrecise,
} from '#internals/utils/math.js';
import { equal } from '#internals/utils/objects.js';
import { formatString } from '#internals/utils/strings.js';
import { isDefined } from '#internals/utils/types.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcPopoverComponent from '../popover/popover.js';
import type {
  SliderTickLabelRotation,
  SliderTickOrientation,
} from '../types.js';
import IgcSliderLabelComponent from './slider-label.js';
import { styles as shared } from './themes/shared/slider.common.css.js';
import { styles } from './themes/slider.base.css.js';
import { all } from './themes/themes.js';

/** The components that both sliders render. */
export const sliderDependencies = [
  IgcSliderLabelComponent,
  IgcPopoverComponent,
];

/**
 * Moves `base` by `steps` steps. It rounds to the decimals of `base` and
 * `step`, so a value on a step stays.
 */
function stepFrom(base: number, step: number, steps: number): number {
  const decimals = Math.max(numberOfDecimals(base), numberOfDecimals(step));
  return roundPrecise(base + steps * step, decimals);
}

/**
 * Counts the steps from `base` to the step nearest to `value`. As a native
 * range does, it compares the decimal distances, and a tie goes to the higher
 * step. In binary, 0.35 / 0.1 gives 3.4999999999999996.
 */
function stepsTo(value: number, base: number, step: number): number {
  const places = Math.max(
    numberOfDecimals(value),
    numberOfDecimals(base),
    numberOfDecimals(step)
  );
  const below = Math.floor((value - base) / step);
  const down = roundPrecise(value - stepFrom(base, step, below), places);

  return roundPrecise(step - down, places) <= down ? below + 1 : below;
}

@blazorDeepImport
export class IgcSliderBaseComponent extends LitElement {
  public static override styles = [styles, shared];

  @query(`[part~='thumb']`)
  protected _thumb!: HTMLElement;

  @query(`[part='base']`, true)
  protected _base!: HTMLDivElement;

  @queryAssignedElements({ selector: 'igc-slider-label' })
  private _labelElements!: HTMLElement[];

  private _min = 0;
  private _max = 100;
  /** The `min` and `max` of the last update. */
  private _scale: [number, number] = [0, 100];
  private _step = 1;
  private _lowerBound?: number;
  private _upperBound?: number;
  private _startValue?: number;
  /** The pointer that drags a thumb. */
  private _dragPointer?: number;
  /** The locale and a copy of the options of {@link _numberFormat}. */
  private _formatSource?: [string, Intl.NumberFormatOptions];
  private _numberFormat?: Intl.NumberFormat;
  protected _activeThumb?: HTMLElement;

  private readonly _thumbLabelTimer = createTimer(() => {
    this._thumbLabelsVisible = false;
  }, 750);

  @state()
  protected _thumbLabelsVisible = false;

  @state()
  protected _labels: string[] = [];

  protected get _hasLabels() {
    return this._labels.length > 0;
  }

  protected get _distance() {
    return this.max - this.min;
  }

  /**
   * The minimum value of the slider scale. Defaults to 0.
   *
   * If `min` is greater than `max`, the update keeps the previous `min`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `min` is always 0.
   *
   * If `lowerBound` is less than `min`, the slider uses `min` as the lower bound.
   * @attr
   */
  @property({ type: Number })
  public set min(value: number) {
    this._min = asNumber(value, this._min);
  }

  public get min(): number {
    return this._hasLabels ? 0 : this._min;
  }

  /**
   * The maximum value of the slider scale. Defaults to 100.
   *
   * If `max` is less than `min`, the update keeps the previous `max`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `max` is always the number of
   * labels minus one.
   *
   * If `upperBound` is greater than `max`, the slider uses `max` as the upper bound.
   * @attr
   */
  @property({ type: Number })
  public set max(value: number) {
    this._max = asNumber(value, this._max);
  }

  public get max(): number {
    return this._hasLabels ? this._labels.length - 1 : this._max;
  }

  /**
   * The lower bound of the slider value. If not set, the `min` value is applied.
   * @attr lower-bound
   */
  @property({ type: Number, attribute: 'lower-bound' })
  public set lowerBound(value: number | null | undefined) {
    this._lowerBound =
      value == null ? undefined : Math.min(this._upperBound ?? value, value);
  }

  public get lowerBound(): number {
    const { min, max } = this;
    const upper = Math.min(this._upperBound ?? max, max);

    return clamp(this._lowerBound ?? min, min, upper);
  }

  /**
   * The upper bound of the slider value. If not set, the `max` value is applied.
   * @attr upper-bound
   */
  @property({ type: Number, attribute: 'upper-bound' })
  public set upperBound(value: number | null | undefined) {
    this._upperBound =
      value == null ? undefined : Math.max(this._lowerBound ?? value, value);
  }

  public get upperBound(): number {
    const { min, max } = this;
    const lower = Math.max(this._lowerBound ?? min, min);

    return clamp(this._upperBound ?? max, lower, max);
  }

  /**
   * Disables the UI interactions of the slider.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuous even if `discreteTrack` is `true`.
   * @attr discrete-track
   */
  @property({ type: Boolean, attribute: 'discrete-track' })
  public discreteTrack = false;

  /**
   * Hides the thumb tooltip.
   * @attr hide-tooltip
   */
  @property({ type: Boolean, attribute: 'hide-tooltip' })
  public hideTooltip = false;

  /**
   * Specifies the granularity that the value must adhere to.
   *
   * If set to 0 no stepping is implied and any value in the range is allowed.
   * A negative step is not valid, so the previous step stays.
   * If `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.
   *
   * @attr
   * @default 1
   */
  @property({ type: Number })
  public set step(value: number) {
    const step = asNumber(value, this._step);
    this._step = step < 0 ? this._step : step;
  }

  public get step(): number {
    return this._hasLabels ? 1 : this._step;
  }

  /**
   * The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.
   * @attr primary-ticks
   */
  @property({ type: Number, attribute: 'primary-ticks' })
  public primaryTicks = 0;

  /**
   * The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.
   * @attr secondary-ticks
   */
  @property({ type: Number, attribute: 'secondary-ticks' })
  public secondaryTicks = 0;

  /**
   * Changes the orientation of the ticks.
   * @attr tick-orientation
   */
  @property({ attribute: 'tick-orientation' })
  public tickOrientation: SliderTickOrientation = 'end';

  /**
   * Hides the primary tick labels.
   * @attr hide-primary-labels
   */
  @property({ type: Boolean, attribute: 'hide-primary-labels' })
  public hidePrimaryLabels = false;

  /**
   * Hides the secondary tick labels.
   * @attr hide-secondary-labels
   */
  @property({ type: Boolean, attribute: 'hide-secondary-labels' })
  public hideSecondaryLabels = false;

  /**
   * The locale used to format the thumb and tick label values in the slider.
   * @attr
   */
  @property()
  public locale = 'en';

  /**
   * String format used for the thumb and tick label values in the slider.
   * @attr value-format
   */
  @property({ attribute: 'value-format' })
  public valueFormat?: string;

  /**
   * Number format options used for the thumb and tick label values in the slider.
   */
  /* blazorSuppress */
  @property({ attribute: false })
  public valueFormatOptions?: Intl.NumberFormatOptions;

  /**
   * The degrees for the rotation of the tick labels. Defaults to 0.
   * @attr tick-label-rotation
   */
  @property({ type: Number, reflect: true, attribute: 'tick-label-rotation' })
  public tickLabelRotation: SliderTickLabelRotation = 0;

  constructor() {
    super();

    addThemingController(this, all);

    addSafeEventListener(this, 'pointerdown', this._pointerDown);
    addSafeEventListener(this, 'pointermove', this._pointerMove);
    addSafeEventListener(this, 'lostpointercapture', this._lostPointerCapture);
    addSafeEventListener(this, 'keyup', this._handleKeyUp);

    addKeybindings(this, {
      skip: () => this.disabled,
    })
      .set(arrowLeft, () => this._handleArrowKeys(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this._handleArrowKeys(isLTR(this) ? 1 : -1))
      .set(arrowUp, () => this._handleArrowKeys(1))
      .set(arrowDown, () => this._handleArrowKeys(-1))
      .set(homeKey, () => this._handleKeyboardMove(this.lowerBound))
      .set(endKey, () => this._handleKeyboardMove(this.upperBound))
      .set(pageUpKey, () => this._handlePageKeys(1))
      .set(pageDownKey, () => this._handlePageKeys(-1));
  }

  protected override willUpdate(changedProperties: PropertyValues): void {
    // `valueFormatOptions` can change in place, so the update keeps a copy.
    const formatSource: [string, Intl.NumberFormatOptions] = [
      this.locale,
      { ...this.valueFormatOptions },
    ];
    if (!equal(formatSource, this._formatSource)) {
      this._formatSource = formatSource;
      this._numberFormat = undefined;
    }

    // No label waits to open again. A thumb of a disabled range slider keeps
    // the focus.
    if (this._thumbLabelsOff) {
      this._dismissThumbLabels();
    }

    if (changedProperties.has('_thumbLabelsVisible')) {
      this._listenForEscape(this._thumbLabelsVisible);
    }

    // Only the limit that changed differs from the last scale.
    if (this._min > this._max) {
      [this._min, this._max] = this._scale;
    }

    this._scale = [this._min, this._max];

    const constraintsChanged =
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('lowerBound') ||
      changedProperties.has('upperBound') ||
      changedProperties.has('step') ||
      changedProperties.has('_labels');

    // Attributes apply one at a time, so the update resolves the values as set.
    this._normalizeValue(constraintsChanged);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._dismissThumbLabels();
    this._listenForEscape(false);
  }

  /* alternateName: focusComponent */
  /**
   * Sets focus on the thumb, or on the lower thumb of a range slider. A thumb
   * that has the focus keeps it. A disabled slider does not take the focus.
   */
  public override focus(options?: FocusOptions): void {
    if (!(this.disabled || this._activeThumb)) {
      this._thumb?.focus(options);
    }
  }

  /* alternateName: blurComponent */
  /** Removes focus from the thumb. */
  public override blur(): void {
    this._activeThumb?.blur();
  }

  private _handleArrowKeys(delta: -1 | 1) {
    this._handleKeyboardMove(this._activeValue + (this.step || 1) * delta);
  }

  private _handlePageKeys(delta: -1 | 1) {
    const step = this.step || 1;
    this._handleKeyboardMove(
      this._activeValue +
        delta * Math.max((this.upperBound - this.lowerBound) / 10, step)
    );
  }

  private _handleKeyboardMove(target: number) {
    if (target === this._activeValue) {
      return;
    }

    const updated = this._updateValue(target);
    this._showThumbLabels();
    this._hideThumbLabels();

    if (updated) {
      this._emitChangeEvent();
    }
  }

  /**
   * A key release marks keyboard focus, which keeps the labels shown. As for
   * `:focus-visible`, a modifier key alone does not.
   */
  private _handleKeyUp(event: KeyboardEvent) {
    if (isModifierKey(event.key)) {
      return;
    }

    this._activeThumb?.part.add('focused');

    // Escape hid the labels on its key press.
    if (this._activeThumb && !isKey(event, escapeKey)) {
      this._showThumbLabels();
    }
  }

  /** The labels override `min`, `max` and `step` in their getters. */
  protected _handleSlotChange() {
    const labels = this._labelElements.map((label) => label.textContent ?? '');

    // A new array with the same labels would cost one more update.
    if (!equal(labels, this._labels)) {
      this._labels = labels;
    }
  }

  /* c8 ignore next 3 */
  protected get _activeValue() {
    return 0;
  }

  /**
   * Resolves the values as set against the final constraints when
   * `constraintsChanged`, and then forgets them.
   */
  /* c8 ignore next */
  protected _normalizeValue(_constraintsChanged: boolean): void {}

  /**
   * Returns `requested` when the constraints change it, so the update can
   * resolve it again. It also requests the update, which Lit skips when the
   * value stays the same.
   */
  protected _keepRequest(
    requested: number,
    resolved: number
  ): number | undefined {
    if (requested === resolved) {
      return undefined;
    }

    this.requestUpdate();
    return requested;
  }

  /** The ARIA bindings of the thumbs container. */
  protected _thumbsAria(): ARIABindings {
    return {};
  }

  /** The position of `value` on the scale, in percent. */
  protected _percentOf(value: number): number {
    return this._distance ? asPercent(value - this.min, this._distance) : 0;
  }

  /* c8 ignore next 3 */
  protected _getTrackStyle(): StyleInfo {
    return {};
  }

  /** Moves the active thumb to `target`, and returns whether it moved. */
  protected _updateValue(target: number): boolean {
    const value = this._validateValue(target);

    if (value === this._activeValue) {
      return false;
    }

    this._setActiveValue(value);
    this._emitInputEvent();
    return true;
  }

  /* c8 ignore next */
  protected _setActiveValue(_value: number): void {}

  /* c8 ignore next 3 */
  protected _renderThumbs(): TemplateResult<1> {
    return html``;
  }

  /* c8 ignore next */
  protected _emitInputEvent() {}

  /* c8 ignore next */
  protected _emitChangeEvent() {}

  /**
   * Clamps `value` into the bounds and snaps it to the nearest step from `min`,
   * as a native range input does: a tie goes to the higher step.
   */
  protected _validateValue(value: number) {
    const { lowerBound, upperBound, min, step } = this;
    const clamped = clamp(value, lowerBound, upperBound);

    if (!step) {
      return clamped;
    }

    const toValue = (steps: number) => stepFrom(min, step, steps);
    const steps = stepsTo(clamped, min, step);

    let snapped = toValue(steps);

    // A bound can be off the steps, so go one step back inside.
    if (snapped > upperBound) {
      snapped = toValue(steps - 1);
    } else if (snapped < lowerBound) {
      snapped = toValue(steps + 1);
    }

    // No step lies between the bounds.
    return snapped < lowerBound || snapped > upperBound ? clamped : snapped;
  }

  protected _formatValue(value: number) {
    this._numberFormat ??= new Intl.NumberFormat(
      this.locale,
      this.valueFormatOptions
    );
    const strValue = this._numberFormat.format(value);
    return this.valueFormat
      ? formatString(this.valueFormat, strValue)
      : strValue;
  }

  protected _closestHandle(_event: PointerEvent): HTMLElement {
    return this._thumb;
  }

  private _totalTickCount(): number {
    const { primaryTicks, secondaryTicks } = this;
    let primary = primaryTicks === 1 ? 2 : primaryTicks;

    if (this._hasLabels) {
      primary = primaryTicks > 0 ? this._labels.length : 0;
    }

    if (primary > 0) {
      return (primary - 1) * secondaryTicks + primary;
    }

    return secondaryTicks > 0 ? secondaryTicks : 0;
  }

  private _tickValue(idx: number, tickCount: number) {
    const distance = this._distance;
    const labelStep = tickCount > 1 ? distance / (tickCount - 1) : distance;

    return this.min + labelStep * idx;
  }

  private _isPrimary(idx: number) {
    return this.primaryTicks > 0 && idx % (this.secondaryTicks + 1) === 0;
  }

  /** No label shows while the slider is disabled or hides its tooltip. */
  private get _thumbLabelsOff(): boolean {
    return this.disabled || this.hideTooltip;
  }

  protected _showThumbLabels() {
    if (this._thumbLabelsOff) {
      return;
    }

    this._thumbLabelTimer.stop();
    this._thumbLabelsVisible = true;
  }

  /**
   * Starts the hide timer, unless a thumb has keyboard focus. The `focused`
   * part tells it, because a script focus also matches `:focus-visible`.
   */
  protected _hideThumbLabels() {
    if (
      isDefined(this._dragPointer) ||
      !this._thumbLabelsVisible ||
      this._activeThumb?.part.contains('focused')
    ) {
      return;
    }

    this._thumbLabelTimer.start();
  }

  private _dismissThumbLabels(): void {
    this._thumbLabelTimer.stop();
    this._thumbLabelsVisible = false;
  }

  /**
   * Escape hides the labels also while the focus is elsewhere (WCAG 1.4.13).
   * The capture phase runs before a `stopPropagation()`, and the key still
   * reaches a dialog around the slider.
   */
  private _listenForEscape(active: boolean): void {
    toggleEventListener(globalThis, active, 'keydown', this._handleEscape, {
      capture: true,
    });
  }

  private readonly _handleEscape = (event: Event): void => {
    if (isKey(event as KeyboardEvent, escapeKey)) {
      this._dismissThumbLabels();
    }
  };

  /** Moves the active thumb to the step nearest to the pointer. */
  private _updateSlider(clientX: number) {
    if (this.disabled || !this._activeThumb) {
      return;
    }

    const activeValue = this._activeValue;
    const { step } = this;
    const fraction = pointToFraction(this._base, clientX, isLTR(this));
    const target = this.min + fraction * this._distance;

    // Whole steps from the value, so a value off the steps moves as on a key.
    this._updateValue(
      step
        ? stepFrom(activeValue, step, stepsTo(target, activeValue, step))
        : target
    );
  }

  private _pointerDown(event: PointerEvent) {
    const dragging =
      isDefined(this._dragPointer) && this.hasPointerCapture(this._dragPointer);

    // As for a native range, only the primary button moves a thumb, and only
    // one pointer at a time.
    if (event.button !== 0 || dragging) {
      return;
    }

    const thumb = this._closestHandle(event);
    thumb.focus();

    this._startValue = this._activeValue;
    this._updateSlider(event.clientX);

    this.setPointerCapture(event.pointerId);
    this._dragPointer = event.pointerId;
    this._showThumbLabels();
    event.preventDefault();
    this._activeThumb?.part.remove('focused');
  }

  private _pointerMove(event: PointerEvent) {
    if (event.pointerId === this._dragPointer) {
      this._updateSlider(event.clientX);
    }
  }

  private _lostPointerCapture(event: PointerEvent) {
    if (event.pointerId !== this._dragPointer) {
      return;
    }

    this._dragPointer = undefined;
    this._hideThumbLabels();

    if (this._startValue !== this._activeValue) {
      this._emitChangeEvent();
    }
    this._startValue = undefined;
  }

  protected _handleThumbFocus(event: FocusEvent) {
    this._activeThumb = event.target as HTMLElement;
  }

  protected _handleThumbBlur(event: FocusEvent) {
    this._activeThumb?.part.remove('focused');
    this._activeThumb = undefined;

    // The label of a thumb under the pointer stays, as on hover.
    if (!(event.target as Element).matches(':hover')) {
      this._hideThumbLabels();
    }
  }

  protected *_renderTickItems() {
    const total = this._totalTickCount();
    const secondaryTicks = this.secondaryTicks + 1;

    for (let i = 0; i < total; i++) {
      const primary = this._isPrimary(i);
      const labelInner = this._hasLabels
        ? primary
          ? this._labels[Math.round(i / secondaryTicks)]
          : nothing
        : this._formatValue(this._tickValue(i, total));
      // The projected labels name only the primary ticks.
      const labelHidden =
        labelInner === nothing ||
        (primary ? this.hidePrimaryLabels : this.hideSecondaryLabels);

      yield html`<div part="tick-group">
        <div part="tick" data-primary=${primary}></div>
        ${
          labelHidden
            ? nothing
            : html`
                <div part="tick-label">
                  <span part="tick-label-inner">${labelInner}</span>
                </div>
              `
        }
      </div>`;
    }
  }

  /** The ticks do not depend on the value, so a drag does not render them. */
  protected _renderTicks() {
    const deps = [
      this.min,
      this.max,
      this._labels,
      this.primaryTicks,
      this.secondaryTicks,
      this.hidePrimaryLabels,
      this.hideSecondaryLabels,
      this.valueFormat,
      this._formatSource,
    ];

    return html`<div part="ticks">
      ${guard(deps, () => this._renderTickItems())}
    </div>`;
  }

  /** Renders a thumb, and its value label in a popover in the top layer. */
  protected _renderThumb(value: number, aria: ARIABindings, thumbId = 'thumb') {
    const label = this._hasLabels ? this._labels[value] : undefined;
    const formatted = this.valueFormat || this.valueFormatOptions;
    const textValue =
      label ?? (formatted ? this._formatValue(value) : undefined);

    return html`
      <div
        ${ariaBindings(aria)}
        part="thumb"
        id=${thumbId}
        tabindex=${this.disabled ? -1 : 0}
        style=${styleMap({ insetInlineStart: `${this._percentOf(value)}%` })}
        role="slider"
        aria-valuemin=${this.lowerBound}
        aria-valuemax=${this.upperBound}
        aria-valuenow=${value}
        aria-valuetext=${ifDefined(textValue)}
        aria-disabled=${this.disabled}
        @pointerenter=${this._showThumbLabels}
        @pointerleave=${this._hideThumbLabels}
        @focus=${this._handleThumbFocus}
        @blur=${this._handleThumbBlur}
      ></div>
      ${
        this.hideTooltip
          ? nothing
          : html`
              <igc-popover
                anchor=${thumbId}
                placement="top"
                scroll-strategy="hide"
                ?open=${this._thumbLabelsVisible}
              >
                <div
                  part="thumb-label"
                  aria-hidden="true"
                  style=${styleMap({ opacity: this._thumbLabelsVisible ? 1 : 0 })}
                >
                  <div part="thumb-label-inner">
                    ${textValue ?? this._formatValue(value)}
                  </div>
                </div>
              </igc-popover>
            `
      }
    `;
  }

  private _renderSteps() {
    if (!this.discreteTrack || !this.step || !this._distance) {
      return nothing;
    }

    const interval = (100 * Math.SQRT2 * this.step) / this._distance;

    return html`
      <div part="steps">
        <svg width="100%" height="100%" style="display: flex">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke-dasharray="0, calc(${interval}%)"
          ></line>
        </svg>
      </div>
    `;
  }

  protected override render() {
    const isStart = this.tickOrientation === 'start';
    const isMirrored = this.tickOrientation === 'mirror';

    return html`
      <div part="base">
        ${isStart || isMirrored ? this._renderTicks() : nothing}
        <div part="track">
          <div part="inactive"></div>
          <div part="fill" style=${styleMap(this._getTrackStyle())}></div>
          ${this._renderSteps()}
        </div>
        ${isStart ? nothing : this._renderTicks()}
        <div part="thumbs" ${ariaBindings(this._thumbsAria())}>
          ${this._renderThumbs()}
        </div>
        <slot @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
  }
}
