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
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
    withLiterals: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    label: {
      type: 'string',
      control: 'text',
    },
    value: {
      type: 'string',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      control: 'text',
    },
    mask: {
      type: 'string',
      control: 'text',
    },
    prompt: {
      type: 'string',
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
  { value, mask, placeholder, prompt, withLiterals, label, size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`<igc-masked-input
    dir=${direction}
    placeholder=${ifDefined(placeholder)}
    value=${ifDefined(value)}
    mask=${ifDefined(mask)}
    prompt=${ifDefined(prompt)}
    label=${ifDefined(label)}
    size=${ifDefined(size)}
    ?with-literals=${ifDefined(withLiterals)}
  >
    <igc-icon name="github" slot="prefix"></igc-icon>
    <igc-icon name="github" slot="suffix"></igc-icon>
    <span slot="helper-text">This is some helper text</span>
  </igc-masked-input>`;
};

export const Basic = Template.bind({});
