import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcRatingComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
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
  IgcCheckboxComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcRatingComponent,
  IgcTextareaComponent
);
registerMaterialIcons('alert-error');

// region default
const metadata: Meta<IgcRatingComponent> = {
  title: 'Rating',
  component: 'igc-rating',
  parameters: {
    docs: {
      description: {
        component:
          'A rating component that allows users to view and provide ratings using customizable symbols.\nIt supports fractional values, hover previews, keyboard navigation, single-selection mode,\nand integrates with forms as a number input.',
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
      table: { defaultValue: { summary: '5' } },
    },
    step: {
      type: 'number',
      description:
        'The minimum value change allowed.\n\nValid values are in the interval between 0.001 and 1 inclusive.\nThe component clamps a value outside of the interval to the closest bound.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
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
      description: 'The value of the component',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    hoverPreview: {
      type: 'boolean',
      description:
        'Whether to show a preview of the value when hovering over the symbols.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    single: {
      type: 'boolean',
      description: 'Toggles single selection visual mode.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    allowReset: {
      type: 'boolean',
      description:
        'Whether to reset the rating when the user selects the same value.',
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
   * Valid values are in the interval between 0.001 and 1 inclusive.
   * The component clamps a value outside of the interval to the closest bound.
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
  /** The value of the component */
  value: number;
  /** Whether to show a preview of the value when hovering over the symbols. */
  hoverPreview: boolean;
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** Toggles single selection visual mode. */
  single: boolean;
  /** Whether to reset the rating when the user selects the same value. */
  allowReset: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
}
type Story = StoryObj<IgcRatingArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .rt-panel {
      display: grid;
      gap: 1rem;
      max-width: 36rem;
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .rt-panel :is(h3, h4, p) {
      margin: 0;
    }

    .rt-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
    }

    .rt-field {
      display: grid;
      gap: 0.25rem;
    }

    .rt-field > label,
    .rt-panel legend {
      padding: 0;
      font-weight: 600;
    }

    .rt-panel fieldset {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      border: 0;
    }

    .rt-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  args: {
    label: 'Rate this movie',
    value: 3.5,
    step: 0.5,
    hoverPreview: true,
    valueFormat: '{0} of {1} stars',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A half-star movie rating. With `step` 0.5, a click on the first half of a star selects a half star, and `hover-preview` fills the stars under the pointer before you click. The arrow keys change the value by one step, Home selects one step and End selects the maximum. `value-format` sets the text that screen readers announce for the value. Use the controls panel to change the scale, the step and the states.',
      },
    },
  },
  render: (args) => html`
    <igc-rating
      label=${ifDefined(args.label)}
      name=${ifDefined(args.name)}
      value-format=${ifDefined(args.valueFormat)}
      ?single=${args.single}
      ?allow-reset=${args.allowReset}
      ?hover-preview=${args.hoverPreview}
      ?readonly=${args.readOnly}
      ?disabled=${args.disabled}
      .invalid=${args.invalid}
      .max=${args.max}
      .step=${args.step}
      .value=${args.value}
    ></igc-rating>
  `,
};

/** The number of reviews with 1 to 5 stars. */
const starCounts = [64, 64, 116, 334, 706];
const reviewTotal = starCounts.reduce((sum, count) => sum + count, 0);
const averageRating =
  Math.round(
    (starCounts.reduce((sum, count, i) => sum + count * (i + 1), 0) /
      reviewTotal) *
      10
  ) / 10;

const recentReviews = [
  {
    id: 'rt-review-1',
    stars: 5,
    title: 'Light and grippy',
    author: 'Maya R.',
    date: 'September 28, 2026',
    text: 'I ran a muddy 30 km trail in them and never slipped. They dry overnight.',
  },
  {
    id: 'rt-review-2',
    stars: 4,
    title: 'Great after a short break-in',
    author: 'Jonas K.',
    date: 'September 21, 2026',
    text: 'A bit stiff for the first week. Now they are the most comfortable pair I own.',
  },
  {
    id: 'rt-review-3',
    stars: 5,
    title: 'Room for my toes at last',
    author: 'Priya S.',
    date: 'September 14, 2026',
    text: 'The wide toe box keeps my feet happy on long descents.',
  },
  {
    id: 'rt-review-4',
    stars: 3,
    title: 'Runs half a size small',
    author: 'Tom B.',
    date: 'September 9, 2026',
    text: 'Good grip and cushioning, but order half a size up.',
  },
  {
    id: 'rt-review-5',
    stars: 1,
    title: 'The sole came off',
    author: 'Alex M.',
    date: 'September 2, 2026',
    text: 'The sole of the left shoe came off after 200 km. Support sent me a new pair.',
  },
];

export const CustomerReviews: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The review summary of a product. The average rating and the rating of each review are `readonly`: they show a value and take no input, and they stay in the tab order, so that screen reader users can read the value. A fractional value fills part of a star, so the average of 4.2 fills a fifth of the last star. `--symbol-size` makes the stars of the reviews smaller. Select a bar to show only the reviews with that number of stars.',
      },
    },
  },
  render: () => {
    const state = { stars: 0 };

    const { mount, update } = renderInto(() => {
      const shown = state.stars
        ? recentReviews.filter(({ stars }) => stars === state.stars)
        : recentReviews;

      return html`
        <section class="rt-panel" aria-labelledby="rt-reviews-title">
          <h3 id="rt-reviews-title">Customer reviews</h3>
          <div class="rt-row">
            <span class="rt-score" aria-hidden="true">${averageRating}</span>
            <div>
              <igc-rating
                readonly
                aria-label="Average rating"
                value-format="{0} out of {1} stars"
                .value=${averageRating}
              ></igc-rating>
              <p class="muted">
                ${reviewTotal.toLocaleString('en-US')} reviews
              </p>
            </div>
          </div>
          <ul class="rt-bars" aria-label="Filter the reviews by stars">
            ${[5, 4, 3, 2, 1].map((stars) => {
              const share = Math.round(
                (starCounts[stars - 1] / reviewTotal) * 100
              );

              return html`
                <li>
                  <button
                    type="button"
                    aria-pressed=${state.stars === stars}
                    @click=${() => {
                      state.stars = state.stars === stars ? 0 : stars;
                      update();
                    }}
                  >
                    <span>${plural(stars, 'star')}</span>
                    <span class="rt-bar" aria-hidden="true">
                      <span
                        style=${styleMap({ inlineSize: `${share}%` })}
                      ></span>
                    </span>
                    <span>${share}%</span>
                  </button>
                </li>
              `;
            })}
          </ul>
          <p role="status" class="muted">
            ${
              state.stars
                ? `${shown.length} of the recent reviews have ${plural(state.stars, 'star')}.`
                : `The ${recentReviews.length} most recent reviews.`
            }
          </p>
          ${shown.map(
            (review) => html`
              <article class="rt-review" aria-labelledby=${review.id}>
                <igc-rating
                  readonly
                  aria-label="Rating"
                  value-format="{0} out of {1} stars"
                  .value=${review.stars}
                ></igc-rating>
                <h4 id=${review.id}>${review.title}</h4>
                <p class="muted">${review.author}, ${review.date}</p>
                <p>${review.text}</p>
              </article>
            `
          )}
        </section>
      `;
    });

    return html`
      ${styles}
      <style>
        .rt-score {
          font-size: 3rem;
          font-weight: 600;
          line-height: 1;
        }

        .rt-bars {
          display: grid;
          gap: 0.25rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .rt-bars button {
          display: grid;
          grid-template-columns: 4rem 1fr 3rem;
          align-items: center;
          gap: 0.75rem;
          inline-size: 100%;
          padding: 0.25rem 0.5rem;
          border: 0;
          border-radius: 4px;
          background: none;
          color: inherit;
          font: inherit;
          text-align: start;
          cursor: pointer;
        }

        .rt-bars button:hover,
        .rt-bars [aria-pressed='true'] {
          background: var(--ig-gray-100);
        }

        .rt-bars [aria-pressed='true'] {
          font-weight: 600;
        }

        .rt-bars button:focus-visible {
          outline: 2px solid var(--ig-primary-500);
        }

        .rt-bar {
          display: flex;
          block-size: 0.5rem;
          border-radius: 4px;
          overflow: hidden;
          background: var(--ig-gray-200);
        }

        .rt-bar > span {
          background: var(--ig-warn-500);
        }

        .rt-review {
          display: grid;
          gap: 0.25rem;
          padding-block-start: 1rem;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .rt-review igc-rating {
          --symbol-size: 1.125rem;
        }
      </style>
      <div ${mount}></div>
    `;
  },
};

const overallWords = [
  '',
  'Terrible',
  'Poor',
  'Average',
  'Very good',
  'Excellent',
];
const stayAspects = ['Cleanliness', 'Location', 'Service', 'Value'];
const overallRequired = 'Select an overall rating.';

/** The rating has no `required` attribute, so a custom error requires a value. */
function requireRating(rating: IgcRatingComponent): void {
  rating.setCustomValidity(rating.value ? '' : overallRequired);
}

export const WriteReview: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A hotel review form. The overall rating is required. The rating has no `required` attribute, so `setCustomValidity()` makes it invalid while its value is 0. A failed submit then focuses it, the `:state(ig-invalid)` selector colors its empty stars, and the host `aria-describedby` adds the error to its description. The word next to the stars follows `igcHover` while the pointer is on the stars, and `value-format` adds the word to the announced value. The optional ratings use `allow-reset`: a click on the selected star sets the value back to 0. A `label` element with `for` names each rating. Reset restores the default values.',
      },
    },
  },
  render: () => {
    const state = { overall: 0, preview: 0, showError: false };
    const requireOnConnect = (element?: Element) => {
      if (element) {
        requireRating(element as IgcRatingComponent);
      }
    };

    const { mount, update } = renderInto(() => {
      const shown = state.preview || state.overall;

      return html`
        <form
          class="rt-panel"
          @submit=${formSubmitHandler}
          @reset=${(event: Event) => {
            const form = event.currentTarget as HTMLFormElement;
            // The custom error stays through the reset of the value.
            form
              .querySelector<IgcRatingComponent>('#rt-overall')
              ?.setCustomValidity(overallRequired);
            Object.assign(state, { overall: 0, preview: 0, showError: false });
            update();
          }}
        >
          <h3>Review your stay at Harbor View Hotel</h3>
          <div class="rt-field">
            <label for="rt-overall">Overall rating</label>
            <div class="rt-row">
              <igc-rating
                id="rt-overall"
                name="overall"
                hover-preview
                ${ref(requireOnConnect)}
                aria-describedby=${
                  state.showError ? 'rt-overall-error' : nothing
                }
                .valueFormat=${
                  state.overall
                    ? `{0} of {1} stars, ${overallWords[state.overall]}`
                    : 'Not rated'
                }
                @igcHover=${({ detail }: CustomEvent<number>) => {
                  state.preview = detail;
                  update();
                }}
                @pointerleave=${() => {
                  // The host shows only the stars, so leaving it ends the preview.
                  state.preview = 0;
                  update();
                }}
                @igcChange=${({ target, detail }: CustomEvent<number>) => {
                  const rating = target as IgcRatingComponent;
                  requireRating(rating);
                  state.overall = detail;
                  state.showError = rating.invalid;
                  update();
                }}
                @invalid=${() => {
                  state.showError = true;
                  update();
                }}
              ></igc-rating>
              <span aria-hidden="true">${overallWords[shown]}</span>
            </div>
            ${
              state.showError
                ? html`
                    <p id="rt-overall-error" class="rt-error">
                      <igc-icon name="alert-error"></igc-icon>
                      ${overallRequired}
                    </p>
                  `
                : nothing
            }
          </div>
          <fieldset class="rt-aspects">
            <legend>Rate the details (optional)</legend>
            <p class="muted">
              Click the selected star again to clear a rating.
            </p>
            ${stayAspects.map((aspect) => {
              const name = aspect.toLowerCase();

              return html`
                <div class="rt-row">
                  <label for=${`rt-${name}`}>${aspect}</label>
                  <igc-rating
                    id=${`rt-${name}`}
                    name=${name}
                    allow-reset
                  ></igc-rating>
                </div>
              `;
            })}
          </fieldset>
          <igc-input name="title" label="Title" required></igc-input>
          <igc-textarea
            name="review"
            label="Your review"
            required
            rows="4"
          ></igc-textarea>
          <div class="rt-actions">
            <igc-button type="submit">Submit review</igc-button>
            <igc-button type="reset" variant="outlined">Reset</igc-button>
          </div>
        </form>
      `;
    });

    return html`
      ${styles}
      <style>
        #rt-overall:state(ig-invalid) {
          --symbol-empty-color: var(--ig-error-500);
        }

        .rt-error {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .rt-error igc-icon {
          --ig-icon-size: 1.25rem;

          color: var(--ig-error-500);
        }

        .rt-aspects label {
          min-inline-size: 7rem;
        }
      </style>
      <div ${mount}></div>
    `;
  },
};

const satisfaction = [
  { emoji: '😣', text: 'Very dissatisfied' },
  { emoji: '😔', text: 'Dissatisfied' },
  { emoji: '😐', text: 'Neutral' },
  { emoji: '🙂', text: 'Satisfied' },
  { emoji: '😆', text: 'Very satisfied' },
];

const supportProblems = [
  'The reply was slow',
  'My problem is not solved',
  'The answer was hard to follow',
];

export const SupportFeedback: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A satisfaction survey after a support chat. Projected `igc-rating-symbol` elements show emoji, and their number sets `max`. With `single`, only the selected emoji is in color. The `value-label` slot shows the answer as text, and `value-format` gives screen readers the same text in place of a number. A low rating asks what went wrong.',
      },
    },
  },
  render: () => {
    const state = { value: 0, sent: false };

    const story = renderInto(() => {
      if (state.sent) {
        return html`
          <div class="rt-panel">
            <h3 class="rt-thanks" tabindex="-1">Thank you for your feedback</h3>
            <p>We read every answer and use it to improve our support.</p>
            <div class="rt-actions">
              <igc-button
                variant="outlined"
                @click=${() => {
                  Object.assign(state, { value: 0, sent: false });
                  story.update();
                }}
                >Answer again</igc-button
              >
            </div>
          </div>
        `;
      }

      const answer = satisfaction[state.value - 1];
      const low = state.value > 0 && state.value <= 2;

      return html`
        <form
          class="rt-panel rt-feedback"
          @submit=${(event: SubmitEvent) => {
            event.preventDefault();
            state.sent = true;
            story.update();
            story.host?.querySelector<HTMLElement>('.rt-thanks')?.focus();
          }}
        >
          <h3>How did we do?</h3>
          <p class="muted">
            You chatted with Alex from support about a refund on October 5.
          </p>
          <igc-rating
            name="satisfaction"
            label="How satisfied are you with the support?"
            single
            .valueFormat=${answer?.text ?? 'No answer'}
            @igcChange=${({ detail }: CustomEvent<number>) => {
              state.value = detail;
              story.update();
            }}
          >
            ${satisfaction.map(
              ({ emoji }) => html`
                <igc-rating-symbol>
                  <span>${emoji}</span>
                  <span slot="empty">${emoji}</span>
                </igc-rating-symbol>
              `
            )}
            ${
              answer
                ? html`<span slot="value-label">${answer.text}</span>`
                : nothing
            }
          </igc-rating>
          ${
            low
              ? html`
                  <fieldset>
                    <legend>What went wrong?</legend>
                    ${supportProblems.map(
                      (problem) => html`
                        <igc-checkbox name="problems" value=${problem}>
                          ${problem}
                        </igc-checkbox>
                      `
                    )}
                  </fieldset>
                `
              : nothing
          }
          ${
            answer
              ? html`
                  <igc-textarea
                    name="comment"
                    label=${
                      low
                        ? 'How can we do better?'
                        : 'Anything else you want to tell us?'
                    }
                  ></igc-textarea>
                `
              : nothing
          }
          <div class="rt-actions">
            <igc-button type="submit" ?disabled=${!answer}>
              Send feedback
            </igc-button>
          </div>
        </form>
      `;
    });

    return html`
      ${styles}
      <style>
        .rt-feedback igc-rating {
          --symbol-size: 2.5rem;
        }

        .rt-feedback igc-rating::part(symbols) {
          gap: 0.5rem;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const priceLevels = ['Inexpensive', 'Moderate', 'Expensive', 'Very expensive'];

const restaurants = [
  { name: 'Casa Verde', cuisine: 'Mexican', price: 1, rating: 4.6 },
  { name: 'Lotus Garden', cuisine: 'Thai', price: 2, rating: 4.3 },
  { name: 'The Copper Pot', cuisine: 'French', price: 4, rating: 4.8 },
  { name: 'Nonna Rosa', cuisine: 'Italian', price: 2, rating: 4.5 },
  { name: 'Smokehouse 52', cuisine: 'Barbecue', price: 2, rating: 3.9 },
  { name: 'Sakura Bar', cuisine: 'Japanese', price: 3, rating: 4.7 },
  { name: 'Corner Bistro', cuisine: 'American', price: 1, rating: 3.6 },
  { name: 'Spice Route', cuisine: 'Indian', price: 2, rating: 4.4 },
];

function priceText(price: number): string {
  return price ? `${priceLevels[price - 1]} or less` : 'Any price';
}

function starsText(stars: number): string {
  return stars ? `${plural(stars, 'star')} and up` : 'Any rating';
}

export const RestaurantFilters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The filters of a restaurant search. The price filter projects four `$` text symbols, so its maximum is 4, and colors them with `--symbol-full-color` and `--symbol-empty-color`. Both filters use `allow-reset`, so a click on the selected symbol clears the filter. The `value-label` slot shows each filter as text, and `value-format` announces the same text. The results follow `igcChange`.',
      },
    },
  },
  render: () => {
    const state = { price: 0, stars: 0 };

    const { mount, update } = renderInto(() => {
      const results = restaurants.filter(
        ({ price, rating }) =>
          (!state.price || price <= state.price) && rating >= state.stars
      );

      return html`
        <section class="rt-panel" aria-labelledby="rt-search-title">
          <h3 id="rt-search-title">Restaurants near you</h3>
          <div class="rt-filters">
            <igc-rating
              class="rt-price"
              label="Price"
              allow-reset
              .value=${state.price}
              .valueFormat=${priceText(state.price)}
              @igcChange=${({ detail }: CustomEvent<number>) => {
                state.price = detail;
                update();
              }}
            >
              ${priceLevels.map(
                () => html`
                  <igc-rating-symbol>
                    <span>$</span>
                    <span slot="empty">$</span>
                  </igc-rating-symbol>
                `
              )}
              <span slot="value-label">${priceText(state.price)}</span>
            </igc-rating>
            <igc-rating
              label="Rating"
              allow-reset
              hover-preview
              .value=${state.stars}
              .valueFormat=${starsText(state.stars)}
              @igcChange=${({ detail }: CustomEvent<number>) => {
                state.stars = detail;
                update();
              }}
            >
              <span slot="value-label">${starsText(state.stars)}</span>
            </igc-rating>
            <igc-button
              variant="outlined"
              ?disabled=${!(state.price || state.stars)}
              @click=${() => {
                Object.assign(state, { price: 0, stars: 0 });
                update();
              }}
              >Clear filters</igc-button
            >
          </div>
          <p role="status" class="muted">
            ${results.length} of ${restaurants.length} restaurants
          </p>
          <ul class="rt-results">
            ${results.map(
              ({ name, cuisine, price, rating }) => html`
                <li>
                  <h4>${name}</h4>
                  <p class="muted">
                    ${cuisine} ·
                    <span aria-hidden="true">${'$'.repeat(price)}</span>
                    <span class="sr-only">${priceLevels[price - 1]}</span> ·
                    Rated ${rating}
                  </p>
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
        .rt-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: end;
          gap: 1rem 2rem;
        }

        .rt-price {
          --symbol-full-color: var(--ig-success-500);
          --symbol-empty-color: var(--ig-gray-400);
        }

        .rt-results {
          display: grid;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .rt-results li {
          display: grid;
          gap: 0.125rem;
          padding: 0.75rem 1rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }
      </style>
      <div ${mount}></div>
    `;
  },
};
