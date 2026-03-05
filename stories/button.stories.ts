import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcAnchorPopoverComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconComponent,
  type PopoverPlacement,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { range } from 'lit/directives/range.js';

defineComponents(
  IgcButtonComponent,
  IgcIconComponent,
  IgcAnchorPopoverComponent,
  IgcCardComponent
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

const cards = [...range(12)];
const placements: PopoverPlacement[] = [
  'top',
  'right',
  'bottom',
  'left',
  'bottom-start',
  'bottom-end',
  'left-end',
  'left-start',
  'right-start',
  'right-end',
  'top-start',
  'top-end',
];
function toggle(event: PointerEvent) {
  const button = event.currentTarget as IgcButtonComponent;
  if (!button.id) {
    const popover = button.closest(IgcAnchorPopoverComponent.tagName)!;
    popover.open = !popover.open;
    return;
  }

  const popoverId = button.id.replace('internal', 'internal-popover');
  const popover = document.getElementById(
    popoverId
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
      .blah {
        max-inline-size: 1600px;
        max-block-size: 800px;
        overflow: auto;
        background-color: var(--ig-secondary-500);
      }
      .container {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        margin-block: 2rem;
      }
      .card {
        display: grid;
        position: relative;
        min-inline-size: 64rem;
        min-block-size: 192rem;
        border: 1px solid var(--ig-primary-500);
        border-radius: 4px;
        background-color: var(--ig-surface-300);

        &:before {
          display: block;
          position: absolute;
          content: attr(data-id);
          font-size: 48rem;
          inset-block-start: 50%;
          inset-inline-start: 50%;
          transform: translate(-50%, -50%);
          color: var(--ig-gray-300);
        }
      }
      .internal-wrapper {
        padding: 1rem;
        place-self: center;
      }
      #main-anchor {
        margin: 12rem 24rem;
        min-inline-size: 24rem;
        min-block-size: 24rem;
      }
    </style>

    <igc-card id="main-anchor">
      <igc-card-header>
        <h3>Possible popover positions</h3>
      </igc-card-header>
    </igc-card>
    ${placements.map(
      (placement) => html`
        <igc-anchor-popover
          anchor="main-anchor"
          placement=${placement}
          open
          offset="1rem"
        >
          <div class="popover-content">
            <span>Popover with placement: ${placement}</span>
          </div>
        </igc-anchor-popover>
      `
    )}

    <!-- Uncomment the wrapper section to test popover behavior within an overflowed container -->
    <!-- <section class="blah"> -->
    <div class="container">
      ${cards.map(
        (i) => html`
          <div class="card" data-id=${i + 1}>
            <div class="internal-wrapper">
              <igc-button
                id="internal-${i + 1}"
                class="internal"
                @click=${toggle}
              >
                Internal popover ${i + 1}
              </igc-button>

              <igc-anchor-popover
                id="internal-popover-${i + 1}"
                anchor="internal-${i + 1}"
                placement=${placements[i]}
                offset="1rem"
                flip
              >
                <div class="popover-content">
                  <h3>Popover for card ${i + 1}: ${placements[i]}</h3>
                  <igc-card>
                    <igc-card-header>Card header</igc-card-header>
                    <igc-card-content style="max-inline-size: 24rem">
                      This is some content inside the card within the popover.
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Modi magnam molestiae, quidem nulla iure labore minima,
                      quasi necessitatibus impedit quia dignissimos, rerum
                      laborum tempora nostrum! Reiciendis quaerat quae
                      consequatur! Voluptas!
                    </igc-card-content>
                    <igc-card-actions>
                      <igc-button @click=${toggle}>Action</igc-button>
                    </igc-card-actions>
                  </igc-card>
                </div>
              </igc-anchor-popover>
            </div>
          </div>
        `
      )}
    </div>
    <!-- </section> -->
  `,
};
