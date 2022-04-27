import { html } from 'lit';
import { Context, Story } from './story.js';
import { defineComponents, IgcDialogComponent } from '../src/index.js';
import { ifDefined } from 'lit/directives/if-defined.js';

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
    title: {
      type: 'string',
      description: 'Sets the title of the dialog.',
      control: 'text',
    },
    open: {
      type: 'boolean',
      description: 'Whether the dialog is opened.',
      control: 'boolean',
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
  title: string;
  open: boolean;
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

const Template: Story<ArgTypes, Context> = ({
  closeOnEscape,
  closeOnOutsideClick,
  title,
  returnValue,
}: ArgTypes) =>
  // { globals: { } }: Context
  html`
    <div
      style="display: flex; align-items: flex-start; position: relative; height: 400px"
    >
      <igc-button @click=${handleToggle}>Toggle Show/Hide</igc-button>
      <igc-dialog
        ?close-on-escape=${closeOnEscape}
        ?close-on-outside-click=${closeOnOutsideClick}
        title=${ifDefined(title)}
        return-value=${ifDefined(returnValue)}
      >
        <div slot="title">Title Content</div>
        <div slot="footer">Footer Content</div>
        Dialog Content
      </igc-dialog>
    </div>
  `;

export const Basic = Template.bind({});

document.addEventListener('igcOpening', function (event) {
  console.log(event);
  console.log('Dialog is opening');
});

document.addEventListener('igcOpened', function (event) {
  console.log(event);
  console.log('Dialog is opened');
});
