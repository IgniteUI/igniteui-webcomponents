import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcDividerComponent,
  IgcIconButtonComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcDividerComponent,
  IgcIconButtonComponent
);

registerMaterialIcons(
  'undo',
  'redo',
  'cut',
  'copy',
  'paste',
  'link',
  'image',
  'table'
);

// region default
const metadata: Meta<IgcDividerComponent> = {
  title: 'Divider',
  component: 'igc-divider',
  parameters: {
    docs: {
      description: {
        component:
          'The divider allows the content author to easily create a horizontal/vertical\nrule as a break between content, to better organize information on a page.',
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
      type: { name: 'enum', value: ['solid', 'dashed'] },
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

const styles = html`
  ${storyStyles}
  <style>
    .dv-panel {
      display: grid;
      gap: 1rem;
      width: min(100%, 32rem);
      padding: 1rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dv-panel :is(h3, p),
    .dv-sections :is(h3, p),
    .dv-mail :is(h3, p) {
      margin: 0;
    }

    .dv-panel h3,
    .dv-mail h3 {
      font-size: 1.125rem;
    }

    .dv-sections {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: min(100%, 40rem);
    }

    .dv-sections.dv-row {
      flex-direction: row;
    }

    .dv-sections section {
      display: grid;
      flex: 1;
      gap: 0.5rem;
    }

    .dv-mail {
      display: flex;
      max-width: 48rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dv-folders {
      flex: 0 0 10rem;
      padding: 1rem;
    }

    .dv-folders ul,
    .dv-messages {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .dv-folders a {
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0.5rem;
      border-radius: 4px;
      color: inherit;
      text-decoration: none;
    }

    .dv-folders a[aria-current='page'] {
      font-weight: 600;
      background: var(--ig-gray-100);
    }

    .dv-inbox {
      flex: 1;
      min-width: 0;
      padding-block: 1rem;
    }

    .dv-inbox h3 {
      padding-inline: 1rem;
    }

    .dv-message {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      --ig-avatar-size: 2.5rem;
    }

    .dv-text {
      display: grid;
      flex: 1;
      min-width: 0;
    }

    .dv-message .muted {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dv-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      width: fit-content;
      padding: 0.25rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dv-toolbar igc-icon-button {
      align-self: center;
    }

    .dv-lines {
      display: grid;
      gap: 0.5rem;
      margin: 0;
    }

    .dv-lines div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .dv-lines dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }

    .dv-total {
      font-size: 1.125rem;
      font-weight: 600;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Two sections of an account settings page with a divider between them. The divider has the `separator` role, and its `aria-orientation` follows `vertical`. Set `vertical` to put the sections side by side: the parent changes to a flex row, and the divider stretches to the height of the row. `type` changes the line to dashed. `middle` has an effect only together with the `--inset` CSS property. The Inbox and Toolbar stories show `--inset`.',
      },
    },
  },
  render: ({ vertical, middle, type }) => html`
    ${styles}
    <div class="dv-sections ${vertical ? 'dv-row' : ''}">
      <section>
        <h3>Profile</h3>
        <p class="muted">
          Your name, your photo and the language of the application.
        </p>
      </section>
      <igc-divider
        ?vertical=${vertical}
        ?middle=${middle}
        type=${type}
      ></igc-divider>
      <section>
        <h3>Notifications</h3>
        <p class="muted">
          The email and push messages that we send to you, and when we send
          them.
        </p>
      </section>
    </div>
  `,
};

const folders = [
  ['Inbox', 3],
  ['Starred', 0],
  ['Sent', 0],
  ['Drafts', 1],
  ['Archive', 0],
] as const;

const messages = [
  {
    from: 'Sofía Díaz',
    initials: 'SD',
    subject: 'Design review on Thursday',
    time: '09:42',
  },
  {
    from: 'Liam Chen',
    initials: 'LC',
    subject: 'Invoice 4821 for September',
    time: 'Yesterday',
  },
  {
    from: 'Grace Okafor',
    initials: 'GO',
    subject: 'Onboarding plan for the new team members',
    time: 'Mon',
  },
  {
    from: 'Acme Billing',
    initials: 'AB',
    subject: 'Your receipt for the annual plan',
    time: 'Sep 28',
  },
];

export const Inbox: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A mail application with two panes. A vertical divider separates the folders from the messages, and it stretches to the height of the flex row. In the message list, `--inset` moves the start of each divider to the start of the text, so the lines do not go below the avatars. `--inset` follows the text direction, so the line starts at the right in a right-to-left layout. The dividers between the messages are decorative and have `aria-hidden="true"`, so a screen reader does not announce a separator in each list item.',
      },
    },
  },
  render: () => html`
    ${styles}
    <div class="dv-mail">
      <nav class="dv-folders" aria-label="Folders">
        <ul>
          ${folders.map(
            ([name, unread]) => html`
              <li>
                <a
                  href="#"
                  aria-current=${ifDefined(name === 'Inbox' ? 'page' : undefined)}
                  @click=${(event: Event) => event.preventDefault()}
                >
                  ${name} <span>${unread || ''}</span>
                </a>
              </li>
            `
          )}
        </ul>
      </nav>
      <igc-divider vertical></igc-divider>
      <div class="dv-inbox">
        <h3>Inbox</h3>
        <ul class="dv-messages">
          ${messages.map(
            ({ from, initials, subject, time }, index) => html`
              <li>
                <div class="dv-message">
                  <igc-avatar
                    initials=${initials}
                    shape="circle"
                    aria-hidden="true"
                  ></igc-avatar>
                  <span class="dv-text">
                    <strong>${from}</strong>
                    <span class="muted">${subject}</span>
                  </span>
                  <span class="muted">${time}</span>
                </div>
                ${
                  index < messages.length - 1
                    ? html`
                        <igc-divider
                          aria-hidden="true"
                          style="--inset: 4.5rem"
                        ></igc-divider>
                      `
                    : ''
                }
              </li>
            `
          )}
        </ul>
      </div>
    </div>
  `,
};

const toolGroups = [
  [
    ['undo', 'Undo'],
    ['redo', 'Redo'],
  ],
  [
    ['cut', 'Cut'],
    ['copy', 'Copy'],
    ['paste', 'Paste'],
  ],
  [
    ['link', 'Insert a link'],
    ['image', 'Insert an image'],
    ['table', 'Insert a table'],
  ],
];

export const Toolbar: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The toolbar of a text editor with three groups of commands. A vertical divider with `middle` and `--inset: 0.5rem` separates the groups, so the line is shorter than the toolbar at the top and at the bottom. The toolbar has the `toolbar` role, and the dividers between its groups have the `separator` role with a vertical orientation. The toolbar has one tab stop: the arrow keys, Home and End move the focus between the buttons, and the arrow keys follow the text direction.',
      },
    },
  },
  render: () => {
    const buttons = (toolbar: Element) => [
      ...toolbar.querySelectorAll('igc-icon-button'),
    ];

    const move = (event: KeyboardEvent) => {
      const toolbar = event.currentTarget as HTMLElement;
      const items = buttons(toolbar);
      const index = items.indexOf(event.target as IgcIconButtonComponent);
      const forward = toolbar.matches(':dir(rtl)') ? -1 : 1;
      const steps: Record<string, number> = {
        ArrowRight: index + forward,
        ArrowLeft: index - forward,
        Home: 0,
        End: items.length - 1,
      };

      if (index < 0 || !(event.key in steps)) {
        return;
      }

      event.preventDefault();
      const next = items.at(steps[event.key] % items.length)!;

      for (const item of items) {
        item.tabIndex = item === next ? 0 : -1;
      }

      next.focus();
    };

    const run = (event: Event) => {
      const button = event.currentTarget as IgcIconButtonComponent;
      const output = button.closest('.dv-panel')!.querySelector('output')!;

      output.textContent = `You selected "${button.ariaLabel}".`;
    };

    return html`
      ${styles}
      <div class="dv-panel">
        <div
          class="dv-toolbar"
          role="toolbar"
          aria-label="Text formatting"
          @keydown=${move}
        >
          ${toolGroups.map(
            (group, groupIndex) => html`
              ${
                groupIndex
                  ? html`
                      <igc-divider
                        vertical
                        middle
                        style="--inset: 0.5rem"
                      ></igc-divider>
                    `
                  : ''
              }
              ${group.map(
                ([name, label], index) => html`
                  <igc-icon-button
                    name=${name}
                    variant="flat"
                    aria-label=${label}
                    tabindex=${groupIndex === 0 && index === 0 ? 0 : -1}
                    @click=${run}
                  ></igc-icon-button>
                `
              )}
            `
          )}
        </div>
        <output class="muted"></output>
      </div>
    `;
  },
};

const lines = [
  ['Wireless headphones, 1 ×', '$129.00'],
  ['USB-C cable, 2 ×', '$24.00'],
  ['Travel case, 1 ×', '$19.00'],
];

const totals = [
  ['Subtotal', '$172.00'],
  ['Shipping', 'Free'],
  ['VAT (20%)', '$34.40'],
];

export const Receipt: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The summary of an order. A solid divider separates the header from the items, and a dashed divider (`type="dashed"`) separates the items from the subtotal, the shipping and the tax. Before the total, the `--color` CSS property gives the divider a darker color, so the total stands out.',
      },
    },
  },
  render: () => html`
    ${styles}
    <section class="dv-panel" aria-labelledby="dv-order">
      <div>
        <h3 id="dv-order">Order 10482</h3>
        <p class="muted">Placed on September 30, 2026</p>
      </div>
      <igc-divider></igc-divider>
      <dl class="dv-lines">
        ${lines.map(
          ([item, price]) => html`
            <div>
              <dt>${item}</dt>
              <dd>${price}</dd>
            </div>
          `
        )}
      </dl>
      <igc-divider type="dashed"></igc-divider>
      <dl class="dv-lines">
        ${totals.map(
          ([label, amount]) => html`
            <div>
              <dt class="muted">${label}</dt>
              <dd>${amount}</dd>
            </div>
          `
        )}
      </dl>
      <igc-divider style="--color: var(--ig-gray-700)"></igc-divider>
      <dl class="dv-lines dv-total">
        <div>
          <dt>Total</dt>
          <dd>$206.40</dd>
        </div>
      </dl>
    </section>
  `,
};
