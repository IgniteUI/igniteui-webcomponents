import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcTreeComponent,
  type IgcTreeItemComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

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
    locale: {
      type: 'string',
      description:
        'Gets/Sets the locale used for getting language, affecting resource strings.',
      control: 'text',
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
  /** Gets/Sets the locale used for getting language, affecting resource strings. */
  locale: string;
}
type Story = StoryObj<IgcTreeArgs>;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully interactive tree. Use the **Controls** panel to switch `selection`, enable `singleBranchExpand`, or turn on `toggleNodeOnClick`.',
      },
    },
  },
  render: ({ selection, singleBranchExpand, toggleNodeOnClick }) => html`
    <igc-tree
      .selection=${selection}
      .singleBranchExpand=${singleBranchExpand}
      ?toggle-node-on-click=${toggleNodeOnClick}
    >
      <igc-tree-item expanded label="Continents">
        <igc-tree-item expanded label="Europe">
          <igc-tree-item label="Germany"></igc-tree-item>
          <igc-tree-item label="France"></igc-tree-item>
          <igc-tree-item label="Spain"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item label="Asia">
          <igc-tree-item label="Japan"></igc-tree-item>
          <igc-tree-item label="China"></igc-tree-item>
          <igc-tree-item label="India"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item label="Americas">
          <igc-tree-item label="United States"></igc-tree-item>
          <igc-tree-item label="Canada"></igc-tree-item>
          <igc-tree-item label="Brazil"></igc-tree-item>
        </igc-tree-item>
      </igc-tree-item>
    </igc-tree>
  `,
};

export const Selection: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Compares the three `selection` modes side by side. `none` disables checkboxes entirely. `multiple` allows independently selecting any items. `cascade` propagates selection state up and down the hierarchy.',
      },
    },
  },
  render: () => html`
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;"
    >
      <div>
        <p><strong>none</strong></p>
        <igc-tree selection="none">
          <igc-tree-item expanded label="Root">
            <igc-tree-item label="Child 1"></igc-tree-item>
            <igc-tree-item label="Child 2">
              <igc-tree-item label="Grandchild 1"></igc-tree-item>
              <igc-tree-item label="Grandchild 2"></igc-tree-item>
            </igc-tree-item>
            <igc-tree-item label="Child 3"></igc-tree-item>
          </igc-tree-item>
        </igc-tree>
      </div>

      <div>
        <p><strong>multiple</strong></p>
        <igc-tree selection="multiple">
          <igc-tree-item expanded label="Root">
            <igc-tree-item selected label="Child 1"></igc-tree-item>
            <igc-tree-item label="Child 2">
              <igc-tree-item selected label="Grandchild 1"></igc-tree-item>
              <igc-tree-item label="Grandchild 2"></igc-tree-item>
            </igc-tree-item>
            <igc-tree-item label="Child 3"></igc-tree-item>
          </igc-tree-item>
        </igc-tree>
      </div>

      <div>
        <p><strong>cascade</strong></p>
        <igc-tree selection="cascade">
          <igc-tree-item expanded label="Root">
            <igc-tree-item selected label="Child 1"></igc-tree-item>
            <igc-tree-item expanded label="Child 2">
              <igc-tree-item label="Grandchild 1"></igc-tree-item>
              <igc-tree-item label="Grandchild 2"></igc-tree-item>
            </igc-tree-item>
            <igc-tree-item label="Child 3"></igc-tree-item>
          </igc-tree-item>
        </igc-tree>
      </div>
    </div>
  `,
};

export const DisabledItems: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Disabled items are skipped during keyboard navigation and cannot be activated, expanded, or selected by the user.',
      },
    },
  },
  render: () => html`
    <igc-tree selection="cascade">
      <igc-tree-item expanded label="Project">
        <igc-tree-item expanded label="Source">
          <igc-tree-item label="index.ts"></igc-tree-item>
          <igc-tree-item label="utils.ts" disabled></igc-tree-item>
          <igc-tree-item label="styles.ts"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item label="Tests" disabled>
          <igc-tree-item label="unit.spec.ts"></igc-tree-item>
          <igc-tree-item label="e2e.spec.ts"></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item label="package.json"></igc-tree-item>
      </igc-tree-item>
    </igc-tree>
  `,
};

export const LoadOnDemand: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates lazy/load-on-demand behavior. When a node is expanded, the `igcItemExpanding` event fires; the handler marks the item as `loading`, simulates an async fetch, then injects the fetched children and clears the loading state.',
      },
    },
  },
  render: () => {
    const loaded = new WeakSet<IgcTreeItemComponent>();

    const onExpanding = async (e: CustomEvent<IgcTreeItemComponent>) => {
      const item = e.detail;

      if (item.loading || loaded.has(item)) {
        return;
      }

      // Remove the placeholder that was keeping the expand indicator visible
      item.querySelector('igc-tree-item')?.remove();
      item.loading = true;

      await new Promise((r) => setTimeout(r, 1500));

      for (let i = 1; i <= 3; i++) {
        const child = document.createElement(
          'igc-tree-item'
        ) as IgcTreeItemComponent;
        child.label = `Dynamic Child ${i}`;
        item.appendChild(child);
      }

      item.loading = false;
      loaded.add(item);
    };

    return html`
      <igc-tree @igcItemExpanding=${onExpanding}>
        <igc-tree-item label="Click to expand and load">
          <!-- placeholder keeps the expand indicator visible before first load -->
          <igc-tree-item
            label="placeholder"
            style="display:none"
          ></igc-tree-item>
        </igc-tree-item>
        <igc-tree-item label="Click to expand and load">
          <igc-tree-item
            label="placeholder"
            style="display:none"
          ></igc-tree-item>
        </igc-tree-item>
      </igc-tree>
    `;
  },
};

export const CustomLabelSlot: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Any rich HTML can be projected into the `label` slot. This example uses anchor links for the leaf nodes and a badge-style counter on the parent.',
      },
    },
  },
  render: () => html`
    <igc-tree>
      <igc-tree-item expanded>
        <span
          slot="label"
          style="display: flex; align-items: center; gap: .5rem;"
        >
          Documentation
          <span
            style="
              background: var(--ig-primary-500);
              color: var(--ig-primary-500-contrast);
              border-radius: 9999px;
              padding: 0 .5rem;
              font-size: .75rem;
            "
            >3</span
          >
        </span>
        <igc-tree-item>
          <p slot="label" role="none">
            <a
              href="https://www.infragistics.com/products/ignite-ui-web-components"
              target="_blank"
            >
              Getting Started
            </a>
          </p>
        </igc-tree-item>
        <igc-tree-item>
          <p slot="label" role="none">
            <a
              href="https://www.infragistics.com/products/ignite-ui-web-components/web-components/components/tree"
              target="_blank"
            >
              Tree Docs
            </a>
          </p>
        </igc-tree-item>
        <igc-tree-item>
          <p slot="label" role="none">
            <a
              href="https://github.com/IgniteUI/igniteui-webcomponents"
              target="_blank"
            >
              GitHub Repository
            </a>
          </p>
        </igc-tree-item>
      </igc-tree-item>
    </igc-tree>
  `,
};
