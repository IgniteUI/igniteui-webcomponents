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

    <igc-button
      @click=${() =>
        (document.getElementById('toast-basic') as IgcToastComponent).show()}
      >Show Toast</igc-button
    >
    <igc-button
      @click=${() =>
        (document.getElementById('toast-basic') as IgcToastComponent).hide()}
      >Hide Toast</igc-button
    >
    <igc-button
      @click=${() =>
        (document.getElementById('toast-basic') as IgcToastComponent).toggle()}
      >Toggle Toast</igc-button
    >
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
      <igc-button
        @click=${() =>
          (
            document.getElementById('toast-bottom') as IgcToastComponent
          ).toggle()}
        >Toggle Bottom</igc-button
      >
      <igc-button
        @click=${() =>
          (
            document.getElementById('toast-middle') as IgcToastComponent
          ).toggle()}
        >Toggle Middle</igc-button
      >
      <igc-button
        @click=${() =>
          (document.getElementById('toast-top') as IgcToastComponent).toggle()}
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
      <igc-button
        @click=${() =>
          (document.getElementById('toast-keep') as IgcToastComponent).show()}
        >Show</igc-button
      >
      <igc-button
        @click=${() =>
          (document.getElementById('toast-keep') as IgcToastComponent).hide()}
        >Dismiss</igc-button
      >
    </div>
  `,
};
