import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// region default
const metadata = {
  title: 'Masked Input',
  component: 'igc-masked-input',
  argTypes: {
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      description: 'The direction attribute of the control.',
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    name: {
      type: 'string',
      control: 'text',
    },
    readonly: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    outlined: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    withLiterals: {
      type: 'boolean',
      description:
        'When enabled, retrieving the value of the control will return it\nwith literal symbols applied.',
      control: 'boolean',
      defaultValue: false,
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'The value of the input.\n\nIf `with-literals` is set, it will return the current value with the mask (literals and all) applied.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'Placeholder for the input.',
      control: 'text',
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
  dir: 'ltr' | 'rtl' | 'auto';
  name: string;
  readonly: boolean;
  disabled: boolean;
  required: boolean;
  outlined: boolean;
  withLiterals: boolean;
  label: string;
  value: string;
  placeholder: string;
  mask: string;
  prompt: string;
  size: 'small' | 'medium' | 'large';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  {
    name,
    readonly,
    disabled,
    required,
    outlined,
    withLiterals,
    label,
    value,
    placeholder,
    mask,
    prompt,
    size,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-masked-input
      dir=${direction}
      name=${ifDefined(name)}
      placeholder=${ifDefined(placeholder)}
      value=${ifDefined(value)}
      mask=${ifDefined(mask)}
      prompt=${ifDefined(prompt)}
      label=${ifDefined(label)}
      size=${ifDefined(size)}
      ?with-literals=${ifDefined(withLiterals)}
      ?readonly=${ifDefined(readonly)}
      ?outlined=${ifDefined(outlined)}
      ?required=${ifDefined(required)}
      ?disabled=${ifDefined(disabled)}
    >
      <igc-icon name="github" slot="prefix"></igc-icon>
      <igc-icon name="github" slot="suffix"></igc-icon>
      <span slot="helper-text">This is some helper text</span>
    </igc-masked-input>
    <igc-input></igc-input> `;
};

export const Basic = Template.bind({});
