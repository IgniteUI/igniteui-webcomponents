import { radioactive } from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcSnackbarComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

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
          'A snackbar provides brief feedback about an operation by displaying a short message near the bottom of the screen. It disappears automatically after a configurable `displayTime`, or can stay open with `keepOpen`. An optional action button lets users respond (e.g. Undo).',
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
  parameters: {
    docs: {
      description: {
        story:
          'A snackbar with a built-in action button set via `actionText`. Clicking the action dispatches `igcAction`. Use the **Controls** panel to toggle `keepOpen`, change `displayTime`, and switch `position`.',
      },
    },
  },
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
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `action` slot to replace the built-in action button with a fully custom `igc-button` containing an icon. The `igcAction` event is still emitted when the slotted button is clicked.',
      },
    },
  },
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

export const Positions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the three `position` values — `bottom` (default), `middle`, and `top`. Each button opens a separate snackbar pinned to that region of the viewport.',
      },
    },
  },
  render: () => html`
    <style>
      .positions-demo {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    </style>
    <div class="positions-demo">
      <igc-button onclick="snackbarBottom.show()">Bottom (default)</igc-button>
      <igc-button onclick="snackbarMiddle.show()">Middle</igc-button>
      <igc-button onclick="snackbarTop.show()">Top</igc-button>
    </div>

    <igc-snackbar
      id="snackbarBottom"
      position="bottom"
      action-text="Dismiss"
      @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
        target.hide()}
    >
      Snackbar — bottom
    </igc-snackbar>

    <igc-snackbar
      id="snackbarMiddle"
      position="middle"
      action-text="Dismiss"
      @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
        target.hide()}
    >
      Snackbar — middle
    </igc-snackbar>

    <igc-snackbar
      id="snackbarTop"
      position="top"
      action-text="Dismiss"
      @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
        target.hide()}
    >
      Snackbar — top
    </igc-snackbar>
  `,
};
