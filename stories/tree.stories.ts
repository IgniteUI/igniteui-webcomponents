import { html } from 'lit';
import { arrayOf } from '../src/components/common/util.js';
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
    singleBranchExpand: {
      type: Boolean,
      description: 'Enable/Disable singleBranchExpand',
      control: 'boolean',
      defaultValue: false,
    },
    selection: {
      type: IgcTreeSelectionType,
      description: 'Sets the selection mode of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: IgcTreeSelectionType.Cascade,
    },
  },
};
export default metadata;
interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  singleBranchExpand: Boolean;
  selection: IgcTreeSelectionType;
}
// endregion

const handleEvent = (ev: any) => {
  console.log(ev);
};

const handleExpanding = (ev: any) => {
  console.log(ev);
};
const handleExpanded = (ev: any) => {
  console.log(ev);
};
const handleCollapsing = (ev: any) => {
  console.log(ev);
};
const handleCollapsed = (ev: any) => {
  console.log(ev);
};

const log = () => {
  const tree = document.getElementById('igc-tree-0') as IgcTreeComponent;
  const item = document.getElementById('asd');
  item?.parentElement?.removeChild(item);
  console.log((tree.selectionService as any).itemSelection);
};

const log1 = () => {
  const tree = document.getElementById('igc-tree-1') as IgcTreeComponent;
  console.log(tree);
};

const BasicTemplate: Story<ArgTypes, Context> = (
  { size, singleBranchExpand, selection }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="height: 200px;">
      <igc-tree
        .selection=${selection}
        .size=${size}
        .singleBranchExpand=${singleBranchExpand}
        dir=${direction}
        @igcTreeItemSelectionEvent=${handleEvent}
        @igcItemExpanding=${handleExpanding}
        @igcItemExpanded=${handleExpanded}
        @igcItemCollapsing=${handleCollapsing}
        @igcItemCollapsed=${handleCollapsed}
      >
        <igc-tree-item expanded active selected>
          <p slot="header">Tree Node 1</p>
          <igc-tree-item expanded>
            <p slot="header">Tree Node 1.1</p>
            ${arrayOf(1).map(
              (i, index) => html`
                <igc-tree-item #map expanded>
                  <p slot="header">Tree Node 1.1.${index}</p>
                  ${arrayOf(10).map(
                    (_i, index) => html`
                      <igc-tree-item #map>
                        <p slot="header">Tree Node 1.1.1.${index}</p>
                      </igc-tree-item>
                    `
                  )}
                </igc-tree-item>
              `
            )}
            <igc-tree-item>
              <p slot="header">Tree Node 1.1.1</p>
            </igc-tree-item>
            <igc-tree-item>
              <p slot="header">
                <a href="http://infragistics.com">Infragistics</a>
              </p>
            </igc-tree-item>
          </igc-tree-item>
          <igc-tree-item>
            <p slot="header">
              <a href="http://infragistics.com">Infragistics</a>
            </p>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item>
          <p slot="header">Tree Node 2</p>
          <igc-tree-item id="asd" active selected>
            <p slot="header">Tree Node 2.1</p>
          </igc-tree-item>
          <igc-tree-item>
            <p slot="header">Tree Node 2.2</p>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item>
          <p slot="header">Tree Node 3</p>
        </igc-tree-item>
      </igc-tree>
    </div>
    <button @click=${log}>ASD</button>
    <button @click=${log1}>ASD1</button>
    <!-- <igc-tree>
      <igc-tree-item>
        <p slot="header">Tree Node 4</p>
      </igc-tree-item>
    </igc-tree> -->
  `;
};

export const Basic = BasicTemplate.bind({});
