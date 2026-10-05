import { finance } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  defineComponents,
  registerIcon,
  registerIconFromText,
  setIconRef,
} from 'igniteui-webcomponents';
import { registerExtendedIcons, registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent
);

const icons = registerExtendedIcons();

// region default
const metadata: Meta<IgcIconComponent> = {
  title: 'Icon',
  component: 'igc-icon',
  parameters: {
    docs: {
      description: {
        component:
          'The icon component allows visualizing collections of pre-registered SVG icons.',
      },
    },
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name of the icon glyph to draw.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    collection: {
      type: 'string',
      description:
        'The name of the registered collection for look up of icons.',
      control: 'text',
      table: { defaultValue: { summary: 'default' } },
    },
    mirrored: {
      type: 'boolean',
      description:
        'Whether to flip the icon horizontally. Useful for RTL (right-to-left) layouts.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { name: '', collection: 'default', mirrored: false },
};

export default metadata;

interface IgcIconArgs {
  /** The name of the icon glyph to draw. */
  name: string;
  /** The name of the registered collection for look up of icons. */
  collection: string;
  /** Whether to flip the icon horizontally. Useful for RTL (right-to-left) layouts. */
  mirrored: boolean;
}
type Story = StoryObj<IgcIconArgs>;

// endregion

Object.assign(metadata.argTypes!.name!, {
  control: 'select',
  options: icons,
});

Object.assign(metadata.args!, {
  name: 'biking',
});

registerMaterialIcons(
  'archive',
  'arrow-back',
  'chevron-left',
  'chevron-right',
  'delete',
  'forward',
  'reply',
  'reply-all',
  'status-failed',
  'status-queued',
  'status-running',
  'status-succeeded',
  'status-warning'
);

const materialSymbols = 'https://unpkg.com/@material-symbols/svg-400@0.47.6';
const iconStyles = { outlined: 'Outlined', rounded: 'Rounded', sharp: 'Sharp' };
type IconStyle = keyof typeof iconStyles;

const navItems = [
  { icon: 'home', label: 'Home' },
  { icon: 'inbox', label: 'Inbox' },
  { icon: 'calendar_month', label: 'Calendar' },
  { icon: 'settings', label: 'Settings' },
];

for (const style of Object.keys(iconStyles)) {
  for (const { icon } of navItems) {
    for (const name of [icon, `${icon}-fill`]) {
      registerIcon(name, `${materialSymbols}/${style}/${name}.svg`, {
        collection: `symbols-${style}`,
      });
    }
  }
}

/** Points the icons of the `app` collection to the icons of one style. */
function setIconStyle(style: IconStyle): void {
  for (const { icon } of navItems) {
    for (const name of [icon, `${icon}-fill`]) {
      setIconRef(name, 'app', { name, collection: `symbols-${style}` });
    }
  }
}

for (const icon of finance) {
  registerIconFromText(icon.name, icon.value, {
    collection: 'finance',
    stripMeta: true,
  });
}

const styles = html`
  ${storyStyles}
  <style>
    .ic-stack {
      display: grid;
      gap: 1.5rem;
      width: min(100%, 40rem);
    }

    .ic-stack :is(h3, p) {
      margin: 0;
    }

    .ic-stack h3 {
      font-size: 1.125rem;
    }

    .ic-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .ic-panel {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ic-success {
      color: var(--ig-success-500);
    }

    .ic-warn {
      color: var(--ig-warn-500);
    }

    .ic-error {
      color: var(--ig-error-500);
    }

    .ic-info {
      color: var(--ig-info-500);
    }

    .ic-gray {
      color: var(--ig-gray-600);
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An icon from the registry. The story registers the icons of `@igniteui/material-icons-extended` in the `default` collection. Choose one with the `name` control, and use `mirrored` to flip it. The SVG of each of these icons has a `<title>`, so the icon gets the `img` role and the title as its name. The "biking" icon has no title, so assistive technologies ignore it, as a decorative icon. The icon takes the text color, and its size follows `--ig-size` or `--ig-icon-size`.',
      },
    },
  },
  render: ({ name, collection, mirrored }) => html`
    <igc-icon
      .name=${name}
      .collection=${collection}
      .mirrored=${mirrored}
    ></igc-icon>
  `,
};

type Status = 'succeeded' | 'warning' | 'failed' | 'running' | 'queued';

const statuses: Record<Status, { label: string; tone: string }> = {
  succeeded: { label: 'Succeeded', tone: 'success' },
  warning: { label: 'Succeeded with warnings', tone: 'warn' },
  failed: { label: 'Failed', tone: 'error' },
  running: { label: 'Running', tone: 'info' },
  queued: { label: 'Queued', tone: 'gray' },
};

const deployments: {
  status: Status;
  service: string;
  version: string;
  started: string;
}[] = [
  {
    status: 'running',
    service: 'search-indexer',
    version: '2.3.1',
    started: '09:58',
  },
  {
    status: 'succeeded',
    service: 'checkout-api',
    version: '4.12.0',
    started: '09:42',
  },
  { status: 'failed', service: 'payments', version: '7.0.2', started: '09:31' },
  {
    status: 'warning',
    service: 'notifications',
    version: '1.8.4',
    started: '09:15',
  },
  {
    status: 'queued',
    service: 'web-app',
    version: '12.1.0',
    started: 'Not started',
  },
];

const services: { name: string; status: Status; label: string }[] = [
  { name: 'API', status: 'succeeded', label: 'Operational' },
  { name: 'Database', status: 'warning', label: 'Degraded performance' },
  { name: 'Payments', status: 'failed', label: 'Outage' },
];

export const Status: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The status page of a deployment tool. An icon that is the only sign of a state needs a name: in the service health list, each icon has an `aria-label`, so it gets the `img` role. Such an icon also needs a contrast of 3:1 with the background, so these icons keep the text color. In the table, the text next to each icon tells the status, so the icons have no label and assistive technologies ignore them. These SVGs have no `<title>`. The icons in the table can use the status colors, and each status also has its own shape. The icon takes the text color, so a `color` on the host sets it. `--ig-icon-size` sets the size: `1.25em` in the health list follows the font size of the text. The icon of a running deployment turns, unless the user asks for reduced motion.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .ic-health {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 2rem;
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 1.125rem;
      }

      .ic-health li {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .ic-health igc-icon {
        --ig-icon-size: 1.25em;
      }

      .ic-table {
        width: 100%;
        border-collapse: collapse;
      }

      .ic-table caption {
        padding-block-end: 0.5rem;
        font-weight: 600;
        text-align: start;
      }

      .ic-table :is(th, td) {
        padding: 0.5rem;
        border-block-end: 1px solid var(--ig-gray-300);
        text-align: start;
      }

      .ic-status {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ic-table igc-icon {
        --ig-icon-size: 1.25rem;
      }

      @media (prefers-reduced-motion: no-preference) {
        .ic-spin {
          animation: ic-spin 2s linear infinite;
        }
      }

      @keyframes ic-spin {
        to {
          rotate: 360deg;
        }
      }
    </style>
    <div class="ic-stack">
      <section class="ic-panel" aria-labelledby="ic-health">
        <h3 id="ic-health">Service health</h3>
        <ul class="ic-health">
          ${services.map(
            ({ name, status, label }) => html`
              <li>
                ${name}
                <igc-icon
                  name="status-${status}"
                  aria-label=${label}
                ></igc-icon>
              </li>
            `
          )}
        </ul>
      </section>
      <div style="overflow-x: auto">
        <table class="ic-table">
          <caption>
            Recent deployments
          </caption>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Service</th>
              <th scope="col">Version</th>
              <th scope="col">Started</th>
            </tr>
          </thead>
          <tbody>
            ${deployments.map(
              ({ status, service, version, started }) => html`
                <tr>
                  <td>
                    <span class="ic-status">
                      <igc-icon
                        class="ic-${statuses[status].tone} ${
                          status === 'running' ? 'ic-spin' : ''
                        }"
                        name="status-${status}"
                      ></igc-icon>
                      ${statuses[status].label}
                    </span>
                  </td>
                  <td>${service}</td>
                  <td>${version}</td>
                  <td>${started}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    </div>
  `,
};

export const IconStyles: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The navigation of an application, with a setting for the icon style. The story registers the Material Symbols icons from a URL with `registerIcon()`, one collection for each style. The markup uses only the names of the `app` collection. `setIconRef()` points each of these names to an icon in the collection of the selected style, so the icons change and the markup stays the same. The current page shows the filled icon, which is a reference too. `setIconRef()` sends the references to the other browser tabs of the application.',
      },
    },
  },
  render: () => {
    let current = 'Home';
    let host: HTMLElement | undefined;

    const update = () => {
      if (!host) {
        return;
      }

      render(
        html`
          <div class="ic-app">
            <nav class="ic-nav" aria-label="Main">
              <ul>
                ${navItems.map(({ icon, label }) => {
                  const active = label === current;

                  return html`
                    <li>
                      <a
                        href="#${icon}"
                        aria-current=${ifDefined(active ? 'page' : undefined)}
                        @click=${(event: Event) => {
                          event.preventDefault();
                          current = label;
                          update();
                        }}
                      >
                        <igc-icon
                          name=${active ? `${icon}-fill` : icon}
                          collection="app"
                        ></igc-icon>
                        ${label}
                      </a>
                    </li>
                  `;
                })}
              </ul>
            </nav>
            <div class="ic-settings ic-stack">
              <h3>Appearance</h3>
              <p class="muted" id="ic-style-label">Icon style</p>
              <igc-button-group
                selection="single-required"
                aria-labelledby="ic-style-label"
                @igcSelect=${({ detail }: CustomEvent<IconStyle>) =>
                  setIconStyle(detail)}
              >
                ${Object.entries(iconStyles).map(
                  ([style, label]) => html`
                    <igc-toggle-button
                      value=${style}
                      ?selected=${style === 'outlined'}
                    >
                      ${label}
                    </igc-toggle-button>
                  `
                )}
              </igc-button-group>
            </div>
          </div>
        `,
        host
      );
    };

    const mount = (element?: Element) => {
      host = element as HTMLElement | undefined;

      if (host) {
        setIconStyle('outlined');
      }

      update();
    };

    return html`
      ${styles}
      <style>
        .ic-app {
          display: grid;
          grid-template-columns: 12rem 1fr;
          width: min(100%, 48rem);
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          overflow: hidden;
        }

        .ic-nav ul {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding: 0.5rem;
          list-style: none;
        }

        .ic-nav a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 999px;
          color: inherit;
          text-decoration: none;
        }

        .ic-nav a:hover {
          background: var(--ig-gray-100);
        }

        .ic-nav a[aria-current='page'] {
          background: var(--ig-gray-200);
          font-weight: 600;
        }

        .ic-nav igc-icon {
          --ig-icon-size: 1.5rem;
        }

        .ic-settings {
          display: grid;
          align-content: start;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-inline-start: 1px solid var(--ig-gray-300);
        }

        @media (max-width: 36rem) {
          .ic-app {
            grid-template-columns: 1fr;
          }

          .ic-settings {
            border-inline-start: 0;
            border-block-start: 1px solid var(--ig-gray-300);
          }
        }
      </style>
      <div ${ref(mount)}></div>
    `;
  },
};

const readerStrings = {
  en: {
    inbox: 'Inbox',
    reply: 'Reply',
    replyAll: 'Reply all',
    forward: 'Forward',
    archive: 'Archive',
    delete: 'Delete',
    previous: 'Previous message',
    next: 'Next message',
    position: '3 of 48',
    subject: 'Planning meeting',
    from: 'From Laila Haddad',
    body: 'Here is the agenda for Thursday.',
  },
  ar: {
    inbox: 'صندوق الوارد',
    reply: 'رد',
    replyAll: 'رد على الكل',
    forward: 'إعادة توجيه',
    archive: 'أرشفة',
    delete: 'حذف',
    previous: 'الرسالة السابقة',
    next: 'الرسالة التالية',
    position: '٣ من ٤٨',
    subject: 'اجتماع التخطيط',
    from: 'من ليلى حداد',
    body: 'إليك جدول أعمال يوم الخميس.',
  },
};

export const RightToLeft: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A message in a mail application, in English or in Arabic. `mirrored` does not follow the direction of the page, so the application sets it in a right-to-left layout on the icons that show a direction: the back arrow, Reply, Reply all, Forward, and the previous and next arrows. Icons without a direction, such as Archive and Delete, stay as they are. Media controls, such as a play icon, also stay. Turn on the switch to change the language and the direction.',
      },
    },
  },
  render: () => {
    let rtl = false;

    const story = renderInto(() => {
      const text = readerStrings[rtl ? 'ar' : 'en'];
      const action = (icon: string, label: string, mirrored = false) => html`
        <igc-button variant="flat">
          <igc-icon slot="prefix" name=${icon} ?mirrored=${mirrored}></igc-icon>
          ${label}
        </igc-button>
      `;

      return html`
        <igc-switch
          ?checked=${rtl}
          @igcChange=${({ detail }: CustomEvent<{ checked: boolean }>) => {
            rtl = detail.checked;
            story.update();
          }}
        >
          Arabic, right to left
        </igc-switch>
        <article
          class="ic-panel"
          lang=${rtl ? 'ar' : 'en'}
          dir=${rtl ? 'rtl' : 'ltr'}
          aria-labelledby="ic-subject"
        >
          <div class="ic-row" style="justify-content: space-between">
            ${action('arrow-back', text.inbox, rtl)}
            <div class="ic-row">
              <span class="muted">${text.position}</span>
              <igc-icon-button
                variant="flat"
                name="chevron-left"
                ?mirrored=${rtl}
                aria-label=${text.previous}
              ></igc-icon-button>
              <igc-icon-button
                variant="flat"
                name="chevron-right"
                ?mirrored=${rtl}
                aria-label=${text.next}
              ></igc-icon-button>
            </div>
          </div>
          <h3 id="ic-subject">${text.subject}</h3>
          <p class="muted">${text.from}</p>
          <p>${text.body}</p>
          <div class="ic-row">
            ${action('reply', text.reply, rtl)}
            ${action('reply-all', text.replyAll, rtl)}
            ${action('forward', text.forward, rtl)}
            ${action('archive', text.archive)} ${action('delete', text.delete)}
          </div>
        </article>
      `;
    });

    return html`
      ${styles}
      <div class="ic-stack" ${story.mount}></div>
    `;
  },
};

const categoryIcons: Record<string, string> = {
  'piggy-bank': 'Savings',
  cash: 'Cash',
  'credit-cards': 'Credit cards',
  invoice: 'Bills',
  'bill-paid': 'Paid bills',
  'wire-transfer': 'Transfers',
  loan: 'Loans',
  'money-bag': 'Income',
  gift: 'Gifts',
  delivery: 'Deliveries',
  sale: 'Shopping',
  discount: 'Discounts',
  calculator: 'Taxes',
  'financial-insurance': 'Insurance',
  'bank-safe': 'Emergency fund',
  'pay-date': 'Salary',
  'budget-spending': 'Spending',
  'dollar-circled': 'Other',
  award: 'Rewards',
  strategy: 'Investments',
};

export const CategoryPicker: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A form that adds a category to a budget application. The icons come from the `finance` set of `@igniteui/material-icons-extended`, registered in a `finance` collection with `stripMeta: true`. Each SVG of the set has a `<title>`, which the browser shows as a tooltip on hover. `stripMeta` removes the `<title>` from the SVG, and the icon keeps the text as its name. In the picker, a visually hidden text names each radio button, so each icon has `aria-hidden="true"`, as does the icon in the preview. `--ig-icon-size` sets a different size in the picker and in the preview.',
      },
    },
  },
  render: () => {
    let selected = 'piggy-bank';
    let name = '';
    let budget = '400';
    let status = '';

    const submit = (event: SubmitEvent) => {
      event.preventDefault();
      status = `The category ${name} is added, with a budget of $${budget} each month.`;
      story.update();
    };

    const story = renderInto(
      () => html`
        <form
          class="ic-stack"
          style="width: min(100%, 28rem)"
          @submit=${submit}
        >
          <h3>New budget category</h3>
          <igc-input
            name="name"
            label="Category name"
            required
            @igcInput=${({ detail }: CustomEvent<string>) => {
              name = detail;
              story.update();
            }}
          >
            <span slot="value-missing">Enter a name for the category.</span>
          </igc-input>
          <igc-input
            name="budget"
            type="number"
            label="Monthly budget"
            value="400"
            min="1"
            required
            @igcInput=${({ detail }: CustomEvent<string>) => {
              budget = detail;
              story.update();
            }}
          >
            <span slot="prefix">$</span>
            <span slot="value-missing">Enter a budget.</span>
            <span slot="range-underflow">Enter $1 or more.</span>
          </igc-input>
          <fieldset class="ic-picker">
            <legend>Icon</legend>
            ${Object.entries(categoryIcons).map(
              ([icon, label]) => html`
                <label class="ic-option">
                  <input
                    class="sr-only"
                    type="radio"
                    name="icon"
                    value=${icon}
                    ?checked=${icon === selected}
                    @change=${() => {
                      selected = icon;
                      story.update();
                    }}
                  />
                  <span class="sr-only">${label}</span>
                  <igc-icon
                    name=${icon}
                    collection="finance"
                    aria-hidden="true"
                  ></igc-icon>
                </label>
              `
            )}
          </fieldset>
          <div class="ic-preview">
            <span>
              <igc-icon
                name=${selected}
                collection="finance"
                aria-hidden="true"
              ></igc-icon>
            </span>
            <div>
              <strong>${name || 'Category name'}</strong>
              <span class="muted">$0 of $${budget || 0} this month</span>
            </div>
          </div>
          <div class="ic-row">
            <igc-button type="submit">Add the category</igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `
    );

    return html`
      ${styles}
      <style>
        .ic-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
          gap: 0.5rem;
          margin: 0;
          padding: 0.75rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .ic-picker legend {
          padding-inline: 0.25rem;
        }

        .ic-option {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
        }

        .ic-option:hover {
          background: var(--ig-gray-100);
        }

        .ic-option:has(:checked) {
          border-color: var(--ig-primary-500);
          background: var(--ig-gray-100);
        }

        .ic-option:has(:focus-visible) {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: 2px;
        }

        .ic-option igc-icon {
          --ig-icon-size: 1.75rem;
        }

        .ic-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ic-preview > span {
          display: grid;
          place-items: center;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: var(--ig-primary-500);
          color: var(--ig-primary-500-contrast);
        }

        .ic-preview igc-icon {
          --ig-icon-size: 2rem;
        }

        .ic-preview div {
          display: grid;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};
