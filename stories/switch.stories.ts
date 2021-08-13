import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Switch',
  component: 'igc-switch',
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
      description: 'Determines whether the switch is checked.',
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
      description: 'Determines whether the switch is disabled.',
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

const Template: Story<ArgTypes, Context> = (
  { label, labelPosition, checked, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-switch
      label-position=${ifDefined(labelPosition)}
      .checked=${ifDefined(checked)}
      .disabled=${ifDefined(disabled)}
      dir=${ifDefined(direction)}
    >
      ${label}
    </igc-switch>
  `;
};

export const Basic = Template.bind({});
