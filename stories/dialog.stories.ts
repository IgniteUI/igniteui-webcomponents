import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcDialogComponent,
  IgcInputComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcDialogComponent, IgcInputComponent, IgcSelectComponent);

// region default
const metadata: Meta<IgcDialogComponent> = {
  title: 'Dialog',
  component: 'igc-dialog',
  parameters: {
    docs: { description: { component: 'Represents a Dialog component.' } },
    actions: { handles: ['igcClosing', 'igcClosed'] },
  },
  argTypes: {
    keepOpenOnEscape: {
      type: 'boolean',
      description:
        "Whether the dialog should be kept open when pressing the 'Escape' button.",
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    closeOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the dialog should be closed when clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideDefaultAction: {
      type: 'boolean',
      description:
        'Whether to hide the default action button for the dialog.\n\nWhen there is projected content in the `footer` slot this property\nhas no effect.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    open: {
      type: 'boolean',
      description: 'Whether the dialog is opened.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    title: {
      type: 'string',
      description: 'Sets the title of the dialog.',
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
  /** Whether the dialog should be kept open when pressing the 'Escape' button. */
  keepOpenOnEscape: boolean;
  /** Whether the dialog should be closed when clicking outside of it. */
  closeOnOutsideClick: boolean;
  /**
   * Whether to hide the default action button for the dialog.
   *
   * When there is projected content in the `footer` slot this property
   * has no effect.
   */
  hideDefaultAction: boolean;
  /** Whether the dialog is opened. */
  open: boolean;
  /** Sets the title of the dialog. */
  title: string;
}
type Story = StoryObj<IgcDialogArgs>;

// endregion

function getDialog(id: string) {
  return document.getElementById(id) as IgcDialogComponent;
}

function openDialog(id: string) {
  getDialog(id).show();
}

function closeDialog(id: string) {
  getDialog(id).hide();
}

const authMethods = ['Basic', 'Bearer', 'Digest', 'OAuth'];

export const Default: Story = {
  args: {
    title: 'Dialog title',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A basic dialog with a title and message content. Use the controls panel to toggle `open`, enable `closeOnOutsideClick`, `keepOpenOnEscape`, or `hideDefaultAction`.',
      },
    },
  },
  render: (args) => html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px"
    >
      <igc-button @click=${() => openDialog('default')}>Open dialog</igc-button>

      <igc-dialog
        id="default"
        ?keep-open-on-escape=${args.keepOpenOnEscape}
        ?close-on-outside-click=${args.closeOnOutsideClick}
        ?hide-default-action=${args.hideDefaultAction}
        ?open=${args.open}
        title=${ifDefined(args.title)}
      >
        <span slot="message">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Possimus
          rerum enim, incidunt magni ea asperiores laudantium, ducimus itaque
          quisquam dolore hic labore facere qui unde aliquam, dignissimos
          perspiciatis? Iusto, iure.
        </span>
      </igc-dialog>
    </div>
  `,
};

export const Slots: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `title` and `footer` slot projections. When a `footer` slot is provided, the `hideDefaultAction` property has no effect.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px"
    >
      <igc-button @click=${() => openDialog('slots-dialog')}>
        Open dialog
      </igc-button>

      <igc-dialog id="slots-dialog">
        <h4 slot="title">Danger zone</h4>
        <p>This action is irreversible. Are you sure you want to proceed?</p>
        <igc-button
          slot="footer"
          variant="flat"
          @click=${() => closeDialog('slots-dialog')}
        >
          Cancel
        </igc-button>
        <igc-button
          slot="footer"
          variant="contained"
          @click=${() => closeDialog('slots-dialog')}
        >
          Confirm
        </igc-button>
      </igc-dialog>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A dialog containing a native `<form method="dialog">`. Submitting the form automatically closes the dialog, and the `returnValue` is set to the submitter button\'s value.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px"
    >
      <igc-button @click=${() => openDialog('form-dialog')}>
        Open form dialog
      </igc-button>

      <igc-dialog id="form-dialog" hide-default-action>
        <h3 slot="title">Your credentials</h3>
        <form method="dialog">
          <div style="display: flex; flex-flow: column; gap: 1rem">
            <igc-input name="username" outlined label="Username"></igc-input>
            <igc-input
              name="password"
              outlined
              label="Password"
              type="password"
            ></igc-input>
            <igc-select
              name="auth-method"
              outlined
              label="Authentication method"
            >
              ${authMethods.map(
                (each) =>
                  html`<igc-select-item value=${each}>${each}</igc-select-item>`
              )}
            </igc-select>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1rem">
            <igc-button type="reset" variant="flat">Reset</igc-button>
            <igc-button type="submit" variant="flat"> Confirm </igc-button>
          </div>
        </form>
      </igc-dialog>
    </div>
  `,
};
