import { LitElement, html } from 'lit-element';
import { property } from 'lit/decorators.js';
import { CalendarDay } from '../calendar/model.js';
import IgcChipComponent from '../chip/chip.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  type IgcDateRangePickerResourceStrings,
  IgcDateRangePickerResourceStringsEN,
} from '../common/i18n/date-range-picker.resources.js';
import type { CustomDateRange } from './date-range-picker.js';

/**
 * The predefined ranges area component is used within the `igc-date-range picker` element and it
 * displays a set of chips with predefined date ranges. The component allows users to quickly select
 * a predefined date range value. Users can also provide custom ranges to be displayed as chips.
 *
 * @element igc-predefined-ranges-area
 */
export default class IgcPredefinedRangesAreaComponent extends LitElement {
  public static readonly tagName = 'igc-predefined-ranges-area';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcPredefinedRangesAreaComponent, IgcChipComponent);
  }

  /**
   * Whether the control will show chips with predefined ranges.
   * @attr
   */
  @property({
    reflect: true,
    type: Boolean,
    attribute: 'use-predefined-ranges',
  })
  public usePredefinedRanges = false;

  /**
   * Renders chips with custom ranges based on the elements of the array.
   */
  @property({ type: Array })
  public customRanges: CustomDateRange[] = [];

  /** The resource strings of the date range area component. */
  @property({ attribute: false })
  public resourceStrings: IgcDateRangePickerResourceStrings =
    IgcDateRangePickerResourceStringsEN;

  private _predefinedRanges: CustomDateRange[] = [
    {
      label: this.resourceStrings.last7Days,
      dateRange: {
        start: CalendarDay.today.add('day', -7).native,
        end: CalendarDay.today.native,
      },
    },
    {
      label: this.resourceStrings.currentMonth,
      dateRange: {
        start: CalendarDay.today.set({ date: 1 }).native,
        end: CalendarDay.today.set({ date: 1 }).add('month', 1).add('day', -1)
          .native,
      },
    },
    {
      label: this.resourceStrings.last30Days,
      dateRange: {
        start: CalendarDay.today.add('day', -29).native,
        end: CalendarDay.today.native,
      },
    },
    {
      label: this.resourceStrings.yearToDate,
      dateRange: {
        start: CalendarDay.today.set({
          year: CalendarDay.today.year,
          month: 0,
          date: 1,
        }).native,
        end: CalendarDay.today.native,
      },
    },
  ];

  private get _allRanges(): CustomDateRange[] {
    return this.usePredefinedRanges
      ? [...this._predefinedRanges, ...this.customRanges]
      : [...this.customRanges];
  }

  private _handleRangeSelect(range: CustomDateRange) {
    this.dispatchEvent(
      new CustomEvent('rangeSelect', { detail: range.dateRange })
    );
  }

  protected override render() {
    return html`
      <div
        class="ranges"
        style="display: flex; flex-direction: row; gap: 5px; margin-top: 20px;"
      >
        ${this._allRanges.map(
          (range) => html`
            <igc-chip @click=${() => this._handleRangeSelect(range)}>
              ${range.label}
            </igc-chip>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-predefined-ranges-area': IgcPredefinedRangesAreaComponent;
  }
}
