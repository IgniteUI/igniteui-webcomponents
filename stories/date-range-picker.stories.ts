import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcButtonComponent,
  IgcDateRangePickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { CalendarDay } from '../src/components/calendar/model.js';
import type {
  CustomDateRange,
  DateRangeValue,
} from '../src/components/date-range-picker/date-range-picker.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcDateRangePickerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcDateRangePickerComponent> = {
  title: 'DateRangePicker',
  component: 'igc-date-range-picker',
  parameters: {
    docs: {
      description: {
        component:
          'The igc-date-range-picker allows the user to select a range of dates.',
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
    value: { type: 'DateRangeValue', control: 'date' },
    mode: {
      type: '"dropdown" | "dialog"',
      description:
        'Determines whether the calendar is opened in a dropdown or a modal dialog',
      options: ['dropdown', 'dialog'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'dropdown' } },
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
    locale: {
      type: 'string',
      description: 'The locale settings used to display the value.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
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
      description: 'The label of the control (single input).',
      control: 'text',
    },
    labelStart: {
      type: 'string',
      description: 'The label attribute of the start input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    labelEnd: {
      type: 'string',
      description: 'The label attribute of the end input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control (single input).',
      control: 'text',
    },
    placeholderStart: {
      type: 'string',
      description: 'The placeholder attribute of the start input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    placeholderEnd: {
      type: 'string',
      description: 'The placeholder attribute of the end input.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
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
        'Format to display the value in when not editing.\nDefaults to the input format if not set.',
      control: 'text',
    },
    inputFormat: {
      type: 'string',
      description:
        'The date format to apply on the inputs.\nDefaults to the current locale Intl.DateTimeFormat',
      control: 'text',
    },
    min: {
      type: 'Date',
      description:
        'The minimum value required for the date range picker to remain valid.',
      control: 'date',
    },
    max: {
      type: 'Date',
      description:
        'The maximum value required for the date range picker to remain valid.',
      control: 'date',
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the calendar.',
      control: 'number',
    },
    headerOrientation: {
      type: '"horizontal" | "vertical"',
      description: 'The orientation of the calendar header.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    orientation: {
      type: '"horizontal" | "vertical"',
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
    activeDate: {
      type: 'Date',
      description:
        'Gets/Sets the date which is shown in the calendar picker and is highlighted.\nBy default it is the current date.',
      control: 'date',
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Whether to show the number of the week in the calendar.',
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
    weekStart: {
      type: '"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',
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
      table: { defaultValue: { summary: 'sunday' } },
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
      description: 'The name attribute of the control.',
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
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    mode: 'dropdown',
    useTwoInputs: false,
    usePredefinedRanges: false,
    locale: 'en',
    readOnly: false,
    nonEditable: false,
    outlined: false,
    labelStart: '',
    labelEnd: '',
    placeholderStart: '',
    placeholderEnd: '',
    prompt: '_',
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    hideHeader: false,
    showWeekNumbers: false,
    hideOutsideDays: false,
    weekStart: 'sunday',
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
  },
};

export default metadata;

interface IgcDateRangePickerArgs {
  value: DateRangeValue;
  /** Determines whether the calendar is opened in a dropdown or a modal dialog */
  mode: 'dropdown' | 'dialog';
  /** Use two inputs to display the date range values. Makes the input editable in dropdown mode. */
  useTwoInputs: boolean;
  /** Whether the control will show chips with predefined ranges. */
  usePredefinedRanges: boolean;
  /** The locale settings used to display the value. */
  locale: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Whether to allow typing in the input. */
  nonEditable: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The label of the control (single input). */
  label: string;
  /** The label attribute of the start input. */
  labelStart: string;
  /** The label attribute of the end input. */
  labelEnd: string;
  /** The placeholder attribute of the control (single input). */
  placeholder: string;
  /** The placeholder attribute of the start input. */
  placeholderStart: string;
  /** The placeholder attribute of the end input. */
  placeholderEnd: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   */
  displayFormat: string;
  /**
   * The date format to apply on the inputs.
   * Defaults to the current locale Intl.DateTimeFormat
   */
  inputFormat: string;
  /** The minimum value required for the date range picker to remain valid. */
  min: Date;
  /** The maximum value required for the date range picker to remain valid. */
  max: Date;
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
  /** The orientation of the calendar header. */
  headerOrientation: 'horizontal' | 'vertical';
  /** The orientation of the multiple months displayed in the calendar's days view. */
  orientation: 'horizontal' | 'vertical';
  /** Determines whether the calendar hides its header. */
  hideHeader: boolean;
  /**
   * Gets/Sets the date which is shown in the calendar picker and is highlighted.
   * By default it is the current date.
   */
  activeDate: Date;
  /** Whether to show the number of the week in the calendar. */
  showWeekNumbers: boolean;
  /** Controls the visibility of the dates that do not belong to the current month. */
  hideOutsideDays: boolean;
  /** Sets the start day of the week for the calendar. */
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcDateRangePickerArgs>;

// endregion

const minDate = new Date(2025, 2, 1);
const maxDate = new Date(2025, 2, 31);
const disabledDates: DateRangeDescriptor[] = [
  {
    type: DateRangeType.Between,
    dateRange: [minDate, maxDate],
  },
];

function selectToday(
  pickerType: '#singleInput' | '#twoInputs' = '#singleInput'
) {
  const picker =
    document.querySelector<IgcDateRangePickerComponent>(pickerType)!;
  picker.select({ start: new Date(), end: new Date() });
  picker.hide();
}

const today = CalendarDay.from(new Date());
const tomorrow = today.add('day', 1);
const previousThreeMonthsStart = new Date(
  today.native.getFullYear(),
  today.native.getMonth() - 3,
  1
);
const previousThreeMonthsEnd = new Date(
  today.native.getFullYear(),
  today.native.getMonth(),
  0
);
const nextThreeMonthsStart = new Date(
  today.native.getFullYear(),
  today.native.getMonth() + 1,
  1
);
const nextThreeMonthsEnd = new Date(
  today.native.getFullYear(),
  today.native.getMonth() + 4,
  0
);

const customRanges: CustomDateRange[] = [
  {
    label: 'Previous Three Months',
    dateRange: {
      start: previousThreeMonthsStart,
      end: previousThreeMonthsEnd,
    },
  },
  {
    label: 'Next Three Months',
    dateRange: {
      start: nextThreeMonthsStart,
      end: nextThreeMonthsEnd,
    },
  },
];

export const Default: Story = {
  args: {
    open: false,
    labelStart: 'Start',
    labelEnd: 'End',
    label: 'Date range',
    visibleMonths: 2,
  },
  render: (args) => html`
    <igc-date-range-picker
      id="picker"
      .value=${{ start: today.native, end: tomorrow.native }}
      .displayFormat=${args.displayFormat}
      .inputFormat=${args.inputFormat}
      .locale=${args.locale}
      .prompt=${args.prompt}
      .weekStart=${args.weekStart}
      .hideHeader=${args.hideHeader}
      .headerOrientation=${args.headerOrientation}
      .nonEditable=${args.nonEditable}
      .orientation=${args.orientation}
      .outlined=${args.outlined}
      ?use-predefined-ranges=${args.usePredefinedRanges}
      .mode=${args.mode}
      .min=${new Date(args.min)}
      .max=${new Date(args.max)}
      .activeDate=${args.activeDate}
      .placeholderStart=${args.placeholderStart}
      .placeholderEnd=${args.placeholderEnd}
      .placeholder=${args.placeholder}
      .labelStart=${args.labelStart}
      .labelEnd=${args.labelEnd}
      .label=${args.label}
      .visibleMonths=${args.visibleMonths}
      ?disabled=${args.disabled}
      .useTwoInputs=${args.useTwoInputs}
      ?invalid=${args.invalid}
      ?readonly=${args.readOnly}
      ?required=${args.required}
      ?open=${args.open}
      ?show-week-numbers=${args.showWeekNumbers}
      ?hide-outside-days=${args.hideOutsideDays}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=${args.keepOpenOnSelect}
    >
    </igc-date-range-picker>
  `,
};

export const CustomRanges: Story = {
  args: {
    open: false,
    labelStart: 'Start',
    labelEnd: 'End',
    label: 'Date range',
    visibleMonths: 2,
  },
  render: (args) => html`
    <igc-date-range-picker
      id="picker"
      .value=${{ start: today.native, end: tomorrow.native }}
      .customRanges=${customRanges}
      .displayFormat=${args.displayFormat}
      .inputFormat=${args.inputFormat}
      .locale=${args.locale}
      .prompt=${args.prompt}
      .weekStart=${args.weekStart}
      .hideHeader=${args.hideHeader}
      .headerOrientation=${args.headerOrientation}
      .nonEditable=${args.nonEditable}
      .orientation=${args.orientation}
      .outlined=${args.outlined}
      ?use-predefined-ranges=${args.usePredefinedRanges}
      .mode=${args.mode}
      .min=${new Date(args.min)}
      .max=${new Date(args.max)}
      .activeDate=${args.activeDate}
      .placeholderStart=${args.placeholderStart}
      .placeholderEnd=${args.placeholderEnd}
      .placeholder=${args.placeholder}
      .labelStart=${args.labelStart}
      .labelEnd=${args.labelEnd}
      .label=${args.label}
      .visibleMonths=${args.visibleMonths}
      ?disabled=${args.disabled}
      .useTwoInputs=${args.useTwoInputs}
      ?invalid=${args.invalid}
      ?readonly=${args.readOnly}
      ?required=${args.required}
      ?open=${args.open}
      ?show-week-numbers=${args.showWeekNumbers}
      ?hide-outside-days=${args.hideOutsideDays}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=${args.keepOpenOnSelect}
    >
    </igc-date-range-picker>
  `,
};

export const Slots: Story = {
  args: {
    label: 'Select Date Range',
  },
  render: (args) =>
    html` <h5>Two inputs</h5>
      <igc-date-range-picker
        id="twoInputs"
        .displayFormat=${args.displayFormat}
        .inputFormat=${args.inputFormat}
        .locale=${args.locale}
        .prompt=${args.prompt}
        .weekStart=${args.weekStart}
        .hideHeader=${args.hideHeader}
        .headerOrientation=${args.headerOrientation}
        .nonEditable=${args.nonEditable}
        .orientation=${args.orientation}
        .outlined=${args.outlined}
        .mode=${args.mode}
        .min=${new Date(args.min)}
        .max=${new Date(args.max)}
        .visibleMonths=${args.visibleMonths}
        ?use-two-inputs=${true}
        ?use-predefined-ranges="${args.usePredefinedRanges}"
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?readonly=${args.readOnly}
        ?required=${args.required}
        ?open=${args.open}
        ?show-week-numbers=${args.showWeekNumbers}
        ?hide-outside-days=${args.hideOutsideDays}
        ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
        ?keep-open-on-select=${args.keepOpenOnSelect}
      >
        <span slot="prefix-start">$</span>
        <span slot="prefix-end">*</span>
        <span slot="suffix-start">🦀</span>
        <span slot="suffix-end">😂</span>

        <span slot="calendar-icon-open-start">⬆️</span>
        <span slot="calendar-icon-start">⬇️</span>
        <span slot="calendar-icon-open-end">👩‍💻</span>
        <span slot="calendar-icon-end">👩‍💻</span>

        <span slot="clear-icon-start">🗑️</span>
        <span slot="clear-icon-end">🚮</span>

        <span slot="separator">TO</span>

        <p slot="helper-text">
          For example, select the dates of your future vacation
        </p>
        <p slot="title">🎉 Custom title 🎉</p>

        <div slot="actions">
          <igc-button variant="flat" @click=${() => selectToday('#twoInputs')}
            >Select today</igc-button
          >
        </div>
      </igc-date-range-picker>
      <h5>Single input</h5>
      <igc-date-range-picker
        id="singleInput"
        .label=${args.label}
        .placeholder=${args.placeholder}
        .displayFormat=${args.displayFormat}
        .inputFormat=${args.inputFormat}
        .locale=${args.locale}
        .prompt=${args.prompt}
        .weekStart=${args.weekStart}
        .hideHeader=${args.hideHeader}
        .headerOrientation=${args.headerOrientation}
        .nonEditable=${args.nonEditable}
        .orientation=${args.orientation}
        .outlined=${args.outlined}
        ?use-predefined-ranges=${args.usePredefinedRanges}
        .mode=${args.mode}
        .min=${new Date(args.min)}
        .max=${new Date(args.max)}
        .activeDate=${args.activeDate}
        .visibleMonths=${args.visibleMonths}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?readonly=${args.readOnly}
        ?required=${args.required}
        ?open=${args.open}
        ?show-week-numbers=${args.showWeekNumbers}
        ?hide-outside-days=${args.hideOutsideDays}
        ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
        ?keep-open-on-select=${args.keepOpenOnSelect}
      >
        <span slot="prefix-start">$</span>
        <span slot="suffix-start">🦀</span>

        <span slot="calendar-icon-open-start">👩‍💻</span>
        <span slot="calendar-icon-start">👩‍💻</span>
        <span slot="clear-icon-start">🗑️</span>

        <p slot="helper-text">
          For example, select the dates of your future vacation
        </p>
        <p slot="title">🎉 Custom title 🎉</p>

        <div slot="actions">
          <igc-button variant="flat" @click=${() => selectToday()}
            >Select today</igc-button
          >
        </div>
      </igc-date-range-picker>`,
};

export const FormTwoInputs: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <h5>Default</h5>
        <igc-date-range-picker
          name="picker-default"
          .useTwoInputs=${true}
        ></igc-date-range-picker>

        <h5>Initial value</h5>
        <igc-date-range-picker
          name="picker-initial"
          value=${JSON.stringify({ start: today.native, end: tomorrow.native })}
          .useTwoInputs=${true}
        ></igc-date-range-picker>

        <h5>Readonly</h5>
        <igc-date-range-picker
          name="picker-readonly"
          readonly
          .useTwoInputs=${true}
        ></igc-date-range-picker>
      </fieldset>

      <h5>Disabled</h5>
      <fieldset disabled>
        <igc-date-range-picker
          name="picker-disabled"
          .useTwoInputs=${true}
        ></igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>Required</h5>
        <igc-date-range-picker
          name="picker-required"
          .useTwoInputs=${true}
          required
        >
          <p slot="value-missing">This field is required!</p>
        </igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>Minimum date</h5>
        <igc-date-range-picker
          name="picker-min"
          .min=${minDate}
          .useTwoInputs=${true}
        >
          <p slot="helper-text">
            Choose a date after ${minDate.toLocaleDateString()}
          </p>
          <p slot="range-underflow">
            Selected date is less that ${minDate.toLocaleDateString()}
          </p>
        </igc-date-range-picker>

        <h5>Maximum date</h5>
        <igc-date-range-picker
          name="picker-max"
          .max=${maxDate}
          .useTwoInputs=${true}
        >
          <p slot="helper-text">
            Choose a date before ${maxDate.toLocaleDateString()}
          </p>
          <p slot="range-overflow">
            Selected date is greater than ${maxDate.toLocaleDateString()}
          </p>
        </igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>
          Disabled dates range - between (${minDate.toLocaleDateString()} -
          ${maxDate.toLocaleDateString()})
        </h5>
        <igc-date-range-picker
          name="picker-disabled-ranges"
          .disabledDates=${disabledDates}
          .useTwoInputs=${true}
        >
          <p slot="bad-input">Selected date is in the disabled dates!</p>
        </igc-date-range-picker>
      </fieldset>
      ${formControls()}
    </form>
  `,
};

export const FormSingleInput: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <h5>Default</h5>
        <igc-date-range-picker name="picker-default"></igc-date-range-picker>

        <h5>Initial value</h5>
        <!-- dfs -->
        <igc-date-range-picker
          name="picker-initial"
          value=${JSON.stringify({ start: today.native, end: tomorrow.native })}
        ></igc-date-range-picker>

        <h5>Readonly</h5>
        <igc-date-range-picker
          name="picker-readonly"
          readonly
        ></igc-date-range-picker>
      </fieldset>

      <h5>Disabled</h5>
      <fieldset disabled>
        <igc-date-range-picker name="picker-disabled"></igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>Required</h5>
        <igc-date-range-picker name="picker-required" required>
          <p slot="value-missing">This field is required!</p>
        </igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>Minimum date</h5>
        <igc-date-range-picker name="picker-min" .min=${minDate}>
          <p slot="helper-text">
            Choose a date after ${minDate.toLocaleDateString()}
          </p>
          <p slot="range-underflow">
            Selected date is less that ${minDate.toLocaleDateString()}
          </p>
        </igc-date-range-picker>

        <h5>Maximum date</h5>
        <igc-date-range-picker name="picker-max" .max=${maxDate}>
          <p slot="helper-text">
            Choose a date before ${maxDate.toLocaleDateString()}
          </p>
          <p slot="range-overflow">
            Selected date is greater than ${maxDate.toLocaleDateString()}
          </p>
        </igc-date-range-picker>
      </fieldset>

      <fieldset>
        <h5>
          Disabled dates range - between (${minDate.toLocaleDateString()} -
          ${maxDate.toLocaleDateString()})
        </h5>
        <igc-date-range-picker
          name="picker-disabled-ranges"
          .disabledDates=${disabledDates}
        >
          <p slot="bad-input">Selected date is in the disabled dates!</p>
        </igc-date-range-picker>
      </fieldset>
      ${formControls()}
    </form>
  `,
};
