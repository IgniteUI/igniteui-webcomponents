import type { Meta, StoryObj as Story } from '@storybook/web-components';
import { defineComponents, IgcAvatarComponent } from '../src/index.js';

defineComponents(IgcAvatarComponent);

// region default
const metadata: Meta = {
  title: 'Avatar',
  component: 'igc-avatar',
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
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'square',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'small',
    },
  },
  args: {
    shape: 'square',
    size: 'small',
  },
};
export default metadata;

// endregion

export const Default: Story = {};

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
