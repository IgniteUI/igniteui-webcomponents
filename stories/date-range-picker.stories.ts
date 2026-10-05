import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  type CustomDateRange,
  type DateRangeValue,
  DateRangeType,
  IgcButtonComponent,
  IgcDateRangePickerComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  addDays,
  addWorkingDays,
  dateArg,
  daysBetween,
  daysOf,
  formatDate,
  isWeekend,
  nextWeekday,
  today,
} from './story-dates.js';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  scrollingPanel,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcDateRangePickerComponent,
  IgcIconComponent,
  IgcInputComponent
);

// region default
const metadata: Meta<IgcDateRangePickerComponent> = {
  title: 'DateRangePicker',
  component: 'igc-date-range-picker',
  parameters: {
    docs: {
      description: {
        component:
          'The Date Range Picker includes a text input and a calendar pop-up, allowing users to easily select start and end dates.',
      },
    },
    actions: {
      handles: [
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
        'igcChange',
        'igcInput',
      ],
    },
  },
  argTypes: {
    value: {
      type: { name: 'other', value: 'DateRangeValue' },
      description: 'The value of the picker',
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the calendar.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    useTwoInputs: {
      type: 'boolean',
      description:
        'Use two inputs to display the date range values. Makes the input editable in dropdown mode.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    usePredefinedRanges: {
      type: 'boolean',
      description:
        'Whether the control will show chips with predefined ranges.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelStart: {
      type: 'string',
      description: 'The label of the start input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    labelEnd: {
      type: 'string',
      description: 'The label of the end input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control (single input).',
      control: 'text',
    },
    placeholderStart: {
      type: 'string',
      description: 'The placeholder text of the start input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    placeholderEnd: {
      type: 'string',
      description: 'The placeholder text of the end input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    mode: {
      type: { name: 'enum', value: ['dropdown', 'dialog'] },
      description:
        'Determines whether the calendar is opened in a dropdown or a modal dialog.',
      options: ['dropdown', 'dialog'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'dropdown' } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    nonEditable: {
      type: 'boolean',
      description: 'Whether to allow typing in the input.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      type: 'string',
      description: 'The label of the picker.',
      control: 'text',
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
    },
    displayFormat: {
      type: 'string',
      description:
        'Format to display the value in when not editing.\nDefaults to the locale format if not set.',
      control: 'text',
    },
    inputFormat: {
      type: 'string',
      description:
        'The date format to apply on the input.\nDefaults to the current locale Intl.DateTimeFormat',
      control: 'text',
    },
    locale: {
      type: 'string',
      description:
        "The locale used to format the display value and to resolve the\ncomponent's resource strings. Falls back to the global locale when not set.",
      control: 'text',
    },
    min: {
      type: 'date',
      description: 'The minimum value required for the picker to remain valid.',
      control: 'date',
    },
    max: {
      type: 'date',
      description: 'The maximum value required for the picker to remain valid.',
      control: 'date',
    },
    activeDate: {
      type: 'date',
      description:
        'Gets/Sets the date which is shown in the calendar picker and is highlighted.\nBy default it is the current date.',
      control: 'date',
    },
    headerOrientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'The orientation of the calendar header.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    orientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description:
        "The orientation of the multiple months displayed in the calendar's days view.",
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    hideHeader: {
      type: 'boolean',
      description: 'Determines whether the calendar hides its header.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideOutsideDays: {
      type: 'boolean',
      description:
        'Controls the visibility of the dates that do not belong to the current month.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Whether to show the number of the week in the calendar.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    weekStart: {
      type: {
        name: 'enum',
        value: [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ],
      },
      description: 'Sets the start day of the week for the calendar.',
      options: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ],
      control: { type: 'select' },
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Keeps the dropdown of the component open after the user selects an item.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Keeps the dropdown of the component open when the user clicks outside of\nit.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'Sets the behavior of the component when the parent container scrolls.\n\nIf the value is `hide`, the component hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the component stays visible and anchored.\n\nIf the value is `close`, the component closes on each scroll.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
  },
  args: {
    visibleMonths: 2,
    useTwoInputs: false,
    usePredefinedRanges: false,
    labelStart: '',
    labelEnd: '',
    placeholderStart: '',
    placeholderEnd: '',
    required: false,
    disabled: false,
    invalid: false,
    mode: 'dropdown',
    readOnly: false,
    nonEditable: false,
    outlined: false,
    prompt: '_',
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    hideHeader: false,
    hideOutsideDays: false,
    showWeekNumbers: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
    scrollStrategy: 'hide',
  },
};

export default metadata;

interface IgcDateRangePickerArgs {
  /** The value of the picker */
  value: DateRangeValue;
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
  /** Use two inputs to display the date range values. Makes the input editable in dropdown mode. */
  useTwoInputs: boolean;
  /** Whether the control will show chips with predefined ranges. */
  usePredefinedRanges: boolean;
  /** The label of the start input. */
  labelStart: string;
  /** The label of the end input. */
  labelEnd: string;
  /** The placeholder text of the control (single input). */
  placeholder: string;
  /** The placeholder text of the start input. */
  placeholderStart: string;
  /** The placeholder text of the end input. */
  placeholderEnd: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Determines whether the calendar is opened in a dropdown or a modal dialog. */
  mode: 'dropdown' | 'dialog';
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Whether to allow typing in the input. */
  nonEditable: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The label of the picker. */
  label: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   */
  displayFormat: string;
  /**
   * The date format to apply on the input.
   * Defaults to the current locale Intl.DateTimeFormat
   */
  inputFormat: string;
  /**
   * The locale used to format the display value and to resolve the
   * component's resource strings. Falls back to the global locale when not set.
   */
  locale: string;
  /** The minimum value required for the picker to remain valid. */
  min: Date;
  /** The maximum value required for the picker to remain valid. */
  max: Date;
  /**
   * Gets/Sets the date which is shown in the calendar picker and is highlighted.
   * By default it is the current date.
   */
  activeDate: Date;
  /** The orientation of the calendar header. */
  headerOrientation: 'horizontal' | 'vertical';
  /** The orientation of the multiple months displayed in the calendar's days view. */
  orientation: 'horizontal' | 'vertical';
  /** Determines whether the calendar hides its header. */
  hideHeader: boolean;
  /** Controls the visibility of the dates that do not belong to the current month. */
  hideOutsideDays: boolean;
  /** Whether to show the number of the week in the calendar. */
  showWeekNumbers: boolean;
  /** Sets the start day of the week for the calendar. */
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  /** Keeps the dropdown of the component open after the user selects an item. */
  keepOpenOnSelect: boolean;
  /**
   * Keeps the dropdown of the component open when the user clicks outside of
   * it.
   */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
  /**
   * Sets the behavior of the component when the parent container scrolls.
   *
   * If the value is `hide`, the component hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the component stays visible and anchored.
   *
   * If the value is `close`, the component closes on each scroll.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
}
type Story = StoryObj<IgcDateRangePickerArgs>;

// endregion

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const styles = html`
  ${storyStyles}
  <style>
    .drp-layout {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .drp-panel {
      display: grid;
      gap: 0.75rem;
      align-content: start;
      width: min(100%, 22rem);
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .drp-panel :is(h3, p, ul, dl) {
      margin: 0;
    }

    .drp-panel h3 {
      font-size: 1.125rem;
    }

    .drp-lines {
      display: grid;
      gap: 0.25rem;
      padding: 0;
      list-style: none;
    }

    .drp-lines li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .drp-lines .drp-total {
      padding-block-start: 0.5rem;
      border-block-start: 1px solid var(--ig-gray-300);
      font-weight: 600;
    }

    .drp-facts {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .drp-facts dt {
      color: var(--ig-gray-700);
      font-size: 0.875rem;
    }

    .drp-facts dd {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .drp-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  </style>
`;

registerMaterialIcons('flight-takeoff', 'flight-land', 'arrow-forward');

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The dates of a hotel stay. By default the picker shows the range in one read-only input, and the user selects the first and the last day in a calendar with two months. `use-two-inputs` shows a start input and an end input, and the user can type the dates in the `dropdown` mode. `label` names the single input, and `label-start` and `label-end` name the two inputs. `use-predefined-ranges` adds chips for usual periods. `visibleMonths` is 1 or 2. Use the controls panel to change the mode, the formats, the calendar and the validation. `hideHeader` and `headerOrientation` apply only in the `dialog` mode. The story binds the date properties with the `guard` directive, so a change of another control keeps the range that the user selected.',
      },
    },
  },
  args: {
    label: 'Stay',
    labelStart: 'Check-in',
    labelEnd: 'Check-out',
  },
  render: (args) => html`
    <igc-date-range-picker
      label=${ifDefined(args.label)}
      label-start=${args.labelStart}
      label-end=${args.labelEnd}
      name=${ifDefined(args.name)}
      placeholder=${ifDefined(args.placeholder)}
      placeholder-start=${args.placeholderStart}
      placeholder-end=${args.placeholderEnd}
      mode=${args.mode}
      prompt=${args.prompt}
      display-format=${ifDefined(args.displayFormat)}
      input-format=${ifDefined(args.inputFormat)}
      week-start=${ifDefined(args.weekStart)}
      visible-months=${args.visibleMonths}
      header-orientation=${args.headerOrientation}
      orientation=${args.orientation}
      .locale=${args.locale}
      .scrollStrategy=${args.scrollStrategy}
      .min=${dateArg(args.min)}
      .max=${dateArg(args.max)}
      .activeDate=${dateArg(args.activeDate, today)}
      ?use-two-inputs=${args.useTwoInputs}
      ?use-predefined-ranges=${args.usePredefinedRanges}
      ?open=${args.open}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      ?readonly=${args.readOnly}
      ?non-editable=${args.nonEditable}
      ?outlined=${args.outlined}
      ?hide-header=${args.hideHeader}
      ?hide-outside-days=${args.hideOutsideDays}
      ?show-week-numbers=${args.showWeekNumbers}
      ?keep-open-on-select=${args.keepOpenOnSelect}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
    >
      <span slot="helper-text">Check-in is from 15:00.</span>
    </igc-date-range-picker>
  `,
};

export const Flights: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A flight search. `use-two-inputs` shows the departure date and the return date in two inputs, and the user can type each date. `label-start` and `label-end` name the inputs. The `prefix-start` and `prefix-end` slots show a take-off icon and a landing icon, and the `separator` slot replaces the default "to" text with an arrow. `min` is today, and `max` is the last day of the schedule, 330 days from today. `specialDates` marks the days with low fares, from Tuesday to Thursday. The special state is only visual, so the descriptor has a `label`, and the accessible name of each such date ends with "Low fare". The `igcChange` handler gets the fare of each flight and the number of nights.',
      },
    },
  },
  render: () => {
    const lastFlight = addDays(today, 330);
    const isLowFare = (date: Date) => [2, 3, 4].includes(date.getDay());
    const lowFareDays = daysOf(today, lastFlight).filter(isLowFare);
    const fare = (date: Date) => (isLowFare(date) ? 119 : 189);
    const departure = nextWeekday(addDays(today, 14), 2);

    let trip: DateRangeValue | null = {
      start: departure,
      end: addDays(departure, 7),
    };

    const summary = renderInto(() => {
      const { start, end } = trip ?? {};

      return html`
        <h3>Your trip</h3>
        ${
          start && end
            ? html`
                <p>
                  ${daysBetween(start, end)} nights, from ${formatDate(start)}
                  to ${formatDate(end)}.
                </p>
                <ul class="drp-lines">
                  <li>
                    <span>
                      Outbound${isLowFare(start) ? ' (low fare)' : ''}
                    </span>
                    <span>${usd.format(fare(start))}</span>
                  </li>
                  <li>
                    <span>Return${isLowFare(end) ? ' (low fare)' : ''}</span>
                    <span>${usd.format(fare(end))}</span>
                  </li>
                  <li class="drp-total">
                    <span>Total for 1 adult</span>
                    <span>${usd.format(fare(start) + fare(end))}</span>
                  </li>
                </ul>
              `
            : html`
                <p class="muted">
                  Choose the departure date and the return date.
                </p>
              `
        }
      `;
    });

    const change = ({ detail }: CustomEvent<DateRangeValue | null>) => {
      trip = detail;
      summary.update();
    };

    return html`
      ${styles}
      <div class="drp-layout">
        <igc-date-range-picker
          use-two-inputs
          label-start="Depart"
          label-end="Return"
          .value=${trip}
          .min=${today}
          .max=${lastFlight}
          .specialDates=${[
            {
              type: DateRangeType.Specific,
              dateRange: lowFareDays,
              label: 'Low fare',
            },
          ]}
          @igcChange=${change}
        >
          <igc-icon slot="prefix-start" name="flight-takeoff"></igc-icon>
          <igc-icon slot="prefix-end" name="flight-land"></igc-icon>
          <igc-icon slot="separator" name="arrow-forward"></igc-icon>
          <span slot="helper-text">
            Fares are lowest from Tuesday to Thursday.
          </span>
          <span slot="range-underflow">The flight cannot be in the past.</span>
          <span slot="range-overflow">
            The schedule ends on ${formatDate(lastFlight)}.
          </span>
        </igc-date-range-picker>
        <section
          class="drp-panel"
          aria-label="Trip summary"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

/** A made-up number of orders for a day, the same on each render. */
function ordersOn(date: Date): number {
  const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  const weekend = isWeekend(date) ? 0.6 : 1;
  return Math.round((40 + ((seed * 2_654_435_761) % 97) / 3) * weekend);
}

export const SalesReport: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The period of a sales report. In the single input mode the input is read-only, and the user selects the period in the calendar or with a chip. `use-predefined-ranges` adds the chips "Last 7 days", "Current month", "Last 30 days" and "Year to date". `customRanges` adds two more chips, "This quarter" and "Previous quarter". A chip sets the range and emits `igcChange` at once. The handler sums made-up orders for the days of the period. The "Current month" chip ends on the last day of the month, so the handler counts the orders only up to today.',
      },
    },
  },
  render: () => {
    const quarter = Math.floor(today.getMonth() / 3) * 3;
    const customRanges: CustomDateRange[] = [
      {
        label: 'This quarter',
        dateRange: {
          start: new Date(today.getFullYear(), quarter, 1),
          end: today,
        },
      },
      {
        label: 'Previous quarter',
        dateRange: {
          start: new Date(today.getFullYear(), quarter - 3, 1),
          end: new Date(today.getFullYear(), quarter, 0),
        },
      },
    ];

    let period: DateRangeValue | null = {
      start: addDays(today, -6),
      end: today,
    };

    const summary = renderInto(() => {
      const { start, end } = period ?? {};
      // There is no data after today, for example for the rest of the month.
      const last = end && end > today ? today : end;
      const days = start && last && start <= last ? daysOf(start, last) : [];
      const orders = days.reduce((sum, date) => sum + ordersOn(date), 0);
      const revenue = orders * 64;
      const medium: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

      return html`
        <h3>Sales</h3>
        <p class="muted">
          ${
            start && end
              ? `${formatDate(start, medium)} to ${formatDate(end, medium)}. ${days.length} ${days.length === 1 ? 'day' : 'days'} of data${last === end ? '' : ', up to today'}.`
              : 'Choose a period.'
          }
        </p>
        <dl class="drp-facts">
          <div>
            <dt>Orders</dt>
            <dd>${orders.toLocaleString('en-US')}</dd>
          </div>
          <div>
            <dt>Revenue</dt>
            <dd>${usd.format(revenue)}</dd>
          </div>
          <div>
            <dt>Per day</dt>
            <dd>${days.length ? usd.format(revenue / days.length) : '-'}</dd>
          </div>
        </dl>
      `;
    });

    const change = ({ detail }: CustomEvent<DateRangeValue | null>) => {
      period = detail;
      summary.update();
    };

    return html`
      ${styles}
      <div class="drp-layout">
        <igc-date-range-picker
          style="width: min(100%, 20rem)"
          label="Report period"
          use-predefined-ranges
          .customRanges=${customRanges}
          .value=${period}
          @igcChange=${change}
        >
          <span slot="helper-text">
            Use a chip, or select the first and the last day.
          </span>
        </igc-date-range-picker>
        <section
          class="drp-panel"
          aria-label="Sales in the period"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

export const CarRental: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A car rental on a phone. `mode="dialog"` opens the calendar in a modal dialog, which suits a narrow screen. In this mode the inputs are read-only, and a click on an input opens the dialog. The footer of the dialog has a Cancel button and a Done button. The picker emits `igcChange` only on Done, and Cancel restores the range from before the dialog opened. The header of the calendar shows only in the dialog mode, and the `title` slot replaces "Select dates". `visible-months="1"` shows one month, which fits a narrow dialog. The `igcChange` handler counts the rental days, and from 7 days the weekly rate applies.',
      },
    },
  },
  render: () => {
    const dailyRate = 59;
    const weeklyRate = 45;
    const pickUp = addDays(today, 3);

    let rental: DateRangeValue | null = {
      start: pickUp,
      end: addDays(pickUp, 4),
    };

    const summary = renderInto(() => {
      const { start, end } = rental ?? {};
      const days = start && end ? Math.max(daysBetween(start, end), 1) : 0;
      const rate = days >= 7 ? weeklyRate : dailyRate;

      return html`
        <h3>Compact car</h3>
        ${
          days
            ? html`
                <ul class="drp-lines">
                  <li>
                    <span>${days} days at ${usd.format(rate)}</span>
                    <span>${usd.format(days * rate)}</span>
                  </li>
                  <li class="drp-total">
                    <span>Total</span>
                    <span>${usd.format(days * rate)}</span>
                  </li>
                </ul>
                <p class="muted">
                  ${
                    days >= 7
                      ? 'The weekly rate applies.'
                      : `Rent for ${7 - days} more days to get the weekly rate of ${usd.format(weeklyRate)} a day.`
                  }
                </p>
              `
            : html`<p class="muted">Choose the rental period.</p>`
        }
      `;
    });

    const change = ({ detail }: CustomEvent<DateRangeValue | null>) => {
      rental = detail;
      summary.update();
    };

    return html`
      ${styles}
      <div class="drp-layout">
        <igc-date-range-picker
          mode="dialog"
          use-two-inputs
          visible-months="1"
          label-start="Pick-up"
          label-end="Return"
          .value=${rental}
          .min=${today}
          @igcChange=${change}
        >
          <span slot="title">Rental period</span>
        </igc-date-range-picker>
        <section
          class="drp-panel"
          aria-label="Rental price"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The booking of a meeting hall. The event dates are `required`, from tomorrow to 6 months from today. `disabledDates` disables the days when the hall is booked. The calendar lets the user select a range across a booked day, but the range must not include one, so the picker then shows the `bad-input` slot. `defaultValue` is the range that Reset restores, and the picker shows it until the user changes the range. In HTML, the `value` attribute sets the default value: a JSON object with ISO dates, for example `{"start": "2026-11-02", "end": "2026-11-03"}`. The form data has two entries for the range, `dates-start` and `dates-end`, as ISO strings in UTC. Submit shows the form data.',
      },
    },
  },
  render: () => {
    const first = addDays(today, 1);
    const last = addDays(today, 182);
    const booked = [
      addWorkingDays(today, 5),
      addWorkingDays(today, 6),
      addWorkingDays(today, 12),
    ];
    const start = addWorkingDays(today, 8);

    return html`
      ${styles}
      <form
        class="drp-panel"
        style="width: min(100%, 36rem)"
        @submit=${formSubmitHandler}
      >
        <h3>Book the meeting hall</h3>
        <igc-input name="event" label="Event name" required>
          <span slot="value-missing">Enter the name of the event.</span>
        </igc-input>
        <igc-date-range-picker
          name="dates"
          use-two-inputs
          required
          label-start="First day"
          label-end="Last day"
          .defaultValue=${{ start, end: addDays(start, 1) }}
          .min=${first}
          .max=${last}
          .disabledDates=${[
            {
              type: DateRangeType.Specific,
              dateRange: booked,
              label: 'Booked',
            },
          ]}
        >
          <span slot="helper-text">
            The hall is booked on
            ${booked.map((date) => formatDate(date)).join(', ')}.
          </span>
          <span slot="value-missing">Choose the first and the last day.</span>
          <span slot="bad-input">The hall is booked on one of these days.</span>
          <span slot="range-underflow"
            >The first day is tomorrow or later.</span
          >
          <span slot="range-overflow">
            You can book up to ${formatDate(last)}.
          </span>
        </igc-date-range-picker>
        <igc-input
          name="guests"
          type="number"
          label="Guests"
          min="1"
          max="120"
          value="40"
        >
          <span slot="helper-text">The hall has seats for 120 people.</span>
          <span slot="range-overflow">The hall has seats for 120 people.</span>
        </igc-input>
        <div class="drp-row">
          <igc-button type="submit">Book the hall</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
      </form>
    `;
  },
};

export const InScrollingPanel: Story = {
  args: {
    label: 'Stay period',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A date range picker opens its calendar inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the calendar when the panel scrolls. If the value is `hide`, the calendar hides while the input is out of view. `hide` is the default value. If the value is `scroll`, the calendar follows the input. If the value is `close`, the calendar closes. In the `dialog` mode the calendar opens in a modal dialog and not in a popover. The picker then ignores this property. Change the `mode` control to see this behavior.',
      },
    },
  },
  render: ({ label, mode, useTwoInputs, scrollStrategy }) =>
    scrollingPanel(
      'Booking details',
      'calendar',
      'Rates are calculated per night for the selected period.',
      html`
        <igc-date-range-picker
          .label=${label}
          .mode=${mode}
          .useTwoInputs=${useTwoInputs}
          .scrollStrategy=${scrollStrategy}
        ></igc-date-range-picker>
      `
    ),
};
