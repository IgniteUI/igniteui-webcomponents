import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcBannerComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcNavbarComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

defineComponents(
  IgcBannerComponent,
  IgcIconComponent,
  IgcButtonComponent,
  IgcNavbarComponent
);

// region default
const metadata: Meta<IgcBannerComponent> = {
  title: 'Banner',
  component: 'igc-banner',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-banner` component displays important and concise message(s) for a user to address, that is specific to a page or feature.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the banner is being shown/hidden.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: { open: false },
};

export default metadata;

interface IgcBannerArgs {
  /** Determines whether the banner is being shown/hidden. */
  open: boolean;
}
type Story = StoryObj<IgcBannerArgs>;

// endregion

const checkIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';

registerIconFromText('success', checkIcon, 'material');

const BasicTemplate = ({ open }: IgcBannerArgs) => {
  return html`
    <style>
      igc-button {
        margin-block-start: 12px;
      }
    </style>
    <igc-navbar style="height:30px">
      <h2>Title</h2>
    </igc-navbar>
    <igc-banner id="banner" .open=${open}>
      You are currently not logged in! Please, log into your account first.
    </igc-banner>
    <igc-button onclick="banner.toggle()">Toggle Banner</igc-button>
  `;
};

const SlottedContentTemplate = ({ open }: IgcBannerArgs) => {
  return html`
    <style>
      igc-banner[open] + igc-button {
        margin-block-start: 12px;
      }
    </style>
    <igc-banner id="banner" .open=${open}>
      <igc-icon name="success" collection="material" slot="prefix"></igc-icon>

      Build f58a1815-c069-429d-ab20-860849e96a59 completed!

      <div slot="actions">
        <igc-button variant="flat">OK</igc-button>
        <igc-button variant="outlined">View log</igc-button>
      </div>
    </igc-banner>
    <igc-button onclick="banner.toggle()">Toggle Banner</igc-button>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const SlottedContent: Story = SlottedContentTemplate.bind({});
