import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addI18nController } from '#internals/i18n/i18n-controller.js';
import { all } from '#themes/date-range-picker/themes/ranges-themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcChipComponent from '../chip/chip.js';
import type { CustomDateRange, DateRangeValue } from './date-range-picker.js';
import {
  dateRangeI18nConfig,
  type DateRangePickerResourceStringsType,
  type DateRangeResourceStrings,
  type IgcDateRangePickerResourceStrings,
} from './i18n.js';
import { styles } from './predefined-ranges-area.base.css.js';
import { styles as shared } from './themes/shared/predefined-ranges-area.common.css.js';

/* blazorSuppress */
/**
 * The predefined ranges area component is used within the date range picker and it
 * displays a set of chips with predefined date ranges. The component allows users to quickly select
 * a predefined date range value. Users can also provide custom ranges to be displayed as chips.
 *
 * @element igc-predefined-ranges-area
 */
export default class IgcPredefinedRangesAreaComponent extends LitElement {
  public static readonly tagName = 'igc-predefined-ranges-area';
  public static override styles = [componentBase, styles, shared];

  private readonly _i18nController =
    addI18nController<DateRangeResourceStrings>(this, dateRangeI18nConfig);

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
  public set resourceStrings(value: DateRangeResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): IgcDateRangePickerResourceStrings &
    DateRangePickerResourceStringsType {
    return this._i18nController.resourceStrings;
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('resourceStrings')) {
      this._predefinedRanges = getPredefinedRanges(this.resourceStrings);
    }
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

function getPredefinedRanges(
  resourceStrings: DateRangePickerResourceStringsType
): CustomDateRange[] {
  const today = CalendarDay.today;

  const ranges: {
    resourceKey: keyof DateRangePickerResourceStringsType;
    getDateRange: () => { start: Date; end: Date };
  }[] = [
    {
      resourceKey: 'date_range_picker_last7Days',
      getDateRange: () => ({
        start: today.add('day', -7).native,
        end: today.native,
      }),
    },
    {
      resourceKey: 'date_range_picker_currentMonth',
      getDateRange: () => ({
        start: today.set({ date: 1 }).native,
        end: today.set({ date: 1 }).add('month', 1).add('day', -1).native,
      }),
    },
    {
      resourceKey: 'date_range_picker_last30Days',
      getDateRange: () => ({
        start: today.add('day', -29).native,
        end: today.native,
      }),
    },
    {
      resourceKey: 'date_range_picker_yearToDate',
      getDateRange: () => ({
        start: today.set({ month: 0, date: 1 }).native,
        end: today.native,
      }),
    },
  ];

  return ranges.map((range) => ({
    label: resourceStrings[range.resourceKey]!,
    dateRange: range.getDateRange(),
  }));
}
