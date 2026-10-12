import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcExpansionPanelComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  dollars,
  readStored,
  renderInto,
  storyStyles,
  writeStored,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcExpansionPanelComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSelectComponent
);

registerMaterialIcons('chevron-right', 'expand-more');

// region default
const metadata: Meta<IgcExpansionPanelComponent> = {
  title: 'ExpansionPanel',
  component: 'igc-expansion-panel',
  parameters: {
    docs: {
      description: {
        component:
          'The Expansion Panel Component provides a way to display information in a toggleable way -\ncompact summary view containing title and description and expanded detail view containing\nadditional content to the summary header.',
      },
    },
    actions: {
      handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description:
        'Indicates whether the contents of the control should be visible.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      type: 'boolean',
      description:
        'Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    indicatorPosition: {
      type: { name: 'enum', value: ['none', 'start', 'end'] },
      description: 'The indicator position of the expansion panel.',
      options: ['none', 'start', 'end'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'start' } },
    },
  },
  args: { open: false, disabled: false, indicatorPosition: 'start' },
};

export default metadata;

interface IgcExpansionPanelArgs {
  /** Indicates whether the contents of the control should be visible. */
  open: boolean;
  /** Get/Set whether the expansion panel is disabled. Disabled panels are ignored for user interactions. */
  disabled: boolean;
  /** The indicator position of the expansion panel. */
  indicatorPosition: 'none' | 'start' | 'end';
}
type Story = StoryObj<IgcExpansionPanelArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ep-panel {
      display: grid;
      gap: 1rem;
      width: min(100%, 28rem);
    }

    .ep-panel p,
    .ep-page :is(h3, p) {
      margin: 0;
    }

    .ep-lines {
      display: grid;
      gap: 0.5rem;
      margin: 0;
    }

    .ep-lines div {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .ep-lines dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }

    .ep-total {
      padding-block-start: 0.5rem;
      border-block-start: 1px solid var(--ig-gray-300);
      font-weight: 600;
    }

    .ep-form {
      display: grid;
      gap: 1rem;
      width: min(100%, 32rem);
    }

    .ep-fields {
      display: grid;
      gap: 1rem;
    }

    .ep-form > igc-button {
      justify-self: start;
    }

    .ep-app {
      display: flex;
      max-width: 44rem;
      min-height: 22rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ep-nav {
      flex: 0 0 15rem;
      padding-block: 0.5rem;
      border-inline-end: 1px solid var(--ig-gray-300);
    }

    .ep-nav igc-expansion-panel {
      --ig-spacing: 0.5;
    }

    .ep-nav [slot='title'] {
      font-size: 1rem;
      font-weight: 600;
    }

    .ep-nav ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ep-nav a {
      display: block;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      color: inherit;
      text-decoration: none;
    }

    .ep-nav a[aria-current='page'] {
      font-weight: 600;
      background: var(--ig-gray-100);
    }

    .ep-nav igc-icon[name='chevron-right']:dir(rtl) {
      transform: scaleX(-1);
    }

    .ep-page {
      display: grid;
      flex: 1;
      gap: 0.5rem;
      align-content: start;
      padding: 1rem 1.5rem;
    }
  </style>
`;

const items = [
  { name: 'Wireless headphones', quantity: 1, price: 129 },
  { name: 'USB-C cable', quantity: 2, price: 12 },
  { name: 'Travel case', quantity: 1, price: 19 },
];

const subtotal = items.reduce((sum, { quantity, price }) => {
  return sum + quantity * price;
}, 0);
const vat = subtotal * 0.2;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The order summary of a checkout on a small screen. The `title` and `subtitle` slots show the number of items and the total, so the user can continue without opening the panel. The default slot holds the details, and it shows only while the panel is open. Click the header, or press Enter or Space while it has the focus, to toggle the panel. Alt + Arrow Down opens it, and Alt + Arrow Up closes it. The header has the `button` role and `aria-expanded`, so put text in the header slots, not headings or other interactive elements. Use the controls panel to change `open`, `disabled` and `indicatorPosition`.',
      },
    },
  },
  render: ({ open, disabled, indicatorPosition }) => html`
    ${styles}
    <div class="ep-panel">
      <igc-expansion-panel
        indicator-position=${indicatorPosition}
        ?open=${open}
        ?disabled=${disabled}
      >
        <span slot="title">Order summary</span>
        <span slot="subtitle">
          ${items.length} items, ${dollars.format(subtotal + vat)}
        </span>
        <dl class="ep-lines">
          ${items.map(
            ({ name, quantity, price }) => html`
              <div>
                <dt>${name}, ${quantity} ×</dt>
                <dd>${dollars.format(quantity * price)}</dd>
              </div>
            `
          )}
          <div>
            <dt class="muted">Shipping</dt>
            <dd>Free</dd>
          </div>
          <div>
            <dt class="muted">VAT (20%)</dt>
            <dd>${dollars.format(vat)}</dd>
          </div>
          <div class="ep-total">
            <dt>Total</dt>
            <dd>${dollars.format(subtotal + vat)}</dd>
          </div>
        </dl>
      </igc-expansion-panel>
      <p class="muted">
        We ship to Ana Martins, 27 Harbour Street, Bristol BS1 5TX.
      </p>
    </div>
  `,
};

const licenses = [
  ['none', 'No license'],
  ['mit', 'MIT License'],
  ['apache', 'Apache License 2.0'],
  ['gpl', 'GNU GPL v3'],
];

export const AdvancedSettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A form that shows only the required fields first, and keeps the advanced settings in a closed panel. The `subtitle` slot sums up the advanced settings, so the user sees the values without opening the panel, and the summary follows each change. `indicator-position="end"` puts the indicator after the text. After a failed submit, the form controls move the focus to the first invalid field. But the content of a closed panel is inert, so a field in it cannot take the focus, and the submit fails without a visible reason. So the form has `novalidate`, and the submit handler calls `checkValidity()`. When the first invalid field is in a closed panel, the handler opens the panel with `show()`. Then it moves the focus to the field. Clear "Default branch", close the panel, and then submit.',
      },
    },
  },
  render: () => {
    const defaults = { branch: 'main', license: 'mit', readme: true };

    const summarize = ({ branch, license, readme }: typeof defaults) =>
      [
        branch ? `Branch ${branch}` : 'No default branch',
        licenses.find(([value]) => value === license)?.[1],
        readme ? 'README' : 'No README',
      ].join(', ');

    const updateSummary = (event: Event) => {
      const panel = event.currentTarget as IgcExpansionPanelComponent;

      panel.querySelector('[slot="subtitle"]')!.textContent = summarize({
        branch: panel.querySelector('igc-input')!.value.trim(),
        license: panel.querySelector('igc-select')!.value ?? '',
        readme: panel.querySelector('igc-checkbox')!.checked,
      });
    };

    const create = async (event: SubmitEvent) => {
      const form = event.currentTarget as HTMLFormElement;

      event.preventDefault();

      if (!form.checkValidity()) {
        const field = form.querySelector<HTMLElement>(':invalid')!;
        const panel = field.closest('igc-expansion-panel');

        if (panel && !panel.open) {
          await panel.show();
        }

        field.focus();
        return;
      }

      form.querySelector('[role="status"]')!.textContent =
        `We created the repository ana-martins/${new FormData(form).get('name')}.`;
    };

    return html`
      ${styles}
      <form class="ep-form" novalidate @submit=${create}>
        <igc-input
          name="name"
          label="Repository name"
          required
          pattern="[A-Za-z0-9._-]+"
        >
          <span slot="helper-text">Letters, digits, ".", "-" and "_".</span>
          <span slot="pattern-mismatch">
            Use only letters, digits, ".", "-" and "_".
          </span>
        </igc-input>
        <igc-select name="visibility" label="Visibility" value="private">
          <igc-select-item value="public">Public</igc-select-item>
          <igc-select-item value="private">Private</igc-select-item>
        </igc-select>
        <igc-expansion-panel
          indicator-position="end"
          @igcInput=${updateSummary}
          @igcChange=${updateSummary}
        >
          <span slot="title">Advanced settings</span>
          <span slot="subtitle">${summarize(defaults)}</span>
          <div class="ep-fields">
            <igc-input
              name="branch"
              label="Default branch"
              value=${defaults.branch}
              required
            ></igc-input>
            <igc-select
              name="license"
              label="License"
              value=${defaults.license}
            >
              ${licenses.map(
                ([value, label]) => html`
                  <igc-select-item value=${value}>${label}</igc-select-item>
                `
              )}
            </igc-select>
            <igc-checkbox name="readme" ?checked=${defaults.readme}>
              Add a README file
            </igc-checkbox>
          </div>
        </igc-expansion-panel>
        <igc-button type="submit">Create the repository</igc-button>
        <p class="muted" role="status"></p>
      </form>
    `;
  },
};

const sections = [
  {
    id: 'projects',
    title: 'Projects',
    pages: ['Website redesign', 'Mobile app', 'Brand guidelines'],
  },
  { id: 'teams', title: 'Teams', pages: ['Design', 'Engineering', 'Support'] },
  { id: 'reports', title: 'Reports', pages: ['Sales', 'Traffic', 'Retention'] },
  { id: 'archive', title: 'Archive', pages: [] },
];

const sidebarKey = 'igc-story-expansion-panel-sidebar';

function loadSidebar(): Record<string, boolean> {
  try {
    return JSON.parse(readStored(sidebarKey) ?? '{}');
  } catch {
    return {};
  }
}

export const Sidebar: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The sidebar of a workspace application. Each section is an independent panel, so the user can keep several sections open. The `indicator` slot shows a chevron that points to the text, and the `indicator-expanded` slot shows a chevron that points down. In a right-to-left layout, the story mirrors the first chevron. `--ig-spacing: 0.5` halves the padding of the panels, and a smaller font in the `title` slot makes the sections fit a sidebar. The `igcOpened` and `igcClosed` events save the state of the sections in `localStorage`: open or close some sections, and then reload the story. A section without pages is `disabled`, and its subtitle tells why.',
      },
    },
  },
  render: () => {
    const open = loadSidebar();
    let current = 'Website redesign';

    const remember = ({ detail }: CustomEvent<IgcExpansionPanelComponent>) => {
      open[detail.dataset.section!] = detail.open;
      writeStored(sidebarKey, JSON.stringify(open));
    };

    const select = (event: Event, page: string) => {
      event.preventDefault();
      current = page;
      story.update();
    };

    const story = renderInto(
      () => html`
        <div class="ep-app">
          <nav class="ep-nav" aria-label="Workspace">
            ${sections.map(
              ({ id, title, pages }) => html`
                <igc-expansion-panel
                  data-section=${id}
                  ?open=${open[id] ?? id === 'projects'}
                  ?disabled=${!pages.length}
                  @igcOpened=${remember}
                  @igcClosed=${remember}
                >
                  <igc-icon slot="indicator" name="chevron-right"></igc-icon>
                  <igc-icon
                    slot="indicator-expanded"
                    name="expand-more"
                  ></igc-icon>
                  <span slot="title">${title}</span>
                  <span slot="subtitle">
                    ${pages.length ? `${pages.length} pages` : 'No pages'}
                  </span>
                  <ul>
                    ${pages.map(
                      (page) => html`
                        <li>
                          <a
                            href="#"
                            aria-current=${ifDefined(current === page ? 'page' : undefined)}
                            @click=${(event: Event) => select(event, page)}
                          >
                            ${page}
                          </a>
                        </li>
                      `
                    )}
                  </ul>
                </igc-expansion-panel>
              `
            )}
          </nav>
          <section class="ep-page" aria-labelledby="ep-page-title">
            <h3 id="ep-page-title">${current}</h3>
            <p class="muted">Updated today by Ana Martins.</p>
          </section>
        </div>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
