import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { Story } from './story.js';
import '../igniteui-webcomponents.js';

// region default
export default {
  title: 'Link-button',
  component: 'igc-link-button',
  argTypes: {
    href: {
      control: 'text',
    },
    download: {
      control: 'text',
    },
    target: {
      control: {
        type: 'select',
        options: ['_blank', '_parent', '_self', '_top', 'undefined'],
      },
    },
    rel: {
      control: 'text',
    },
    disabled: {
      description: 'Determines whether the button is disabled.',
      defaultValue: 'false',
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
interface ArgTypes {
  href: string;
  download: string;
  target: '_blank' | '_parent' | '_self' | '_top' | undefined;
  rel: string;
  disabled: boolean;
  variant: 'flat' | 'raised' | 'outlined' | 'fab';
  size: 'small' | 'medium' | 'large';
}
// endregion

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  {
    disabled = false,
    size,
    variant,
    href = 'http://www.infragistics.com',
    download,
    rel,
    target,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-link-button
    .disabled=${disabled}
    .size=${size}
    .variant=${variant}
    .href=${href}
    .download=${download}
    .rel=${rel}
    .target=${target}
    dir=${ifDefined(direction)}
  >
    Click me
  </igc-link-button>
`;

export const Basic = Template.bind({});

export const BlankTarget = Template.bind({});
BlankTarget.args = {
  target: '_blank',
};
