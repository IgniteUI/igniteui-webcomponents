import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { DatePartDeltas } from './../src/components/date-input/date-input';
import { DateParts } from '../src/components/date-input/date-util.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { IgcDateInputComponent } from '../src/index.js';

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
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
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
  invalid: boolean;
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
    'igc-date-input'
  ) as IgcDateInputComponent;
  input!.stepUp(DateParts.Date);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-input'
  ) as IgcDateInputComponent;
  input?.stepDown();
};

const handleClear = () => {
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
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const spinDelta: DatePartDeltas = {
    date: 2,
    year: 10,
  };

  return html`<igc-date-input
    dir=${direction}
    size=${size}
    .value=${value ? new Date(value as Date) : null}
    min-value=${ifDefined(minValue)}
    max-value=${ifDefined(maxValue)}
    locale=${ifDefined(locale)}
    inputFormat=${ifDefined(inputFormat)}
    displayFormat=${ifDefined(displayFormat)}
    prompt=${ifDefined(prompt)}
    placeholder=${ifDefined(placeholder)}
    ?spin-loop=${spinLoop}
    .readonly=${readonly}
    .outlined=${outlined}
    .required=${required}
    .disabled=${disabled}
    .spinDelta=${spinDelta}
  >
    <igc-icon name="clear" slot="prefix" @click=${handleClear}></igc-icon>
    <igc-icon name="up" slot="suffix" @click=${handleIncrement}></igc-icon>
    <igc-icon name="down" slot="suffix" @click=${handleDecrement}></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-date-input>`;
};

export const Basic = Template.bind({});
