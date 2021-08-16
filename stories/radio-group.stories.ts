import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
export default {
  title: 'Radio Group',
  component: 'igc-radio-group',
  parameters: {
    actions: {
      handles: ['igcChange', 'igcFocus', 'igcBlur'],
    },
  },
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
// endregion

const Template: Story<ArgTypes, Context> = (
  { alignment, labelPosition, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const radios = ['apple', 'orange', 'mango', 'banana'];
  return html`
    <igc-radio-group
      dir="${ifDefined(direction)}"
      alignment="${ifDefined(alignment)}"
    >
      ${radios.map(
        (v) =>
          html`<igc-radio
            name="fruit"
            value=${v}
            .disabled=${disabled}
            label-position=${labelPosition}
            >${v.replace(/^\w/, (c) => c.toUpperCase())}</igc-radio
          > `
      )}
    </igc-radio-group>
  `;
};

export const Basic = Template.bind({});
