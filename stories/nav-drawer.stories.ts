import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story.js';
import {
  IgcNavDrawerComponent,
  IgcNavDrawerItemComponent,
} from '../src/index.js';

// region default
const metadata = {
  title: 'Nav Drawer',
  component: 'igc-nav-drawer',
  argTypes: {
    position: {
      type: '"start" | "end" | "top" | "bottom" | "relative"',
      description: 'The position of the drawer.',
      options: ['start', 'end', 'top', 'bottom', 'relative'],
      control: {
        type: 'select',
      },
      defaultValue: 'start',
    },
    open: {
      type: 'boolean',
      description: 'Determines whether the drawer is opened.',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  position: 'start' | 'end' | 'top' | 'bottom' | 'relative';
  open: boolean;
}
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

    items.forEach((item) => (item.active = false));
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

const navbarItems = [
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
  {
    icon: 'home',
    text: 'Navbar item text',
  },
];

const Template: Story<ArgTypes, Context> = (
  { open = false, position }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div
      class="ig-scrollbar"
      style="display: flex; margin-top: -8px; margin-left: -8px; height: 100vh;"
    >
      <igc-nav-drawer
        dir=${ifDefined(direction)}
        .open=${open}
        .position=${position}
        @click="${handleClick}"
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        ${navbarItems.map((items) => {
          return html`
            <igc-nav-drawer-item>
              <igc-icon slot="icon" name="${items.icon}"></igc-icon>
              <span slot="content">${items.text}</span>
            </igc-nav-drawer-item>
          `;
        })}

        <div slot="mini">
          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="home"></igc-icon>
          </igc-nav-drawer-item>

          <igc-nav-drawer-item>
            <igc-icon slot="icon" name="search"></igc-icon>
          </igc-nav-drawer-item>
        </div>
      </igc-nav-drawer>

      <div style="padding-left: 20px;">
        <p>Sample page content</p>
        <igc-button @click="${handleOpen}">Open</igc-button>
        <igc-button @click="${handleClose}">Close</igc-button>
        <igc-button @click="${handleToggle}">Toggle</igc-button>
      </div>
    </div>
  `;
};

export const Basic = Template.bind({});
