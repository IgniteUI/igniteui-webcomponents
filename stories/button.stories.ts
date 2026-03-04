import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcAnchorPopoverComponent,
  IgcButtonComponent,
  IgcIconComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(
  IgcButtonComponent,
  IgcIconComponent,
  IgcAnchorPopoverComponent
);

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

function togglePopover() {
  const popover = document.getElementById('pop') as IgcAnchorPopoverComponent;
  popover.open = !popover.open;
}

function toggleAnotherPopover() {
  const popover = document.querySelector(
    'igc-anchor-popover[anchor="another-button"]'
  ) as IgcAnchorPopoverComponent;
  popover.open = !popover.open;
}

export const AnchorPopoverButton: Story = {
  render: () => html`
    <style>
      .popover-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        border: 1px dashed var(--ig-primary-500);
        background-color: #fff;
        gap: 0.5rem;
      }
      #another-button {
        margin-top: 600px;
      }
    </style>

    <igc-button id="popover-anchor" @click=${togglePopover}
      >Open popover</igc-button
    >
    <igc-anchor-popover
      id="pop"
      anchor="popover-anchor"
      placement="bottom-start"
      shift
      offset="1rem"
    >
      <div class="popover-content">
        <h3>Popover Title</h3>
        <p>This is the content of the popover.</p>
        <igc-button @click=${togglePopover}>Close</igc-button>
      </div>
    </igc-anchor-popover>

    <div style="min-height: 1400px; min-width: 2400px;">
      <igc-button id="another-button" @click=${toggleAnotherPopover}>
        Another button to test flipping behavior when popover is open
      </igc-button>
      <igc-anchor-popover
        anchor="another-button"
        placement="bottom"
        offset="1rem"
        flip
        shift
      >
        <div class="popover-content">
          <h3>Another Popover</h3>
          <p>
            This popover should flip to the top if there is not enough space
            below.
          </p>
          <igc-button @click=${toggleAnotherPopover}>Close</igc-button>
        </div>
      </igc-anchor-popover>
    </div>
  `,
};
