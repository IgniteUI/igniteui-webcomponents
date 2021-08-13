import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';
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
    initials: {
      control: {
        type: 'text',
      },
      defaultValue: 'JB',
      description: 'The initials used',
    },
    src: {
      control: 'text',
      defaultValue:
        'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
    },
    alt: { control: 'text' },
  },
};

interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'rounded' | 'square';
  initials: string;
  src: string;
  alt: string;
}

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
