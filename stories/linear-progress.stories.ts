import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Linear Progress',
  component: 'igc-linear-progress',
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
      control: {
        type: 'select',
      },
      defaultValue: 'top-start',
    },
    max: {
      type: 'number',
      description: 'Maximum value of the control.',
      control: 'number',
      defaultValue: '100',
    },
    value: {
      type: 'number',
      description: 'The value of the control.',
      control: 'number',
      defaultValue: '0',
    },
    variant: {
      type: '"primary" | "info" | "success" | "warning" | "danger"',
      description: 'The variant of the control.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: {
        type: 'select',
      },
      defaultValue: 'primary',
    },
    animationDuration: {
      type: 'number',
      description: 'Animation duration in milliseconds.',
      control: 'number',
      defaultValue: '2000',
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
};
export default metadata;
interface ArgTypes {
  striped: boolean;
  labelAlign:
    | 'top'
    | 'bottom'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end';
  max: number;
  value: number;
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  animationDuration: number;
  indeterminate: boolean;
  hideLabel: boolean;
  labelFormat: string;
}
// endregion

const Template: Story<ArgTypes, Context> = (
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
  },
  { globals: { direction } }
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
    ></igc-linear-progress>
    <br />
    <igc-linear-progress
      style="--track-size: 32px"
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
      ><div>LABEL</div></igc-linear-progress
    >
  </div>
`;

export const Basic = Template.bind({});
