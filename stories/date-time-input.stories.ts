import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  DatePartDeltas,
  DatePart,
} from '../src/components/date-time-input/date-util.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { IgcDateTimeInputComponent } from '../src/index.js';

// region default
const metadata = {
  title: 'Date Time Input',
  component: 'igc-date-time-input',
  argTypes: {
    inputFormat: {
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
    displayFormat: {
      type: 'string',
      control: 'text',
    },
    spinLoop: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
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
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      description: 'The direction attribute of the control.',
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    value: {
      type: 'Date | null',
      description: 'The value attribute of the control.',
      control: 'date',
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
  minValue: string | Date;
  maxValue: string | Date;
  displayFormat: string;
  spinLoop: boolean;
  locale: string;
  mask: string;
  prompt: string;
  dir: 'ltr' | 'rtl' | 'auto';
  invalid: boolean;
  value: Date | null;
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
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input!.stepUp(DatePart.Date);
};

const handleDecrement = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
  input?.stepDown();
};

const handleClear = () => {
  const input = document.querySelector(
    'igc-date-time-input'
  ) as IgcDateTimeInputComponent;
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
    label,
  }: ArgTypes,
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
    min-value=${ifDefined(minValue)}
    max-value=${ifDefined(maxValue)}
    locale=${ifDefined(locale)}
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
  </igc-date-time-input>`;
};

export const Basic = Template.bind({});
