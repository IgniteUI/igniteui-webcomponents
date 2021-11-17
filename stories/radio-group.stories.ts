import { html } from 'lit-html';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Radio Group',
  component: 'igc-radio-group',
  argTypes: {
    alignment: {
      type: '"vertical" | "horizontal"',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'vertical',
    },
  },
};
export default metadata;
interface ArgTypes {
  alignment: 'vertical' | 'horizontal';
}
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
