import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Radio',
  component: 'igc-radio',
  argTypes: {
    label: { control: 'text', defaultValue: 'Label' },
    labelPosition: {
      control: {
        type: 'inline-radio',
        options: ['before', 'after'],
      },
      defaultValue: 'after',
    },
    checked: {
      control: 'boolean',
      description: 'Determines whether the radio is disabled.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Determines whether the radio is disabled.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
};

interface ArgTypes {
  label: string;
  labelPosition: 'before' | 'after';
  checked: boolean;
  disabled: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

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
