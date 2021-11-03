import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { Context, Story } from './story.js';
import '../src/index.js';

// region default
const metadata = {
  title: 'Link Button',
  component: 'igc-link-button',
  argTypes: {
    href: {
      type: 'string',
      description: 'The URL the link-button points to.',
      control: 'text',
    },
    download: {
      type: 'string',
      description:
        'Prompts to save the linked URL instead of navigating to it.',
      control: 'text',
    },
    target: {
      type: '"_blank" | "_parent" | "_self" | "_top" | undefined',
      description:
        'Where to display the linked URL, as the name for a browsing context.',
      options: ['_blank', '_parent', '_self', '_top', 'undefined'],
      control: {
        type: 'select',
      },
    },
    rel: {
      type: 'string',
      description:
        'The relationship of the linked URL.\nSee https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'Determines whether the button is disabled.',
      control: 'boolean',
      defaultValue: false,
    },
    variant: {
      type: '"flat" | "contained" | "outlined" | "fab"',
      description: 'Sets the variant of the button.',
      options: ['flat', 'contained', 'outlined', 'fab'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'flat',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
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
