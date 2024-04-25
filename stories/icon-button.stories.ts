import { all } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconButtonComponent,
  IgcRippleComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

defineComponents(IgcIconButtonComponent, IgcRippleComponent);

const icons = all.map((icon) => icon.name);

// region default
const metadata: Meta<IgcIconButtonComponent> = {
  title: 'IconButton',
  component: 'igc-icon-button',
  parameters: { docs: { description: { component: '' } } },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name of the icon.',
      control: 'text',
    },
    collection: {
      type: 'string',
      description: 'The name of the icon collection.',
      control: 'text',
    },
    mirrored: {
      type: 'boolean',
      description: 'Whether to flip the icon button. Useful for RTL layouts.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    variant: {
      type: '"flat" | "contained" | "outlined"',
      description: 'The visual variant of the icon button.',
      options: ['flat', 'contained', 'outlined'],
      control: { type: 'inline-radio' },
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
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    mirrored: false,
    variant: 'contained',
    type: 'button',
    disabled: false,
  },
};

export default metadata;

interface IgcIconButtonArgs {
  /** The name of the icon. */
  name: string;
  /** The name of the icon collection. */
  collection: string;
  /** Whether to flip the icon button. Useful for RTL layouts. */
  mirrored: boolean;
  /** The visual variant of the icon button. */
  variant: 'flat' | 'contained' | 'outlined';
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
type Story = StoryObj<IgcIconButtonArgs>;

// endregion

Object.assign(metadata.argTypes!.name!, {
  control: 'select',
  options: icons,
});

all.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

registerIconFromText(
  'biking',
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>'
);
icons.push('biking');
icons.push('search');
icons.sort();

const Template = ({
  name = 'biking',
  collection = 'default',
  mirrored,
  href,
  download,
  target,
  rel,
  variant,
  disabled,
}: IgcIconButtonArgs) => {
  return html`
    <igc-icon-button
      .name=${name}
      .collection=${collection}
      .mirrored=${mirrored}
      href=${ifDefined(href)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel)}
      download=${ifDefined(download)}
      variant=${ifDefined(variant)}
      .disabled=${disabled}
    >
      <igc-ripple></igc-ripple>
    </igc-icon-button>
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
      rel="stylesheet"
    />
    <igc-icon-button
      href=${ifDefined(href)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel)}
      download=${ifDefined(download)}
      variant=${ifDefined(variant)}
      .disabled=${disabled}
    >
      <igc-ripple></igc-ripple>
      💙
    </igc-icon-button>
    <igc-icon-button
      href=${ifDefined(href)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel)}
      download=${ifDefined(download)}
      variant=${ifDefined(variant)}
      .disabled=${disabled}
    >
      <span class="material-icons">favorite</span>
    </igc-icon-button>
    <igc-icon-button
      href=${ifDefined(href)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel)}
      download=${ifDefined(download)}
      variant=${ifDefined(variant)}
      .disabled=${disabled}
    >
      <i class="fa-solid fa-droplet"></i>
    </igc-icon-button>
  `;
};

export const Basic: Story = Template.bind({});
