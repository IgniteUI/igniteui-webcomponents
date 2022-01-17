import { html } from 'lit';
import IgcTreeItemComponent from '../src/components/tree/tree-item.js';
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

const handleEvent = (ev: any) => {
  console.log(ev);
};

const arr: any[] = [];
const arr1 = [1, 2, 3];

const handleExpanding = (ev: any) => {
  console.log(ev);
};
const handleExpanded = (ev: any) => {
  const item = ev.detail;
  if (item.loadOnDemand) {
    item.loading = true;
    setTimeout(() => {
      addChildren(item, 2);
      item.loading = false;

      item.loadOnDemand = false;
      const tree = document.getElementById('tree') as IgcTreeComponent;
      console.log(
        'Selected items: ',
        (tree.selectionService as any).itemSelection.size
      );
      console.log(
        'Indeterminate items: ',
        (tree.selectionService as any).indeterminateItems.size
      );
    }, 1500);
  }
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
    child.innerHTML = `<p slot="header">Added Child ${i}</p>`;
    parent.appendChild(child);
  }
};

const log = () => {
  const item = document.getElementById('parent');
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
  const firstChild = item.getChildren(true)[0];
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

const log10 = () => {
  const item = document.getElementById('loadOnDemand') as IgcTreeItemComponent;
  const firstChild = item.getChildren(true)[0];
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
        @igcTreeItemSelectionEvent=${handleEvent}
        @igcItemExpanding=${handleExpanding}
        @igcItemExpanded=${handleExpanded}
        @igcItemCollapsing=${handleCollapsing}
        @igcItemCollapsed=${handleCollapsed}
      >
        <igc-tree-item expanded active selected>
          <p slot="header">Tree Node 1</p>
          <igc-tree-item expanded id="parent">
            <p slot="header">Tree Node 1.1</p>
            <igc-tree-item id="loadOnDemand" loadOnDemand>
              <p slot="header">Tree Node 1.1.1</p>
              ${arr.map(
                (i) => html`
                  <igc-tree-item>
                    <p slot="header">Tree Node 1.1.1.${i}</p>
                  </igc-tree-item>
                `
              )}
            </igc-tree-item>
            <igc-tree-item id="asd">
              <p slot="header">Tree Node 1.1.2</p>
              ${arr1.map(
                (i) => html`
                  <igc-tree-item>
                    <p slot="header">Tree Node 1.1.2.${i}</p>
                  </igc-tree-item>
                `
              )}
            </igc-tree-item>
            <igc-tree-item #asd>
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
        <igc-tree-item expanded id="asd1">
          <p slot="header">Tree Node 2</p>
          <igc-tree-item selected>
            <p slot="header">Tree Node 2.1</p>
          </igc-tree-item>
          <igc-tree-item id="asd">
            <p slot="header">Tree Node 2.2</p>
          </igc-tree-item>

          <igc-tree-item selected>
            <p slot="header">Tree Node 2.3</p>
          </igc-tree-item>
        </igc-tree-item>
        <igc-tree-item selected>
          <p slot="header">Tree Node 3</p>
        </igc-tree-item>
      </igc-tree>
    </div>
    <button @click=${log}>Delete parent</button>
    <button @click=${log1}>Delete first child</button>
    <button @click=${log10}>Delete first load on demand child</button>
    <button @click=${log2}>Add new selected children for normal</button>
    <button @click=${log3}>Add new deselected children for normal</button>
    <button @click=${log4}>Move item</button>
    <!-- <igc-tree>
      <igc-tree-item>
        <p slot="header">Tree Node 4</p>
      </igc-tree-item>
    </igc-tree> -->
  `;
};

export const Basic = BasicTemplate.bind({});
