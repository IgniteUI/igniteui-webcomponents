import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcCircularProgressComponent,
  defineComponents,
} from '../src/index.js';

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

const Template = ({
  variant,
  hideLabel,
  value,
  max,
  animationDuration,
  indeterminate,
  labelFormat,
}: IgcCircularProgressArgs) => html`
  <div style="display: flex; align-items: center; gap: 16px">
    <igc-circular-progress
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
    ></igc-circular-progress>
    <igc-circular-progress
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
    >
      <igc-circular-gradient slot="gradient" offset="0%" color="#ff9a40">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="50%" color="#1eccd4">
      </igc-circular-gradient>
      <igc-circular-gradient slot="gradient" offset="100%" color="#ff0079">
      </igc-circular-gradient>
      <span>${value}</span>
    </igc-circular-progress>
    <igc-circular-progress
      style="--diameter: 72px; --stroke-thickness: 12px;"
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
      ><div>Label</div>
    </igc-circular-progress>
  </div>
`;

export const Basic: Story = Template.bind({});
