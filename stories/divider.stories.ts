import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { IgcDividerComponent, defineComponents } from 'igniteui-webcomponents';
import { html } from 'lit';
import { disableStoryControls } from './story.js';

defineComponents(IgcDividerComponent);

// region default
const metadata: Meta<IgcDividerComponent> = {
  title: 'Divider',
  component: 'igc-divider',
  parameters: {
    docs: {
      description: {
        component:
          'The igc-divider allows the content author to easily create a horizontal/vertical rule as a break between content to better organize information on a page.',
      },
    },
  },
  argTypes: {
    vertical: {
      type: 'boolean',
      description: 'Whether to render a vertical divider line.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    middle: {
      type: 'boolean',
      description:
        'When set and inset is provided, it will shrink the divider line from both sides.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    type: {
      type: '"solid" | "dashed"',
      description: 'Whether to render a solid or a dashed divider line.',
      options: ['solid', 'dashed'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'solid' } },
    },
  },
  args: { vertical: false, middle: false, type: 'solid' },
};

export default metadata;

interface IgcDividerArgs {
  /** Whether to render a vertical divider line. */
  vertical: boolean;
  /** When set and inset is provided, it will shrink the divider line from both sides. */
  middle: boolean;
  /** Whether to render a solid or a dashed divider line. */
  type: 'solid' | 'dashed';
}
type Story = StoryObj<IgcDividerArgs>;

// endregion

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Basic horizontal divider separating content. Use the controls to switch between `solid` and `dashed` line types or enable the `middle` option (requires an `--inset` value to be visible).',
      },
    },
  },
  render: (args) => html`
    <p>First paragraph</p>
    <igc-divider ?middle=${args.middle} type=${args.type}></igc-divider>
    <p>Second paragraph</p>
  `,
};

export const Vertical: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A vertical divider placed inside a flex container to visually separate side-by-side content.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1rem; height: 200px">
      <p style="text-align: justify; flex: 1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium.
      </p>
      <igc-divider vertical></igc-divider>
      <p style="text-align: justify; flex: 1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium.
      </p>
    </div>
  `,
};

export const Dashed: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `dashed` line type for both horizontal and vertical orientations.',
      },
    },
  },
  render: () => html`
    <p>First paragraph</p>
    <igc-divider type="dashed"></igc-divider>
    <p>Second paragraph</p>

    <div style="display: flex; gap: 1rem; height: 200px; margin-top: 1rem">
      <p style="text-align: justify; flex: 1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium.
      </p>
      <igc-divider vertical type="dashed"></igc-divider>
      <p style="text-align: justify; flex: 1">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium.
      </p>
    </div>
  `,
};

export const MiddleInset: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `--inset` CSS custom property shrinks the divider from the leading side. When `middle` is also set the line is shrunk symmetrically from both sides.',
      },
    },
  },
  render: () => html`
    <p>Inset from start (100px)</p>
    <igc-divider style="--inset: 100px;"></igc-divider>

    <p>Inset from both sides — middle (100px)</p>
    <igc-divider middle style="--inset: 100px;"></igc-divider>
  `,
};
