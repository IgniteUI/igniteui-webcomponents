import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';
import { defineComponents, IgcButtonComponent } from '../src/index.js';

defineComponents(IgcButtonComponent);

// region default
const metadata: Meta = {
  title: 'Button',
  component: 'igc-button',
  argTypes: {
    variant: {
      type: '"flat" | "contained" | "outlined" | "fab"',
      description: 'Sets the variant of the button.',
      options: ['flat', 'contained', 'outlined', 'fab'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'contained',
    },
    type: {
      type: '"button" | "reset" | "submit"',
      description: 'The type of the button. Defaults to undefined.',
      options: ['button', 'reset', 'submit'],
      control: {
        type: 'inline-radio',
      },
    },
    href: {
      type: 'string',
      description: 'The URL the button points to.',
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
    ariaLabel: {
      type: 'string',
      control: 'text',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'medium',
    },
  },
  args: {
    variant: 'contained',
    disabled: false,
    size: 'medium',
  },
};
export default metadata;

// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcBlur', 'igcFocus'],
  },
};

const ButtonTemplate: Story<ArgTypes, Context> = (
  { disabled = false, size, variant, type }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const handleClick = () => {
    console.log('the button was clicked');
  };

  return html`
    <igc-button
      @click=${handleClick}
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

const LinkTemplate: Story<ArgTypes, Context> = (
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
  <igc-button
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
  </igc-button>
`;

export const Button = ButtonTemplate.bind({});
export const Link = LinkTemplate.bind({});
export const BlankTarget = LinkTemplate.bind({});
BlankTarget.args = {
  target: '_blank',
};
