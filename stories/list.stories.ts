import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { addMonths, formatDate, today } from './story-dates.js';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import { plural, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcSwitchComponent
);

registerMaterialIcons(
  'alert-error',
  'archive',
  'call',
  'call-made',
  'call-missed',
  'call-received',
  'description',
  'done-all',
  'email',
  'folder',
  'lock',
  'movie',
  'music-note',
  'notifications',
  'visibility',
  'volume-up'
);

// region default
const metadata: Meta<IgcListComponent> = {
  title: 'List',
  component: 'igc-list',
  parameters: {
    docs: {
      description: {
        component:
          'Displays a collection of data items in a templatable list format.',
      },
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ls-panel {
      max-width: 32rem;
    }

    .ls-call {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .ls-call igc-icon {
      --ig-icon-size: 1rem;
    }

    .ls-call.missed igc-icon {
      color: var(--ig-error-500);
    }

    igc-list-item label {
      cursor: pointer;
    }

    .ls-tickets {
      display: grid;
      grid-template-columns: minmax(16rem, 24rem) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
      max-width: 56rem;
    }

    .ls-tickets igc-list-item {
      border-inline-start: 3px solid transparent;
    }

    .ls-tickets igc-list-item[selected] {
      border-inline-start-color: var(--ig-primary-500);
    }

    .ls-tickets igc-list-item::part(content) {
      min-width: 0;
    }

    .ls-tickets igc-list-item:has(.ls-open:focus-visible) {
      outline: 2px solid var(--ig-primary-500);
      outline-offset: -2px;
    }

    .ls-open {
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .ls-open:focus-visible {
      outline: none;
    }

    /* The button covers the whole row. The item host has position: relative. */
    .ls-open::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    .ls-preview {
      display: block;
      font-size: 0.875rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .ls-urgent {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 600;
    }

    .ls-urgent igc-icon {
      --ig-icon-size: 1.125rem;

      color: var(--ig-error-500);
    }

    .ls-detail {
      display: grid;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ls-detail :is(h3, p) {
      margin: 0;
    }

    .ls-storage {
      display: grid;
      gap: 0.75rem;
      max-width: 36rem;
    }

    .ls-storage :is(h3, p) {
      margin: 0;
    }

    .ls-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .ls-size {
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 40rem) {
      .ls-tickets {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  </style>
`;

type CallKind = 'missed' | 'incoming' | 'outgoing';

const callKinds: Record<CallKind, { icon: MaterialIconName; label: string }> = {
  missed: { icon: 'call-missed', label: 'Missed' },
  incoming: { icon: 'call-received', label: 'Incoming' },
  outgoing: { icon: 'call-made', label: 'Outgoing' },
};

const calls: {
  name: string;
  initials: string;
  kind: CallKind;
  time: string;
}[] = [
  { name: 'Maria Garcia', initials: 'MG', kind: 'missed', time: '9:42 AM' },
  { name: 'Liam Chen', initials: 'LC', kind: 'outgoing', time: '8:15 AM' },
  { name: 'Aiko Tanaka', initials: 'AT', kind: 'incoming', time: 'Yesterday' },
  {
    name: 'Daniel Okafor',
    initials: 'DO',
    kind: 'missed',
    time: 'Yesterday',
  },
  { name: 'Emma Novak', initials: 'EN', kind: 'incoming', time: 'Monday' },
];

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The recent calls of a phone application. Each item fills the slots of `igc-list-item`: the avatar goes in `start`, the name in `title`, the kind and the time of the call in `subtitle`, and the call button in `end`. The list has the `list` role and the items have the `listitem` role, so a screen reader announces the number of calls. The avatar repeats the name, so it has `aria-hidden="true"`, and each call button names the person. The color of the missed call icon is not the only sign, because the subtitle also says "Missed". Use the size toolbar of Storybook to change `--ig-size`, which sets the padding of the items.',
      },
    },
  },
  render: () => html`
    ${styles}
    <igc-list class="ls-panel" aria-label="Recent calls">
      ${calls.map(({ name, initials, kind, time }) => {
        const { icon, label } = callKinds[kind];

        return html`
          <igc-list-item>
            <igc-avatar
              slot="start"
              shape="circle"
              initials=${initials}
              aria-hidden="true"
            ></igc-avatar>
            <span slot="title">${name}</span>
            <span slot="subtitle" class="ls-call ${kind}">
              <igc-icon name=${icon} aria-hidden="true"></igc-icon>
              ${label} · ${time}
            </span>
            <igc-icon-button
              slot="end"
              variant="flat"
              name="call"
              aria-label="Call ${name}"
            ></igc-icon-button>
          </igc-list-item>
        `;
      })}
    </igc-list>
  `,
};

type SettingId =
  | 'email'
  | 'push'
  | 'sounds'
  | 'status'
  | 'receipts'
  | 'two-step';

const settingGroups: {
  heading: string;
  settings: {
    id: SettingId;
    icon: MaterialIconName;
    title: string;
    detail: string;
  }[];
}[] = [
  {
    heading: 'Notifications',
    settings: [
      {
        id: 'email',
        icon: 'email',
        title: 'Weekly summary',
        detail: 'An email with the activity of the week, every Monday',
      },
      {
        id: 'push',
        icon: 'notifications',
        title: 'Push notifications',
        detail: 'Mentions and direct messages',
      },
      {
        id: 'sounds',
        icon: 'volume-up',
        title: 'Sounds',
        detail: 'Play a sound for each push notification',
      },
    ],
  },
  {
    heading: 'Privacy',
    settings: [
      {
        id: 'status',
        icon: 'visibility',
        title: 'Online status',
        detail: 'Show other people when you are active',
      },
      {
        id: 'receipts',
        icon: 'done-all',
        title: 'Read receipts',
        detail: 'Show other people when you read their messages',
      },
      {
        id: 'two-step',
        icon: 'lock',
        title: 'Two-step verification',
        detail: 'Ask for a code at each new sign-in',
      },
    ],
  },
];

export const Settings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The settings page of a chat application. An `igc-list-header` starts each group of settings. The header has the `listitem` role, so a screen reader reads it and counts it with the settings. It holds a heading, so a screen reader user can go from group to group by heading. Each setting puts a native `label` in the `title` slot and a switch in the `end` slot. The `for` attribute of the label points to the switch, so the label names the switch, and a click on the label toggles it. The sounds depend on the push notifications: when the push notifications are off, the sounds switch is `disabled`, and its subtitle tells why.',
      },
    },
  },
  render: () => {
    const enabled: Record<SettingId, boolean> = {
      email: true,
      push: true,
      sounds: false,
      status: true,
      receipts: false,
      'two-step': true,
    };

    const story = renderInto(
      () => html`
        <igc-list class="ls-panel">
          ${settingGroups.map(
            ({ heading, settings }) => html`
              <igc-list-header><h3>${heading}</h3></igc-list-header>
              ${settings.map(({ id, icon, title, detail }) => {
                const disabled = id === 'sounds' && !enabled.push;

                return html`
                  <igc-list-item>
                    <igc-icon
                      slot="start"
                      name=${icon}
                      aria-hidden="true"
                    ></igc-icon>
                    <label slot="title" for="ls-setting-${id}">${title}</label>
                    <span slot="subtitle">
                      ${
                        disabled
                          ? 'Turn on push notifications to play sounds'
                          : detail
                      }
                    </span>
                    <igc-switch
                      slot="end"
                      id="ls-setting-${id}"
                      .checked=${enabled[id]}
                      ?disabled=${disabled}
                      @igcChange=${({
                        detail,
                      }: CustomEvent<{ checked: boolean }>) => {
                        enabled[id] = detail.checked;
                        story.update();
                      }}
                    ></igc-switch>
                  </igc-list-item>
                `;
              })}
            `
          )}
        </igc-list>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type Ticket = {
  id: string;
  subject: string;
  customer: string;
  initials: string;
  received: string;
  urgent?: boolean;
  message: string;
};

const openTickets: Ticket[] = [
  {
    id: 'T-1042',
    subject: 'Cannot download the invoice for September',
    customer: 'Sofía Díaz',
    initials: 'SD',
    received: '10 min ago',
    urgent: true,
    message:
      'The download button on the billing page shows an error since this morning. Our accountant needs the invoice today to close the month.',
  },
  {
    id: 'T-1041',
    subject: 'Change the billing email',
    customer: 'Liam Chen',
    initials: 'LC',
    received: '1 hour ago',
    message:
      'Please send our invoices to accounts@northwind.example from now on, and not to my personal address.',
  },
  {
    id: 'T-1039',
    subject: 'Add three seats to our plan',
    customer: 'Grace Okafor',
    initials: 'GO',
    received: '3 hours ago',
    message:
      'Three new designers join the team on Monday. Can you add three seats to our annual plan, and send us the updated quote?',
  },
  {
    id: 'T-1036',
    subject: 'The mobile app signs me out',
    customer: 'Omar Haddad',
    initials: 'OH',
    received: 'Yesterday',
    urgent: true,
    message:
      'The iOS app signs me out each time I lock the phone. I use version 4.2 on an iPhone 15.',
  },
];

export const Tickets: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The queue of a support desk, with the selected ticket on the right. The list does not manage a selection: the application sets `selected` on the item of the open ticket, and a CSS rule on `igc-list-item[selected]` adds a colored edge. `selected` only changes the style, and the `listitem` role has no selected state. So the subject of each ticket is a native button with `aria-current="true"` on the open ticket. A pseudo-element stretches the button over the whole row, so a click anywhere in the row opens the ticket, and the row shows the focus ring. The list has no keyboard navigation of its own, so the Tab key moves from button to button. The start of the message goes in the default slot, under the title and the subtitle. The `content` part gets `min-width: 0`, so the message can end with an ellipsis. Resolve a ticket to remove it from the queue: the next ticket opens.',
      },
    },
  },
  render: () => {
    let tickets = [...openTickets];
    let current: Ticket | undefined = tickets[0];
    let status = '';

    const open = (ticket: Ticket) => {
      current = ticket;
      status = '';
      story.update();
    };

    const resolve = (ticket: Ticket) => {
      const index = tickets.indexOf(ticket);

      tickets = tickets.filter((each) => each !== ticket);
      current = tickets[Math.min(index, tickets.length - 1)];
      status = `${ticket.id} is resolved. ${plural(tickets.length, 'ticket is', 'tickets are')} open.`;
      story.update();

      // The Resolve button goes away with the last ticket.
      if (!current) {
        story.host!.querySelector<HTMLElement>('#ls-ticket-subject')!.focus();
      }
    };

    const story = renderInto(
      () => html`
        <div class="ls-tickets">
          <igc-list aria-label="Open tickets">
            ${repeat(
              tickets,
              ({ id }) => id,
              (ticket) => {
                const selected = ticket === current;

                return html`
                  <igc-list-item ?selected=${selected}>
                    <igc-avatar
                      slot="start"
                      shape="circle"
                      initials=${ticket.initials}
                      aria-hidden="true"
                    ></igc-avatar>
                    <button
                      slot="title"
                      class="ls-open"
                      aria-current=${ifDefined(selected ? 'true' : undefined)}
                      @click=${() => open(ticket)}
                    >
                      ${ticket.subject}
                    </button>
                    <span slot="subtitle">
                      ${ticket.customer} · ${ticket.received}
                    </span>
                    <span class="ls-preview muted">${ticket.message}</span>
                    ${
                      ticket.urgent
                        ? html`
                            <span slot="end" class="ls-urgent">
                              <igc-icon
                                name="alert-error"
                                aria-hidden="true"
                              ></igc-icon>
                              Urgent
                            </span>
                          `
                        : ''
                    }
                  </igc-list-item>
                `;
              }
            )}
          </igc-list>
          <section class="ls-detail" aria-labelledby="ls-ticket-subject">
            ${
              current
                ? html`
                    <h3 id="ls-ticket-subject">${current.subject}</h3>
                    <p class="muted">
                      ${current.id} · ${current.customer} · ${current.received}
                    </p>
                    <p>${current.message}</p>
                    <div>
                      <igc-button @click=${() => resolve(current!)}>
                        Resolve
                      </igc-button>
                    </div>
                  `
                : html`
                    <h3 id="ls-ticket-subject" tabindex="-1">
                      No open tickets
                    </h3>
                  `
            }
          </section>
        </div>
        <p class="muted" role="status">${status}</p>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type StoredFile = {
  id: string;
  name: string;
  icon: MaterialIconName;
  size: number;
  opened: Date;
};

const largeFiles: StoredFile[] = [
  {
    id: 'keynote',
    name: 'Product launch keynote.mp4',
    icon: 'movie',
    size: 4.2,
    opened: addMonths(today, -8),
  },
  {
    id: 'offsite',
    name: 'Team offsite photos.zip',
    icon: 'archive',
    size: 2.7,
    opened: addMonths(today, -14),
  },
  {
    id: 'interviews',
    name: 'Customer interviews.wav',
    icon: 'music-note',
    size: 1.9,
    opened: addMonths(today, -5),
  },
  {
    id: 'backup',
    name: 'Design system backup.pdf',
    icon: 'description',
    size: 1.1,
    opened: addMonths(today, -3),
  },
  {
    id: 'recordings',
    name: 'Screen recordings',
    icon: 'folder',
    size: 0.8,
    opened: addMonths(today, -11),
  },
];

const quota = 15;
const otherFiles = 3.4;

const gigabytes = (size: number) => `${size.toFixed(1)} GB`;

export const FreeUpSpace: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The storage page of a cloud drive, which lists the largest files. Each item has a checkbox and an icon in the `start` slot, and a native `label` for the checkbox in the `title` slot, so a click on the name selects the file. The application sets `selected` on the item of each checked file, so the selected rows stand out. The summary counts the selected files and their size, and Delete removes them. The progress bar shows the used storage, and `aria-labelledby` gives it a name.',
      },
    },
  },
  render: () => {
    let files = [...largeFiles];
    const checked = new Set<string>();
    let status = '';

    const toggle = (id: string, value: boolean) => {
      if (value) {
        checked.add(id);
      } else {
        checked.delete(id);
      }
      status = '';
      story.update();
    };

    const remove = () => {
      const count = checked.size;

      files = files.filter(({ id }) => !checked.has(id));
      checked.clear();
      status = `${plural(count, 'file is', 'files are')} deleted.`;
      story.update();

      // A disabled button cannot keep the focus.
      (
        story.host!.querySelector<HTMLElement>('igc-checkbox') ??
        story.host!.querySelector<HTMLElement>('#ls-storage-heading')!
      ).focus();
    };

    const story = renderInto(() => {
      const used = files.reduce((sum, { size }) => sum + size, otherFiles);
      const selectedSize = files
        .filter(({ id }) => checked.has(id))
        .reduce((sum, { size }) => sum + size, 0);

      return html`
        <section class="ls-storage" aria-labelledby="ls-storage-heading">
          <h3 id="ls-storage-heading" tabindex="-1">Free up space</h3>
          <p id="ls-usage">${gigabytes(used)} of ${quota} GB used</p>
          <igc-linear-progress
            aria-labelledby="ls-usage"
            max=${quota}
            value=${used}
            variant=${used / quota > 0.9 ? 'danger' : 'primary'}
            hide-label
          ></igc-linear-progress>
          <igc-list aria-label="Largest files">
            ${repeat(
              files,
              ({ id }) => id,
              ({ id, name, icon, size, opened }) => {
                const selected = checked.has(id);

                return html`
                  <igc-list-item ?selected=${selected}>
                    <igc-checkbox
                      slot="start"
                      id="ls-file-${id}"
                      .checked=${selected}
                      @igcChange=${({
                        detail,
                      }: CustomEvent<{ checked: boolean }>) =>
                        toggle(id, detail.checked)}
                    ></igc-checkbox>
                    <igc-icon
                      slot="start"
                      name=${icon}
                      aria-hidden="true"
                    ></igc-icon>
                    <label slot="title" for="ls-file-${id}">${name}</label>
                    <span slot="subtitle">
                      Last opened
                      ${formatDate(opened, { month: 'short', year: 'numeric' })}
                    </span>
                    <span slot="end" class="ls-size">${gigabytes(size)}</span>
                  </igc-list-item>
                `;
              }
            )}
          </igc-list>
          <div class="ls-row">
            <span>
              ${
                checked.size
                  ? `${checked.size} selected · ${gigabytes(selectedSize)}`
                  : 'Select the files to delete'
              }
            </span>
            <igc-button ?disabled=${!checked.size} @click=${remove}>
              Delete
            </igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </section>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
