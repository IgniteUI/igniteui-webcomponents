import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcSnackbarComponent,
  defineComponents,
} from '../src/index.js';

defineComponents(IgcSnackbarComponent, IgcButtonComponent);

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
    open: {
      type: 'boolean',
      description: 'Determines whether the snackbar is opened.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    displayTime: {
      type: 'number',
      description:
        'Determines the duration in ms in which the snackbar will be visible.',
      control: 'number',
      table: { defaultValue: { summary: 4000 } },
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the snackbar should close after the displayTime is over.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    position: {
      type: '"bottom" | "middle" | "top"',
      description: 'Sets the position of the snackbar.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
    actionText: {
      type: 'string',
      description: 'The snackbar action button.',
      control: 'text',
    },
  },
  args: { open: false, displayTime: 4000, keepOpen: false, position: 'bottom' },
};

export default metadata;

interface IgcSnackbarArgs {
  /** Determines whether the snackbar is opened. */
  open: boolean;
  /** Determines the duration in ms in which the snackbar will be visible. */
  displayTime: number;
  /** Determines whether the snackbar should close after the displayTime is over. */
  keepOpen: boolean;
  /** Sets the position of the snackbar. */
  position: 'bottom' | 'middle' | 'top';
  /** The snackbar action button. */
  actionText: string;
}
type Story = StoryObj<IgcSnackbarArgs>;

// endregion

const handleOpen = () => {
  const snackbar = document.querySelector(
    'igc-snackbar'
  ) as IgcSnackbarComponent;
  snackbar?.show();
};

const handleHide = () => {
  const snackbar = document.querySelector(
    'igc-snackbar'
  ) as IgcSnackbarComponent;
  snackbar?.hide();
};

const Template = ({
  open,
  keepOpen,
  displayTime,
  actionText = 'Close',
  position = 'bottom',
}: IgcSnackbarArgs) => html`
  <igc-snackbar
    .open=${open}
    ?keep-open=${keepOpen}
    display-time=${ifDefined(displayTime)}
    action-text=${ifDefined(actionText)}
    .position=${position}
  >
    Snackbar Message
  </igc-snackbar>
  <igc-button @click="${handleOpen}">Open Snackbar</igc-button>
  <igc-button @click="${handleHide}">Hide Snackbar</igc-button>
`;

export const Basic: Story = Template.bind({});
document.addEventListener('igcAction', handleHide);
