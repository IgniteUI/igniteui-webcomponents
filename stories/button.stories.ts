import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Button',
  component: 'igc-button',
  argTypes: {
    type: {
      description: 'The type of the button. Defaults to undefined.',
      control: {
        type: 'inline-radio',
        options: ['button', 'reset', 'submit'],
      },
    },
    disabled: {
      description: 'Determines whether the button is disabled.',
      defaultValue: false,
      control: 'boolean',
    },
    variant: {
      defaultValue: 'flat',
      control: {
        type: 'select',
        options: ['flat', 'raised', 'outlined', 'fab'],
      },
    },
    size: {
      description: 'Determines the size of the component.',
      defaultValue: 'large',
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
    },
  },
};
export default metadata;
interface ArgTypes {
  type: 'button' | 'reset' | 'submit';
  disabled: boolean;
  variant: 'flat' | 'raised' | 'outlined' | 'fab';
  size: 'small' | 'medium' | 'large';
}
// endregion

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

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
