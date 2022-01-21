import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { defineAllComponents, IgcToastComponent } from '../src/index.js';

defineAllComponents();

// region default
const metadata = {
  title: 'Toast',
  component: 'igc-toast',
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the toast is opened.',
      control: 'boolean',
      defaultValue: false,
    },
    message: {
      type: 'string',
      description: 'The text of the toast.',
      control: 'text',
      defaultValue: 'Toast message',
    },
    position: {
      type: '"top" | "bottom" | "middle"',
      description: 'The position of the toast.',
      options: ['top', 'bottom', 'middle'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'bottom',
    },
  },
};
export default metadata;
interface ArgTypes {
  open: boolean;
  message: string;
  position: 'top' | 'bottom' | 'middle';
}
// endregion

const handleOpen = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.show();
};

const handleClose = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.hide();
};

const handleToggle = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.toggle();
};

const Template: Story<ArgTypes, Context> = ({
  open = false,
  message = 'Toast message',
  position = 'bottom',
}: ArgTypes) => html`
  <igc-button @click="${handleOpen}">Open</igc-button>
  <igc-button @click="${handleClose}">Close</igc-button>
  <igc-button @click="${handleToggle}">Toggle</igc-button>
  <igc-toast
    .open=${open}
    position=${ifDefined(position)}
    message=${ifDefined(message)}
  >
  </igc-toast>
`;

export const Basic = Template.bind({});
