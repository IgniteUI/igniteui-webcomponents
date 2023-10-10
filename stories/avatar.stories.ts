import type { Meta, StoryObj } from '@storybook/web-components';

import { IgcAvatarComponent, defineComponents } from '../src/index.js';

defineComponents(IgcAvatarComponent);

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
      type: '"circle" | "rounded" | "square"',
      description: 'The shape of the avatar.',
      options: ['circle', 'rounded', 'square'],
      control: { type: 'inline-radio' },
      defaultValue: 'square',
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
  shape: 'circle' | 'rounded' | 'square';
}
type Story = StoryObj<IgcAvatarArgs>;

// endregion

export const Image: Story = {
  args: {
    src: 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
  },
};

export const WithInitials: Story = {
  args: {
    initials: 'RK',
  },
};
