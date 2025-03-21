import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcButtonComponent,
  IgcDateRangeInputComponent,
  IgcDateRangePickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(
  IgcDateRangePickerComponent,
  IgcButtonComponent,
  IgcDateRangeInputComponent
);

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
    label: {
      type: 'string',
      description: 'The label of the date input.',
      control: 'text',
    },
    mode: {
      type: '"dropdown" | "dialog"',
      description:
        'Determines whether the calendar is opened in a dropdown or a modal dialog',
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
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the date input.',
      control: 'text',
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
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
    },
    headerOrientation: {
      type: '"vertical" | "horizontal"',
      description: 'The orientation of the calendar header.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    orientation: {
      type: '"vertical" | "horizontal"',
      description:
        "The orientation of the multiple months displayed in the calendar's days view.",
      options: ['vertical', 'horizontal'],
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
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the calendar.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    locale: {
      type: 'string',
      description: 'The locale settings used to display the value.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
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
    value: {
      control: 'object',
      defaultValue: [new Date(), new Date()],
    },
  },
  args: {
    mode: 'dropdown',
    readOnly: false,
    nonEditable: false,
    outlined: false,
    prompt: '_',
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    hideHeader: false,
    showWeekNumbers: false,
    hideOutsideDays: false,
    locale: 'en',
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
  /** The label of the date input. */
  label: string;
  /** The label of the start date input. */
  mode: 'dropdown' | 'dialog';
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Whether to allow typing in the input. */
  nonEditable: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder attribute of the date input. */
  placeholder: string;
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
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /** The orientation of the calendar header. */
  headerOrientation: 'vertical' | 'horizontal';
  /** The orientation of the multiple months displayed in the calendar's days view. */
  orientation: 'vertical' | 'horizontal';
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
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
  /** The locale settings used to display the value. */
  locale: string;
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

function selectToday() {
  const picker =
    document.querySelector<IgcDateRangePickerComponent>('#picker')!;
  picker.value = [new Date(), new Date()];
  picker.hide();
}

export const Default: Story = {
  args: {
    open: false,
  },
  render: (args) => html`
    <igc-date-range-picker
      id="picker"
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
      .activeDate=${args.activeDate}
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
      <igc-date-range-input
        label="Start date"
        slot="start"
        name="date-range-start-name"
      >
      </igc-date-range-input>
      <igc-date-range-input
        label="End date"
        slot="end"
        name="date-range-end-name"
      ></igc-date-range-input>
    </igc-date-range-picker>
  `,
};

export const SingleInput: Story = {
  args: {
    open: false,
  },
  render: (args) => html`
    <igc-date-range-picker
      id="picker"
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
      .mode=${args.mode}
      .min=${new Date(args.min)}
      .max=${new Date(args.max)}
      .activeDate=${args.activeDate}
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
    </igc-date-range-picker>
  `,
};

export const Slots: Story = {
  args: {
    label: 'Select Date',
  },
  render: (args) =>
    html` <span>Two inputs</span>
      <igc-date-range-picker
        id="picker"
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
        .activeDate=${args.activeDate}
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
        <igc-date-range-input
          label="Start date"
          slot="start"
          name="date-range-start-name"
        >
          <span slot="prefix">$</span>
          <span slot="suffix">🦀</span>
        </igc-date-range-input>
        <igc-date-range-input
          label="End date"
          slot="end"
          name="date-range-end-name"
        >
          <span slot="prefix">$$</span>
          <span slot="suffix">🦀🦀</span>
        </igc-date-range-input>
      </igc-date-range-picker>
      <span>Single input</span>
      <igc-date-range-picker
        id="picker"
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
        .mode=${args.mode}
        .min=${new Date(args.min)}
        .max=${new Date(args.max)}
        .activeDate=${args.activeDate}
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
        <span slot="prefix-end">$</span>
        <span slot="suffix-start">🦀</span>
        <span slot="suffix-end">🦀</span>

        <span slot="start-calendar-icon-open">👩‍💻</span>
        <span slot="start-calendar-icon">👩‍💻</span>
        <span slot="end-calendar-icon-open">👩‍💻</span>
        <span slot="end-calendar-icon">👩‍💻</span>

        <span slot="start-clear-icon">🗑️</span>
        <span slot="end-clear-icon">🗑️</span>

        <p slot="helper-text">
          For example, select the dates of your future vacation
        </p>
        <p slot="title">🎉 Custom title 🎉</p>

        <div slot="actions">
          <igc-button variant="flat" @click=${selectToday}
            >Select today</igc-button
          >
        </div>
      </igc-date-range-picker>`,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-date-range-picker
          label="Default"
          name="picker-default"
        ></igc-date-range-picker>

        <igc-date-range-picker
          label="Initial value"
          name="picker-initial"
          .value=${[new Date(2025, 2, 19), new Date(2025, 2, 20)]}
        ></igc-date-range-picker>

        <igc-date-range-picker
          label="Readonly"
          name="picker-readonly"
          readonly
        ></igc-date-range-picker>
      </fieldset>

      <fieldset disabled>
        <igc-date-range-picker
          label="Disabled"
          name="picker-disabled"
        ></igc-date-range-picker>
      </fieldset>

      <fieldset>
        <igc-date-range-picker label="Required" name="picker-required" required>
          <p slot="value-missing">This field is required!</p>
        </igc-date-range-picker>
      </fieldset>

      <fieldset>
        <igc-date-range-picker
          labelStart="Minimum date"
          name="picker-min"
          .min=${minDate}
        >
          <p slot="helper-text">
            Choose a date after ${minDate.toLocaleDateString()}
          </p>
          <p slot="range-underflow">
            Selected date is less that ${minDate.toLocaleDateString()}
          </p>
        </igc-date-range-picker>

        <igc-date-range-picker
          labelStart="Maximum date"
          name="picker-max"
          .max=${maxDate}
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
        <igc-date-range-picker
          labelStart="Disabled dates range - between (${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()})"
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
