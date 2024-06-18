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
    <igc-divider ?middle=${args.middle} type=${args.type}></igc-divider>
    <p>Second paragraph</p>
  `;
};

const VerticalDashedTemplate = ({ vertical, type, middle }: IgcDividerArgs) => {
  return html`
    <div style="display:flex; gap: 16px">
      <p style="text-align: justify">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium minima molestiae molestias nam
        obcaecati placeat provident, quam repellendus vitae! Cupiditate eveniet,
        facere harum hic quisquam sed.
      </p>
      <igc-divider vertical ?middle=${middle} type=${type}></igc-divider>
      <p style="text-align: justify">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa officiis
        suscipit veniam vitae. Ab ad, dolores iure nostrum quo ratione rerum
        sapiente ullam. Adipisci alias architecto eligendi est, expedita,
        explicabo fugiat iure laudantium minima molestiae molestias nam
        obcaecati placeat provident, quam repellendus vitae! Cupiditate eveniet,
        facere harum hic quisquam sed.
      </p>
    </div>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const VerticalDashed: Story = VerticalDashedTemplate.bind({});
