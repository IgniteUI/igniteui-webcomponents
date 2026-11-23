import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcNumberInputComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  type NumberInputFormatOptions,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  formSubmitHandler,
  plural,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconComponent,
  IgcNumberInputComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent
);

registerMaterialIcons('plus', 'minus');

// region default
const metadata: Meta<IgcNumberInputComponent> = {
  title: 'NumberInput',
  component: 'igc-number-input',
  parameters: {
    docs: {
      description: {
        component:
          'A single-line field for a number. It shows the value formatted for the\nlocale, reads what the user types in the locale, and steps the value with\nthe arrow keys, the spin buttons and the mouse wheel. It supports prefix and\nsuffix content, helper text, form integration and built-in validation.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'number',
      description:
        'The value of the control, or `null` when it is empty. A numeric string\nreads as `Number()` reads it. `NaN` and infinite values are `null`.',
      control: 'number',
    },
    min: {
      type: 'number',
      description:
        'The minimum value of the control. A numeric string reads as a number, and\na value that is not a finite number sets no minimum.',
      control: 'number',
    },
    max: {
      type: 'number',
      description:
        'The maximum value of the control. A numeric string reads as a number, and\na value that is not a finite number sets no maximum.',
      control: 'number',
    },
    step: {
      type: 'number',
      description:
        'The amount by which a step changes the value. A step does not snap to a\ngrid of steps. Default is `1`, or `0.01` for the `percent` style, also for\na value that is not a positive number. A numeric string reads as a number.',
      control: 'number',
    },
    hideSpinButtons: {
      type: 'boolean',
      description:
        'Whether the spin buttons are hidden. The keys and the mouse wheel still\nstep the value.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    validateOnly: {
      type: 'boolean',
      description:
        'Whether a value out of range only fails validation. The user can type it,\nand the commit does not clamp it. A step still stops at `min` and `max`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control has an outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Whether the control is read-only.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control receives focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autocomplete: {
      type: 'string',
      description: 'A hint for the browser on how to autofill the control.',
      control: 'text',
    },
    inputMode: {
      type: 'string',
      description:
        'A hint to the browser for which virtual keyboard layout to display. Default\nis `numeric` for a format without fraction digits and without negative\nvalues, else `decimal`.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale of the component. Without it, the component takes its own\n`lang`, else the locale of the nearest ancestor that has a `locale` (a\ncomponent) or a `lang`, and then the global locale.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description:
        'Whether the control is required. A required control that has no value,\nor is not checked, fails validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description:
        'Whether the control is disabled. A disabled control is not validated,\nand the form does not submit its value.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description:
        'Whether the control shows the invalid state. It changes only the visual\nstate, not the validity.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    hideSpinButtons: false,
    validateOnly: false,
    outlined: false,
    readOnly: false,
    autofocus: false,
    inputMode: '',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcNumberInputArgs {
  /**
   * The value of the control, or `null` when it is empty. A numeric string
   * reads as `Number()` reads it. `NaN` and infinite values are `null`.
   */
  value: number;
  /**
   * The minimum value of the control. A numeric string reads as a number, and
   * a value that is not a finite number sets no minimum.
   */
  min: number;
  /**
   * The maximum value of the control. A numeric string reads as a number, and
   * a value that is not a finite number sets no maximum.
   */
  max: number;
  /**
   * The amount by which a step changes the value. A step does not snap to a
   * grid of steps. Default is `1`, or `0.01` for the `percent` style, also for
   * a value that is not a positive number. A numeric string reads as a number.
   */
  step: number;
  /**
   * Whether the spin buttons are hidden. The keys and the mouse wheel still
   * step the value.
   */
  hideSpinButtons: boolean;
  /**
   * Whether a value out of range only fails validation. The user can type it,
   * and the commit does not clamp it. A step still stops at `min` and `max`.
   */
  validateOnly: boolean;
  /** Whether the control has an outlined appearance. */
  outlined: boolean;
  /** Whether the control is read-only. */
  readOnly: boolean;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
  /** Whether the control receives focus automatically. */
  autofocus: boolean;
  /** A hint for the browser on how to autofill the control. */
  autocomplete: string;
  /**
   * A hint to the browser for which virtual keyboard layout to display. Default
   * is `numeric` for a format without fraction digits and without negative
   * values, else `decimal`.
   */
  inputMode: string;
  /**
   * The locale of the component. Without it, the component takes its own
   * `lang`, else the locale of the nearest ancestor that has a `locale` (a
   * component) or a `lang`, and then the global locale.
   */
  locale: string;
  /**
   * Whether the control is required. A required control that has no value,
   * or is not checked, fails validation.
   */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /**
   * Whether the control is disabled. A disabled control is not validated,
   * and the form does not submit its value.
   */
  disabled: boolean;
  /**
   * Whether the control shows the invalid state. It changes only the visual
   * state, not the validity.
   */
  invalid: boolean;
}
type Story = StoryObj<IgcNumberInputArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ni-form {
      display: grid;
      gap: 1rem;
      width: min(100%, 36rem);
    }

    .ni-form :is(h3, p) {
      margin: 0;
    }

    .ni-form h3 {
      font-size: 1.125rem;
    }

    .ni-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .ni-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      gap: 1rem;
    }

    .ni-lines {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ni-lines li {
      display: grid;
      grid-template-columns: 1fr 7rem 9rem 7rem;
      align-items: center;
      gap: 1rem;
      padding-block: 0.75rem;
      border-block-end: 1px solid var(--ig-gray-300);
    }

    .ni-amount,
    .ni-totals dd {
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .ni-totals {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.25rem 1rem;
      margin: 0;
    }

    .ni-totals dd {
      margin: 0;
    }

    .ni-totals .ni-due {
      font-weight: 600;
    }

    .ni-page {
      box-sizing: border-box;
      width: 9rem;
      aspect-ratio: 210 / 297;
      border: 1px solid var(--ig-gray-400);
      background: var(--ig-surface-500);
    }

    .ni-page div {
      height: 100%;
      background: repeating-linear-gradient(
        var(--ig-gray-300) 0 2px,
        transparent 2px 8px
      );
    }

    @media (max-width: 36rem) {
      .ni-lines li {
        grid-template-columns: 1fr 1fr;
      }

      .ni-lines li > :first-child {
        grid-column: 1 / -1;
      }
    }
  </style>
`;

/** A formatter in the locale that the toolbar sets on the document. */
function pageLocaleFormat(
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  return new Intl.NumberFormat(document.documentElement.lang, options);
}

/** A handler that gives the detail of a number input event to `apply`, then renders the story again. */
function onDetail(
  story: { update(): void },
  apply: (detail: number | null) => void
) {
  return ({ detail }: CustomEvent<number | null>) => {
    apply(detail);
    story.update();
  };
}

const WHOLE_NUMBER: NumberInputFormatOptions = { maximumFractionDigits: 0 };

export const Default: Story = {
  args: {
    label: 'Order quantity',
    value: 1200,
    min: 1,
    max: 10000,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The quantity field of a wholesale order. The field shows the value in the format of the locale, with group separators, and reads what the user types in that locale. Select another locale in the toolbar to see the format change. On focus, the field shows the number without group separators, so that the user can edit it. The arrow keys, the spin buttons and the mouse wheel (while the field has the focus) step the value by `step`. Shift with an arrow key, and Page Up and Page Down, step ten times. Home and End go to `min` and `max`. Enter or a blur commits the value: it rounds to the fraction digits of the format and clamps to `min` and `max`, unless `validate-only` is set. Escape reverts the edit. Use the controls panel to change the range, the step and the states.',
      },
    },
  },
  render: (args) => html`
    <div style="width: min(100%, 18rem)">
      <igc-number-input
        label=${ifDefined(args.label)}
        name=${ifDefined(args.name)}
        placeholder=${ifDefined(args.placeholder)}
        value=${ifDefined(args.value)}
        min=${ifDefined(args.min)}
        max=${ifDefined(args.max)}
        step=${ifDefined(args.step)}
        locale=${ifDefined(args.locale)}
        autocomplete=${ifDefined(args.autocomplete)}
        inputmode=${ifDefined(args.inputMode)}
        ?autofocus=${args.autofocus}
        ?disabled=${args.disabled}
        ?hide-spin-buttons=${args.hideSpinButtons}
        ?invalid=${args.invalid}
        ?outlined=${args.outlined}
        ?readonly=${args.readOnly}
        ?required=${args.required}
        ?validate-only=${args.validateOnly}
      >
        <span slot="helper-text">Order 1 to 10,000 units.</span>
        <span slot="value-missing">Enter a quantity.</span>
        <span slot="range-underflow">Order 1 unit or more.</span>
        <span slot="range-overflow">Order 10,000 units or less.</span>
      </igc-number-input>
    </div>
  `,
};

const USD: NumberInputFormatOptions = { style: 'currency', currency: 'USD' };
const QUANTITY: NumberInputFormatOptions = { maximumFractionDigits: 2 };
const RATE: NumberInputFormatOptions = {
  style: 'percent',
  maximumFractionDigits: 2,
};

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number | null;
  /** The increment of the quantity: hours go in halves. */
  step: number;
  price: number | null;
}

const invoiceLines: InvoiceLine[] = [
  {
    id: 'logo',
    description: 'Logo design',
    quantity: 1,
    step: 1,
    price: 1200,
  },
  {
    id: 'pages',
    description: 'Landing pages',
    quantity: 4,
    step: 1,
    price: 450,
  },
  {
    id: 'support',
    description: 'Support hours',
    quantity: 6.5,
    step: 0.5,
    price: 85,
  },
];

export const Invoice: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          "An invoice editor. The unit price uses `valueFormatOptions` with `{ style: 'currency', currency: 'USD' }`, so it shows the dollar sign and two fraction digits. It has `hide-spin-buttons`, because a step of one dollar does not help to enter a price. Focus a price: the field shows `1200` for editing, and a paste of `$1,234.50` gives `1234.5`. The support hours step by `0.5`. The discount and the tax rate use the `percent` style: the value is a fraction, so `0.1` shows as 10%, the user types the percent number, and the default step is `0.01`, one percent. The totals follow `igcInput`, so they change while the user types. Select another locale in the toolbar: the fields and the totals change their format.",
      },
    },
  },
  render: () => {
    const lines = invoiceLines.map((line) => ({ ...line }));
    let discount: number | null = 0.1;
    let tax: number | null = 0.0825;

    const story = renderInto(() => {
      const amounts = lines.map(
        ({ quantity, price }) => (quantity ?? 0) * (price ?? 0)
      );
      const subtotal = amounts.reduce((sum, amount) => sum + amount, 0);
      const reduction = subtotal * (discount ?? 0);
      const taxed = (subtotal - reduction) * (tax ?? 0);
      const money = pageLocaleFormat(USD);

      return html`
        <div class="ni-form">
          <h3>Invoice INV-2041</h3>
          <ul class="ni-lines">
            ${lines.map(
              (line, index) => html`
                <li>
                  <strong>${line.description}</strong>
                  <igc-number-input
                    aria-label="Quantity of ${line.description}"
                    min="0"
                    step=${line.step}
                    .value=${line.quantity}
                    .valueFormatOptions=${QUANTITY}
                    @igcInput=${onDetail(story, (detail) => {
                      line.quantity = detail;
                    })}
                  ></igc-number-input>
                  <igc-number-input
                    aria-label="Unit price of ${line.description}"
                    min="0"
                    hide-spin-buttons
                    .value=${line.price}
                    .valueFormatOptions=${USD}
                    @igcInput=${onDetail(story, (detail) => {
                      line.price = detail;
                    })}
                  ></igc-number-input>
                  <span class="ni-amount">${money.format(amounts[index])}</span>
                </li>
              `
            )}
          </ul>
          <div class="ni-grid">
            <igc-number-input
              label="Discount"
              min="0"
              max="0.3"
              step="0.05"
              .value=${discount}
              .valueFormatOptions=${RATE}
              @igcInput=${onDetail(story, (detail) => {
                discount = detail;
              })}
            >
              <span slot="helper-text">Up to 30%, in steps of 5%.</span>
            </igc-number-input>
            <igc-number-input
              label="Tax rate"
              min="0"
              max="0.25"
              .value=${tax}
              .valueFormatOptions=${RATE}
              @igcInput=${onDetail(story, (detail) => {
                tax = detail;
              })}
            ></igc-number-input>
          </div>
          <dl class="ni-totals">
            <dt>Subtotal</dt>
            <dd>${money.format(subtotal)}</dd>
            <dt>Discount</dt>
            <dd>${money.format(-reduction)}</dd>
            <dt>Tax</dt>
            <dd>${money.format(taxed)}</dd>
            <dt class="ni-due">Total due</dt>
            <dd class="ni-due">
              ${money.format(subtotal - reduction + taxed)}
            </dd>
          </dl>
        </div>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

interface Currency {
  code: string;
  name: string;
  locale: string;
  /** A sample rate for one euro. */
  rate: number;
  format: NumberInputFormatOptions;
  /** The fraction digits of the currency. */
  digits: number;
}

function currency(
  code: string,
  name: string,
  locale: string,
  rate: number
): Currency {
  const format: NumberInputFormatOptions = {
    style: 'currency',
    currency: code,
  };
  const { maximumFractionDigits } = new Intl.NumberFormat(
    'en',
    format
  ).resolvedOptions();

  return { code, name, locale, rate, format, digits: maximumFractionDigits! };
}

const currencies = [
  currency('EUR', 'Euro', 'de-DE', 1),
  currency('USD', 'US dollar', 'en-US', 1.08),
  currency('CHF', 'Swiss franc', 'de-CH', 0.95),
  currency('JPY', 'Japanese yen', 'ja-JP', 162.4),
  currency('INR', 'Indian rupee', 'hi-IN-u-nu-deva', 90.1),
  currency('EGP', 'Egyptian pound', 'ar-EG', 52.6),
];

export const CurrencyConverter: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A currency converter with one field for each currency. Each field sets `locale`, so it shows and reads the amount as a user in that country writes it. The euro field reads `1.234,56`, because `.` is the German group separator. The Swiss franc field groups with an apostrophe. The yen has no fraction digits, so the yen field does not accept a decimal separator. The rupee field shows Devanagari digits from the `-u-nu-deva` locale extension, with Indian grouping, and the Egyptian pound field shows Arabic-Indic digits. Each field also accepts ASCII digits. Type in any field: the other fields follow `igcInput`. The rates are sample values.',
      },
    },
  },
  render: () => {
    let euros: number | null = 100;
    let source = 'EUR';
    let typed: number | null = euros;

    const convert = ({ code, rate, digits }: Currency) =>
      code === source
        ? typed
        : euros === null
          ? null
          : Number((euros * rate).toFixed(digits));

    const read = (currency: Currency) =>
      onDetail(story, (value) => {
        source = currency.code;
        typed = value;
        euros = value === null ? null : value / currency.rate;
      });

    const story = renderInto(
      () => html`
        <div class="ni-form">
          <h3>Convert an amount</h3>
          <div class="ni-grid">
            ${currencies.map((currency) => {
              const handler = read(currency);

              return html`
                <igc-number-input
                  label="${currency.name} (${currency.code})"
                  locale=${currency.locale}
                  min="0"
                  .value=${convert(currency)}
                  .valueFormatOptions=${currency.format}
                  @igcInput=${handler}
                  @igcChange=${handler}
                ></igc-number-input>
              `;
            })}
          </div>
          <p class="muted">Sample rates, not for trading.</p>
        </div>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const KILOGRAMS: NumberInputFormatOptions = {
  style: 'unit',
  unit: 'kilogram',
  maximumFractionDigits: 1,
};
const CENTIMETERS: NumberInputFormatOptions = {
  style: 'unit',
  unit: 'centimeter',
  maximumFractionDigits: 0,
};

/** The volumetric divisor of the carrier, in cubic centimeters per kilogram. */
const VOLUMETRIC_DIVISOR = 5000;

const PARCEL_WEIGHT = 2.5;

const parcelSides = [
  { name: 'length', label: 'Length', value: 40 },
  { name: 'width', label: 'Width', value: 30 },
  { name: 'height', label: 'Height', value: 20 },
];

export const ShippingParcel: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The parcel step of a shipping form. The weight uses the `unit` style with `kilogram` and one fraction digit, and the sides use `centimeter` without fraction digits. The weight has `max="30"` with `validate-only`: the field does not clamp a heavier parcel, and the `range-overflow` slot tells the user to book a freight pickup. The message slots show after an edit or a submit. The sides have no `validate-only`, so a side above 120 cm clamps to 120 on commit. The billable weight is the larger of the weight and the volume divided by 5000, and it follows `igcInput`. "Create label" shows the form data: the form value is the plain number, such as `2.5`, not the display text. Clear a field and select "Create label": the form does not submit, and the focus moves to the first invalid field. "Reset" restores the `value` attributes.',
      },
    },
  },
  render: () => {
    const sizes = new Map<string, number | null>();
    let weight: number | null = null;

    /** Takes the values of the `value` attributes, as a form reset does. */
    const reset = () => {
      for (const { name, value } of parcelSides) {
        sizes.set(name, value);
      }
      weight = PARCEL_WEIGHT;
    };

    reset();

    const story = renderInto(() => {
      const sides = [...sizes.values()];
      const volumetric = sides.every((side) => side !== null)
        ? sides.reduce((product, side) => product * side, 1) /
          VOLUMETRIC_DIVISOR
        : null;
      const billable =
        weight === null || volumetric === null
          ? null
          : Math.max(weight, volumetric);

      return html`
        <form
          class="ni-form"
          @submit=${formSubmitHandler}
          @reset=${() => {
            reset();
            story.update();
          }}
        >
          <h3>Parcel</h3>
          <igc-number-input
            name="weight"
            label="Weight"
            value=${PARCEL_WEIGHT}
            min="0.1"
            max="30"
            step="0.5"
            required
            validate-only
            .valueFormatOptions=${KILOGRAMS}
            @igcInput=${onDetail(story, (detail) => {
              weight = detail;
            })}
          >
            <span slot="helper-text">Up to 30 kg for a standard parcel.</span>
            <span slot="value-missing">Enter the weight of the parcel.</span>
            <span slot="range-underflow">Enter 0.1 kg or more.</span>
            <span slot="range-overflow">
              Parcels over 30 kg ship as freight. Split the parcel, or book a
              freight pickup.
            </span>
          </igc-number-input>
          <div class="ni-grid">
            ${parcelSides.map(
              ({ name, label, value }) => html`
                <igc-number-input
                  name=${name}
                  label=${label}
                  value=${value}
                  min="1"
                  max="120"
                  required
                  .valueFormatOptions=${CENTIMETERS}
                  @igcInput=${onDetail(story, (detail) => {
                    sizes.set(name, detail);
                  })}
                >
                  <span slot="value-missing">Enter the ${name}.</span>
                </igc-number-input>
              `
            )}
          </div>
          <igc-number-input
            name="declared-value"
            label="Declared value"
            min="0"
            max="5000"
            hide-spin-buttons
            .valueFormatOptions=${USD}
          >
            <span slot="helper-text">
              Optional. Without a value, the parcel has a cover of $100.
            </span>
          </igc-number-input>
          <p role="status">
            Billable weight:
            ${billable === null ? '—' : pageLocaleFormat(KILOGRAMS).format(billable)}
          </p>
          <div class="ni-row">
            <igc-button type="submit">Create label</igc-button>
            <igc-button type="reset" variant="flat">Reset</igc-button>
          </div>
        </form>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

/** The number of guests that a room sleeps. */
const ROOM_CAPACITY = 4;

export const RoomGuests: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The guest picker of a hotel booking. A room sleeps four guests, so the `max` of each field is four minus the other field: with three adults, the children field stops at 1, and its increment button is disabled. The fields set `max` from `igcChange`, the committed value, so a typed number does not change the other field before the commit clamps it. The `increment-icon` and `decrement-icon` slots replace the arrows with plus and minus icons. Hold a spin button to repeat the step. The format has no fraction digits and `min` is 0 or more, so a phone shows the numeric keyboard.',
      },
    },
  },
  render: () => {
    const committed = { adults: 2, children: 1 };
    const shown = { ...committed };

    const field = (
      key: keyof typeof committed,
      label: string,
      min: number,
      helper: string
    ) => {
      const other = key === 'adults' ? 'children' : 'adults';

      return html`
        <igc-number-input
          outlined
          label=${label}
          min=${min}
          max=${ROOM_CAPACITY - committed[other]}
          .value=${committed[key]}
          .valueFormatOptions=${WHOLE_NUMBER}
          @igcInput=${onDetail(story, (detail) => {
            shown[key] = detail ?? min;
          })}
          @igcChange=${onDetail(story, (detail) => {
            committed[key] = shown[key] = detail ?? min;
          })}
        >
          <igc-icon slot="increment-icon" name="plus"></igc-icon>
          <igc-icon slot="decrement-icon" name="minus"></igc-icon>
          <span slot="helper-text">${helper}</span>
        </igc-number-input>
      `;
    };

    const story = renderInto(
      () => html`
        <div class="ni-form" style="width: min(100%, 24rem)">
          <h3>Who is staying?</h3>
          <div class="ni-grid">
            ${field('adults', 'Adults', 1, 'Age 13 or above')}
            ${field('children', 'Children', 0, 'Age 2 to 12')}
          </div>
          <p class="muted">
            ${plural(shown.adults, 'adult')},
            ${plural(shown.children, 'child', 'children')} in one room.
          </p>
        </div>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type MarginUnit = 'millimeter' | 'inch';

const marginUnits: Record<
  MarginUnit,
  {
    format: NumberInputFormatOptions;
    step: number;
    max: number;
    /** The size of the unit in millimeters. */
    mm: number;
  }
> = {
  millimeter: {
    format: { style: 'unit', unit: 'millimeter', maximumFractionDigits: 1 },
    step: 1,
    max: 50,
    mm: 1,
  },
  inch: {
    format: { style: 'unit', unit: 'inch', maximumFractionDigits: 2 },
    step: 0.05,
    max: 2,
    mm: 25.4,
  },
};

const SCALE: NumberInputFormatOptions = { style: 'percent' };

export const PrintSettings: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The print dialog of a document editor. The margins change their format with the unit: millimeters step by 1 with one fraction digit, and inches step by 0.05 with two. The story converts the values when the user selects another unit, and the fields show them in the new format. The scale is a percent from 25% to 400% that steps by 5%. The copies field takes whole numbers. Use the keys in a field: an arrow key steps once, Shift with an arrow key and Page Up and Page Down step ten times, and Home and End go to the bounds. The mouse wheel steps the value while the field has the focus, so a scroll of the page does not change a field by accident. The page preview follows `igcInput`.',
      },
    },
  },
  render: () => {
    let unit: MarginUnit = 'millimeter';
    /** The margins in millimeters, for the preview and the unit changes. */
    const margins = { vertical: 20, horizontal: 15 };
    /**
     * The margins in the selected unit, as the fields hold them. A binding of
     * a value converted back from millimeters would round the text that the
     * user types.
     */
    const shown: Record<keyof typeof margins, number | null> = { ...margins };

    const changeUnit = (next: MarginUnit) => {
      unit = next;

      const { format, mm } = marginUnits[unit];

      for (const key of ['vertical', 'horizontal'] as const) {
        shown[key] = Number(
          (margins[key] / mm).toFixed(format.maximumFractionDigits)
        );
      }

      story.update();
    };

    const margin = (key: keyof typeof margins, label: string) => {
      const { format, step, max } = marginUnits[unit];

      return html`
        <igc-number-input
          label=${label}
          min="0"
          max=${max}
          step=${step}
          .value=${shown[key]}
          .valueFormatOptions=${format}
          @igcInput=${onDetail(story, (detail) => {
            // An empty field stays empty; the preview takes it as no margin.
            shown[key] = detail;
            margins[key] = (detail ?? 0) * marginUnits[unit].mm;
          })}
        ></igc-number-input>
      `;
    };

    const story = renderInto(() => {
      // An A4 page is 210 mm wide, and a percent padding is a share of the width.
      const padding = `${(margins.vertical / 210) * 100}% ${(margins.horizontal / 210) * 100}%`;

      return html`
        <div class="ni-form">
          <h3>Print</h3>
          <div class="ni-grid">
            <igc-number-input
              label="Copies"
              value="1"
              min="1"
              max="999"
              .valueFormatOptions=${WHOLE_NUMBER}
            ></igc-number-input>
            <igc-number-input
              label="Scale"
              value="1"
              min="0.25"
              max="4"
              step="0.05"
              .valueFormatOptions=${SCALE}
            ></igc-number-input>
          </div>
          <igc-radio-group
            alignment="horizontal"
            name="unit"
            value=${unit}
            aria-labelledby="ni-unit-label"
            @igcChange=${(event: Event) =>
              changeUnit(
                (event.currentTarget as IgcRadioGroupComponent)
                  .value as MarginUnit
              )}
          >
            <label id="ni-unit-label">Margin unit</label>
            <igc-radio value="millimeter">Millimeters</igc-radio>
            <igc-radio value="inch">Inches</igc-radio>
          </igc-radio-group>
          <div class="ni-row" style="align-items: start; gap: 1.5rem">
            <div class="ni-grid" style="flex: 1">
              ${margin('vertical', 'Top and bottom margins')}
              ${margin('horizontal', 'Left and right margins')}
            </div>
            <div class="ni-page" style="padding: ${padding}" aria-hidden="true">
              <div></div>
            </div>
          </div>
        </div>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
