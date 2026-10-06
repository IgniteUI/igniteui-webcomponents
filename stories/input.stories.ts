import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { type TemplateResult, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent
);

registerMaterialIcons('visibility', 'visibility-off', 'plus', 'minus');

// region default
const metadata: Meta<IgcInputComponent> = {
  title: 'Input',
  component: 'igc-input',
  parameters: {
    docs: {
      description: {
        component:
          'A highly customizable single-line text field for entering and editing data,\nwith support for prefix/suffix content, helper text, form integration, and built-in validation.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    value: {
      type: 'string',
      description: 'The value of the control.',
      control: 'text',
    },
    type: {
      type: {
        name: 'enum',
        value: ['number', 'text', 'email', 'password', 'search', 'tel', 'url'],
      },
      description: 'The type of the control.',
      options: ['number', 'text', 'email', 'password', 'search', 'tel', 'url'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'text' } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    inputMode: {
      type: 'string',
      description:
        'A hint to the browser for which virtual keyboard layout to display.\nSee [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)',
      control: 'text',
    },
    pattern: {
      type: 'string',
      description: 'The regular expression the value is validated against.',
      control: 'text',
    },
    minLength: {
      type: 'number',
      description: 'The minimum string length required by the control.',
      control: 'number',
    },
    maxLength: {
      type: 'number',
      description: 'The maximum string length of the control.',
      control: 'number',
    },
    min: {
      type: 'number',
      description: 'The minimum value the control accepts.',
      control: 'number',
    },
    max: {
      type: 'number',
      description: 'The maximum value the control accepts.',
      control: 'number',
    },
    step: {
      type: 'number',
      description: 'The granularity the value must adhere to.',
      control: 'number',
    },
    autofocus: {
      type: 'boolean',
      description: 'Whether the control should receive focus automatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    autocomplete: {
      type: 'string',
      description: 'A hint for the browser on how to autofill the control.',
      control: 'text',
    },
    validateOnly: {
      type: 'boolean',
      description:
        'Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property for\nstring-type inputs or allows spin buttons to exceed the predefined `min/max` limits for number-type inputs.',
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
    type: 'text',
    readOnly: false,
    autofocus: false,
    validateOnly: false,
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
  },
};

export default metadata;

interface IgcInputArgs {
  /** The value of the control. */
  value: string;
  /** The type of the control. */
  type: 'number' | 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /**
   * A hint to the browser for which virtual keyboard layout to display.
   * See [relevant MDN article](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode)
   */
  inputMode: string;
  /** The regular expression the value is validated against. */
  pattern: string;
  /** The minimum string length required by the control. */
  minLength: number;
  /** The maximum string length of the control. */
  maxLength: number;
  /** The minimum value the control accepts. */
  min: number;
  /** The maximum value the control accepts. */
  max: number;
  /** The granularity the value must adhere to. */
  step: number;
  /** Whether the control should receive focus automatically. */
  autofocus: boolean;
  /** A hint for the browser on how to autofill the control. */
  autocomplete: string;
  /**
   * Enables validation rules to be evaluated without restricting user input. This applies to the `maxLength` property for
   * string-type inputs or allows spin buttons to exceed the predefined `min/max` limits for number-type inputs.
   */
  validateOnly: boolean;
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
type Story = StoryObj<IgcInputArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .in-form {
      display: grid;
      gap: 1rem;
      width: min(100%, 28rem);
    }

    .in-form :is(h3, p) {
      margin: 0;
    }

    .in-form h3 {
      font-size: 1.125rem;
    }

    .in-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .in-cart {
      width: min(100%, 40rem);
    }

    .in-items {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .in-items li {
      display: grid;
      grid-template-columns: 1fr 11rem 5rem;
      align-items: start;
      gap: 1rem;
      padding-block: 1rem;
      border-block-end: 1px solid var(--ig-gray-300);
    }

    .in-items li > div {
      display: grid;
    }

    .in-amount {
      padding-block-start: 0.5rem;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .in-total {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
    }

    .in-preview {
      display: grid;
      gap: 0.125rem;
      max-width: 22rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .in-preview span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    @media (max-width: 36rem) {
      .in-items li {
        grid-template-columns: 1fr 8rem;
      }

      .in-items li > div {
        grid-column: 1 / -1;
      }
    }
  </style>
`;

export const Default: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'name@example.com',
    autocomplete: 'email',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The email field of a checkout form. The label floats above the value, and the helper text tells the user why the form needs the address. Use the controls panel to change the type, the constraints and the states. The control validates after the user types in it or leaves it, so an untouched form shows no errors. `invalid` sets the invalid style at once.',
      },
    },
  },
  render: (args) => html`
    <div style="width: min(100%, 24rem)">
      <igc-input
        autocomplete=${ifDefined(args.autocomplete)}
        name=${ifDefined(args.name)}
        label=${ifDefined(args.label)}
        type=${ifDefined(args.type)}
        placeholder=${ifDefined(args.placeholder)}
        value=${ifDefined(args.value)}
        inputmode=${ifDefined(args.inputMode)}
        pattern=${ifDefined(args.pattern)}
        min=${ifDefined(args.min)}
        max=${ifDefined(args.max)}
        minlength=${ifDefined(args.minLength)}
        maxlength=${ifDefined(args.maxLength)}
        step=${ifDefined(args.step)}
        ?autofocus=${args.autofocus}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        ?outlined=${args.outlined}
        ?readonly=${args.readOnly}
        ?required=${args.required}
        ?validate-only=${args.validateOnly}
      >
        <span slot="helper-text">We send the receipt to this address.</span>
      </igc-input>
    </div>
  `,
};

type PasswordField = 'current' | 'new' | 'confirm';

const reusedPassword = 'Use a password that is different from the current one.';
const passwordMismatch = 'The passwords do not match.';

const passwordFields: {
  field: PasswordField;
  label: string;
  noun: string;
  autocomplete: string;
  minlength?: number;
  pattern?: string;
  /** The helper text and the validation messages besides `value-missing`. */
  hints?: TemplateResult;
}[] = [
  {
    field: 'current',
    label: 'Current password',
    noun: 'current password',
    autocomplete: 'current-password',
  },
  {
    field: 'new',
    label: 'New password',
    noun: 'new password',
    autocomplete: 'new-password',
    minlength: 12,
    pattern: '(?=.*[A-Za-z])(?=.*[0-9]).*',
    hints: html`
      <span slot="helper-text">
        Use 12 or more characters, with letters and numbers.
      </span>
      <span slot="too-short">Use 12 or more characters.</span>
      <span slot="pattern-mismatch">Use letters and numbers.</span>
      <span slot="custom-error">${reusedPassword}</span>
    `,
  },
  {
    field: 'confirm',
    label: 'Confirm the new password',
    noun: 'confirmed password',
    autocomplete: 'new-password',
    hints: html`<span slot="custom-error">${passwordMismatch}</span>`,
  },
];

export const ChangePassword: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The security settings of an account. The `autocomplete` tokens tell a password manager which field gets the saved password and which gets a new one. The eye button in the `suffix` slot changes `type` from `password` to `text`, and its `aria-label` changes from Show to Hide. The new password uses `minlength` and a `pattern`, and the `too-short` and `pattern-mismatch` slots tell the user the rule. Two rules need more than one field: the new password must differ from the current one, and the confirmation must match it. The `igcInput` handler checks them and calls `setCustomValidity()`, and the `custom-error` slot shows the message. Select "Change password" with an empty or an invalid field: the form does not submit, and the focus moves to the first invalid field.',
      },
    },
  },
  render: () => {
    const shown = new Set<PasswordField>();
    let status = '';

    const field = (name: PasswordField) =>
      story.host!.querySelector<IgcInputComponent>(
        `[name="${name}-password"]`
      )!;

    const check = () => {
      const current = field('current');
      const next = field('new');
      const confirm = field('confirm');

      next.setCustomValidity(
        next.value && next.value === current.value ? reusedPassword : ''
      );
      confirm.setCustomValidity(
        confirm.value && confirm.value !== next.value ? passwordMismatch : ''
      );
    };

    const toggle = (name: PasswordField) => {
      if (!shown.delete(name)) {
        shown.add(name);
      }
      story.update();
    };

    const submit = (event: SubmitEvent) => {
      event.preventDefault();
      (event.currentTarget as HTMLFormElement).reset();
      status =
        'Your password is changed. Use the new password the next time you sign in.';
      story.update();
    };

    const reset = () => {
      for (const { field: name } of passwordFields) {
        field(name).setCustomValidity('');
      }
      shown.clear();
      status = '';
      story.update();
    };

    const story = renderInto(
      () => html`
        <form class="in-form" @submit=${submit} @reset=${reset}>
          <h3>Change your password</h3>
          ${passwordFields.map(
            ({
              field: name,
              label,
              noun,
              autocomplete,
              minlength,
              pattern,
              hints,
            }) => {
              const visible = shown.has(name);

              return html`
                <igc-input
                  name="${name}-password"
                  type=${visible ? 'text' : 'password'}
                  label=${label}
                  autocomplete=${autocomplete}
                  required
                  minlength=${ifDefined(minlength)}
                  pattern=${ifDefined(pattern)}
                  @igcInput=${check}
                >
                  <igc-icon-button
                    slot="suffix"
                    variant="flat"
                    name=${visible ? 'visibility-off' : 'visibility'}
                    aria-label="${visible ? 'Hide' : 'Show'} ${noun}"
                    @click=${() => toggle(name)}
                  ></igc-icon-button>
                  ${hints}
                  <span slot="value-missing">Enter the ${noun}.</span>
                </igc-input>
              `;
            }
          )}
          <div class="in-row">
            <igc-button type="submit">Change password</igc-button>
            <igc-button type="reset" variant="flat">Cancel</igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  stock: number;
  quantity: string;
};

const cartItems: CartItem[] = [
  {
    id: 'runner',
    name: 'Trail Runner 2',
    detail: 'Size 42, slate',
    price: 129,
    stock: 3,
    quantity: '1',
  },
  {
    id: 'socks',
    name: 'Merino hiking socks',
    detail: 'Pack of 3, size M',
    price: 24.5,
    stock: 20,
    quantity: '2',
  },
  {
    id: 'bottle',
    name: 'Insulated bottle',
    detail: '750 ml, forest green',
    price: 32,
    stock: 8,
    quantity: '1',
  },
];

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** The quantity of the item, or `null` when the input value is not valid. */
function quantityOf({ quantity, stock }: CartItem): number | null {
  const value = Number(quantity);
  return quantity && Number.isInteger(value) && value >= 1 && value <= stock
    ? value
    : null;
}

export const Cart: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A shopping cart with a quantity field for each item. Each field is `type="number"` with `min="1"`, `step="1"` and the stock of the item as `max`. The minus and plus buttons in the `prefix` and `suffix` slots call `stepDown()` and `stepUp()`, which stay in the range. The arrow keys also change the value. The user can still type any number, so the `range-underflow`, `range-overflow` and `step-mismatch` slots explain the rule. Type 5 for the shoes, or 1.5 for the socks. The rows have no visible label, so each field gets its name from an `aria-label`, and each button names the item. The line totals and the subtotal follow `igcInput`. "Check out" with an invalid quantity moves the focus to that field.',
      },
    },
  },
  render: () => {
    const items = cartItems.map((item) => ({ ...item }));
    let status = '';

    const step = (event: Event, item: CartItem, direction: 1 | -1) => {
      const input = (event.currentTarget as Element).closest('igc-input')!;

      if (direction > 0) {
        input.stepUp();
      } else {
        input.stepDown();
      }

      item.quantity = input.value;
      story.update();
    };

    const submit = (event: SubmitEvent) => {
      event.preventDefault();

      const count = items.reduce((sum, item) => sum + quantityOf(item)!, 0);
      status = `You check out ${count} items. The next step is the delivery address.`;
      story.update();
    };

    const story = renderInto(() => {
      const quantities = items.map(quantityOf);
      const subtotal = quantities.every((quantity) => quantity !== null)
        ? money.format(
            items.reduce(
              (sum, item, index) => sum + item.price * quantities[index]!,
              0
            )
          )
        : '—';

      return html`
        <form class="in-form in-cart" @submit=${submit}>
          <h3>Your cart</h3>
          <ul class="in-items">
            ${items.map((item, index) => {
              const quantity = quantities[index];

              return html`
                <li>
                  <div>
                    <strong>${item.name}</strong>
                    <span class="muted">${item.detail}</span>
                    <span class="muted">
                      ${money.format(item.price)} each
                    </span>
                  </div>
                  <igc-input
                    type="number"
                    name=${item.id}
                    aria-label="Quantity of ${item.name}"
                    min="1"
                    max=${item.stock}
                    step="1"
                    required
                    .value=${item.quantity}
                    @igcInput=${({ detail }: CustomEvent<string>) => {
                      item.quantity = detail;
                      story.update();
                    }}
                  >
                    <igc-icon-button
                      slot="prefix"
                      variant="flat"
                      name="minus"
                      aria-label="Decrease the quantity of ${item.name}"
                      @click=${(event: Event) => step(event, item, -1)}
                    ></igc-icon-button>
                    <igc-icon-button
                      slot="suffix"
                      variant="flat"
                      name="plus"
                      aria-label="Increase the quantity of ${item.name}"
                      @click=${(event: Event) => step(event, item, 1)}
                    ></igc-icon-button>
                    <span slot="helper-text">${item.stock} in stock</span>
                    <span slot="value-missing">Enter a quantity.</span>
                    <span slot="range-underflow">Enter 1 or more.</span>
                    <span slot="range-overflow">
                      Only ${item.stock} in stock.
                    </span>
                    <span slot="step-mismatch">Enter a whole number.</span>
                  </igc-input>
                  <span class="in-amount">
                    ${
                      quantity === null
                        ? '—'
                        : money.format(quantity * item.price)
                    }
                  </span>
                </li>
              `;
            })}
          </ul>
          <p class="in-total">
            <span>Subtotal</span>
            <output>${subtotal}</output>
          </p>
          <div class="in-row">
            <igc-button type="submit">Check out</igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `;
    });

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};

const mergeFields = [
  { label: 'First name', token: '{first_name}', sample: 'Maria' },
  { label: 'City', token: '{city}', sample: 'Lisbon' },
  { label: 'Discount code', token: '{code}', sample: 'FALL20' },
];

const subjectLimit = 60;
const preheaderLimit = 90;
const initialSubject = '{first_name}, your fall gear is waiting';
const initialPreheader = 'Free delivery on all orders this week.';

/** Replaces the merge fields with the values of a sample subscriber. */
function fillMergeFields(text: string): string {
  return mergeFields.reduce(
    (result, { token, sample }) => result.replaceAll(token, sample),
    text
  );
}

export const EmailCampaign: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The editor of a marketing email. Mobile mail apps cut off a subject after about 60 characters, so the subject has `maxlength="60"` with `validate-only`. The user can type or paste a longer subject, and the `too-long` slot asks them to shorten it. The preview text has `maxlength="90"` without `validate-only`, so the field stops the input at 90 characters. The helper texts count the characters on `igcInput`. The merge field buttons call `setRangeText()` without `start` and `end`, so the token replaces the selected text, or goes in at the cursor. The field keeps its selection while the button has the focus. `selectMode` set to `end` puts the cursor after the token. The inbox preview shows the subject and the preview text with the values of a sample subscriber.',
      },
    },
  },
  render: () => {
    let subject = initialSubject;
    let preheader = initialPreheader;
    let status = '';

    const insert = (token: string) => {
      const input =
        story.host!.querySelector<IgcInputComponent>('[name="subject"]')!;

      input.setRangeText(token, undefined, undefined, 'end');
      input.focus();
      subject = input.value;
      story.update();
    };

    const submit = (event: SubmitEvent) => {
      event.preventDefault();
      status = `The campaign "${fillMergeFields(subject)}" is scheduled for tomorrow at 9:00.`;
      story.update();
    };

    const reset = () => {
      subject = initialSubject;
      preheader = initialPreheader;
      status = '';
      story.update();
    };

    const story = renderInto(
      () => html`
        <form class="in-form" @submit=${submit} @reset=${reset}>
          <h3>Fall sale email</h3>
          <igc-input
            name="subject"
            label="Subject line"
            value=${initialSubject}
            maxlength=${subjectLimit}
            validate-only
            required
            @igcInput=${({ detail }: CustomEvent<string>) => {
              subject = detail;
              story.update();
            }}
          >
            <span slot="helper-text">
              ${subject.length} of ${subjectLimit} characters
            </span>
            <span slot="value-missing">Enter a subject line.</span>
            <span slot="too-long">
              The subject has ${subject.length} characters. Shorten it to
              ${subjectLimit}, or mobile mail apps cut it off.
            </span>
          </igc-input>
          <div
            class="in-row"
            role="group"
            aria-label="Add a merge field to the subject"
          >
            <span class="muted">Add:</span>
            ${mergeFields.map(
              ({ label, token }) => html`
                <igc-button
                  variant="outlined"
                  style="--ig-size: var(--ig-size-small)"
                  @click=${() => insert(token)}
                >
                  <igc-icon slot="prefix" name="plus"></igc-icon>
                  ${label}
                </igc-button>
              `
            )}
          </div>
          <igc-input
            name="preheader"
            label="Preview text"
            value=${initialPreheader}
            maxlength=${preheaderLimit}
            @igcInput=${({ detail }: CustomEvent<string>) => {
              preheader = detail;
              story.update();
            }}
          >
            <span slot="helper-text">
              ${preheader.length} of ${preheaderLimit} characters. Most inboxes
              show it after the subject.
            </span>
          </igc-input>
          <section class="in-preview" aria-label="Inbox preview">
            <strong>Acme Outdoor</strong>
            <span>${fillMergeFields(subject) || 'No subject'}</span>
            <span class="muted">${fillMergeFields(preheader)}</span>
          </section>
          <div class="in-row">
            <igc-button type="submit">Schedule</igc-button>
            <igc-button type="reset" variant="flat">Reset</igc-button>
          </div>
          <p class="muted" role="status">${status}</p>
        </form>
      `
    );

    return html`${styles}
      <div ${story.mount}></div>`;
  },
};
