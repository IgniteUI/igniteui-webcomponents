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
          'The igc-divider allows the content author to easily create a horizontal/vertical rule as a break between content to better organize information on a page.',
      },
    },
  },
  argTypes: {
    vertical: {
      type: 'boolean',
      description: 'Whether to render a vertical divider line.',
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

const BasicTemplate = (args: IgcDividerArgs) => {
  return html`
    <p>First paragraph</p>
    <igc-divider ?middle=${args.middle} type=${args.type}></igc-divider>
    <p>Second paragraph</p>
  `;
};

const VerticalDashedTemplate = (args: IgcDividerArgs) => {
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
      <igc-divider vertical ?middle=${args.middle} type="dashed"></igc-divider>
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

const MiddleInsetTemplate = (args: IgcDividerArgs) => {
  return html`
    <p>First paragraph</p>
    <igc-divider
      ?middle=${args.middle}
      type=${args.type}
      style="--inset: 100px;"
    ></igc-divider>
    <p>Second paragraph</p>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const VerticalDashed: Story = VerticalDashedTemplate.bind({});
export const MiddleInset: Story = MiddleInsetTemplate.bind({});
