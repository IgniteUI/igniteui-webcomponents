import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcNavbarComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(
  IgcNavbarComponent,
  IgcAvatarComponent,
  IgcInputComponent,
  IgcIconComponent,
  IgcIconButtonComponent,
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
  argTypes: {
    content: {
      type: 'string',
      description: 'Text content rendered in the default (title) slot.',
      control: 'text',
    },
  },
  args: { content: 'Application Title' },
};

export default metadata;

interface IgcNavbarArgs {
  /** Text content rendered in the default (title) slot. */
  content: string;
}
type Story = StoryObj<IgcNavbarArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'favorite',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg'
);

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

registerIcon(
  'settings',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_settings_24px.svg'
);

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A fully composed navbar using the **start**, default, and **end** slots. The **start** slot holds a back/home icon, the default slot contains the title, and the **end** slot holds action icon-buttons and a user avatar dropdown.',
      },
    },
  },
  render: ({ content }: IgcNavbarArgs) => html`
    <igc-navbar>
      <igc-icon-button slot="start" variant="flat">
        <igc-icon name="home"></igc-icon>
      </igc-icon-button>
      <h2>${ifDefined(content)}</h2>
      <igc-icon-button slot="end" variant="flat">
        <igc-icon name="search"></igc-icon>
      </igc-icon-button>
      <igc-icon-button slot="end" variant="flat">
        <igc-icon name="favorite"></igc-icon>
      </igc-icon-button>
      <igc-dropdown slot="end">
        <igc-avatar slot="target" shape="circle" src="https://i.pravatar.cc/200"
          >MP</igc-avatar
        >
        <igc-dropdown-item>Profile</igc-dropdown-item>
        <igc-dropdown-item>Settings</igc-dropdown-item>
        <igc-dropdown-item>Log Out</igc-dropdown-item>
      </igc-dropdown>
    </igc-navbar>
  `,
};

export const WithSearch: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates placing an inline search input in the **end** slot alongside icon-buttons for a typical app bar layout.',
      },
    },
  },
  args: { content: 'My App' },
  render: ({ content }: IgcNavbarArgs) => html`
    <igc-navbar>
      <igc-icon-button slot="start" variant="flat">
        <igc-icon name="home"></igc-icon>
      </igc-icon-button>
      <h2>${ifDefined(content)}</h2>
      <igc-input
        slot="end"
        type="search"
        placeholder="Search…"
        outlined
        style="align-self: center;"
      >
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-input>
      <igc-icon-button slot="end" variant="flat">
        <igc-icon name="settings"></igc-icon>
      </igc-icon-button>
    </igc-navbar>
  `,
};

export const TitleOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A minimal navbar with only the default title slot populated — useful as a starting point or for simple page headers.',
      },
    },
  },
  render: ({ content }: IgcNavbarArgs) => html`
    <igc-navbar>
      <h2>${ifDefined(content)}</h2>
    </igc-navbar>
  `,
};
