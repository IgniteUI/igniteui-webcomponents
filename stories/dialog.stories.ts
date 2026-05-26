import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcDialogComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcDialogComponent,
  IgcInputComponent,
  IgcSelectComponent,
  IgcIconButtonComponent
);

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
        'When set, clicking on the backdrop area outside the dialog surface\nwill close it (emitting `igcClosing` / `igcClosed`).\n\nHas no effect when the dialog is not yet open.',
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
        'Whether the dialog is open.\n\nSetting this property programmatically will open or close the dialog\nwithout animation and without emitting `igcClosing` / `igcClosed`.\nPrefer the `show()`, `hide()`, and `toggle()` methods for animated\ntransitions, and note that events are only emitted when the dialog is\nclosed through user interaction (the default action button, outside click,\nor the Escape key).',
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
   * will close it (emitting `igcClosing` / `igcClosed`).
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
   * without animation and without emitting `igcClosing` / `igcClosed`.
   * Prefer the `show()`, `hide()`, and `toggle()` methods for animated
   * transitions, and note that events are only emitted when the dialog is
   * closed through user interaction (the default action button, outside click,
   * or the Escape key).
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
      <igc-button command="--show" commandfor="default">Open dialog</igc-button>

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
      <igc-button command="--show" commandfor="slots-dialog">
        Open dialog
      </igc-button>

      <igc-dialog id="slots-dialog">
        <h4 slot="title">Danger zone</h4>
        <p>This action is irreversible. Are you sure you want to proceed?</p>
        <igc-button
          slot="footer"
          variant="flat"
          command="--hide"
          commandfor="slots-dialog"
        >
          Cancel
        </igc-button>
        <igc-button
          slot="footer"
          variant="contained"
          command="--hide"
          commandfor="slots-dialog"
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
      <igc-button command="--show" commandfor="form-dialog">
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

export const InvokerActions: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      igc-dialog::part(title) {
        justify-content: space-between;
        align-content: center;
      }
      igc-dialog::part(base) {
        max-width: 25rem;
      }
    </style>

    <igc-button command="--show" commandfor="invoker-actions"
      >Show the dialog using invoker actions</igc-button
    >

    <igc-dialog id="invoker-actions" hide-default-action>
      <h2 slot="title">Dialog with invoker actions</h2>
      <igc-icon-button
        command="--hide"
        commandfor="invoker-actions"
        slot="title"
        name="clear"
        variant="outlined"
        collection="internal"
      ></igc-icon-button>
      <p>
        This dialog was opened using invoker actions. You can close the dialog
        by clicking the icon button in the title bar, which uses invoker actions
        as well.
      </p>
    </igc-dialog>
  `,
};
