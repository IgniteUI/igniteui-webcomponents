import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcNavDrawerComponent,
  IgcNavbarComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcNavDrawerComponent,
  IgcNavbarComponent
);

registerMaterialIcons(
  'archive',
  'assessment',
  'dashboard',
  'delete',
  'drafts',
  'folder',
  'inbox',
  'label',
  'menu',
  'people',
  'send',
  'settings',
  'shopping-cart',
  'star',
  'update'
);

// region default
const metadata: Meta<IgcNavDrawerComponent> = {
  title: 'NavDrawer',
  component: 'igc-nav-drawer',
  parameters: {
    docs: {
      description: {
        component:
          'A side navigation container that provides\nquick access between views within an application.\n\nThe edge positions (`start`, `end`, `top`, `bottom`) render a modal `<dialog>`\nwith a focus trap and a backdrop. The `relative` position renders an inline\n`<nav>` landmark.\n\nContent in the `mini` slot renders a compact variant, which shows while the\ndrawer is closed.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` / `"--toggle"`\nand `commandfor` pointing to this element will call the corresponding method\ndeclaratively without any JavaScript.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    position: {
      type: {
        name: 'enum',
        value: ['bottom', 'top', 'start', 'end', 'relative'],
      },
      description:
        'Sets the position of the drawer.\n\n- `start` - anchored to the inline-start edge (default).\n- `end` - anchored to the inline-end edge.\n- `top` - anchored to the block-start edge.\n- `bottom` - anchored to the block-end edge.\n- `relative` - rendered inline within the page flow; no modal backdrop.',
      options: ['bottom', 'top', 'start', 'end', 'relative'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'start' } },
    },
    open: {
      type: 'boolean',
      description: 'Whether the drawer is open.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    keepOpenOnEscape: {
      type: 'boolean',
      description:
        'Whether the drawer stays open when the user presses Escape. Applies only to the\nedge positions, because Escape does not close a relative drawer.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      type: 'string',
      description:
        'Sets an accessible label for the `<dialog>`, or the `<nav>` landmark in the `relative`\nposition, and for the mini variant. Give each navigation landmark on a page a distinct label.',
      control: 'text',
    },
  },
  args: { position: 'start', open: false, keepOpenOnEscape: false },
};

export default metadata;

interface IgcNavDrawerArgs {
  /**
   * Sets the position of the drawer.
   *
   * - `start` - anchored to the inline-start edge (default).
   * - `end` - anchored to the inline-end edge.
   * - `top` - anchored to the block-start edge.
   * - `bottom` - anchored to the block-end edge.
   * - `relative` - rendered inline within the page flow; no modal backdrop.
   */
  position: 'bottom' | 'top' | 'start' | 'end' | 'relative';
  /** Whether the drawer is open. */
  open: boolean;
  /**
   * Whether the drawer stays open when the user presses Escape. Applies only to the
   * edge positions, because Escape does not close a relative drawer.
   */
  keepOpenOnEscape: boolean;
  /**
   * Sets an accessible label for the `<dialog>`, or the `<nav>` landmark in the `relative`
   * position, and for the mini variant. Give each navigation landmark on a page a distinct label.
   */
  label: string;
}
type Story = StoryObj<IgcNavDrawerArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .dr-app {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      height: 30rem;
      max-width: 60rem;
      overflow: hidden;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dr-body {
      display: flex;
      min-height: 0;
    }

    .dr-page {
      flex: 1;
      min-width: 0;
      padding: 1.5rem;
      overflow: auto;
    }

    .dr-page :is(h2, h3, p) {
      margin: 0 0 0.75rem;
    }

    /* The item has no role and does not take the focus, so a link does both. */
    igc-nav-drawer-item a {
      color: inherit;
      text-decoration: none;
      outline: none;
    }

    /* The base part of the item has position: relative. */
    igc-nav-drawer-item a::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    igc-nav-drawer-item:has(a:focus-visible)::part(base) {
      outline: 2px solid var(--ig-primary-500);
      outline-offset: -2px;
    }

    igc-nav-drawer-item::part(content) {
      flex-grow: 1;
    }

    igc-nav-drawer-item a[slot='content'] {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    igc-nav-drawer-item a[slot='icon'] {
      display: flex;
    }

    igc-nav-drawer-item a[slot='icon'] igc-icon {
      --ig-size: 3;
    }

    .dr-rail-menu {
      display: flex;
      justify-content: center;
      padding-block: 0.5rem;
    }

    /* The rail and the padding of the page use the same width in all themes. */
    .dr-drive-root {
      --ig-nav-drawer-size--mini: 5rem;
    }

    /* The fullscreen layout of Storybook has no background of its own. */
    .dr-drive {
      min-height: 100vh;
      background: var(--ig-surface-500);
      color: var(--ig-gray-900);
      box-sizing: border-box;
      padding: 1.5rem;
      padding-inline-start: calc(var(--ig-nav-drawer-size--mini) + 1.5rem);
    }

    .dr-files {
      display: grid;
      gap: 0.5rem;
      max-width: 36rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .dr-files li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }
  </style>
`;

type Destination = {
  id: string;
  label: string;
  icon: MaterialIconName;
  unread?: number;
};

function follow<T>(destination: T, navigate: (destination: T) => void) {
  return (event: Event) => {
    event.preventDefault();
    navigate(destination);
  };
}

function drawerLink<T extends Destination>(
  destination: T,
  current: T,
  navigate: (destination: T) => void
) {
  const active = destination === current;

  return html`
    <igc-nav-drawer-item ?active=${active}>
      <igc-icon slot="icon" name=${destination.icon}></igc-icon>
      <a
        slot="content"
        href="#${destination.id}"
        aria-current=${ifDefined(active ? 'page' : undefined)}
        @click=${follow(destination, navigate)}
      >
        ${destination.label}
        ${
          destination.unread
            ? html`
                <span>
                  ${destination.unread}<span class="sr-only"> unread</span>
                </span>
              `
            : ''
        }
      </a>
    </igc-nav-drawer-item>
  `;
}

/** An item of the mini variant. The link wraps the icon, so `aria-label` names it. */
function railLink<T extends Destination>(
  destination: T,
  current: T,
  navigate: (destination: T) => void
) {
  const active = destination === current;

  return html`
    <igc-nav-drawer-item ?active=${active}>
      <a
        slot="icon"
        href="#${destination.id}"
        aria-label=${destination.label}
        aria-current=${ifDefined(active ? 'page' : undefined)}
        @click=${follow(destination, navigate)}
      >
        <igc-icon name=${destination.icon}></igc-icon>
      </a>
    </igc-nav-drawer-item>
  `;
}

const mailFolders: Destination[] = [
  { id: 'inbox', label: 'Inbox', icon: 'inbox', unread: 12 },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'sent', label: 'Sent', icon: 'send' },
  { id: 'drafts', label: 'Drafts', icon: 'drafts' },
  { id: 'archive', label: 'Archive', icon: 'archive' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
];

const mailLabels: Destination[] = [
  { id: 'clients', label: 'Clients', icon: 'label', unread: 3 },
  { id: 'travel', label: 'Travel', icon: 'label' },
];

export const Default: Story = {
  args: { label: 'Mail folders' },
  parameters: {
    docs: {
      description: {
        story:
          'The folders of a mail application. The menu button in the navbar toggles the drawer with the Invoker Commands API: it has `command="--toggle"` and `commandfor` with the ID of the drawer, and no click handler. In the edge positions the drawer is a modal dialog with a backdrop. It keeps the focus inside, and Escape or a click on the backdrop closes it, unless `keep-open-on-escape` is set. Then the focus goes back to the menu button. `label` names the dialog. An item has no role and does not take the focus, so each item holds a link in the `content` slot. A pseudo-element stretches the link over the item, so a click anywhere in the item follows it. The application sets `active` on the item and `aria-current="page"` on the link of the current folder, and closes the drawer after a click on a folder. Header items show the names of the groups, as text with no role. The Actions panel logs `igcClosing` and `igcClosed`. Use the controls to try the other positions.',
      },
    },
  },
  render: ({ position, open, keepOpenOnEscape, label }) => {
    let current = mailFolders[0];

    const navigate = (destination: Destination) => {
      current = destination;
      story.update();

      const drawer =
        story.host!.querySelector<IgcNavDrawerComponent>('igc-nav-drawer')!;

      if (drawer.position !== 'relative') {
        drawer.hide();
      }
    };

    const story = renderInto(
      () => html`
        <div class="dr-app">
          <igc-navbar>
            <igc-icon-button
              slot="start"
              variant="flat"
              name="menu"
              aria-label="Folders"
              command="--toggle"
              commandfor="dr-mail"
            ></igc-icon-button>
            <h2>${current.label}</h2>
          </igc-navbar>
          <div class="dr-body">
            <igc-nav-drawer
              id="dr-mail"
              label=${ifDefined(label || undefined)}
              position=${position}
              ?open=${open}
              ?keep-open-on-escape=${keepOpenOnEscape}
            >
              <igc-nav-drawer-header-item>Folders</igc-nav-drawer-header-item>
              ${mailFolders.map((folder) =>
                drawerLink(folder, current, navigate)
              )}
              <igc-nav-drawer-header-item>Labels</igc-nav-drawer-header-item>
              ${mailLabels.map((folder) => drawerLink(folder, current, navigate))}
            </igc-nav-drawer>
            <div class="dr-page">
              <p>
                ${
                  current.unread
                    ? `${current.unread} unread conversations.`
                    : 'No unread conversations.'
                }
              </p>
              <p class="muted">Open the folders with the menu button.</p>
            </div>
          </div>
        </div>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type AdminPage = Destination & { summary: string };

const adminPages: AdminPage[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    summary: 'The sales, the orders and the visitors of today.',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: 'shopping-cart',
    summary: '18 orders wait for shipping.',
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: 'people',
    summary: '2,413 customers, 37 new this week.',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'assessment',
    summary: 'The monthly sales report is ready.',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    summary: 'The store, the payments and the team.',
  },
];

export const CollapsibleSidebar: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The sidebar of an admin console. With `position="relative"` the drawer is a `nav` landmark in the layout, and it pushes the page when it opens. The `mini` slot holds a compact rail with the same pages, which shows while the drawer is closed. The rail shows only icons, so each link wraps its icon and gets its name from `aria-label`. The drawer and the rail both get the name from `label`, and the hidden one is inert, so each page is a tab stop only once. The menu button calls `toggle()`, and its `aria-label` tells what the next click does: Collapse or Expand.',
      },
    },
  },
  render: () => {
    let current = adminPages[0];
    let expanded = true;

    const navigate = (page: AdminPage) => {
      current = page;
      story.update();
    };

    const toggle = async () => {
      const drawer =
        story.host!.querySelector<IgcNavDrawerComponent>('igc-nav-drawer')!;

      await drawer.toggle();
      expanded = drawer.open;
      story.update();
    };

    const story = renderInto(
      () => html`
        <div class="dr-app">
          <igc-navbar>
            <igc-icon-button
              slot="start"
              variant="flat"
              name="menu"
              aria-label=${expanded ? 'Collapse the menu' : 'Expand the menu'}
              @click=${toggle}
            ></igc-icon-button>
            <h2>Acme Admin</h2>
          </igc-navbar>
          <div class="dr-body">
            <igc-nav-drawer position="relative" label="Main" open>
              ${adminPages.map((page) => drawerLink(page, current, navigate))}
              <div slot="mini">
                ${adminPages.map((page) => railLink(page, current, navigate))}
              </div>
            </igc-nav-drawer>
            <div class="dr-page">
              <h3>${current.label}</h3>
              <p>${current.summary}</p>
            </div>
          </div>
        </div>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const drivePlaces: Destination[] = [
  { id: 'files', label: 'My files', icon: 'folder' },
  { id: 'recent', label: 'Recent', icon: 'update' },
  { id: 'shared', label: 'Shared with me', icon: 'people' },
  { id: 'starred', label: 'Starred', icon: 'star' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
];

const driveFiles: Record<string, [name: string, detail: string][]> = {
  files: [
    ['Budget 2027.xlsx', 'Edited today'],
    ['Brand guidelines.pdf', 'Edited yesterday'],
    ['Team photos', '128 files'],
  ],
  recent: [
    ['Budget 2027.xlsx', 'You edited it today'],
    ['Launch plan.docx', 'Liam commented today'],
  ],
  shared: [
    ['Launch plan.docx', 'From Liam Chen'],
    ['Interview notes', 'From Aiko Tanaka'],
  ],
  starred: [['Brand guidelines.pdf', 'Edited yesterday']],
  trash: [],
};

export const NavigationRail: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'A cloud drive with a navigation rail at the start edge of the viewport. In the edge positions the `mini` slot renders as a popover in the top layer, so the page leaves room for it. The width of the rail differs from theme to theme, so the story sets `--ig-nav-drawer-size--mini` on a parent of the drawer and the page, and uses it for the padding of the page. The rail shows the icons of the places, and the menu button at its top opens the full drawer as a modal dialog with the labels. While the drawer is open, the rail hides. A click on a place in the drawer closes it.',
      },
    },
  },
  render: () => {
    let current = drivePlaces[0];

    const navigate = (destination: Destination) => {
      current = destination;
      story.update();
      story
        .host!.querySelector<IgcNavDrawerComponent>('igc-nav-drawer')!
        .hide();
    };

    const story = renderInto(() => {
      const files = driveFiles[current.id];

      return html`
        <div class="dr-drive-root">
          <igc-nav-drawer id="dr-drive" label="Drive">
            <igc-nav-drawer-header-item>Acme Drive</igc-nav-drawer-header-item>
            ${drivePlaces.map((place) => drawerLink(place, current, navigate))}
            <div slot="mini">
              <div class="dr-rail-menu">
                <igc-icon-button
                  variant="flat"
                  name="menu"
                  aria-label="Open the menu"
                  command="--show"
                  commandfor="dr-drive"
                ></igc-icon-button>
              </div>
              ${drivePlaces.map((place) => railLink(place, current, navigate))}
            </div>
          </igc-nav-drawer>
          <div class="dr-drive">
            <h2>${current.label}</h2>
            ${
              files.length
                ? html`
                    <ul class="dr-files">
                      ${files.map(
                        ([name, detail]) => html`
                          <li>
                            <span>${name}</span>
                            <span class="muted">${detail}</span>
                          </li>
                        `
                      )}
                    </ul>
                  `
                : html`<p class="muted">No files.</p>`
            }
          </div>
        </div>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
