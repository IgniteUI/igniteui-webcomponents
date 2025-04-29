import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcRangeSliderComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcRangeSliderComponent);

// region default
const metadata: Meta<IgcRangeSliderComponent> = {
  title: 'RangeSlider',
  component: 'igc-range-slider',
  parameters: {
    docs: {
      description: {
        component:
          'A range slider component used to select two numeric values within a range.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    lower: {
      type: 'number',
      description: 'The current value of the lower thumb.',
      control: 'number',
    },
    upper: {
      type: 'number',
      description: 'The current value of the upper thumb.',
      control: 'number',
    },
    thumbLabelLower: {
      type: 'string',
      description: 'The aria label for the lower thumb.',
      control: 'text',
    },
    thumbLabelUpper: {
      type: 'string',
      description: 'The aria label for the upper thumb.',
      control: 'text',
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
    disabled: {
      type: 'boolean',
      description: 'Disables the UI interactions of the slider.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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

interface IgcRangeSliderArgs {
  /** The current value of the lower thumb. */
  lower: number;
  /** The current value of the upper thumb. */
  upper: number;
  /** The aria label for the lower thumb. */
  thumbLabelLower: string;
  /** The aria label for the upper thumb. */
  thumbLabelUpper: string;
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
  /** Disables the UI interactions of the slider. */
  disabled: boolean;
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
type Story = StoryObj<IgcRangeSliderArgs>;

// endregion

export const Default: Story = {
  args: {
    thumbLabelLower: 'Default slider lower thumb',
    thumbLabelUpper: 'Default slider upper thumb',
    lower: 0,
    upper: 25,
  },
  render: (args) => html`
    <style>
      igc-range-slider {
        padding: 60px;
      }
    </style>
    <igc-range-slider
      .thumbLabelLower=${args.thumbLabelLower}
      .thumbLabelUpper=${args.thumbLabelUpper}
      .lower=${args.lower}
      .upper=${args.upper}
      ?disabled=${args.disabled}
      ?discrete-track=${args.discreteTrack}
      ?hide-tooltip=${args.hideTooltip}
      ?hide-primary-labels=${args.hidePrimaryLabels}
      ?hide-secondary-labels=${args.hideSecondaryLabels}
      .step=${args.step}
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
    ></igc-range-slider>
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
      igc-range-slider {
        padding: 60px;
      }
    </style>

    <igc-range-slider
      thumb-label-lower="Currency low"
      thumb-label-upper="Currency high"
      lower="10"
      upper="50"
      primary-ticks="3"
      secondary-ticks="4"
      .valueFormatOptions=${currencyFormat}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Distance low"
      thumb-label-upper="Distance high"
      value-format="Distance: {0}"
      .valueFormatOptions=${distanceFormat}
    ></igc-range-slider>

    <igc-range-slider
      thumb-label-lower="Temperature low"
      thumb-label-upper="Temperature high"
      step="1"
      lower="0"
      upper="37"
      value-format="{0}"
      primary-ticks="15"
      .valueFormatOptions=${temperatureFormat}
      min="-273"
      max="273"
    ></igc-range-slider>
  `,
};

export const Labels: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <igc-range-slider
      style="padding: 60px"
      thumb-label-lower="Severity level low"
      thumb-label-upper="Severity level high"
      discrete-track
      primary-ticks="1"
    >
      <igc-slider-label>Debugging</igc-slider-label>
      <igc-slider-label>Informational</igc-slider-label>
      <igc-slider-label>Notification</igc-slider-label>
      <igc-slider-label>Warning</igc-slider-label>
      <igc-slider-label>Error</igc-slider-label>
      <igc-slider-label>Critical</igc-slider-label>
      <igc-slider-label>Alert</igc-slider-label>
      <igc-slider-label>Emergency</igc-slider-label>
    </igc-range-slider>
  `,
};
