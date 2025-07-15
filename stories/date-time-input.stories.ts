import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcDateTimeInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import type { DateRangeValue } from '../src/components/date-range-picker/date-range-picker.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcDateTimeInputComponent);

// region default
const metadata: Meta<IgcDateTimeInputComponent> = {
  title: 'DateTimeInput',
  component: 'igc-date-time-input',
  parameters: {
    docs: {
      description: {
        component:
          'A date time input is an input field that lets you set and edit the date and time in a chosen input element\nusing customizable display and input formats.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string | Date | DateRangeValue',
      description: 'The value of the input.',
      options: ['string', 'Date', 'DateRangeValue'],
      control: 'text',
    },
    inputFormat: {
      type: 'string',
      description: 'The date format to apply on the input.',
      control: 'text',
    },
    min: {
      type: 'Date',
      description: 'The minimum value required for the input to remain valid.',
      control: 'date',
    },
    max: {
      type: 'Date',
      description: 'The maximum value required for the input to remain valid.',
      control: 'date',
    },
    displayFormat: {
      type: 'string',
      description:
        'Format to display the value in when not editing.\nDefaults to the input format if not set.',
      control: 'text',
    },
    spinLoop: {
      type: 'boolean',
      description: 'Sets whether to loop over the currently spun segment.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
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
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
  },
  args: {
    spinLoop: true,
    locale: 'en',
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
    readOnly: false,
  },
};

export default metadata;

interface IgcDateTimeInputArgs {
  /** The value of the input. */
  value: string | Date | DateRangeValue;
  /** The date format to apply on the input. */
  inputFormat: string;
  /** The minimum value required for the input to remain valid. */
  min: Date;
  /** The maximum value required for the input to remain valid. */
  max: Date;
  /**
   * Format to display the value in when not editing.
   * Defaults to the input format if not set.
   */
  displayFormat: string;
  /** Sets whether to loop over the currently spun segment. */
  spinLoop: boolean;
  /** The locale settings used to display the value. */
  locale: string;
  /** The prompt symbol to use for unfilled parts of the mask. */
  prompt: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcDateTimeInputArgs>;

// endregion

const stepUp = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.stepUp();
};

const stepDown = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.stepDown();
};
const clear = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.clear();
};

export const Default: Story = {
  args: {
    value: new Date(),
    label: 'Enter a date and/or time',
  },
  render: (args) => html`
    <igc-date-time-input
      .label=${args.label}
      .name=${args.name}
      .value=${args.value ? new Date(args.value) : null}
      .inputFormat=${args.inputFormat}
      .displayFormat=${args.displayFormat}
      .min=${args.min ? new Date(args.min) : null}
      .max=${args.max ? new Date(args.max) : null}
      .locale=${args.locale}
      .prompt=${args.prompt}
      .placeholder=${args.placeholder}
      ?spin-loop=${args.spinLoop}
      ?readonly=${args.readOnly}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      <igc-icon slot="prefix" name="input_clear" @click=${clear}></igc-icon>
      <igc-icon slot="suffix" name="input_collapse" @click=${stepUp}></igc-icon>
      <igc-icon slot="suffix" name="input_expand" @click=${stepDown}></igc-icon>
      <p slot="helper-text">Sample helper text.</p>
    </igc-date-time-input>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <igc-date-time-input
            label="Default state"
            name="datetime-default"
          ></igc-date-time-input>

          <igc-date-time-input
            label="Initial value"
            name="datetime-initial"
            value="2023-03-17T15:35"
            display-format="yyyy-MM-dd HH:mm"
            input-format="yyyy-MM-dd HH:mm"
          ></igc-date-time-input>

          <igc-date-time-input
            readonly
            label="Readonly"
            name="datetime-readonly"
            value="1987-07-17"
          ></igc-date-time-input>
        </fieldset>

        <fieldset disabled>
          <igc-date-time-input
            name="datetime-disabled"
            label="Disabled editor"
          ></igc-date-time-input>
        </fieldset>

        <fieldset>
          <igc-date-time-input
            required
            name="datetime-required"
            label="Required"
          >
            <p slot="value-missing">This field is required</p>
          </igc-date-time-input>

          <igc-date-time-input
            name="datetime-min"
            label="Minimum constraint (2023-03-17)"
            min="2023-03-17"
            value="2020-01-01"
          >
            <p slot="range-underflow">Date is outside of allowed range</p>
          </igc-date-time-input>

          <igc-date-time-input
            name="datetime-max"
            label="Maximum constraint (2023-04-17)"
            max="2023-04-17"
            value="2024-03-17"
          >
            <p slot="range-overflow">Date is outside of allowed range</p>
          </igc-date-time-input>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
