import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { IgcSliderBaseComponent } from './slider-base';

export interface IgcRangeSliderValue {
  lower: number;
  upper: number;
}

export interface IgcRangeSliderEventMap {
  /**
   * Emitted when a value is changed via thumb drag or keyboard interaction.
   */
  igcInput: CustomEvent<IgcRangeSliderValue>;
  /**
   * Emitted when a value change is committed on a thumb drag end or keyboard interaction.
   */
  igcChange: CustomEvent<IgcRangeSliderValue>;
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
 * @csspart thumb-label - The thumb tooltip label.
 * @csspart track - The track container.
 * @csspart steps - The track steps element.
 * @csspart inactive - The inactive element of the track.
 * @csspart fill - The filled part of the track.
 */
export default class IgcRangeSliderComponent extends EventEmitterMixin<
  IgcRangeSliderEventMap,
  Constructor<IgcSliderBaseComponent>
>(IgcSliderBaseComponent) {
  /** @private */
  public static tagName = 'igc-range-slider';

  @query(`#thumbFrom`)
  private thumbFrom!: HTMLElement;

  @query(`#thumbTo`)
  private thumbTo!: HTMLElement;

  private _lower = 0;
  private _upper = 0;

  public set lower(val: number) {
    const oldVal = this._lower;
    this._lower = this.validateValue(val);
    this.requestUpdate('lower', oldVal);
  }

  /**
   * The current value of the lower thumb.
   */
  @property({ type: Number })
  public get lower() {
    return this._lower;
  }

  public set upper(val: number) {
    const oldVal = this._upper;
    this._upper = this.validateValue(val);
    this.requestUpdate('upper', oldVal);
  }

  /**
   * The current value of the upper thumb.
   */
  @property({ type: Number })
  public get upper() {
    return this._upper;
  }

  /**
   * The aria label of the lower thumb.
   */
  @property({ attribute: 'aria-label-lower' })
  public ariaLabelLower!: string;

  /**
   * The aria label of the upper thumb.
   */
  @property({ attribute: 'aria-label-upper' })
  public ariaLabelUpper!: string;

  protected override get activeValue(): number {
    return this.activeThumb === this.thumbFrom ? this.lower : this.upper;
  }

  protected override normalizeValue(): void {
    this._lower = this.validateValue(this._lower);
    this._upper = this.validateValue(this._upper);
  }

  protected override getTrackStyle() {
    const toPosition = this.valueToFraction(this.upper);
    const fromPosition = this.valueToFraction(this.lower);
    const positionGap = toPosition - fromPosition;

    const filledTrackStyle = {
      width: `${positionGap * 100}%`,
      insetInlineStart: `${fromPosition * 100}%`,
    };

    return filledTrackStyle;
  }

  private closestTo(goal: number, positions: number[]): number {
    return positions.reduce((previous, current) =>
      Math.abs(goal - current) < Math.abs(goal - previous) ? current : previous
    );
  }

  protected override closestHandle(event: PointerEvent): HTMLElement {
    const fromOffset =
      this.thumbFrom.offsetLeft + this.thumbFrom.offsetWidth / 2;
    const toOffset = this.thumbTo.offsetLeft + this.thumbTo.offsetWidth / 2;
    const xPointer = event.clientX - this.getBoundingClientRect().left;
    const match = this.closestTo(xPointer, [fromOffset, toOffset]);

    if (fromOffset === toOffset && toOffset < xPointer) {
      return this.thumbTo;
    } else if (fromOffset === toOffset && toOffset > xPointer) {
      return this.thumbFrom;
    } else if (match === fromOffset) {
      return this.thumbFrom;
    } else {
      return this.thumbTo;
    }
  }

  protected override updateValue(increment: number) {
    const oldValue = this.activeValue;

    let lower = this.lower;
    let upper = this.upper;

    if (this.activeThumb === this.thumbFrom) {
      lower += increment;
    } else {
      upper += increment;
    }

    if (lower >= upper) {
      this.swapValues(lower, upper);
      this.toggleActiveThumb();
    } else {
      if (this.activeThumb === this.thumbFrom) {
        this.lower = lower;
      } else {
        this.upper = upper;
      }
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

  private swapValues(lower: number, upper: number) {
    this.lower = upper;
    this.upper = lower;
  }

  private toggleActiveThumb() {
    const thumb =
      this.activeThumb === this.thumbFrom ? this.thumbTo : this.thumbFrom;
    thumb.focus();
  }

  protected override renderThumbs() {
    return html`${this.renderThumb(
      this.lower,
      this.ariaLabelLower,
      'thumbFrom'
    )}
    ${this.renderThumb(this.upper, this.ariaLabelUpper, 'thumbTo')}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-range-slider': IgcRangeSliderComponent;
  }
}
