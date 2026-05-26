import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcLinearProgressComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcLinearProgressComponent);

// region default
const metadata: Meta<IgcLinearProgressComponent> = {
  title: 'LinearProgress',
  component: 'igc-linear-progress',
  parameters: {
    docs: {
      description: {
        component:
          'A linear progress indicator used to express unspecified wait time or display\nthe length of a process.',
      },
    },
  },
  argTypes: {
    striped: {
      type: 'boolean',
      description: 'Sets the striped look of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelAlign: {
      type: '"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"',
      description: 'The position for the default label of the control.',
      options: [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'top-start' } },
    },
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
    striped: false,
    labelAlign: 'top-start',
    max: 100,
    value: 0,
    variant: 'primary',
    animationDuration: 500,
    indeterminate: false,
    hideLabel: false,
  },
};

export default metadata;

interface IgcLinearProgressArgs {
  /** Sets the striped look of the control. */
  striped: boolean;
  /** The position for the default label of the control. */
  labelAlign:
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end';
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
type Story = StoryObj<IgcLinearProgressArgs>;

// endregion

export const Default: Story = {
  args: { value: 60 },
  parameters: {
    docs: {
      description: {
        story:
          'A basic linear progress indicator. Use the controls panel to explore all available properties interactively, including `striped`, `variant`, `labelAlign`, `labelFormat`, and `indeterminate`.',
      },
    },
  },
  render: ({
    striped,
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelAlign,
    labelFormat,
  }) => html`
    <igc-linear-progress
      ?striped=${striped}
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-align=${labelAlign}
      label-format=${ifDefined(labelFormat)}
    ></igc-linear-progress>
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
      style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;"
    >
      <igc-linear-progress
        value="70"
        variant="primary"
        label-format="Primary: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        value="70"
        variant="info"
        label-format="Info: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        value="70"
        variant="success"
        label-format="Success: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        value="70"
        variant="warning"
        label-format="Warning: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        value="70"
        variant="danger"
        label-format="Danger: {0}%"
      ></igc-linear-progress>
    </div>
  `,
};

export const Striped: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `striped` property adds a diagonal stripe pattern to the filled portion of the track, available for all semantic variants.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;"
    >
      <igc-linear-progress
        striped
        value="70"
        variant="primary"
        label-format="Primary: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        striped
        value="70"
        variant="info"
        label-format="Info: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        striped
        value="70"
        variant="success"
        label-format="Success: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        striped
        value="70"
        variant="warning"
        label-format="Warning: {0}%"
      ></igc-linear-progress>
      <igc-linear-progress
        striped
        value="70"
        variant="danger"
        label-format="Danger: {0}%"
      ></igc-linear-progress>
    </div>
  `,
};

export const Indeterminate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `indeterminate` switches the indicator into a continuous animation, used when the duration of an operation is unknown.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem;"
    >
      <igc-linear-progress
        indeterminate
        variant="primary"
      ></igc-linear-progress>
      <igc-linear-progress indeterminate variant="info"></igc-linear-progress>
      <igc-linear-progress
        indeterminate
        variant="success"
      ></igc-linear-progress>
      <igc-linear-progress
        indeterminate
        variant="warning"
      ></igc-linear-progress>
      <igc-linear-progress indeterminate variant="danger"></igc-linear-progress>
    </div>
  `,
};
