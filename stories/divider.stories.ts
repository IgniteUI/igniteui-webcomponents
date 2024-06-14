import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import {
  IgcButtonComponent,
  IgcDividerComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(IgcDividerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcDividerComponent> = {
  title: 'Divider',
  component: 'igc-divider',
  parameters: {
    docs: {
      description: {
        component:
          'Enum for the type, determining if the divider is solid or dashed.',
      },
    },
  },
  argTypes: {
    vertical: {
      type: 'boolean',
      description: 'Determines Whether to render a vertical divider line.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    middle: {
      type: 'boolean',
      description:
        'When set and inset is provided, it will shrink the divider line from both sides.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    type: {
      type: '"solid" | "dashed"',
      description:
        'Determines whether to render a solid or a dashed divider line.',
      options: ['solid', 'dashed'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'solid' } },
    },
  },
  args: { vertical: false, middle: false, type: 'solid' },
};

export default metadata;

interface IgcDividerArgs {
  /** Determines Whether to render a vertical divider line. */
  vertical: boolean;
  /** When set and inset is provided, it will shrink the divider line from both sides. */
  middle: boolean;
  /** Determines whether to render a solid or a dashed divider line. */
  type: 'solid' | 'dashed';
}
type Story = StoryObj<IgcDividerArgs>;

// endregion

const BasicTemplate = (args: IgcDividerArgs) => {
  return html`
    <p>First paragraph</p>
    <igc-divider></igc-divider>
    <p>Second paragraph</p>
  `;
};

const VerticalDashedTemplate = ({ vertical, type }: IgcDividerArgs) => {
  return html`
    <div>
      <igc-button>Save</igc-button>
      <igc-divider vertical type="dashed"></igc-divider>
      <igc-button>Cancel</igc-button>
    </div>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const VerticalDashed: Story = VerticalDashedTemplate.bind({});
