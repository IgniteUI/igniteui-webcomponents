import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcToastComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcToastComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcToastComponent> = {
  title: 'Toast',
  component: 'igc-toast',
  parameters: {
    docs: {
      description: {
        component:
          'A toast component is used to show a brief, non-interactive notification.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /\n`"--toggle"` and `commandfor` pointing to this element will call the\ncorresponding method declaratively without any JavaScript.',
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

interface IgcToastArgs {
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
type Story = StoryObj<IgcToastArgs>;

// endregion

export const Basic: Story = {
  args: {
    position: 'middle',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the **Controls** panel to adjust `position`, `displayTime`, and `keepOpen`. Click the buttons to show, hide, or toggle the toast.',
      },
    },
  },
  render: ({ open, displayTime, keepOpen, position }) => html`
    <igc-toast
      id="toast-basic"
      ?open=${open}
      ?keep-open=${keepOpen}
      .displayTime=${displayTime}
      .position=${position}
    >
      Notification displayed
    </igc-toast>

    <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
      <igc-button command="--show" commandfor="toast-basic">Show</igc-button>
      <igc-button command="--hide" commandfor="toast-basic">Hide</igc-button>
      <igc-button command="--toggle" commandfor="toast-basic"
        >Toggle</igc-button
      >
    </div>
  `,
};

export const Positions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates all three supported positions — `bottom`, `middle`, and `top` — each triggered independently.',
      },
    },
  },
  render: () => html`
    <igc-toast id="toast-bottom" position="bottom" keep-open>
      Bottom toast
    </igc-toast>
    <igc-toast id="toast-middle" position="middle" keep-open>
      Middle toast
    </igc-toast>
    <igc-toast id="toast-top" position="top" keep-open> Top toast </igc-toast>

    <div style="display: flex; gap: .5rem; flex-wrap: wrap;">
      <igc-button command="--toggle" commandfor="toast-bottom"
        >Toggle Bottom</igc-button
      >
      <igc-button command="--toggle" commandfor="toast-middle"
        >Toggle Middle</igc-button
      >
      <igc-button command="--toggle" commandfor="toast-top"
        >Toggle Top</igc-button
      >
    </div>
  `,
};

export const KeepOpen: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'When `keep-open` is set the toast stays visible indefinitely and must be dismissed manually. Useful for errors or action-required messages.',
      },
    },
  },
  render: () => html`
    <igc-toast id="toast-keep" position="bottom" keep-open>
      Action required — please review the changes before continuing.
    </igc-toast>

    <div style="display: flex; gap: .5rem;">
      <igc-button command="--show" commandfor="toast-keep">Show</igc-button>
      <igc-button command="--hide" commandfor="toast-keep">Dismiss</igc-button>
    </div>
  `,
};

export const ContainerPositioning: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'When `positioning` is set to `"container"`, the toast is anchored to its nearest visible ancestor instead of the viewport. Toggle each position independently to see how the toast is constrained within the boundary.',
      },
    },
  },
  render: () => html`
    <style>
      .toast-container-demo {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-height: 420px;
        padding: 1.25rem;
        border: 2px dashed #888;
        border-radius: 8px;
      }

      .toast-container-demo__label {
        margin: 0;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        opacity: 0.5;
      }

      .toast-container-demo__actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .toast-container-demo__content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.35;
        font-size: 0.875rem;
        font-style: italic;
      }
    </style>

    <div class="toast-container-demo">
      <p class="toast-container-demo__label">Container boundary</p>

      <div class="toast-container-demo__actions">
        <igc-button command="--toggle" commandfor="ct-toast-top"
          >Toggle Top</igc-button
        >
        <igc-button command="--toggle" commandfor="ct-toast-middle"
          >Toggle Middle</igc-button
        >
        <igc-button command="--toggle" commandfor="ct-toast-bottom"
          >Toggle Bottom</igc-button
        >
      </div>

      <p class="toast-container-demo__content">
        Toasts are anchored within this container
      </p>

      <igc-toast
        id="ct-toast-top"
        positioning="container"
        position="top"
        keep-open
      >
        Top — container-positioned
      </igc-toast>
      <igc-toast
        id="ct-toast-middle"
        positioning="container"
        position="middle"
        keep-open
      >
        Middle — container-positioned
      </igc-toast>
      <igc-toast
        id="ct-toast-bottom"
        positioning="container"
        position="bottom"
        keep-open
      >
        Bottom — container-positioned
      </igc-toast>
    </div>
  `,
};
