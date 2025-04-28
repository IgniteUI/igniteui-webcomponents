import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcToastComponent,
  defineComponents,
} from 'igniteui-webcomponents';

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
      description: 'Whether the component is in shown state.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    displayTime: {
      type: 'number',
      description:
        'Determines the duration in ms in which the component will be visible.',
      control: 'number',
      table: { defaultValue: { summary: '4000' } },
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the component should close after the `displayTime` is over.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    position: {
      type: '"bottom" | "middle" | "top"',
      description: 'Sets the position of the component in the viewport.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
  },
  args: { open: false, displayTime: 4000, keepOpen: false, position: 'bottom' },
};

export default metadata;

interface IgcToastArgs {
  /** Whether the component is in shown state. */
  open: boolean;
  /** Determines the duration in ms in which the component will be visible. */
  displayTime: number;
  /** Determines whether the component should close after the `displayTime` is over. */
  keepOpen: boolean;
  /** Sets the position of the component in the viewport. */
  position: 'bottom' | 'middle' | 'top';
}
type Story = StoryObj<IgcToastArgs>;

// endregion

export const Basic: Story = {
  render: ({ open, displayTime, keepOpen, position }) => html`
    <igc-toast
      id="toast"
      ?open=${open}
      ?keep-open=${keepOpen}
      .displayTime=${displayTime}
      .position=${position}
    >
      Notification displayed
    </igc-toast>

    <igc-button onclick="toast.show()">Show Toast</igc-button>
    <igc-button onclick="toast.hide()">Hide Toast</igc-button>
    <igc-button onclick="toast.toggle()">Toggle Toast</igc-button>
  `,
};
