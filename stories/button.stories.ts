import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Button',
  component: 'igc-button',
  argTypes: {
    type: {
      type: '"button" | "reset" | "submit"',
      description: 'The type of the button. Defaults to undefined.',
      options: ['button', 'reset', 'submit'],
      control: {
        type: 'inline-radio',
      },
    },
    disabled: {
      type: 'boolean',
      description: 'Determines whether the button is disabled.',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
    variant: {
      type: '"flat" | "contained" | "outlined" | "fab"',
      options: ['flat', 'contained', 'outlined', 'fab'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'flat',
        },
      },
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'large',
        },
      },
    },
  },
};
export default metadata;
interface ArgTypes {
  type: 'button' | 'reset' | 'submit';
  disabled: boolean;
  variant: 'flat' | 'contained' | 'outlined' | 'fab';
  size: 'small' | 'medium' | 'large';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { disabled = false, size, variant, type }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-button
      .disabled=${disabled}
      .size=${size}
      .variant=${variant}
      .type=${type}
      dir=${ifDefined(direction)}
    >
      <span slot="prefix">+</span>
      Click
      <span slot="suffix">-</span>
    </igc-button>
  `;
};

export const Basic = Template.bind({});
