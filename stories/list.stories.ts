import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { addMonths, formatDate, today } from './story-dates.js';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  dollars,
  plural,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
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
  'delete',
  'description',
  'done-all',
  'email',
  'folder',
  'headset-mic',
  'keyboard',
  'lock',
  'minus',
  'movie',
  'music-note',
  'notifications',
  'plus',
  'videocam',
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
  argTypes: {
    navigation: {
      type: { name: 'enum', value: ['none', 'listbox', 'grid'] },
      description:
        'The keyboard navigation of the list.\n\n- `none`: a static list. Its items are not focusable.\n- `listbox`: the list is one tab stop. The arrow keys, Home, End and typed\n  letters move between the items, and Enter or Space clicks the focused\n  item. An item holds no interactive content.\n- `grid`: as `listbox`, for items that hold controls. Left and Right move\n  between an item and its controls, and Escape or F2 returns to the item.\n  A control that uses the arrow keys, such as a text field, keeps them.\n\nThe app owns the selection: it toggles `selected` on the items and sets\n`aria-multiselectable="true"` on the list for a multiple selection. In a\ngrid, an item that is not selected exposes its state only with\n`aria-multiselectable`.',
      options: ['none', 'listbox', 'grid'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'none' } },
    },
  },
  args: { navigation: 'none' },
};

export default metadata;

interface IgcListArgs {
  /**
   * The keyboard navigation of the list.
   *
   * - `none`: a static list. Its items are not focusable.
   * - `listbox`: the list is one tab stop. The arrow keys, Home, End and typed
   *   letters move between the items, and Enter or Space clicks the focused
   *   item. An item holds no interactive content.
   * - `grid`: as `listbox`, for items that hold controls. Left and Right move
   *   between an item and its controls, and Escape or F2 returns to the item.
   *   A control that uses the arrow keys, such as a text field, keeps them.
   *
   * The app owns the selection: it toggles `selected` on the items and sets
   * `aria-multiselectable="true"` on the list for a multiple selection. In a
   * grid, an item that is not selected exposes its state only with
   * `aria-multiselectable`.
   */
  navigation: 'none' | 'listbox' | 'grid';
}
type Story = StoryObj<IgcListArgs>;

// endregion

// A list with navigation sets its roles through ElementInternals, which axe
// does not read, so axe sees a grid cell or the empty option without its
// parent. See `axeListInternalsRolesOptions` in the spec helpers.
metadata.parameters = {
  ...metadata.parameters,
  a11y: {
    config: { rules: [{ id: 'aria-required-parent', enabled: false }] },
  },
};

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

    .ls-tickets igc-list-item,
    .ls-storage igc-list-item,
    .ls-assignee igc-list-item {
      cursor: pointer;
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

    .ls-cart,
    .ls-assignee {
      display: grid;
      gap: 0.75rem;
      max-width: 36rem;
    }

    .ls-cart :is(h3, p),
    .ls-assignee :is(h3, p) {
      margin: 0;
    }

    .ls-quantity {
      min-width: 1.5rem;
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .ls-empty {
      display: block;
      padding: 1rem;
      text-align: center;
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
          'The recent calls of a phone application. Each item fills the slots of `igc-list-item`: the avatar goes in `start`, the name in `title`, the kind and the time of the call in `subtitle`, and the call button in `end`. The list has the `list` role and the items have the `listitem` role, so a screen reader announces the number of calls. The avatar repeats the name, so it has `aria-hidden="true"`, and each call button names the person. The color of the missed call icon is not the only sign, because the subtitle also says "Missed". Set `navigation` to `grid` in the controls: the list becomes one tab stop, Up and Down move between the calls, Right reaches the call button, and Left or Escape returns to the call. Use the size toolbar of Storybook to change `--ig-size`, which sets the padding of the items.',
      },
    },
  },
  render: ({ navigation }) => html`
    ${styles}
    <igc-list
      class="ls-panel"
      navigation=${navigation}
      aria-label="Recent calls"
    >
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
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The settings page of a chat application. The list is static: each switch is a stop of the Tab key, as in a form. An `igc-list-header` starts each group of settings. The header has the `listitem` role, so a screen reader reads it and counts it with the settings. It holds a heading, so a screen reader user can go from group to group by heading. Each setting puts a native `label` in the `title` slot and a switch in the `end` slot. The `for` attribute of the label points to the switch, so the label names the switch, and a click on the label toggles it. The sounds depend on the push notifications: when the push notifications are off, the sounds switch is `disabled`, and its subtitle tells why.',
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
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The queue of a support desk, with the open ticket on the right. The list has `navigation="listbox"`, so it is one stop of the Tab key: Up, Down, Home, End and the first letters of a subject move between the tickets, and Enter or Space opens the focused one. The list owns no selection. A `click` handler opens the ticket and sets `selected` on its item, so the item exposes `aria-selected="true"`, and a CSS rule on `igc-list-item[selected]` adds a colored edge. The subject in the `title` slot names each ticket, and the subtitle describes it, so a screen reader does not read the whole preview on each move. "Urgent" shows as an icon in the `end` slot, and the subtitle says it in hidden text, because the `end` slot is not read. The start of the message goes in the default slot. The `content` part gets `min-width: 0`, so the message can end with an ellipsis. Resolve a ticket to remove it from the queue: the next ticket opens.',
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
          <igc-list navigation="listbox" aria-label="Open tickets">
            ${repeat(
              tickets,
              ({ id }) => id,
              (ticket) => {
                const selected = ticket === current;

                return html`
                  <igc-list-item
                    ?selected=${selected}
                    @click=${() => open(ticket)}
                  >
                    <igc-avatar
                      slot="start"
                      shape="circle"
                      initials=${ticket.initials}
                      aria-hidden="true"
                    ></igc-avatar>
                    <span slot="title">${ticket.subject}</span>
                    <span slot="subtitle">
                      ${ticket.customer} ·
                      ${ticket.received}${
                        ticket.urgent
                          ? html`<span class="sr-only">(urgent)</span>`
                          : ''
                      }
                    </span>
                    <span class="ls-preview muted">${ticket.message}</span>
                    ${
                      ticket.urgent
                        ? html`
                            <span
                              slot="end"
                              class="ls-urgent"
                              aria-hidden="true"
                            >
                              <igc-icon name="alert-error"></igc-icon>
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
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The storage page of a cloud drive, which lists the largest files. The list has `navigation="listbox"` and `aria-multiselectable="true"`, so a screen reader reads each file as selected or not selected. A click on a file, or Enter or Space on the focused file, toggles its `selected` state in a `click` handler of the application. The checkbox in the `start` slot only shows that state: it is `inert`, so it is no stop of the Tab key and is not read, and a click on it reaches the item. The size goes in the subtitle, which describes the item. The summary counts the selected files and their size, and Delete removes them. The progress bar shows the used storage, and `aria-labelledby` gives it a name.',
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
        story.host!.querySelector<HTMLElement>('igc-list-item') ??
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
          <igc-list
            navigation="listbox"
            aria-label="Largest files"
            aria-multiselectable="true"
          >
            ${repeat(
              files,
              ({ id }) => id,
              ({ id, name, icon, size, opened }) => {
                const selected = checked.has(id);

                return html`
                  <igc-list-item
                    ?selected=${selected}
                    @click=${() => toggle(id, !selected)}
                  >
                    <igc-checkbox
                      slot="start"
                      inert
                      .checked=${selected}
                    ></igc-checkbox>
                    <igc-icon
                      slot="start"
                      name=${icon}
                      aria-hidden="true"
                    ></igc-icon>
                    <span slot="title">${name}</span>
                    <span slot="subtitle" class="ls-size">
                      ${gigabytes(size)} · Last opened
                      ${formatDate(opened, { month: 'short', year: 'numeric' })}
                    </span>
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

type CartLine = {
  id: string;
  name: string;
  icon: MaterialIconName;
  price: number;
  quantity: number;
};

const cartLines: CartLine[] = [
  {
    id: 'keyboard',
    name: 'Wireless keyboard',
    icon: 'keyboard',
    price: 79,
    quantity: 1,
  },
  {
    id: 'headset',
    name: 'Noise-cancelling headset',
    icon: 'headset-mic',
    price: 149,
    quantity: 1,
  },
  { id: 'webcam', name: '4K webcam', icon: 'videocam', price: 99, quantity: 2 },
];

const maxQuantity = 10;

export const Cart: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The cart of an online store. Each item holds Decrease, Increase and Remove buttons, so the list has `navigation="grid"`: each item is a row, and the list takes the buttons out of the order of the Tab key. Tab reaches one row and the next Tab leaves the cart. Up and Down move between the rows, also from a button. Right goes from the row to Decrease, Increase and Remove, and Left goes back; Escape or F2 returns to the row. The buttons stay enabled at the lowest and the highest quantity, because a focused button that becomes disabled loses the focus; the status line reads the limit instead. The subtitle holds the quantity, so a screen reader reads it with the row. Only selected items expose `aria-selected`, and the cart selects none, so a screen reader reads no selected state. When Remove takes a row away, the focus moves to the next row. The `empty` slot shows a message once the cart is empty, and the empty list takes the focus.',
      },
    },
  },
  render: () => {
    let lines = cartLines.map((line) => ({ ...line }));
    let status = '';

    const changeQuantity = (line: CartLine, step: number) => {
      const quantity = Math.min(maxQuantity, Math.max(1, line.quantity + step));

      status =
        quantity === line.quantity
          ? `${line.name} stays at ${quantity}, the ${step < 0 ? 'lowest' : 'highest'} quantity.`
          : `Quantity of ${line.name}: ${quantity}.`;
      line.quantity = quantity;
      story.update();
    };

    const remove = (line: CartLine) => {
      lines = lines.filter((each) => each !== line);
      status = lines.length
        ? `${line.name} is removed. ${plural(lines.length, 'product')} in the cart.`
        : `${line.name} is removed. The cart is empty.`;
      story.update();
    };

    const story = renderInto(() => {
      const total = lines.reduce(
        (sum, { price, quantity }) => sum + price * quantity,
        0
      );

      return html`
        <section class="ls-cart" aria-labelledby="ls-cart-heading">
          <h3 id="ls-cart-heading">Cart</h3>
          <igc-list navigation="grid" aria-label="Products in the cart">
            ${repeat(
              lines,
              ({ id }) => id,
              (line) => html`
                <igc-list-item>
                  <igc-icon
                    slot="start"
                    name=${line.icon}
                    aria-hidden="true"
                  ></igc-icon>
                  <span slot="title">${line.name}</span>
                  <span slot="subtitle" class="ls-size">
                    Quantity ${line.quantity} · ${dollars.format(line.price)}
                    each · ${dollars.format(line.price * line.quantity)}
                  </span>
                  <igc-icon-button
                    slot="end"
                    variant="flat"
                    name="minus"
                    aria-label="Decrease the quantity of ${line.name}"
                    @click=${() => changeQuantity(line, -1)}
                  ></igc-icon-button>
                  <span slot="end" class="ls-quantity" aria-hidden="true">
                    ${line.quantity}
                  </span>
                  <igc-icon-button
                    slot="end"
                    variant="flat"
                    name="plus"
                    aria-label="Increase the quantity of ${line.name}"
                    @click=${() => changeQuantity(line, 1)}
                  ></igc-icon-button>
                  <igc-icon-button
                    slot="end"
                    variant="flat"
                    name="delete"
                    aria-label="Remove ${line.name}"
                    @click=${() => remove(line)}
                  ></igc-icon-button>
                </igc-list-item>
              `
            )}
            <span slot="empty" class="ls-empty muted">Your cart is empty.</span>
          </igc-list>
          <p class="ls-row">
            <span>Total</span>
            <span class="ls-size">${dollars.format(total)}</span>
          </p>
          <p class="muted" role="status">${status}</p>
        </section>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const teammates = [
  { name: 'Ana Silva', initials: 'AS', team: 'Billing' },
  { name: 'Ben Carter', initials: 'BC', team: 'Mobile apps' },
  { name: 'Chloé Martin', initials: 'CM', team: 'Billing' },
  { name: 'Dev Patel', initials: 'DP', team: 'Accounts' },
  { name: 'Hana Kim', initials: 'HK', team: 'Mobile apps' },
  { name: 'Jonas Weber', initials: 'JW', team: 'Accounts' },
];

export const Assignee: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Assign a support ticket to a teammate. The search field filters the list by name or team. The list has `navigation="listbox"`: Tab moves from the search field to the list, the arrow keys and the first letters of a name move between the teammates, and Enter or Space assigns the focused one. The `empty` slot shows a message while no teammate matches. The message renders in the list, so a screen reader reads it as the only option when the empty list gets the focus.',
      },
    },
  },
  render: () => {
    let query = '';
    let assignee = '';

    const story = renderInto(() => {
      const term = query.trim().toLocaleLowerCase();
      const matches = teammates.filter(({ name, team }) =>
        `${name} ${team}`.toLocaleLowerCase().includes(term)
      );

      return html`
        <section class="ls-assignee" aria-labelledby="ls-assignee-heading">
          <h3 id="ls-assignee-heading">Assign T-1042</h3>
          <igc-input
            type="search"
            label="Find a teammate"
            @igcInput=${({ detail }: CustomEvent<string>) => {
              query = detail;
              story.update();
            }}
          ></igc-input>
          <igc-list navigation="listbox" aria-label="Teammates">
            ${repeat(
              matches,
              ({ name }) => name,
              ({ name, initials, team }) => html`
                <igc-list-item
                  ?selected=${name === assignee}
                  @click=${() => {
                    assignee = name;
                    story.update();
                  }}
                >
                  <igc-avatar
                    slot="start"
                    shape="circle"
                    initials=${initials}
                    aria-hidden="true"
                  ></igc-avatar>
                  <span slot="title">${name}</span>
                  <span slot="subtitle">${team}</span>
                </igc-list-item>
              `
            )}
            <span slot="empty" class="ls-empty muted">
              No teammate matches "${query.trim()}".
            </span>
          </igc-list>
          <p role="status">
            ${assignee ? `Assigned to ${assignee}.` : 'Not assigned yet.'}
          </p>
        </section>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
