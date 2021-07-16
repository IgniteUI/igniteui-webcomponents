import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Avatar',
  component: 'igc-avatar',
  argTypes: {
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'small',
    },
    shape: {
      control: {
        type: 'inline-radio',
        options: ['circle', 'rounded', 'square'],
      },
      defaultValue: 'circle',
    },
    src: { control: 'text' },
    alt: { control: 'text' },
  },
};

interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'rounded' | 'square';
  src: string;
  alt: string;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  {
    size,
    shape,
    src = 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
    alt,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-avatar
    initials="ab"
    size=${ifDefined(size)}
    shape=${ifDefined(shape)}
    src=${ifDefined(src)}
    alt=${ifDefined(alt)}
    dir=${ifDefined(direction)}
  >
  </igc-avatar>
`;

export const Basic = Template.bind({});
