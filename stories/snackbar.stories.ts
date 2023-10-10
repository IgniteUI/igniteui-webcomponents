import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  defineComponents,
  IgcButtonComponent,
  IgcSnackbarComponent,
} from '../src/index.js';

defineComponents(IgcSnackbarComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcSnackbarComponent> = {
  title: 'Snackbar',
  component: 'igc-snackbar',
  parameters: { docs: { description: {} } },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Determines whether the snackbar is opened.',
      control: 'boolean',
      defaultValue: false,
    },
    displayTime: {
      type: 'number',
      description:
        'Determines the duration in ms in which the snackbar will be visible.',
      control: 'number',
      defaultValue: 4000,
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the snackbar should close after the displayTime is over.',
      control: 'boolean',
      defaultValue: false,
    },
    position: {
      type: '"top" | "bottom" | "middle"',
      description: 'Sets the position of the snackbar.',
      options: ['top', 'bottom', 'middle'],
      control: { type: 'inline-radio' },
      defaultValue: 'bottom',
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
  position: 'top' | 'bottom' | 'middle';
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
