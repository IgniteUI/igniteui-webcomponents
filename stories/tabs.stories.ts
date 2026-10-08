import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcSwitchComponent,
  IgcTabComponent,
  IgcTabsComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcSwitchComponent,
  IgcTabsComponent
);
registerMaterialIcons(
  'close',
  'inbox',
  'info',
  'label',
  'lock',
  'notifications',
  'people',
  'person',
  'plus',
  'warning'
);

// region default
const metadata: Meta<IgcTabsComponent> = {
  title: 'Tabs',
  component: 'igc-tabs',
  parameters: {
    docs: {
      description: {
        component:
          'Tabs organize and allow navigation between groups of content that are related and at the same level of hierarchy.\n\nThe tabs component allows the user to navigate between multiple tab children.\nIt supports keyboard navigation and provides API methods to control the selected tab.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    alignment: {
      type: { name: 'enum', value: ['start', 'end', 'center', 'justify'] },
      description: 'Determines the alignment of the tabs header strip.',
      options: ['start', 'end', 'center', 'justify'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'start' } },
    },
    activation: {
      type: { name: 'enum', value: ['auto', 'manual'] },
      description:
        "Determines the activation behavior of the tabs.\n\nWhen set to 'auto', the tab will be selected when it receives focus.\nWhen set to 'manual', the tab will only be selected when it is clicked or activated with the keyboard.",
      options: ['auto', 'manual'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'auto' } },
    },
  },
  args: { alignment: 'start', activation: 'auto' },
};

export default metadata;

interface IgcTabsArgs {
  /** Determines the alignment of the tabs header strip. */
  alignment: 'start' | 'end' | 'center' | 'justify';
  /**
   * Determines the activation behavior of the tabs.
   *
   * When set to 'auto', the tab will be selected when it receives focus.
   * When set to 'manual', the tab will only be selected when it is clicked or activated with the keyboard.
   */
  activation: 'auto' | 'manual';
}
type Story = StoryObj<IgcTabsArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .tb-stack {
      display: grid;
      gap: 1rem;
      max-width: 48rem;
    }

    .tb-stack :is(h3, p, blockquote) {
      margin: 0;
    }

    .tb-stack igc-tab::part(tab-body) {
      padding-block: 1rem;
    }

    .tb-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    .tb-code {
      margin: 0;
      padding: 0.75rem 1rem;
      overflow-x: auto;
      border-radius: 4px;
      background: var(--ig-gray-100);
      font:
        0.875rem / 1.5 ui-monospace,
        monospace;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The details of a product on a shop page. Each `igc-tab` holds a header and a panel: the `label` attribute gives the text of the header, and the content of the tab is the panel. The `selected` attribute selects the specifications when the page opens. The headers are one tab stop: the arrow keys, Home and End move between them, and Tab moves into the panel. Use the controls panel to change the `alignment` of the headers and the `activation`. With `manual`, the arrow keys only move the focus, and Enter or Space selects the tab.',
      },
    },
  },
  render: ({ alignment, activation }) => html`
    ${styles}
    <style>
      .tb-specs {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 0.5rem 1.5rem;
        margin: 0;
      }

      .tb-specs dt {
        font-weight: 600;
      }

      .tb-specs dd {
        margin: 0;
      }

      .tb-review {
        padding-inline-start: 1rem;
        border-inline-start: 3px solid var(--ig-gray-300);
      }
    </style>
    <section class="tb-stack" aria-labelledby="tb-product-name">
      <h3 id="tb-product-name">Trailblazer 2 running shoe</h3>
      <igc-tabs
        alignment=${alignment}
        activation=${activation}
        aria-label="Product details"
      >
        <igc-tab label="Description">
          <p>
            A light trail shoe for long runs on dry paths. The grip of the sole
            holds on loose gravel, and the cushion stays soft after hundreds of
            miles.
          </p>
        </igc-tab>
        <igc-tab label="Specifications" selected>
          <dl class="tb-specs">
            <dt>Weight</dt>
            <dd>280 g in size EU 42</dd>
            <dt>Heel-to-toe drop</dt>
            <dd>6 mm</dd>
            <dt>Upper</dt>
            <dd>Recycled mesh</dd>
            <dt>Sizes</dt>
            <dd>EU 36 to 47</dd>
          </dl>
        </igc-tab>
        <igc-tab label="Reviews">
          <div class="tb-stack">
            <p><strong>4.6 out of 5</strong> from 128 reviews</p>
            <blockquote class="tb-review">
              The grip is great on wet rocks, and my feet stay dry.
            </blockquote>
            <blockquote class="tb-review">
              Order half a size up if you have wide feet.
            </blockquote>
          </div>
        </igc-tab>
        <igc-tab label="Shipping and returns">
          <div class="tb-stack">
            <p>Free delivery in 2 to 4 working days on orders over $50.</p>
            <p>Return shoes that you did not wear within 30 days.</p>
          </div>
        </igc-tab>
      </igc-tabs>
    </section>
  `,
};

const inboxCategories = [
  { id: 'primary', label: 'Primary', icon: 'inbox', unread: 0 },
  { id: 'promotions', label: 'Promotions', icon: 'label', unread: 3 },
  { id: 'social', label: 'Social', icon: 'people', unread: 2 },
  { id: 'updates', label: 'Updates', icon: 'info', unread: 1 },
] as const;

type InboxCategory = (typeof inboxCategories)[number]['id'];

const inboxMessages: Record<InboxCategory, string[][]> = {
  primary: [
    ['Maya Patel', 'Notes from the design review', '9:41 AM'],
    ['Daniel Okafor', 'Agenda for the sprint planning', '8:15 AM'],
    ['Priya Shah', 'Lunch on Friday?', 'Yesterday'],
  ],
  promotions: [
    ['Northwind Outfitters', 'Autumn sale: 30% off jackets', '10:02 AM'],
    ['Bean & Leaf', 'Free delivery on your next order', '7:30 AM'],
    ['Skyline Air', 'Weekend fares to the coast', 'Yesterday'],
  ],
  social: [
    ['Riverside Runners', 'The Sunday run starts at 8 AM', '11:20 AM'],
    ['Photo Club', 'Three new comments on your photo', 'Yesterday'],
  ],
  updates: [
    ['Billing', 'Your invoice for September', '6:00 AM'],
    ['Security', 'New sign-in from a Windows device', 'Mon'],
  ],
};

export const Inbox: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The categories of an email client. An icon in the `prefix` slot of each tab shows the category, and a badge in the `suffix` slot counts the new messages. Text for assistive technologies follows the count, and the `aria-describedby` of the tab points to the badge, so the tab "Promotions" has the description "3 new". The badge has the `status` role, and Chromium leaves the text of that role out of the name of the tab. The `justify` alignment gives each tab the same width. A category loads its messages when it opens, so the tabs use `activation="manual"`: the arrow keys move the focus and load nothing, and Enter or Space opens the category. The `igcChange` event starts the load, and the badge goes away when the messages show.',
      },
    },
  },
  render: () => {
    const loaded = new Set<InboxCategory>(['primary']);
    const loading = new Set<InboxCategory>();

    const open = async ({ detail }: CustomEvent<IgcTabComponent>) => {
      const id = detail.dataset.category as InboxCategory;

      if (loaded.has(id) || loading.has(id)) {
        return;
      }

      loading.add(id);
      update();
      await delay(800);
      loading.delete(id);
      loaded.add(id);
      update();
    };

    const messages = (id: InboxCategory) => {
      if (loading.has(id)) {
        return html`
          <igc-linear-progress
            indeterminate
            aria-label="Loading messages"
          ></igc-linear-progress>
        `;
      }

      return loaded.has(id)
        ? html`
            <ul class="tb-messages">
              ${inboxMessages[id].map(
                ([from, subject, time]) => html`
                  <li>
                    <strong>${from}</strong>
                    <span>${subject}</span>
                    <span class="muted">${time}</span>
                  </li>
                `
              )}
            </ul>
          `
        : nothing;
    };

    const { mount, update } = renderInto(
      () => html`
        <igc-tabs
          alignment="justify"
          activation="manual"
          aria-label="Inbox categories"
          @igcChange=${open}
        >
          ${inboxCategories.map(({ id, label, icon, unread }) => {
            const count = loaded.has(id) ? 0 : unread;

            return html`
              <igc-tab
                label=${label}
                data-category=${id}
                aria-describedby=${count ? `tb-unread-${id}` : nothing}
              >
                <igc-icon slot="prefix" name=${icon}></igc-icon>
                ${
                  count
                    ? html`
                        <igc-badge slot="suffix" id="tb-unread-${id}">
                          ${count}<span class="sr-only">new</span>
                        </igc-badge>
                      `
                    : nothing
                }
                ${messages(id)}
              </igc-tab>
            `;
          })}
        </igc-tabs>
      `
    );

    return html`
      ${styles}
      <style>
        .tb-messages {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tb-messages li {
          display: grid;
          grid-template-columns: 10rem 1fr auto;
          gap: 1rem;
          padding-block: 0.75rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        @media (max-width: 40rem) {
          .tb-messages li {
            grid-template-columns: 1fr auto;
          }

          .tb-messages li span:first-of-type {
            grid-column: 1 / -1;
          }
        }
      </style>
      <div class="tb-stack" ${mount}></div>
    `;
  },
};

type EditorFile = { id: number; name: string; code: string };

const starterFiles = [
  {
    name: 'index.html',
    code: '<!doctype html>\n<html lang="en">\n  <head>\n    <link rel="stylesheet" href="styles.css" />\n  </head>\n  <body>\n    <script type="module" src="main.ts"></script>\n  </body>\n</html>',
  },
  {
    name: 'styles.css',
    code: 'body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}',
  },
  {
    name: 'main.ts',
    code: "import { defineAllComponents } from 'igniteui-webcomponents';\n\ndefineAllComponents();",
  },
  {
    name: 'README.md',
    code: '# Starter\n\nRun `npm run dev` and open http://localhost:5173.',
  },
];

/**
 * Moves the focus to the header of a tab. `igc-tab` has no `focus()` of its
 * own, so this focuses the element with the `tab` role in its shadow root.
 */
function focusTab(tab: Element | null) {
  tab?.shadowRoot?.querySelector<HTMLElement>('[role="tab"]')?.focus();
}

export const Editor: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The open files of a code editor. New file adds a tab with the `selected` attribute, so the tabs select it and scroll it into view. When the headers do not fit, the scroll buttons show. The icon in the `suffix` slot closes a file with the pointer. A tab has the `tab` role, which allows no buttons in it, so the icon is not a button, and the Delete key closes the focused tab. The `aria-describedby` of each tab points to that hint. When a file closes, the next file takes its place, as in most editors. The tabs select the first tab when the selected tab goes away, so the story selects the next one first.',
      },
    },
  },
  render: () => {
    let nextId = 0;
    let untitled = 0;
    let files: EditorFile[] = starterFiles.map((file) => ({
      ...file,
      id: nextId++,
    }));
    let selected = files[0].id;

    const close = (file: EditorFile, moveFocus = false) => {
      const index = files.indexOf(file);
      files = files.filter((each) => each !== file);

      const next = files[index] ?? files[index - 1];
      if (next && selected === file.id) {
        selected = next.id;
      }

      update();

      if (next && moveFocus) {
        focusTab(view.host!.querySelector(`#tb-file-${next.id}`));
      }
    };

    const add = () => {
      const file = {
        id: nextId++,
        name: `untitled-${++untitled}.ts`,
        code: '',
      };
      files = [...files, file];
      selected = file.id;
      update();
    };

    const select = ({ detail }: CustomEvent<IgcTabComponent>) => {
      selected = Number(detail.dataset.file);
    };

    const closeFocused = (event: KeyboardEvent) => {
      const origin = event.composedPath()[0] as Element;

      if (event.key === 'Delete' && origin.getAttribute('role') === 'tab') {
        const tab = event.target as IgcTabComponent;
        close(
          files.find(({ id }) => id === Number(tab.dataset.file))!,
          true
        );
      }
    };

    const view = renderInto(
      () => html`
        <div class="tb-row">
          <h3 id="tb-editor-title">Starter project</h3>
          <igc-button variant="outlined" @click=${add}>
            <igc-icon slot="prefix" name="plus"></igc-icon>
            New file
          </igc-button>
        </div>
        ${
          files.length
            ? html`
                <igc-tabs
                  aria-labelledby="tb-editor-title"
                  @igcChange=${select}
                  @keydown=${closeFocused}
                >
                  ${repeat(
                    files,
                    (file) => file.id,
                    (file) => html`
                      <igc-tab
                        id="tb-file-${file.id}"
                        label=${file.name}
                        data-file=${file.id}
                        ?selected=${file.id === selected}
                        aria-describedby="tb-editor-hint"
                      >
                        <igc-icon
                          slot="suffix"
                          name="close"
                          class="tb-close"
                          @click=${(event: Event) => {
                            event.stopPropagation();
                            close(file);
                          }}
                        ></igc-icon>
                        <pre class="tb-code" .textContent=${file.code}></pre>
                      </igc-tab>
                    `
                  )}
                </igc-tabs>
              `
            : html`<p class="muted">No open files. Select New file.</p>`
        }
        <p id="tb-editor-hint" class="muted">
          Press Delete to close the focused tab.
        </p>
      `
    );
    const { mount, update } = view;

    return html`
      ${styles}
      <style>
        .tb-editor {
          max-width: 36rem;
        }

        .tb-close {
          --ig-icon-size: 1.125rem;

          border-radius: 50%;
          cursor: pointer;
        }

        .tb-close:hover {
          background: var(--ig-gray-300);
        }

        .tb-editor .tb-code {
          min-height: 10rem;
        }
      </style>
      <div class="tb-stack tb-editor" ${mount}></div>
    `;
  },
};

const packageManagers = ['npm', 'yarn', 'pnpm', 'bun'] as const;

const guideSteps: {
  label: string;
  text: string;
  commands: Record<(typeof packageManagers)[number], string>;
}[] = [
  {
    label: 'Install',
    text: 'Add the package to your project.',
    commands: {
      npm: 'npm install igniteui-webcomponents',
      yarn: 'yarn add igniteui-webcomponents',
      pnpm: 'pnpm add igniteui-webcomponents',
      bun: 'bun add igniteui-webcomponents',
    },
  },
  {
    label: 'Run',
    text: 'Start the development server of your project.',
    commands: {
      npm: 'npm run dev',
      yarn: 'yarn dev',
      pnpm: 'pnpm dev',
      bun: 'bun run dev',
    },
  },
  {
    label: 'Update',
    text: 'Get the latest version that the version range of your project allows.',
    commands: {
      npm: 'npm update igniteui-webcomponents',
      yarn: 'yarn upgrade igniteui-webcomponents',
      pnpm: 'pnpm update igniteui-webcomponents',
      bun: 'bun update igniteui-webcomponents',
    },
  },
];

export const InstallGuide: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The getting started page of a library. The outer tabs hold the steps, and each step holds inner tabs with the command for each package manager. The arrow keys move only in the tabs that have the focus. When you select a package manager in one step, the other steps show it too: the `igcChange` event bubbles to the page, and the page calls `select()` with the `label` of the tab on each inner tabs. `select()` sends no event, so the calls do not repeat.',
      },
    },
  },
  render: () => {
    const sync = ({ target, detail }: CustomEvent<IgcTabComponent>) => {
      const changed = target as IgcTabsComponent;

      if (changed.matches('.tb-commands')) {
        for (const tabs of changed
          .closest('.tb-guide')!
          .querySelectorAll<IgcTabsComponent>('.tb-commands')) {
          tabs.select(detail.label);
        }
      }
    };

    return html`
      ${styles}
      <section
        class="tb-stack tb-guide"
        aria-labelledby="tb-guide-title"
        @igcChange=${sync}
      >
        <h3 id="tb-guide-title">Get started</h3>
        <igc-tabs aria-label="Steps">
          ${guideSteps.map(
            ({ label, text, commands }) => html`
              <igc-tab label=${label}>
                <div class="tb-stack">
                  <p>${text}</p>
                  <igc-tabs class="tb-commands" aria-label="Package manager">
                    ${packageManagers.map(
                      (manager) => html`
                        <igc-tab label=${manager}>
                          <pre
                            class="tb-code"
                            .textContent=${commands[manager]}
                          ></pre>
                        </igc-tab>
                      `
                    )}
                  </igc-tabs>
                </div>
              </igc-tab>
            `
          )}
        </igc-tabs>
      </section>
    `;
  },
};

export const AccountSettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The account settings of a web application, with one form over the tabs. Only the panel of the selected tab shows, so a field with an error can be in a hidden panel when the form is sent. An `invalid` listener in the capture phase selects the tab of the first field with an error and moves the focus to the field, and a warning icon marks each tab with an error until the error is fixed. To try it, clear the email address, open Security, and select Save. The Team tab is disabled, and its `aria-describedby` points to the reason, so assistive technologies read the reason on the tab. Save shows the form data.',
      },
    },
  },
  render: () => {
    let errors = new Set<string>();

    const findErrors = (form: HTMLFormElement) => {
      errors = new Set(
        Array.from(form.querySelectorAll(IgcTabComponent.tagName))
          .filter((tab) => tab.querySelector(':invalid'))
          .map((tab) => tab.id)
      );
      update();
    };

    const reveal = async (event: Event) => {
      const field = event.target as HTMLElement;
      const form = field.closest('form')!;
      const tab = field.closest(IgcTabComponent.tagName);

      findErrors(form);

      // Each field with an error sends `invalid`, and the first one wins.
      if (!tab || field !== form.querySelector(':invalid')) {
        return;
      }

      tab.closest(IgcTabsComponent.tagName)!.select(tab);
      await tab.updateComplete;
      field.focus();
    };

    const refresh = (event: Event) => {
      if (errors.size) {
        findErrors(event.currentTarget as HTMLFormElement);
      }
    };

    const save = (event: SubmitEvent) => {
      errors = new Set();
      update();
      formSubmitHandler(event);
    };

    const errorIcon = (id: string) =>
      errors.has(id)
        ? html`
            <igc-icon
              slot="suffix"
              name="warning"
              class="tb-error"
              aria-label="contains errors"
            ></igc-icon>
          `
        : nothing;

    const { mount, update } = renderInto(
      () => html`
        <h3 id="tb-settings-title">Account settings</h3>
        <igc-tabs aria-labelledby="tb-settings-title">
          <igc-tab id="tb-settings-profile" label="Profile">
            <igc-icon slot="prefix" name="person"></igc-icon>
            ${errorIcon('tb-settings-profile')}
            <div class="tb-fields">
              <igc-input
                name="name"
                label="Full name"
                value="Alex Rivera"
                required
              ></igc-input>
              <igc-input
                name="email"
                type="email"
                label="Email"
                value="alex.rivera@acme.example"
                required
              ></igc-input>
              <igc-input
                name="title"
                label="Job title"
                value="Product designer"
              ></igc-input>
            </div>
          </igc-tab>
          <igc-tab id="tb-settings-notifications" label="Notifications">
            <igc-icon slot="prefix" name="notifications"></igc-icon>
            <div class="tb-fields">
              <igc-switch name="comments" checked>
                Comments on my files
              </igc-switch>
              <igc-switch name="summary" checked>A weekly summary</igc-switch>
              <igc-switch name="news">Product news</igc-switch>
            </div>
          </igc-tab>
          <igc-tab id="tb-settings-security" label="Security">
            <igc-icon slot="prefix" name="lock"></igc-icon>
            ${errorIcon('tb-settings-security')}
            <div class="tb-fields">
              <igc-input
                name="recovery-email"
                type="email"
                label="Recovery email"
              ></igc-input>
              <igc-input
                name="recovery-phone"
                type="tel"
                label="Recovery phone"
                pattern="[+]?[0-9 ]{7,15}"
              ></igc-input>
              <igc-switch name="two-step">Two-step verification</igc-switch>
            </div>
          </igc-tab>
          <igc-tab label="Team" disabled aria-describedby="tb-team-note">
            <igc-icon slot="prefix" name="people"></igc-icon>
            <p>Invite people and manage their roles.</p>
          </igc-tab>
        </igc-tabs>
        <p id="tb-team-note" class="muted">
          Team settings are part of the Business plan.
        </p>
        <div class="tb-row">
          <igc-button type="submit">Save</igc-button>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .tb-fields {
          display: grid;
          gap: 1rem;
          max-width: 24rem;
        }

        .tb-error {
          color: var(--ig-error-500);
        }
      </style>
      <form
        class="tb-stack"
        @invalid=${{ handleEvent: reveal, capture: true }}
        @igcInput=${refresh}
        @igcChange=${refresh}
        @submit=${save}
        ${mount}
      ></form>
    `;
  },
};
