import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { range } from 'lit/directives/range.js';
import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcNavDrawerComponent,
  type IgcNavDrawerItemComponent,
  defineComponents,
  registerIcon,
} from '../src/index.js';

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
      table: { defaultValue: { summary: false } },
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

const Template = ({ open = false, position }: IgcNavDrawerArgs) => {
  return html`
    <style>
      .main {
        display: flex;
        margin: -1rem;
        height: 100vh;
        overflow: hidden;
      }

      .content {
        padding-inline-start: 20px;
        font-family: var(--ig-font-family);
      }
    </style>

    <div class="ig-scrollbar main">
      <igc-nav-drawer
        .open=${open}
        .position=${position}
        @click="${handleClick}"
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        ${Array.from(range(15)).map(
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

        <div slot="mini">
          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
          </igc-nav-drawer-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="search"></igc-icon>
          </igc-nav-drawer-item>
        </div>
      </igc-nav-drawer>

      <section class="content">
        <p>Sample page content</p>
        <igc-button @click="${handleOpen}">Open</igc-button>
        <igc-button @click="${handleClose}">Close</igc-button>
        <igc-button @click="${handleToggle}">Toggle</igc-button>
      </section>
    </div>
  `;
};

export const Basic: Story = Template.bind({});
