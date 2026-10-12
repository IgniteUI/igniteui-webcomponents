import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcDialogComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { delay, disableStoryControls, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcDialogComponent,
  IgcIconComponent,
  IgcInputComponent
);

registerMaterialIcons(
  'arrow-back',
  'arrow-forward',
  'delete',
  'download',
  'edit',
  'open-in-new',
  'plus',
  'share'
);

// region default
const metadata: Meta<IgcButtonComponent> = {
  title: 'Button',
  component: 'igc-button',
  parameters: {
    docs: {
      description: {
        component:
          'Represents a clickable button, used to submit forms or anywhere in a\ndocument for accessible, standard button functionality.\n\nThe button supports multiple visual variants, can render as an anchor\n(`<a>`) element when the `href` attribute is set, and is fully\nform-associated, acting as a native `submit` or `reset` control.',
      },
    },
  },
  argTypes: {
    variant: {
      type: { name: 'enum', value: ['contained', 'flat', 'outlined', 'fab'] },
      description:
        'The variant of the button which determines its visual appearance.\n- `contained` – filled background; highest visual emphasis (default).\n- `outlined` – transparent background with a visible border.\n- `flat` – no background or border; lowest visual emphasis.\n- `fab` – floating action button shape; typically used for primary actions.',
      options: ['contained', 'flat', 'outlined', 'fab'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'contained' } },
    },
    type: {
      type: { name: 'enum', value: ['button', 'reset', 'submit'] },
      description:
        "The type of the button, which determines its behavior and semantics.\n- `'button'` – no default action; useful for custom JavaScript handlers.\n- `'submit'` – submits the associated form when clicked.\n- `'reset'` – resets the associated form fields to their initial values.\n\nIgnored when the button is rendered as a link (i.e. `href` is set).",
      options: ['button', 'reset', 'submit'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'button' } },
    },
    href: {
      type: 'string',
      description:
        'The URL the button points to. When set, the component renders as an\n`<a>` element instead of a `<button>`, enabling navigation on click.\nUse together with `target`, `download`, and `rel` for full anchor semantics.\nA disabled link renders a disabled `<button>` with the link role, because an\nanchor has no disabled state.',
      control: 'text',
    },
    download: {
      type: 'string',
      description:
        'Prompts the browser to download the linked resource rather than navigating\nto it. The optional value is used as the suggested file name.\nOnly effective when `href` is set.',
      control: 'text',
    },
    target: {
      type: { name: 'enum', value: ['_blank', '_parent', '_self', '_top'] },
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
  args: { variant: 'contained', type: 'button', disabled: false },
};

export default metadata;

interface IgcButtonArgs {
  /**
   * The variant of the button which determines its visual appearance.
   * - `contained` – filled background; highest visual emphasis (default).
   * - `outlined` – transparent background with a visible border.
   * - `flat` – no background or border; lowest visual emphasis.
   * - `fab` – floating action button shape; typically used for primary actions.
   */
  variant: 'contained' | 'flat' | 'outlined' | 'fab';
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
   * A disabled link renders a disabled `<button>` with the link role, because an
   * anchor has no disabled state.
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
type Story = StoryObj<IgcButtonArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .bt-stack {
      display: grid;
      gap: 1.5rem;
      max-width: 48rem;
    }

    .bt-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .bt-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .bt-panel h3,
    .bt-panel p {
      margin: 0;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A button with a label. Use the controls panel to change the variant, the type and the disabled state. Set `href` to render the button as a link, and then `target`, `rel` and `download` apply.',
      },
    },
  },
  render: ({ variant, type, disabled, href, target, rel, download }) => html`
    <igc-button
      variant=${variant}
      type=${type}
      ?disabled=${disabled}
      href=${ifDefined(href || undefined)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel || undefined)}
      download=${ifDefined(download || undefined)}
    >
      Save changes
    </igc-button>
  `,
};

export const Appearance: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The variants, with an icon in the `prefix` or the `suffix` slot, and disabled. The variants set the emphasis: use one `contained` button for the main action of a view, `outlined` for the other actions, and `flat` for the actions with the least weight, such as Cancel. `fab` is for the main action of a screen, such as Compose in a mail application. A FAB with only an icon needs an `aria-label`. The card shows the three levels together.',
      },
    },
  },
  render: () => {
    const variants = ['contained', 'outlined', 'flat'] as const;

    return html`
      ${styles}
      <style>
        .bt-table {
          border-spacing: 2rem 1rem;
          text-align: center;
        }

        .bt-table th[scope='row'] {
          text-align: start;
        }

        .bt-card {
          max-width: 28rem;
        }

        .bt-card .bt-row {
          justify-content: flex-end;
        }
      </style>
      <div class="bt-stack">
        <div style="overflow-x: auto">
          <table class="bt-table">
            <thead>
              <tr>
                <td></td>
                <th scope="col">Label</th>
                <th scope="col">Prefix</th>
                <th scope="col">Suffix</th>
                <th scope="col">Disabled</th>
              </tr>
            </thead>
            <tbody>
              ${variants.map(
                (variant) => html`
                  <tr>
                    <th scope="row">${variant}</th>
                    <td><igc-button variant=${variant}>Save</igc-button></td>
                    <td>
                      <igc-button variant=${variant}>
                        <igc-icon slot="prefix" name="plus"></igc-icon>
                        New item
                      </igc-button>
                    </td>
                    <td>
                      <igc-button variant=${variant}>
                        Next
                        <igc-icon slot="suffix" name="arrow-forward"></igc-icon>
                      </igc-button>
                    </td>
                    <td>
                      <igc-button variant=${variant} disabled>Save</igc-button>
                    </td>
                  </tr>
                `
              )}
              <tr>
                <th scope="row">fab</th>
                <td>
                  <igc-button variant="fab" aria-label="Compose">
                    <igc-icon slot="prefix" name="edit"></igc-icon>
                  </igc-button>
                </td>
                <td>
                  <igc-button variant="fab">
                    <igc-icon slot="prefix" name="edit"></igc-icon>
                    Compose
                  </igc-button>
                </td>
                <td></td>
                <td>
                  <igc-button variant="fab" disabled>
                    <igc-icon slot="prefix" name="edit"></igc-icon>
                    Compose
                  </igc-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <article class="bt-panel bt-card" aria-label="Cart item">
          <h3>Trail Runner 2, size 42</h3>
          <p class="muted">$129.00. In stock, ships tomorrow.</p>
          <div class="bt-row">
            <igc-button variant="flat">
              <igc-icon slot="prefix" name="delete"></igc-icon>
              Remove
            </igc-button>
            <igc-button variant="outlined">Save for later</igc-button>
            <igc-button>Check out</igc-button>
          </div>
        </article>
      </div>
    `;
  },
};

const releaseNotes = `Version 7.2.0

- New: a scroll area component.
- Fixed: the accordion skips hidden panels in the keyboard navigation.
`;

export const Links: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The release page of a product. Set `href` when the button goes to another page: the button renders an `<a>`, so the browser offers "Open in a new tab" and shows the URL. `download` saves the target as a file with the given name. With `target="_blank"`, set `rel="noopener noreferrer"`, and tell screen reader users that a new tab opens, as the visually hidden text does here.',
      },
    },
  },
  render: () => html`
    ${styles}
    <article class="bt-panel bt-stack" aria-labelledby="bt-release">
      <h3 id="bt-release">Version 7.2.0</h3>
      <p class="muted">Released on September 30, 2026.</p>
      <div class="bt-row">
        <igc-button
          href="data:text/plain;charset=utf-8,${encodeURIComponent(
            releaseNotes
          )}"
          download="release-notes-7.2.0.txt"
        >
          <igc-icon slot="prefix" name="download"></igc-icon>
          Download the release notes
        </igc-button>
        <igc-button
          variant="outlined"
          href="https://github.com/IgniteUI/igniteui-webcomponents/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
          <span class="sr-only">(opens in a new tab)</span>
          <igc-icon slot="suffix" name="open-in-new"></igc-icon>
        </igc-button>
        <igc-button
          variant="flat"
          href="#releases"
          @click=${(event: Event) => event.preventDefault()}
        >
          <igc-icon slot="prefix" name="arrow-back"></igc-icon>
          All releases
        </igc-button>
      </div>
    </article>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A profile form. The button is a form-associated element: `type="submit"` submits the form that contains it, and `type="reset"` restores the initial values. The submit runs the constraint validation first, so clear the name and then save to see the error. While the profile saves, the handler disables the inputs and the reset button, and ignores another submit. The submit button stays enabled, because a disabled button loses the focus.',
      },
    },
  },
  render: () => {
    let saving = false;

    const save = async (event: SubmitEvent) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      const form = event.target as HTMLFormElement;
      const fields = form.querySelectorAll<
        IgcInputComponent | IgcButtonComponent
      >('igc-input, [type="reset"]');
      const label = form.querySelector('[data-label]')!;
      const status = form.querySelector('[role="status"]')!;
      const data = new FormData(form);
      const disable = (disabled: boolean) => {
        saving = disabled;
        for (const field of fields) {
          field.disabled = disabled;
        }
      };

      disable(true);
      label.textContent = 'Saving…';
      status.textContent = '';

      await delay(1200);

      disable(false);
      label.textContent = 'Save profile';
      status.textContent = `Saved ${data.get('name')}, ${data.get('email')} at ${new Date().toLocaleTimeString()}.`;
    };

    const reset = (event: Event) => {
      const form = event.target as HTMLFormElement;
      form.querySelector('[role="status"]')!.textContent =
        'The form shows the initial values again.';
    };

    return html`
      ${styles}
      <style>
        .bt-form fieldset {
          display: grid;
          gap: 1rem;
          max-width: 24rem;
          margin: 0;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }
      </style>
      <form class="bt-stack bt-form" @submit=${save} @reset=${reset}>
        <fieldset>
          <legend>Profile</legend>
          <igc-input
            name="name"
            label="Full name"
            value="Maria Garcia"
            required
          ></igc-input>
          <igc-input
            name="email"
            type="email"
            label="Email"
            value="maria@example.com"
            required
          ></igc-input>
          <igc-input
            name="title"
            label="Job title"
            value="Product designer"
          ></igc-input>
          <div class="bt-row">
            <igc-button type="submit">
              <span data-label>Save profile</span>
            </igc-button>
            <igc-button type="reset" variant="flat">Reset</igc-button>
          </div>
        </fieldset>
        <p class="muted" role="status"></p>
      </form>
    `;
  },
};

export const Commands: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The header of a project page that opens a popover and a dialog without JavaScript. `command` and `commandfor` make a button an invoker. "Share" uses the built-in `toggle-popover` command on a native popover, which opens under the button through CSS anchor positioning where the browser supports it. "Delete project" uses `--show` on a dialog of the library, and the dialog buttons use `--hide`. The library components that accept commands take `--show`, `--hide` and `--toggle`. The Delete button also has a click handler, which runs before the command.',
      },
    },
  },
  render: () => {
    const remove = (event: Event) => {
      const page = (event.currentTarget as HTMLElement).closest('.bt-panel')!;

      page.querySelector('[role="status"]')!.textContent =
        'You deleted the project. This is a demo, so nothing changed.';
    };

    return html`
      ${styles}
      <style>
        .bt-header {
          justify-content: space-between;
        }

        .bt-share {
          max-width: 22rem;
          padding: 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .bt-share p {
          margin: 0 0 1rem;
        }

        /* A popover that a button opens takes the button as its implicit anchor. */
        @supports (position-area: block-end) {
          .bt-share {
            inset: auto;
            margin: 0.5rem 0 0;
            position-area: block-end span-inline-start;
          }
        }
      </style>
      <section class="bt-panel bt-stack" aria-labelledby="bt-project">
        <div class="bt-row bt-header">
          <h3 id="bt-project">Website redesign</h3>
          <div class="bt-row">
            <igc-button
              variant="outlined"
              command="toggle-popover"
              commandfor="bt-share"
            >
              <igc-icon slot="prefix" name="share"></igc-icon>
              Share
            </igc-button>
            <igc-button command="--show" commandfor="bt-delete">
              <igc-icon slot="prefix" name="delete"></igc-icon>
              Delete project
            </igc-button>
          </div>
        </div>
        <p class="muted">24 files. Last change 2 hours ago.</p>
        <p class="muted" role="status"></p>

        <div id="bt-share" class="bt-share" popover>
          <p>Anyone with the link can view the project.</p>
          <igc-input
            label="Project link"
            value="https://acme.example/projects/website"
            readonly
          ></igc-input>
          <div class="bt-row" style="margin-top: 1rem">
            <igc-button
              variant="flat"
              command="hide-popover"
              commandfor="bt-share"
            >
              Done
            </igc-button>
          </div>
        </div>

        <igc-dialog id="bt-delete" title="Delete the project?">
          This removes the project and its 24 files. You cannot undo this.
          <igc-button
            slot="footer"
            variant="flat"
            command="--hide"
            commandfor="bt-delete"
          >
            Cancel
          </igc-button>
          <igc-button
            slot="footer"
            command="--hide"
            commandfor="bt-delete"
            @click=${remove}
          >
            Delete
          </igc-button>
        </igc-dialog>
      </section>
    `;
  },
};
