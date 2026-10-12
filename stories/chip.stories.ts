import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcChipComponent,
  IgcIconComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcChipComponent,
  IgcIconComponent
);

registerMaterialIcons(
  'assignment-return',
  'headset-mic',
  'home',
  'local-shipping',
  'work'
);

// region default
const metadata: Meta<IgcChipComponent> = {
  title: 'Chip',
  component: 'igc-chip',
  parameters: {
    docs: {
      description: {
        component:
          'Chips help people enter information, make selections, filter content, or trigger actions.',
      },
    },
    actions: { handles: ['igcRemove', 'igcSelect'] },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
      description: 'Whether the chip is disabled or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    removable: {
      type: 'boolean',
      description: 'Whether the chip is removable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the chip is outlined or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selectable: {
      type: 'boolean',
      description: 'Whether the chip is selectable or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    selected: {
      type: 'boolean',
      description: 'Whether the chip is selected or not.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      type: {
        name: 'enum',
        value: ['primary', 'info', 'success', 'warning', 'danger'],
      },
      description:
        'A property that sets the color variant of the chip component.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
    },
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings. Falls back to the global locale.',
      control: 'text',
    },
  },
  args: {
    disabled: false,
    removable: false,
    outlined: false,
    selectable: false,
    selected: false,
  },
};

export default metadata;

interface IgcChipArgs {
  /** Whether the chip is disabled or not. */
  disabled: boolean;
  /** Whether the chip is removable or not. */
  removable: boolean;
  /** Whether the chip is outlined or not. */
  outlined: boolean;
  /** Whether the chip is selectable or not. */
  selectable: boolean;
  /** Whether the chip is selected or not. */
  selected: boolean;
  /** A property that sets the color variant of the chip component. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** The locale for the resource strings. Falls back to the global locale. */
  locale: string;
}
type Story = StoryObj<IgcChipArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ch-stack {
      display: grid;
      gap: 1rem;
      max-width: 44rem;
    }

    .ch-stack :is(p, ul, ol) {
      margin: 0;
    }

    .ch-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ch-chips {
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
          'A chip with an icon in the `prefix` slot. Use the controls panel to change the state. `selectable` makes the chip toggle `selected` and expose `aria-pressed`, and a selected chip shows a check icon. `removable` adds a remove control, which emits `igcRemove`: the chip does not remove itself. The chip is always a button, so use it for something that the user activates. For a label that does nothing, use `igc-badge`. The other stories show the four kinds of chips: filter, input, suggestion and label filter.',
      },
    },
  },
  render: (args) => html`
    <igc-chip
      .disabled=${args.disabled}
      .removable=${args.removable}
      .selectable=${args.selectable}
      .selected=${args.selected}
      .outlined=${args.outlined}
      variant=${ifDefined(args.variant)}
      locale=${ifDefined(args.locale)}
    >
      <igc-icon slot="prefix" name="work"></igc-icon>
      Remote
    </igc-chip>
  `,
};

const jobs = [
  {
    title: 'Front-end developer',
    company: 'Acme',
    type: 'Full time',
    place: 'Remote',
    level: 'Senior',
  },
  {
    title: 'Product designer',
    company: 'Northwind',
    type: 'Full time',
    place: 'Hybrid',
    level: 'Mid',
  },
  {
    title: 'Data analyst',
    company: 'Contoso',
    type: 'Contract',
    place: 'Remote',
    level: 'Mid',
  },
  {
    title: 'QA engineer',
    company: 'Fabrikam',
    type: 'Part time',
    place: 'On site',
    level: 'Junior',
  },
  {
    title: 'Engineering manager',
    company: 'Acme',
    type: 'Full time',
    place: 'On site',
    level: 'Senior',
  },
  {
    title: 'Technical writer',
    company: 'Litware',
    type: 'Contract',
    place: 'Remote',
    level: 'Junior',
  },
  {
    title: 'Back-end developer',
    company: 'Northwind',
    type: 'Full time',
    place: 'Remote',
    level: 'Mid',
  },
];

type Job = (typeof jobs)[number];

const facets: { key: keyof Job; label: string; options: string[] }[] = [
  {
    key: 'type',
    label: 'Job type',
    options: ['Full time', 'Part time', 'Contract'],
  },
  {
    key: 'place',
    label: 'Workplace',
    options: ['Remote', 'Hybrid', 'On site'],
  },
  { key: 'level', label: 'Level', options: ['Junior', 'Mid', 'Senior'] },
];

export const Filters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The filters of a job board. Each option is a `selectable` chip, so it toggles `selected` and exposes `aria-pressed`. Each group of chips has the `group` role and the name of its heading. Within a group a job must match one of the selected options, and it must match all the groups. The `igcSelect` handler reads the new state from `detail`. "Clear filters" sets `selected` from code, which emits no `igcSelect`. The number of jobs is a status message, so a screen reader announces it.',
      },
    },
  },
  render: () => {
    const active = new Map(facets.map(({ key }) => [key, new Set<string>()]));

    const toggle =
      (key: keyof Job, option: string) =>
      ({ detail }: CustomEvent<boolean>) => {
        if (detail) {
          active.get(key)!.add(option);
        } else {
          active.get(key)!.delete(option);
        }
        update();
      };

    const clear = () => {
      for (const options of active.values()) {
        options.clear();
      }
      update();
    };

    const { mount, update } = renderInto(() => {
      const matches = jobs.filter((job) =>
        [...active].every(
          ([key, options]) => !options.size || options.has(job[key])
        )
      );
      const filtered = [...active.values()].some(({ size }) => size);

      return html`
        ${facets.map(
          ({ key, label, options }) => html`
            <div class="ch-facet">
              <span id="ch-facet-${key}" class="muted">${label}</span>
              <div
                class="ch-chips"
                role="group"
                aria-labelledby="ch-facet-${key}"
              >
                ${options.map(
                  (option) => html`
                    <igc-chip
                      selectable
                      .selected=${active.get(key)!.has(option)}
                      @igcSelect=${toggle(key, option)}
                    >
                      ${option}
                    </igc-chip>
                  `
                )}
              </div>
            </div>
          `
        )}
        <div class="ch-chips">
          <p role="status">
            ${matches.length} ${matches.length === 1 ? 'job' : 'jobs'}
          </p>
          <igc-button variant="outlined" ?disabled=${!filtered} @click=${clear}>
            Clear filters
          </igc-button>
        </div>
        <ul class="ch-jobs" aria-label="Jobs">
          ${matches.map(
            ({ title, company, type, place, level }) => html`
              <li>
                <strong>${title}</strong>
                <span class="muted">
                  ${company} · ${type} · ${place} · ${level}
                </span>
              </li>
            `
          )}
        </ul>
      `;
    });

    return html`
      ${styles}
      <style>
        .ch-facet {
          display: grid;
          gap: 0.375rem;
        }

        .ch-jobs {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .ch-jobs li {
          display: grid;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 6px;
        }
      </style>
      <section
        class="ch-stack ch-panel"
        aria-label="Job search"
        ${mount}
      ></section>
    `;
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The label of an address that is not valid. The hidden text puts it in the name of the chip. */
const invalidLabel = (email: string) =>
  html`${email}<span class="sr-only">(not a valid address)</span>`;

export const Recipients: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The recipients field of an email form. Type an address and press Enter or a comma, or paste a list. Each address becomes a `removable` chip with an avatar in the `start` slot. Backspace in the empty field removes the last chip. The remove control has the label "remove chip" on every chip, so each chip sets `resourceStrings.chip_remove` to a label with its address. After a removal, the focus moves back to the text field, because the chip that had the focus is gone. An address that is not valid gets `variant="danger"` and a hidden text, because a color alone means nothing to assistive technologies.',
      },
    },
  },
  render: () => {
    const recipients = ['maya.patel@example.com', 'daniel@example.com'];
    let message = '';

    const input = () => story.host!.querySelector<HTMLInputElement>('#ch-to')!;
    const isValid = (email: string) => emailPattern.test(email);
    const initials = (email: string) =>
      email
        .split('@')[0]
        .split(/[._-]/)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2);

    const commit = () => {
      const field = input();
      const entries = field.value
        .split(/[\s,;]+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry && !recipients.includes(entry));

      recipients.push(...entries);
      field.value = '';
      message = '';
      story.update();
    };

    const remove = (email: string) => () => {
      recipients.splice(recipients.indexOf(email), 1);
      message = `Removed ${email}.`;
      story.update();
      input().focus();
    };

    const keydown = (event: KeyboardEvent) => {
      const field = event.target as HTMLInputElement;

      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        commit();
      } else if (
        event.key === 'Backspace' &&
        !field.value &&
        recipients.length
      ) {
        remove(recipients.at(-1)!)();
      }
    };

    const pasted = (event: Event) => {
      if ((event as InputEvent).inputType === 'insertFromPaste') {
        commit();
      }
    };

    const send = () => {
      message = `We sent the message to ${recipients.length} ${
        recipients.length === 1 ? 'person' : 'people'
      }.`;
      story.update();
    };

    const story = renderInto(() => {
      const invalid = recipients.filter((email) => !isValid(email));

      return html`
        <div class="ch-field">
          <label for="ch-to">To</label>
          <div class="ch-chips">
            ${recipients.map((email) => {
              const valid = isValid(email);

              return html`
                <igc-chip
                  removable
                  variant=${ifDefined(valid ? undefined : 'danger')}
                  .resourceStrings=${{ chip_remove: `Remove ${email}` }}
                  @igcRemove=${remove(email)}
                >
                  <igc-avatar
                    slot="start"
                    shape="circle"
                    initials=${initials(email)}
                    aria-hidden="true"
                  ></igc-avatar>
                  ${valid ? email : invalidLabel(email)}
                </igc-chip>
              `;
            })}
            <input
              id="ch-to"
              autocomplete="off"
              aria-describedby="ch-to-hint"
              @keydown=${keydown}
              @input=${pasted}
              @blur=${commit}
            />
          </div>
        </div>
        <p id="ch-to-hint" class="muted">
          ${
            invalid.length
              ? `Check ${invalid.length === 1 ? 'the address' : 'the addresses'}: ${invalid.join(', ')}.`
              : 'Separate the addresses with a comma or Enter.'
          }
        </p>
        <div class="ch-chips">
          <igc-button
            ?disabled=${!recipients.length || invalid.length > 0}
            @click=${send}
          >
            Send
          </igc-button>
          <p class="muted" role="status">${message}</p>
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .ch-field {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--ig-gray-400);
          border-radius: 6px;
        }

        .ch-field:focus-within {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: -1px;
        }

        .ch-field igc-avatar {
          --ig-size: 1;
        }

        .ch-field input {
          flex: 1;
          min-width: 10rem;
          padding-block: 0.25rem;
          border: 0;
          outline: none;
          background: none;
          color: inherit;
          font: inherit;
        }
      </style>
      <section
        class="ch-stack ch-panel"
        aria-label="New message"
        ${story.mount}
      ></section>
    `;
  },
};

type Reply = 'track' | 'return' | 'address' | 'agent';

const replies: Record<
  Reply,
  { label: string; icon: string; answer: string; disabled?: boolean }
> = {
  track: {
    label: 'Track my order',
    icon: 'local-shipping',
    answer:
      'Your order 4521 left the warehouse today. It arrives on Thursday between 9:00 and 13:00.',
  },
  return: {
    label: 'Return an item',
    icon: 'assignment-return',
    answer:
      'You can return an item for 30 days. We sent a return label to your email.',
  },
  address: {
    label: 'Change my address',
    icon: 'home',
    answer:
      'You can change the address until the order ships. Open Account, and then Addresses.',
  },
  agent: {
    label: 'Talk to a person',
    icon: 'headset-mic',
    answer: '',
    disabled: true,
  },
};

export const Suggestions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The suggested replies of a support assistant. A suggestion is a chip that is not selectable, so it is a plain button, and a click sends its text. The story then removes the suggestion, so the chip with the focus is gone. The handler calls `focus()` on the first chip that is left, and the chip delegates the focus to its button. `repeat` with a key renders the chips, so Lit removes the chip of the sent suggestion and does not reuse it for another label. "Start over" appears when no suggestion is left. "Talk to a person" is `disabled`, and the text under the chips tells why, because a disabled chip is not focusable. The message list is a polite live region.',
      },
    },
  },
  render: () => {
    const greeting = {
      from: 'bot',
      text: 'Hi! I am the Acme assistant. How can I help you?',
    };
    let chat = [greeting];
    const asked = new Set<Reply>();
    let log: HTMLElement | undefined;
    let group: HTMLElement | undefined;

    /** The chip that had the focus is gone, so the focus moves to the first chip that is left. */
    const focusFirst = async () => {
      const chip = group!.querySelector<IgcChipComponent>(
        'igc-chip:not([disabled])'
      );

      await chip?.updateComplete;
      chip?.focus();
    };

    const send = (key: Reply) => () => {
      asked.add(key);
      chat.push(
        { from: 'user', text: replies[key].label },
        { from: 'bot', text: replies[key].answer }
      );
      update();
      focusFirst();
    };

    const restart = () => {
      asked.clear();
      chat = [greeting];
      update();
      focusFirst();
    };

    const update = () => {
      if (!(log && group)) {
        return;
      }

      const left = (Object.keys(replies) as Reply[]).filter(
        (key) => !asked.has(key)
      );

      render(
        html`
          ${chat.map(
            ({ from, text }) => html`
              <li class="ch-message ch-${from}">
                <span class="sr-only">
                  ${from === 'bot' ? 'Assistant:' : 'You:'}
                </span>
                ${text}
              </li>
            `
          )}
        `,
        log
      );
      log.lastElementChild?.scrollIntoView({ block: 'nearest' });

      render(
        html`
          ${repeat(
            left,
            (key) => key,
            (key) => {
              const { label, icon, disabled } = replies[key];

              return html`
                <igc-chip ?disabled=${disabled} @click=${send(key)}>
                  <igc-icon slot="prefix" name=${icon}></igc-icon>
                  ${label}
                </igc-chip>
              `;
            }
          )}
          ${
            left.some((key) => !replies[key].disabled)
              ? nothing
              : html`<igc-chip @click=${restart}>Start over</igc-chip>`
          }
        `,
        group
      );
    };

    const mount = (element?: Element) => {
      if (element) {
        log = element.querySelector('ol')!;
        group = element.querySelector<HTMLElement>('[role=group]')!;
        update();
      } else {
        log = group = undefined;
      }
    };

    return html`
      ${styles}
      <style>
        .ch-log {
          display: grid;
          gap: 0.5rem;
          max-height: 16rem;
          padding: 0;
          overflow: auto;
          list-style: none;
        }

        .ch-message {
          max-width: 80%;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
        }

        .ch-bot {
          justify-self: start;
          background: var(--ig-gray-100);
        }

        .ch-user {
          justify-self: end;
          background: var(--ig-primary-500);
          color: var(--ig-primary-500-contrast);
        }
      </style>
      <section
        class="ch-stack ch-panel"
        aria-label="Support chat"
        ${ref(mount)}
      >
        <ol class="ch-log" aria-label="Messages" aria-live="polite"></ol>
        <div class="ch-chips" role="group" aria-label="Suggested replies"></div>
        <p class="muted">
          All our agents are busy. Try "Talk to a person" again later.
        </p>
      </section>
    `;
  },
};

const labels = {
  bug: { name: 'bug', variant: 'danger' },
  feature: { name: 'feature', variant: 'info' },
  docs: { name: 'documentation', variant: 'success' },
  triage: { name: 'needs triage', variant: 'warning' },
  good: { name: 'good first issue', variant: 'primary' },
} as const;

type Label = keyof typeof labels;

const issues: { id: number; title: string; labels: Label[] }[] = [
  {
    id: 2412,
    title: 'The date picker loses the focus on close',
    labels: ['bug'],
  },
  {
    id: 2398,
    title: 'Add a label to the date range descriptor',
    labels: ['feature', 'good'],
  },
  {
    id: 2381,
    title: 'Document the slots of the carousel slide',
    labels: ['docs', 'good'],
  },
  {
    id: 2377,
    title: 'The remove control has the same label on every chip',
    labels: ['bug', 'triage'],
  },
  { id: 2364, title: 'Support a vertical button group', labels: ['feature'] },
  { id: 2350, title: 'A typo in the theming guide', labels: ['docs'] },
];

export const Labels: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The issue list of a project. The label filters are `selectable` and `outlined` chips, and `variant` gives each label its color. The selected labels must all be on an issue. The labels in the list do nothing when the user clicks them, so they are `igc-badge` elements with the same variants, and not chips, because a chip is always a button and a tab stop.',
      },
    },
  },
  render: () => {
    const active = new Set<Label>();

    const toggle =
      (label: Label) =>
      ({ detail }: CustomEvent<boolean>) => {
        if (detail) {
          active.add(label);
        } else {
          active.delete(label);
        }
        update();
      };

    const { mount, update } = renderInto(() => {
      const matches = issues.filter((issue) =>
        [...active].every((label) => issue.labels.includes(label))
      );

      return html`
        <div class="ch-chips" role="group" aria-label="Filter by label">
          ${Object.entries(labels).map(
            ([key, { name, variant }]) => html`
              <igc-chip
                selectable
                outlined
                variant=${variant}
                .selected=${active.has(key as Label)}
                @igcSelect=${toggle(key as Label)}
              >
                ${name}
              </igc-chip>
            `
          )}
        </div>
        <p class="muted" role="status">
          ${matches.length} open ${matches.length === 1 ? 'issue' : 'issues'}
        </p>
        <ul class="ch-issues" aria-label="Issues">
          ${matches.map(
            ({ id, title, labels: issueLabels }) => html`
              <li>
                <span class="muted">#${id}</span>
                <span>${title}</span>
                <span class="ch-chips">
                  ${issueLabels.map(
                    (label) => html`
                      <igc-badge variant=${labels[label].variant}>
                        ${labels[label].name}
                      </igc-badge>
                    `
                  )}
                </span>
              </li>
            `
          )}
        </ul>
      `;
    });

    return html`
      ${styles}
      <style>
        .ch-issues {
          display: grid;
          padding: 0;
          list-style: none;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .ch-issues li {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.25rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }
      </style>
      <section class="ch-stack ch-panel" aria-label="Issues" ${mount}></section>
    `;
  },
};
