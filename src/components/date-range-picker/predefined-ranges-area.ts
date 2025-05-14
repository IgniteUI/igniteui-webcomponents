import { LitElement, html } from 'lit-element';
import { property } from 'lit/decorators.js';
import { CalendarDay } from '../calendar/model.js';
import IgcChipComponent from '../chip/chip.js';
import { registerComponent } from '../common/definitions/register.js';
import { IgcDateRangePickerResourceStringsEN } from '../common/i18n/date-range-picker.resources.js';
import type { CustomDateRange } from './date-range-picker.js';
import { styles } from './predefined-ranges.area.css.js';

export default class IgcPredefinedRangesAreaComponent extends LitElement {
  public static readonly tagName = 'igc-predefined-ranges-area';
  public static override styles = [styles];

  private _predefinedRanges: CustomDateRange[] = [
    {
      label: IgcDateRangePickerResourceStringsEN.last7Days,
      dateRange: {
        start: CalendarDay.today.add('day', -7).native,
        end: CalendarDay.today.native,
      },
    },
    {
      label: IgcDateRangePickerResourceStringsEN.currentMonth,
      dateRange: {
        start: CalendarDay.today.set({ date: 1 }).native,
        end: CalendarDay.today.set({ date: 1 }).add('month', 1).add('day', -1)
          .native,
      },
    },
    {
      label: IgcDateRangePickerResourceStringsEN.last30Days,
      dateRange: {
        start: CalendarDay.today.add('day', -29).native,
        end: CalendarDay.today.native,
      },
    },
    {
      label: IgcDateRangePickerResourceStringsEN.yearToDate,
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

  private get _allRanges(): CustomDateRange[] {
    return this.usePredefinedRanges
      ? [...this._predefinedRanges, ...this.customRanges]
      : [...this.customRanges];
  }

  private handleRangeSelect(range: CustomDateRange) {
    const event = new CustomEvent('range-select', { detail: range });
    this.dispatchEvent(event);
  }

  protected override render() {
    return html`
      <div class="ranges">
        ${this._allRanges.map(
          (range) => html`
            <igc-chip @click=${() => this.handleRangeSelect(range)}>
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
