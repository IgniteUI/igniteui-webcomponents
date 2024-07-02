import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcIconComponent,
  IgcRatingComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';
import utils from './rating.common.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcRatingComponent, IgcIconComponent);
utils.icons.forEach((icon) => registerIconFromText(icon.name, icon.value));

// region default
const metadata: Meta<IgcRatingComponent> = {
  title: 'Rating',
  component: 'igc-rating',
  parameters: {
    docs: {
      description: {
        component:
          "Rating provides insight regarding others' opinions and experiences,\nand can allow the user to submit a rating of their own",
      },
    },
    actions: { handles: ['igcChange', 'igcHover'] },
  },
  argTypes: {
    max: {
      type: 'number',
      description:
        'The maximum value for the rating.\n\nIf there are projected symbols, the maximum value will be resolved\nbased on the number of symbols.',
      control: 'number',
      table: { defaultValue: { summary: 5 } },
    },
    step: {
      type: 'number',
      description:
        'The minimum value change allowed.\n\nValid values are in the interval between 0 and 1 inclusive.',
      control: 'number',
      table: { defaultValue: { summary: 1 } },
    },
    label: {
      type: 'string',
      description: 'The label of the control.',
      control: 'text',
    },
    valueFormat: {
      type: 'string',
      description:
        "A format string which sets aria-valuetext. Instances of '{0}' will be replaced\nwith the current value of the control and instances of '{1}' with the maximum value for the control.\n\nImportant for screen-readers and useful for localization.",
      control: 'text',
    },
    value: {
      type: 'number',
      description: 'The current value of the component',
      control: 'number',
      table: { defaultValue: { summary: 0 } },
    },
    hoverPreview: {
      type: 'boolean',
      description: 'Sets hover preview behavior for the component',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    single: {
      type: 'boolean',
      description: 'Toggles single selection visual mode.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    allowReset: {
      type: 'boolean',
      description:
        'Whether to reset the rating when the user selects the same value.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    max: 5,
    step: 1,
    value: 0,
    hoverPreview: false,
    readOnly: false,
    single: false,
    allowReset: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcRatingArgs {
  /**
   * The maximum value for the rating.
   *
   * If there are projected symbols, the maximum value will be resolved
   * based on the number of symbols.
   */
  max: number;
  /**
   * The minimum value change allowed.
   *
   * Valid values are in the interval between 0 and 1 inclusive.
   */
  step: number;
  /** The label of the control. */
  label: string;
  /**
   * A format string which sets aria-valuetext. Instances of '{0}' will be replaced
   * with the current value of the control and instances of '{1}' with the maximum value for the control.
   *
   * Important for screen-readers and useful for localization.
   */
  valueFormat: string;
  /** The current value of the component */
  value: number;
  /** Sets hover preview behavior for the component */
  hoverPreview: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Toggles single selection visual mode. */
  single: boolean;
  /** Whether to reset the rating when the user selects the same value. */
  allowReset: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcRatingArgs>;

// endregion

export const Default: Story = {
  args: {
    label: 'Default rating',
  },
  render: ({
    single,
    label,
    disabled,
    allowReset,
    hoverPreview,
    invalid,
    max,
    readOnly,
    step,
    value,
    valueFormat,
  }) =>
    html`<igc-rating
      label=${ifDefined(label)}
      ?single=${single}
      ?allow-reset=${allowReset}
      ?hover-preview=${hoverPreview}
      ?readonly=${readOnly}
      ?invalid=${invalid}
      ?disabled=${disabled}
      .max=${max}
      .step=${step}
      .value=${value}
      .valueFormat=${valueFormat}
    ></igc-rating>`,
};

export const SingleSelection: Story = {
  args: {
    label: 'Single selection',
    single: true,
  },
  render: ({
    single,
    label,
    disabled,
    allowReset,
    hoverPreview,
    invalid,
    max,
    readOnly,
    step,
    value,
    valueFormat,
  }) =>
    html`<igc-rating
      label=${ifDefined(label)}
      ?single=${single}
      ?allow-reset=${allowReset}
      ?hover-preview=${hoverPreview}
      ?readonly=${readOnly}
      ?invalid=${invalid}
      ?disabled=${disabled}
      .max=${max}
      .step=${step}
      .value=${value}
      .valueFormat=${valueFormat}
    ></igc-rating>`,
};

export const Slots: Story = {
  render: ({
    allowReset,
    disabled,
    hoverPreview,
    invalid,
    max,
    readOnly,
    single,
    step,
    value,
    valueFormat,
  }) => html`
    <style>
      igc-rating {
        display: flex;
      }
    </style>

    <igc-rating
      label="Custom Icons"
      ?single=${single}
      ?allow-reset=${allowReset}
      ?hover-preview=${hoverPreview}
      ?readonly=${readOnly}
      ?invalid=${invalid}
      ?disabled=${disabled}
      .max=${max}
      .step=${step}
      .value=${value}
      .valueFormat=${valueFormat}
    >
      ${utils.renderSymbols(
        max,
        () => html`
          <igc-rating-symbol>
            <igc-icon collection="default" name="bandage"></igc-icon>
            <igc-icon
              collection="default"
              name="bacteria"
              slot="empty"
            ></igc-icon>
          </igc-rating-symbol>
        `
      )}
    </igc-rating>

    <igc-rating
      label="SVG"
      ?single=${single}
      ?allow-reset=${allowReset}
      ?hover-preview=${hoverPreview}
      ?readonly=${readOnly}
      ?invalid=${invalid}
      ?disabled=${disabled}
      .max=${max}
      .step=${step}
      .value=${value}
      .valueFormat=${valueFormat}
    >
      ${utils.renderSymbols(
        max,
        () => html`
          <igc-rating-symbol>
            <div>${utils.svg}</div>
            <div slot="empty">${utils.svg}</div>
          </igc-rating-symbol>
        `
      )}
    </igc-rating>

    <igc-rating
      label="Custom symbols with single selection"
      @igcChange=${utils.hoverListener}
      @igcHover=${utils.hoverListener}
      ?allow-reset=${allowReset}
      ?disabled=${disabled}
      ?hover-preview=${hoverPreview}
      ?readonly=${readOnly}
      .step=${step}
      max="5"
      single
    >
      ${utils.emoji}
      <p slot="value-label" id="selection">Select a value</p>
    </igc-rating>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <div>
            <igc-rating name="default-rating" label="Default"></igc-rating>
          </div>
          <div>
            <igc-rating
              name="single-select-rating"
              label="Single select"
              single
              value="1"
            >
              ${utils.renderSymbols(
                5,
                () => html`
                  <igc-rating-symbol>
                    <div>${utils.svg}</div>
                    <div slot="empty">${utils.svg}</div>
                  </igc-rating-symbol>
                `
              )}
            </igc-rating>
          </div>
          <div>
            <igc-rating
              name="default-value"
              label="With default value"
              max="7"
              step="0.25"
              value="3.5"
            ></igc-rating>
          </div>
        </fieldset>

        <fieldset>
          <igc-rating
            name="readonly-rating"
            label="Readonly"
            value="4"
            readonly
          ></igc-rating>
        </fieldset>

        <fieldset disabled>
          <igc-rating
            name="disabled-rating"
            value="2"
            label="Disabled"
          ></igc-rating>
        </fieldset>

        ${formControls()}
      </form>
    `;
  },
};
