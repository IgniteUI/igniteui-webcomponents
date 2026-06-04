import {
  facebook,
  instagram,
  twitter,
} from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconButtonComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconButtonComponent
);

const icons = [facebook, instagram, twitter];

icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

// region default
const metadata: Meta<IgcCardComponent> = {
  title: 'Card',
  component: 'igc-card',
  parameters: {
    docs: {
      description: {
        component:
          'A container component that wraps different elements related to a single subject.\nThe card component provides a flexible container for organizing content such as headers,\nmedia, text content, and actions.',
      },
    },
  },
  argTypes: {
    elevated: {
      type: 'boolean',
      description:
        'Sets the card to have an elevated appearance with shadow.\nWhen false, the card uses an outlined style with a border.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { elevated: false },
};

export default metadata;

interface IgcCardArgs {
  /**
   * Sets the card to have an elevated appearance with shadow.
   * When false, the card uses an outlined style with a border.
   */
  elevated: boolean;
}
type Story = StoryObj<IgcCardArgs>;

// endregion

const cityImageUrl =
  'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80';
const avatarUrl =
  'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg';
const albumCoverUrl =
  'https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg';

const cardStyle = 'max-width: 344px;';
const rowStyle = 'display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1rem;';

export const Basic: Story = {
  render: ({ elevated }) => html`
    <div style=${cardStyle}>
      <igc-card ?elevated=${elevated}>
        <igc-card-media style="max-height: 194px">
          <img src=${cityImageUrl} alt="New York City" />
        </igc-card-media>
        <igc-card-header>
          <igc-avatar
            slot="thumbnail"
            shape="rounded"
            src=${avatarUrl}
          ></igc-avatar>
          <h3 slot="title">New York</h3>
          <h5 slot="subtitle">City that never sleeps</h5>
        </igc-card-header>
        <igc-card-content>
          <p>
            New York City comprises 5 boroughs sitting where the Hudson River
            meets the Atlantic Ocean. At its core is Manhattan, a densely
            populated borough that's among the world's major commercial,
            financial and cultural centers.
          </p>
        </igc-card-content>
        <igc-card-actions>
          <igc-button slot="start" variant="flat">Like</igc-button>
          <igc-button slot="start" variant="flat">Learn More</igc-button>
          <igc-icon-button
            slot="end"
            name="twitter"
            variant="flat"
          ></igc-icon-button>
          <igc-icon-button
            slot="end"
            name="facebook"
            variant="flat"
          ></igc-icon-button>
        </igc-card-actions>
      </igc-card>
    </div>
  `,
};

export const Outlined: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The card has two visual styles: **outlined** (default) renders with a border, and **elevated** renders with a drop shadow.',
      },
    },
  },
  render: () => html`
    <div style=${rowStyle}>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Outlined (default)</p>
        <igc-card>
          <igc-card-media style="max-height: 194px">
            <img src=${cityImageUrl} alt="New York City" />
          </igc-card-media>
          <igc-card-header>
            <h3 slot="title">New York</h3>
            <h5 slot="subtitle">City that never sleeps</h5>
          </igc-card-header>
          <igc-card-content>
            <p>Outlined cards use a subtle border to define their boundary.</p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Elevated</p>
        <igc-card elevated>
          <igc-card-media style="max-height: 194px">
            <img src=${cityImageUrl} alt="New York City" />
          </igc-card-media>
          <igc-card-header>
            <h3 slot="title">New York</h3>
            <h5 slot="subtitle">City that never sleeps</h5>
          </igc-card-header>
          <igc-card-content>
            <p>Elevated cards use a drop shadow to lift them off the page.</p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Learn More</igc-button>
          </igc-card-actions>
        </igc-card>
      </div>
    </div>
  `,
};

export const MediaPosition: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `igc-card-media` component can be placed before or after `igc-card-header` to control where the image appears relative to the card title.',
      },
    },
  },
  render: () => html`
    <div style=${rowStyle}>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">
          Media before header
        </p>
        <igc-card>
          <igc-card-media style="max-height: 194px">
            <img src=${cityImageUrl} alt="New York City" />
          </igc-card-media>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              shape="rounded"
              src=${avatarUrl}
            ></igc-avatar>
            <h3 slot="title">New York</h3>
            <h5 slot="subtitle">City that never sleeps</h5>
          </igc-card-header>
          <igc-card-content>
            <p>Media placed above the header creates a visually rich card.</p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-icon-button slot="end" name="instagram"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Media after header</p>
        <igc-card>
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              shape="rounded"
              src=${avatarUrl}
            ></igc-avatar>
            <h3 slot="title">New York</h3>
            <h5 slot="subtitle">City that never sleeps</h5>
          </igc-card-header>
          <igc-card-media style="max-height: 194px">
            <img src=${cityImageUrl} alt="New York City" />
          </igc-card-media>
          <igc-card-content>
            <p>Media placed below the header leads with the title context.</p>
          </igc-card-content>
          <igc-card-actions>
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-icon-button slot="end" name="instagram"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
    </div>
  `,
};

export const Horizontal: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Cards can be laid out horizontally by applying `flex-direction: row` to the card element, useful for media-beside-text patterns.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem; max-width: 560px;"
    >
      <igc-card style="flex-direction: row">
        <div style="flex: 1">
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              shape="rounded"
              src="https://www.infragistics.com/angular-demos/assets/images/card/media/ROZES-Under-the-Grave.jpg"
            ></igc-avatar>
            <h3 slot="title">Rozes</h3>
            <h5 slot="subtitle">Under the Grave (2016)</h5>
          </igc-card-header>
          <igc-card-content>
            I write what's real and what's true, even if it means throwing
            myself under the bus.
          </igc-card-content>
        </div>
        <igc-card-actions orientation="vertical">
          <igc-icon-button name="facebook" variant="flat"></igc-icon-button>
          <igc-icon-button name="instagram" variant="flat"></igc-icon-button>
          <igc-icon-button name="twitter" variant="flat"></igc-icon-button>
        </igc-card-actions>
      </igc-card>
      <igc-card>
        <div style="display: flex; flex-direction: row">
          <div style="flex: 1">
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                shape="rounded"
                src=${albumCoverUrl}
              ></igc-avatar>
              <h3 slot="title">HERE</h3>
              <h5 slot="subtitle">By Mellow D</h5>
            </igc-card-header>
            <igc-card-content>
              <p>
                Far far away, behind the word mountains, far from the countries
                Vokalia and Consonantia, there live the blind texts.
              </p>
            </igc-card-content>
            <igc-card-actions>
              <igc-button slot="start" variant="flat">Play Album</igc-button>
            </igc-card-actions>
          </div>
          <igc-card-media style="width: 96px; flex-shrink: 0">
            <img src=${albumCoverUrl} alt="Album cover" />
          </igc-card-media>
        </div>
      </igc-card>
    </div>
  `,
};

export const ActionsOrientation: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `igc-card-actions` component supports `horizontal` (default) and `vertical` orientations for laying out action buttons.',
      },
    },
  },
  render: () => html`
    <div style=${rowStyle}>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">
          Horizontal actions (default)
        </p>
        <igc-card>
          <igc-card-header>
            <h3 slot="title">Horizontal</h3>
            <h5 slot="subtitle">Actions spread across the bottom</h5>
          </igc-card-header>
          <igc-card-content>
            <p>
              Actions are laid out in a row with start-aligned buttons and
              end-aligned icon buttons.
            </p>
          </igc-card-content>
          <igc-card-actions orientation="horizontal">
            <igc-button slot="start" variant="flat">Like</igc-button>
            <igc-button slot="start" variant="flat">Share</igc-button>
            <igc-icon-button
              slot="end"
              name="twitter"
              variant="flat"
            ></igc-icon-button>
            <igc-icon-button
              slot="end"
              name="facebook"
              variant="flat"
            ></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
      <div style=${cardStyle}>
        <p style="margin: 0 0 0.75rem; font-weight: 600;">Vertical actions</p>
        <igc-card style="flex-direction: row">
          <igc-card-header style="flex: 1">
            <h3 slot="title">Vertical</h3>
            <h5 slot="subtitle">Actions stacked on the side</h5>
          </igc-card-header>
          <igc-card-actions orientation="vertical">
            <igc-icon-button name="twitter" variant="flat"></igc-icon-button>
            <igc-icon-button name="facebook" variant="flat"></igc-icon-button>
            <igc-icon-button name="instagram" variant="flat"></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      </div>
    </div>
  `,
};
