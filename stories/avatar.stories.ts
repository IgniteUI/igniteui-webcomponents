import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
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
};
export default metadata;
interface ArgTypes {
  src: string;
  alt: string;
  initials: string;
  shape: 'circle' | 'rounded' | 'square';
  size: 'small' | 'medium' | 'large';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { size, shape, src, alt, initials }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-avatar
    initials=${ifDefined(initials)}
    size=${ifDefined(size)}
    shape=${ifDefined(shape)}
    src=${ifDefined(src)}
    alt=${ifDefined(alt)}
    dir=${ifDefined(direction)}
  >
  </igc-avatar>
`;

export const Basic = Template.bind({});
