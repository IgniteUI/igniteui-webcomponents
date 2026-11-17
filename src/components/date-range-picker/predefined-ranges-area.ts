import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { CalendarDay } from '#internals/date/model.js';
import { registerComponent } from '#internals/definitions/register.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { bindIf } from '#internals/utils/lit.js';
import { all } from '#themes/date-range-picker/themes/ranges-themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { getWeekDayNumber, weekStartOf } from '../calendar/helpers.js';
import type { DateRangeDescriptor, WeekDays } from '../calendar/types.js';
import IgcChipComponent from '../chip/chip.js';
import type {
  CustomDateRange,
  DateRangeValue,
  PredefinedRangeKey,
} from './date-range-picker.js';
import { dateRangeI18nConfig } from './i18n.js';
import { styles } from './predefined-ranges-area.base.css.js';
import { styles as shared } from './themes/shared/predefined-ranges-area.common.css.js';
import { rangeAvoids } from './validators.js';

type PredefinedRange = {
  key: string;
  label: string;
  getDateRange: (today: CalendarDay) => DateRangeValue;
};

/** A range chip: its key, its label, and its range at the time of the call. */
export type RangeChip = {
  key: string;
  label: string;
  getRange: () => DateRangeValue;
};

/** The settings that decide the chips. The area and the picker both have them. */
type RangeSource = {
  usePredefinedRanges: boolean;
  predefinedRanges: PredefinedRangeKey[];
  customRanges: CustomDateRange[];
  resourceStrings: Partial<
    Record<`date_range_picker_${PredefinedRangeKey}`, string>
  >;
  weekStart: WeekDays;
};

/** The internal `igcRangeSelect` event of the area. `detail` is the range, `key` names the chip. */
export type RangeSelectEvent = CustomEvent<DateRangeValue> & {
  readonly key: string;
};

/* blazorSuppress */
/**
 * The predefined ranges area component is used within the date range picker and it
 * displays a set of chips with predefined date ranges. The component allows users to quickly select
 * a predefined date range value. Users can also provide custom ranges to be displayed as chips.
 *
 * @element igc-predefined-ranges-area
 *
 * @fires {CustomEvent} igcRangeSelect - Emitted when the user selects a chip. The detail is the range of the chip.
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

  private get _predefinedRanges(): PredefinedRange[] {
    return getPredefinedRanges(this, this.predefinedRanges);
  }

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

  /** The built-in ranges that show, in this order. */
  @property({ attribute: false })
  public predefinedRanges: PredefinedRangeKey[] = [
    'last7Days',
    'currentMonth',
    'last30Days',
    'yearToDate',
  ];

  /** The first day of the week of the `lastWeek` range. */
  @property({ attribute: false })
  public weekStart: WeekDays = 'sunday';

  /** The key of the chip that shows as selected. */
  @property({ attribute: false })
  public selectedRange: string | null = null;

  /** The bounds and the disabled dates of the picker. A chip whose range includes one is disabled. */
  @property({ attribute: false })
  public dateConstraints: DateRangeDescriptor[] = [];

  /** Whether all the chips are disabled, as in a read-only or disabled picker. */
  @property({ type: Boolean, attribute: false })
  public disabled = false;

  constructor() {
    super();
    addThemingController(this, all);
  }

  /** A selectable chip toggles itself on a click. `selectedRange` owns the selection, so take the toggle back. */
  private _handleChipSelect(event: CustomEvent<boolean>): void {
    event.stopPropagation();
    (event.target as IgcChipComponent).selected = !event.detail;
  }

  private _handleRangeSelect(range: DateRangeValue, key: string): void {
    const event = new CustomEvent('igcRangeSelect', { detail: range });
    this.dispatchEvent(Object.assign(event, { key }));
  }

  protected _renderChip({ key, label, getRange }: RangeChip) {
    const disabled =
      this.disabled ||
      (!isEmpty(this.dateConstraints) &&
        !rangeAvoids(getRange(), this.dateConstraints));

    // A click outside the button of a disabled chip still reaches the host.
    return html`
      <igc-chip
        selectable
        ?disabled=${disabled}
        .selected=${key === this.selectedRange}
        @igcSelect=${this._handleChipSelect}
        @click=${bindIf(!disabled, () => this._handleRangeSelect(getRange(), key))}
      >
        ${label}
      </igc-chip>
    `;
  }

  protected override render() {
    const predefined = this.usePredefinedRanges
      ? this._predefinedRanges.map(fromPredefined)
      : [];
    const chips = [...predefined, ...this.customRanges.map(fromCustom)];

    return html`<div part="ranges">
      ${chips.map((chip) => this._renderChip(chip))}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-predefined-ranges-area': IgcPredefinedRangesAreaComponent;
  }
}

function days(start: CalendarDay, end: CalendarDay): DateRangeValue {
  return { start: start.native, end: end.native };
}

function quarterStart(day: CalendarDay): CalendarDay {
  return day.set({ month: Math.floor(day.month / 3) * 3, date: 1 });
}

/** The range of each built-in key. `weekStart` is a day number, Sunday = 0. */
const PREDEFINED_RANGES: Record<
  PredefinedRangeKey,
  (today: CalendarDay, weekStart: number) => DateRangeValue
> = {
  today: (today) => days(today, today),
  yesterday: (today) => {
    const day = today.add('day', -1);
    return days(day, day);
  },
  last7Days: (today) => days(today.add('day', -6), today),
  last30Days: (today) => days(today.add('day', -29), today),
  lastWeek: (today, weekStart) => {
    const start = weekStartOf(today, weekStart).add('day', -7);
    return days(start, start.add('day', 6));
  },
  currentMonth: (today) => {
    const start = today.set({ date: 1 });
    return days(start, start.add('month', 1).add('day', -1));
  },
  lastMonth: (today) => {
    const end = today.set({ date: 1 }).add('day', -1);
    return days(end.set({ date: 1 }), end);
  },
  currentQuarter: (today) => {
    const start = quarterStart(today);
    return days(start, start.add('quarter', 1).add('day', -1));
  },
  lastQuarter: (today) => {
    const end = quarterStart(today).add('day', -1);
    return days(quarterStart(end), end);
  },
  quarterToDate: (today) => days(quarterStart(today), today),
  currentYear: (today) =>
    days(today.set({ month: 0, date: 1 }), today.set({ month: 11, date: 31 })),
  lastYear: (today) => {
    const day = today.set({ year: today.year - 1 });
    return days(
      day.set({ month: 0, date: 1 }),
      day.set({ month: 11, date: 31 })
    );
  },
  yearToDate: (today) => days(today.set({ month: 0, date: 1 }), today),
};

/** The built-in ranges of `keys`, in order, without unknown keys and repeats. */
function getPredefinedRanges(
  source: RangeSource,
  keys: Iterable<string>
): PredefinedRange[] {
  const weekStart = getWeekDayNumber(source.weekStart);

  return Array.from(new Set(keys))
    .filter((key): key is PredefinedRangeKey =>
      Object.hasOwn(PREDEFINED_RANGES, key)
    )
    .map((key) => ({
      key,
      label: source.resourceStrings[`date_range_picker_${key}`]!,
      getDateRange: (today) => PREDEFINED_RANGES[key](today, weekStart),
    }));
}

/** A built-in range reads today on each call, so it follows the day on a page open past midnight. */
function fromPredefined({
  key,
  label,
  getDateRange,
}: PredefinedRange): RangeChip {
  return { key, label, getRange: () => getDateRange(CalendarDay.today) };
}

function fromCustom(range: CustomDateRange): RangeChip {
  const { label } = range;

  return {
    // `??`, not a default value, so a `null` key from JSON also falls back to the label.
    key: range.key ?? label,
    label,
    getRange: () =>
      range.getDateRange?.() ?? range.dateRange ?? { start: null, end: null },
  };
}

/**
 * The range of `key`, also of a built-in range that does not show. A built-in
 * range wins over a custom range with its key only while it shows.
 */
export function findRangeChip(
  source: RangeSource,
  key: string
): RangeChip | undefined {
  const [predefined] = getPredefinedRanges(source, [key]);
  const builtIn = predefined && fromPredefined(predefined);
  const range = source.customRanges.find(
    (range) => (range.key ?? range.label) === key
  );
  const custom = range && fromCustom(range);
  const shows =
    source.usePredefinedRanges &&
    source.predefinedRanges.includes(key as PredefinedRangeKey);

  return shows ? (builtIn ?? custom) : (custom ?? builtIn);
}
