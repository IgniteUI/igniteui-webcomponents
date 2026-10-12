import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { range } from 'lit/directives/range.js';
import { ref } from 'lit/directives/ref.js';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcButtonComponent,
  IgcDatePickerComponent,
  IgcInputComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  addDays,
  addMonths,
  addWorkingDays,
  dateArg,
  daysBetween,
  daysOf,
  formatDate,
  isWeekend,
  longDate,
  nextWeekday,
  today,
} from './story-dates.js';
import {
  disableStoryControls,
  formSubmitHandler,
  scrollingPanel,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcDatePickerComponent,
  IgcInputComponent,
  IgcSelectComponent
);

// region default
const metadata: Meta<IgcDatePickerComponent> = {
  title: 'DatePicker',
  component: 'igc-date-picker',
  parameters: {
    docs: {
      description: {
        component:
          'The date picker is a feature rich component used for entering a date through manual text input or\nchoosing date values from a calendar dialog that pops up.',
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
      type: 'date',
      description:
        'The value of the picker.\n\nOnly ever holds a committed value. While the user is typing in the input, the\nintermediate state stays in the editor and is committed - together with an\n`igcChange` event - when the edit is committed on blur. Use the `igcInput` event\nto observe the value as it is being typed.',
      control: 'date',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
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
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the calendar.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
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
    required: false,
    disabled: false,
    invalid: false,
    mode: 'dropdown',
    readOnly: false,
    nonEditable: false,
    outlined: false,
    prompt: '_',
    visibleMonths: 1,
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

interface IgcDatePickerArgs {
  /**
   * The value of the picker.
   *
   * Only ever holds a committed value. While the user is typing in the input, the
   * intermediate state stays in the editor and is committed - together with an
   * `igcChange` event - when the edit is committed on blur. Use the `igcInput` event
   * to observe the value as it is being typed.
   */
  value: Date;
  /** The placeholder text of the control. */
  placeholder: string;
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
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
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
type Story = StoryObj<IgcDatePickerArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .dp-layout {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .dp-panel {
      display: grid;
      gap: 1rem;
      align-content: start;
      width: min(100%, 22rem);
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dp-panel :is(h3, p) {
      margin: 0;
    }

    .dp-panel h3 {
      font-size: 1.125rem;
    }

    .dp-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The departure date of a trip. The user types the date, or opens the calendar with the calendar icon or with Alt + Arrow Down. Without `inputFormat`, `displayFormat` and `weekStart`, the picker uses the formats and the first day of the week of the locale. Use the controls panel to change the mode, the formats, the calendar and the validation. `min` and `max` disable the dates in the calendar, but the user can still type such a date, and the picker then becomes invalid. `hideHeader` and `headerOrientation` apply only in the `dialog` mode. The story binds the date properties with the `guard` directive, so a change of another control keeps the date that the user selected.',
      },
    },
  },
  args: {
    label: 'Departure date',
  },
  render: (args) => html`
    <igc-date-picker
      style="max-width: 20rem"
      label=${ifDefined(args.label)}
      name=${ifDefined(args.name)}
      placeholder=${ifDefined(args.placeholder)}
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
      .value=${dateArg(args.value)}
      .min=${dateArg(args.min)}
      .max=${dateArg(args.max)}
      .activeDate=${dateArg(args.activeDate, today)}
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
      <span slot="helper-text">We show the fares of this day first.</span>
    </igc-date-picker>
  `,
};

export const Appointment: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The booking of a check-up at a clinic. The clinic takes bookings from the next working day, for 60 days, and it is closed on weekends. `min` and `max` set the booking period. `disabledDates` disables the weekends and, with a `Specific` descriptor, the days when the clinic is closed. `specialDates` marks the Thursdays, when the clinic is open until 20:00. The special state is only visual, so the descriptors have a `label`: the accessible name of a date ends with "Clinic closed" or "Open until 20:00". The user can still type a date that is not available, so the `bad-input`, `range-underflow` and `range-overflow` slots tell what is wrong. The "Next available day" button in the `actions` slot sets `value` and calls `hide()`. A change of `value` from code does not emit `igcChange`, so the button also updates the summary. The times in the select depend on the day.',
      },
    },
  },
  render: () => {
    const earliest = addWorkingDays(today, 1);
    const latest = addDays(today, 60);
    const closed = [addWorkingDays(earliest, 2), addWorkingDays(earliest, 9)];
    const isClosed = (date: Date) =>
      closed.some((day) => daysBetween(day, date) === 0);
    const lateDays = daysOf(earliest, latest).filter(
      (date) => date.getDay() === 4 && !isClosed(date)
    );

    const disabledDates: DateRangeDescriptor[] = [
      { type: DateRangeType.Weekends },
      {
        type: DateRangeType.Specific,
        dateRange: closed,
        label: 'Clinic closed',
      },
    ];
    const specialDates: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Specific,
        dateRange: lateDays,
        label: 'Open until 20:00',
      },
    ];

    let picker: IgcDatePickerComponent | undefined;
    let summary: HTMLElement | undefined;
    let time = '';
    let booked = false;

    const update = () => {
      if (!(picker && summary)) {
        return;
      }

      const date = picker.value;
      const available = date !== null && picker.validity.valid;
      const closes = date?.getDay() === 4 ? 20 : 17;
      const times = Array.from(
        range(8, closes),
        (hour) => `${hour.toString().padStart(2, '0')}:00`
      );

      if (!times.includes(time)) {
        time = '';
      }

      render(
        html`
          <h3>Check-up</h3>
          ${
            available
              ? html`
                  <p>
                    <strong>${formatDate(date, longDate)}</strong>. The clinic
                    is open from 8:00 to ${closes}:00.
                  </p>
                  <igc-select
                    label="Time"
                    placeholder="Choose a time"
                    value=${time}
                    @igcChange=${({
                      detail,
                    }: CustomEvent<{ value: string }>) => {
                      time = detail.value;
                      booked = false;
                      update();
                    }}
                  >
                    ${times.map(
                      (value) =>
                        html`<igc-select-item value=${value}
                          >${value}</igc-select-item
                        >`
                    )}
                  </igc-select>
                  <div class="dp-row">
                    <igc-button
                      ?disabled=${!time}
                      @click=${() => {
                        booked = true;
                        update();
                      }}
                    >
                      Book the check-up
                    </igc-button>
                  </div>
                `
              : html`<p class="muted">Choose a day when the clinic is open.</p>`
          }
          <p role="status">
            ${
              booked && date
                ? `We booked your check-up on ${formatDate(date, longDate)} at ${time}.`
                : ''
            }
          </p>
        `,
        summary
      );
    };

    const change = () => {
      booked = false;
      update();
    };

    const nextAvailable = () => {
      let date = earliest;

      while (isWeekend(date) || isClosed(date)) {
        date = addDays(date, 1);
      }

      picker!.value = date;
      picker!.hide();
      change();
    };

    return html`
      ${styles}
      <div class="dp-layout">
        <igc-date-picker
          style="width: min(100%, 20rem)"
          label="Day of the check-up"
          .min=${earliest}
          .max=${latest}
          .disabledDates=${disabledDates}
          .specialDates=${specialDates}
          @igcChange=${change}
          ${ref((element) => {
            picker = element as IgcDatePickerComponent | undefined;
            update();
          })}
        >
          <span slot="helper-text">The clinic is closed on weekends.</span>
          <span slot="bad-input">The clinic is closed on this day.</span>
          <span slot="range-underflow">
            Choose ${formatDate(earliest, longDate)} or a later day.
          </span>
          <span slot="range-overflow">
            You can book up to ${formatDate(latest, longDate)}.
          </span>
          <igc-button slot="actions" variant="flat" @click=${nextAvailable}>
            Next available day
          </igc-button>
        </igc-date-picker>
        <section
          class="dp-panel"
          aria-label="Booking summary"
          ${ref((element) => {
            summary = element as HTMLElement | undefined;
            update();
          })}
        ></section>
      </div>
    `;
  },
};

/** The text of a due date, relative to today. */
function dueText(date: Date | null): string {
  if (!date) {
    return 'No due date';
  }

  const days = daysBetween(today, date);

  if (days === 0) {
    return 'Due today';
  }

  if (days === 1) {
    return 'Due tomorrow';
  }

  if (days > 1) {
    return `Due in ${days} days`;
  }

  return days === -1 ? 'Overdue by 1 day' : `Overdue by ${-days} days`;
}

export const DueDate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The due date of a task in a task app. `mode="dialog"` opens the calendar in a modal dialog, which suits a narrow screen. In this mode the input is read-only, and a click on the input opens the dialog. The header of the calendar shows only in the dialog mode: the `title` slot replaces "Select date", and the `header-date` slot replaces the selected date with the date relative to today. The `actions` slot goes in the footer of the dialog, and its buttons set the usual due dates. `display-format="fullDate"` shows the weekday in the input.',
      },
    },
  },
  render: () => {
    const dueDates: [label: string, date: Date | null][] = [
      ['Today', today],
      ['Tomorrow', addDays(today, 1)],
      ['Next Monday', nextWeekday(addDays(today, 1), 1)],
      ['No due date', null],
    ];

    let picker: IgcDatePickerComponent | undefined;
    let headerDate: HTMLElement | undefined;
    let status: HTMLElement | undefined;

    const update = () => {
      const text = dueText(picker?.value ?? null);

      if (headerDate) {
        headerDate.textContent = text;
      }

      if (status) {
        status.textContent = text;
      }
    };

    const setDue = (date: Date | null) => {
      picker!.value = date;
      picker!.hide();
      update();
    };

    return html`
      ${styles}
      <section class="dp-panel" aria-labelledby="dp-task-title">
        <h3 id="dp-task-title">Prepare the quarterly report</h3>
        <p class="muted">Assigned to Maya Patel</p>
        <igc-date-picker
          mode="dialog"
          label="Due date"
          display-format="fullDate"
          .value=${nextWeekday(addDays(today, 2), 5)}
          @igcChange=${update}
          ${ref((element) => {
            picker = element as IgcDatePickerComponent | undefined;
            update();
          })}
        >
          <span slot="title">Due date</span>
          <span
            slot="header-date"
            ${ref((element) => {
              headerDate = element as HTMLElement | undefined;
              update();
            })}
          ></span>
          ${dueDates.map(
            ([label, date]) => html`
              <igc-button
                slot="actions"
                variant="flat"
                @click=${() => setDue(date)}
              >
                ${label}
              </igc-button>
            `
          )}
        </igc-date-picker>
        <p
          role="status"
          class="muted"
          ${ref((element) => {
            status = element as HTMLElement | undefined;
            update();
          })}
        ></p>
      </section>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A visa application. A date of birth is faster to type than to find in a calendar, so `input-format="dd/MM/yyyy"` sets the mask and `display-format="longDate"` shows the date in words after the edit. `max` is today, and `active-date` opens the calendar 30 years ago, near the likely year. The arrival date must be from 15 days to one year from today: `min` and `max` set this period, and the `range-underflow` and `range-overflow` slots tell the user the rule. The passport must be valid for 6 months after the arrival. The two `igcChange` handlers compare the dates and call `setCustomValidity()`, and the `custom-error` slot shows the message. The form does not submit while a control is invalid. Submit shows the form data, where each date is an ISO string in UTC. Reset restores the default values and clears the custom error.',
      },
    },
  },
  render: () => {
    const earliestArrival = addDays(today, 15);
    const passportError =
      'The passport must be valid for 6 months after the arrival date.';
    let arrival: IgcDatePickerComponent | undefined;
    let expiry: IgcDatePickerComponent | undefined;

    const checkPassport = () => {
      const tooShort =
        arrival?.value &&
        expiry?.value &&
        expiry.value < addMonths(arrival.value, 6);

      expiry?.setCustomValidity(tooShort ? passportError : '');
    };

    return html`
      ${styles}
      <form
        class="dp-panel"
        @submit=${formSubmitHandler}
        @reset=${() => expiry?.setCustomValidity('')}
      >
        <h3>Visa application</h3>
        <igc-input name="full-name" label="Full name" required>
          <span slot="value-missing">Enter your full name.</span>
        </igc-input>
        <igc-date-picker
          name="birth-date"
          label="Date of birth"
          required
          input-format="dd/MM/yyyy"
          display-format="longDate"
          .max=${today}
          .activeDate=${new Date(today.getFullYear() - 30, 0, 1)}
        >
          <span slot="helper-text">For example, 25/12/1990.</span>
          <span slot="value-missing">Enter your date of birth.</span>
          <span slot="range-overflow">
            The date of birth cannot be in the future.
          </span>
        </igc-date-picker>
        <igc-date-picker
          name="arrival-date"
          label="Arrival date"
          required
          .min=${earliestArrival}
          .max=${addMonths(today, 12)}
          @igcChange=${checkPassport}
          ${ref((element) => {
            arrival = element as IgcDatePickerComponent | undefined;
          })}
        >
          <span slot="helper-text"
            >Apply at least 15 days before you travel.</span
          >
          <span slot="value-missing">Enter the arrival date.</span>
          <span slot="range-underflow">
            Choose ${formatDate(earliestArrival, longDate)} or a later day.
          </span>
          <span slot="range-overflow">
            You can apply up to one year before you travel.
          </span>
        </igc-date-picker>
        <igc-date-picker
          name="passport-expiry"
          label="Passport expiry date"
          required
          .min=${today}
          @igcChange=${checkPassport}
          ${ref((element) => {
            expiry = element as IgcDatePickerComponent | undefined;
          })}
        >
          <span slot="helper-text">
            The passport must be valid for 6 months after you arrive.
          </span>
          <span slot="value-missing">Enter the passport expiry date.</span>
          <span slot="range-underflow">This passport has expired.</span>
          <span slot="custom-error">${passportError}</span>
        </igc-date-picker>
        <div class="dp-row">
          <igc-button type="submit">Send the application</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
      </form>
    `;
  },
};

export const InScrollingPanel: Story = {
  args: {
    label: 'Delivery date',
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A date picker opens its calendar inside a scrolling panel. A panel can be a settings pane, a dialog body or a side drawer. The `scroll-strategy` property sets what happens to the calendar when the panel scrolls. If the value is `hide`, the calendar hides while the input is out of view. `hide` is the default value. If the value is `scroll`, the calendar follows the input. If the value is `close`, the calendar closes. In the `dialog` mode the calendar opens in a modal dialog and not in a popover. The picker then ignores this property. Change the `mode` control to see this behavior.',
      },
    },
  },
  render: ({ label, mode, scrollStrategy }) =>
    scrollingPanel(
      'Order details',
      'calendar',
      'Orders placed before noon ship on the selected date.',
      html`
        <igc-date-picker
          .label=${label}
          .mode=${mode}
          .scrollStrategy=${scrollStrategy}
        ></igc-date-picker>
      `
    ),
};
