import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  IgcAvatarComponent,
  IgcIconComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { disableStoryControls } from './story.js';

defineComponents(IgcAvatarComponent, IgcIconComponent);

registerIconFromText(
  'home',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
);

registerIconFromText(
  'person',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.337 0-10 1.676-10 5v2h20v-2c0-3.324-6.663-5-10-5z"/></svg>`
);

// region default
const metadata: Meta<IgcAvatarComponent> = {
  title: 'Avatar',
  component: 'igc-avatar',
  parameters: {
    docs: {
      description: {
        component:
          'An avatar component is used as a representation of a user identity\ntypically in a user profile.',
      },
    },
  },
  argTypes: {
    src: {
      type: 'string',
      description: 'The image source to use.',
      control: 'text',
    },
    alt: {
      type: 'string',
      description: 'Alternative text for the image.',
      control: 'text',
    },
    initials: {
      type: 'string',
      description: 'Initials to use as a fallback when no image is available.',
      control: 'text',
    },
    shape: {
      type: '"square" | "circle" | "rounded"',
      description: 'The shape of the avatar.',
      options: ['square', 'circle', 'rounded'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'square' } },
    },
  },
  args: { shape: 'square' },
};

export default metadata;

interface IgcAvatarArgs {
  /** The image source to use. */
  src: string;
  /** Alternative text for the image. */
  alt: string;
  /** Initials to use as a fallback when no image is available. */
  initials: string;
  /** The shape of the avatar. */
  shape: 'square' | 'circle' | 'rounded';
}
type Story = StoryObj<IgcAvatarArgs>;

// endregion

const avatarStyle =
  'display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;';
const sectionStyle = 'display: flex; flex-direction: column; gap: 1.5rem;';

const imageUrl = (id: number, gender: 'men' | 'women' = 'men') =>
  `https://www.infragistics.com/angular-demos/assets/images/${gender}/${id}.jpg`;

export const Image: Story = {
  args: {
    src: imageUrl(1),
    alt: 'Image of a man',
  },
  render: (args) => html`
    <igc-avatar
      shape=${args.shape}
      src=${args.src}
      alt=${args.alt}
    ></igc-avatar>
  `,
};

export const Initials: Story = {
  args: { initials: 'JD' },
  render: (args) => html`
    <igc-avatar shape=${args.shape} initials=${args.initials}></igc-avatar>
  `,
};

export const WithIcon: Story = {
  render: (args) => html`
    <igc-avatar shape=${args.shape}>
      <igc-icon name="home"></igc-icon>
    </igc-avatar>
  `,
};

export const Shapes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div style=${sectionStyle}>
      <div>
        <p style="margin: 0 0 .5rem">Image</p>
        <div style=${avatarStyle}>
          <igc-avatar
            shape="square"
            src=${imageUrl(1)}
            alt="Square avatar"
          ></igc-avatar>
          <igc-avatar
            shape="rounded"
            src=${imageUrl(2)}
            alt="Rounded avatar"
          ></igc-avatar>
          <igc-avatar
            shape="circle"
            src=${imageUrl(3)}
            alt="Circle avatar"
          ></igc-avatar>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Initials</p>
        <div style=${avatarStyle}>
          <igc-avatar shape="square" initials="AB"></igc-avatar>
          <igc-avatar shape="rounded" initials="CD"></igc-avatar>
          <igc-avatar shape="circle" initials="EF"></igc-avatar>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Icon</p>
        <div style=${avatarStyle}>
          <igc-avatar shape="square"
            ><igc-icon name="person"></igc-icon
          ></igc-avatar>
          <igc-avatar shape="rounded"
            ><igc-icon name="person"></igc-icon
          ></igc-avatar>
          <igc-avatar shape="circle"
            ><igc-icon name="person"></igc-icon
          ></igc-avatar>
        </div>
      </div>
    </div>
  `,
};

export const Sizes: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <div style=${sectionStyle}>
      <div>
        <p style="margin: 0 0 .5rem">Small / Medium / Large — Image</p>
        <div style="display: flex; align-items: flex-end; gap: 1rem;">
          <igc-avatar
            style="--ig-size: 1"
            shape="circle"
            src=${imageUrl(4)}
            alt="Small"
          ></igc-avatar>
          <igc-avatar
            style="--ig-size: 2"
            shape="circle"
            src=${imageUrl(4)}
            alt="Medium"
          ></igc-avatar>
          <igc-avatar
            style="--ig-size: 3"
            shape="circle"
            src=${imageUrl(4)}
            alt="Large"
          ></igc-avatar>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Small / Medium / Large — Initials</p>
        <div style="display: flex; align-items: flex-end; gap: 1rem;">
          <igc-avatar style="--ig-size: 1" initials="SM"></igc-avatar>
          <igc-avatar style="--ig-size: 2" initials="MD"></igc-avatar>
          <igc-avatar style="--ig-size: 3" initials="LG"></igc-avatar>
        </div>
      </div>
      <div>
        <p style="margin: 0 0 .5rem">Small / Medium / Large — Icon</p>
        <div style="display: flex; align-items: flex-end; gap: 1rem;">
          <igc-avatar style="--ig-size: 1"
            ><igc-icon name="home"></igc-icon
          ></igc-avatar>
          <igc-avatar style="--ig-size: 2"
            ><igc-icon name="home"></igc-icon
          ></igc-avatar>
          <igc-avatar style="--ig-size: 3"
            ><igc-icon name="home"></igc-icon
          ></igc-avatar>
        </div>
      </div>
    </div>
  `,
};

export const FallbackChain: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p style="margin: 0 0 1rem">
      When <code>src</code> is omitted or fails to load, the avatar falls back
      to <code>initials</code>, then to the default slot content.
    </p>
    <div style="display: flex; align-items: flex-start; gap: 1.5rem;">
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: .5rem; width: 5rem;"
      >
        <igc-avatar
          shape="circle"
          src=${imageUrl(5)}
          alt="Valid image"
        ></igc-avatar>
        <span style="font-size: .75rem; text-align: center">Valid image</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: .5rem; width: 5rem;"
      >
        <igc-avatar
          shape="circle"
          src="https://broken.url/image.jpg"
          initials="FB"
          alt="Broken image"
        ></igc-avatar>
        <span style="font-size: .75rem; text-align: center"
          >Broken src → initials</span
        >
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: .5rem; width: 5rem;"
      >
        <igc-avatar shape="circle">
          <igc-icon name="person"></igc-icon>
        </igc-avatar>
        <span style="font-size: .75rem; text-align: center"
          >No src → icon slot</span
        >
      </div>
    </div>
  `,
};

export const AvatarGroup: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p style="margin: 0 0 1rem">
      Avatars can be grouped together to represent a team or set of users.
    </p>
    <div style="display: flex; align-items: center;">
      ${[
        { src: imageUrl(1), alt: 'User 1' },
        { src: imageUrl(2), alt: 'User 2' },
        { src: imageUrl(3), alt: 'User 3' },
        { src: imageUrl(1, 'women'), alt: 'User 4' },
        { src: imageUrl(2, 'women'), alt: 'User 5' },
      ].map(
        ({ src, alt }) =>
          html`<igc-avatar
            shape="circle"
            src=${src}
            alt=${alt}
            style="margin-inline-end: -0.75rem;"
          ></igc-avatar>`
      )}
      <igc-avatar shape="circle" initials="+9"></igc-avatar>
    </div>
  `,
};
