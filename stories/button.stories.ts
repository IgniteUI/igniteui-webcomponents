import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcButtonComponent, IgcIconComponent, IgcInputComponent);

registerIconFromText(
  'home',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
);
registerIconFromText(
  'add',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`
);
registerIconFromText(
  'download',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`
);
registerIconFromText(
  'open-in-new',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`
);
registerIconFromText(
  'edit',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`
);
registerIconFromText(
  'delete',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`
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

export const Basic: Story = {
  render: ({ disabled, variant, type }) => html`
    <igc-button ?disabled=${disabled} variant=${variant} type=${type}>
      Click me
    </igc-button>
  `,
};

export const Variants: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Four visual variants are available: <code>contained</code> (filled, high
      emphasis), <code>outlined</code> (medium emphasis), <code>flat</code> (low
      emphasis, no border), and <code>fab</code>
      (floating action button, rounded).
    </p>
    <div
      style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;"
    >
      <igc-button variant="contained">Contained</igc-button>
      <igc-button variant="outlined">Outlined</igc-button>
      <igc-button variant="flat">Flat</igc-button>
      <igc-button variant="fab">
        <igc-icon slot="prefix" name="add" collection="default"></igc-icon>
        FAB
      </igc-button>
    </div>
  `,
};

export const WithPrefixSuffix: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Use the <code>prefix</code> and <code>suffix</code> slots to place icons
      or other content before and after the button label.
    </p>
    <div
      style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;"
    >
      <igc-button variant="contained">
        <igc-icon slot="prefix" name="add" collection="default"></igc-icon>
        New item
      </igc-button>
      <igc-button variant="outlined">
        <igc-icon slot="prefix" name="download" collection="default"></igc-icon>
        Download
      </igc-button>
      <igc-button variant="flat">
        Edit
        <igc-icon slot="suffix" name="edit" collection="default"></igc-icon>
      </igc-button>
      <igc-button variant="outlined">
        <igc-icon slot="prefix" name="delete" collection="default"></igc-icon>
        Delete
        <igc-icon slot="suffix" name="delete" collection="default"></igc-icon>
      </igc-button>
    </div>
  `,
};

export const Disabled: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      The <code>disabled</code> attribute prevents interaction and applies
      reduced-opacity styling across all variants.
    </p>
    <div
      style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;"
    >
      <igc-button variant="contained" disabled>Contained</igc-button>
      <igc-button variant="outlined" disabled>Outlined</igc-button>
      <igc-button variant="flat" disabled>Flat</igc-button>
      <igc-button variant="fab" disabled>
        <igc-icon slot="prefix" name="add" collection="default"></igc-icon>
        FAB
      </igc-button>
    </div>
  `,
};

export const AsLink: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Setting <code>href</code> renders the button as an
      <code>&lt;a&gt;</code> element, supporting <code>target</code>,
      <code>rel</code>, and <code>download</code> attributes.
    </p>
    <div
      style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;"
    >
      <igc-button
        variant="contained"
        href="https://www.infragistics.com/products/ignite-ui-web-components"
        target="_blank"
        rel="noopener noreferrer"
      >
        <igc-icon slot="prefix" name="home" collection="default"></igc-icon>
        Visit docs
        <igc-icon
          slot="suffix"
          name="open-in-new"
          collection="default"
        ></igc-icon>
      </igc-button>
      <igc-button
        variant="outlined"
        href="https://www.infragistics.com/products/ignite-ui-web-components"
        target="_blank"
        rel="noopener noreferrer"
        disabled
      >
        Disabled link
      </igc-button>
    </div>
  `,
};

export const InForm: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Buttons with <code>type="submit"</code> and <code>type="reset"</code>
      participate in native form submission and reset.
    </p>
    <form
      style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 320px;"
      @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const out = document.querySelector<HTMLElement>('#form-output');
        if (out)
          out.textContent = JSON.stringify(Object.fromEntries(data), null, 2);
      }}
    >
      <igc-input
        label="Name"
        name="name"
        type="text"
        placeholder="Enter your name"
      ></igc-input>
      <igc-input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
      ></igc-input>
      <div style="display: flex; gap: 0.5rem;">
        <igc-button type="submit" variant="contained">Submit</igc-button>
        <igc-button type="reset" variant="outlined">Reset</igc-button>
      </div>
    </form>
    <div style="margin-top: 1rem;">
      <p style="margin: 0 0 0.25rem; font-weight: 600;">Submitted data:</p>
      <pre
        id="form-output"
        style="margin: 0; padding: 0.75rem; background: var(--ig-gray-100, #f5f5f5); border-radius: 4px; font-size: 0.8rem; min-height: 3rem;"
      >
Submit the form to see the data here.</pre
      >
    </div>
  `,
};
