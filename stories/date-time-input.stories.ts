import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import type { DatePartDeltas } from '../src/components/date-time-input/date-util.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { IgcDateTimeInputComponent, defineComponents } from '../src/index.js';
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
    inputFormat: {
      type: 'string',
      description: 'The date format to apply on the input.',
      control: 'text',
    },
    value: {
      type: 'string | Date',
      description: 'The value of the input.',
      options: ['string', 'Date'],
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
      table: { defaultValue: { summary: true } },
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
      table: { defaultValue: { summary: false } },
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
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
  /** The date format to apply on the input. */
  inputFormat: string;
  /** The value of the input. */
  value: string | Date;
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
  /** Control the validity of the control. */
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

const Template = ({
  inputFormat,
  prompt,
  readOnly,
  disabled,
  required,
  outlined,
  placeholder,
  displayFormat,
  min,
  max,
  locale,
  spinLoop,
  value,
  label,
  invalid,
}: IgcDateTimeInputArgs) => {
  const spinDelta: DatePartDeltas = {
    date: 2,
    year: 10,
  };

  return html`<igc-date-time-input
    id="editor"
    label=${label}
    .value=${value ? new Date(value as Date) : null}
    .inputFormat=${inputFormat}
    .displayFormat=${displayFormat}
    .min=${min ? new Date(min as Date) : null}
    .max=${max ? new Date(max as Date) : null}
    locale=${ifDefined(locale)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    ?spin-loop=${spinLoop}
    .readOnly=${readOnly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
    .spinDelta=${spinDelta}
    .invalid=${invalid}
  >
    <igc-icon
      name="input_clear"
      slot="prefix"
      onclick="editor.clear()"
    ></igc-icon>
    <igc-icon
      name="input_collapse"
      slot="suffix"
      onclick="editor.stepUp()"
    ></igc-icon>
    <igc-icon
      name="input_expand"
      slot="suffix"
      onclick="editor.stepDown()"
    ></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-time-input>`;
};

export const Basic: Story = Template.bind({});

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
        <fieldset disabled="disabled">
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
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-min"
            label="Minimum constraint (2023-03-17)"
            min="2023-03-17"
            value="2020-01-01"
          ></igc-date-time-input>
          <igc-date-time-input
            name="datetime-max"
            label="Maximum constraint (2023-04-17)"
            max="2023-04-17"
            value="2024-03-17"
          ></igc-date-time-input>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
