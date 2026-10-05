import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDialogComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDialogComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcSelectComponent
);

registerMaterialIcons('close', 'delete', 'keyboard');

// region default
const metadata: Meta<IgcDialogComponent> = {
  title: 'Dialog',
  component: 'igc-dialog',
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog component built on the native `<dialog>` element.\n\nThe dialog traps focus while open and blocks interaction with the rest\nof the page (modal semantics). It supports animated open/close\ntransitions, an optional backdrop overlay, and multiple content areas\nthrough named slots.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` / `"--toggle"`\nand `commandfor` pointing to this element will call the corresponding method\ndeclaratively without any JavaScript.',
      },
    },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    keepOpenOnEscape: {
      type: 'boolean',
      description:
        'When set, pressing the `Escape` key will not close the dialog.\n\nBy default the browser closes a modal dialog on `Escape`. Enable this\noption when the dialog guards unsaved work and should require an explicit\nuser action to dismiss.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    closeOnOutsideClick: {
      type: 'boolean',
      description:
        'When set, clicking on the backdrop area outside the dialog surface\nwill close it (emitting close events).\n\nHas no effect when the dialog is not yet open.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideDefaultAction: {
      type: 'boolean',
      description:
        'When set, the built-in "OK" close button in the footer is not rendered.\n\nHas no effect when content is projected into the `footer` slot, since\nthe slot content replaces the default button entirely.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description:
        'Whether the dialog is open.\n\nSetting this property programmatically will open or close the dialog\nwithout animation and without emitting close events.\nPrefer the `show()`, `hide()`, and `toggle()` methods for animated\ntransitions.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    title: {
      type: 'string',
      description:
        'The title displayed in the dialog header.\n\nOverridden by any content projected into the `title` slot.',
      control: 'text',
    },
  },
  args: {
    keepOpenOnEscape: false,
    closeOnOutsideClick: false,
    hideDefaultAction: false,
    open: false,
  },
};

export default metadata;

interface IgcDialogArgs {
  /**
   * When set, pressing the `Escape` key will not close the dialog.
   *
   * By default the browser closes a modal dialog on `Escape`. Enable this
   * option when the dialog guards unsaved work and should require an explicit
   * user action to dismiss.
   */
  keepOpenOnEscape: boolean;
  /**
   * When set, clicking on the backdrop area outside the dialog surface
   * will close it (emitting close events).
   *
   * Has no effect when the dialog is not yet open.
   */
  closeOnOutsideClick: boolean;
  /**
   * When set, the built-in "OK" close button in the footer is not rendered.
   *
   * Has no effect when content is projected into the `footer` slot, since
   * the slot content replaces the default button entirely.
   */
  hideDefaultAction: boolean;
  /**
   * Whether the dialog is open.
   *
   * Setting this property programmatically will open or close the dialog
   * without animation and without emitting close events.
   * Prefer the `show()`, `hide()`, and `toggle()` methods for animated
   * transitions.
   */
  open: boolean;
  /**
   * The title displayed in the dialog header.
   *
   * Overridden by any content projected into the `title` slot.
   */
  title: string;
}
type Story = StoryObj<IgcDialogArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .dg-panel {
      display: grid;
      gap: 1rem;
      justify-items: start;
      width: min(100%, 32rem);
      padding: 1rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dg-panel :is(h3, p),
    .dg-terms :is(h3, p) {
      margin: 0;
    }

    .dg-panel h3 {
      font-size: 1.125rem;
    }

    .dg-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .dg-panel address {
      font-style: normal;
    }

    .dg-projects {
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .dg-projects li {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-block: 0.5rem;
      border-block-end: 1px solid var(--ig-gray-300);
    }

    .dg-projects li > span {
      display: grid;
      flex: 1;
    }

    .dg-form {
      display: grid;
      gap: 1rem;
    }

    .dg-pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      gap: 1rem;
    }

    .dg-warning {
      padding: 0.5rem 0.75rem;
      border-inline-start: 4px solid var(--ig-warn-500);
    }

    .dg-terms {
      display: grid;
      gap: 0.75rem;
      max-block-size: 14rem;
      margin-block: 1rem;
      padding-block: 0.75rem;
      padding-inline-end: 0.5rem;
      border-block: 1px solid var(--ig-gray-300);
      overflow: auto;
    }

    .dg-terms h3 {
      font-size: 1rem;
    }

    .dg-keys {
      display: grid;
      gap: 0.5rem;
      margin: 0;
    }

    .dg-keys div {
      display: grid;
      grid-template-columns: 2.5rem 1fr;
      gap: 1rem;
    }

    .dg-keys dd {
      margin: 0;
    }

    .dg-keys kbd {
      display: inline-block;
      min-width: 1.5rem;
      padding: 0 0.25rem;
      text-align: center;
      border: 1px solid var(--ig-gray-400);
      border-radius: 4px;
      font-family: inherit;
    }

    igc-dialog.dg-sized::part(base) {
      width: min(100% - 2rem, 32rem);
    }

    igc-dialog.dg-shortcuts::part(title) {
      justify-content: space-between;
    }
  </style>
`;

export const Default: Story = {
  args: { title: 'Export started' },
  parameters: {
    docs: {
      description: {
        story:
          'A dialog that tells the user about the result of an action. The button opens the dialog with the invoker command `--show` and `commandfor`, without JavaScript. The `title` attribute sets the header, and the `message` slot holds the text. The footer has no content, so the dialog shows its default OK button. Set `hideDefaultAction` to remove the button. Then the user can close the dialog only with the Escape key, or with an outside click when `closeOnOutsideClick` is set. The `open` control shows and hides the dialog immediately, without the animation and without the close events.',
      },
    },
  },
  render: (args) => html`
    ${styles}
    <div class="dg-panel">
      <h3>Sales report, Q3</h3>
      <p class="muted">1,284 orders from July 1 to September 30.</p>
      <igc-button command="--show" commandfor="dg-default">
        Export as CSV
      </igc-button>
    </div>

    <igc-dialog
      id="dg-default"
      ?keep-open-on-escape=${args.keepOpenOnEscape}
      ?close-on-outside-click=${args.closeOnOutsideClick}
      ?hide-default-action=${args.hideDefaultAction}
      ?open=${args.open}
      title=${ifDefined(args.title)}
    >
      <span slot="message">
        We send the report to ana.martins@example.com when it is ready. A large
        report can take up to 10 minutes.
      </span>
    </igc-dialog>
  `,
};

type Project = {
  name: string;
  files: number;
  members: number;
  updated: string;
};

const projects: Project[] = [
  { name: 'Website redesign', files: 128, members: 6, updated: '2 hours ago' },
  { name: 'Mobile app', files: 342, members: 9, updated: 'yesterday' },
  { name: 'Brand guidelines', files: 27, members: 3, updated: 'last week' },
  { name: 'Q4 campaign', files: 64, members: 4, updated: 'last month' },
];

export const DeleteProject: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A dialog that asks the user to confirm a destructive action. The dialog shows the name of the project in the `title` attribute, and the consequences in the `message` slot. The `footer` slot holds Cancel and Delete, and it replaces the default OK button. Cancel comes first, so the dialog gives the focus to the safer action when it opens. Each button calls `hide()`, which closes the dialog with the animation and gives the focus back to the button that opened it. `hide()` does not emit `igcClosing` and `igcClosed`, so the click handler of Delete does the action. After the delete, the story moves the focus to the next Delete button, because the button that opened the dialog is gone.',
      },
    },
  },
  render: () => {
    let items = [...projects];
    let pending: Project | undefined;
    let status = '';

    const dialog = () => story.host!.querySelector('igc-dialog')!;

    const ask = (project: Project) => {
      pending = project;
      story.update();
      dialog().show();
    };

    const remove = async () => {
      const index = items.indexOf(pending!);

      await dialog().hide();
      status = `We deleted "${pending!.name}".`;
      items = items.filter((project) => project !== pending);
      story.update();

      const buttons = story.host!.querySelectorAll<HTMLElement>('.dg-delete');
      (buttons[index] ?? buttons[index - 1])?.focus();
    };

    const restore = async () => {
      items = [...projects];
      status = 'We restored the projects.';
      story.update();

      const first =
        story.host!.querySelector<IgcIconButtonComponent>('.dg-delete')!;
      await first.updateComplete;
      first.focus();
    };

    const story = renderInto(
      () => html`
        <div class="dg-panel">
          <h3>Projects</h3>
          ${
            items.length
              ? html`
                  <ul class="dg-projects">
                    ${repeat(
                      items,
                      (project) => project.name,
                      (project) => html`
                        <li>
                          <span>
                            <strong>${project.name}</strong>
                            <span class="muted">
                              ${project.files} files, updated ${project.updated}
                            </span>
                          </span>
                          <igc-icon-button
                            class="dg-delete"
                            name="delete"
                            variant="flat"
                            aria-label="Delete ${project.name}"
                            @click=${() => ask(project)}
                          ></igc-icon-button>
                        </li>
                      `
                    )}
                  </ul>
                `
              : html`
                  <p class="muted">You have no projects.</p>
                  <igc-button variant="outlined" @click=${restore}>
                    Restore the projects
                  </igc-button>
                `
          }
          <p class="muted" role="status">${status}</p>
        </div>

        <igc-dialog title=${ifDefined(pending && `Delete "${pending.name}"?`)}>
          <span slot="message">
            The project has ${pending?.files} files and ${pending?.members}
            members. The members lose their access to the files. You cannot undo
            this action.
          </span>
          <igc-button
            slot="footer"
            variant="flat"
            @click=${() => dialog().hide()}
          >
            Cancel
          </igc-button>
          <igc-button slot="footer" @click=${remove}>
            Delete the project
          </igc-button>
        </igc-dialog>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type Address = {
  name: string;
  street: string;
  city: string;
  postcode: string;
  country: string;
};

const countries = [
  ['GB', 'United Kingdom'],
  ['IE', 'Ireland'],
  ['FR', 'France'],
  ['DE', 'Germany'],
  ['NL', 'Netherlands'],
];

export const ShippingAddress: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A dialog with a `<form method="dialog">` that edits the shipping address of an order. The form validates the required fields when the user saves. A valid submit closes the dialog, and the `submit` handler of the form saves the address before the dialog closes. The dialog has `close-on-outside-click`, so a click on the backdrop closes it too. When the user tries to close the dialog with unsaved changes, with the Escape key, an outside click or Cancel, the `igcClosing` handler calls `preventDefault()`. The dialog stays open and tells the user to save or discard the changes. When the dialog closes, the story sets the fields to the saved address again.',
      },
    },
  },
  render: () => {
    let address: Address = {
      name: 'Ana Martins',
      street: '27 Harbour Street',
      city: 'Bristol',
      postcode: 'BS1 5TX',
      country: 'GB',
    };
    let warn = false;
    let status = '';

    const dialog = () => story.host!.querySelector('igc-dialog')!;

    const fields = () =>
      story.host!.querySelectorAll<IgcInputComponent | IgcSelectComponent>(
        '#dg-address-form [name]'
      );

    const read = () =>
      Object.fromEntries(
        [...fields()].map((field) => [field.name, field.value])
      ) as Address;

    const dirty = () => {
      const current = read();
      return Object.entries(address).some(
        ([key, value]) => current[key as keyof Address] !== value
      );
    };

    const save = () => {
      address = read();
      status = 'We saved the new address.';
      story.update();
    };

    const guard = (event: CustomEvent<void>) => {
      if (dirty()) {
        event.preventDefault();
        warn = true;
        story.update();
      }
    };

    const cancel = () => {
      if (dirty()) {
        warn = true;
        story.update();
      } else {
        dialog().hide();
      }
    };

    const discard = async () => {
      await dialog().hide();
      reset();
    };

    const reset = () => {
      for (const field of fields()) {
        field.value = address[field.name as keyof Address];
      }

      warn = false;
      story.update();
    };

    const country = (code: string) =>
      countries.find(([value]) => value === code)?.[1];

    const story = renderInto(
      () => html`
        <div class="dg-panel">
          <div class="dg-heading">
            <h3>Shipping address</h3>
            <igc-button
              variant="outlined"
              command="--show"
              commandfor="dg-address"
            >
              Edit
            </igc-button>
          </div>
          <address class="muted">
            ${address.name}<br />
            ${address.street}<br />
            ${address.city} ${address.postcode}<br />
            ${country(address.country)}
          </address>
          <p class="muted" role="status">${status}</p>
        </div>

        <igc-dialog
          id="dg-address"
          class="dg-sized"
          title="Edit the shipping address"
          close-on-outside-click
          @igcClosing=${guard}
          @igcClosed=${reset}
        >
          <form
            id="dg-address-form"
            method="dialog"
            class="dg-form"
            @submit=${save}
          >
            <igc-input
              name="name"
              label="Full name"
              autocomplete="name"
              required
              .value=${address.name}
            ></igc-input>
            <igc-input
              name="street"
              label="Street address"
              autocomplete="street-address"
              required
              .value=${address.street}
            ></igc-input>
            <div class="dg-pair">
              <igc-input
                name="city"
                label="City"
                autocomplete="address-level2"
                required
                .value=${address.city}
              ></igc-input>
              <igc-input
                name="postcode"
                label="Postal code"
                autocomplete="postal-code"
                required
                .value=${address.postcode}
              ></igc-input>
            </div>
            <igc-select
              name="country"
              label="Country"
              .value=${address.country}
            >
              ${countries.map(
                ([value, label]) => html`
                  <igc-select-item value=${value}>${label}</igc-select-item>
                `
              )}
            </igc-select>
            <p class="dg-warning" role="alert" ?hidden=${!warn}>
              You have unsaved changes. Save them, or discard them.
            </p>
          </form>
          <igc-button
            slot="footer"
            variant="flat"
            @click=${warn ? discard : cancel}
          >
            ${warn ? 'Discard the changes' : 'Cancel'}
          </igc-button>
          <igc-button slot="footer" type="submit" form="dg-address-form">
            Save
          </igc-button>
        </igc-dialog>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

export const Terms: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A dialog that asks for a required decision before the user can continue. The dialog has `keep-open-on-escape` and no `close-on-outside-click`, so only Decline and Accept close it. Accept is disabled until the user selects the checkbox. The terms are in a scroll container with a fixed height, so the title, the checkbox and the buttons stay visible. The container has `tabindex="0"`, the `region` role and a label, so a keyboard user can scroll it, and the dialog focuses it first when it opens. `::part(base)` sets the width of the dialog.',
      },
    },
  },
  render: () => {
    let checked = false;
    let status = 'You are signed out.';

    const dialog = () => story.host!.querySelector('igc-dialog')!;

    const signIn = () => {
      checked = false;
      story.update();
      dialog().show();
    };

    const decide = async (accepted: boolean) => {
      await dialog().hide();
      status = accepted
        ? `You accepted the terms on ${new Date().toLocaleDateString()}. Welcome back, Ana.`
        : 'You declined the terms, so we signed you out.';
      story.update();
    };

    const toggle = ({ detail }: CustomEvent<{ checked: boolean }>) => {
      checked = detail.checked;
      story.update();
    };

    const story = renderInto(
      () => html`
        <div class="dg-panel">
          <h3>Acme Workspace</h3>
          <p class="muted" role="status">${status}</p>
          <igc-button @click=${signIn}>Sign in as Ana Martins</igc-button>
        </div>

        <igc-dialog
          class="dg-sized"
          title="We updated the terms of service"
          keep-open-on-escape
        >
          <span slot="message">
            Read the new terms. You must accept them to continue to Acme
            Workspace.
          </span>
          <div
            class="dg-terms"
            role="region"
            aria-label="Terms of service"
            tabindex="0"
          >
            <h3>1. Your account</h3>
            <p>
              You are responsible for the activity in your account. Keep your
              password secret, and tell us immediately when you think that
              somebody else uses your account.
            </p>
            <h3>2. Your content</h3>
            <p>
              You own the files that you upload. You give us permission to store
              and process them only to supply the service to you and to the
              members of your workspace.
            </p>
            <h3>3. Payment</h3>
            <p>
              We charge the subscription at the start of each billing period.
              When you cancel, the subscription stays active until the end of
              the period.
            </p>
            <h3>4. Privacy</h3>
            <p>
              Our privacy policy tells which data we collect and why. From
              November 1, we keep the logs of your workspace for 90 days, not
              for 30 days.
            </p>
            <h3>5. Changes to the terms</h3>
            <p>
              We tell you about changes 30 days before they start. When you do
              not accept a change, you can close your account and export your
              files.
            </p>
          </div>
          <igc-checkbox .checked=${checked} @igcChange=${toggle}>
            I accept the terms of service
          </igc-checkbox>
          <igc-button
            slot="footer"
            variant="flat"
            @click=${() => decide(false)}
          >
            Decline
          </igc-button>
          <igc-button
            slot="footer"
            ?disabled=${!checked}
            @click=${() => decide(true)}
          >
            Accept
          </igc-button>
        </igc-dialog>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const shortcuts = [
  ['?', 'Show the keyboard shortcuts'],
  ['c', 'Write a new message'],
  ['r', 'Reply to the message'],
  ['e', 'Archive the message'],
  ['j', 'Go to the next message'],
  ['k', 'Go to the previous message'],
  ['/', 'Search the mail'],
];

export const KeyboardShortcuts: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A help dialog for the keyboard shortcuts of a mail application. The keyboard icon button opens and closes the dialog with the invoker command `--toggle`. Press "?" on the page to open the dialog too. The `title` slot holds the heading and a close icon button with the invoker command `--hide`, and `::part(title)` puts them at the two ends of the header. The dialog gets its accessible name from the header, and then the name includes the label of the close button. `aria-label` on the dialog sets the name to "Keyboard shortcuts" only. The dialog has `hide-default-action`, so it shows no OK button, and `close-on-outside-click`, so a click on the backdrop closes it.',
      },
    },
  },
  render: () => {
    const dialog = createRef<IgcDialogComponent>();

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.composedPath()[0] as HTMLElement;

      if (
        event.key === '?' &&
        !target.matches('input, textarea, [contenteditable]')
      ) {
        dialog.value?.show();
      }
    };

    const mount = (element?: Element) => {
      if (element) {
        document.addEventListener('keydown', onKeyDown);
      } else {
        document.removeEventListener('keydown', onKeyDown);
      }
    };

    return html`
      ${styles}
      <div class="dg-panel" ${ref(mount)}>
        <div class="dg-heading">
          <h3>Inbox</h3>
          <igc-icon-button
            name="keyboard"
            variant="flat"
            aria-label="Keyboard shortcuts"
            command="--toggle"
            commandfor="dg-shortcuts"
          ></igc-icon-button>
        </div>
        <p class="muted">You have 3 unread messages.</p>
      </div>

      <igc-dialog
        ${ref(dialog)}
        id="dg-shortcuts"
        class="dg-sized dg-shortcuts"
        aria-label="Keyboard shortcuts"
        hide-default-action
        close-on-outside-click
      >
        <h2 slot="title">Keyboard shortcuts</h2>
        <igc-icon-button
          slot="title"
          name="close"
          variant="flat"
          aria-label="Close"
          command="--hide"
          commandfor="dg-shortcuts"
        ></igc-icon-button>
        <dl class="dg-keys">
          ${shortcuts.map(
            ([key, action]) => html`
              <div>
                <dt><kbd>${key}</kbd></dt>
                <dd>${action}</dd>
              </div>
            `
          )}
        </dl>
      </igc-dialog>
    `;
  },
};
