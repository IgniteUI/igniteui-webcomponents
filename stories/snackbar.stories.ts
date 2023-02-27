import { html } from 'lit';
import { Story, Context } from './story.js';
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
  parameters: {
    docs: {
      description: {
        component:
          'A snackbar component is used to provide feedback about an operation\nby showing a brief message at the bottom of the screen.',
      },
    },
  },
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
      defaultValue: '4000',
    },
    keepOpen: {
      type: 'boolean',
      description:
        'Determines whether the snackbar should close after the displayTime is over.',
      control: 'boolean',
      defaultValue: false,
    },
    actionText: {
      type: 'string',
      description: 'The snackbar action button.',
      control: 'text',
    },
  },
  args: { open: false, displayTime: '4000', keepOpen: false },
};

export default metadata;

interface IgcSnackbarArgs {
  /** Determines whether the snackbar is opened. */
  open: boolean;
  /** Determines the duration in ms in which the snackbar will be visible. */
  displayTime: number;
  /** Determines whether the snackbar should close after the displayTime is over. */
  keepOpen: boolean;
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

const Template: Story<ArgTypes, Context> = (
  { open, keepOpen, displayTime, actionText = 'Close' }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-snackbar
    .open=${open}
    ?keep-open=${keepOpen}
    display-time=${ifDefined(displayTime)}
    action-text=${ifDefined(actionText)}
    dir=${ifDefined(direction)}
  >
    Snackbar Message
  </igc-snackbar>
  <igc-button @click="${handleOpen}">Open Snackbar</igc-button>
  <igc-button @click="${handleHide}">Hide Snackbar</igc-button>
`;

export const Basic = Template.bind({});
document.addEventListener('igcAction', handleHide);
