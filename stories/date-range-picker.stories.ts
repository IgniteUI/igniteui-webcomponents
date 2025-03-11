import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcDateRangePickerComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcDateRangePickerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcDateRangePickerComponent> = {
  title: 'DateRangePicker',
  component: 'igc-date-range-picker',
  parameters: {
    docs: {
      description: {
        component:
          'igc-datepicker is a feature rich component used for entering a date through manual text input or\nchoosing date values from a calendar dialog that pops up.',
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
    open: {
      type: 'boolean',
      description: 'Sets the state of the datepicker dropdown.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    label: {
      type: 'string',
      description: 'The label of the datepicker.',
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
    nonEditable: {
      type: 'boolean',
      description: 'Whether to allow typing in the input.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    value: {
      type: 'Date',
      description: 'The value of the picker',
      control: 'date',
    },
    activeDate: {
      type: 'Date',
      description:
        'Gets/Sets the date which is shown in the calendar picker and is highlighted.\nBy default it is the current date.',
      control: 'date',
    },
    min: {
      type: 'Date',
      description:
        'The minimum value required for the date picker to remain valid.',
      control: 'date',
    },
    max: {
      type: 'Date',
      description:
        'The maximum value required for the date picker to remain valid.',
      control: 'date',
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
      table: { defaultValue: { summary: false } },
    },
    hideOutsideDays: {
      type: 'boolean',
      description:
        'Controls the visibility of the dates that do not belong to the current month.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the calendar.',
      control: 'number',
      table: { defaultValue: { summary: 1 } },
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Whether to show the number of the week in the calendar.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
        'The date format to apply on the input.\nDefaults to the current locale Intl.DateTimeFormat',
      control: 'text',
    },
    locale: {
      type: 'string',
      description: 'The locale settings used to display the value.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
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
      description: 'Makes the control a required field in a form context.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    open: false,
    mode: 'dropdown',
    nonEditable: false,
    readOnly: false,
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    hideHeader: false,
    hideOutsideDays: false,
    outlined: false,
    visibleMonths: 1,
    showWeekNumbers: false,
    locale: 'en',
    prompt: '_',
    weekStart: 'sunday',
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
  },
};

export default metadata;

interface IgcDateRangePickerArgs {
  /** Sets the state of the datepicker dropdown. */
  open: boolean;
  /** The label of the datepicker. */
  label: string;
  /** Determines whether the calendar is opened in a dropdown or a modal dialog */
  mode: 'dropdown' | 'dialog';
  /** Whether to allow typing in the input. */
  nonEditable: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The value of the picker */
  value: Date;
  /**
   * Gets/Sets the date which is shown in the calendar picker and is highlighted.
   * By default it is the current date.
   */
  activeDate: Date;
  /** The minimum value required for the date picker to remain valid. */
  min: Date;
  /** The maximum value required for the date picker to remain valid. */
  max: Date;
  /** The orientation of the calendar header. */
  headerOrientation: 'vertical' | 'horizontal';
  /** The orientation of the multiple months displayed in the calendar's days view. */
  orientation: 'vertical' | 'horizontal';
  /** Determines whether the calendar hides its header. */
  hideHeader: boolean;
  /** Controls the visibility of the dates that do not belong to the current month. */
  hideOutsideDays: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
  /** Whether to show the number of the week in the calendar. */
  showWeekNumbers: boolean;
  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   */
  displayFormat: string;
  /**
   * The date format to apply on the input.
   * Defaults to the current locale Intl.DateTimeFormat
   */
  inputFormat: string;
  /** The locale settings used to display the value. */
  locale: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /** Sets the start day of the week for the calendar. */
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
}
type Story = StoryObj<IgcDateRangePickerArgs>;

// endregion

export const Default: Story = {
  args: {
    open: false,
  },
  render: (args) => html`
    <igc-date-range-picker ?open=${args.open}> </igc-date-range-picker>
  `,
};
