import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcCircularProgressComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcCircularProgressComponent);

// region default
const metadata: Meta<IgcCircularProgressComponent> = {
  title: 'CircularProgress',
  component: 'igc-circular-progress',
  parameters: {
    docs: {
      description: {
        component:
          'A circular progress indicator used to express unspecified wait time or display\nthe length of a process.',
      },
    },
  },
  argTypes: {
    max: {
      type: 'number',
      description: 'Maximum value of the control.',
      control: 'number',
      table: { defaultValue: { summary: '100' } },
    },
    value: {
      type: 'number',
      description: 'The value of the control.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The variant of the control.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'primary' } },
    },
    animationDuration: {
      type: 'number',
      description: 'Animation duration in milliseconds.',
      control: 'number',
      table: { defaultValue: { summary: '500' } },
    },
    indeterminate: {
      type: 'boolean',
      description: 'The indeterminate state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideLabel: {
      type: 'boolean',
      description: 'Shows/hides the label of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelFormat: {
      type: 'string',
      description:
        'Format string for the default label of the control.\nPlaceholders:\n {0} - current value of the control.\n {1} - max value of the control.',
      control: 'text',
    },
  },
  args: {
    max: 100,
    value: 0,
    variant: 'primary',
    animationDuration: 500,
    indeterminate: false,
    hideLabel: false,
  },
};

export default metadata;

interface IgcCircularProgressArgs {
  /** Maximum value of the control. */
  max: number;
  /** The value of the control. */
  value: number;
  /** The variant of the control. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Animation duration in milliseconds. */
  animationDuration: number;
  /** The indeterminate state of the control. */
  indeterminate: boolean;
  /** Shows/hides the label of the control. */
  hideLabel: boolean;
  /**
   * Format string for the default label of the control.
   * Placeholders:
   *  {0} - current value of the control.
   *  {1} - max value of the control.
   */
  labelFormat: string;
}
type Story = StoryObj<IgcCircularProgressArgs>;

// endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic circular progress indicator. Use the controls panel to explore all available properties interactively.',
      },
    },
  },
  args: { value: 60 },
  render: ({
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelFormat,
  }: IgcCircularProgressArgs) => html`
    <igc-circular-progress
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
    ></igc-circular-progress>
  `,
};

export const Variants: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `variant` property applies a semantic color to the progress track. Available values are **primary** (default), **info**, **success**, **warning**, and **danger**.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; padding: 1rem;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="70"
          variant="primary"
        ></igc-circular-progress>
        <span>Primary</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="70"
          variant="info"
        ></igc-circular-progress>
        <span>Info</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="70"
          variant="success"
        ></igc-circular-progress>
        <span>Success</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="70"
          variant="warning"
        ></igc-circular-progress>
        <span>Warning</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="70"
          variant="danger"
        ></igc-circular-progress>
        <span>Danger</span>
      </div>
    </div>
  `,
};

export const Indeterminate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `indeterminate` switches the indicator into an infinite spin animation, used when the duration of an operation is unknown.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; padding: 1rem;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress indeterminate></igc-circular-progress>
        <span>Primary</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          indeterminate
          variant="success"
        ></igc-circular-progress>
        <span>Success</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          indeterminate
          variant="danger"
        ></igc-circular-progress>
        <span>Danger</span>
      </div>
    </div>
  `,
};

export const GradientTrack: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Custom gradient stops can be slotted via `igc-circular-gradient` elements with the `gradient` slot. Each stop accepts an `offset` percentage and a `color`. The default label slot can also be replaced with arbitrary content.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 2rem; padding: 1rem;"
    >
      <igc-circular-progress value="75">
        <igc-circular-gradient
          slot="gradient"
          offset="0%"
          color="#ff9a40"
        ></igc-circular-gradient>
        <igc-circular-gradient
          slot="gradient"
          offset="50%"
          color="#1eccd4"
        ></igc-circular-gradient>
        <igc-circular-gradient
          slot="gradient"
          offset="100%"
          color="#ff0079"
        ></igc-circular-gradient>
      </igc-circular-progress>
      <igc-circular-progress value="50" hide-label>
        <igc-circular-gradient
          slot="gradient"
          offset="0%"
          color="#6a11cb"
        ></igc-circular-gradient>
        <igc-circular-gradient
          slot="gradient"
          offset="100%"
          color="#2575fc"
        ></igc-circular-gradient>
        <span>50%</span>
      </igc-circular-progress>
      <igc-circular-progress value="90" hide-label>
        <igc-circular-gradient
          slot="gradient"
          offset="0%"
          color="#f7971e"
        ></igc-circular-gradient>
        <igc-circular-gradient
          slot="gradient"
          offset="100%"
          color="#ffd200"
        ></igc-circular-gradient>
        <span>Done</span>
      </igc-circular-progress>
    </div>
  `,
};

export const CustomSize: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The diameter and stroke thickness of the ring are controlled via the `--diameter` and `--stroke-thickness` CSS custom properties, making it easy to embed the indicator at any scale.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 2rem; padding: 1rem;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress value="60"></igc-circular-progress>
        <span>Default</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="60"
          style="--diameter: 96px; --stroke-thickness: 4px;"
        ></igc-circular-progress>
        <span>Medium</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="60"
          style="--diameter: 128px; --stroke-thickness: 14px;"
        ></igc-circular-progress>
        <span>Large</span>
      </div>
    </div>
  `,
};

export const LabelFormat: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `labelFormat` property allows customising the text displayed inside the ring. Use `{0}` for the current value and `{1}` for the max value. Setting `hideLabel` removes the label entirely.',
      },
    },
  },
  render: () => html`
    <style>
      igc-circular-progress {
        --diameter: 128px;
      }

      igc-circular-progress::part(label) {
        font-size: 0.75rem;
      }
    </style>
    <div
      style="display: flex; flex-wrap: wrap; align-items: center; gap: 2rem; padding: 1rem;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress value="42"></igc-circular-progress>
        <span>Default</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="42"
          label-format="{0}/{1}"
        ></igc-circular-progress>
        <span>{value}/{max}</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress
          value="42"
          label-format="Step {0}"
        ></igc-circular-progress>
        <span>Step {value}</span>
      </div>
      <div
        style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;"
      >
        <igc-circular-progress value="42" hide-label></igc-circular-progress>
        <span>Hidden</span>
      </div>
    </div>
  `,
};
