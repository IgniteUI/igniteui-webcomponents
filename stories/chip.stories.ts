import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcChipComponent, defineComponents } from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcChipComponent);

// region default
const metadata: Meta<IgcChipComponent> = {
  title: 'Chip',
  component: 'igc-chip',
  parameters: {
    docs: {
      description: {
        component:
          'Chips help people enter information, make selections, filter content, or trigger actions.',
      },
    },
    actions: { handles: ['igcRemove', 'igcSelect'] },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Sets the disabled state for the chip.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    removable: {
      type: 'boolean',
      description: 'Defines if the chip is removable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selectable: {
      type: 'boolean',
      description: 'Defines if the chip is selectable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selected: {
      type: 'boolean',
      description: 'Defines if the chip is selected or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description:
        'A property that sets the color variant of the chip component.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
    },
    locale: {
      type: 'string',
      description:
        'Gets/Sets the locale used for getting language, affecting resource strings.',
      control: 'text',
    },
  },
  args: {
    disabled: false,
    removable: false,
    selectable: false,
    selected: false,
  },
};

export default metadata;

interface IgcChipArgs {
  /** Sets the disabled state for the chip. */
  disabled: boolean;
  /** Defines if the chip is removable or not. */
  removable: boolean;
  /** Defines if the chip is selectable or not. */
  selectable: boolean;
  /** Defines if the chip is selected or not. */
  selected: boolean;
  /** A property that sets the color variant of the chip component. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Gets/Sets the locale used for getting language, affecting resource strings. */
  locale: string;
}
type Story = StoryObj<IgcChipArgs>;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic chip illustrating all available properties. Use the controls panel to explore the available properties interactively.',
      },
    },
  },
  render: ({
    disabled,
    removable,
    selectable,
    selected,
    variant,
  }: IgcChipArgs) => html`
    <igc-chip
      .disabled=${disabled}
      .removable=${removable}
      .selectable=${selectable}
      .selected=${selected}
      variant=${ifDefined(variant)}
    >
      <span slot="prefix">😱</span>
      Chip
      <span slot="suffix">👀</span>
    </igc-chip>
  `,
};

export const Variants: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `variant` property applies a semantic color to the chip. Available values are **primary**, **info**, **success**, **warning**, and **danger**. Omitting the property renders the chip in its default neutral style.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem;">
      <igc-chip>Default</igc-chip>
      <igc-chip variant="primary">Primary</igc-chip>
      <igc-chip variant="info">Info</igc-chip>
      <igc-chip variant="success">Success</igc-chip>
      <igc-chip variant="warning">Warning</igc-chip>
      <igc-chip variant="danger">Danger</igc-chip>
    </div>
  `,
};

export const Selectable: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `selectable` allows a chip to be toggled. The `igcSelect` event fires on each toggle. A common pattern is using selectable chips as filter tags — the example below tracks the active filters and updates a summary.',
      },
    },
  },
  render: () => {
    const filters = ['All', 'Music', 'Art', 'Sport', 'Food', 'Travel'];
    const selected = new Set<string>(['All']);

    const onSelect = (e: CustomEvent<boolean>) => {
      const chip = e.target as IgcChipComponent;
      const label = chip.textContent!.trim();
      if (e.detail) {
        selected.add(label);
      } else {
        selected.delete(label);
      }
      const summary = document.querySelector<HTMLElement>('#filter-summary')!;
      summary.textContent =
        selected.size === 0
          ? 'No filters active'
          : `Active filters: ${[...selected].join(', ')}`;
    };

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;"
      >
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${filters.map(
            (label) => html`
              <igc-chip
                selectable
                ?selected=${label === 'All'}
                @igcSelect=${onSelect}
              >
                ${label}
              </igc-chip>
            `
          )}
        </div>
        <p id="filter-summary" style="margin: 0; font-size: 0.875rem;">
          Active filters: All
        </p>
      </div>
    `;
  },
};

export const Removable: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `removable` renders a dismiss button on the chip. The `igcRemove` event fires when the button is clicked. The example below removes the chip from the DOM on dismissal.',
      },
    },
  },
  render: () => {
    const tags = ['Angular', 'React', 'Vue', 'Svelte', 'Lit'];

    const onRemove = (e: Event) => {
      (e.target as HTMLElement).remove();
    };

    return html`
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem;">
        ${tags.map(
          (tag) => html`
            <igc-chip removable @igcRemove=${onRemove}>${tag}</igc-chip>
          `
        )}
      </div>
    `;
  },
};

export const PrefixSuffix: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Chips support `prefix` and `suffix` slots for placing icons or decorative elements on either side of the label.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem;">
      <igc-chip>
        <span slot="prefix">📁</span>
        Prefix only
      </igc-chip>
      <igc-chip>
        Suffix only
        <span slot="suffix">🔖</span>
      </igc-chip>
      <igc-chip>
        <span slot="prefix">🎵</span>
        Both slots
        <span slot="suffix">▶</span>
      </igc-chip>
    </div>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Visual overview of chip states: default, selected, disabled, disabled+selected, removable, and selectable.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem;">
      <igc-chip>Default</igc-chip>
      <igc-chip selectable selected>Selected</igc-chip>
      <igc-chip disabled>Disabled</igc-chip>
      <igc-chip selectable selected disabled>Disabled &amp; Selected</igc-chip>
      <igc-chip removable>Removable</igc-chip>
      <igc-chip selectable>Selectable</igc-chip>
    </div>
  `,
};
