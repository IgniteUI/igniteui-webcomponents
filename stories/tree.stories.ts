import { html } from 'lit';
import { IgcTreeSelectionType } from '../src/components/tree/tree.common.js';
import IgcTreeComponent from '../src/components/tree/tree.js';
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
      type: IgcTreeSelectionType,
      description: 'Sets the selection mode of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: IgcTreeSelectionType.None,
    },
  },
};
export default metadata;
interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  selection: IgcTreeSelectionType;
}
// endregion

const handleEvent = (ev: any) => {
  console.log(ev);
};

const log = () => {
  const tree = document.getElementById('igc-tree-0') as IgcTreeComponent;
  console.log(tree);
};

const log1 = () => {
  const tree = document.getElementById('igc-tree-1') as IgcTreeComponent;
  console.log(tree);
};

const BasicTemplate: Story<ArgTypes, Context> = (
  { size, selection }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-tree
      .selection=${selection}
      .size=${size}
      dir=${direction}
      @IgcTreeNodeSelectionEvent=${handleEvent}
    >
      <igc-tree-node expanded>
        <p slot="header">Tree Node 1</p>
        <igc-tree-node slot="child">
          <p slot="header">Tree Node 1.1</p>
          <igc-tree-node slot="child">
            <p slot="header">Tree Node 1.1.1</p>
          </igc-tree-node>
          <igc-tree-node slot="child">
            <p slot="header">
              <a href="http://infragistics.com">Infragistics</a>
            </p>
          </igc-tree-node>
        </igc-tree-node>
        <igc-tree-node slot="child">
          <p slot="header">
            <a href="http://infragistics.com">Infragistics</a>
          </p>
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
    <button @click=${log}>ASD</button>
    <button @click=${log1}>ASD1</button>
    <igc-tree>
      <igc-tree-node>
        <p slot="header">Tree Node 4</p>
      </igc-tree-node>
    </igc-tree>
  `;
};

export const Basic = BasicTemplate.bind({});
