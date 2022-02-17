import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Circular Progress',
  component: 'igc-circular-progress',
  argTypes: {
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
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelFormat,
  },
  { globals: { direction } }
) => html`
  <div style="display: flex; align-items: center; gap: 16px">
    <igc-circular-progress
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      dir=${direction}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
    ></igc-circular-progress>
    <igc-circular-progress
      style="--size: 42px; --stroke-thicknes: 8px"
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      dir=${direction}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
    ></igc-circular-progress>
    <igc-circular-progress
      style="--size: 52px;"
      ?indeterminate=${indeterminate}
      ?hide-label=${hideLabel}
      dir=${direction}
      value=${ifDefined(value)}
      max=${ifDefined(max)}
      animation-duration=${ifDefined(animationDuration)}
      variant=${ifDefined(variant)}
      label-format=${ifDefined(labelFormat)}
      ><div>Label</div></igc-circular-progress
    >
  </div>
`;

export const Basic = Template.bind({});
