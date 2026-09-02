import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcButtonComponent,
  IgcDatePickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcDatePickerComponent, IgcButtonComponent);

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
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcDatePickerArgs>;

// endregion

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive date picker in dropdown mode. Use the controls panel to explore all available properties such as `mode`, `displayFormat`, `inputFormat`, `locale`, calendar options, and validation constraints.',
      },
    },
  },
  args: {
    label: 'Pick a date',
  },
  render: (args) => html`
    <igc-date-picker
      .label=${args.label}
      .visibleMonths=${args.visibleMonths}
      .value=${new Date(args.value)}
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
    </igc-date-picker>
  `,
};

function showTrimester() {
  const picker = document.querySelector<IgcDatePickerComponent>('#picker')!;
  picker.visibleMonths = 3;
}

function showSingleMonth() {
  const picker = document.querySelector<IgcDatePickerComponent>('#picker')!;
  picker.visibleMonths = 1;
}

function selectToday() {
  const picker = document.querySelector<IgcDatePickerComponent>('#picker')!;
  picker.value = new Date();
  picker.hide();
}

export const DialogMode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Setting `mode="dialog"` opens the calendar in a centered modal overlay rather than an inline dropdown. This mode is better suited to mobile viewports and constrained layouts where a popover would be clipped.',
      },
    },
  },
  args: {
    label: 'Pick a date',
  },
  render: (args) => html`
    <igc-date-picker
      mode="dialog"
      .label=${args.label}
      .locale=${args.locale}
      .weekStart=${args.weekStart}
      .visibleMonths=${args.visibleMonths}
      ?show-week-numbers=${args.showWeekNumbers}
      ?hide-outside-days=${args.hideOutsideDays}
      ?disabled=${args.disabled}
      ?readonly=${args.readOnly}
    >
      <p slot="helper-text">Opens as a modal dialog.</p>
    </igc-date-picker>
  `,
};

export const DisabledDates: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `disabledDates` property accepts an array of `DateRangeDescriptor` objects that mark specific dates or ranges as unselectable in the calendar. Supported types include `Between`, `Before`, `After`, `Specific`, and `Weekends`. Selecting a disabled date marks the control as invalid and shows the `bad-input` slot.',
      },
    },
  },
  render: () => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7));
    const twoWeeksOut = new Date(nextMonday);
    twoWeeksOut.setDate(nextMonday.getDate() + 13);

    const disabled: DateRangeDescriptor[] = [
      { type: DateRangeType.Weekends },
      {
        type: DateRangeType.Between,
        dateRange: [nextMonday, twoWeeksOut],
      },
    ];

    return html`
      <igc-date-picker
        label="Working days only (weekends + a two-week block disabled)"
        .disabledDates=${disabled}
        style="max-width: 320px"
      >
        <p slot="helper-text">
          Weekends and the next two-week block are disabled.
        </p>
        <p slot="bad-input">
          That date is not available. Please pick a working day.
        </p>
      </igc-date-picker>
    `;
  },
};

export const Slots: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All named slots demonstrated: `prefix`, `suffix`, `helper-text`, `title`, `calendar-icon`, `calendar-icon-open`, `clear-icon`, and `actions`. The `actions` slot accepts buttons that can call the picker API methods such as `select()`, `hide()`, and setting `visibleMonths`.',
      },
    },
  },
  args: {
    label: 'Pick a date',
  },
  render: (args) => html`
    <igc-date-picker
      id="picker"
      .label=${args.label}
      .visibleMonths=${args.visibleMonths}
      .value=${args.value}
      .displayFormat=${args.displayFormat}
      .inputFormat=${args.inputFormat}
      .locale=${args.locale}
      .prompt=${args.prompt}
      .weekStart=${args.weekStart}
      .hideHeader=${args.hideHeader}
      .headerOrientation=${args.headerOrientation}
      .nonEditable=${args.nonEditable}
      .orientation=${args.orientation}
      .mode=${args.mode}
      .min=${args.min}
      .max=${args.max}
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
      <span slot="prefix">$</span>
      <span slot="suffix">🦀</span>
      <p slot="helper-text">For example, select your birthday</p>
      <p slot="title">🎉 Custom title 🎉</p>
      <span slot="calendar-icon-open">👩‍💻</span>
      <span slot="calendar-icon">👨‍💻</span>
      <span slot="clear-icon">🗑️</span>

      <div slot="actions">
        <igc-button variant="flat" @click=${selectToday}
          >Select today</igc-button
        >
        <igc-button variant="flat" @click=${showTrimester}
          >Trimester view</igc-button
        >
        <igc-button variant="flat" @click=${showSingleMonth}
          >Single month view</igc-button
        >
      </div>
    </igc-date-picker>
  `,
};

const minDate = new Date(2024, 1, 1);
const maxDate = new Date(2024, 1, 28);
const disabledDates: DateRangeDescriptor[] = [
  {
    type: DateRangeType.Between,
    dateRange: [minDate, maxDate],
  },
];

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the date picker inside an HTML `<form>`, covering default state, pre-filled value, read-only, disabled fieldset, required validation, `min`/`max` date constraints, and disabled date ranges — each with appropriate validation slot messages.',
      },
    },
  },
  args: {
    value: new Date(2024, 1, 29),
  },
  render: (args) => html`
    <style>
      fieldset {
        min-width: 0;
      }
    </style>
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-date-picker
          label="Default"
          name="picker-default"
        ></igc-date-picker>

        <igc-date-picker
          label="Initial value"
          name="picker-initial"
          .value=${args.value}
        ></igc-date-picker>

        <igc-date-picker
          label="Readonly"
          name="picker-readonly"
          readonly
        ></igc-date-picker>
      </fieldset>

      <fieldset disabled>
        <igc-date-picker
          label="Disabled"
          name="picker-disabled"
        ></igc-date-picker>
      </fieldset>

      <fieldset>
        <igc-date-picker label="Required" name="picker-required" required>
          <p slot="value-missing">This field is required!</p>
        </igc-date-picker>
      </fieldset>

      <fieldset>
        <igc-date-picker label="Minimum date" name="picker-min" .min=${minDate}>
          <p slot="helper-text">
            Choose a date after ${minDate.toLocaleDateString()}
          </p>
          <p slot="range-underflow">
            Selected date is less that ${minDate.toLocaleDateString()}
          </p>
        </igc-date-picker>

        <igc-date-picker label="Maximum date" name="picker-max" .max=${maxDate}>
          <p slot="helper-text">
            Choose a date before ${maxDate.toLocaleDateString()}
          </p>
          <p slot="range-overflow">
            Selected date is greater than ${maxDate.toLocaleDateString()}
          </p>
        </igc-date-picker>
      </fieldset>

      <fieldset>
        <igc-date-picker
          label="Disabled dates range - between (${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()})"
          name="picker-disabled-ranges"
          .disabledDates=${disabledDates}
        >
          <p slot="bad-input">Selected date is in the disabled dates!</p>
        </igc-date-picker>
      </fieldset>
      ${formControls()}
    </form>
  `,
};
