import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcToastComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(IgcToastComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcToastComponent> = {
  title: 'Toast',
  component: 'igc-toast',
  parameters: {
    docs: {
      description: {
        component: 'A toast component is used to show a notification',
      },
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the toast is opened.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    displayTime: {
      type: 'number',
      description: 'Determines the time after which the toast will close',
      control: 'number',
      table: { defaultValue: { summary: 4000 } },
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the toast is closed automatically or not.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    position: {
      type: '"bottom" | "middle" | "top"',
      description: 'Sets the position of the toast.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
  },
  args: { open: false, displayTime: 4000, keepOpen: false, position: 'bottom' },
};

export default metadata;

interface IgcToastArgs {
  /** Determines whether the toast is opened. */
  open: boolean;
  /** Determines the time after which the toast will close */
  displayTime: number;
  /** Determines whether the toast is closed automatically or not. */
  keepOpen: boolean;
  /** Sets the position of the toast. */
  position: 'bottom' | 'middle' | 'top';
}
type Story = StoryObj<IgcToastArgs>;

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

const Template = ({
  open = false,
  displayTime = 4000,
  keepOpen = false,
  position = 'bottom',
}: IgcToastArgs) => html`
  <igc-button @click=${handleShow}>Show Toast</igc-button>
  <igc-button @click=${handleHide}>Hide Toast</igc-button>
  <igc-button @click=${handleToggle}>Toggle Toast</igc-button>
  <igc-toast
    .open=${open}
    display-time=${ifDefined(displayTime)}
    ?keep-open=${keepOpen}
    .position=${position}
  >
    Toast Message
  </igc-toast>
`;

export const Basic: Story = Template.bind({});
