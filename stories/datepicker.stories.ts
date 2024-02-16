import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import { IgcDatepickerComponent, defineComponents } from '../src/index.js';

defineComponents(IgcDatepickerComponent);

// region default
const metadata: Meta<IgcDatepickerComponent> = {
  title: 'Datepicker',
  component: 'igc-datepicker',
  parameters: {
    docs: { description: { component: '' } },
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
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the calendar dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
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
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    value: { type: 'Date', control: 'date' },
    hideOutsideDays: {
      type: 'boolean',
      description:
        'Controls the visibility of the dates that do not belong to the current month.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
  },
  args: {
    keepOpenOnOutsideClick: false,
    open: false,
    readOnly: false,
    hideOutsideDays: false,
    visibleMonths: 1,
    showWeekNumbers: false,
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
  },
};

export default metadata;

interface IgcDatepickerArgs {
  /** Whether the calendar dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the state of the datepicker dropdown. */
  open: boolean;
  /** The label of the datepicker. */
  label: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  value: Date;
  /** Controls the visibility of the dates that do not belong to the current month. */
  hideOutsideDays: boolean;
  /** The number of months displayed in the calendar. */
  visibleMonths: number;
  /** Whether to show the number of the week in the calendar. */
  showWeekNumbers: boolean;
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
}
type Story = StoryObj<IgcDatepickerArgs>;

// endregion

export const Default: Story = {
  args: {
    label: 'Pick a date',
    value: new Date(),
  },
  render: (args) => html`
    <igc-datepicker
      .label=${args.label}
      .visibleMonths=${args.visibleMonths}
      .value=${args.value}
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
    </igc-datepicker>
  `,
};

export const Slots: Story = {
  args: {
    label: 'Pick a date',
  },
  render: (args) => html`
    <igc-datepicker
      .label=${args.label}
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
      <span slot="prefix">$</span>
      <span slot="suffix">🦀</span>
      <p slot="helper-text">For example, select your birthday</p>
      <p slot="title">🎉 Custom title 🎉</p>
    </igc-datepicker>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <form action="" @submit=${formSubmitHandler}>
      <fieldset>
        <igc-datepicker label="Default" name="picker-default"></igc-datepicker>
        <igc-datepicker
          label="Initial value"
          name="picker-initial"
        ></igc-datepicker>
        <igc-datepicker
          label="Readonly"
          name="picker-readonly"
          readonly
        ></igc-datepicker>
      </fieldset>

      <fieldset disabled>
        <igc-datepicker
          label="Disabled"
          name="picker-disabled"
        ></igc-datepicker>
      </fieldset>

      <fieldset>
        <igc-datepicker
          label="Required"
          name="picker-required"
          required
        ></igc-datepicker>
      </fieldset>
      ${formControls()}
    </form>
  `,
};
