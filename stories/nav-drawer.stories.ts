import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import '../igniteui-webcomponents.js';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story';
import { IgcNavDrawerComponent } from './../src/components/nav-drawer/nav-drawer.js';

// region default
export default {
  title: 'Navigation Drawer',
  component: 'igc-nav-drawer',
  parameters: {
    actions: {
      handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the drawer is opened.',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
    pinned: {
      type: 'boolean',
      description: 'Determines whether the drawer is pinned.',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
    disabled: {
      type: 'boolean',
      description: 'Determines whether a drawer item is disabled.',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
    active: {
      type: 'boolean',
      description: 'Determines whether a drawer item is active.',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
    position: {
      type: '"start" | "end" | "top" | "bottom"',
      options: ['start', 'end', 'top', 'bottom'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'start',
        },
      },
    },
  },
};

interface ArgTypes {
  content1: string;
  content2: string;
  open: boolean;
  pinned: boolean;
  disabled: boolean;
  active: boolean;
  position: 'start' | 'end' | 'top' | 'bottom';
}

//end region

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

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

const Template: Story<ArgTypes, Context> = (
  {
    content1 = 'Home',
    content2 = 'Search',
    open = false,
    pinned = false,
    disabled = false,
    active = false,
    position,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="display: flex;">
      <igc-nav-drawer
        dir=${ifDefined(direction)}
        .open=${open}
        .pinned=${pinned}
        .position=${position}
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        <igc-nav-drawer-item .disabled=${disabled}>
          <igc-icon slot="icon" name="home"></igc-icon>
          <span slot="text">${content1}</span>
        </igc-nav-drawer-item>

        <igc-nav-drawer-item .active=${active}>
          <igc-icon slot="icon" name="search"></igc-icon>
          <span slot="text">${content2}</span>
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

      <div>
        <p>Sample page content</p>
        <igc-button @click="${handleOpen}">Open</igc-button>
        <igc-button @click="${handleClose}">Close</igc-button>
        <igc-button @click="${handleToggle}">Toggle</igc-button>
      </div>
    </div>
  `;
};

export const Basic = Template.bind({});
