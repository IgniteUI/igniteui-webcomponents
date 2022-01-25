import { html } from 'lit';
import IgcTreeItemComponent from '../src/components/tree/tree-item.js';
import { IgcSelectionEventArgs } from '../src/components/tree/tree.common.js';
import IgcTreeComponent from '../src/components/tree/tree.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Tree',
  component: 'igc-tree',
  argTypes: {
    singleBranchExpand: {
      type: 'boolean',
      description:
        "Whether a single or multiple of a parent's child items can be expanded.",
      control: 'boolean',
      defaultValue: false,
    },
    selection: {
      type: '"none" | "multiple" | "cascade"',
      description: 'The selection state of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'none',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  singleBranchExpand: boolean;
  selection: 'none' | 'multiple' | 'cascade';
  size: 'small' | 'medium' | 'large';
}
// endregion

const handleEvent = (ev: IgcSelectionEventArgs) => {
  // const treeItem = document.getElementById('asd1') as IgcTreeItemComponent;
  // const treeItem1 = document.getElementById('parent') as IgcTreeItemComponent;
  // if (ev.detail.newSelection.indexOf(treeItem1) >= 0) {
  //   const tree = document.getElementById('tree') as IgcTreeComponent;
  //   // requestAnimationFrame(() => {
  //   tree?.deselect([tree.items[tree.items.length - 1]]);

  //   // });
  // }
  // ev.detail.newSelection = [];
  console.log(ev);
};

const handleActive = (ev: any) => {
  console.log(ev);
};

const arr1 = [1, 2, 3];

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

const addChildren = (
  parent: IgcTreeItemComponent,
  count: number,
  selected = false
) => {
  for (let i = 0; i < count; i++) {
    const child = document.createElement('igc-tree-item');
    child.selected = selected;
    child.innerHTML = `<p slot="label">Added Child ${i}</p>`;
    parent.appendChild(child);
  }
};

const log = () => {
  const item = document.getElementById('parent2');
  item?.parentElement?.removeChild(item);
  const tree = document.getElementById('tree') as IgcTreeComponent;
  console.log(
    'Selected items: ',
    (tree.selectionService as any).itemSelection.size
  );
  console.log(
    'Indeterminate items: ',
    (tree.selectionService as any).indeterminateItems.size
  );
};

const log1 = () => {
  const item = document.getElementById('asd1') as IgcTreeItemComponent;
  const firstChild = item.getChildren()[0];
  if (firstChild) {
    item.removeChild(firstChild);
  }
  const tree = document.getElementById('tree') as IgcTreeComponent;
  console.log(
    'Selected items: ',
    (tree.selectionService as any).itemSelection.size
  );
  console.log(
    'Indeterminate items: ',
    (tree.selectionService as any).indeterminateItems.size
  );
};

const log2 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  addChildren(item, 2, true);
  const tree = document.getElementById('tree') as IgcTreeComponent;
  console.log(
    'Selected items: ',
    (tree.selectionService as any).itemSelection.size
  );
  console.log(
    'Indeterminate items: ',
    (tree.selectionService as any).indeterminateItems.size
  );
};

const log3 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  addChildren(item, 2);
  const tree = document.getElementById('tree') as IgcTreeComponent;
  console.log(
    'Selected items: ',
    (tree.selectionService as any).itemSelection.size
  );
  console.log(
    'Indeterminate items: ',
    (tree.selectionService as any).indeterminateItems.size
  );
};

const log4 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  const item1 = document.getElementById('asd1') as IgcTreeItemComponent;
  item1.parentNode?.removeChild(item1);
  item.appendChild(item1);
  const tree = document.getElementById('tree') as IgcTreeComponent;
  console.log(
    'Selected items: ',
    (tree.selectionService as any).itemSelection.size
  );
  console.log(
    'Indeterminate items: ',
    (tree.selectionService as any).indeterminateItems.size
  );
};

const BasicTemplate: Story<ArgTypes, Context> = (
  { size, singleBranchExpand, selection }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="height: 250px;">
      <igc-tree
        id="tree"
        .size=${size}
        .selection=${selection}
        .singleBranchExpand=${singleBranchExpand}
        dir=${direction}
        @igcSelection=${handleEvent}
        @igcActiveItem=${handleActive}
        @igcItemExpanding=${handleExpanding}
        @igcItemExpanded=${handleExpanded}
        @igcItemCollapsing=${handleCollapsing}
        @igcItemCollapsed=${handleCollapsed}
      >
        <igc-tree-item expanded active selected label="Tree Node 1">
          <igc-tree-item expanded id="parent" label="Tree Node 1.1">
            <igc-tree-item label="Tree Node 1.1.1"></igc-tree-item>
            <igc-tree-item id="asd" label="Tree Node 1.1.2">
              ${arr1.map(
                (i) => html`
                  <igc-tree-item .label="Tree Node 1.1.2.${i}"></igc-tree-item>
                `
              )}
            </igc-tree-item>
            <igc-tree-item #asd>
              <p slot="label">
                <a href="http://infragistics.com">Infragistics</a>
              </p>
            </igc-tree-item>
          </igc-tree-item>
          <igc-tree-item id="parent2">
            <p slot="label">
              <span>
                <input />
                <button>asd</button>
              </span>
            </p>
            <igc-tree-item label="I'm a child"></igc-tree-item>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item expanded id="asd1" label="Tree Node 2">
          <igc-tree-item selected active label="Tree Node 2.1"></igc-tree-item>
          <igc-tree-item id="asd" label="Tree Node 2.2"></igc-tree-item>
          <igc-tree-item selected label="Tree Node 2.3"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item selected label="Tree Node 3"></igc-tree-item>
      </igc-tree>
    </div>
    <button @click=${log}>Delete parent</button>
    <button @click=${log1}>Delete first child</button>
    <button @click=${log2}>Add new selected children for normal</button>
    <button @click=${log3}>Add new deselected children for normal</button>
    <button @click=${log4}>Move item</button>
    <igc-tree>
      <igc-tree-item>
        <p slot="label">Tree Node 4</p>
      </igc-tree-item>
    </igc-tree>
  `;
};

export const Basic = BasicTemplate.bind({});
