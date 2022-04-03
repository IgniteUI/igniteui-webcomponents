import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import IgcDateInputComponent from './../src/components/date-input/date-input';
import { DateParts } from '../src/components/date-input/date-util.js';

// region default
const metadata = {
  title: 'Date Input',
  component: 'igc-date-input',
  argTypes: {
    inputFormat: {
      type: 'string',
      control: 'text',
    },
    value: {
      type: 'Date | null',
      control: 'date',
    },
    minValue: {
      type: 'string | Date',
      control: 'text',
    },
    maxValue: {
      type: 'string | Date',
      control: 'text',
    },
    displayFormat: {
      type: 'string',
      control: 'text',
    },
    spinLoop: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
    },
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    locale: {
      type: 'string',
      control: 'text',
      defaultValue: 'e',
    },
    mask: {
      type: 'string',
      description: 'The mask pattern to apply on the input.',
      control: 'text',
    },
    prompt: {
      type: 'string',
      description: 'The prompt symbol to use for unfilled parts of the mask.',
      control: 'text',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Makes the control a disabled field.',
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
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
};
export default metadata;
interface ArgTypes {
  inputFormat: string;
  value: Date | null;
  minValue: string | Date;
  maxValue: string | Date;
  displayFormat: string;
  spinLoop: boolean;
  dir: 'ltr' | 'rtl' | 'auto';
  locale: string;
  mask: string;
  prompt: string;
  name: string;
  outlined: boolean;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  placeholder: string;
  label: string;
  size: 'small' | 'medium' | 'large';
}
// endregion

const handleIncrement = () => {
  const input = document.querySelector(
    'igc-date-input'
  ) as IgcDateInputComponent;
  input?.stepUp(DateParts.Date);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-input'
  ) as IgcDateInputComponent;
  input?.clear();
};

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

const Template: Story<ArgTypes, Context> = (
  {
    inputFormat,
    prompt,
    placeholder,
    displayFormat,
    locale,
    spinLoop,
    value,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-date-input
    dir=${direction}
    .value=${value ? new Date(value as Date) : undefined}
    inputFormat=${ifDefined(inputFormat)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    displayFormat=${ifDefined(displayFormat)}
    locale=${ifDefined(locale)}
    ?spin-loop=${ifDefined(spinLoop)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix" @click=${handleIncrement}></igc-icon>
    <igc-icon name="github" slot="suffix" @click=${handleDecrement}></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-input> `;
};

export const Basic = Template.bind({});
