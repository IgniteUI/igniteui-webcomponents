import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { IgcSliderComponent, defineComponents } from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcSliderComponent);

// region default
const metadata: Meta<IgcSliderComponent> = {
  title: 'Slider',
  component: 'igc-slider',
  parameters: {
    docs: {
      description: {
        component:
          'A slider component used to select numeric value within a range.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'number',
      description: 'The current value of the component.',
      control: 'number',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    min: {
      type: 'number',
      description:
        'The minimum value of the slider scale. Defaults to 0.\n\nIf `min` is greater than `max` the call is a no-op.\n\nIf `labels` are provided (projected), then `min` is always set to 0.\n\nIf `lowerBound` ends up being less than than the current `min` value,\nit is automatically assigned the new `min` value.',
      control: 'number',
    },
    max: {
      type: 'number',
      description:
        'The maximum value of the slider scale. Defaults to 100.\n\nIf `max` is less than `min` the call is a no-op.\n\nIf `labels` are provided (projected), then `max` is always set to\nthe number of labels.\n\nIf `upperBound` ends up being greater than than the current `max` value,\nit is automatically assigned the new `max` value.',
      control: 'number',
    },
    lowerBound: {
      type: 'number',
      description:
        'The lower bound of the slider value. If not set, the `min` value is applied.',
      control: 'number',
    },
    upperBound: {
      type: 'number',
      description:
        'The upper bound of the slider value. If not set, the `max` value is applied.',
      control: 'number',
    },
    discreteTrack: {
      type: 'boolean',
      description:
        'Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideTooltip: {
      type: 'boolean',
      description: 'Hides the thumb tooltip.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    step: {
      type: 'number',
      description:
        'Specifies the granularity that the value must adhere to.\n\nIf set to 0 no stepping is implied and any value in the range is allowed.\nIf `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.',
      control: 'number',
    },
    primaryTicks: {
      type: 'number',
      description:
        'The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    secondaryTicks: {
      type: 'number',
      description:
        'The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    tickOrientation: {
      type: '"end" | "mirror" | "start"',
      description: 'Changes the orientation of the ticks.',
      options: ['end', 'mirror', 'start'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'end' } },
    },
    hidePrimaryLabels: {
      type: 'boolean',
      description: 'Hides the primary tick labels.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideSecondaryLabels: {
      type: 'boolean',
      description: 'Hides the secondary tick labels.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale used to format the thumb and tick label values in the slider.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
    },
    valueFormat: {
      type: 'string',
      description:
        'String format used for the thumb and tick label values in the slider.',
      control: 'text',
    },
    tickLabelRotation: {
      type: '"0" | "90"',
      description:
        'The degrees for the rotation of the tick labels. Defaults to 0.',
      options: ['0', '90'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: {
    disabled: false,
    invalid: false,
    discreteTrack: false,
    hideTooltip: false,
    primaryTicks: 0,
    secondaryTicks: 0,
    tickOrientation: 'end',
    hidePrimaryLabels: false,
    hideSecondaryLabels: false,
    locale: 'en',
    tickLabelRotation: '0',
  },
};

export default metadata;

interface IgcSliderArgs {
  /** The current value of the component. */
  value: number;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /**
   * The minimum value of the slider scale. Defaults to 0.
   *
   * If `min` is greater than `max` the call is a no-op.
   *
   * If `labels` are provided (projected), then `min` is always set to 0.
   *
   * If `lowerBound` ends up being less than than the current `min` value,
   * it is automatically assigned the new `min` value.
   */
  min: number;
  /**
   * The maximum value of the slider scale. Defaults to 100.
   *
   * If `max` is less than `min` the call is a no-op.
   *
   * If `labels` are provided (projected), then `max` is always set to
   * the number of labels.
   *
   * If `upperBound` ends up being greater than than the current `max` value,
   * it is automatically assigned the new `max` value.
   */
  max: number;
  /** The lower bound of the slider value. If not set, the `min` value is applied. */
  lowerBound: number;
  /** The upper bound of the slider value. If not set, the `max` value is applied. */
  upperBound: number;
  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuos even if `discreteTrack` is `true`.
   */
  discreteTrack: boolean;
  /** Hides the thumb tooltip. */
  hideTooltip: boolean;
  /**
   * Specifies the granularity that the value must adhere to.
   *
   * If set to 0 no stepping is implied and any value in the range is allowed.
   * If `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.
   */
  step: number;
  /** The number of primary ticks. It defaults to 0 which means no primary ticks are displayed. */
  primaryTicks: number;
  /** The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed. */
  secondaryTicks: number;
  /** Changes the orientation of the ticks. */
  tickOrientation: 'end' | 'mirror' | 'start';
  /** Hides the primary tick labels. */
  hidePrimaryLabels: boolean;
  /** Hides the secondary tick labels. */
  hideSecondaryLabels: boolean;
  /** The locale used to format the thumb and tick label values in the slider. */
  locale: string;
  /** String format used for the thumb and tick label values in the slider. */
  valueFormat: string;
  /** The degrees for the rotation of the tick labels. Defaults to 0. */
  tickLabelRotation: '0' | '90';
}
type Story = StoryObj<IgcSliderArgs>;

// endregion

export const Default: Story = {
  render: (args) => html`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>
    <igc-slider
      aria-label="Default slider"
      ?disabled=${args.disabled}
      ?discrete-track=${args.discreteTrack}
      ?hide-tooltip=${args.hideTooltip}
      ?hide-primary-labels=${args.hidePrimaryLabels}
      ?hide-secondary-labels=${args.hideSecondaryLabels}
      .step=${args.step}
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .locale=${args.locale}
      .lowerBound=${args.lowerBound}
      .upperBound=${args.upperBound}
      .primaryTicks=${args.primaryTicks}
      .secondaryTicks=${args.secondaryTicks}
      .tickOrientation=${args.tickOrientation}
      .tickLabelRotation=${args.tickLabelRotation}
      .valueFormat=${args.valueFormat}
    ></igc-slider>
  `,
};

const currencyFormat: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
};

const distanceFormat: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'kilometer',
  minimumFractionDigits: 2,
};

const temperatureFormat: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'celsius',
  maximumFractionDigits: 2,
};

export const ValueFormat: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    actions: { handles: ['igcChange'] },
  },
  render: () => html`
    <style>
      igc-slider {
        padding: 60px;
      }
    </style>

    <igc-slider
      aria-label="Currency"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=${currencyFormat}
    ></igc-slider>

    <igc-slider
      aria-label="Distance"
      value-format="Distance: {0}"
      locale="fr"
      .valueFormatOptions=${distanceFormat}
    ></igc-slider>

    <igc-slider
      aria-label="Temperature"
      step="0"
      value="26"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=${temperatureFormat}
      min="-273"
      max="273"
    ></igc-slider>
  `,
};

export const Labels: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <igc-slider
      style="max-width: 300px; margin-top: 40px"
      aria-label="Priority"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Low</igc-slider-label>
      <igc-slider-label>Medium</igc-slider-label>
      <igc-slider-label>High</igc-slider-label>
    </igc-slider>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default</legend>
          <igc-slider
            aria-label="Default"
            name="default-slider"
            value="77"
          ></igc-slider>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-slider
            aria-label="Default"
            name="disabled-slider"
            value="50"
          ></igc-slider>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
