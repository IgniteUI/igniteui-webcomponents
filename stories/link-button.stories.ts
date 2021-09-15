import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { Context, Story } from './story.js';
import '../igniteui-webcomponents.js';

// region default
const metadata = {
  title: 'Link Button',
  component: 'igc-link-button',
  argTypes: {
    href: {
      type: 'string',
      control: 'text',
    },
    download: {
      type: 'string',
      control: 'text',
    },
    target: {
      type: '"_blank" | "_parent" | "_self" | "_top" | undefined',
      options: ['_blank', '_parent', '_self', '_top', 'undefined'],
      control: {
        type: 'select',
      },
    },
    rel: {
      type: 'string',
      control: 'text',
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
  href: string;
  download: string;
  target: '_blank' | '_parent' | '_self' | '_top' | undefined;
  rel: string;
  disabled: boolean;
  variant: 'flat' | 'contained' | 'outlined' | 'fab';
  size: 'small' | 'medium' | 'large';
}
// endregion

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
