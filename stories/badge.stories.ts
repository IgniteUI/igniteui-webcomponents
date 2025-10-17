import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcBadgeComponent,
  IgcIconComponent,
  IgcTabsComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(IgcBadgeComponent, IgcIconComponent, IgcTabsComponent);

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
      table: { defaultValue: { summary: 'false' } },
    },
    shape: {
      type: '"rounded" | "square"',
      description: 'The shape of the badge.',
      options: ['rounded', 'square'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'rounded' } },
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'The size of the badge.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'medium' } },
    },
    dot: {
      type: 'boolean',
      description:
        'Sets whether to render a dot badge (minimal badge without content).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    variant: 'primary',
    outlined: false,
    shape: 'rounded',
    dot: false,
  },
};

export default metadata;

interface IgcBadgeArgs {
  /** The type of badge. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Sets whether to draw an outlined version of the badge. */
  outlined: boolean;
  /** The shape of the badge. */
  shape: 'rounded' | 'square';
  /** Sets whether to render a dot badge (minimal badge without content). */
  dot: boolean;
}
type Story = StoryObj<IgcBadgeArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

function renderTabs(args: IgcBadgeArgs) {
  return ['primary', 'info', 'success', 'warning', 'danger'].map(
    (variant, idx) => html`
      <igc-tab>
        <span slot="label">
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
  render: ({ outlined, shape, variant, dot }) => html`
    <igc-badge
      ?outlined=${outlined}
      shape=${shape}
      variant=${variant}
      ?dot=${dot}
    >
      ${!dot ? html`<igc-icon name="home"></igc-icon>` : ''}
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

export const Sizes: Story = {
  render: () => html`
    <style>
      .badge-container {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
      }
      .badge-label {
        width: 100px;
        font-weight: 500;
      }
      .small-badge {
        --ig-size: 1;
      }
      .medium-badge {
        --ig-size: 2;
      }
      .large-badge {
        --ig-size: 3;
      }
    </style>
    <div class="badge-container">
      <span class="badge-label">Small:</span>
      <igc-badge class="small-badge">1</igc-badge>
      <igc-badge class="small-badge" variant="info">2</igc-badge>
      <igc-badge class="small-badge" variant="success">3</igc-badge>
    </div>
    <div class="badge-container">
      <span class="badge-label">Medium:</span>
      <igc-badge class="medium-badge">1</igc-badge>
      <igc-badge class="medium-badge" variant="info">2</igc-badge>
      <igc-badge class="medium-badge" variant="success">3</igc-badge>
    </div>
    <div class="badge-container">
      <span class="badge-label">Large:</span>
      <igc-badge class="large-badge">1</igc-badge>
      <igc-badge class="large-badge" variant="info">2</igc-badge>
      <igc-badge class="large-badge" variant="success">3</igc-badge>
    </div>
  `,
};

export const DotBadge: Story = {
  render: () => html`
    <style>
      .dot-container {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
      }
      .dot-label {
        width: 100px;
        font-weight: 500;
      }
    </style>
    <div class="dot-container">
      <span class="dot-label">Default:</span>
      <igc-badge dot></igc-badge>
      <igc-badge dot variant="info"></igc-badge>
      <igc-badge dot variant="success"></igc-badge>
      <igc-badge dot variant="warning"></igc-badge>
      <igc-badge dot variant="danger"></igc-badge>
    </div>
    <div class="dot-container">
      <span class="dot-label">Outlined:</span>
      <igc-badge dot outlined></igc-badge>
      <igc-badge dot outlined variant="info"></igc-badge>
      <igc-badge dot outlined variant="success"></igc-badge>
      <igc-badge dot outlined variant="warning"></igc-badge>
      <igc-badge dot outlined variant="danger"></igc-badge>
    </div>
  `,
};

export const OutlinedBadges: Story = {
  render: () => html`
    <style>
      .outlined-container {
        display: flex;
        gap: 20px;
        align-items: center;
        margin-bottom: 20px;
      }
    </style>
    <div class="outlined-container">
      <igc-badge outlined>Primary</igc-badge>
      <igc-badge outlined variant="info">Info</igc-badge>
      <igc-badge outlined variant="success">Success</igc-badge>
      <igc-badge outlined variant="warning">Warning</igc-badge>
      <igc-badge outlined variant="danger">Danger</igc-badge>
    </div>
  `,
};
