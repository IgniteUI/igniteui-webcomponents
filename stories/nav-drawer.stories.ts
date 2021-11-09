import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { registerIcon } from '../src/components/icon/icon.registry.js';
import { Context, Story } from './story';
import { IgcNavDrawerComponent } from '../src/index.js';

// region default
const metadata = {
  title: 'Nav Drawer',
  component: 'igc-nav-drawer',
  argTypes: {
    position: {
      type: '"start" | "end" | "top" | "bottom"',
      description: 'The position of the drawer.',
      options: ['start', 'end', 'top', 'bottom'],
      control: {
        type: 'inline-radio',
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
  position: 'start' | 'end' | 'top' | 'bottom';
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
  { open = false, position }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div style="display: flex;">
      <igc-nav-drawer
        dir=${ifDefined(direction)}
        .open=${open}
        .position=${position}
      >
        <igc-nav-drawer-header-item>Sample Drawer</igc-nav-drawer-header-item>

        <igc-nav-drawer-item>
          <igc-icon slot="icon" name="home"></igc-icon>
          <span slot="content">Home</span>
        </igc-nav-drawer-item>

        <igc-nav-drawer-item>
          <igc-icon slot="icon" name="search"></igc-icon>
          <span slot="content">Search</span>
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
