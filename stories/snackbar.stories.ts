import { html } from 'lit';
import { Story, Context } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { IgcSnackbarComponent } from '../src/index.js';

// region default
const metadata = {
  title: 'Snackbar',
  component: 'igc-snackbar',
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
};
export default metadata;
interface ArgTypes {
  open: boolean;
  displayTime: number;
  keepOpen: boolean;
  actionText: string;
}
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
  { open, keepOpen, displayTime = 4000, actionText = 'Close' }: ArgTypes,
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
