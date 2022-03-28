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
    locale: {
      type: 'string',
      control: 'text',
      defaultValue: 'e',
    },
    inputFormat: {
      type: 'string',
      control: 'text',
    },
    displayFormat: {
      type: 'string',
      control: 'text',
    },
    minValue: {
      type: 'string | Date',
      control: 'text',
    },
    maxValue: {
      type: 'string | Date',
      control: 'text',
    },
    tagName: {
      type: 'string',
      control: 'text',
      defaultValue: 'igc-date-input',
    },
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      description: 'The direction attribute of the control.',
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    withLiterals: {
      type: 'boolean',
      description:
        'When enabled, retrieving the value of the control will return it\nwith literal symbols applied.',
      control: 'boolean',
      defaultValue: false,
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
    value: {
      type: 'string',
      description:
        'The value of the input.\n\nIf `with-literals` is set, it will return the current value with the mask (literals and all) applied.',
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
  locale: string;
  inputFormat: string;
  displayFormat: string;
  minValue: string | Date;
  maxValue: string | Date;
  tagName: string;
  dir: 'ltr' | 'rtl' | 'auto';
  withLiterals: boolean;
  mask: string;
  prompt: string;
  value: string;
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
  input?.increment(DateParts.Hours);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-input'
  ) as IgcDateInputComponent;
  input?.decrement();
};

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange', 'igcInput'],
  },
};

const Template: Story<ArgTypes, Context> = (
  { value, inputFormat, prompt, placeholder, displayFormat, locale }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-date-input
    dir=${direction}
    value=${ifDefined(value)}
    inputFormat=${ifDefined(inputFormat)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    displayFormat=${ifDefined(displayFormat)}
    locale=${ifDefined(locale)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix" @click=${handleIncrement}></igc-icon>
    <igc-icon name="github" slot="suffix" @click=${handleDecrement}></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-input> `;
};

export const Basic = Template.bind({});
