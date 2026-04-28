import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import {
  IgcDateTimeInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcDateTimeInputComponent);

// region default
const metadata: Meta<IgcDateTimeInputComponent> = {
  title: 'DateTimeInput',
  component: 'igc-date-time-input',
  parameters: {
    docs: {
      description: {
        component:
          'A date time input is an input field that lets you set and edit the date and time in a chosen input element\nusing customizable display and input formats.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string | Date',
      description: 'The value of the input.',
      options: ['string', 'Date'],
      control: 'text',
    },
    min: {
      type: 'Date',
      description: 'The minimum value required for the input to remain valid.',
      control: 'date',
    },
    max: {
      type: 'Date',
      description: 'The maximum value required for the input to remain valid.',
      control: 'date',
    },
    inputFormat: {
      type: 'string',
      description: 'The date format to apply on the input.',
      control: 'text',
    },
    displayFormat: {
      type: 'string',
      description:
        'Format to display the value in when not editing.\nDefaults to the locale format if not set.',
      control: 'text',
    },
    spinLoop: {
      type: 'boolean',
      description: 'Sets whether to loop over the currently spun segment.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    locale: {
      type: 'string',
      description:
        'Gets/Sets the locale used for formatting the display value.',
      control: 'text',
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    mask: {
      type: 'string',
      description: 'The masked pattern of the component.',
      control: 'text',
      table: { defaultValue: { summary: 'CCCCCCCCCC' } },
    },
    prompt: {
      type: 'string',
      description:
        'The prompt symbol to use for unfilled parts of the mask pattern.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
  },
  args: {
    spinLoop: true,
    readOnly: false,
    mask: 'CCCCCCCCCC',
    prompt: '_',
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcDateTimeInputArgs {
  /** The value of the input. */
  value: string | Date;
  /** The minimum value required for the input to remain valid. */
  min: Date;
  /** The maximum value required for the input to remain valid. */
  max: Date;
  /** The date format to apply on the input. */
  inputFormat: string;
  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   */
  displayFormat: string;
  /** Sets whether to loop over the currently spun segment. */
  spinLoop: boolean;
  /** Gets/Sets the locale used for formatting the display value. */
  locale: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The masked pattern of the component. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask pattern. */
  prompt: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcDateTimeInputArgs>;

// endregion

const stepUp = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.stepUp();
};

const stepDown = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.stepDown();
};
const clear = () => {
  document.querySelector(IgcDateTimeInputComponent.tagName)!.clear();
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic date-time input with prefix/suffix icon buttons for clearing the value and stepping the active date segment up or down. Use the controls panel to explore all available properties interactively.',
      },
    },
  },
  args: {
    value: new Date(),
    label: 'Enter a date and/or time',
  },
  render: (args) => html`
    <igc-date-time-input
      .label=${args.label}
      .name=${args.name}
      .value=${args.value ? new Date(args.value) : null}
      .inputFormat=${args.inputFormat}
      .displayFormat=${args.displayFormat}
      .min=${args.min ? new Date(args.min) : null}
      .max=${args.max ? new Date(args.max) : null}
      .locale=${args.locale}
      .prompt=${args.prompt}
      .placeholder=${args.placeholder}
      ?spin-loop=${args.spinLoop}
      ?readonly=${args.readOnly}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      <igc-icon slot="prefix" name="input_clear" @click=${clear}></igc-icon>
      <igc-icon slot="suffix" name="input_collapse" @click=${stepUp}></igc-icon>
      <igc-icon slot="suffix" name="input_expand" @click=${stepDown}></igc-icon>
      <p slot="helper-text">Sample helper text.</p>
    </igc-date-time-input>
  `,
};

export const Formats: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          '`inputFormat` controls the date mask applied while the user is typing; `displayFormat` controls how the committed value is shown when the field is not focused. The two formats can differ — for example a compact display format with a verbose input format.',
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem; max-width: 400px;"
    >
      <igc-date-time-input
        label="Date only (MM/dd/yyyy)"
        input-format="MM/dd/yyyy"
        display-format="MMMM d, yyyy"
        .value=${new Date()}
      >
        <p slot="helper-text">
          Display: MMMM d, yyyy &nbsp;|&nbsp; Input: MM/dd/yyyy
        </p>
      </igc-date-time-input>
      <igc-date-time-input
        label="Date &amp; time (24-hour)"
        input-format="yyyy-MM-dd HH:mm"
        display-format="yyyy-MM-dd HH:mm"
        .value=${new Date()}
      >
        <p slot="helper-text">ISO-style 24-hour format</p>
      </igc-date-time-input>
      <igc-date-time-input
        label="Time only (hh:mm tt)"
        input-format="hh:mm tt"
        display-format="h:mm a"
        .value=${new Date()}
      >
        <p slot="helper-text">Display: h:mm a &nbsp;|&nbsp; Input: hh:mm tt</p>
      </igc-date-time-input>
    </div>
  `,
};

export const MinMax: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `min` and `max` properties constrain the selectable date range. Entering a value outside the bounds marks the control as invalid and shows the `range-underflow` or `range-overflow` validation slot.',
      },
    },
  },
  render: () => {
    const min = new Date();
    min.setDate(min.getDate() - 7);
    const max = new Date();
    max.setDate(max.getDate() + 7);
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem; max-width: 400px;"
      >
        <igc-date-time-input
          label="Within valid range (±7 days from today)"
          input-format="MM/dd/yyyy"
          .value=${new Date()}
          .min=${min}
          .max=${max}
        >
          <p slot="helper-text">
            Valid range: ${min.toLocaleDateString()} –
            ${max.toLocaleDateString()}
          </p>
          <p slot="range-underflow">Date is before the minimum allowed date.</p>
          <p slot="range-overflow">Date is after the maximum allowed date.</p>
        </igc-date-time-input>
        <igc-date-time-input
          label="Out-of-range value (invalid)"
          input-format="MM/dd/yyyy"
          .value=${min}
          .min=${new Date()}
          .max=${max}
        >
          <p slot="helper-text">Intentionally set below the minimum.</p>
          <p slot="range-underflow">Date is before the minimum allowed date.</p>
        </igc-date-time-input>
      </div>
    `;
  },
};

export const Locales: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `locale` property is passed to `Intl.DateTimeFormat` and affects the display format when `displayFormat` is not explicitly set. Each locale renders the same date value according to its regional convention.',
      },
    },
  },
  render: () => {
    const value = new Date(2026, 0, 15, 14, 30);
    const locales = [
      { locale: 'en-US', label: 'English (US)' },
      { locale: 'de-DE', label: 'German (DE)' },
      { locale: 'ja-JP', label: 'Japanese (JP)' },
      { locale: 'fr-FR', label: 'French (FR)' },
    ];
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1.25rem; padding: 1rem; max-width: 400px;"
      >
        ${locales.map(
          ({ locale, label }) => html`
            <igc-date-time-input
              .label=${label}
              .locale=${locale}
              .value=${value}
            ></igc-date-time-input>
          `
        )}
      </div>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the date-time input inside an HTML `<form>`, covering default state, pre-filled value with custom formats, read-only, disabled fieldset, required validation, and `min`/`max` date constraints with custom messages.',
      },
    },
  },
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <igc-date-time-input
            label="Default state"
            name="datetime-default"
          ></igc-date-time-input>

          <igc-date-time-input
            label="Initial value"
            name="datetime-initial"
            value="2023-03-17T15:35"
            display-format="yyyy-MM-dd HH:mm"
            input-format="yyyy-MM-dd HH:mm"
          ></igc-date-time-input>

          <igc-date-time-input
            readonly
            label="Readonly"
            name="datetime-readonly"
            value="1987-07-17"
          ></igc-date-time-input>
        </fieldset>

        <fieldset disabled>
          <igc-date-time-input
            name="datetime-disabled"
            label="Disabled editor"
          ></igc-date-time-input>
        </fieldset>

        <fieldset>
          <igc-date-time-input
            required
            name="datetime-required"
            label="Required"
          >
            <p slot="value-missing">This field is required</p>
          </igc-date-time-input>

          <igc-date-time-input
            name="datetime-min"
            label="Minimum constraint (2023-03-17)"
            min="2023-03-17"
            value="2020-01-01"
          >
            <p slot="range-underflow">Date is outside of allowed range</p>
          </igc-date-time-input>

          <igc-date-time-input
            name="datetime-max"
            label="Maximum constraint (2023-04-17)"
            max="2023-04-17"
            value="2024-03-17"
          >
            <p slot="range-overflow">Date is outside of allowed range</p>
          </igc-date-time-input>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
