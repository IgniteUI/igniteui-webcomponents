import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcTabsComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcTabsComponent
);

registerMaterialIcons(
  'done',
  'mail',
  'notifications',
  'shopping-cart',
  'update'
);

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
      type: {
        name: 'enum',
        value: ['primary', 'info', 'success', 'warning', 'danger'],
      },
      description: 'The type (style variant) of the badge.',
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
      type: { name: 'enum', value: ['square', 'rounded'] },
      description: 'The shape of the badge.',
      options: ['square', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'rounded' } },
    },
    dot: {
      type: 'boolean',
      description:
        'Sets whether to render a dot type badge.\nWhen enabled, the badge appears as a small dot without any content.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { variant: 'primary', outlined: false, shape: 'rounded', dot: false },
};

export default metadata;

interface IgcBadgeArgs {
  /** The type (style variant) of the badge. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Sets whether to draw an outlined version of the badge. */
  outlined: boolean;
  /** The shape of the badge. */
  shape: 'square' | 'rounded';
  /**
   * Sets whether to render a dot type badge.
   * When enabled, the badge appears as a small dot without any content.
   */
  dot: boolean;
}
type Story = StoryObj<IgcBadgeArgs>;

// endregion

const variants = ['primary', 'info', 'success', 'warning', 'danger'] as const;

const styles = html`
  ${storyStyles}
  <style>
    .bd-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A badge with a short text. Use the controls panel to change the `variant`, the `shape`, the outline and the `dot` mode. A dot badge hides its content.',
      },
    },
  },
  render: ({ outlined, shape, variant, dot }) => html`
    <igc-badge
      ?outlined=${outlined}
      shape=${shape}
      variant=${variant}
      ?dot=${dot}
    >
      New
    </igc-badge>
  `,
};

export const Appearance: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'All variants with the other options. `outlined` draws a ring in the color of the surface, which separates the badge from the element under it, as the tinted cells show. `square` suits a status label, and `rounded` suits a count. A dot has no content. An icon that is the only content gets the `icon` part, and the badge becomes a circle.',
      },
    },
  },
  render: () => {
    const columns = ['Filled', 'Outlined', 'Square', 'Dot', 'Icon'];

    return html`
      <style>
        .bd-table {
          border-spacing: 2rem 1rem;
          text-align: center;
        }

        .bd-tinted {
          padding: 0.5rem;
          border-radius: 6px;
          background: var(--ig-gray-300);
        }
      </style>
      <div style="overflow-x: auto">
        <table class="bd-table">
          <thead>
            <tr>
              <td></td>
              ${columns.map((column) => html`<th scope="col">${column}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${variants.map(
              (variant) => html`
                <tr>
                  <th scope="row">${variant}</th>
                  <td><igc-badge variant=${variant}>8</igc-badge></td>
                  <td class="bd-tinted">
                    <igc-badge variant=${variant} outlined>8</igc-badge>
                  </td>
                  <td>
                    <igc-badge variant=${variant} shape="square">
                      ${variant}
                    </igc-badge>
                  </td>
                  <td><igc-badge variant=${variant} dot></igc-badge></td>
                  <td>
                    <igc-badge variant=${variant}>
                      <igc-icon name="done"></igc-icon>
                    </igc-badge>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  },
};

/** Shows a count up to 99, and "99+" above that. */
const formatCount = (count: number) => (count > 99 ? '99+' : `${count}`);

export const Notifications: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The header of a store. A badge on each icon button counts the new items, and shows "99+" above 99. A badge with a count of 0 gets the `hidden` attribute. The dot on the updates button marks new activity without a count. Click a button to mark its items as read, and use the buttons under the header to receive new items. The badge has the `status` role, so a screen reader announces a new count. A number alone means little, so a visually hidden text states what the badge counts. `pointer-events: none` lets a click on the badge reach the button.',
      },
    },
  },
  render: () => {
    const state = { messages: 3, notifications: 12, cart: 120, updates: true };

    const counter = (
      key: 'messages' | 'notifications' | 'cart',
      icon: string,
      label: string,
      unit: string,
      variant: IgcBadgeComponent['variant']
    ) => html`
      <span class="bd-anchor">
        <igc-icon-button
          variant="flat"
          name=${icon}
          aria-label=${label}
          @click=${() => {
            state[key] = 0;
            story.update();
          }}
        ></igc-icon-button>
        <igc-badge variant=${variant} ?hidden=${state[key] === 0}>
          ${formatCount(state[key])}<span class="sr-only"> ${unit}</span>
        </igc-badge>
      </span>
    `;

    const receive = (key: 'messages' | 'notifications' | 'cart') => () => {
      state[key] += 1;
      story.update();
    };

    const story = renderInto(
      () => html`
        <header class="bd-appbar">
          <strong>Acme Store</strong>
          <div class="bd-row">
            ${counter('messages', 'mail', 'Messages', 'unread messages', 'primary')}
            ${counter(
              'notifications',
              'notifications',
              'Notifications',
              'new notifications',
              'danger'
            )}
            ${counter('cart', 'shopping-cart', 'Cart', 'items', 'info')}
            <span class="bd-anchor">
              <igc-icon-button
                variant="flat"
                name="update"
                aria-label=${state.updates ? 'Updates, new activity' : 'Updates'}
                @click=${() => {
                  state.updates = false;
                  story.update();
                }}
              ></igc-icon-button>
              <igc-badge
                variant="success"
                dot
                outlined
                ?hidden=${!state.updates}
              ></igc-badge>
            </span>
          </div>
        </header>
        <div class="bd-row">
          <igc-button variant="outlined" @click=${receive('messages')}>
            Receive a message
          </igc-button>
          <igc-button variant="outlined" @click=${receive('notifications')}>
            Receive a notification
          </igc-button>
          <igc-button variant="outlined" @click=${receive('cart')}>
            Add to cart
          </igc-button>
          <igc-button
            variant="outlined"
            @click=${() => {
              state.updates = true;
              story.update();
            }}
          >
            Publish an update
          </igc-button>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .bd-store {
          display: grid;
          gap: 1.5rem;
          max-width: 48rem;
        }

        .bd-appbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .bd-anchor {
          position: relative;
          display: inline-flex;
        }

        .bd-anchor igc-badge {
          position: absolute;
          inset-block-start: 0;
          inset-inline-start: 55%;
          pointer-events: none;
        }
      </style>
      <div class="bd-store" ${story.mount}></div>
    `;
  },
};

const orderStatuses: Record<
  string,
  { variant: IgcBadgeComponent['variant']; style?: string }
> = {
  Draft: {
    variant: 'primary',
    style:
      '--ig-badge-background-color: var(--ig-gray-300); --ig-badge-text-color: var(--ig-gray-900)',
  },
  Processing: { variant: 'primary' },
  'Awaiting payment': { variant: 'warning' },
  Shipped: { variant: 'info' },
  Delivered: { variant: 'success' },
  Canceled: { variant: 'danger' },
};

export const StatusLabels: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Badges as status labels in a table and in a list. The text states the status, and the `variant` only adds the color, because a color alone means nothing to assistive technologies and to users who cannot see it. `shape="square"` suits a label. The draft label sets `--ig-badge-background-color` for a neutral color. The service list uses a dot next to the text.',
      },
    },
  },
  render: () => {
    const orders = [
      {
        id: '10431',
        customer: 'Maria Garcia',
        total: '$84.00',
        status: 'Draft',
      },
      {
        id: '10430',
        customer: 'James Wilson',
        total: '$129.00',
        status: 'Processing',
      },
      {
        id: '10429',
        customer: 'Aiko Tanaka',
        total: '$45.50',
        status: 'Awaiting payment',
      },
      {
        id: '10428',
        customer: 'Daniel Okafor',
        total: '$184.00',
        status: 'Shipped',
      },
      {
        id: '10427',
        customer: 'Sofia Rossi',
        total: '$69.00',
        status: 'Delivered',
      },
      {
        id: '10426',
        customer: 'Liam Chen',
        total: '$254.50',
        status: 'Canceled',
      },
    ];

    const services = [
      { name: 'Storefront', status: 'Operational', variant: 'success' },
      { name: 'Checkout API', status: 'Operational', variant: 'success' },
      { name: 'Search', status: 'Degraded performance', variant: 'warning' },
      { name: 'Webhooks', status: 'Outage', variant: 'danger' },
    ] as const;

    return html`
      ${styles}
      <style>
        .bd-status {
          display: grid;
          gap: 2rem;
          max-width: 40rem;
        }

        .bd-status h4 {
          margin: 0 0 0.75rem;
        }

        .bd-orders {
          width: 100%;
          border-collapse: collapse;
        }

        .bd-orders th,
        .bd-orders td {
          padding: 0.5rem 0.75rem;
          border-block-end: 1px solid var(--ig-gray-300);
          text-align: start;
        }

        .bd-orders td:nth-child(3) {
          text-align: end;
        }

        .bd-services {
          display: grid;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .bd-services li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }
      </style>
      <div class="bd-status">
        <section>
          <h4>Recent orders</h4>
          <table class="bd-orders">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(({ id, customer, total, status }) => {
                const { variant, style } = orderStatuses[status];

                return html`
                  <tr>
                    <td>#${id}</td>
                    <td>${customer}</td>
                    <td>${total}</td>
                    <td>
                      <igc-badge
                        shape="square"
                        variant=${variant}
                        style=${ifDefined(style)}
                      >
                        ${status}
                      </igc-badge>
                    </td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </section>
        <section>
          <h4>Service status</h4>
          <ul class="bd-services">
            ${services.map(
              ({ name, status, variant }) => html`
                <li>
                  <span>${name}</span>
                  <span class="bd-row">
                    <igc-badge dot variant=${variant}></igc-badge>
                    ${status}
                  </span>
                </li>
              `
            )}
          </ul>
        </section>
      </div>
    `;
  },
};

export const Navigation: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Counts and labels in navigation. The tabs put the count in the `suffix` slot of the tab. The side navigation of a mail application counts the unread messages, and a square badge marks a feature in beta. A visually hidden text tells screen reader users what each number counts.',
      },
    },
  },
  render: () => {
    const folders = [
      { name: 'Inbox', count: 12, unit: 'unread', current: true },
      { name: 'Starred', count: 0, unit: '' },
      { name: 'Drafts', count: 2, unit: 'drafts' },
      { name: 'Spam', count: 37, unit: 'unread' },
    ];

    return html`
      ${styles}
      <style>
        .bd-navigation {
          display: grid;
          gap: 2rem;
          max-width: 40rem;
        }

        .bd-folders {
          display: grid;
          gap: 0.25rem;
          width: 16rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .bd-folders a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          color: inherit;
          text-decoration: none;
        }

        .bd-folders a:hover,
        .bd-folders [aria-current] {
          background: var(--ig-gray-100);
        }

        .bd-folders [aria-current] {
          font-weight: 600;
        }
      </style>
      <div class="bd-navigation">
        <igc-tabs>
          <igc-tab>
            <span slot="label">Open</span>
            <igc-badge slot="suffix">
              24<span class="sr-only"> issues</span>
            </igc-badge>
            <p>The open issues of the project.</p>
          </igc-tab>
          <igc-tab>
            <span slot="label">In review</span>
            <igc-badge slot="suffix" variant="warning">
              3<span class="sr-only"> issues</span>
            </igc-badge>
            <p>The issues with a pull request in review.</p>
          </igc-tab>
          <igc-tab>
            <span slot="label">Closed</span>
            <p>The closed issues of the project.</p>
          </igc-tab>
        </igc-tabs>
        <nav aria-label="Folders">
          <ul class="bd-folders">
            ${folders.map(
              ({ name, count, unit, current }) => html`
                <li>
                  <a
                    href="#"
                    aria-current=${ifDefined(current ? 'page' : undefined)}
                    @click=${(event: Event) => event.preventDefault()}
                  >
                    ${name}
                    <igc-badge ?hidden=${!count} variant="primary">
                      ${count}<span class="sr-only"> ${unit}</span>
                    </igc-badge>
                  </a>
                </li>
              `
            )}
            <li>
              <a href="#" @click=${(event: Event) => event.preventDefault()}>
                Insights
                <igc-badge shape="square" variant="info">Beta</igc-badge>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    `;
  },
};

export const Styling: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Issue labels in custom colors. `--ig-badge-background-color` and `--ig-badge-text-color` set the colors of a `primary` badge, and the other variants keep the colors of the theme. `--ig-badge-border-radius` sets the corners of a `square` badge. The plan tag sets a gradient on the `base` part.',
      },
    },
  },
  render: () => {
    const labels: Record<string, [string, string]> = {
      bug: ['#b60205', '#ffffff'],
      enhancement: ['#a2eeef', '#0b3d3e'],
      documentation: ['#0052cc', '#ffffff'],
      'good first issue': ['#7057ff', '#ffffff'],
      question: ['#fbca04', '#3d3000'],
    };

    const issues = [
      {
        id: 2418,
        title: 'The date picker closes on scroll in Safari',
        labels: ['bug'],
      },
      {
        id: 2417,
        title: 'Add a clear button to the combo',
        labels: ['enhancement', 'good first issue'],
      },
      {
        id: 2415,
        title: 'Document the keyboard support of the tree',
        labels: ['documentation'],
      },
      {
        id: 2411,
        title: 'How do I theme the badge per variant?',
        labels: ['question'],
      },
    ];

    return html`
      ${styles}
      <style>
        .bd-issues {
          display: grid;
          max-width: 40rem;
          margin: 0;
          padding: 0;
          list-style: none;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .bd-issues li {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
        }

        .bd-issues li + li {
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .bd-label {
          --ig-badge-border-radius: 1rem;
        }

        .bd-pro::part(base) {
          background: linear-gradient(135deg, #6d28d9, #db2777);
          color: #ffffff;
          letter-spacing: 0.05em;
        }
      </style>
      <ul class="bd-issues">
        ${issues.map(
          ({ id, title, labels: names }) => html`
            <li>
              <strong>${title}</strong>
              <span class="muted">#${id}</span>
              ${names.map((name) => {
                const [background, color] = labels[name];

                return html`
                  <igc-badge
                    class="bd-label"
                    shape="square"
                    style="--ig-badge-background-color: ${background}; --ig-badge-text-color: ${color}"
                  >
                    ${name}
                  </igc-badge>
                `;
              })}
            </li>
          `
        )}
      </ul>
      <p class="bd-row">
        <strong>Account</strong>
        <igc-badge class="bd-pro" shape="square">PRO</igc-badge>
      </p>
    `;
  },
};
