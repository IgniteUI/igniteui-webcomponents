import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcBadgeComponent,
  IgcTabsComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(IgcBadgeComponent, IgcTabsComponent);

// region default
const metadata: Meta<IgcBadgeComponent> = {
  title: 'Badge',
  component: 'igc-badge',
  parameters: {
    docs: {
      description: {
        component:
          'The badge is a component indicating a status on a related item or an area\nwhere some active indication is required.',
      },
    },
  },
  argTypes: {
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The type of badge.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'primary' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Sets whether to draw an outlined version of the badge.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    shape: {
      type: '"rounded" | "square"',
      description: 'The shape of the badge.',
      options: ['rounded', 'square'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'rounded' } },
    },
  },
  args: { variant: 'primary', outlined: false, shape: 'rounded' },
};

export default metadata;

interface IgcBadgeArgs {
  /** The type of badge. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Sets whether to draw an outlined version of the badge. */
  outlined: boolean;
  /** The shape of the badge. */
  shape: 'rounded' | 'square';
}
type Story = StoryObj<IgcBadgeArgs>;

// endregion

function renderTabs(args: IgcBadgeArgs) {
  return ['primary', 'info', 'success', 'warning', 'danger'].map(
    (variant, idx) => html`
      <igc-tab>
        <span>
          ${variant.toUpperCase()}
          <igc-badge
            variant=${variant as IgcBadgeArgs['variant']}
            ?outlined=${args.outlined}
            shape=${args.shape}
            >${idx + 1}</igc-badge
          >
        </span>
      </igc-tab>
    `
  );
}

export const Basic: Story = {
  render: ({ outlined, shape, variant }) => html`
    <igc-badge ?outlined=${outlined} shape=${shape} variant=${variant}>
      1
    </igc-badge>
  `,
};

export const Variants: Story = {
  render: (args) =>
    html` <style>
        igc-badge {
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      <igc-tabs>${renderTabs(args)}</igc-tabs>`,
};
