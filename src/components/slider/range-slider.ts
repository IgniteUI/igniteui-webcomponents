import { html } from 'lit';
import { property, query } from 'lit/decorators.js';

import {
  type ARIABindings,
  hostAria,
  resolveNaming,
} from '#internals/controllers/aria-projection.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { HostAriaMixin } from '#internals/mixins/host-aria.js';
import { getCenterPoint } from '#internals/utils/dom.js';
import { asNumber } from '#internals/utils/math.js';
import { isDefined } from '#internals/utils/types.js';
import { IgcSliderBaseComponent, sliderDependencies } from './slider-base.js';

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
>(HostAriaMixin(IgcSliderBaseComponent)) {
  public static readonly tagName = 'igc-range-slider';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRangeSliderComponent, ...sliderDependencies);
  }

  @query('#thumbFrom')
  private thumbFrom!: HTMLElement;

  @query('#thumbTo')
  private thumbTo!: HTMLElement;

  private _lower = 0;
  /** `undefined` until a value is set, so `upper` follows `upperBound`. */
  private _upper?: number;

  /** The values as set, until the update resolves them. */
  private _requestedLower?: number;
  private _requestedUpper?: number;

  /**
   * The current value of the lower thumb.
   * @attr
   */
  @property({ type: Number })
  public set lower(val: number) {
    const requested = asNumber(val, this._lower);

    this._lower = this.validateValue(requested);
    this._requestedLower = this._keepRequest(requested, this._lower);
  }

  public get lower(): number {
    return this._lower;
  }

  /**
   * The current value of the upper thumb. Until it is set, and after the
   * attribute is removed, it follows `upperBound`.
   * @attr
   */
  @property({ type: Number })
  public set upper(val: number) {
    // The removal of the attribute sets `null`.
    if (val == null) {
      this._upper = undefined;
      this._requestedUpper = undefined;
      return;
    }

    const requested = asNumber(val, this.upper);

    this._upper = this.validateValue(requested);
    this._requestedUpper = this._keepRequest(requested, this._upper);
  }

  public get upper(): number {
    return this._upper ?? this.validateValue(this.upperBound);
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

  protected override normalizeValue(constraintsChanged: boolean): void {
    if (constraintsChanged) {
      const upper = this._requestedUpper ?? this._upper;

      this._lower = this.validateValue(this._requestedLower ?? this._lower);
      this._upper = isDefined(upper) ? this.validateValue(upper) : undefined;
    }

    this._requestedLower = undefined;
    this._requestedUpper = undefined;

    // A crossed pair from code swaps, as on a drag.
    if (this._lower > this.upper) {
      [this._lower, this._upper] = [this.upper, this._lower];
    }
  }

  protected override getTrackStyle() {
    const start = this._percentOf(this.lower);
    return {
      insetInlineStart: `${start}%`,
      width: `${this._percentOf(this.upper) - start}%`,
    };
  }

  protected override closestHandle(event: PointerEvent): HTMLElement {
    const fromX = getCenterPoint(this.thumbFrom).x;
    const toX = getCenterPoint(this.thumbTo).x;
    const pointerX = event.clientX;
    const closerToEnd =
      fromX === toX
        ? toX < pointerX
        : Math.abs(pointerX - toX) < Math.abs(pointerX - fromX);

    return closerToEnd ? this.thumbTo : this.thumbFrom;
  }

  protected override _setActiveValue(value: number): void {
    // Only the moved thumb gets a value, so an unset `upper` still follows
    // `upperBound`.
    if (this.activeThumb === this.thumbFrom) {
      this.lower = value;
    } else {
      this.upper = value;
    }

    // A thumb that reaches the other one swaps with it, and the focus follows.
    if (this.lower >= this.upper) {
      [this.lower, this.upper] = [this.upper, this.lower];
      this.toggleActiveThumb();
    }
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

  /**
   * The host name labels the group of the thumbs. An unnamed group gets no
   * role.
   */
  protected override _thumbsAria(): ARIABindings {
    const naming = resolveNaming(this, false);

    return naming.labelledBy || naming.label
      ? { role: 'group', ...naming }
      : {};
  }

  protected override renderThumbs() {
    const { describedBy } = hostAria(this);

    return html`
      ${this.renderThumb(
        this.lower,
        { label: this.thumbLabelLower, describedBy },
        'thumbFrom'
      )}
      ${this.renderThumb(
        this.upper,
        { label: this.thumbLabelUpper, describedBy },
        'thumbTo'
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-range-slider': IgcRangeSliderComponent;
  }
}
