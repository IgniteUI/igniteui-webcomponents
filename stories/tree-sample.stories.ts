import { html } from 'lit';
import { Context, Story } from './story';

// region default
const metadata = {
  title: 'Tree Sample',
  component: 'igc-tree-sample',
  argTypes: {
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
};
export default metadata;
interface ArgTypes {
  size: 'small' | 'medium' | 'large';
}
// endregion

const BasicTemplate: Story<ArgTypes, Context> = (
  { size }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html` <igc-tree-sample></igc-tree-sample> ${size} ${direction}`;
};

export const Basic = BasicTemplate.bind({});
