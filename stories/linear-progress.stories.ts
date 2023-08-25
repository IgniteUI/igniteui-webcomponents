import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context } from './story.js';
import { defineComponents, IgcLinearProgressComponent } from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

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
      defaultValue: false,
    },
    labelAlign: {
      type: '"top" | "bottom" | "top-start" | "top-end" | "bottom-start" | "bottom-end"',
      description: 'The position for the default label of the control.',
      options: [
        'top',
        'bottom',
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
      ],
      control: { type: 'select' },
      defaultValue: 'top-start',
    },
    max: {
      type: 'number',
      description: 'Maximum value of the control.',
      control: 'number',
      defaultValue: 100,
    },
    value: {
      type: 'number',
      description: 'The value of the control.',
      control: 'number',
      defaultValue: 0,
    },
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The variant of the control.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      defaultValue: 'primary',
    },
    animationDuration: {
      type: 'number',
      description: 'Animation duration in milliseconds.',
      control: 'number',
      defaultValue: 500,
    },
    indeterminate: {
      type: 'boolean',
      description: 'The indeterminate state of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    hideLabel: {
      type: 'boolean',
      description: 'Shows/hides the label of the control.',
      control: 'boolean',
      defaultValue: false,
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
    | 'top'
    | 'bottom'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
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

const Template = (
  {
    striped,
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelAlign,
    labelFormat,
  }: IgcLinearProgressArgs,
  { globals: { direction } }: Context
) => html`
  <div
    style="display: flex; flex-direction: column; justify-content: center; gap: 16px"
  >
    <igc-linear-progress
      ?striped=${striped}
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      dir=${direction}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-align=${labelAlign}
      label-format=${ifDefined(labelFormat)}
    >
    </igc-linear-progress>
  </div>
`;

export const Basic: Story = Template.bind({});
