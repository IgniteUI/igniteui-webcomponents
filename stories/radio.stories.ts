import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
export default {
  title: 'Radio',
  component: 'igc-radio',
  argTypes: {
    label: { control: 'text', defaultValue: 'Label' },
    labelPosition: {
      options: ['before', 'after'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'after',
    },
    checked: {
      type: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      defaultValue: false,
    },
  },
};
interface ArgTypes {
  label: string;
  labelPosition: 'before' | 'after';
  checked: boolean;
  disabled: boolean;
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { label, labelPosition, checked, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-radio
    label-position="${ifDefined(labelPosition)}"
    .disabled="${disabled}"
    .checked="${checked}"
    dir=${ifDefined(direction)}
  >
    ${label}
  </igc-radio>
`;

export const Basic = Template.bind({});
