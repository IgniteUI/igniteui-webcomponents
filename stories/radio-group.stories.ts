import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Radio Group',
  component: 'igc-radio-group',
  argTypes: {
    labelPosition: {
      control: {
        type: 'inline-radio',
        options: ['before', 'after'],
      },
      defaultValue: 'after',
    },
    alignment: {
      control: {
        type: 'inline-radio',
        options: ['vertical', 'horizontal'],
      },
      defaultValue: 'vertical',
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
  alignment: 'vertical' | 'horizontal';
  labelPosition: 'before' | 'after';
  disabled: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  { alignment, labelPosition, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-radio-group
    alignment="${ifDefined(alignment)}"
    label-position="${ifDefined(labelPosition)}"
    .disabled="${ifDefined(disabled)}"
    dir=${ifDefined(direction)}
  >
    <igc-radio name="fruit" value="apple" checked>Apple</igc-radio>
    <igc-radio name="fruit" value="orange">Orange</igc-radio>
    <igc-radio name="fruit" value="mango">Mango</igc-radio>
    <igc-radio name="fruit" value="banana" disabled>Banana</igc-radio>
  </igc-radio>
`;

export const Basic = Template.bind({});
