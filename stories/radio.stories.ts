import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  type IgcRadioChangeEventArgs,
  IgcRadioComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  dollars,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcInputComponent,
  IgcRadioComponent
);
registerMaterialIcons('delete');

// region default
const metadata: Meta<IgcRadioComponent> = {
  title: 'Radio',
  component: 'igc-radio',
  parameters: {
    docs: {
      description: {
        component:
          'The radio component allows the user to select a single option from an available set of options that are listed side by side.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelPosition: {
      type: { name: 'enum', value: ['after', 'before'] },
      description: 'The label position of the radio control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
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
  },
  args: {
    required: false,
    checked: false,
    labelPosition: 'after',
    disabled: false,
    invalid: false,
  },
};

export default metadata;

interface IgcRadioArgs {
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The value of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the radio control. */
  labelPosition: 'after' | 'before';
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcRadioArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .rd-stack {
      display: grid;
      gap: 1rem;
      max-width: 36rem;
    }

    .rd-stack :is(h3, p, ul, dl) {
      margin: 0;
    }

    .rd-panel {
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .rd-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .rd-stack fieldset {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      border: 0;
    }

    .rd-stack legend {
      margin-block-end: 0.5rem;
      padding: 0;
      font-weight: 600;
    }
  </style>
`;

export const Default: Story = {
  args: {
    name: 'delivery',
    value: 'express',
  },
  parameters: {
    docs: {
      description: {
        story:
          'One delivery option of a checkout. The content between the tags is the label, and a click on the label checks the radio. The `helper-text` slot describes the option, and the radio links it to the native input as its description. A click does not clear a radio: a radio clears when the user checks another radio with the same `name`. Use the controls panel to change the state. `invalid` sets only the invalid style, and `required` adds the validation.',
      },
    },
  },
  render: (args) => html`
    <igc-radio
      .labelPosition=${args.labelPosition}
      .name=${args.name}
      .value=${args.value}
      ?disabled=${args.disabled}
      ?checked=${args.checked}
      ?required=${args.required}
      ?invalid=${args.invalid}
    >
      Express delivery
      <span slot="helper-text">Arrives tomorrow for $9.99.</span>
    </igc-radio>
  `,
};

const deliveryOptions = [
  {
    value: 'standard',
    label: 'Standard',
    price: 0,
    details: 'Arrives in 3 to 5 business days.',
  },
  {
    value: 'express',
    label: 'Express',
    price: 9.99,
    details: 'Arrives tomorrow when you order before 6 PM.',
  },
  {
    value: 'same-day',
    label: 'Same day',
    price: 19.99,
    details: 'Not available for your postcode.',
    disabled: true,
  },
  {
    value: 'pickup',
    label: 'Pick up in the store',
    price: 0,
    details: 'Ready in 2 hours at 12 Main Street.',
  },
];

const subtotal = 84;
const priceOf = (price: number) => (price ? dollars.format(price) : 'Free');

export const DeliveryOptions: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The delivery step of a checkout. The radios have no group element: the radios with the same `name` in the same form are one group, and the `fieldset` with its `legend` names the group for a screen reader. Only one radio of the group is a tab stop, and the arrow keys check the next radio. The arrow keys skip the disabled "Same day" option. Each option is a card: a style on the host draws the border, and a style on the `label` part puts the price at the end of the row. The `igcChange` event updates the order total. Continue shows the form data.',
      },
    },
  },
  render: () => {
    let selected = 'standard';

    const choose = ({ detail }: CustomEvent<IgcRadioChangeEventArgs>) => {
      selected = detail.value!;
      update();
    };

    const { mount, update } = renderInto(() => {
      const { price } = deliveryOptions.find(
        ({ value }) => value === selected
      )!;

      return html`
        <fieldset class="rd-options" @igcChange=${choose}>
          <legend>Delivery</legend>
          ${deliveryOptions.map(
            (option) => html`
              <igc-radio
                class=${option.value === selected ? 'rd-selected' : ''}
                name="delivery"
                value=${option.value}
                ?checked=${option.value === 'standard'}
                ?disabled=${option.disabled}
              >
                ${option.label}
                <span>${priceOf(option.price)}</span>
                <span slot="helper-text">${option.details}</span>
              </igc-radio>
            `
          )}
        </fieldset>
        <dl class="rd-summary">
          <dt>Subtotal</dt>
          <dd>${dollars.format(subtotal)}</dd>
          <dt>Delivery</dt>
          <dd>${priceOf(price)}</dd>
          <dt>Total</dt>
          <dd>${dollars.format(subtotal + price)}</dd>
        </dl>
        <div>
          <igc-button type="submit">Continue to payment</igc-button>
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .rd-options igc-radio {
          padding: 0.25rem 1rem 0.5rem 0.25rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .rd-options igc-radio.rd-selected {
          border-color: var(--ig-primary-500);
          box-shadow: inset 0 0 0 1px var(--ig-primary-500);
        }

        .rd-options igc-radio::part(label) {
          display: flex;
          flex: 1;
          justify-content: space-between;
          gap: 1rem;
        }

        .rd-summary {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.25rem 0;
        }

        .rd-summary dd {
          margin: 0;
          text-align: end;
        }

        .rd-summary :nth-last-child(-n + 2) {
          padding-block-start: 0.5rem;
          border-block-start: 1px solid var(--ig-gray-300);
          font-weight: 600;
        }
      </style>
      <form
        class="rd-stack rd-panel"
        aria-label="Checkout"
        @submit=${formSubmitHandler}
        ${mount}
      ></form>
    `;
  },
};

const addresses = [
  {
    id: 'home',
    name: 'Home',
    lines: ['Maya Patel', '12 Main Street', 'Springfield, IL 62701'],
  },
  {
    id: 'office',
    name: 'Office',
    lines: [
      'Maya Patel, Northwind Traders',
      '400 Market Street, Floor 9',
      'Chicago, IL 60606',
    ],
  },
  {
    id: 'parents',
    name: 'Parents',
    lines: ['Anita and Raj Patel', '7 Oak Avenue', 'Madison, WI 53703'],
  },
];

export const SavedAddresses: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The address book of an online shop. The checked radio is the default delivery address. The radios have no slotted label: the `aria-labelledby` of a radio points to the name of the address, its `aria-describedby` points to the address lines, and the radio resolves the IDs from the light DOM. A `label` element with `for` holds the text of the card, so a click on the text checks the radio too. The host `aria-labelledby` comes before the `label` element in the name, so the name stays short. When you remove the default address, no radio is checked, and each radio is a tab stop until you choose a new default.',
      },
    },
  },
  render: () => {
    let items = [...addresses];
    let defaultId: string | undefined = 'home';
    let message = '';

    const nameOf = (id?: string) =>
      addresses.find((address) => address.id === id)?.name;

    const choose = ({ detail }: CustomEvent<IgcRadioChangeEventArgs>) => {
      defaultId = detail.value;
      message = `${nameOf(defaultId)} is your default address now.`;
      update();
    };

    const remove = (id: string) => () => {
      items = items.filter((address) => address.id !== id);
      message = `You removed ${nameOf(id)}.`;

      if (id === defaultId) {
        defaultId = undefined;
        message += ' Choose a new default address.';
      }

      update();
    };

    const restore = () => {
      items = [...addresses];
      defaultId = 'home';
      message = 'The addresses are back.';
      update();
    };

    const { mount, update } = renderInto(
      () => html`
        <h3>Your addresses</h3>
        ${
          items.length
            ? html`
                <ul class="rd-addresses" @igcChange=${choose}>
                  ${repeat(
                    items,
                    ({ id }) => id,
                    ({ id, name, lines }) => html`
                      <li>
                        <igc-radio
                          id="rd-address-${id}"
                          name="default-address"
                          value=${id}
                          aria-labelledby="rd-address-${id}-name"
                          aria-describedby="rd-address-${id}-lines"
                          .checked=${id === defaultId}
                        ></igc-radio>
                        <label for="rd-address-${id}">
                          <strong id="rd-address-${id}-name">${name}</strong>
                          <span id="rd-address-${id}-lines" class="muted">
                            ${lines.map((line) => html`<span>${line}</span>`)}
                          </span>
                        </label>
                        <igc-icon-button
                          variant="flat"
                          name="delete"
                          aria-label="Remove ${name}"
                          @click=${remove(id)}
                        ></igc-icon-button>
                      </li>
                    `
                  )}
                </ul>
              `
            : html`
                <div class="rd-row">
                  <p class="muted">You have no saved addresses.</p>
                  <igc-button variant="outlined" @click=${restore}>
                    Restore the addresses
                  </igc-button>
                </div>
              `
        }
        <p class="muted" role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <style>
        .rd-addresses {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .rd-addresses li {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .rd-addresses label,
        .rd-addresses label span {
          display: grid;
          cursor: pointer;
        }
      </style>
      <section
        class="rd-stack rd-panel"
        aria-label="Address book"
        ${mount}
      ></section>
    `;
  },
};

const reasons = [
  { value: 'price', label: 'It costs too much' },
  { value: 'feature', label: 'A feature that I need is missing' },
  { value: 'switch', label: 'I am moving to another product' },
  { value: 'usage', label: 'I do not use it enough' },
  { value: 'other', label: 'Another reason' },
];

export const CancelSubscription: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The last step before a user cancels a subscription. Each radio is `required`, so the form does not submit until one reason is checked. Validation is a property of the whole group: all the radios show the invalid style, but only a radio with the `value-missing` slot shows the message, so the message goes on the last radio. "Another reason" shows a required text field. No radio has the `checked` attribute, so Reset clears the radios. Submit shows the form data.',
      },
    },
  },
  render: () => {
    let other = false;

    const choose = ({ detail }: CustomEvent<IgcRadioChangeEventArgs>) => {
      other = detail.value === 'other';
      update();
    };

    const reset = () => {
      other = false;
      update();
    };

    const last = reasons.length - 1;

    const { mount, update } = renderInto(
      () => html`
        <h3>Cancel your subscription</h3>
        <p class="muted">
          Your plan stays active until November 30. Tell us why you leave, so
          that we can do better.
        </p>
        <fieldset @igcChange=${choose}>
          <legend>Why do you cancel?</legend>
          ${reasons.map(
            ({ value, label }, index) => html`
              <igc-radio name="reason" value=${value} required>
                ${label}
                ${
                  index === last
                    ? html`
                        <span slot="value-missing">
                          Choose a reason to continue.
                        </span>
                      `
                    : nothing
                }
              </igc-radio>
            `
          )}
        </fieldset>
        ${
          other
            ? html`
                <igc-input name="details" label="Tell us more" required>
                  <span slot="value-missing">Tell us your reason.</span>
                </igc-input>
              `
            : nothing
        }
        <div class="rd-row">
          <igc-button type="submit">Cancel my subscription</igc-button>
          <igc-button type="reset" variant="outlined">Clear</igc-button>
        </div>
      `
    );

    return html`
      ${styles}
      <form
        class="rd-stack rd-panel"
        aria-label="Cancel your subscription"
        @submit=${formSubmitHandler}
        @reset=${reset}
        ${mount}
      ></form>
    `;
  },
};
