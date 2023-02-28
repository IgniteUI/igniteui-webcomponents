import { html } from 'lit';
import { Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcRadioGroupComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcRadioGroupComponent);

// region default
const metadata: Meta<IgcRadioGroupComponent> = {
  title: 'RadioGroup',
  component: 'igc-radio-group',
  parameters: { docs: { description: {} } },
  argTypes: {
    alignment: {
      type: '"vertical" | "horizontal"',
      description: 'Alignment of the radio controls inside this group.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      defaultValue: 'vertical',
    },
  },
  args: { alignment: 'vertical' },
};

export default metadata;

interface IgcRadioGroupArgs {
  /** Alignment of the radio controls inside this group. */
  alignment: 'vertical' | 'horizontal';
}
type Story = StoryObj<IgcRadioGroupArgs>;

// endregion

const Template = (
  { alignment }: IgcRadioGroupArgs,
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

export const Basic: Story = Template.bind({});
