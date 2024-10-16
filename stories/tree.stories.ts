import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcTreeComponent,
  type IgcTreeItemComponent,
  defineComponents,
} from 'igniteui-webcomponents';

defineComponents(IgcTreeComponent);

// region default
const metadata: Meta<IgcTreeComponent> = {
  title: 'Tree',
  component: 'igc-tree',
  parameters: {
    docs: {
      description: {
        component:
          'The tree allows users to represent hierarchical data in a tree-view structure,\nmaintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.',
      },
    },
    actions: {
      handles: [
        'igcSelection',
        'igcItemCollapsed',
        'igcItemCollapsing',
        'igcItemExpanded',
        'igcItemExpanding',
        'igcActiveItem',
      ],
    },
  },
  argTypes: {
    singleBranchExpand: {
      type: 'boolean',
      description:
        "Whether a single or multiple of a parent's child items can be expanded.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    toggleNodeOnClick: {
      type: 'boolean',
      description:
        'Whether clicking over nodes will change their expanded state or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selection: {
      type: '"none" | "multiple" | "cascade"',
      description: 'The selection state of the tree.',
      options: ['none', 'multiple', 'cascade'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
  },
  args: {
    singleBranchExpand: false,
    toggleNodeOnClick: false,
    selection: 'none',
  },
};

export default metadata;

interface IgcTreeArgs {
  /** Whether a single or multiple of a parent's child items can be expanded. */
  singleBranchExpand: boolean;
  /** Whether clicking over nodes will change their expanded state or not. */
  toggleNodeOnClick: boolean;
  /** The selection state of the tree. */
  selection: 'none' | 'multiple' | 'cascade';
}
type Story = StoryObj<IgcTreeArgs>;

// endregion

const arr1 = [1, 2, 3];

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
};

const log1 = () => {
  const item = document.getElementById('asd1') as IgcTreeItemComponent;
  const firstChild = item.getChildren()[0];
  if (firstChild) {
    item.removeChild(firstChild);
  }
};

const log2 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  addChildren(item, 2, true);
};

const log3 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  addChildren(item, 2);
};

const log4 = () => {
  const item = document.getElementById('asd') as IgcTreeItemComponent;
  const item1 = document.getElementById('asd1') as IgcTreeItemComponent;
  item1.parentNode?.removeChild(item1);
  item.appendChild(item1);
};

const BasicTemplate = ({
  singleBranchExpand,
  selection,
  toggleNodeOnClick,
}: IgcTreeArgs) => {
  return html`
      <igc-tree style="height: 250px"
        id="tree"
        .selection=${selection}
        .singleBranchExpand=${singleBranchExpand}
        ?toggle-node-on-click = ${toggleNodeOnClick}
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
              <p slot="label" role="none">
                <a href="http://infragistics.com">Infragistics</a>
              </p>
            </igc-tree-item>
          </igc-tree-item>
          <igc-tree-item id="parent2">
            <p slot="label" role="none">
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

export const Basic: Story = BasicTemplate.bind({});
