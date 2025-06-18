import { html, LitElement, nothing, type TemplateResult } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';

import { themes } from '../../theming/theming-decorator.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
  pageDownKey,
  pageUpKey,
} from '../common/controllers/key-bindings.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { watch } from '../common/decorators/watch.js';
import {
  asNumber,
  asPercent,
  clamp,
  formatString,
  isDefined,
  isLTR,
} from '../common/util.js';
import type {
  SliderTickLabelRotation,
  SliderTickOrientation,
} from '../types.js';
import { styles as shared } from './themes/shared/slider.common.css.js';
import { styles } from './themes/slider.base.css.js';
import { all } from './themes/themes.js';

@themes(all)
@blazorDeepImport
export class IgcSliderBaseComponent extends LitElement {
  public static override styles = [styles, shared];

  @query(`[part~='thumb']`)
  protected thumb!: HTMLElement;

  @query(`[part='base']`, true)
  protected base!: HTMLDivElement;

  @queryAssignedElements({ selector: 'igc-slider-label' })
  private labelElements!: HTMLElement[];

  private _min = 0;
  private _max = 100;
  private _lowerBound?: number;
  private _upperBound?: number;
  private _step = 1;
  private startValue?: number;
  private pointerCaptured = false;
  private thumbHoverTimer: any;
  protected activeThumb?: HTMLElement;

  @state()
  protected thumbLabelsVisible = false;

  @state()
  protected labels: string[] = [];

  protected get hasLabels() {
    return this.labels?.length > 0;
  }

  protected get distance() {
    return this.max - this.min;
  }

  /**
   * The minimum value of the slider scale. Defaults to 0.
   *
   * If `min` is greater than `max` the call is a no-op.
   *
   * If `labels` are provided (projected), then `min` is always set to 0.
   *
   * If `lowerBound` ends up being less than than the current `min` value,
   * it is automatically assigned the new `min` value.
   * @attr
   */
  @property({ type: Number })
  public set min(value: number) {
    if (!isDefined(value) || value > this.max) {
      return;
    }

    this._min = this.hasLabels ? 0 : value;

    if (isDefined(this._lowerBound) && this._lowerBound! < value) {
      this._lowerBound = value;
    }
  }

  public get min(): number {
    return this._min;
  }

  /**
   * The maximum value of the slider scale. Defaults to 100.
   *
   * If `max` is less than `min` the call is a no-op.
   *
   * If `labels` are provided (projected), then `max` is always set to
   * the number of labels.
   *
   * If `upperBound` ends up being greater than than the current `max` value,
   * it is automatically assigned the new `max` value.
   * @attr
   */
  @property({ type: Number })
  public set max(value: number) {
    if (!isDefined(value) || value < this._min) {
      return;
    }

    this._max = this.hasLabels ? this.labels.length - 1 : value;

    if (isDefined(this._upperBound) && this._upperBound! > value) {
      this._upperBound = value;
    }
  }

  public get max(): number {
    return this._max;
  }

  /**
   * The lower bound of the slider value. If not set, the `min` value is applied.
   * @attr lower-bound
   */
  @property({ type: Number, attribute: 'lower-bound' })
  public set lowerBound(value: number) {
    if (!isDefined(value)) return;
    this._lowerBound = Math.min(this._upperBound ?? value, value);
  }

  public get lowerBound(): number {
    const current = this._lowerBound ?? this._min;
    const upper = Math.min(this._upperBound ?? this._max, this._max);

    return clamp(current, this._min, upper);
  }

  /**
   * The upper bound of the slider value. If not set, the `max` value is applied.
   * @attr upper-bound
   */
  @property({ type: Number, attribute: 'upper-bound' })
  public set upperBound(value: number) {
    if (!isDefined(value)) return;
    this._upperBound = Math.max(this._lowerBound ?? value, value);
  }

  public get upperBound(): number {
    const current = this._upperBound ?? this._max;
    const lower = Math.max(this._lowerBound ?? this._min, this.min);

    return clamp(current, lower, this._max);
  }

  /**
   * Disables the UI interactions of the slider.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.
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
   * If `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.
   *
   * @attr
   */
  @property({ type: Number })
  public set step(value: number) {
    this._step = this.hasLabels ? 1 : asNumber(value, this._step);
  }

  public get step(): number {
    return this._step;
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

  @watch('min', { waitUntilFirstUpdate: true })
  @watch('max', { waitUntilFirstUpdate: true })
  @watch('lowerBound', { waitUntilFirstUpdate: true })
  @watch('upperBound', { waitUntilFirstUpdate: true })
  @watch('step', { waitUntilFirstUpdate: true })
  protected constraintsChange() {
    this.normalizeValue();
  }

  constructor() {
    super();
    this.addEventListener('pointerdown', this.pointerDown);
    this.addEventListener('pointermove', this.pointerMove);
    this.addEventListener('lostpointercapture', this.lostPointerCapture);
    this.addEventListener('keyup', this.handleKeyUp);

    addKeybindings(this, {
      skip: () => this.disabled,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, () => this.handleArrowKeys(isLTR(this) ? -1 : 1))
      .set(arrowRight, () => this.handleArrowKeys(isLTR(this) ? 1 : -1))
      .set(arrowUp, () => this.handleArrowKeys(1))
      .set(arrowDown, () => this.handleArrowKeys(-1))
      .set(homeKey, () =>
        this.handleKeyboardIncrement(this.lowerBound - this.activeValue)
      )
      .set(endKey, () =>
        this.handleKeyboardIncrement(this.upperBound - this.activeValue)
      )
      .set(pageUpKey, () => this.handlePageKeys(1))
      .set(pageDownKey, () => this.handlePageKeys(-1));
  }

  private handleArrowKeys(delta: -1 | 1) {
    const step = this.step ? this.step : 1;
    this.handleKeyboardIncrement(step * delta);
  }

  private handlePageKeys(delta: -1 | 1) {
    const step = this.step ? this.step : 1;
    this.handleKeyboardIncrement(
      delta * Math.max((this.upperBound - this.lowerBound) / 10, step)
    );
  }

  private handleKeyboardIncrement(increment: number) {
    if (increment) {
      const updated = this.updateValue(increment);
      this.showThumbLabels();
      this.hideThumbLabels();

      if (updated) {
        this.emitChangeEvent();
      }
    }
  }

  private handleKeyUp() {
    this.activeThumb?.part.add('focused');
  }

  protected handleSlotChange() {
    this.labels = this.labelElements.map((label) => label.textContent ?? '');
    if (this.hasLabels) {
      this.min = 0;
      this.max = this.labels.length - 1;
      this.step = 1;
    }
  }

  /* c8 ignore next 3 */
  protected get activeValue() {
    return 0;
  }

  /* c8 ignore next */
  protected normalizeValue(): void {}

  /* c8 ignore next 3 */
  protected getTrackStyle(): StyleInfo {
    return {};
  }

  /* c8 ignore next 3 */
  protected updateValue(_increment: number): boolean {
    return false;
  }

  /* c8 ignore next 3 */
  protected renderThumbs(): TemplateResult<1> {
    return html``;
  }

  /* c8 ignore next */
  protected emitInputEvent() {}

  /* c8 ignore next */
  protected emitChangeEvent() {}

  protected validateValue(value: number) {
    return this.normalizeByStep(clamp(value, this.lowerBound, this.upperBound));
  }

  protected formatValue(value: number) {
    const strValue = value.toLocaleString(this.locale, this.valueFormatOptions);
    return this.valueFormat
      ? formatString(this.valueFormat, strValue)
      : strValue;
  }

  private normalizeByStep(value: number) {
    return this.step ? value - ((value - this.lowerBound) % this.step) : value;
  }

  protected closestHandle(_event: PointerEvent): HTMLElement {
    return this.thumb;
  }

  private totalTickCount() {
    const primaryTicks = this.hasLabels
      ? this.primaryTicks > 0
        ? this.labels.length
        : 0
      : this.primaryTicks === 1
        ? 2
        : this.primaryTicks;

    return primaryTicks > 0
      ? (primaryTicks - 1) * this.secondaryTicks + primaryTicks
      : this.secondaryTicks > 0
        ? this.secondaryTicks
        : 0;
  }

  private tickValue(idx: number) {
    const tickCount = this.totalTickCount();
    const distance = this.distance;
    const labelStep = tickCount > 1 ? distance / (tickCount - 1) : distance;
    const labelVal = labelStep * idx;

    return this.min + labelVal;
  }

  private isPrimary(idx: number) {
    return this.primaryTicks <= 0
      ? false
      : idx % (this.secondaryTicks + 1) === 0;
  }

  protected showThumbLabels() {
    if (this.disabled || this.hideTooltip) {
      return;
    }

    if (this.thumbHoverTimer) {
      clearTimeout(this.thumbHoverTimer);
      this.thumbHoverTimer = null;
    }

    this.thumbLabelsVisible = true;
  }

  protected hideThumbLabels() {
    if (this.pointerCaptured || !this.thumbLabelsVisible) {
      return;
    }

    this.thumbHoverTimer = setTimeout(() => {
      this.thumbLabelsVisible = false;
    }, 750);
  }

  private calculateTrackUpdate(mouseX: number): number {
    const { width, left } = this.activeThumb!.getBoundingClientRect();
    const { width: trackWidth } = this.base.getBoundingClientRect();

    const thumbX = left + width / 2;
    const scale = trackWidth / this.distance;
    const change = isLTR(this) ? mouseX - thumbX : thumbX - mouseX;

    if (this.step) {
      const stepDistance = scale * this.step;

      // If the thumb scale range (slider update) is less than a half step,
      // the position stays the same.
      if (Math.abs(change) < stepDistance / 2) {
        return 0;
      }

      return Math.round(change / stepDistance) * this.step;
    }
    return change / scale;
  }

  private updateSlider(mouseX: number) {
    if (this.disabled || !this.activeThumb) {
      return;
    }

    const increment = this.calculateTrackUpdate(mouseX);
    if (increment !== 0) {
      this.updateValue(increment);
    }
  }

  private pointerDown(event: PointerEvent) {
    const thumb = this.closestHandle(event);
    thumb.focus();

    this.startValue = this.activeValue;
    this.updateSlider(event.clientX);

    this.setPointerCapture(event.pointerId);
    this.pointerCaptured = true;
    this.showThumbLabels();
    event.preventDefault();
    this.activeThumb?.part.remove('focused');
  }

  private pointerMove(event: PointerEvent) {
    if (this.pointerCaptured) {
      this.updateSlider(event.clientX);
    }
  }

  private lostPointerCapture() {
    this.pointerCaptured = false;
    this.hideThumbLabels();

    if (this.startValue! !== this.activeValue) {
      this.emitChangeEvent();
    }
    this.startValue = undefined;
  }

  protected handleThumbFocus(event: FocusEvent) {
    this.activeThumb = event.target as HTMLElement;
  }

  protected handleThumbBlur() {
    this.activeThumb?.part.remove('focused');
    this.activeThumb = undefined;
  }

  protected *_renderTicks() {
    const total = this.totalTickCount();
    const secondaryTicks = this.secondaryTicks + 1;

    for (let i = 0; i < total; i++) {
      const primary = this.isPrimary(i);
      const shown = primary ? this.hidePrimaryLabels : this.hideSecondaryLabels;
      const labelInner = this.hasLabels
        ? primary
          ? this.labels[Math.round(i / secondaryTicks)]
          : nothing
        : this.formatValue(this.tickValue(i));

      yield html`<div part="tick-group">
        <div part="tick" data-primary=${primary}>
          ${shown
            ? nothing
            : html`
                <div part="tick-label">
                  <span part="tick-label-inner">${labelInner}</span>
                </div>
              `}
        </div>
      </div>`;
    }
  }

  protected renderTicks() {
    return html`<div part="ticks">${this._renderTicks()}</div>`;
  }

  protected renderThumb(value: number, ariaLabel?: string, thumbId?: string) {
    const percent = `${asPercent(value - this.min, this.distance)}%`;
    const thumbStyles = { insetInlineStart: percent };
    const tooltipStyles = {
      insetInlineStart: percent,
      opacity: this.thumbLabelsVisible ? 1 : 0,
    };

    const textValue = this.hasLabels
      ? this.labels[value]
      : this.valueFormat || this.valueFormatOptions
        ? this.formatValue(value)
        : undefined;

    return html`
      <div
        part="thumb"
        id=${ifDefined(thumbId)}
        tabindex=${this.disabled ? -1 : 0}
        style=${styleMap(thumbStyles)}
        role="slider"
        aria-valuemin=${this.lowerBound}
        aria-valuemax=${this.upperBound}
        aria-valuenow=${value}
        aria-valuetext=${ifDefined(textValue)}
        aria-label=${ifDefined(ariaLabel)}
        aria-disabled=${this.disabled}
        @pointerenter=${this.showThumbLabels}
        @pointerleave=${this.hideThumbLabels}
        @focus=${this.handleThumbFocus}
        @blur=${this.handleThumbBlur}
      ></div>
      ${this.hideTooltip
        ? nothing
        : html`
            <div part="thumb-label" style=${styleMap(tooltipStyles)}>
              <div part="thumb-label-inner">
                ${this.hasLabels ? this.labels[value] : this.formatValue(value)}
              </div>
            </div>
          `}
    `;
  }

  private renderSteps() {
    if (!this.discreteTrack || !this.step) {
      return nothing;
    }

    const interval = (100 * Math.SQRT2 * this.step) / this.distance;

    return html`
      <div part="steps">
        <svg width="100%" height="100%" style="display: flex">
          <line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="currentColor"
            stroke-dasharray="0, calc(${interval}%)"
            stroke-linecap="round"
            stroke-width="2px"
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
        ${isStart || isMirrored ? html`${this.renderTicks()}` : nothing}
        <div part="track">
          <div part="inactive"></div>
          <div part="fill" style=${styleMap(this.getTrackStyle())}></div>
          ${this.renderSteps()}
        </div>
        ${!isStart ? html`${this.renderTicks()}` : nothing}
        <div part="thumbs">${this.renderThumbs()}</div>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}
