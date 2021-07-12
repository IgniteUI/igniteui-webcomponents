import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Badge',
  component: 'igc-badge',
  argTypes: {
    shape: {
      control: {
        type: 'inline-radio',
        options: ['rounded', 'square'],
      },
      defaultValue: 'rounded',
    },
    variant: {
      control: {
        type: 'inline-radio',
        options: ['primary', 'info', 'success', 'warning', 'danger'],
      },
      defaultValue: 'primary',
    },
    outlined: {
      control: 'boolean',
      description: 'Determines whether the badge is outlined.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
};

interface ArgTypes {
  shape: 'rounded' | 'square';
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  outlined: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  { outlined = false, shape, variant }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-badge
      ?outlined=${outlined}
      shape=${ifDefined(shape)}
      variant=${ifDefined(variant)}
      dir=${ifDefined(direction)}
    ></igc-badge>
  `;
};

export const Basic = Template.bind({});
