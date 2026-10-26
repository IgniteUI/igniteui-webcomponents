import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { all } from '#themes/date-range-picker/themes/ranges-themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcChipComponent from '../chip/chip.js';
import type { CustomDateRange, DateRangeValue } from './date-range-picker.js';
import {
  type DateRangePickerResourceStringsType,
  dateRangeI18nConfig,
} from './i18n.js';
import { styles } from './predefined-ranges-area.base.css.js';
import { styles as shared } from './themes/shared/predefined-ranges-area.common.css.js';

type PredefinedRange = {
  label: string;
  getDateRange: (today: CalendarDay) => DateRangeValue;
};

/* blazorSuppress */
/**
 * The predefined ranges area component is used within the date range picker and it
 * displays a set of chips with predefined date ranges. The component allows users to quickly select
 * a predefined date range value. Users can also provide custom ranges to be displayed as chips.
 *
 * @element igc-predefined-ranges-area
 */
export default class IgcPredefinedRangesAreaComponent extends I18nMixin(
  LitElement,
  dateRangeI18nConfig
) {
  public static readonly tagName = 'igc-predefined-ranges-area';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcPredefinedRangesAreaComponent, IgcChipComponent);
  }

  @state()
  private _predefinedRanges: PredefinedRange[] = [];

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

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('resourceStrings')) {
      this._predefinedRanges = PREDEFINED_RANGES.map(
        ({ resourceKey, getDateRange }) => ({
          label: this.resourceStrings[resourceKey]!,
          getDateRange,
        })
      );
    }
  }

  private _handleRangeSelect(range: DateRangeValue): void {
    this.dispatchEvent(new CustomEvent('igcRangeSelect', { detail: range }));
  }

  private _renderChip(label: string, getRange: () => DateRangeValue) {
    return html`
      <igc-chip @click=${() => this._handleRangeSelect(getRange())}>
        ${label}
      </igc-chip>
    `;
  }

  protected *_renderDateRanges() {
    if (this.usePredefinedRanges) {
      for (const { label, getDateRange } of this._predefinedRanges) {
        // The click reads today, so that a click after midnight selects the current dates.
        yield this._renderChip(label, () => getDateRange(CalendarDay.today));
      }
    }

    for (const { label, dateRange } of this.customRanges) {
      yield this._renderChip(label, () => dateRange);
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

const PREDEFINED_RANGES: {
  resourceKey: keyof DateRangePickerResourceStringsType;
  getDateRange: PredefinedRange['getDateRange'];
}[] = [
  {
    resourceKey: 'date_range_picker_last7Days',
    getDateRange: (today) => ({
      start: today.add('day', -6).native,
      end: today.native,
    }),
  },
  {
    resourceKey: 'date_range_picker_currentMonth',
    getDateRange: (today) => ({
      start: today.set({ date: 1 }).native,
      end: today.set({ date: 1 }).add('month', 1).add('day', -1).native,
    }),
  },
  {
    resourceKey: 'date_range_picker_last30Days',
    getDateRange: (today) => ({
      start: today.add('day', -29).native,
      end: today.native,
    }),
  },
  {
    resourceKey: 'date_range_picker_yearToDate',
    getDateRange: (today) => ({
      start: today.set({ month: 0, date: 1 }).native,
      end: today.native,
    }),
  },
];
