import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent, IgcIconComponent);

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
      type: '"contained" | "flat" | "outlined" | "fab"',
      description: 'Sets the variant of the button.',
      options: ['contained', 'flat', 'outlined', 'fab'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'contained' } },
    },
    type: {
      type: '"button" | "reset" | "submit"',
      description: 'The type of the button. Defaults to `button`.',
      options: ['button', 'reset', 'submit'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'button' } },
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
      type: '"_blank" | "_parent" | "_self" | "_top"',
      description:
        'Where to display the linked URL, as the name for a browsing context.',
      options: ['_blank', '_parent', '_self', '_top'],
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
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { variant: 'contained', type: 'button', disabled: false },
};

export default metadata;

interface IgcButtonArgs {
  /** Sets the variant of the button. */
  variant: 'contained' | 'flat' | 'outlined' | 'fab';
  /** The type of the button. Defaults to `button`. */
  type: 'button' | 'reset' | 'submit';
  /** The URL the button points to. */
  href: string;
  /** Prompts to save the linked URL instead of navigating to it. */
  download: string;
  /** Where to display the linked URL, as the name for a browsing context. */
  target: '_blank' | '_parent' | '_self' | '_top';
  /**
   * The relationship of the linked URL.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
   */
  rel: string;
  /** The disabled state of the component */
  disabled: boolean;
}
type Story = StoryObj<IgcButtonArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

export const BasicButton: Story = {
  render: ({ disabled, variant, type }) => html`
    <igc-button ?disabled=${disabled} variant=${variant} type=${type}>
      Basic button
    </igc-button>
  `,
};

export const ButtonWithSlots: Story = {
  render: ({ disabled, variant, type }) => html`
    <igc-button ?disabled=${disabled} variant=${variant} type=${type}>
      <span slot="prefix">+</span>
      Click me
      <span slot="suffix">-</span>
    </igc-button>
  `,
};

export const BasicLinkButton: Story = {
  args: {
    href: 'https://www.infragistics.com/products/ignite-ui-web-components',
  },
  render: ({ disabled, download, href, rel, target, variant }) =>
    html`<igc-button
      ?disabled=${disabled}
      download=${download}
      href=${href}
      rel=${rel}
      target=${target}
      variant=${variant}
    >
      Basic link button
    </igc-button>`,
};

export const LinkButtonWithSlots: Story = {
  args: {
    href: 'https://www.infragistics.com/products/ignite-ui-web-components',
    target: '_blank',
  },
  render: ({ disabled, download, href, rel, target, variant }) =>
    html`<igc-button
      ?disabled=${disabled}
      download=${download}
      href=${href}
      rel=${rel}
      target=${target}
      variant=${variant}
    >
      <igc-icon name="home" slot="prefix"></igc-icon>
      Open in new tab
      <igc-icon name="home" slot="suffix"></igc-icon>
    </igc-button>`,
};
