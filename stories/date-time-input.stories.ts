import { html } from 'lit';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  DatePartDeltas,
  DatePart,
} from '../src/components/date-time-input/date-util.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { defineComponents, IgcDateTimeInputComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

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
  },
  argTypes: {
    inputFormat: {
      type: 'string',
      description: 'The date format to apply on the input.',
      control: 'text',
    },
    minValue: {
      type: 'Date | null',
      description: 'The minimum value required for the input to remain valid.',
      control: 'date',
    },
    maxValue: {
      type: 'Date | null',
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
      defaultValue: true,
    },
    locale: {
      type: 'string',
      description: 'The locale settings used to display the value.',
      control: 'text',
      defaultValue: 'en',
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
    },
    value: {
      type: 'Date | null',
      description: 'The value of the input.',
      control: 'date',
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      defaultValue: false,
    },
    readonly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      defaultValue: false,
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
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in form context.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: {
    spinLoop: true,
    locale: 'en',
    outlined: false,
    readonly: false,
    required: false,
    disabled: false,
    invalid: false,
    size: 'medium',
  },
};

export default metadata;

interface IgcDateTimeInputArgs {
  /** The date format to apply on the input. */
  inputFormat: string;
  /** The minimum value required for the input to remain valid. */
  minValue: Date | null;
  /** The maximum value required for the input to remain valid. */
  maxValue: Date | null;
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
  /** The value of the input. */
  value: Date | null;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** Makes the control a readonly field. */
  readonly: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
  /** The name attribute of the control. */
  name: string;
  /** Makes the control a required field in form context. */
  required: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcDateTimeInputArgs>;

// endregion

registerIcon(
  'clear',
  'https://unpkg.com/material-design-icons@3.0.1/content/svg/production/ic_clear_24px.svg'
);

registerIcon(
  'up',
  'https://unpkg.com/material-design-icons@3.0.1/navigation/svg/production/ic_arrow_drop_up_24px.svg'
);

registerIcon(
  'down',
  'https://unpkg.com/material-design-icons@3.0.1/navigation/svg/production/ic_arrow_drop_down_24px.svg'
);

const handleIncrement = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input!.stepUp(DatePart.Date);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input!.stepDown();
};

const handleClear = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input!.clear();
};

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
});

const Template = (
  {
    inputFormat,
    prompt,
    readonly,
    disabled,
    required,
    outlined,
    placeholder,
    displayFormat,
    minValue,
    maxValue,
    size,
    locale,
    spinLoop,
    value,
    label,
    invalid,
  }: IgcDateTimeInputArgs,
  { globals: { direction } }: Context
) => {
  const spinDelta: DatePartDeltas = {
    date: 2,
    year: 10,
  };

  return html`<igc-date-time-input
    dir=${direction}
    size=${ifDefined(size)}
    label=${label}
    .value=${value ? new Date(value as Date) : null}
    .inputFormat=${inputFormat}
    .displayFormat=${displayFormat}
    .minValue=${minValue ? new Date(minValue as Date) : null}
    .maxValue=${maxValue ? new Date(maxValue as Date) : null}
    locale=${ifDefined(locale)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    ?spin-loop=${spinLoop}
    .readonly=${readonly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
    .spinDelta=${spinDelta}
    .invalid=${invalid}
  >
    <igc-icon name="clear" slot="prefix" @click=${handleClear}></igc-icon>
    <igc-icon name="up" slot="suffix" @click=${handleIncrement}></igc-icon>
    <igc-icon name="down" slot="suffix" @click=${handleDecrement}></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-time-input>`;
};

export const Basic: Story = Template.bind({});
