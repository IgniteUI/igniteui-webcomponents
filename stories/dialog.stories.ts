import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcDialogComponent } from '../src/index.js';
import { Context, Story } from './story.js';

IgcDialogComponent.register();

// region default
const metadata = {
  title: 'Dialog',
  component: 'igc-dialog',
  argTypes: {
    closeOnEscape: {
      type: 'boolean',
      description:
        "Whether the dialog should be closed when pressing the 'ESCAPE' button.",
      control: 'boolean',
      defaultValue: true,
    },
    closeOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the dialog should be closed when clicking outside of it.',
      control: 'boolean',
      defaultValue: false,
    },
    hideDefaultAction: {
      type: 'boolean',
      description:
        'Whether to hide the default action button for the dialog.\n\nWhen there is projected content in the `footer` slot this property\nhas no effect.',
      control: 'boolean',
      defaultValue: false,
    },
    open: {
      type: 'boolean',
      description: 'Whether the dialog is opened.',
      control: 'boolean',
      defaultValue: false,
    },
    title: {
      type: 'string',
      description: 'Sets the title of the dialog.',
      control: 'text',
    },
    returnValue: {
      type: 'string',
      description: 'Sets the return value for the dialog.',
      control: 'text',
    },
  },
};
export default metadata;
interface ArgTypes {
  closeOnEscape: boolean;
  closeOnOutsideClick: boolean;
  hideDefaultAction: boolean;
  open: boolean;
  title: string;
  returnValue: string;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcClosing', 'igcClosed'],
  },
};

const openDialog = (id: string) =>
  (document.getElementById(id) as IgcDialogComponent).show();

const closeDialog = (id: string) =>
  (document.getElementById(id) as IgcDialogComponent).hide();

const authMethods = ['Basic', 'Bearer', 'Digest', 'OAuth'];
const authSelected = (ev: CustomEvent) => {
  (ev.target as HTMLElement).querySelector('igc-input')!.value =
    ev.detail.value;
};

const Template: Story<ArgTypes, Context> = (
  {
    closeOnEscape,
    closeOnOutsideClick,
    title,
    open,
    hideDefaultAction,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px; gap: 1rem"
    >
      <igc-button @click=${() => openDialog('default')}
        >Default dialog</igc-button
      >
      <igc-button @click=${() => openDialog('projected')}
        >Projected content</igc-button
      >

      <igc-button @click=${() => openDialog('with-form')}>With Form</igc-button>

      <igc-dialog
        id="default"
        ?close-on-escape=${closeOnEscape}
        ?close-on-outside-click=${closeOnOutsideClick}
        ?hide-default-action=${hideDefaultAction}
        .open=${open}
        title=${ifDefined(title)}
        dir=${ifDefined(direction)}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Possimus rerum
        enim, incidunt magni ea asperiores laudantium, ducimus itaque quisquam
        dolore hic labore facere qui unde aliquam, dignissimos perspiciatis?
        Iusto, iure.
      </igc-dialog>

      <igc-dialog
        id="projected"
        dir=${ifDefined(direction)}
        ?close-on-escape=${closeOnEscape}
        ?close-on-outside-click=${closeOnOutsideClick}
      >
        <h4 slot="title">Danger</h4>
        <p>Doing this action is irrevocable?</p>
        <div slot="footer">
          <igc-button @click=${() => closeDialog('projected')} variant="flat"
            >Cancel</igc-button
          >
          <igc-button @click=${() => closeDialog('projected')} variant="flat"
            >OK</igc-button
          >
        </div>
      </igc-dialog>

      <igc-dialog
        id="with-form"
        dir=${ifDefined(direction)}
        hide-default-action
        ?close-on-escape=${closeOnEscape}
        ?close-on-outside-click=${closeOnOutsideClick}
      >
        <h3 slot="title">Your credentials</h3>
        <div>
          <igc-form method="dialog">
            <div style="display: flex; flex-flow: column; gap: 1rem">
              <igc-input outlined label="Username"></igc-input>
              <igc-input outlined label="Password" type="password"></igc-input>
              <igc-dropdown
                flip
                same-width
                position-strategy="fixed"
                @igcChange=${authSelected}
              >
                <igc-input
                  style="width: 100%"
                  outlined
                  label="Method"
                  slot="target"
                ></igc-input>
                ${authMethods.map(
                  (each) => html`<igc-dropdown-item>${each}</igc-dropdown-item>`
                )}
              </igc-dropdown>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem">
              <igc-button type="reset" variant="flat">Reset</igc-button>
              <igc-button type="submit" variant="flat">Confirm</igc-button>
            </div>
          </igc-form>
        </div>
      </igc-dialog>
    </div>
  `;
};

export const Basic = Template.bind({});
