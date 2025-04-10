import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';

import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { asNumber, asPercent } from '../common/util.js';
import { IgcSliderBaseComponent } from './slider-base.js';
import IgcSliderLabelComponent from './slider-label.js';

/* blazorSuppress */
export interface IgcRangeSliderValueEventArgs {
  lower: number;
  upper: number;
}

/** @deprecated use IgcRangeSliderValueEventArgs instead */
export type IgcRangeSliderValue = IgcRangeSliderValueEventArgs;

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
    const fromOffset =
      this.thumbFrom.offsetLeft + this.thumbFrom.offsetWidth / 2;
    const toOffset = this.thumbTo.offsetLeft + this.thumbTo.offsetWidth / 2;
    const xPointer = event.clientX - this.getBoundingClientRect().left;
    const match = this.closestTo(xPointer, [fromOffset, toOffset]);

    if (fromOffset === toOffset && toOffset < xPointer) {
      return this.thumbTo;
    }
    if (fromOffset === toOffset && toOffset > xPointer) {
      return this.thumbFrom;
    }
    if (match === fromOffset) {
      return this.thumbFrom;
    }
    return this.thumbTo;
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

  private handleFocus(event: FocusEvent) {
    this.activeThumb = event.target as HTMLElement;
    const id = this.activeThumb.id;

    for (const thumb of [this.thumbFrom, this.thumbTo]) {
      if (thumb.id === id) continue;
      const [activeValue, thumbVal] = [
        asNumber(this.activeThumb.ariaValueNow),
        asNumber(thumb.ariaValueNow),
      ];

      this.activeThumb.ariaValueText = `${this.formatValue(Math.min(activeValue, thumbVal))} - ${this.formatValue(Math.max(activeValue, thumbVal))}`;
    }
  }

  protected override renderThumb(
    value: number,
    ariaLabel?: string,
    thumbId?: string
  ) {
    const percent = `${asPercent(value - this.min, this.distance)}%`;
    const thumbStyles = { insetInlineStart: percent };
    const tooltipStyles = {
      insetInlineStart: percent,
      opacity: this.thumbLabelsVisible ? 1 : 0,
    };
    const ariaValueText =
      thumbId === 'thumbFrom' ? `min ${this.lower}` : `max ${this.upper}`;

    const textValue = this.hasLabels
      ? this.labels[value]
      : this.valueFormat || this.valueFormatOptions
        ? this.formatValue(value)
        : ariaValueText;

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
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @pointerenter=${this.showThumbLabels}
        @pointerleave=${this.hideThumbLabels}
        @focus=${this.handleFocus}
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
