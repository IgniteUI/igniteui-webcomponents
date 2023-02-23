import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcRadioGroupComponent } from '../src/index.js';

defineComponents(IgcRadioGroupComponent);

// region default
const metadata: Meta = {
  title: 'Radio Group',
  component: 'igc-radio-group',
  argTypes: {
    alignment: {
      type: '"vertical" | "horizontal"',
      description: 'Alignment of the radio controls inside this group.',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'vertical',
    },
  },
  args: {
    alignment: 'vertical',
  },
};
export default metadata;

// endregion

const Template: Story<ArgTypes, Context> = (
  { alignment }: ArgTypes,
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
          html`<igc-radio name="fruit" value=${v}
            >${v.replace(/^\w/, (c) => c.toUpperCase())}</igc-radio
          > `
      )}
    </igc-radio-group>
  `;
};

export const Basic = Template.bind({});
