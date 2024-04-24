import { radioactive } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcSnackbarComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

registerIconFromText(radioactive.name, radioactive.value);
defineComponents(IgcSnackbarComponent, IgcButtonComponent, IgcIconComponent);

// region default
const metadata: Meta<IgcSnackbarComponent> = {
  title: 'Snackbar',
  component: 'igc-snackbar',
  parameters: {
    docs: {
      description: {
        component:
          'A snackbar component is used to provide feedback about an operation\nby showing a brief message at the bottom of the screen.',
      },
    },
    actions: { handles: ['igcAction'] },
  },
  argTypes: {
    actionText: {
      type: 'string',
      description: 'The snackbar action button.',
      control: 'text',
    },
    open: {
      type: 'boolean',
      description: 'Whether the component is in shown state.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    displayTime: {
      type: 'number',
      description:
        'Determines the duration in ms in which the component will be visible.',
      control: 'number',
      table: { defaultValue: { summary: 4000 } },
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the component should close after the `displayTime` is over.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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

interface IgcSnackbarArgs {
  /** The snackbar action button. */
  actionText: string;
  /** Whether the component is in shown state. */
  open: boolean;
  /** Determines the duration in ms in which the component will be visible. */
  displayTime: number;
  /** Determines whether the component should close after the `displayTime` is over. */
  keepOpen: boolean;
  /** Sets the position of the component in the viewport. */
  position: 'bottom' | 'middle' | 'top';
}
type Story = StoryObj<IgcSnackbarArgs>;

// endregion

export const Basic: Story = {
  render: ({
    open,
    keepOpen,
    displayTime,
    actionText = 'Close',
    position,
  }) => html`
    <igc-snackbar
      id="snackbar"
      ?open=${open}
      ?keep-open=${keepOpen}
      .displayTime=${displayTime}
      .actionText=${actionText}
      .position=${position}
      @igcAction=${({ target }) => target.hide()}
      >Snackbar Message</igc-snackbar
    >

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  `,
};

export const SlottedAction: Story = {
  render: ({ open, keepOpen, displayTime, position }) => html`
    <igc-snackbar
      id="snackbar"
      ?open=${open}
      ?keep-open=${keepOpen}
      .displayTime=${displayTime}
      .position=${position}
      @igcAction=${({ target }) => target.hide()}
    >
      Snackbar with slotted custom action
      <igc-button slot="action" variant="flat">
        <igc-icon name=${radioactive.name}></igc-icon>
        OK
      </igc-button>
    </igc-snackbar>

    <igc-button onclick="snackbar.show()">Open snackbar</igc-button>
    <igc-button onclick="snackbar.hide()">Close snackbar</igc-button>
  `,
};
