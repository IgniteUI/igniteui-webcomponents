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
  igcInput: CustomEvent<IgcRangeSliderValue>;
  igcChange: CustomEvent<IgcRangeSliderValue>;
}

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
    this.requestUpdate('value', oldVal);
  }

  @property({ attribute: false })
  public get lower() {
    return this._lower;
  }

  public set upper(val: number) {
    const oldVal = this._upper;
    this._upper = this.validateValue(val);
    this.requestUpdate('value', oldVal);
  }

  @property({ attribute: false })
  public get upper() {
    return this._upper;
  }

  protected get activeValue(): number {
    return this.activeThumb === this.thumbFrom ? this.lower : this.upper;
  }

  protected get fillValue() {
    return this.upper - this.lower;
  }

  protected normalizeValue(): void {
    this._lower = this.validateValue(this._lower);
    this._upper = this.validateValue(this._upper);
  }

  protected getTrackStyle() {
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

  protected closestHandle(event: PointerEvent): HTMLElement {
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

  protected updateValue(increment: number) {
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

  protected emitInputEvent() {
    this.emitEvent('igcInput', {
      detail: { lower: this.lower, upper: this.upper },
    });
  }

  protected emitChangeEvent() {
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

  protected renderThumbs() {
    return html`${this.renderThumb(this.lower, 'thumbFrom')}
    ${this.renderThumb(this.upper, 'thumbTo')}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-range-slider': IgcRangeSliderComponent;
  }
}
