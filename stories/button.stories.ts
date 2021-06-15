import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Button',
  component: 'igc-button',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Determines whether the button is disabled.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      // defaultValue: 'large'
    },
    variant: {
      control: {
        type: 'inline-radio',
        options: ['flat', 'raised', 'outlined', 'icon', 'fab'],
      },
      // defaultValue: 'flat'
    },
    type: {
      control: {
        type: 'inline-radio',
        options: ['button', 'reset', 'submit'],
      },
      // defaultValue: 'button'
    },
  },
};

interface ArgTypes {
  disabled: boolean;
  size: 'small' | 'medium' | 'large';
  variant: 'flat' | 'raised' | 'outlined' | 'icon' | 'fab';
  type: 'button' | 'reset' | 'submit';
}

const Template: Story<ArgTypes> = ({
  disabled = false,
  size,
  variant,
  type,
}: ArgTypes) => html`
  <igc-button
    ?disabled=${disabled}
    size=${ifDefined(size)}
    variant=${ifDefined(variant)}
    type=${ifDefined(type)}
  >
    Click me
  </igc-button>
`;

export const Basic = Template.bind({});
