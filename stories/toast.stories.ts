import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  defineComponents,
  IgcButtonComponent,
  IgcToastComponent,
} from '../src/index.js';

defineComponents(IgcToastComponent, IgcButtonComponent);

// region default
const metadata: Meta = {
  title: 'Toast',
  component: 'igc-toast',
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the toast is opened.',
      control: 'boolean',
      defaultValue: false,
    },
    displayTime: {
      type: 'number',
      description: 'Determines the time after which the toast will close',
      control: 'number',
      defaultValue: '4000',
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the toast is closed automatically or not.',
      control: 'boolean',
      defaultValue: false,
    },
  },
  args: {
    open: false,
    displayTime: '4000',
    keepOpen: false,
  },
};
export default metadata;

// endregion
const handleShow = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.show();
};

const handleHide = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.hide();
};

const handleToggle = () => {
  const toast = document.querySelector('igc-toast') as IgcToastComponent;
  toast?.toggle();
};

const Template: Story<ArgTypes, Context> = ({
  open = false,
  displayTime = 4000,
  keepOpen = false,
}: ArgTypes) => html`
  <igc-button @click=${handleShow}>Show Toast</igc-button>
  <igc-button @click=${handleHide}>Hide Toast</igc-button>
  <igc-button @click=${handleToggle}>Toggle Toast</igc-button>
  <igc-toast
    .open=${open}
    display-time=${ifDefined(displayTime)}
    ?keep-open=${keepOpen}
  >
    Toast Message
  </igc-toast>
`;

export const Basic = Template.bind({});
