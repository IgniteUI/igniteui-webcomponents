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

defineComponents(IgcIconComponent, IgcNavDrawerComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcNavDrawerComponent> = {
  title: 'NavDrawer',
  component: 'igc-nav-drawer',
  parameters: {
    docs: {
      description: {
        component:
          'Represents a side navigation container that provides\nquick access between views.',
      },
    },
  },
  argTypes: {
    position: {
      type: '"start" | "end" | "top" | "bottom" | "relative"',
      description: 'The position of the drawer.',
      options: ['start', 'end', 'top', 'bottom', 'relative'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'start' } },
    },
    open: {
      type: 'boolean',
      description: 'Determines whether the drawer is opened.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { position: 'start', open: false },
};

export default metadata;

interface IgcNavDrawerArgs {
  /** The position of the drawer. */
  position: 'start' | 'end' | 'top' | 'bottom' | 'relative';
  /** Determines whether the drawer is opened. */
  open: boolean;
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
const handleClick = (ev: PointerEvent) => {
  let drawerItem: IgcNavDrawerItemComponent | undefined;

  const eventTarget = ev.target as HTMLElement;

  if (eventTarget.tagName.toLowerCase() === 'igc-nav-drawer-item') {
    drawerItem = eventTarget as IgcNavDrawerItemComponent;
  }

  if (
    eventTarget.parentElement?.tagName.toLowerCase() === 'igc-nav-drawer-item'
  ) {
    drawerItem = eventTarget.parentElement as IgcNavDrawerItemComponent;
  }

  if (drawerItem !== undefined) {
    drawerItem.active = true;

    const navDrawer = document.querySelector(
      'igc-nav-drawer'
    ) as IgcNavDrawerComponent;

    const items = Array.from<IgcNavDrawerItemComponent>(
      navDrawer.querySelectorAll('igc-nav-drawer-item')
    ).filter((item) => item !== drawerItem);

    items.forEach((item) => {
      item.active = false;
    });
  }
};

const handleOpen = () => {
  const drawer = document.querySelector(
    'igc-nav-drawer'
  ) as IgcNavDrawerComponent;
  drawer?.show();
};

const handleClose = () => {
  const drawer = document.querySelector(
    'igc-nav-drawer'
  ) as IgcNavDrawerComponent;
  drawer?.hide();
};

const handleToggle = () => {
  const drawer = document.querySelector(
    'igc-nav-drawer'
  ) as IgcNavDrawerComponent;
  drawer?.toggle();
};

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
        <span slot="content">Navbar item ${i + 1}</span>
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

// Create a function for control buttons
const createControlButtons = (position: string) => html`
  ${position === 'relative'
    ? html`
        <igc-button @click=${handleToggle}>Toggle</igc-button>
        <igc-button variant="outlined" @click=${handleClose}>Close</igc-button>
      `
    : ''}

  <igc-button variant="outlined" @click=${handleOpen}>Open</igc-button>
`;

// Main template function
const createTemplate = (options: {
  headerText?: string;
  itemCount?: number;
  includeMini?: boolean;
  contentText?: string;
}) => {
  return ({ open = false, position }: IgcNavDrawerArgs) => html`
    ${commonStyles}

    <div class="ig-scrollbar main">
      <igc-nav-drawer .open=${open} .position=${position} @click=${handleClick}>
        ${createDrawerContent(
          options.headerText || 'Sample Drawer',
          options.itemCount
        )}
        ${options.includeMini ? createMiniContent() : ''}
      </igc-nav-drawer>

      <section class="content ${position === 'relative' ? 'relative' : ''}">
        <p>${options.contentText}</p>
        ${createControlButtons(position)}
      </section>
    </div>
  `;
};

// Now create your stories using the template factory
export const Basic: Story = {
  render: createTemplate({
    headerText: 'Drawer header',
    itemCount: 15,
    includeMini: false,
    contentText: 'Basic drawer example',
  }),
};

export const MiniVariant: Story = {
  render: createTemplate({
    headerText: 'Drawer header',
    itemCount: 5,
    includeMini: true,
    contentText: 'Mini drawer example ',
  }),
  args: {
    position: 'start',
    open: false,
  },
};
