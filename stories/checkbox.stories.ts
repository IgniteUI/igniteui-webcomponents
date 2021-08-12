import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Checkbox',
  component: 'igc-checkbox',
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
      description: 'Determines whether the checkbox is checked.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    indeterminate: {
      control: 'boolean',
      description: 'Determines whether the checkbox is indeterminate.',
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
      description: 'Determines whether the checkbox is disabled.',
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
  indeterminate: boolean;
  disabled: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  { label, labelPosition, checked, indeterminate, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-checkbox
      label-position=${ifDefined(labelPosition)}
      .checked=${ifDefined(checked)}
      .indeterminate=${ifDefined(indeterminate)}
      .disabled=${ifDefined(disabled)}
      dir=${ifDefined(direction)}
    >
      ${label}
    </igc-checkbox>
  `;
};

export const Basic = Template.bind({});
