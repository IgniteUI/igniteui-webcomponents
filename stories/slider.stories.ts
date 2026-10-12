import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcSliderComponent,
  IgcSliderLabelComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  dollars,
  formSubmitHandler,
  plural,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcSliderComponent,
  IgcSliderLabelComponent,
  IgcSwitchComponent
);
registerMaterialIcons('minus', 'plus');

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
      description: 'The name of the control, submitted with the form data.',
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
        'The minimum value of the slider scale. Defaults to 0.\n\nIf `min` is greater than `max`, the update keeps the previous `min`. The\nupdate checks the values after all of them are set, so the order of the\nattributes has no effect.\n\nIf `labels` are provided (projected), then `min` is always 0.\n\nIf `lowerBound` is less than `min`, the slider uses `min` as the lower bound.',
      control: 'number',
    },
    max: {
      type: 'number',
      description:
        'The maximum value of the slider scale. Defaults to 100.\n\nIf `max` is less than `min`, the update keeps the previous `max`. The\nupdate checks the values after all of them are set, so the order of the\nattributes has no effect.\n\nIf `labels` are provided (projected), then `max` is always the number of\nlabels minus one.\n\nIf `upperBound` is greater than `max`, the slider uses `max` as the upper bound.',
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
        'Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuous even if `discreteTrack` is `true`.',
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
        'Specifies the granularity that the value must adhere to.\n\nIf set to 0 no stepping is implied and any value in the range is allowed.\nA negative step is not valid, so the previous step stays.\nIf `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
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
      type: { name: 'enum', value: ['start', 'end', 'mirror'] },
      description: 'Changes the orientation of the ticks.',
      options: ['start', 'end', 'mirror'],
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
      type: { name: 'enum', value: [0, 90, -90] },
      description:
        'The degrees for the rotation of the tick labels. Defaults to 0.',
      options: [0, 90, -90],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: {
    disabled: false,
    invalid: false,
    discreteTrack: false,
    hideTooltip: false,
    step: 1,
    primaryTicks: 0,
    secondaryTicks: 0,
    tickOrientation: 'end',
    hidePrimaryLabels: false,
    hideSecondaryLabels: false,
    locale: 'en',
    tickLabelRotation: 0,
  },
};

export default metadata;

interface IgcSliderArgs {
  /** The current value of the component. */
  value: number;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /**
   * The minimum value of the slider scale. Defaults to 0.
   *
   * If `min` is greater than `max`, the update keeps the previous `min`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `min` is always 0.
   *
   * If `lowerBound` is less than `min`, the slider uses `min` as the lower bound.
   */
  min: number;
  /**
   * The maximum value of the slider scale. Defaults to 100.
   *
   * If `max` is less than `min`, the update keeps the previous `max`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `max` is always the number of
   * labels minus one.
   *
   * If `upperBound` is greater than `max`, the slider uses `max` as the upper bound.
   */
  max: number;
  /** The lower bound of the slider value. If not set, the `min` value is applied. */
  lowerBound: number;
  /** The upper bound of the slider value. If not set, the `max` value is applied. */
  upperBound: number;
  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuous even if `discreteTrack` is `true`.
   */
  discreteTrack: boolean;
  /** Hides the thumb tooltip. */
  hideTooltip: boolean;
  /**
   * Specifies the granularity that the value must adhere to.
   *
   * If set to 0 no stepping is implied and any value in the range is allowed.
   * A negative step is not valid, so the previous step stays.
   * If `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.
   */
  step: number;
  /** The number of primary ticks. It defaults to 0 which means no primary ticks are displayed. */
  primaryTicks: number;
  /** The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed. */
  secondaryTicks: number;
  /** Changes the orientation of the ticks. */
  tickOrientation: 'start' | 'end' | 'mirror';
  /** Hides the primary tick labels. */
  hidePrimaryLabels: boolean;
  /** Hides the secondary tick labels. */
  hideSecondaryLabels: boolean;
  /** The locale used to format the thumb and tick label values in the slider. */
  locale: string;
  /** String format used for the thumb and tick label values in the slider. */
  valueFormat: string;
  /** The degrees for the rotation of the tick labels. Defaults to 0. */
  tickLabelRotation: 0 | 90 | -90;
}
type Story = StoryObj<IgcSliderArgs>;

// endregion

// A drag sends `igcInput` on each move, and the actions panel slows the page down.
metadata.parameters = { ...metadata.parameters, actions: { disable: true } };

const styles = html`
  ${storyStyles}
  <style>
    .sl-stack {
      display: grid;
      gap: 1.5rem;
      max-width: 40rem;
    }

    .sl-stack :is(h3, p, dl) {
      margin: 0;
    }

    .sl-panel {
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .sl-field {
      display: grid;
      gap: 0.25rem;
    }

    .sl-field > label {
      font-weight: 600;
    }

    /* The labels at the ends of the track reach past the box of the slider. */
    .sl-panel igc-slider[primary-ticks] {
      margin-inline: 1.5rem;
    }

    .sl-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .sl-summary {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.25rem 1rem;
    }

    .sl-summary dd {
      margin: 0;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .sl-summary :nth-last-child(-n + 2) {
      font-weight: 600;
    }
  </style>
`;

export const Default: Story = {
  args: {
    value: 60,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The volume of a media player. A `label` element with `for` names the thumb, and a click on the label focuses the thumb. Drag the thumb, click the track, or use the arrow keys, Page Up, Page Down, Home and End. The label above the thumb shows the value while you hover or drag the thumb and while the thumb has the keyboard focus. Escape hides it. Use the controls panel to change the scale, the step, the bounds, the ticks and the format of the values.',
      },
    },
  },
  render: (args) => html`
    <style>
      .sl-default {
        display: grid;
        gap: 0.5rem;
        max-width: 30rem;
        padding-block-start: 3rem;
      }
    </style>
    <div class="sl-default">
      <label for="sl-volume">Volume</label>
      <igc-slider
        id="sl-volume"
        .name=${args.name}
        .value=${args.value}
        .invalid=${args.invalid}
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
      ></igc-slider>
    </div>
  `,
};

const usd: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
};

const oneDecimal: Intl.NumberFormatOptions = {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
};

const loanYears = [1, 2, 3, 4, 5, 6, 7];
const loanTerms = loanYears.map((years) => plural(years, 'year'));

/** The monthly payment of a loan with a fixed annual `rate` in percent. */
function monthlyPayment(amount: number, months: number, rate: number) {
  const monthly = rate / 1200;

  return monthly
    ? (amount * monthly) / (1 - (1 + monthly) ** -months)
    : amount / months;
}

export const LoanCalculator: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A loan calculator. The amount slider formats its values as US dollars with `valueFormatOptions`, and the thumb label and the tick labels use the same format. The term slider has an `igc-slider-label` for each term: the value is the index of the label, and the thumb label, the tick labels and `aria-valuetext` show the text of the label. The rate slider uses `value-format="{0}%"`, and `valueFormatOptions` sets one decimal. The `igcInput` event updates the payment while you drag a thumb.',
      },
    },
  },
  render: () => {
    const loan = { amount: 25000, term: 4, rate: 6.5 };

    const set =
      (key: keyof typeof loan) =>
      ({ detail }: CustomEvent<number>) => {
        loan[key] = detail;
        update();
      };

    const { mount, update } = renderInto(() => {
      const months = loanYears[loan.term] * 12;
      const payment = monthlyPayment(loan.amount, months, loan.rate);
      const total = payment * months;

      return html`
        <dt>Monthly payment</dt>
        <dd class="sl-payment">${dollars.format(payment)}</dd>
        <dt>Total interest</dt>
        <dd>${dollars.format(total - loan.amount)}</dd>
        <dt>Total cost</dt>
        <dd>${dollars.format(total)}</dd>
      `;
    });

    return html`
      ${styles}
      <style>
        .sl-payment {
          font-size: 1.5rem;
        }
      </style>
      <section class="sl-stack sl-panel" aria-labelledby="sl-loan-title">
        <h3 id="sl-loan-title">Personal loan</h3>
        <div class="sl-field">
          <label for="sl-amount">Amount</label>
          <igc-slider
            id="sl-amount"
            min="5000"
            max="50000"
            step="500"
            value="25000"
            primary-ticks="4"
            .valueFormatOptions=${usd}
            @igcInput=${set('amount')}
          ></igc-slider>
        </div>
        <div class="sl-field">
          <label for="sl-term">Term</label>
          <igc-slider
            id="sl-term"
            value="4"
            primary-ticks="1"
            discrete-track
            @igcInput=${set('term')}
          >
            ${loanTerms.map(
              (term) => html`<igc-slider-label>${term}</igc-slider-label>`
            )}
          </igc-slider>
        </div>
        <div class="sl-field">
          <label for="sl-rate">Interest rate</label>
          <igc-slider
            id="sl-rate"
            min="1"
            max="15"
            step="0.1"
            value="6.5"
            primary-ticks="3"
            value-format="{0}%"
            .valueFormatOptions=${oneDecimal}
            @igcInput=${set('rate')}
          ></igc-slider>
        </div>
        <dl class="sl-summary" ${mount}></dl>
      </section>
    `;
  },
};

const celsius: Intl.NumberFormatOptions = {
  style: 'unit',
  unit: 'celsius',
  maximumFractionDigits: 1,
};

const formatCelsius = new Intl.NumberFormat('en', celsius);

export const Thermostat: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The thermostat of a smart home app. The scale shows 10 to 30 °C, and `step="0.5"` sets half degrees. The heating cannot go below 16 °C or above 28 °C, so `lower-bound` and `upper-bound` stop the thumb there, while the track still shows the whole scale. Eco mode sets `upperBound` to 22 °C, and the slider moves a higher value down to the bound. The minus and plus buttons call `stepDown()` and `stepUp()`. These methods send no event, so the buttons read `value` after the call.',
      },
    },
  },
  render: () => {
    let slider: IgcSliderComponent | undefined;

    const { mount, update } = renderInto(() =>
      formatCelsius.format(slider?.value ?? 21)
    );

    const step = (method: 'stepUp' | 'stepDown') => () => {
      slider?.[method]();
      update();
    };

    const toggleEco = async (event: CustomEvent) => {
      if (!slider) {
        return;
      }

      slider.upperBound = (event.target as IgcSwitchComponent).checked
        ? 22
        : 28;
      await slider.updateComplete;
      update();
    };

    return html`
      ${styles}
      <style>
        .sl-reading {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .sl-reading strong {
          font-size: 2rem;
          font-variant-numeric: tabular-nums;
        }

        .sl-thermostat-row {
          flex-wrap: nowrap;
        }

        .sl-thermostat-row igc-slider {
          flex: 1;
        }
      </style>
      <section class="sl-stack sl-panel" aria-labelledby="sl-room">
        <h3 id="sl-room">Living room</h3>
        <div class="sl-reading">
          <label for="sl-target">Target temperature</label>
          <strong ${mount}></strong>
        </div>
        <div class="sl-row sl-thermostat-row">
          <igc-icon-button
            variant="flat"
            name="minus"
            aria-label="Lower the target temperature"
            @click=${step('stepDown')}
          ></igc-icon-button>
          <igc-slider
            id="sl-target"
            min="10"
            max="30"
            step="0.5"
            value="21"
            lower-bound="16"
            upper-bound="28"
            primary-ticks="5"
            secondary-ticks="4"
            hide-secondary-labels
            .valueFormatOptions=${celsius}
            @igcInput=${update}
            ${ref((element) => {
              slider = element as IgcSliderComponent | undefined;
              update();
            })}
          ></igc-slider>
          <igc-icon-button
            variant="flat"
            name="plus"
            aria-label="Raise the target temperature"
            @click=${step('stepUp')}
          ></igc-icon-button>
        </div>
        <div class="sl-field">
          <igc-switch @igcChange=${toggleEco}>Eco mode</igc-switch>
          <p class="muted">Eco mode limits the target temperature to 22 °C.</p>
        </div>
      </section>
    `;
  },
};

const images = 'https://www.infragistics.com/angular-demos-lob/assets/images';

const adjustments = [
  { id: 'brightness', label: 'Brightness', filter: 'brightness' },
  { id: 'contrast', label: 'Contrast', filter: 'contrast' },
  { id: 'saturation', label: 'Saturation', filter: 'saturate' },
];

const signed: Intl.NumberFormatOptions = { signDisplay: 'exceptZero' };

export const PhotoAdjustments: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The adjustments panel of a photo editor. Each slider goes from -100 to 100, and 0 keeps the original photo. `valueFormatOptions` with `signDisplay: "exceptZero"` adds a plus sign to the positive values. The `igcInput` event applies a CSS filter while you drag a thumb. Reset sets `value` to 0 from code, which sends no event, so Reset applies the filter itself.',
      },
    },
  },
  render: () => {
    const root = createRef<HTMLElement>();

    const apply = () => {
      const image = root.value?.querySelector('img');

      if (!image) {
        return;
      }

      image.style.filter = adjustments
        .map(({ id, filter }) => {
          const slider = root.value!.querySelector<IgcSliderComponent>(
            `#sl-photo-${id}`
          )!;
          return `${filter}(${1 + slider.value / 100})`;
        })
        .join(' ');
    };

    const reset = () => {
      for (const slider of root.value?.querySelectorAll('igc-slider') ?? []) {
        slider.value = 0;
      }
      apply();
    };

    return html`
      ${styles}
      <style>
        .sl-photo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
          align-items: start;
          gap: 1.5rem;
          max-width: 52rem;
        }

        .sl-photo img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border-radius: 8px;
        }
      </style>
      <section
        class="sl-photo sl-panel"
        aria-label="Photo editor"
        @igcInput=${apply}
        ${ref(root)}
      >
        <img
          src="${images}/card/media/yosemite.jpg"
          alt="Snow on the pine trees and the granite cliffs of Yosemite Valley"
        />
        <div class="sl-stack">
          <h3>Adjust</h3>
          ${adjustments.map(
            ({ id, label }) => html`
              <div class="sl-field">
                <label for="sl-photo-${id}">${label}</label>
                <igc-slider
                  id="sl-photo-${id}"
                  min="-100"
                  max="100"
                  value="0"
                  primary-ticks="3"
                  .valueFormatOptions=${signed}
                ></igc-slider>
              </div>
            `
          )}
          <div>
            <igc-button variant="outlined" @click=${reset}>Reset</igc-button>
          </div>
        </div>
      </section>
    `;
  },
};

const seatPrice = 12;
const storagePrice = 5;

export const TeamPlan: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The plan of a team workspace in a form. Each slider has a `name`, so the form data has its value. The team has 4 members, so `lower-bound="4"` stops the seats at 4, while the scale starts at 0. A slider has no validation messages, so the helper text explains the limit, and the `aria-describedby` of the host describes the thumb. The `value` attribute is the default value, so Reset moves the thumbs back. Submit shows the form data.',
      },
    },
  },
  render: () => {
    const defaults = { seats: 8, storage: 200 };
    let plan = { ...defaults };

    const set =
      (key: keyof typeof plan) =>
      ({ detail }: CustomEvent<number>) => {
        plan = { ...plan, [key]: detail };
        update();
      };

    const reset = () => {
      plan = { ...defaults };
      update();
    };

    const { mount, update } = renderInto(() => {
      const seats = plan.seats * seatPrice;
      const storage = ((plan.storage - 100) / 100) * storagePrice;

      return html`
        <dt>${plan.seats} seats at ${dollars.format(seatPrice)}</dt>
        <dd>${dollars.format(seats)}</dd>
        <dt>Extra storage</dt>
        <dd>${dollars.format(storage)}</dd>
        <dt>Total per month</dt>
        <dd>${dollars.format(seats + storage)}</dd>
      `;
    });

    return html`
      ${styles}
      <form
        class="sl-stack sl-panel"
        aria-labelledby="sl-plan-title"
        @submit=${formSubmitHandler}
        @reset=${reset}
      >
        <h3 id="sl-plan-title">Team plan</h3>
        <div class="sl-field">
          <label for="sl-seats">Seats</label>
          <igc-slider
            id="sl-seats"
            name="seats"
            max="50"
            value="8"
            lower-bound="4"
            primary-ticks="6"
            secondary-ticks="1"
            aria-describedby="sl-seats-help"
            @igcInput=${set('seats')}
          ></igc-slider>
          <p id="sl-seats-help" class="muted">
            Your team has 4 members, so the plan needs at least 4 seats.
          </p>
        </div>
        <div class="sl-field">
          <label for="sl-storage">Storage</label>
          <igc-slider
            id="sl-storage"
            name="storage"
            min="100"
            max="1000"
            step="100"
            value="200"
            value-format="{0} GB"
            primary-ticks="4"
            aria-describedby="sl-storage-help"
            @igcInput=${set('storage')}
          ></igc-slider>
          <p id="sl-storage-help" class="muted">
            100 GB is free. Each 100 GB more costs
            ${dollars.format(storagePrice)} a month.
          </p>
        </div>
        <dl class="sl-summary" ${mount}></dl>
        <div class="sl-row">
          <igc-button type="submit">Update the plan</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
      </form>
    `;
  },
};
