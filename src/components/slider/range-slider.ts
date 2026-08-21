import { html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { asNumber, asPercent } from '#internals/utils/math.js';
import { IgcSliderBaseComponent } from './slider-base.js';
import IgcSliderLabelComponent from './slider-label.js';

/* blazorSuppress */
export interface IgcRangeSliderValueEventArgs {
  lower: number;
  upper: number;
}

export interface IgcRangeSliderComponentEventMap {
  /**
   * Emitted when a value is changed via thumb drag or keyboard interaction.
   */
  igcInput: CustomEvent<IgcRangeSliderValueEventArgs>;
  /**
   * Emitted when a value change is committed on a thumb drag end or keyboard interaction.
   */
  igcChange: CustomEvent<IgcRangeSliderValueEventArgs>;
}

/**
 * A range slider component used to select two numeric values within a range.
 *
 * @element igc-range-slider
 *
 * @fires igcInput - Emitted when a value is changed via thumb drag or keyboard interaction.
 * @fires igcChange - Emitted when a value change is committed on a thumb drag end or keyboard interaction.
 *
 * @csspart base - The base wrapper of the slider.
 * @csspart ticks - The ticks container.
 * @csspart tick-group - The tick group container.
 * @csspart tick - The tick element.
 * @csspart tick-label - The tick label element.
 * @csspart tick-label-inner - The inner element of the tick label.
 * @csspart thumbs - The thumbs container.
 * @csspart thumb - The thumb element.
 * @csspart thumb-label - The thumb tooltip label container.
 * @csspart thumb-label-inner - The thumb tooltip label inner element.
 * @csspart track - The track container.
 * @csspart steps - The track steps element.
 * @csspart inactive - The inactive element of the track.
 * @csspart fill - The filled part of the track.
 */
export default class IgcRangeSliderComponent extends EventEmitterMixin<
  IgcRangeSliderComponentEventMap,
  Constructor<IgcSliderBaseComponent>
>(IgcSliderBaseComponent) {
  public static readonly tagName = 'igc-range-slider';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRangeSliderComponent, IgcSliderLabelComponent);
  }

  @query('#thumbFrom')
  private thumbFrom!: HTMLElement;

  @query('#thumbTo')
  private thumbTo!: HTMLElement;

  private _lower = 0;
  private _upper = 0;

  /**
   * The current value of the lower thumb.
   * @attr
   */
  @property({ type: Number })
  public set lower(val: number) {
    this._lower = this.validateValue(asNumber(val, this._lower));
  }

  public get lower(): number {
    return this._lower;
  }

  /**
   * The current value of the upper thumb.
   * @attr
   */
  @property({ type: Number })
  public set upper(val: number) {
    this._upper = this.validateValue(asNumber(val, this._upper));
  }

  public get upper(): number {
    return this._upper;
  }

  /**
   * The aria label for the lower thumb.
   * @attr thumb-label-lower
   */
  @property({ attribute: 'thumb-label-lower' })
  public thumbLabelLower!: string;

  /**
   * The aria label for the upper thumb.
   * @attr thumb-label-upper
   */
  @property({ attribute: 'thumb-label-upper' })
  public thumbLabelUpper!: string;

  protected override get activeValue(): number {
    return this.activeThumb === this.thumbFrom ? this.lower : this.upper;
  }

  protected override normalizeValue(): void {
    this._lower = this.validateValue(this._lower);
    this._upper = this.validateValue(this._upper);
  }

  protected override getTrackStyle() {
    const start = asPercent(this.lower - this.min, this.distance);
    return {
      insetInlineStart: `${start}%`,
      width: `${asPercent(this.upper - this.min, this.distance) - start}%`,
    };
  }

  private closestTo(goal: number, positions: number[]): number {
    return positions.reduce((previous, current) =>
      Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous
    );
  }

  protected override closestHandle(event: PointerEvent): HTMLElement {
    const fromX = getCenterPoint(this.thumbFrom).x;
    const toX = getCenterPoint(this.thumbTo).x;
    const pointerX = event.clientX;

    if (fromX === toX) {
      return toX < pointerX ? this.thumbTo : this.thumbFrom;
    }

    return this.closestTo(pointerX, [fromX, toX]) === fromX
      ? this.thumbFrom
      : this.thumbTo;
  }

  protected override updateValue(increment: number) {
    const oldValue = this.activeValue;
    let [lower, upper] = [this.lower, this.upper];

    if (this.activeThumb === this.thumbFrom) {
      lower += increment;
    } else {
      upper += increment;
    }

    if (lower >= upper) {
      [this.lower, this.upper] = [upper, lower];
      this.toggleActiveThumb();
    } else {
      [this.lower, this.upper] = [lower, upper];
    }

    if (oldValue === this.activeValue) {
      return false;
    }

    this.emitInputEvent();
    return true;
  }

  protected override emitInputEvent() {
    this.emitEvent('igcInput', {
      detail: { lower: this.lower, upper: this.upper },
    });
  }

  protected override emitChangeEvent() {
    this.emitEvent('igcChange', {
      detail: { lower: this.lower, upper: this.upper },
    });
  }

  private toggleActiveThumb() {
    const thumb =
      this.activeThumb === this.thumbFrom ? this.thumbTo : this.thumbFrom;
    thumb.focus();
  }

  /** The focused thumb announces the whole range, not just its own end. */
  protected override handleThumbFocus(event: FocusEvent) {
    super.handleThumbFocus(event);

    const active = event.target as HTMLElement;
    const other = active === this.thumbFrom ? this.thumbTo : this.thumbFrom;
    const values = [
      asNumber(active.ariaValueNow),
      asNumber(other.ariaValueNow),
    ];

    active.ariaValueText = `${this.formatValue(Math.min(...values))} - ${this.formatValue(Math.max(...values))}`;
  }

  protected override _thumbAriaValueText(thumbId?: string) {
    return thumbId === 'thumbFrom' ? `min ${this.lower}` : `max ${this.upper}`;
  }

  protected override renderThumbs() {
    return html`${this.renderThumb(
      this.lower,
      this.thumbLabelLower,
      'thumbFrom'
    )}
    ${this.renderThumb(this.upper, this.thumbLabelUpper, 'thumbTo')}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-range-slider': IgcRangeSliderComponent;
  }
}
