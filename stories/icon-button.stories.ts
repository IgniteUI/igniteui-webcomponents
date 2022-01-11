import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import { all } from '@igniteui/material-icons-extended';

const icons = all.map((icon) => icon.name);

// region default
const metadata = {
  title: 'Icon Button',
  component: 'igc-icon-button',
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
      defaultValue: false,
    },
    variant: {
      type: '"flat" | "contained" | "outlined"',
      description: 'The visual variant of the icon button.',
      options: ['flat', 'contained', 'outlined'],
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
      description: 'The aria label of the button.',
      control: 'text',
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
  name: string;
  collection: string;
  mirrored: boolean;
  variant: 'flat' | 'contained' | 'outlined';
  type: 'button' | 'reset' | 'submit';
  href: string;
  download: string;
  target: '_blank' | '_parent' | '_self' | '_top' | undefined;
  rel: string;
  disabled: boolean;
  ariaLabel: string;
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata.argTypes.name as any).control = {
  type: 'select',
  options: icons,
};

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

const Template: Story<ArgTypes, Context> = (
  {
    name = 'biking',
    collection = 'default',
    mirrored,
    href,
    download,
    size,
    target,
    rel,
    variant,
    disabled,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-icon-button
      .name=${name}
      .collection=${collection}
      .mirrored=${mirrored}
      href=${ifDefined(href)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel)}
      dir=${ifDefined(direction)}
      download=${ifDefined(download)}
      variant=${ifDefined(variant)}
      .size=${size}
      .disabled=${ifDefined(disabled)}
    >
    </igc-icon-button>
  `;
};

export const Basic = Template.bind({});
