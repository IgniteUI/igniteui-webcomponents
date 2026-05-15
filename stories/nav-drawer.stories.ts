import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcNavDrawerComponent,
  type IgcNavDrawerItemComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { range } from 'lit/directives/range.js';
import { ifDefined } from 'lit/directives/if-defined.js';

defineComponents(IgcIconComponent, IgcNavDrawerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcNavDrawerComponent> = {
  title: 'NavDrawer',
  component: 'igc-nav-drawer',
  parameters: {
    docs: {
      description: {
        component:
          '`igc-nav-drawer` is a side navigation container that provides\nquick access between views within an application.\n\nFor non-relative positions the drawer is rendered as a native modal `<dialog>` element,\nproviding built-in accessibility support and Escape key handling.\nIn `relative` position mode it renders as an inline element and applies `inert`\nto the content when closed.\n\nWhen content is provided in the `mini` slot, a compact icon-only variant is\ndisplayed alongside the main drawer.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    position: {
      type: '"start" | "end" | "top" | "bottom" | "relative"',
      description:
        'Sets the position of the drawer.\n\n- `start` — anchored to the inline-start edge (default).\n- `end` — anchored to the inline-end edge.\n- `top` — anchored to the block-start edge.\n- `bottom` — anchored to the block-end edge.\n- `relative` — rendered inline within the page flow; no modal backdrop.',
      options: ['start', 'end', 'top', 'bottom', 'relative'],
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
        'Determines whether the drawer should remain open when the Escape key is pressed.\n\nThis attribute is only applicable when the drawer is in a non-relative position,\nas the Escape key does not trigger the closing of relative drawers.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    label: {
      type: 'string',
      description:
        'Sets an accessible label for the drawer.\n\nIn non-relative positions this label is applied to the modal `<dialog>` element.\nIn `relative` position it labels the `<nav>` landmark.\n\nWhen multiple navigation landmarks exist on the page each should receive a\ndistinct label so screen-reader users can differentiate between them.',
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
   * - `start` — anchored to the inline-start edge (default).
   * - `end` — anchored to the inline-end edge.
   * - `top` — anchored to the block-start edge.
   * - `bottom` — anchored to the block-end edge.
   * - `relative` — rendered inline within the page flow; no modal backdrop.
   */
  position: 'start' | 'end' | 'top' | 'bottom' | 'relative';
  /** Whether the drawer is open. */
  open: boolean;
  /**
   * Determines whether the drawer should remain open when the Escape key is pressed.
   *
   * This attribute is only applicable when the drawer is in a non-relative position,
   * as the Escape key does not trigger the closing of relative drawers.
   */
  keepOpenOnEscape: boolean;
  /**
   * Sets an accessible label for the drawer.
   *
   * In non-relative positions this label is applied to the modal `<dialog>` element.
   * In `relative` position it labels the `<nav>` landmark.
   *
   * When multiple navigation landmarks exist on the page each should receive a
   * distinct label so screen-reader users can differentiate between them.
   */
  label: string;
}
type Story = StoryObj<IgcNavDrawerArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

const getDrawer = (ev: Event) =>
  (ev.target as HTMLElement)
    .closest('.main')
    ?.querySelector('igc-nav-drawer') as IgcNavDrawerComponent | null;

const handleClick = (ev: PointerEvent) => {
  const drawerItem = (ev.target as HTMLElement).closest(
    'igc-nav-drawer-item'
  ) as IgcNavDrawerItemComponent | null;

  if (drawerItem) {
    drawerItem.active = true;
    const navDrawer = drawerItem.closest(
      'igc-nav-drawer'
    ) as IgcNavDrawerComponent;
    navDrawer
      ?.querySelectorAll<IgcNavDrawerItemComponent>('igc-nav-drawer-item')
      .forEach((item) => {
        if (item !== drawerItem) item.active = false;
      });
  }
};

const handleOpen = (ev: MouseEvent) => getDrawer(ev)?.show();
const handleClose = (ev: MouseEvent) => getDrawer(ev)?.hide();
const handleToggle = (ev: MouseEvent) => getDrawer(ev)?.toggle();

const commonStyles = html`
  <style>
    .main {
      display: grid;
      grid-template-columns: auto 1fr;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      margin: -16px;
    }

    .content {
      display: grid;
      grid-template-rows: auto 1fr;
      grid-template-columns: auto;
      gap: 8px;
      height: fit-content;
      align-items: center;
      justify-self: center;
      padding: 16px;

      p {
        grid-column: 1 / -1;
      }
    }

    .relative {
      grid-template-columns: auto auto auto;
      text-align: left;
      justify-self: start;
    }
  </style>
`;

const createDrawerContent = (headerText: string, itemCount = 15) => html`
  <igc-nav-drawer-header-item>${headerText}</igc-nav-drawer-header-item>

  ${Array.from(range(itemCount)).map(
    (i) => html`
      <igc-nav-drawer-item>
        <igc-icon slot="icon" name="home"></igc-icon>
        <span tabindex="0" slot="content">Drawer item ${i + 1}</span>
      </igc-nav-drawer-item>
    `
  )}

  <igc-nav-drawer-item disabled>
    <igc-icon slot="icon" name="home"></igc-icon>
    <span slot="content">Disabled item</span>
  </igc-nav-drawer-item>
`;

// Create a function for mini slot content
const createMiniContent = () => html`
  <div slot="mini">
    <igc-nav-drawer-item>
      <igc-icon slot="icon" name="search"></igc-icon>
    </igc-nav-drawer-item>

    <igc-nav-drawer-item>
      <igc-icon slot="icon" name="home"></igc-icon>
    </igc-nav-drawer-item>

    <igc-nav-drawer-item disabled>
      <igc-icon slot="icon" name="home"></igc-icon>
    </igc-nav-drawer-item>
  </div>
`;

// Create a function for control buttons — always show Open / Toggle / Close
const createControlButtons = () => html`
  <igc-button @click=${handleOpen}>Open</igc-button>
  <igc-button variant="outlined" @click=${handleToggle}>Toggle</igc-button>
  <igc-button variant="outlined" @click=${handleClose}>Close</igc-button>
`;

// Main template function
const createTemplate = (options: {
  headerText?: string;
  itemCount?: number;
  includeMini?: boolean;
  contentText?: string;
}) => {
  return ({
    open = false,
    position,
    keepOpenOnEscape = false,
  }: IgcNavDrawerArgs) => html`
    ${commonStyles}

    <div class="ig-scrollbar main">
      <igc-nav-drawer
        label=${ifDefined(options.headerText ?? undefined)}
        .open=${open}
        .position=${position}
        ?keep-open-on-escape=${keepOpenOnEscape}
        @click=${handleClick}
      >
        ${createDrawerContent(
          options.headerText || 'Sample Drawer',
          options.itemCount
        )}
        ${options.includeMini ? createMiniContent() : ''}
      </igc-nav-drawer>

      <section class="content ${position === 'relative' ? 'relative' : ''}">
        <p>${options.contentText}</p>
        ${createControlButtons()}
      </section>
    </div>
  `;
};

// Now create your stories using the template factory
export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A navigation drawer overlaying the page content. Use the **position** arg to place it at the start, end, top, or bottom of the viewport. Click a nav item to mark it active.',
      },
    },
  },
  render: createTemplate({
    headerText: 'Drawer header',
    itemCount: 15,
    includeMini: false,
    contentText: 'Use the buttons below to control the drawer.',
  }),
};

export const MiniVariant: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Populates the **mini** slot to show a compact icon-only rail when the drawer is closed, giving users quick access to navigation without taking up full width.',
      },
    },
  },
  args: {
    position: 'start',
    open: false,
  },
  render: createTemplate({
    headerText: 'Drawer header',
    itemCount: 5,
    includeMini: true,
    contentText: 'Open the drawer to see the full labels alongside the icons.',
  }),
};

export const Relative: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `position` is set to **relative**, the drawer sits inline with the page content instead of overlaying it, shifting the adjacent content as it opens and closes.',
      },
    },
  },
  args: {
    position: 'relative',
    open: true,
  },
  render: createTemplate({
    headerText: 'Relative drawer',
    itemCount: 8,
    includeMini: false,
    contentText: 'The drawer pushes the content rather than overlaying it.',
  }),
};
