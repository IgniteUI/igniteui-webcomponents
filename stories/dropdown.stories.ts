import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  type IgcDropdownItemComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent
);

const materialIcons = 'https://unpkg.com/material-design-icons@3.0.1';

for (const [name, path] of [
  ['archive', 'content/svg/production/ic_archive_24px.svg'],
  ['delete', 'action/svg/production/ic_delete_24px.svg'],
  ['download', 'file/svg/production/ic_file_download_24px.svg'],
  ['edit', 'image/svg/production/ic_edit_24px.svg'],
  ['language', 'action/svg/production/ic_language_24px.svg'],
  ['open_external', 'action/svg/production/ic_open_in_new_24px.svg'],
  ['person', 'social/svg/production/ic_person_24px.svg'],
  ['settings', 'action/svg/production/ic_settings_24px.svg'],
  ['share', 'social/svg/production/ic_share_24px.svg'],
  ['sign_out', 'action/svg/production/ic_exit_to_app_24px.svg'],
  ['sort', 'content/svg/production/ic_sort_24px.svg'],
  ['view', 'action/svg/production/ic_visibility_24px.svg'],
]) {
  registerIcon(name, `${materialIcons}/${path}`);
}

// region default
const metadata: Meta<IgcDropdownComponent> = {
  title: 'Dropdown',
  component: 'igc-dropdown',
  parameters: {
    docs: { description: { component: 'Represents a Dropdown component.' } },
    actions: {
      handles: [
        'igcChange',
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
      ],
    },
  },
  argTypes: {
    placement: {
      type: {
        name: 'enum',
        value: [
          'top',
          'top-start',
          'top-end',
          'bottom',
          'bottom-start',
          'bottom-end',
          'right',
          'right-start',
          'right-end',
          'left',
          'left-start',
          'left-end',
        ],
      },
      description:
        'The preferred placement of the component around the target element.',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'right',
        'right-start',
        'right-end',
        'left',
        'left-start',
        'left-end',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'bottom-start' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'block', 'close'] },
      description:
        'Determines the behavior of the component during scrolling of the parent container.',
      options: ['scroll', 'block', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'scroll' } },
    },
    flip: {
      type: 'boolean',
      description:
        "Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.\nWhen true, once enough space is detected on its preferred side, it will flip back.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    distance: {
      type: 'number',
      description: 'The distance from the target element.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the dropdown's width should be the same as the target's one.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    placement: 'bottom-start',
    scrollStrategy: 'scroll',
    flip: false,
    distance: 0,
    sameWidth: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
  },
};

export default metadata;

interface IgcDropdownArgs {
  /** The preferred placement of the component around the target element. */
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';
  /** Determines the behavior of the component during scrolling of the parent container. */
  scrollStrategy: 'scroll' | 'block' | 'close';
  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   */
  flip: boolean;
  /** The distance from the target element. */
  distance: number;
  /** Whether the dropdown's width should be the same as the target's one. */
  sameWidth: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
}
type Story = StoryObj<IgcDropdownArgs>;

// endregion

/** Shared styling for the application-like story scenarios. */
const scenarioStyles = html`
  <style>
    .scenario {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 46rem;
    }

    .scenario table {
      border-collapse: collapse;
      width: 100%;
    }

    .scenario th,
    .scenario td {
      border-bottom: 1px solid var(--ig-gray-200, #e0e0e0);
      padding: 0.25rem 0.75rem;
      text-align: start;
      white-space: nowrap;
    }

    .scenario th:last-child,
    .scenario td:last-child {
      text-align: end;
      width: 3rem;
    }

    .numeric {
      text-align: end !important;
      font-variant-numeric: tabular-nums;
    }

    .app-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background: var(--ig-gray-100, #f5f5f5);
    }

    .user-target::part(base) {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: fit-content;
    }

    .files {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
      gap: 0.5rem;
    }

    .file igc-icon {
      font-size: 2rem;
    }

    .file:focus-visible {
      outline: 2px solid var(--ig-primary-500, #09f);
      outline-offset: 1px;
    }

    .file {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
      cursor: context-menu;
      user-select: none;
    }

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }

    .panel {
      height: 16rem;
      overflow: auto;
      padding: 1rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }

    .log {
      margin: 0;
      min-height: 1.25rem;
      font-family: monospace;
      color: var(--ig-primary-500, #09f);
    }

    .danger::part(content) {
      color: var(--ig-error-500, #d32f2f);
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The component and its parts, wired to the controls panel. A button in the `target` slot anchors the list; everything else - placement, distance, scroll strategy and the open/close behavior - is configurable here.',
      },
    },
  },
  render: ({
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    sameWidth,
    placement,
    distance,
    scrollStrategy,
  }) => html`
    <igc-dropdown
      ?open=${open}
      ?flip=${flip}
      ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
      ?keep-open-on-select=${keepOpenOnSelect}
      ?same-width=${sameWidth}
      .placement=${placement}
      .distance=${distance}
      .scrollStrategy=${scrollStrategy}
    >
      <igc-button slot="target">Move to</igc-button>

      <igc-dropdown-header>Recent</igc-dropdown-header>
      <igc-dropdown-item value="inbox">Inbox</igc-dropdown-item>
      <igc-dropdown-item value="starred">Starred</igc-dropdown-item>

      <igc-dropdown-group>
        <span slot="label">Projects</span>
        <igc-dropdown-item value="website">Website redesign</igc-dropdown-item>
        <igc-dropdown-item value="mobile">Mobile app</igc-dropdown-item>
        <igc-dropdown-item value="archive" disabled
          >Archive (read-only)</igc-dropdown-item
        >
      </igc-dropdown-group>
    </igc-dropdown>
  `,
};

type Order = {
  id: string;
  customer: string;
  total: number;
  status: string;
};

const orders: Order[] = [
  { id: 'ORD-1041', customer: 'Farrell Ltd', total: 1290.5, status: 'Paid' },
  { id: 'ORD-1042', customer: 'Nordwind GmbH', total: 340, status: 'Pending' },
  { id: 'ORD-1043', customer: 'Kite & Co', total: 8710.25, status: 'Paid' },
  { id: 'ORD-1044', customer: 'Vitalis AD', total: 96.9, status: 'Refunded' },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/**
 * The row actions of a table are the textbook case for a single dropdown moved
 * between targets: one instance serves every row, instead of one per row.
 */
function createTableController() {
  const rowMenu = createRef<IgcDropdownComponent>();
  const sortMenu = createRef<IgcDropdownComponent>();
  const body = createRef<HTMLTableSectionElement>();
  const log = createRef<HTMLElement>();

  let activeOrder: Order | undefined;

  function report(message: string) {
    if (log.value) {
      log.value.textContent = message;
    }
  }

  function openRowMenu(order: Order, event: Event) {
    const menu = rowMenu.value;
    const trigger = event.currentTarget as HTMLElement;

    if (!menu) return;

    // Clicking the trigger of the row the menu is already open for closes it
    if (menu.open && activeOrder === order) {
      menu.hide();
      return;
    }

    activeOrder = order;
    menu.show(trigger);
  }

  function runRowAction({ detail }: CustomEvent<IgcDropdownItemComponent>) {
    report(`${detail.textContent?.trim()} -> ${activeOrder?.id}`);
  }

  function toggleSortMenu(event: Event) {
    sortMenu.value?.toggle(event.currentTarget as HTMLElement);
  }

  function sortRows({ detail }: CustomEvent<IgcDropdownItemComponent>) {
    const direction = detail.value;
    const rows = Array.from(body.value?.rows ?? []);

    if (direction === 'clear') {
      rows.sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
      // Nothing is sorted, so the menu should not show a selection either
      sortMenu.value?.clearSelection();
      report('Sort cleared');
    } else {
      rows.sort((a, b) => {
        const [left, right] = [
          Number(a.dataset.total),
          Number(b.dataset.total),
        ];
        return direction === 'asc' ? left - right : right - left;
      });
      report(
        `Sorted by total, ${direction === 'asc' ? 'ascending' : 'descending'}`
      );
    }

    body.value?.append(...rows);
  }

  return {
    rowMenu,
    sortMenu,
    body,
    log,
    openRowMenu,
    runRowAction,
    toggleSortMenu,
    sortRows,
  };
}

export const TableActions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An orders table with a sort menu on a column header and an actions menu on every row. Both are single dropdown instances: the row menu is moved to whichever trigger was clicked with `show(target)`, which is what keeps a table of a thousand rows down to one popup. The sort menu holds the applied sort as its own selection and `clearSelection()` resets it.',
      },
    },
  },
  render: () => {
    const table = createTableController();

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th class="numeric">
                Total
                <igc-icon-button
                  variant="flat"
                  name="sort"
                  aria-label="Sort by total"
                  @click=${table.toggleSortMenu}
                ></igc-icon-button>
              </th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody ${ref(table.body)}>
            ${orders.map(
              (order, index) => html`
                <tr data-index=${index} data-total=${order.total}>
                  <td>${order.id}</td>
                  <td>${order.customer}</td>
                  <td class="numeric">${currency.format(order.total)}</td>
                  <td>${order.status}</td>
                  <td>
                    <igc-icon-button
                      variant="flat"
                      collection="internal"
                      name="more_horiz"
                      aria-label="Actions for ${order.id}"
                      @click=${(event: Event) =>
                        table.openRowMenu(order, event)}
                    ></igc-icon-button>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>

        <p class="log" ${ref(table.log)}></p>
      </div>

      <igc-dropdown
        ${ref(table.sortMenu)}
        placement="bottom-end"
        distance="4"
        @igcChange=${table.sortRows}
      >
        <igc-dropdown-item value="asc">Sort ascending</igc-dropdown-item>
        <igc-dropdown-item value="desc">Sort descending</igc-dropdown-item>
        <igc-dropdown-item value="clear">Clear sort</igc-dropdown-item>
      </igc-dropdown>

      <igc-dropdown
        ${ref(table.rowMenu)}
        placement="bottom-end"
        distance="4"
        @igcChange=${table.runRowAction}
      >
        <igc-dropdown-item value="view">
          <igc-icon slot="prefix" name="view"></igc-icon>
          View details
        </igc-dropdown-item>
        <igc-dropdown-item value="edit">
          <igc-icon slot="prefix" name="edit"></igc-icon>
          Edit
        </igc-dropdown-item>
        <igc-dropdown-item value="duplicate">
          <igc-icon slot="prefix" collection="internal" name="copy"></igc-icon>
          Duplicate
        </igc-dropdown-item>
        <igc-dropdown-item value="archive">
          <igc-icon slot="prefix" name="archive"></igc-icon>
          Archive
        </igc-dropdown-item>
        <igc-dropdown-item value="delete" class="danger">
          <igc-icon slot="prefix" name="delete"></igc-icon>
          Delete
        </igc-dropdown-item>
      </igc-dropdown>
    `;
  },
};

export const AccountMenu: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The account menu of an application bar: the trigger lives in the `target` slot, so the dropdown follows it wherever the bar puts it, and `bottom-end` keeps the list inside the viewport at the right edge. A header labels the signed-in account, and a group separates the destructive action.',
      },
    },
  },
  render: () => {
    const log = createRef<HTMLElement>();

    function onChange({ detail }: CustomEvent<IgcDropdownItemComponent>) {
      if (log.value) {
        log.value.textContent = `Navigating to ${detail.value}`;
      }
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="app-bar">
          <strong>Contoso Admin</strong>

          <igc-dropdown
            placement="bottom-end"
            distance="6"
            @igcChange=${onChange}
          >
            <igc-button class="user-target" slot="target" variant="flat">
              <igc-avatar
                style="--ig-size: 1"
                initials="AR"
                shape="circle"
              ></igc-avatar>
              Alex Rivera
              <igc-icon
                collection="internal"
                name="keyboard_arrow_down"
              ></igc-icon>
            </igc-button>

            <igc-dropdown-header>alex.rivera@contoso.com</igc-dropdown-header>
            <igc-dropdown-item value="profile">
              <igc-icon slot="prefix" name="person"></igc-icon>
              Your profile
            </igc-dropdown-item>
            <igc-dropdown-item value="preferences">
              <igc-icon slot="prefix" name="settings"></igc-icon>
              Preferences
            </igc-dropdown-item>

            <igc-dropdown-group>
              <span slot="label">Session</span>
              <igc-dropdown-item value="sign-out">
                <igc-icon slot="prefix" name="sign_out"></igc-icon>
                Sign out
              </igc-dropdown-item>
            </igc-dropdown-group>
          </igc-dropdown>
        </div>

        <p class="log" ${ref(log)}></p>
      </div>
    `;
  },
};

const files = [
  { name: 'Q3-report.pdf', icon: 'file_pdf' },
  { name: 'budget.xlsx', icon: 'file_xls' },
  { name: 'contacts.csv', icon: 'file_csv' },
  { name: 'logo.svg', icon: 'file_svg' },
  { name: 'notes.txt', icon: 'file_txt' },
  { name: 'archive.zip', icon: 'file_zip' },
];

export const ContextMenu: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A file browser context menu. `contextmenu` is cancelled and the dropdown is anchored to the tile that was right-clicked, so one menu serves the whole grid and the list opens against the item it acts on. The tiles are focusable and the clicked one is focused before the menu opens: keyboard handling follows the target, so that is what makes the arrow keys, Enter and Escape work on the open list.',
      },
    },
  },
  render: () => {
    const menu = createRef<IgcDropdownComponent>();
    const log = createRef<HTMLElement>();
    let activeFile = '';

    function openMenu(name: string, event: MouseEvent) {
      event.preventDefault();
      activeFile = name;

      // The dropdown observes key events on its target, so the tile has to hold
      // focus for Escape and the arrow keys to reach the open list
      const tile = event.currentTarget as HTMLElement;
      tile.focus();
      menu.value?.show(tile);
    }

    function onChange({ detail }: CustomEvent<IgcDropdownItemComponent>) {
      if (log.value) {
        log.value.textContent = `${detail.textContent?.trim()} -> ${activeFile}`;
      }
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <p>Right-click a file, then navigate the menu with the keyboard.</p>

        <div class="files">
          ${files.map(
            ({ name, icon }) => html`
              <div
                class="file"
                tabindex="0"
                @contextmenu=${(event: MouseEvent) => openMenu(name, event)}
              >
                <igc-icon collection="internal" name=${icon}></igc-icon>
                <small>${name}</small>
              </div>
            `
          )}
        </div>

        <p class="log" ${ref(log)}></p>
      </div>

      <igc-dropdown ${ref(menu)} distance="2" @igcChange=${onChange}>
        <igc-dropdown-item value="open">
          <igc-icon slot="prefix" name="open_external"></igc-icon>
          Open
        </igc-dropdown-item>
        <igc-dropdown-item value="rename">
          <igc-icon slot="prefix" name="edit"></igc-icon>
          Rename
        </igc-dropdown-item>
        <igc-dropdown-item value="download">
          <igc-icon slot="prefix" name="download"></igc-icon>
          Download
        </igc-dropdown-item>
        <igc-dropdown-item value="share">
          <igc-icon slot="prefix" name="share"></igc-icon>
          Share
        </igc-dropdown-item>
        <igc-dropdown-item value="delete" class="danger">
          <igc-icon slot="prefix" name="delete"></igc-icon>
          Delete
        </igc-dropdown-item>
      </igc-dropdown>
    `;
  },
};

const languages = [
  { region: 'Americas', locale: 'en-US', flag: '🇺🇸', label: 'English (US)' },
  { region: 'Americas', locale: 'pt-BR', flag: '🇧🇷', label: 'Português (BR)' },
  { region: 'Europe', locale: 'en-GB', flag: '🇬🇧', label: 'English (UK)' },
  { region: 'Europe', locale: 'de-DE', flag: '🇩🇪', label: 'Deutsch' },
  { region: 'Europe', locale: 'bg-BG', flag: '🇧🇬', label: 'Български' },
  { region: 'Asia', locale: 'ja-JP', flag: '🇯🇵', label: '日本語' },
];

const regions = [...new Set(languages.map(({ region }) => region))];

export const LanguagePicker: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A settings row backed by application state. The current locale is rendered as a `selected` item, which the component picks up as its initial selection on its own, and `igcChange` writes the choice back into the trigger. `same-width` keeps the list aligned with the field it belongs to, and the locales are grouped by region.',
      },
    },
  },
  render: () => {
    const label = createRef<HTMLElement>();
    let locale = 'en-GB';

    function onChange({ detail }: CustomEvent<IgcDropdownItemComponent>) {
      locale = detail.value;
      const choice = languages.find((each) => each.locale === locale);

      if (label.value && choice) {
        label.value.textContent = `${choice.flag} ${choice.label}`;
      }
    }

    const current = languages.find((each) => each.locale === locale)!;

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="settings-row">
          <div>
            <div><strong>Interface language</strong></div>
            <small>Applies to menus, dates and number formats.</small>
          </div>

          <igc-dropdown same-width flip @igcChange=${onChange}>
            <igc-button slot="target" variant="outlined">
              <igc-icon slot="prefix" name="language"></igc-icon>
              <span ${ref(label)}>${current.flag} ${current.label}</span>
            </igc-button>

            ${regions.map(
              (region) => html`
                <igc-dropdown-group>
                  <span slot="label">${region}</span>
                  ${languages
                    .filter((each) => each.region === region)
                    .map(
                      ({ locale: value, flag, label: name }) => html`
                        <igc-dropdown-item
                          value=${value}
                          ?selected=${value === locale}
                        >
                          <span slot="prefix">${flag}</span>
                          ${name}
                        </igc-dropdown-item>
                      `
                    )}
                </igc-dropdown-group>
              `
            )}
          </igc-dropdown>
        </div>
      </div>
    `;
  },
};

const timeZones = Array.from(range(-11, 13)).flatMap((offset) =>
  ['00', '30'].map(
    (minutes) => html`
      <igc-dropdown-item value="${offset}:${minutes}">
        UTC${offset < 0 ? offset : `+${offset}`}:${minutes}
      </igc-dropdown-item>
    `
  )
);

export const InScrollingPanel: Story = {
  args: {
    sameWidth: false,
    scrollStrategy: 'block',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A long list opened from inside a scrolling panel - a settings pane, a dialog body, a side drawer. The list height is capped with `::part(list)` so it scrolls on its own, and `scroll-strategy` decides what scrolling the panel underneath does to it: `scroll` lets it follow, `block` freezes the panel, `close` dismisses the list.',
      },
    },
  },
  render: ({ scrollStrategy, sameWidth, flip, distance, placement }) => html`
    ${scenarioStyles}
    <style>
      #time-zones::part(list) {
        max-height: 14rem;
      }
    </style>

    <div class="scenario">
      <div class="panel">
        <h4>Regional settings</h4>
        <p>
          Scroll this panel with the list open to compare the scroll strategies.
        </p>

        <igc-dropdown
          id="time-zones"
          ?same-width=${sameWidth}
          ?flip=${flip}
          .placement=${placement}
          .distance=${distance}
          .scrollStrategy=${scrollStrategy}
        >
          <igc-button slot="target">Time zone</igc-button>
          <igc-dropdown-header>UTC offset</igc-dropdown-header>
          ${timeZones}
        </igc-dropdown>

        <p>
          ${Array.from(range(1, 12)).map(
            () => html`Regional formatting affects dates, times and numbers. `
          )}
        </p>
      </div>
    </div>
  `,
};
