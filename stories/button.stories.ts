import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context } from './story.js';
import { defineComponents, IgcButtonComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcButtonComponent);

// region default
const metadata: Meta<IgcButtonComponent> = {
  title: 'Button',
  component: 'igc-button',
  parameters: {
    docs: {
      description: {
        component:
          'Represents a clickable button, used to submit forms or anywhere in a\ndocument for accessible, standard button functionality.',
      },
    },
  },
  argTypes: {
    variant: {
      type: '"flat" | "contained" | "outlined" | "fab"',
      description: 'Sets the variant of the button.',
      options: ['flat', 'contained', 'outlined', 'fab'],
      control: { type: 'inline-radio' },
      defaultValue: 'contained',
    },
    type: {
      type: '"button" | "reset" | "submit"',
      description: 'The type of the button. Defaults to undefined.',
      options: ['button', 'reset', 'submit'],
      control: { type: 'inline-radio' },
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
      control: { type: 'select' },
    },
    rel: {
      type: 'string',
      description:
        'The relationship of the linked URL.\nSee https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    ariaLabel: { type: 'string', control: 'text' },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: { variant: 'contained', disabled: false, size: 'medium' },
};

export default metadata;

interface IgcButtonArgs {
  /** Sets the variant of the button. */
  variant: 'flat' | 'contained' | 'outlined' | 'fab';
  /** The type of the button. Defaults to undefined. */
  type: 'button' | 'reset' | 'submit';
  /** The URL the button points to. */
  href: string;
  /** Prompts to save the linked URL instead of navigating to it. */
  download: string;
  /** Where to display the linked URL, as the name for a browsing context. */
  target: '_blank' | '_parent' | '_self' | '_top' | undefined;
  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   */
  rel: string;
  /** The disabled state of the component */
  disabled: boolean;
  ariaLabel: string;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcButtonArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcBlur', 'igcFocus'],
  },
});

const ButtonTemplate = (
  { disabled = false, size, variant, type }: IgcButtonArgs,
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

const LinkTemplate = (
  {
    disabled = false,
    size,
    variant,
    href = 'http://www.infragistics.com',
    download,
    rel,
    target,
  }: IgcButtonArgs,
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

export const Button: Story = ButtonTemplate.bind({});
export const Link: Story = LinkTemplate.bind({});
export const BlankTarget: Story = LinkTemplate.bind({});
BlankTarget.args = {
  target: '_blank',
};
