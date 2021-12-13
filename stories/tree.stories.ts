import { html } from 'lit';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Tree',
  component: 'igc-tree',
  argTypes: {
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
    selection: {
      type: '"none" | "multiple" | "cascade"',
      description: 'Sets the selection mode of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'None',
    },
  },
};
export default metadata;
interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  selection: 'none' | 'multiple' | 'cascade';
}
// endregion

const BasicTemplate: Story<ArgTypes, Context> = (
  { size, selection }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-tree .selection=${selection} .size=${size} dir=${direction}>
      <igc-tree-node expanded>
        <p slot="header">Tree Node 1</p>
        <igc-tree-node slot="child">
          <p slot="header">Tree Node 1.1</p>
          <igc-tree-node slot="child">
            <p slot="header">Tree Node 1.1.1</p>
          </igc-tree-node>
        </igc-tree-node>
        <igc-tree-node slot="child">
          <p slot="header">Tree Node 1.2</p>
        </igc-tree-node>
      </igc-tree-node>
      <igc-tree-node>
        <p slot="header">Tree Node 2</p>
        <igc-tree-node slot="child">
          <p slot="header">Tree Node 2.1</p>
        </igc-tree-node>
        <igc-tree-node slot="child">
          <p slot="header">Tree Node 2.2</p>
        </igc-tree-node>
      </igc-tree-node>
      <igc-tree-node>
        <p slot="header">Tree Node 3</p>
      </igc-tree-node>
    </igc-tree>
  `;
};

export const Basic = BasicTemplate.bind({});
