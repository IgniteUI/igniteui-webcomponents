import { html } from 'lit-html';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Radio',
  component: 'igc-radio',
  argTypes: {
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the radio control.',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Controls the validity of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    labelPosition: {
      type: '"before" | "after"',
      description: 'The label position of the radio control.',
      options: ['before', 'after'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'after',
    },
    ariaLabelledby: {
      type: 'string',
      description: 'Sets the aria-labelledby attribute for the radio control.',
      control: 'text',
    },
  },
};
export default metadata;
interface ArgTypes {
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  invalid: boolean;
  labelPosition: 'before' | 'after';
  ariaLabelledby: string;
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { labelPosition, checked, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-radio
    label-position="${ifDefined(labelPosition)}"
    .disabled="${disabled}"
    .checked="${checked}"
    dir=${ifDefined(direction)}
  >
    Label
  </igc-radio>
`;

export const Basic = Template.bind({});
