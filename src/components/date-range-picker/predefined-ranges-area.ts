import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { CalendarDay } from '../calendar/model.js';
import IgcChipComponent from '../chip/chip.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  type IgcDateRangePickerResourceStrings,
  IgcDateRangePickerResourceStringsEN,
} from '../common/i18n/date-range-picker.resources.js';
import type { CustomDateRange, DateRangeValue } from './date-range-picker.js';
import { styles } from './predefined-ranges-area.base.css.js';
import { all } from './themes/ranges-themes.js';
import { styles as shared } from './themes/shared/predefined-ranges-area.common.css.js';

/* blazorSuppress */
/**
 * The predefined ranges area component is used within the `igc-date-range picker` element and it
 * displays a set of chips with predefined date ranges. The component allows users to quickly select
 * a predefined date range value. Users can also provide custom ranges to be displayed as chips.
 *
 * @element igc-predefined-ranges-area
 */
export default class IgcPredefinedRangesAreaComponent extends LitElement {
  public static readonly tagName = 'igc-predefined-ranges-area';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcPredefinedRangesAreaComponent, IgcChipComponent);
  }

  @state()
  private _predefinedRanges: CustomDateRange[] = [];

  /**
   * Whether the control will show chips with predefined ranges.
   * @attr use-predefined-ranges
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'use-predefined-ranges',
  })
  public usePredefinedRanges = false;

  /**
   * Renders chips with custom ranges based on the elements of the array.
   */
  @property({ attribute: false })
  public customRanges: CustomDateRange[] = [];

  /** The resource strings of the date range area component. */
  @property({ attribute: false })
  public resourceStrings: IgcDateRangePickerResourceStrings =
    IgcDateRangePickerResourceStringsEN;

  constructor() {
    super();
    addThemingController(this, all);
  }

  @watch('resourceStrings')
  protected _updatePredefinedRanges(): void {
    this._predefinedRanges = getPredefinedRanges(this.resourceStrings);
  }

  private _handleRangeSelect(range: DateRangeValue): void {
    this.dispatchEvent(new CustomEvent('igcRangeSelect', { detail: range }));
  }

  protected *_renderDateRanges() {
    const ranges = this.usePredefinedRanges
      ? [...this._predefinedRanges, ...this.customRanges]
      : this.customRanges;

    for (const { label, dateRange } of ranges) {
      yield html`
        <igc-chip @click=${() => this._handleRangeSelect(dateRange)}>
          ${label}
        </igc-chip>
      `;
    }
  }

  protected override render() {
    return html`<div part="ranges">${this._renderDateRanges()}</div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-predefined-ranges-area': IgcPredefinedRangesAreaComponent;
  }
}

type PredefinedRangeKey =
  | 'last7Days'
  | 'currentMonth'
  | 'last30Days'
  | 'yearToDate';

function getPredefinedRanges(
  resourceStrings: IgcDateRangePickerResourceStrings
): CustomDateRange[] {
  const today = CalendarDay.today;

  const ranges: {
    key: PredefinedRangeKey;
    getDateRange: () => { start: Date; end: Date };
  }[] = [
    {
      key: 'last7Days',
      getDateRange: () => ({
        start: today.add('day', -7).native,
        end: today.native,
      }),
    },
    {
      key: 'currentMonth',
      getDateRange: () => ({
        start: today.set({ date: 1 }).native,
        end: today.set({ date: 1 }).add('month', 1).add('day', -1).native,
      }),
    },
    {
      key: 'last30Days',
      getDateRange: () => ({
        start: today.add('day', -29).native,
        end: today.native,
      }),
    },
    {
      key: 'yearToDate',
      getDateRange: () => ({
        start: today.set({ year: today.year, month: 0, date: 1 }).native,
        end: today.native,
      }),
    },
  ];

  return ranges.map((range) => ({
    label:
      resourceStrings[range.key] ||
      IgcDateRangePickerResourceStringsEN[range.key],
    dateRange: range.getDateRange(),
  }));
}
