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
          'A snackbar component is used to provide feedback about an operation\nby showing a brief message at the bottom of the screen.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /\n`"--toggle"` and `commandfor` pointing to this element will call the\ncorresponding method declaratively without any JavaScript.',
      },
    },
    actions: { handles: ['igcAction'] },
  },
  argTypes: {
    actionText: {
      type: 'string',
      description: 'The text of the action button.',
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
        'Determines the duration in milliseconds in which the component will be visible.',
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
      description:
        'Sets the position of the component in the viewport.\n\n`bottom` - positions the component at the bottom. This is the default.\n`middle` - positions the component at the center.\n`top` - positions the component at the top.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
    positioning: {
      type: '"viewport" | "container"',
      description:
        'Sets the positioning strategy of the component.\n\n`viewport` - positions the component relative to the viewport, ignoring any ancestor elements. This is the default behavior.\n`container` - positions the component relative to the nearest visible ancestor. In this mode, the component will be constrained within the bounding box of the ancestor and will be positioned according to the `position` attribute.',
      options: ['viewport', 'container'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'viewport' } },
    },
  },
  args: {
    open: false,
    displayTime: 4000,
    keepOpen: false,
    position: 'bottom',
    positioning: 'viewport',
  },
};

export default metadata;

interface IgcSnackbarArgs {
  /** The text of the action button. */
  actionText: string;
  /** Whether the component is in shown state. */
  open: boolean;
  /** Determines the duration in milliseconds in which the component will be visible. */
  displayTime: number;
  /** Determines whether the component should close after the `displayTime` is over. */
  keepOpen: boolean;
  /**
   * Sets the position of the component in the viewport.
   *
   * `bottom` - positions the component at the bottom. This is the default.
   * `middle` - positions the component at the center.
   * `top` - positions the component at the top.
   */
  position: 'bottom' | 'middle' | 'top';
  /**
   * Sets the positioning strategy of the component.
   *
   * `viewport` - positions the component relative to the viewport, ignoring any ancestor elements. This is the default behavior.
   * `container` - positions the component relative to the nearest visible ancestor. In this mode, the component will be constrained within the bounding box of the ancestor and will be positioned according to the `position` attribute.
   */
  positioning: 'viewport' | 'container';
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

    <igc-button command="--show" commandfor="snackbar"
      >Open snackbar</igc-button
    >
    <igc-button command="--hide" commandfor="snackbar"
      >Close snackbar</igc-button
    >
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
      @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
        target.hide()}
    >
      Snackbar with slotted custom action
      <igc-button slot="action" variant="flat">
        <igc-icon name=${radioactive.name}></igc-icon>
        OK
      </igc-button>
    </igc-snackbar>

    <igc-button command="--show" commandfor="snackbar"
      >Open snackbar</igc-button
    >
    <igc-button command="--hide" commandfor="snackbar"
      >Close snackbar</igc-button
    >
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
      <igc-button command="--show" commandfor="snackbarBottom"
        >Bottom (default)</igc-button
      >
      <igc-button command="--show" commandfor="snackbarMiddle"
        >Middle</igc-button
      >
      <igc-button command="--show" commandfor="snackbarTop">Top</igc-button>
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

export const ContainerPositioning: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'When `positioning` is set to `"container"`, the snackbar is anchored to its nearest visible ancestor instead of the viewport. Toggle each position independently to see how the snackbar is constrained within the boundary.',
      },
    },
  },
  render: () => html`
    <style>
      .snackbar-container-demo {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-height: 420px;
        padding: 1.25rem;
        border: 2px dashed #888;
        border-radius: 8px;
      }

      .snackbar-container-demo__label {
        margin: 0;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.5;
      }

      .snackbar-container-demo__actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .snackbar-container-demo__content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.35;
        font-size: 0.875rem;
        font-style: italic;
      }
    </style>

    <div class="snackbar-container-demo">
      <p class="snackbar-container-demo__label">Container boundary</p>

      <div class="snackbar-container-demo__actions">
        <igc-button command="--toggle" commandfor="cs-snackbar-top"
          >Toggle Top</igc-button
        >
        <igc-button command="--toggle" commandfor="cs-snackbar-middle"
          >Toggle Middle</igc-button
        >
        <igc-button command="--toggle" commandfor="cs-snackbar-bottom"
          >Toggle Bottom</igc-button
        >
      </div>

      <p class="snackbar-container-demo__content">
        Snackbars are anchored within this container
      </p>

      <igc-snackbar
        id="cs-snackbar-top"
        positioning="container"
        position="top"
        keep-open
        action-text="Dismiss"
        @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
          target.hide()}
      >
        Top — container-positioned
      </igc-snackbar>
      <igc-snackbar
        id="cs-snackbar-middle"
        positioning="container"
        position="middle"
        keep-open
        action-text="Dismiss"
        @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
          target.hide()}
      >
        Middle — container-positioned
      </igc-snackbar>
      <igc-snackbar
        id="cs-snackbar-bottom"
        positioning="container"
        position="bottom"
        keep-open
        action-text="Dismiss"
        @igcAction=${({ target }: { target: IgcSnackbarComponent }) =>
          target.hide()}
      >
        Bottom — container-positioned
      </igc-snackbar>
    </div>
  `,
};
