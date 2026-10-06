import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcAccordionComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcCircularProgressComponent,
  type IgcExpansionPanelComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcAccordionComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcCircularProgressComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcRadioGroupComponent
);

registerMaterialIcons('plus', 'minus', 'search');

// region default
const metadata: Meta<IgcAccordionComponent> = {
  title: 'Accordion',
  component: 'igc-accordion',
  parameters: {
    docs: {
      description: {
        component:
          'The Accordion is a container-based component that can house multiple expansion panels\nand offers keyboard navigation.',
      },
    },
  },
  argTypes: {
    singleExpand: {
      type: 'boolean',
      description: 'Allows only one panel to be expanded at a time.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { singleExpand: false },
};

export default metadata;

interface IgcAccordionArgs {
  /** Allows only one panel to be expanded at a time. */
  singleExpand: boolean;
}
type Story = StoryObj<IgcAccordionArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .acc-page {
      max-width: 44rem;
    }

    .acc-page p {
      margin-block: 0 0.75rem;
    }

    .acc-specs {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 0.5rem 1.5rem;
      margin: 0;
    }

    .acc-specs dt {
      font-weight: 600;
    }

    .acc-specs dd {
      margin: 0;
    }

    .acc-title {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .acc-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .acc-small {
      --ig-size: var(--ig-size-small);
    }

    .acc-page .acc-count {
      margin-block: 0.75rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The details of a product, in sections. Click a header to expand or collapse its panel. When a header has focus, Arrow Down and Arrow Up move to the next and the previous header, and Home and End move to the first and the last. Alt + Arrow Down and Alt + Arrow Up expand and collapse the focused panel. Shift + Alt + Arrow Down and Shift + Alt + Arrow Up expand and collapse all panels. Turn on `singleExpand` in the controls panel to keep only one section open.',
      },
    },
  },
  render: ({ singleExpand }) => html`
    ${styles}
    <igc-accordion class="acc-page" ?single-expand=${singleExpand}>
      <igc-expansion-panel open>
        <span slot="title">Description</span>
        <span slot="subtitle">Trail Runner 2</span>
        <p>
          A light shoe for technical trails. The outsole holds on wet rock, and
          the rock plate protects your feet on long descents.
        </p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Specifications</span>
        <span slot="subtitle">Weight, drop and materials</span>
        <dl class="acc-specs">
          <dt>Weight</dt>
          <dd>280 g (US men's 9)</dd>
          <dt>Drop</dt>
          <dd>6 mm</dd>
          <dt>Upper</dt>
          <dd>Recycled mesh</dd>
          <dt>Outsole</dt>
          <dd>Sticky rubber with 5 mm lugs</dd>
        </dl>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Shipping and returns</span>
        <span slot="subtitle">Free shipping over $50</span>
        <p>
          Standard shipping takes 3 to 5 business days. You can return unworn
          shoes within 30 days of delivery, and the return is free.
        </p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Care</span>
        <span slot="subtitle">Cleaning and storage</span>
        <ul>
          <li>Remove the insoles and let the shoes dry in the air.</li>
          <li>Brush off dry mud. Do not use a washing machine.</li>
          <li>Keep the shoes away from direct heat.</li>
        </ul>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  title: string;
  questions: FaqQuestion[];
}

const faq: FaqCategory[] = [
  {
    id: 'orders',
    title: 'Orders',
    questions: [
      {
        id: 'track',
        question: 'How do I track my order?',
        answer:
          'Open Orders in your account and select the order. The tracking link shows when the parcel leaves our warehouse, usually within one business day.',
      },
      {
        id: 'change',
        question: 'Can I change or cancel an order?',
        answer:
          'You can change the address or cancel the order until we pack it. After that, wait for the parcel and return it.',
      },
      {
        id: 'invoice',
        question: 'Where do I find my invoice?',
        answer:
          'We send the invoice by email when the order ships. You can also download it from the order page.',
      },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    questions: [
      {
        id: 'cost',
        question: 'How much does shipping cost?',
        answer:
          'Standard shipping is free for orders over $50. Below that, it costs $4.95. Express shipping costs $12.',
      },
      {
        id: 'countries',
        question: 'Which countries do you ship to?',
        answer:
          'We ship to the United States, Canada, the United Kingdom and the countries of the European Union.',
      },
      {
        id: 'time',
        question: 'How long does delivery take?',
        answer:
          'Standard delivery takes 3 to 5 business days. Express delivery takes 1 to 2 business days.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns and refunds',
    questions: [
      {
        id: 'policy',
        question: 'What is your return policy?',
        answer:
          'You can return unworn items within 30 days of delivery. Returns are free.',
      },
      {
        id: 'refund',
        question: 'When do I get my refund?',
        answer:
          'We refund the original payment method within 5 business days after the return arrives.',
      },
      {
        id: 'exchange',
        question: 'Can I exchange an item for a different size?',
        answer:
          'Yes. Start a return and select Exchange. We ship the new size when we scan the return parcel.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    questions: [
      {
        id: 'password',
        question: 'How do I reset my password?',
        answer:
          'Select Forgot password on the sign-in page. We send you a link that is valid for one hour.',
      },
      {
        id: 'delete',
        question: 'How do I delete my account?',
        answer:
          'Open Settings, select Privacy, and then select Delete account. All open orders must be complete first.',
      },
    ],
  },
];

const questionCount = (count: number): string =>
  `${count} ${count === 1 ? 'question' : 'questions'}`;

export const Faq: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A help center. Each category is a panel of the outer accordion, and holds a nested accordion with `single-expand`, so that only one answer in each category is open. The nested accordions are independent: each has its own keyboard navigation, and an answer that opens in one category does not close the answers in the other categories. The questions use `indicator-position="end"`, and the `indicator` and `indicator-expanded` slots show plus and minus icons. The search removes the questions that do not match from the DOM, and sets `open` on the categories with results.',
      },
    },
  },
  render: () => {
    let query = '';

    const matches = ({ question, answer }: FaqQuestion) =>
      `${question} ${answer}`.toLowerCase().includes(query);

    const { mount, update } = renderInto(() => {
      const categories = faq
        .map((category) => ({
          ...category,
          questions: category.questions.filter(matches),
        }))
        .filter(({ questions }) => questions.length > 0);

      const count = categories.reduce(
        (total, { questions }) => total + questions.length,
        0
      );

      return html`
        <p class="muted acc-count" role="status">
          ${query ? `${questionCount(count)} found` : questionCount(count)}
        </p>
        ${
          count
            ? html`
                <igc-accordion>
                  ${repeat(
                    categories,
                    ({ id }) => id,
                    ({ title, questions }) => html`
                      <igc-expansion-panel ?open=${query !== ''}>
                        <span slot="title">${title}</span>
                        <span slot="subtitle">
                          ${questionCount(questions.length)}
                        </span>
                        <igc-accordion single-expand>
                          ${repeat(
                            questions,
                            ({ id }) => id,
                            ({ question, answer }) => html`
                              <igc-expansion-panel indicator-position="end">
                                <span slot="title">${question}</span>
                                <igc-icon
                                  slot="indicator"
                                  name="plus"
                                ></igc-icon>
                                <igc-icon
                                  slot="indicator-expanded"
                                  name="minus"
                                ></igc-icon>
                                <p>${answer}</p>
                              </igc-expansion-panel>
                            `
                          )}
                        </igc-accordion>
                      </igc-expansion-panel>
                    `
                  )}
                </igc-accordion>
              `
            : html`<p>Try a different word, or contact our support team.</p>`
        }
      `;
    });

    const search = ({ detail }: CustomEvent<string>) => {
      query = detail.trim().toLowerCase();
      update();
    };

    return html`
      ${styles}
      <div class="acc-page">
        <igc-input
          type="search"
          label="Search the help center"
          @igcInput=${search}
        >
          <igc-icon slot="prefix" name="search"></igc-icon>
        </igc-input>
        <div ${mount}></div>
      </div>
    `;
  },
};

export const Checkout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A checkout in steps. The accordion has `single-expand`, and the steps after the current step are `disabled`, so the user cannot skip a step. "Continue" validates the step, writes its summary to the `subtitle` slot, enables the next step, and opens it. `show()` and `hide()` do not emit events, and single expand reacts only to the events, so the handler closes the current step itself. The headers use `indicator-position="none"`, and a badge in the `title` slot shows the step number. Click the header of a completed step to change it.',
      },
    },
  },
  render: () => {
    const summarize = (step: IgcExpansionPanelComponent): string => {
      const group = step.querySelector('igc-radio-group');

      if (group) {
        return (
          group
            .querySelector(`igc-radio[value="${group.value}"] .acc-option`)
            ?.textContent?.trim() ?? ''
        );
      }

      return Array.from(step.querySelectorAll('igc-input'), ({ value }) =>
        value.trim()
      ).join(', ');
    };

    const firstField = (panel: IgcExpansionPanelComponent) => {
      const group = panel.querySelector('igc-radio-group');

      return group
        ? group.querySelector<HTMLElement>(`igc-radio[value="${group.value}"]`)
        : panel.querySelector<HTMLElement>('igc-input, igc-button');
    };

    const review = (accordion: IgcAccordionComponent) => {
      const list = accordion.querySelector<HTMLElement>('.acc-review')!;
      const items = accordion.panels.slice(0, -1).map(
        (panel) => html`
          <dt>${panel.querySelector('.acc-step-name')?.textContent}</dt>
          <dd>${panel.querySelector('[slot="subtitle"]')?.textContent}</dd>
        `
      );

      render(items, list);
    };

    const next = async (event: Event) => {
      const step = (event.currentTarget as HTMLElement).closest(
        'igc-expansion-panel'
      )!;
      const inputs = Array.from(step.querySelectorAll('igc-input'));

      if (!inputs.map((input) => input.reportValidity()).every(Boolean)) {
        return;
      }

      const accordion = step.closest('igc-accordion')!;
      const following = step.nextElementSibling as IgcExpansionPanelComponent;

      step.querySelector('[slot="subtitle"]')!.textContent = summarize(step);
      step.querySelector('igc-badge')!.variant = 'success';
      following.disabled = false;

      if (!following.nextElementSibling) {
        review(accordion);
      }

      await Promise.all([step.hide(), following.show()]);
      firstField(following)?.focus();
    };

    const place = async (event: Event) => {
      const accordion = (event.currentTarget as HTMLElement).closest(
        'igc-accordion'
      )!;
      const confirmation = accordion.nextElementSibling as HTMLElement;

      await accordion.hideAll();

      for (const panel of accordion.panels) {
        panel.disabled = true;
      }

      confirmation.hidden = false;
      confirmation.focus();
    };

    const stepPanel = (
      number: number,
      name: string,
      hint: string,
      content: unknown,
      open = false
    ) => html`
      <igc-expansion-panel
        indicator-position="none"
        ?open=${open}
        ?disabled=${!open}
      >
        <span slot="title" class="acc-title">
          <igc-badge>${number}</igc-badge>
          <span class="acc-step-name">${name}</span>
        </span>
        <span slot="subtitle">${hint}</span>
        ${content}
      </igc-expansion-panel>
    `;

    const radio = (value: string, label: string, detail: string) => html`
      <igc-radio value=${value}>
        <span class="acc-option">${label}</span> ·
        <span class="muted">${detail}</span>
      </igc-radio>
    `;

    const addressFields = [
      ['Full name', 'name'],
      ['Street address', 'street-address'],
      ['City', 'address-level2'],
      ['Postal code', 'postal-code'],
    ];

    return html`
      ${styles}
      <style>
        .acc-form {
          display: grid;
          gap: 1rem;
        }

        .acc-form igc-button {
          justify-self: start;
        }

        .acc-confirmation {
          margin-block-start: 1rem;
          font-weight: 600;
        }
      </style>
      <div class="acc-page">
        <igc-accordion single-expand>
          ${stepPanel(
            1,
            'Shipping address',
            'Where do we send the order?',
            html`
              <div class="acc-form">
                ${addressFields.map(
                  ([label, autocomplete]) => html`
                    <igc-input
                      label=${label}
                      autocomplete=${autocomplete}
                      required
                    ></igc-input>
                  `
                )}
                <igc-button @click=${next}>Continue</igc-button>
              </div>
            `,
            true
          )}
          ${stepPanel(
            2,
            'Delivery',
            'How fast do you need it?',
            html`
              <div class="acc-form">
                <igc-radio-group value="standard">
                  ${radio('standard', 'Standard', 'Free, 3 to 5 business days')}
                  ${radio('express', 'Express', '$12, 1 to 2 business days')}
                  ${radio('pickup', 'Store pickup', 'Free, tomorrow')}
                </igc-radio-group>
                <igc-button @click=${next}>Continue</igc-button>
              </div>
            `
          )}
          ${stepPanel(
            3,
            'Payment',
            'How do you want to pay?',
            html`
              <div class="acc-form">
                <igc-radio-group value="card">
                  ${radio('card', 'Credit card', 'Visa ending in 4242')}
                  ${radio('paypal', 'PayPal', 'You confirm on the next page')}
                  ${radio('invoice', 'Invoice', 'Pay within 14 days')}
                </igc-radio-group>
                <igc-button @click=${next}>Continue</igc-button>
              </div>
            `
          )}
          ${stepPanel(
            4,
            'Review',
            'Check your order',
            html`
              <div class="acc-form">
                <dl class="acc-specs acc-review"></dl>
                <igc-button @click=${place}>Place order</igc-button>
              </div>
            `
          )}
        </igc-accordion>
        <p class="acc-confirmation" tabindex="-1" hidden>
          Thank you. We sent the confirmation of order #10428 to your email.
        </p>
      </div>
    `;
  },
};

interface Product {
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
}

const products: Product[] = [
  {
    name: 'Trail Runner 2',
    category: 'Shoes',
    brand: 'Peak',
    price: 129,
    rating: 4.6,
  },
  {
    name: 'Road Racer',
    category: 'Shoes',
    brand: 'Swift',
    price: 149,
    rating: 4.4,
  },
  {
    name: 'Daily Trainer',
    category: 'Shoes',
    brand: 'Stride',
    price: 89,
    rating: 4.1,
  },
  {
    name: 'Rain Shell',
    category: 'Jackets',
    brand: 'Peak',
    price: 179,
    rating: 4.7,
  },
  {
    name: 'Wind Breaker',
    category: 'Jackets',
    brand: 'Swift',
    price: 99,
    rating: 3.9,
  },
  {
    name: 'Down Vest',
    category: 'Jackets',
    brand: 'Stride',
    price: 139,
    rating: 4.3,
  },
  {
    name: 'Hydration Pack',
    category: 'Accessories',
    brand: 'Peak',
    price: 69,
    rating: 4.5,
  },
  {
    name: 'Running Cap',
    category: 'Accessories',
    brand: 'Swift',
    price: 25,
    rating: 4,
  },
  {
    name: 'Merino Socks',
    category: 'Accessories',
    brand: 'Stride',
    price: 18,
    rating: 4.8,
  },
  {
    name: 'Tempo Shorts',
    category: 'Apparel',
    brand: 'Swift',
    price: 45,
    rating: 4.2,
  },
  {
    name: 'Base Layer',
    category: 'Apparel',
    brand: 'Peak',
    price: 59,
    rating: 4.4,
  },
  {
    name: 'Thermal Tights',
    category: 'Apparel',
    brand: 'Stride',
    price: 75,
    rating: 3.8,
  },
];

const priceRanges = [
  { value: 'any', label: 'Any price', min: 0, max: Number.POSITIVE_INFINITY },
  { value: 'under-50', label: 'Under $50', min: 0, max: 50 },
  { value: '50-100', label: '$50 to $100', min: 50, max: 100 },
  {
    value: 'over-100',
    label: 'Over $100',
    min: 100,
    max: Number.POSITIVE_INFINITY,
  },
];

const ratings = [
  { value: 'any', label: 'Any rating', min: 0 },
  { value: '4', label: '4 stars and up', min: 4 },
  { value: '4.5', label: '4.5 stars and up', min: 4.5 },
];

export const Filters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The filters of a product list. Without `single-expand`, the user can keep several filter groups open. The buttons call `showAll()` and `hideAll()`. "Show active" uses the `panels` property to open only the groups with an active filter. Each header shows the number of active filters in a badge, and the selected values in the `subtitle` slot.',
      },
    },
  },
  render: () => {
    const state = {
      categories: new Set<string>(),
      brands: new Set<string>(),
      price: 'any',
      rating: 'any',
    };

    const accordion = createRef<IgcAccordionComponent>();

    const unique = (key: 'category' | 'brand') =>
      Array.from(new Set(products.map((product) => product[key])));

    const toggle =
      (set: Set<string>, value: string) =>
      ({ detail }: CustomEvent<{ checked: boolean }>) => {
        if (detail.checked) {
          set.add(value);
        } else {
          set.delete(value);
        }
        update();
      };

    const select =
      (key: 'price' | 'rating') =>
      ({ currentTarget }: Event) => {
        state[key] = (currentTarget as IgcRadioGroupComponent).value;
        update();
      };

    const clear = () => {
      state.categories.clear();
      state.brands.clear();
      state.price = 'any';
      state.rating = 'any';
      update();
    };

    const showActive = () => {
      for (const panel of accordion.value?.panels ?? []) {
        if (panel.dataset.active === undefined) {
          panel.hide();
        } else {
          panel.show();
        }
      }
    };

    const group = (title: string, selected: string[], content: unknown) => html`
      <igc-expansion-panel ?data-active=${selected.length > 0}>
        <span slot="title" class="acc-title">
          ${title}
          <igc-badge ?hidden=${selected.length === 0}>
            ${selected.length}<span class="sr-only"> active</span>
          </igc-badge>
        </span>
        <span slot="subtitle">
          ${selected.length ? selected.join(', ') : 'All'}
        </span>
        <div class="acc-options">${content}</div>
      </igc-expansion-panel>
    `;

    const checkboxes = (key: 'category' | 'brand', set: Set<string>) =>
      unique(key).map(
        (value) => html`
          <igc-checkbox
            .checked=${set.has(value)}
            @igcChange=${toggle(set, value)}
          >
            ${value}
          </igc-checkbox>
        `
      );

    const radios = (
      key: 'price' | 'rating',
      options: { value: string; label: string }[]
    ) => html`
      <igc-radio-group .value=${state[key]} @igcChange=${select(key)}>
        ${options.map(
          ({ value, label }) =>
            html`<igc-radio value=${value}>${label}</igc-radio>`
        )}
      </igc-radio-group>
    `;

    const { mount, update } = renderInto(() => {
      const range = priceRanges.find(({ value }) => value === state.price)!;
      const rating = ratings.find(({ value }) => value === state.rating)!;
      const visible = products.filter(
        (product) =>
          (!state.categories.size || state.categories.has(product.category)) &&
          (!state.brands.size || state.brands.has(product.brand)) &&
          product.price >= range.min &&
          product.price < range.max &&
          product.rating >= rating.min
      );
      const active =
        state.categories.size +
        state.brands.size +
        Number(state.price !== 'any') +
        Number(state.rating !== 'any');

      return html`
        <aside aria-label="Filters">
          <div class="acc-toolbar acc-small">
            <igc-button
              variant="flat"
              @click=${() => accordion.value?.showAll()}
            >
              Expand all
            </igc-button>
            <igc-button
              variant="flat"
              @click=${() => accordion.value?.hideAll()}
            >
              Collapse all
            </igc-button>
            <igc-button
              variant="flat"
              ?disabled=${active === 0}
              @click=${showActive}
            >
              Show active
            </igc-button>
          </div>
          <igc-accordion ${ref(accordion)}>
            ${group(
              'Category',
              [...state.categories],
              checkboxes('category', state.categories)
            )}
            ${group(
              'Brand',
              [...state.brands],
              checkboxes('brand', state.brands)
            )}
            ${group(
              'Price',
              state.price === 'any' ? [] : [range.label],
              radios('price', priceRanges)
            )}
            ${group(
              'Rating',
              state.rating === 'any' ? [] : [rating.label],
              radios('rating', ratings)
            )}
          </igc-accordion>
          <igc-button
            variant="outlined"
            ?disabled=${active === 0}
            @click=${clear}
          >
            Clear filters
          </igc-button>
        </aside>
        <section aria-label="Products">
          <p class="muted" role="status">
            ${visible.length} of ${products.length} products
          </p>
          <ul class="acc-products">
            ${visible.map(
              ({ name, brand, category, price, rating }) => html`
                <li>
                  <strong>${name}</strong>
                  <span class="muted">${brand} · ${category}</span>
                  <span>$${price} · ${rating} stars</span>
                </li>
              `
            )}
          </ul>
        </section>
      `;
    });

    return html`
      ${styles}
      <style>
        .acc-shop {
          display: grid;
          grid-template-columns: minmax(16rem, 20rem) 1fr;
          gap: 2rem;
          align-items: start;
        }

        .acc-shop aside > igc-button {
          margin-block-start: 1rem;
        }

        .acc-options {
          display: grid;
          gap: 0.25rem;
        }

        .acc-products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .acc-products li {
          display: grid;
          gap: 0.25rem;
          padding: 0.75rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        @media (max-width: 40rem) {
          .acc-shop {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="acc-shop" ${mount}></div>
    `;
  },
};

interface Order {
  id: string;
  date: string;
  status: 'Delivered' | 'Returned';
  total: string;
  items: { name: string; quantity: number; price: string }[];
}

const orders: Order[] = [
  {
    id: '10428',
    date: 'September 24, 2026',
    status: 'Delivered',
    total: '$184.00',
    items: [
      { name: 'Trail Runner 2', quantity: 1, price: '$129.00' },
      { name: 'Merino Socks', quantity: 2, price: '$36.00' },
      { name: 'Running Cap', quantity: 1, price: '$19.00' },
    ],
  },
  {
    id: '10391',
    date: 'September 2, 2026',
    status: 'Delivered',
    total: '$69.00',
    items: [{ name: 'Hydration Pack', quantity: 1, price: '$69.00' }],
  },
  {
    id: '10377',
    date: 'August 18, 2026',
    status: 'Returned',
    total: '$254.50',
    items: [
      { name: 'Rain Shell', quantity: 1, price: '$179.00' },
      { name: 'Thermal Tights', quantity: 1, price: '$75.50' },
    ],
  },
];

interface OrderState {
  status: 'idle' | 'loading' | 'ready';
  saved: string;
  draft: string;
  blocked: boolean;
}

export const OrderHistory: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The order history of an account. The panels emit `igcOpening`, `igcOpened`, `igcClosing` and `igcClosed`, and the events bubble through the accordion, so one listener on the accordion handles all panels. On the first `igcOpening` of a panel, the handler loads the items of the order. `igcClosing` is cancelable: type a note and then try to close the panel. The handler calls `preventDefault()` until you save or discard the note. The log shows the events.',
      },
    },
  },
  render: () => {
    const limit = 8;
    const state = new Map<string, OrderState>(
      orders.map(({ id }) => [
        id,
        { status: 'idle', saved: '', draft: '', blocked: false },
      ])
    );
    const log: string[] = [];

    const record = (event: CustomEvent<IgcExpansionPanelComponent>) => {
      const canceled = event.defaultPrevented ? ' (canceled)' : '';
      log.unshift(
        `${event.type}: order #${event.detail.dataset.order}${canceled}`
      );
      log.length = Math.min(log.length, limit);
      update();
    };

    const load = async (id: string) => {
      state.get(id)!.status = 'loading';
      update();
      await delay(1200);
      state.get(id)!.status = 'ready';
      update();
    };

    const opening = (event: CustomEvent<IgcExpansionPanelComponent>) => {
      const id = event.detail.dataset.order!;

      if (state.get(id)!.status === 'idle') {
        load(id);
      }

      record(event);
    };

    const closing = (event: CustomEvent<IgcExpansionPanelComponent>) => {
      const order = state.get(event.detail.dataset.order!)!;

      if (order.draft !== order.saved) {
        event.preventDefault();
        order.blocked = true;
      }

      record(event);
    };

    const edit = (order: OrderState) => (event: CustomEvent<string>) => {
      order.draft = event.detail;
      update();
    };

    const resolve = (order: OrderState, keep: boolean) => () => {
      if (keep) {
        order.saved = order.draft;
      } else {
        order.draft = order.saved;
      }

      order.blocked = false;
      update();
    };

    const details = ({ id, items }: Order) => {
      const order = state.get(id)!;

      if (order.status !== 'ready') {
        return html`
          <igc-circular-progress
            indeterminate
            aria-label="Loading the items of order #${id}"
          ></igc-circular-progress>
        `;
      }

      const dirty = order.draft !== order.saved;

      return html`
        <ul class="acc-items">
          ${items.map(
            ({ name, quantity, price }) => html`
              <li>
                <span>${quantity} × ${name}</span>
                <span>${price}</span>
              </li>
            `
          )}
        </ul>
        <igc-input
          label="Note for our support team"
          .value=${order.draft}
          @igcInput=${edit(order)}
        ></igc-input>
        ${
          order.blocked
            ? html`
                <p class="acc-warning" role="alert">
                  Save or discard the note before you close the order.
                </p>
              `
            : nothing
        }
        <div class="acc-toolbar">
          <igc-button ?disabled=${!dirty} @click=${resolve(order, true)}>
            Save note
          </igc-button>
          <igc-button
            variant="flat"
            ?disabled=${!dirty}
            @click=${resolve(order, false)}
          >
            Discard
          </igc-button>
        </div>
      `;
    };

    const { mount, update } = renderInto(
      () => html`
        <igc-accordion
          @igcOpening=${opening}
          @igcOpened=${record}
          @igcClosing=${closing}
          @igcClosed=${record}
        >
          ${orders.map(
            (order) => html`
              <igc-expansion-panel data-order=${order.id}>
                <span slot="title" class="acc-title">
                  Order #${order.id}
                  <igc-badge
                    shape="square"
                    variant=${
                      order.status === 'Delivered' ? 'success' : 'warning'
                    }
                  >
                    ${order.status}
                  </igc-badge>
                </span>
                <span slot="subtitle">${order.date} · ${order.total}</span>
                <div class="acc-order">${details(order)}</div>
              </igc-expansion-panel>
            `
          )}
        </igc-accordion>
        <section>
          <h4>Event log (latest first)</h4>
          <ol>
            ${log.map((entry) => html`<li>${entry}</li>`)}
          </ol>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        .acc-history {
          display: grid;
          grid-template-columns: minmax(20rem, 36rem) minmax(16rem, 1fr);
          gap: 2rem;
          align-items: start;
        }

        .acc-history h4 {
          margin: 0;
        }

        .acc-order {
          display: grid;
          gap: 1rem;
          min-height: 3rem;
        }

        .acc-items {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .acc-items li {
          display: flex;
          justify-content: space-between;
        }

        .acc-warning {
          margin: 0;
          color: var(--ig-error-700);
        }

        .acc-order .acc-toolbar {
          margin: 0;
        }

        @media (max-width: 48rem) {
          .acc-history {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="acc-history" ${mount}></div>
    `;
  },
};
