import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineComponents, IgcDialogComponent } from '../src/index.js';
import { Context, Story } from './story.js';

defineComponents(IgcDialogComponent);

// region default
const metadata = {
  title: 'Dialog',
  component: 'igc-dialog',
  argTypes: {
    closeOnEscape: {
      type: 'boolean',
      description:
        "Whether the dialog should be closed when pressing 'ESC' button.",
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
  open: boolean;
  title: string;
  returnValue: string;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
  },
};

const handleToggle = () => {
  const dialog = document.querySelector('igc-dialog') as IgcDialogComponent;
  dialog?.toggle();
};

const Template: Story<ArgTypes, Context> = (
  { closeOnEscape, closeOnOutsideClick, title, returnValue, open }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px"
    >
      <igc-button @click=${handleToggle}>Toggle Show/Hide</igc-button>
      <igc-dialog
        ?close-on-escape=${closeOnEscape}
        ?close-on-outside-click=${closeOnOutsideClick}
        .open=${open}
        return-value=${ifDefined(returnValue)}
        title=${ifDefined(title)}
        dir=${ifDefined(direction)}
      >
        <h1 slot="title">Title Content</h1>

        Your Inbox has changed. No longer does it include favorites, it is a
        singular destination for your emails.

        <igc-button slot="footer" @click=${handleToggle}>Save</igc-button>
        <igc-button slot="footer" @click=${handleToggle} variant="outlined"
          >Close</igc-button
        >
      </igc-dialog>
    </div>
  `;
};

// { globals: { } }: Context

export const Basic = Template.bind({});

document.addEventListener('igcOpening', function (event) {
  console.log(event);
  console.log('Dialog is opening');
});

document.addEventListener('igcOpened', function (event) {
  console.log(event);
  console.log('Dialog is opened');
});
