import { all } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconButtonComponent,
  IgcRippleComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcIconButtonComponent, IgcRippleComponent);

const icons = all.map((icon) => icon.name);

// region default
const metadata: Meta<IgcIconButtonComponent> = {
  title: 'IconButton',
  component: 'igc-icon-button',
  parameters: {
    docs: {
      description: {
        component:
          'A button that displays a single icon, designed for compact, icon-only\ninteractions such as toolbar actions, floating action buttons, or inline\ncontrols.\n\nThe icon is sourced from the icon registry via the `name` and `collection`\nattributes. Like `igc-button`, it can render as an anchor element when\n`href` is set and is fully form-associated.',
      },
    },
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name of the icon to display.',
      control: 'text',
    },
    collection: {
      type: 'string',
      description: 'The collection the icon belongs to.',
      control: 'text',
    },
    mirrored: {
      type: 'boolean',
      description:
        'Determines whether the icon should be mirrored in right-to-left contexts.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      type: '"contained" | "flat" | "outlined"',
      description:
        'The variant of the button which determines its visual appearance.\n- `contained` – filled background; highest visual emphasis (default).\n- `outlined` – transparent background with a visible border.\n- `flat` – no background or border; lowest visual emphasis.',
      options: ['contained', 'flat', 'outlined'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'contained' } },
    },
    type: {
      type: '"button" | "reset" | "submit"',
      description:
        "The type of the button, which determines its behavior and semantics.\n- `'button'` – no default action; useful for custom JavaScript handlers.\n- `'submit'` – submits the associated form when clicked.\n- `'reset'` – resets the associated form fields to their initial values.\n\nIgnored when the button is rendered as a link (i.e. `href` is set).",
      options: ['button', 'reset', 'submit'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'button' } },
    },
    href: {
      type: 'string',
      description:
        'The URL the button points to. When set, the component renders as an\n`<a>` element instead of a `<button>`, enabling navigation on click.\nUse together with `target`, `download`, and `rel` for full anchor semantics.',
      control: 'text',
    },
    download: {
      type: 'string',
      description:
        'Prompts the browser to download the linked resource rather than navigating\nto it. The optional value is used as the suggested file name.\nOnly effective when `href` is set.',
      control: 'text',
    },
    target: {
      type: '"_blank" | "_parent" | "_self" | "_top"',
      description:
        "Where to open the linked document. Only effective when `href` is set.\n- `'_self'` – current browsing context (default browser behavior).\n- `'_blank'` – new tab or window.\n- `'_parent'` – parent browsing context; falls back to `_self` if none.\n- `'_top'` – top-level browsing context; falls back to `_self` if none.",
      options: ['_blank', '_parent', '_self', '_top'],
      control: { type: 'select' },
    },
    rel: {
      type: 'string',
      description:
        'The relationship between the current document and the linked URL.\nAccepts a space-separated list of link types (e.g. `\'noopener noreferrer\'`).\nOnly effective when `href` is set. When `target="_blank"` is used,\nsetting `rel="noopener noreferrer"` is strongly recommended for security.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'When set, the button will be disabled and non-interactive.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    command: {
      type: 'string',
      description:
        "The command to invoke on the target element specified by `commandfor`.\nPart of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.\nCustom commands must start with two dashes (e.g. `'--my-command'`).",
      control: 'text',
    },
    commandfor: {
      type: 'string',
      description:
        'The ID of the target element for the invoker command.\nPart of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).',
      control: 'text',
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
  /** The name of the icon to display. */
  name: string;
  /** The collection the icon belongs to. */
  collection: string;
  /** Determines whether the icon should be mirrored in right-to-left contexts. */
  mirrored: boolean;
  /**
   * The variant of the button which determines its visual appearance.
   * - `contained` – filled background; highest visual emphasis (default).
   * - `outlined` – transparent background with a visible border.
   * - `flat` – no background or border; lowest visual emphasis.
   */
  variant: 'contained' | 'flat' | 'outlined';
  /**
   * The type of the button, which determines its behavior and semantics.
   * - `'button'` – no default action; useful for custom JavaScript handlers.
   * - `'submit'` – submits the associated form when clicked.
   * - `'reset'` – resets the associated form fields to their initial values.
   *
   * Ignored when the button is rendered as a link (i.e. `href` is set).
   */
  type: 'button' | 'reset' | 'submit';
  /**
   * The URL the button points to. When set, the component renders as an
   * `<a>` element instead of a `<button>`, enabling navigation on click.
   * Use together with `target`, `download`, and `rel` for full anchor semantics.
   */
  href: string;
  /**
   * Prompts the browser to download the linked resource rather than navigating
   * to it. The optional value is used as the suggested file name.
   * Only effective when `href` is set.
   */
  download: string;
  /**
   * Where to open the linked document. Only effective when `href` is set.
   * - `'_self'` – current browsing context (default browser behavior).
   * - `'_blank'` – new tab or window.
   * - `'_parent'` – parent browsing context; falls back to `_self` if none.
   * - `'_top'` – top-level browsing context; falls back to `_self` if none.
   */
  target: '_blank' | '_parent' | '_self' | '_top';
  /**
   * The relationship between the current document and the linked URL.
   * Accepts a space-separated list of link types (e.g. `'noopener noreferrer'`).
   * Only effective when `href` is set. When `target="_blank"` is used,
   * setting `rel="noopener noreferrer"` is strongly recommended for security.
   */
  rel: string;
  /** When set, the button will be disabled and non-interactive. */
  disabled: boolean;
  /**
   * The command to invoke on the target element specified by `commandfor`.
   * Part of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.
   * Custom commands must start with two dashes (e.g. `'--my-command'`).
   */
  command: string;
  /**
   * The ID of the target element for the invoker command.
   * Part of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
   */
  commandfor: string;
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

export const Default: Story = {
  args: { name: 'biking' },
  parameters: {
    docs: {
      description: {
        story:
          'An interactive icon button. Use the `name` select to swap icons, switch `variant` between contained/flat/outlined, toggle `disabled` or `mirrored`, or set `href` to render the button as an anchor link.',
      },
    },
  },
  render: ({
    name,
    collection,
    mirrored,
    href,
    download,
    target,
    rel,
    variant,
    disabled,
  }) => html`
    <igc-icon-button
      .name=${name ?? 'biking'}
      .collection=${collection ?? 'default'}
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
  `,
};

export const ContentSlot: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Any content can be projected into the default slot: a registered SVG icon (with a ripple effect), a Unicode emoji, a Material Icons ligature, or a Font Awesome icon class.',
      },
    },
  },
  render: () => html`
    <link
      href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"
    />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
      rel="stylesheet"
    />
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap">
      <igc-icon-button>
        <igc-ripple></igc-ripple>
        <igc-icon name="biking"></igc-icon>
      </igc-icon-button>
      <igc-icon-button>💙<igc-ripple></igc-ripple></igc-icon-button>
      <igc-icon-button>
        <span class="material-icons">favorite</span>
      </igc-icon-button>
      <igc-icon-button>
        <i class="fa-solid fa-droplet"></i>
      </igc-icon-button>
    </div>
  `,
};
