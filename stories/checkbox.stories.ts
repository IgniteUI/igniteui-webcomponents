import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcInputComponent,
  IgcLinearProgressComponent
);

// region default
const metadata: Meta<IgcCheckboxComponent> = {
  title: 'Checkbox',
  component: 'igc-checkbox',
  parameters: {
    docs: {
      description: {
        component:
          'A check box allowing single values to be selected/deselected.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    indeterminate: {
      type: 'boolean',
      description: 'Draws the checkbox in indeterminate state.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelPosition: {
      type: { name: 'enum', value: ['after', 'before'] },
      description: 'The label position of the control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
    },
  },
  args: {
    indeterminate: false,
    required: false,
    disabled: false,
    invalid: false,
    checked: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcCheckboxArgs {
  /** Draws the checkbox in indeterminate state. */
  indeterminate: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** The value of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'after' | 'before';
}
type Story = StoryObj<IgcCheckboxArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .cb-stack {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
    }

    .cb-stack :is(h3, p, ul, fieldset) {
      margin: 0;
    }

    .cb-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cb-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A consent checkbox in the settings of an account. The content between the tags is the label, and a click on the label toggles the checkbox. The `helper-text` slot describes the choice, and the checkbox links it to the native input as its description. Use the controls panel to change the state. `indeterminate` is only visual, and a click clears it. `invalid` sets only the invalid style, and `required` adds the validation.',
      },
    },
  },
  render: (args) => html`
    <igc-checkbox
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      .value=${args.value}
      .name=${args.name}
      .labelPosition=${args.labelPosition}
      .invalid=${args.invalid}
      .indeterminate=${args.indeterminate}
    >
      Email me about new features
      <span slot="helper-text">We send at most one email a month.</span>
    </igc-checkbox>
  `,
};

const inbox = [
  { id: 'm1', from: 'Maya Patel', subject: 'Notes from the design review' },
  { id: 'm2', from: 'GitHub', subject: 'Your pull request was merged' },
  {
    id: 'm3',
    from: 'Daniel Okafor',
    subject: 'Agenda for the sprint planning',
  },
  { id: 'm4', from: 'Billing', subject: 'Your invoice for September' },
  { id: 'm5', from: 'Sofia Díaz', subject: 'Photos from the team offsite' },
];

export const Inbox: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The message list of an email client. The checkbox in the toolbar selects all the messages. It is checked when all the messages are selected and indeterminate when only some are, so the native input reports the `mixed` state. A click on an indeterminate checkbox clears `indeterminate` and checks it, so the handler reads `detail.checked` and selects all. The checkbox of a message has no slotted label: `aria-labelledby` points to the sender and the subject in the row, and the checkbox resolves the IDs from the light DOM. The toolbar checkbox has an `aria-label`. Archive and Delete act on the selected messages.',
      },
    },
  },
  render: () => {
    let messages = [...inbox];
    const selected = new Set<string>();
    let message = '';

    const toggleAll = ({ detail }: CustomEvent<{ checked: boolean }>) => {
      selected.clear();

      if (detail.checked) {
        for (const { id } of messages) {
          selected.add(id);
        }
      }

      message = '';
      update();
    };

    const toggle =
      (id: string) =>
      ({ detail }: CustomEvent<{ checked: boolean }>) => {
        if (detail.checked) {
          selected.add(id);
        } else {
          selected.delete(id);
        }

        message = '';
        update();
      };

    const act = (verb: string) => () => {
      const count = selected.size;

      messages = messages.filter(({ id }) => !selected.has(id));
      selected.clear();
      message = `${verb} ${count} ${count === 1 ? 'message' : 'messages'}.`;
      update();
    };

    const restore = () => {
      messages = [...inbox];
      message = 'The messages are back.';
      update();
    };

    const { mount, update } = renderInto(() => {
      const count = selected.size;
      const all = messages.length > 0 && count === messages.length;

      return html`
        <div class="cb-row cb-toolbar">
          <igc-checkbox
            aria-label="Select all messages"
            .checked=${all}
            .indeterminate=${count > 0 && !all}
            ?disabled=${!messages.length}
            @igcChange=${toggleAll}
          ></igc-checkbox>
          <span class="muted">
            ${count ? `${count} selected` : `${messages.length} messages`}
          </span>
          <span class="cb-spacer"></span>
          <igc-button ?disabled=${!count} @click=${act('Archived')}>
            Archive
          </igc-button>
          <igc-button ?disabled=${!count} @click=${act('Deleted')}>
            Delete
          </igc-button>
        </div>
        ${
          messages.length
            ? html`
                <ul class="cb-messages" aria-label="Messages">
                  ${messages.map(
                    ({ id, from, subject }) => html`
                      <li class=${selected.has(id) ? 'cb-selected' : ''}>
                        <igc-checkbox
                          aria-labelledby="${id}-from ${id}-subject"
                          .checked=${selected.has(id)}
                          @igcChange=${toggle(id)}
                        ></igc-checkbox>
                        <strong id="${id}-from">${from}</strong>
                        <span id="${id}-subject">${subject}</span>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`
                <div class="cb-row">
                  <p class="muted">Your inbox is empty.</p>
                  <igc-button variant="outlined" @click=${restore}>
                    Restore the messages
                  </igc-button>
                </div>
              `
        }
        <p class="muted" role="status">${message}</p>
      `;
    });

    return html`
      ${styles}
      <style>
        .cb-toolbar {
          padding-inline: 0.75rem;
        }

        .cb-spacer {
          flex: 1;
        }

        .cb-messages {
          display: grid;
          padding: 0;
          list-style: none;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .cb-messages li {
          display: grid;
          grid-template-columns: auto 9rem 1fr;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .cb-messages li.cb-selected {
          background: var(--ig-primary-50);
          color: var(--ig-primary-50-contrast);
        }
      </style>
      <section class="cb-stack cb-panel" aria-label="Inbox" ${mount}></section>
    `;
  },
};

const cookies = [
  {
    name: 'necessary',
    label: 'Strictly necessary',
    help: 'Sign-in, security and your cart. The site does not work without them.',
    required: true,
  },
  {
    name: 'preferences',
    label: 'Preferences',
    help: 'Your language, currency and region.',
  },
  {
    name: 'analytics',
    label: 'Analytics',
    help: 'Anonymous statistics about the pages that you visit.',
  },
  {
    name: 'marketing',
    label: 'Marketing',
    help: 'Ads on other sites that match your interests.',
  },
];

export const CookiePreferences: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The cookie settings of a shop. `label-position="before"` puts the label first, and a style on the `base` part moves the box to the end of the row. The strictly necessary cookies are `checked` and `disabled`, because the user cannot turn them off. A disabled control submits no value, so the form data has only the optional categories. The optional categories start unchecked, because consent must be an active choice. "Accept all" and "Reject all" set `checked` from code, and "Save my choices" reads the form data.',
      },
    },
  },
  render: () => {
    const setAll = (checked: boolean) => (event: Event) => {
      const form = (event.target as HTMLElement).closest('form')!;

      for (const checkbox of form.querySelectorAll('igc-checkbox')) {
        if (!checkbox.disabled) {
          checkbox.checked = checked;
        }
      }
    };

    const save = (event: SubmitEvent) => {
      event.preventDefault();

      const form = event.target as HTMLFormElement;
      const data = new FormData(form);
      const chosen = cookies
        .filter(({ name, required }) => required || data.has(name))
        .map(({ label }) => label);

      form.querySelector('[role=status]')!.textContent =
        `We saved your choices. ${chosen.join(', ')}.`;
    };

    return html`
      ${styles}
      <style>
        .cb-cookie-list {
          display: grid;
        }

        .cb-cookies igc-checkbox {
          padding-block: 0.75rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .cb-cookies igc-checkbox::part(base) {
          justify-content: space-between;
          width: 100%;
        }

        .cb-cookies igc-checkbox::part(label) {
          font-weight: 600;
        }
      </style>
      <form class="cb-stack cb-panel cb-cookies" @submit=${save}>
        <h3>Cookie settings</h3>
        <p class="muted">
          Choose which cookies we can use. You can change your choice at any
          time.
        </p>
        <div class="cb-cookie-list">
          ${cookies.map(
            ({ name, label, help, required }) => html`
              <igc-checkbox
                name=${name}
                value="allowed"
                label-position="before"
                ?checked=${required}
                ?disabled=${required}
              >
                ${label}
                <span slot="helper-text">${help}</span>
              </igc-checkbox>
            `
          )}
        </div>
        <div class="cb-row">
          <igc-button type="submit">Save my choices</igc-button>
          <igc-button variant="outlined" @click=${setAll(false)}>
            Reject all
          </igc-button>
          <igc-button variant="outlined" @click=${setAll(true)}>
            Accept all
          </igc-button>
        </div>
        <p class="muted" role="status"></p>
      </form>
    `;
  },
};

export const SignUp: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A sign-up form. The terms checkbox is `required`: until it is checked, the form does not submit, and the `value-missing` slot shows the message. The label contains links, and a click on a link does not toggle the checkbox, as for a native label. The links have no page to open, so the story shows which link you clicked. The newsletter checkbox starts unchecked, and Reset restores the default state of each checkbox. "Create a team account" enables the fieldset of the team, and the checkboxes in a disabled fieldset submit nothing. Submit shows the form data.',
      },
    },
  },
  render: () => {
    const team = createRef<HTMLFieldSetElement>();
    const status = createRef<HTMLElement>();

    const toggleTeam = ({ detail }: CustomEvent<{ checked: boolean }>) => {
      team.value!.disabled = !detail.checked;
    };

    const reset = () => {
      team.value!.disabled = true;
    };

    const openLink = (event: Event) => {
      event.preventDefault();
      const link = event.currentTarget as HTMLAnchorElement;
      status.value!.textContent = `You clicked the link to the ${link.textContent}.`;
    };

    return html`
      ${styles}
      <style>
        .cb-signup a {
          color: inherit;
        }

        .cb-signup fieldset {
          display: grid;
          gap: 0.75rem;
          padding: 0.75rem 1rem 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 6px;
        }
      </style>
      <form
        class="cb-stack cb-panel cb-signup"
        @submit=${formSubmitHandler}
        @reset=${reset}
      >
        <h3>Create your account</h3>
        <igc-input name="email" type="email" label="Email" required></igc-input>
        <igc-checkbox name="newsletter" value="yes">
          Send me the monthly newsletter
        </igc-checkbox>
        <igc-checkbox @igcChange=${toggleTeam}>
          Create a team account
        </igc-checkbox>
        <fieldset ${ref(team)} disabled>
          <legend>Team</legend>
          <igc-input name="team" label="Team name"></igc-input>
          <igc-checkbox name="invites" value="allowed" checked>
            Members can invite other people
          </igc-checkbox>
        </fieldset>
        <igc-checkbox name="terms" value="accepted" required>
          I agree to the
          <a href="#terms" @click=${openLink}>Terms of Service</a> and the
          <a href="#privacy" @click=${openLink}>Privacy Policy</a>
          <span slot="value-missing">
            Agree to the terms to create an account.
          </span>
        </igc-checkbox>
        <div class="cb-row">
          <igc-button type="submit">Create account</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
        <p class="muted" role="status" ${ref(status)}></p>
      </form>
    `;
  },
};

const launch = [
  {
    group: 'Before the release',
    tasks: [
      'Freeze the code',
      'Run the end-to-end tests',
      'Update the changelog',
    ],
  },
  {
    group: 'Release',
    tasks: ['Publish the package', 'Deploy the documentation'],
  },
  {
    group: 'After the release',
    tasks: ['Announce the release', 'Close the milestone'],
  },
];

export const Checklist: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The checklist of a software release. Each group is a fieldset with a legend, so a screen reader announces the group with its tasks. The progress bar counts the checked tasks, and it has an `aria-label`. The `label` part has the `checked` part name too, so `::part(label checked)` strikes through the label of a done task. Reset unchecks all the tasks.',
      },
    },
  },
  render: () => {
    const total = launch.flatMap(({ tasks }) => tasks).length;
    let root: HTMLElement | undefined;

    const update = () => {
      if (!root) {
        return;
      }

      const done = [...root.querySelectorAll('igc-checkbox')].filter(
        ({ checked }) => checked
      ).length;

      root.querySelector('igc-linear-progress')!.value = done;
      root.querySelector('.cb-progress-text')!.textContent =
        done === total
          ? 'All tasks are done. Ship it!'
          : `${done} of ${total} tasks done`;
    };

    const reset = () => {
      for (const checkbox of root!.querySelectorAll('igc-checkbox')) {
        checkbox.checked = false;
      }
      update();
    };

    return html`
      ${styles}
      <style>
        .cb-checklist fieldset {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          border: 0;
        }

        .cb-checklist legend {
          margin-block-end: 0.5rem;
          font-weight: 600;
        }

        .cb-checklist igc-checkbox::part(label checked) {
          color: var(--ig-gray-600);
          text-decoration: line-through;
        }
      </style>
      <section
        class="cb-stack cb-panel cb-checklist"
        aria-labelledby="cb-checklist-title"
        @igcChange=${update}
        ${ref((element) => {
          root = element as HTMLElement | undefined;
          update();
        })}
      >
        <h3 id="cb-checklist-title">Release 4.2</h3>
        <div class="cb-row">
          <igc-linear-progress
            aria-label="Release progress"
            max=${total}
            hide-label
            style="flex: 1"
          ></igc-linear-progress>
          <span class="cb-progress-text muted"></span>
        </div>
        ${launch.map(
          ({ group, tasks }) => html`
            <fieldset>
              <legend>${group}</legend>
              ${tasks.map((task) => html`<igc-checkbox>${task}</igc-checkbox>`)}
            </fieldset>
          `
        )}
        <div>
          <igc-button variant="outlined" @click=${reset}>Reset</igc-button>
        </div>
      </section>
    `;
  },
};
