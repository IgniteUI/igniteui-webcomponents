import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcNavbarComponent,
  defineComponents,
  registerIcon,
} from '../src/index.js';

defineComponents(
  IgcNavbarComponent,
  IgcAvatarComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcButtonComponent,
  IgcDropdownComponent
);

// region default
const metadata: Meta<IgcNavbarComponent> = {
  title: 'Navbar',
  component: 'igc-navbar',
  parameters: {
    docs: {
      description: {
        component:
          'A navigation bar component is used to facilitate navigation through\na series of hierarchical screens within an app.',
      },
    },
  },
  argTypes: {},
  args: {},
};

export default metadata;

type Story = StoryObj;

// endregion

interface NavbarStoryArgs {
  content: string;
}

type EnhancedStory = StoryObj<NavbarStoryArgs>;

Object.assign(metadata.argTypes!, {
  content: {
    type: 'string',
    control: 'text',
  },
});

Object.assign(metadata.args!, {
  content: 'Title',
});

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'favorite',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg'
);

const Template = ({ content }: NavbarStoryArgs) => {
  return html`
    <igc-navbar style="height:30px">
      <igc-icon slot="start" name="home"></igc-icon>
      <h2>${content}</h2>
      <igc-input
        slot="end"
        style="align-self: center"
        type="search"
        placeholder="search"
        size="small"
        outlined
      >
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-input>
      <igc-icon slot="end" name="favorite"></igc-icon>
      <igc-dropdown slot="end">
        <igc-avatar
          slot="target"
          size="small"
          shape="circle"
          src="https://i.pravatar.cc/200"
          >MP</igc-avatar
        >
        <igc-dropdown-item>Settings</igc-dropdown-item>
        <igc-dropdown-item>Help</igc-dropdown-item>
        <igc-dropdown-item>Log Out</igc-dropdown-item>
      </igc-dropdown>
    </igc-navbar>
  `;
};

export const Basic: Story & EnhancedStory = Template.bind({});
