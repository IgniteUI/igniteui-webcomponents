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
  },
};

interface ArgTypes {
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'rounded' | 'square';
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  { size, shape }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-avatar
    initials="ab"
    size=${ifDefined(size)}
    shape=${ifDefined(shape)}
    dir=${ifDefined(direction)}
  >
  </igc-avatar>
`;

export const Basic = Template.bind({});
