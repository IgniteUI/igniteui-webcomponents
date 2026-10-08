import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcButtonComponent,
  IgcIconComponent,
  IgcMaskInputComponent,
  IgcSelectComponent,
  type IgcSelectItemComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { keyed } from 'lit/directives/keyed.js';
import { today } from './story-dates.js';
import { registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  dollars,
  formControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconComponent,
  IgcMaskInputComponent,
  IgcSelectComponent
);

registerMaterialIcons('call');

// region default
const metadata: Meta<IgcMaskInputComponent> = {
  title: 'MaskInput',
  component: 'igc-mask-input',
  parameters: {
    docs: {
      description: {
        component:
          'A masked input is an input field where a developer can control user input and format the visible value,\nbased on configurable rules',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    valueMode: {
      type: { name: 'enum', value: ['raw', 'withFormatting'] },
      description:
        'Dictates the behavior when retrieving the value of the control:\n\n- `raw`: Returns clean input (e.g. "5551234567")\n- `withFormatting`: Returns with mask formatting (e.g. "(555) 123-4567")\n\nEmpty values always return an empty string, regardless of the value mode.',
      options: ['raw', 'withFormatting'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'raw' } },
    },
    value: {
      type: 'string',
      description:
        'The value of the input.\n\nRegardless of the currently set `value-mode`, an empty value returns an empty string.',
      control: 'text',
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
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
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
  },
  args: {
    valueMode: 'raw',
    mask: 'CCCCCCCCCC',
    prompt: '_',
    readOnly: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcMaskInputArgs {
  /**
   * Dictates the behavior when retrieving the value of the control:
   *
   * - `raw`: Returns clean input (e.g. "5551234567")
   * - `withFormatting`: Returns with mask formatting (e.g. "(555) 123-4567")
   *
   * Empty values always return an empty string, regardless of the value mode.
   */
  valueMode: 'raw' | 'withFormatting';
  /**
   * The value of the input.
   *
   * Regardless of the currently set `value-mode`, an empty value returns an empty string.
   */
  value: string;
  /** The masked pattern of the component. */
  mask: string;
  /** The prompt symbol to use for unfilled parts of the mask pattern. */
  prompt: string;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
}
type Story = StoryObj<IgcMaskInputArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .mi-form {
      display: grid;
      gap: 1rem;
      width: min(100%, 28rem);
    }

    .mi-form :is(h3, p) {
      margin: 0;
    }

    .mi-form h3 {
      font-size: 1.125rem;
    }

    .mi-pair {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
      align-items: start;
    }

    .mi-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  args: {
    label: 'Phone',
    mask: '(000) 000-0000',
  },
  parameters: {
    docs: {
      description: {
        story: `The phone field of a contact form. The mask adds the parentheses, the space and the hyphen, and it accepts only digits in the other positions. While the field is empty, the placeholder shows the mask. When the field has the focus, it shows the prompt character in each empty position. With \`value-mode\` set to \`raw\`, \`value\` and the details of \`igcInput\` and \`igcChange\` hold only the typed digits. With \`withFormatting\`, they also hold the literals and the prompts. When the field has a value but a required position is empty, the \`bad-input\` slot shows. Use the controls panel to try other masks. These flags make a mask:

| Flag | Accepts | Required |
|---|---|---|
| \`0\` | A digit | Yes |
| \`9\` | A digit | No |
| \`#\` | A digit, \`+\` or \`-\` | Yes |
| \`L\` | A letter | Yes |
| \`?\` | A letter | No |
| \`A\` | A letter or a digit | Yes |
| \`a\` | A letter or a digit | No |
| \`&\` | Any character | Yes |
| \`C\` | Any character | No |

All other characters are literals. A backslash turns a flag into a literal, for example \`\\9\`.`,
      },
    },
  },
  render: (args) => html`
    <div style="width: min(100%, 24rem)">
      <igc-mask-input
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        mask=${ifDefined(args.mask)}
        prompt=${ifDefined(args.prompt)}
        placeholder=${ifDefined(args.placeholder)}
        value=${ifDefined(args.value)}
        value-mode=${ifDefined(args.valueMode)}
        inputmode="tel"
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?outlined=${args.outlined}
        ?readonly=${args.readOnly}
        ?required=${args.required}
      >
        <igc-icon slot="prefix" name="call"></igc-icon>
        <span slot="helper-text">We call only about your order.</span>
        <span slot="value-missing">Enter a phone number.</span>
        <span slot="bad-input">Enter the full phone number.</span>
      </igc-mask-input>
    </div>
  `,
};

type CardBrand = {
  name: string;
  pattern: RegExp;
  mask: string;
  /** American Express prints 4 digits on the front, the others 3 on the back. */
  codeLength: 3 | 4;
};

const cardBrands: CardBrand[] = [
  {
    name: 'American Express',
    pattern: /^3[47]/,
    mask: '0000 000000 00000',
    codeLength: 4,
  },
  { name: 'Visa', pattern: /^4/, mask: '0000 0000 0000 0000', codeLength: 3 },
  {
    name: 'Mastercard',
    pattern: /^(5[1-5]|2[2-7])/,
    mask: '0000 0000 0000 0000',
    codeLength: 3,
  },
];

const otherCard: CardBrand = {
  name: '',
  pattern: /./,
  mask: '0000 0000 0000 0000',
  codeLength: 3,
};

function brandOf(digits: string): CardBrand {
  return cardBrands.find(({ pattern }) => pattern.test(digits)) ?? otherCard;
}

/** The Luhn checksum, which catches most typing errors in a card number. */
function passesLuhn(digits: string): boolean {
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);

    if (i % 2) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return sum % 10 === 0;
}

/** The error of a complete `MMYY` expiry date, or an empty string. */
function expiryError(digits: string): string {
  if (digits.length < 4) {
    return '';
  }

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));

  if (month < 1 || month > 12) {
    return 'Enter a month from 01 to 12.';
  }

  // A card works until the end of its expiry month.
  return new Date(year, month) <= today ? 'The card has expired.' : '';
}

const orderTotal = dollars.format(149);

export const Checkout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The payment step of a checkout. The first digits of the card number tell the brand. An American Express card has 15 digits in groups of 4, 6 and 5, and a security code of 4 digits, so the `igcInput` handler changes `mask` of both fields while the user types. A changed mask applies again to the value. All fields use `raw` value mode, so the form gets only the digits. When the card number is complete, the handler runs the Luhn checksum and calls `setCustomValidity()` when it fails, and the `custom-error` slot shows. The expiry date also uses a custom error, for a month above 12 and for an expired card. Paste a number with hyphens or spaces: the mask skips them. Try 4242 4242 4242 4242 or 3782 822463 10005, then change a digit.',
      },
    },
  },
  render: () => {
    let digits = '';
    let expiry = '';
    let status = '';

    const field = (name: string) =>
      story.host!.querySelector<IgcMaskInputComponent>(`[name="${name}"]`)!;

    const checkNumber = ({ detail }: CustomEvent<string>) => {
      digits = detail;
      story.update();

      // The update can change the mask, so the check runs after it.
      const number = field('card-number');
      number.setCustomValidity(
        number.value && number.isValidMaskPattern() && !passesLuhn(number.value)
          ? 'The card number is not valid.'
          : ''
      );
    };

    const checkExpiry = ({ detail }: CustomEvent<string>) => {
      expiry = detail;
      field('expiry').setCustomValidity(expiryError(expiry));
      story.update();
    };

    const submit = (event: SubmitEvent) => {
      event.preventDefault();

      const card = brandOf(digits).name || 'Card';
      const last = digits.slice(-4);

      (event.currentTarget as HTMLFormElement).reset();
      status = `The payment of ${orderTotal} is complete. ${card} ending in ${last}.`;
      story.update();
    };

    const reset = () => {
      field('card-number').setCustomValidity('');
      field('expiry').setCustomValidity('');
      digits = '';
      expiry = '';
      status = '';
      story.update();
    };

    const story = renderInto(() => {
      const brand = brandOf(digits);
      const codeHint =
        brand.codeLength === 4
          ? '4 digits on the front of the card'
          : '3 digits on the back of the card';

      return html`
        <form class="mi-form" @submit=${submit} @reset=${reset}>
          <h3>Payment</h3>
          <p class="muted">Order total: ${orderTotal}</p>
          <igc-mask-input
            name="card-number"
            label="Card number"
            .mask=${brand.mask}
            placeholder="1234 1234 1234 1234"
            inputmode="numeric"
            required
            @igcInput=${checkNumber}
          >
            ${brand.name ? html`<span slot="suffix">${brand.name}</span>` : ''}
            <span slot="value-missing">Enter the card number.</span>
            <span slot="bad-input">
              Enter all the digits of the card number.
            </span>
            <span slot="custom-error">
              The card number is not valid. Check the digits.
            </span>
          </igc-mask-input>
          <div class="mi-pair">
            <igc-mask-input
              name="expiry"
              label="Expiry date"
              mask="00/00"
              placeholder="MM/YY"
              inputmode="numeric"
              required
              @igcInput=${checkExpiry}
            >
              <span slot="value-missing">Enter the expiry date.</span>
              <span slot="bad-input">Enter the month and the year.</span>
              <span slot="custom-error">${expiryError(expiry)}</span>
            </igc-mask-input>
            <igc-mask-input
              name="security-code"
              label="Security code"
              .mask=${'0'.repeat(brand.codeLength)}
              placeholder=${'1234'.slice(0, brand.codeLength)}
              inputmode="numeric"
              required
            >
              <span slot="helper-text">The ${codeHint}</span>
              <span slot="value-missing">Enter the security code.</span>
              <span slot="bad-input">Enter the ${codeHint}.</span>
            </igc-mask-input>
          </div>
          <div class="mi-row">
            <igc-button type="submit">Pay ${orderTotal}</igc-button>
            <igc-button type="reset" variant="flat">Clear</igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type Country = {
  code: string;
  name: string;
  postalMask: string;
  postalExample: string;
  phoneMask: string;
  phoneExample: string;
};

const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    postalMask: '00000',
    postalExample: '94103',
    phoneMask: '+1 (000) 000-0000',
    phoneExample: '+1 (415) 555-0132',
  },
  {
    code: 'CA',
    name: 'Canada',
    postalMask: 'L0L 0L0',
    postalExample: 'K1A 0B1',
    phoneMask: '+1 (000) 000-0000',
    phoneExample: '+1 (613) 555-0187',
  },
  {
    code: 'IN',
    name: 'India',
    postalMask: '000000',
    postalExample: '110001',
    // The 9 of the country code is a flag, so the mask escapes it.
    phoneMask: '+\\91 00000 00000',
    phoneExample: '+91 98765 43210',
  },
  {
    code: 'JP',
    name: 'Japan',
    postalMask: '000-0000',
    postalExample: '100-0001',
    phoneMask: '+81 00-0000-0000',
    phoneExample: '+81 90-1234-5678',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    postalMask: '0000 LL',
    postalExample: '1012 AB',
    phoneMask: '+31 6 0000 0000',
    phoneExample: '+31 6 1234 5678',
  },
];

export const ShippingAddress: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The delivery details of an online store that ships to five countries. The country sets the masks of the postal code and of the mobile phone, and the placeholders show an example. A Canadian postal code mixes letters (`L`) and digits (`0`). The phone masks hold the country code as a literal. The country code of India has a 9, which is a flag, so the mask escapes it: `+\\91 00000 00000`. The old values do not fit the new masks, so the `keyed` directive of Lit renders new fields for a new country, without the old values and their validation state. The postal code uses `value-mode="withFormatting"`, so the form sends it with its space or hyphen, as on a shipping label. The phone uses `raw`, so the form sends only the national number, without the country code, and the `country` field tells the server the rest. Submit the form to see the form data.',
      },
    },
  },
  render: () => {
    let country = countries[0];

    const changeCountry = ({ detail }: CustomEvent<IgcSelectItemComponent>) => {
      country = countries.find(({ code }) => code === detail.value)!;
      story.update();
    };

    const reset = () => {
      country = countries[0];
      story.update();
    };

    const story = renderInto(
      () => html`
        <form class="mi-form" @submit=${formSubmitHandler} @reset=${reset}>
          <h3>Delivery details</h3>
          <igc-select
            name="country"
            label="Country"
            value="US"
            @igcChange=${changeCountry}
          >
            ${countries.map(
              ({ code, name }) => html`
                <igc-select-item value=${code}>${name}</igc-select-item>
              `
            )}
          </igc-select>
          ${keyed(
            country.code,
            html`
              <igc-mask-input
                name="postal-code"
                label="Postal code"
                .mask=${country.postalMask}
                placeholder=${country.postalExample}
                value-mode="withFormatting"
                required
              >
                <span slot="value-missing">Enter the postal code.</span>
                <span slot="bad-input">
                  Enter a postal code like ${country.postalExample}.
                </span>
              </igc-mask-input>
              <igc-mask-input
                name="phone"
                label="Mobile phone"
                .mask=${country.phoneMask}
                placeholder=${country.phoneExample}
                inputmode="tel"
                required
              >
                <span slot="helper-text">
                  The courier sends a text message before the delivery.
                </span>
                <span slot="value-missing">Enter a mobile phone number.</span>
                <span slot="bad-input">Enter the full phone number.</span>
              </igc-mask-input>
            `
          )}
          ${formControls()}
        </form>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const sentCode = '482913';

export const VerificationCode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The second step of a sign-in. The user types the 6-digit code from a text message, and the form checks the code as soon as it is complete, without a submit button. The `igcInput` handler checks that the value is not empty and calls `isValidMaskPattern()`, which is true when all required positions have a value. The mask accepts only digits, so the user can paste a code with a space or a hyphen in it. `prompt` sets the symbol of the empty positions to a dash, and `inputmode="numeric"` asks for a number keyboard on a phone. A wrong code calls `setCustomValidity()` and selects the text, so the next code replaces it. For this demo, the code is 482 913.',
      },
    },
  },
  render: () => {
    let status = '';
    let verified = false;
    let check = 0;

    const verify = async (input: IgcMaskInputComponent) => {
      const current = check;
      status = 'Checking the code…';
      story.update();

      await delay(800);

      // A newer input started another check.
      if (current !== check) {
        return;
      }

      if (input.value === sentCode) {
        verified = true;
        status = 'Your identity is confirmed. You are signed in.';
      } else {
        input.setCustomValidity('The code is not correct.');
        input.select();
        status = '';
      }

      story.update();
    };

    const handleInput = ({ detail, currentTarget }: CustomEvent<string>) => {
      const input = currentTarget as IgcMaskInputComponent;

      check++;
      input.setCustomValidity('');

      if (detail && input.isValidMaskPattern()) {
        verify(input);
      } else {
        status = '';
        story.update();
      }
    };

    const resend = () => {
      check++;
      status = 'We sent a new code to the phone number that ends in 42.';
      story.update();
    };

    const story = renderInto(
      () => html`
        <form
          class="mi-form"
          @submit=${(event: SubmitEvent) => event.preventDefault()}
        >
          <h3>Enter the verification code</h3>
          <p class="muted">
            We sent a code to the phone number that ends in 42.
          </p>
          <igc-mask-input
            name="code"
            label="Verification code"
            mask="000 000"
            prompt="-"
            placeholder="--- ---"
            inputmode="numeric"
            ?readonly=${verified}
            @igcInput=${handleInput}
          >
            <span slot="helper-text">For this demo, the code is 482 913.</span>
            <span slot="bad-input">Enter all 6 digits.</span>
            <span slot="custom-error">
              The code is not correct. Check the text message and try again.
            </span>
          </igc-mask-input>
          <div class="mi-row">
            <igc-button variant="flat" ?disabled=${verified} @click=${resend}>
              Send a new code
            </igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
