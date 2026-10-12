import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcCardComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  renderInto,
  storyStyles,
  wholeDollars,
} from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcCardComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent
);

registerMaterialIcons(
  'bookmark',
  'bookmark-border',
  'call',
  'chat',
  'comment',
  'done',
  'email',
  'favorite',
  'favorite-border',
  'more-vert',
  'share'
);

// region default
const metadata: Meta<IgcCardComponent> = {
  title: 'Card',
  component: 'igc-card',
  parameters: {
    docs: {
      description: {
        component:
          'A container component that wraps different elements related to a single subject.\nThe card component provides a flexible container for organizing content such as headers,\nmedia, text content, and actions.',
      },
    },
  },
  argTypes: {
    elevated: {
      type: 'boolean',
      description:
        'Sets the card to have an elevated appearance with shadow.\nWhen false, the card uses an outlined style with a border.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { elevated: false },
};

export default metadata;

interface IgcCardArgs {
  /**
   * Sets the card to have an elevated appearance with shadow.
   * When false, the card uses an outlined style with a border.
   */
  elevated: boolean;
}
type Story = StoryObj<IgcCardArgs>;

// endregion

const images = 'https://www.infragistics.com/angular-demos-lob/assets/images';
const people = 'https://www.infragistics.com/angular-demos/assets/images';

const preventDefault = (event: Event) => event.preventDefault();

const styles = html`
  ${storyStyles}
  <style>
    .cd-stack {
      display: grid;
      gap: 1rem;
      max-width: 64rem;
    }

    .cd-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
      gap: 1.5rem;
    }

    .cd-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }

    .cd-stack :is(h2, h3, p, ul) {
      margin: 0;
    }

    .cd-stack igc-card-content {
      display: grid;
      gap: 0.5rem;
    }

    igc-card-media img {
      aspect-ratio: 16 / 9;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The card of an article in a travel magazine. The media comes first, then the header with the title and the subtitle, the text and the actions. The areas render in the order of the markup. "Read the guide" is a link button, because it opens a page. The `end` slot of `igc-card-actions` puts the icon buttons at the end of the row, and each icon button has an `aria-label`. The title is an `h3` and the subtitle is a paragraph, so the page outline stays correct. Use the `elevated` control to change between the outlined and the elevated appearance.',
      },
    },
  },
  render: ({ elevated }) => html`
    ${styles}
    <div class="cd-stack" style="max-width: 22rem">
      <igc-card ?elevated=${elevated}>
        <igc-card-media>
          <img
            src="${images}/card/media/ny.jpg"
            alt="The skyline of Lower Manhattan at sunset, seen across the Hudson River"
          />
        </igc-card-media>
        <igc-card-header>
          <h3 slot="title">A weekend in New York</h3>
          <p slot="subtitle">Travel guide · 6 min read</p>
        </igc-card-header>
        <igc-card-content>
          <p>
            Walk the High Line, eat in Chelsea Market and see the city lights
            from the Staten Island ferry. Our plan for two days in Manhattan.
          </p>
        </igc-card-content>
        <igc-card-actions>
          <igc-button
            slot="start"
            variant="flat"
            href="#new-york"
            @click=${preventDefault}
          >
            Read the guide
          </igc-button>
          <igc-icon-button
            slot="end"
            variant="flat"
            name="bookmark-border"
            aria-label="Save the guide"
          ></igc-icon-button>
          <igc-icon-button
            slot="end"
            variant="flat"
            name="share"
            aria-label="Share the guide"
          ></igc-icon-button>
        </igc-card-actions>
      </igc-card>
    </div>
  `,
};

const tours = [
  {
    id: 'amalfi',
    title: 'Amalfi Coast',
    place: 'Italy',
    days: 7,
    price: 1890,
    rating: 4.9,
    reviews: 214,
    image: 'WonderfulCoast',
    alt: 'Pastel houses on a steep green cliff above a bay with boats',
  },
  {
    id: 'santorini',
    title: 'Santorini sunsets',
    place: 'Greece',
    days: 6,
    price: 1490,
    rating: 4.8,
    reviews: 187,
    image: 'IslandOfHistory',
    alt: 'White houses, a windmill and a dome above the sea at sunset',
  },
  {
    id: 'maldives',
    title: 'Island beaches',
    place: 'Maldives',
    days: 9,
    price: 2650,
    rating: 4.7,
    reviews: 96,
    image: 'GoldenBeaches',
    alt: 'A woman in a sun hat on a swing chair on a white sand beach',
  },
  {
    id: 'gardens',
    title: 'Pagodas and gardens',
    place: 'Singapore',
    days: 5,
    price: 1290,
    rating: 4.6,
    reviews: 143,
    image: 'CulturalDip',
    alt: 'A pagoda with red roofs and white stone railings',
  },
  {
    id: 'bay',
    title: 'Bay Area road trip',
    place: 'United States',
    days: 8,
    price: 1750,
    rating: 4.5,
    reviews: 78,
    image: 'AmazingBridge',
    alt: 'The Golden Gate Bridge at sunset',
  },
];

export const Tours: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The results page of a travel agency. The cards are in a responsive grid, and each card is a link to its tour. The card is presentational, so the story makes the whole card a link with the "stretched link" pattern. The link is the title, and its `::after` pseudo-element covers the card, which has `position: relative`. The card header has `position: relative` too, so the story sets `position: static` on it, and a `z-index` keeps the overlay above the content. So the accessible name of the link is only the title, and not all the text of the card. The favorite button comes after the header in the markup, so it comes after the link in the tab order. It is in the corner of the image, above the link, with `position: absolute` and a `z-index`. The button changes its `aria-label`, because the icon button does not forward `aria-pressed`. A focus ring on the card shows the focus of the link.',
      },
    },
  },
  render: () => {
    const saved = new Set(['santorini']);
    let message = '';

    const toggle = (id: string) => () => {
      if (saved.has(id)) {
        saved.delete(id);
      } else {
        saved.add(id);
      }
      message = `${saved.size} saved ${saved.size === 1 ? 'tour' : 'tours'}`;
      update();
    };

    const open = (title: string) => (event: Event) => {
      event.preventDefault();
      message = `You opened the ${title} tour.`;
      update();
    };

    const { mount, update } = renderInto(
      () => html`
        <div class="cd-row">
          <h2 style="font-size: 1.25rem">Tours in Europe and beyond</h2>
          <p class="muted" role="status">${message}</p>
        </div>
        <div class="cd-grid">
          ${tours.map(
            (tour) => html`
              <igc-card class="cd-tour">
                <igc-card-media>
                  <img
                    src="${images}/carousel/${tour.image}.png"
                    alt=${tour.alt}
                  />
                </igc-card-media>
                <igc-card-header>
                  <h3 slot="title">
                    <a
                      class="cd-link"
                      href="#${tour.id}"
                      @click=${open(tour.title)}
                    >
                      ${tour.title}
                    </a>
                  </h3>
                  <p slot="subtitle">${tour.place} · ${tour.days} days</p>
                </igc-card-header>
                <igc-icon-button
                  class="cd-favorite"
                  variant="flat"
                  name=${saved.has(tour.id) ? 'favorite' : 'favorite-border'}
                  aria-label=${
                    saved.has(tour.id)
                      ? `Remove ${tour.title} from favorites`
                      : `Add ${tour.title} to favorites`
                  }
                  @click=${toggle(tour.id)}
                ></igc-icon-button>
                <igc-card-content>
                  <p>
                    <span aria-hidden="true">★</span>
                    ${tour.rating}<span class="sr-only"> out of 5</span>
                    <span class="muted">· ${tour.reviews} reviews</span>
                  </p>
                  <p>
                    From <strong>${wholeDollars.format(tour.price)}</strong>
                    <span class="muted">per person</span>
                  </p>
                </igc-card-content>
              </igc-card>
            `
          )}
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .cd-tour {
          position: relative;
        }

        .cd-tour .cd-link {
          color: inherit;
          text-decoration: none;
        }

        /* The hosts of the card areas have position: relative too. */
        .cd-tour igc-card-header {
          position: static;
        }

        .cd-tour .cd-link::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .cd-tour .cd-link:focus-visible {
          outline: none;
        }

        .cd-tour:hover .cd-link {
          text-decoration: underline;
        }

        .cd-tour:has(.cd-link:focus-visible) {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: 2px;
        }

        .cd-tour .cd-favorite {
          position: absolute;
          inset-block-start: 0.5rem;
          inset-inline-end: 0.5rem;
          z-index: 2;
          border-radius: 50%;
          background: var(--ig-surface-500);
        }
      </style>
      <section class="cd-stack" aria-label="Tours" ${mount}></section>
    `;
  },
};

const plans = [
  {
    name: 'Starter',
    summary: 'For one person',
    monthly: 0,
    yearly: 0,
    features: ['3 projects', '2 GB of storage', 'Email support'],
    action: 'Start for free',
  },
  {
    name: 'Team',
    summary: 'For teams that grow',
    monthly: 12,
    yearly: 10,
    features: [
      'Unlimited projects',
      '100 GB of storage',
      'Shared workspaces',
      'Priority support',
    ],
    action: 'Start a free trial',
    recommended: true,
  },
  {
    name: 'Enterprise',
    summary: 'For large organizations',
    monthly: 29,
    yearly: 24,
    features: [
      'All the features of Team',
      'Single sign-on',
      'Audit log',
      'A dedicated account manager',
    ],
    action: 'Contact sales',
  },
];

export const Pricing: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The pricing page of a software product. `elevated` gives the recommended plan a shadow, and the other plans keep the outlined appearance, so the recommended plan comes forward. The badge in the default slot of the header, under the subtitle, names the recommendation in text too. The grid makes all the cards the same height. When `igc-card-actions` is the last child, the card pushes it to the bottom, so the buttons of the plans align. The button group changes the billing period, and the story renders the prices again.',
      },
    },
  },
  render: () => {
    let yearly = false;

    const { mount, update } = renderInto(
      () => html`
        ${plans.map(({ name, summary, features, action, ...plan }) => {
          const price = yearly ? plan.yearly : plan.monthly;

          return html`
            <igc-card class="cd-plan" ?elevated=${plan.recommended}>
              <igc-card-header>
                <h3 slot="title">${name}</h3>
                <p slot="subtitle">${summary}</p>
                ${
                  plan.recommended
                    ? html`<igc-badge>Most popular</igc-badge>`
                    : nothing
                }
              </igc-card-header>
              <igc-card-content>
                <p class="cd-price">
                  <strong
                    >${price ? wholeDollars.format(price) : 'Free'}</strong
                  >
                  ${
                    price
                      ? html`<span class="muted">
                          per user a month${yearly ? ', billed yearly' : ''}
                        </span>`
                      : nothing
                  }
                </p>
                <ul class="cd-features">
                  ${features.map(
                    (feature) => html`
                      <li>
                        <igc-icon name="done" aria-hidden="true"></igc-icon>
                        ${feature}
                      </li>
                    `
                  )}
                </ul>
              </igc-card-content>
              <igc-card-actions>
                <igc-button
                  class="cd-wide"
                  variant=${plan.recommended ? 'contained' : 'outlined'}
                >
                  ${action}
                </igc-button>
              </igc-card-actions>
            </igc-card>
          `;
        })}
      `
    );

    const setPeriod = ({ currentTarget }: Event) => {
      yearly =
        (currentTarget as IgcButtonGroupComponent).selectedItems[0] ===
        'yearly';
      update();
    };

    return html`
      ${styles}
      <style>
        .cd-price strong {
          font-size: 2rem;
        }

        .cd-features {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .cd-features li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cd-features igc-icon {
          color: var(--ig-success-500);
        }

        .cd-wide {
          flex: 1;
        }
      </style>
      <div class="cd-stack">
        <div class="cd-row">
          <igc-button-group
            selection="single-required"
            aria-label="Billing period"
            @igcSelect=${setPeriod}
          >
            <igc-toggle-button value="monthly" selected
              >Monthly</igc-toggle-button
            >
            <igc-toggle-button value="yearly">Yearly</igc-toggle-button>
          </igc-button-group>
          <p class="muted">Pay yearly and get two months for free.</p>
        </div>
        <section class="cd-grid" aria-label="Plans" ${mount}></section>
      </div>
    `;
  },
};

const team = [
  {
    name: 'Sofia Díaz',
    role: 'Product designer',
    place: 'Madrid',
    status: 'Available',
    photo: `${people}/women/4.jpg`,
    phone: '+15550100',
  },
  {
    name: 'Daniel Okafor',
    role: 'Engineering manager',
    place: 'Lagos',
    status: 'In a meeting',
    photo: `${people}/men/3.jpg`,
    phone: '+15550101',
  },
  {
    name: 'Mei Tanaka',
    role: 'Front-end developer',
    place: 'Osaka',
    status: 'Available',
    photo: `${people}/women/2.jpg`,
    phone: '+15550102',
  },
  {
    name: 'Lukas Weber',
    role: 'Data analyst',
    place: 'Berlin',
    status: 'Out of office',
    photo: `${people}/men/10.jpg`,
    phone: '+15550103',
  },
];

const statusTone: Record<string, string> = {
  Available: 'var(--ig-success-500)',
  'In a meeting': 'var(--ig-warn-500)',
  'Out of office': 'var(--ig-gray-500)',
};

export const Directory: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The people directory of a company. Each card has `flex-direction: row`, and `igc-card-actions` with `orientation="vertical"` stacks the contact actions on the side. The email and call actions are icon buttons with `href`, so they are links with `mailto:` and `tel:` URLs. Each action has an `aria-label` that includes the name of the person, because the same actions repeat on every card. The status has a colored dot and a text. The search field filters the cards by the name, the role and the city.',
      },
    },
  },
  render: () => {
    let query = '';

    const { mount, update } = renderInto(() => {
      const text = query.trim().toLowerCase();
      const matches = team.filter(({ name, role, place }) =>
        [name, role, place].some((value) => value.toLowerCase().includes(text))
      );

      return html`
        <p class="muted" role="status">
          ${matches.length} ${matches.length === 1 ? 'person' : 'people'}
        </p>
        <div class="cd-grid cd-people">
          ${repeat(
            matches,
            ({ name }) => name,
            (person) => html`
              <igc-card class="cd-person">
                <div class="cd-person-main">
                  <igc-card-header>
                    <igc-avatar
                      slot="thumbnail"
                      shape="circle"
                      src=${person.photo}
                      alt=""
                    ></igc-avatar>
                    <h3 slot="title">${person.name}</h3>
                    <p slot="subtitle">${person.role}</p>
                  </igc-card-header>
                  <igc-card-content>
                    <p class="cd-status">
                      <span
                        aria-hidden="true"
                        style="background: ${statusTone[person.status]}"
                      ></span>
                      ${person.status}
                    </p>
                    <p class="muted">${person.place}</p>
                  </igc-card-content>
                </div>
                <igc-card-actions orientation="vertical">
                  <igc-icon-button
                    variant="flat"
                    name="email"
                    href="mailto:${person.name
                      .split(' ')[0]
                      .toLowerCase()}@example.com"
                    aria-label="Email ${person.name}"
                  ></igc-icon-button>
                  <igc-icon-button
                    variant="flat"
                    name="call"
                    href="tel:${person.phone}"
                    aria-label="Call ${person.name}"
                  ></igc-icon-button>
                  <igc-icon-button
                    variant="flat"
                    name="chat"
                    aria-label="Send a message to ${person.name}"
                  ></igc-icon-button>
                </igc-card-actions>
              </igc-card>
            `
          )}
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .cd-people {
          grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
        }

        .cd-person {
          flex-direction: row;
        }

        .cd-person-main {
          flex: 1;
          min-width: 0;
        }

        .cd-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cd-status span {
          width: 0.625rem;
          height: 0.625rem;
          border-radius: 50%;
        }
      </style>
      <div class="cd-stack">
        <igc-input
          label="Search people"
          type="search"
          style="max-width: 20rem"
          @igcInput=${({ detail }: CustomEvent<string>) => {
            query = detail;
            update();
          }}
        ></igc-input>
        <section class="cd-stack" aria-label="People" ${mount}></section>
      </div>
    `;
  },
};

export const Post: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A post in a social feed. The header comes first, then the media, so the author is the first thing in the card. The `thumbnail` slot of the header holds the avatar. The default slot of the header renders under the title and the subtitle, so the story moves the button with more options to the end corner of the card. The `start` slot of the actions holds the like and comment buttons, and the `end` slot holds the save and share buttons. The like and save buttons change their `aria-label` when the user activates them. The comment button shows the comments and moves the focus to the comment field. Press Enter in the field to add a comment.',
      },
    },
  },
  render: () => {
    const state = {
      liked: false,
      likes: 128,
      saved: false,
      open: false,
      comments: [
        { author: 'Tom', text: 'This view never gets old.' },
        { author: 'Aisha', text: 'Were the roads open?' },
      ],
    };

    const like = () => {
      state.liked = !state.liked;
      state.likes += state.liked ? 1 : -1;
      post.update();
    };

    const save = () => {
      state.saved = !state.saved;
      post.update();
    };

    const comment = async () => {
      state.open = true;
      post.update();
      const input = post.host!.querySelector('igc-input')!;
      await input.updateComplete;
      input.focus();
    };

    const add = (event: KeyboardEvent) => {
      const input = event.target as IgcInputComponent;

      if (event.key === 'Enter' && input.value.trim()) {
        state.comments.push({ author: 'You', text: input.value.trim() });
        input.value = '';
        post.update();
      }
    };

    const post = renderInto(() => {
      const { liked, likes, saved, open, comments } = state;

      return html`
        <igc-card class="cd-post">
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              shape="circle"
              src="${people}/women/1.jpg"
              alt=""
            ></igc-avatar>
            <h3 slot="title">Maya Patel</h3>
            <p slot="subtitle">2 hours ago · Yosemite National Park</p>
            <igc-icon-button
              class="cd-more"
              variant="flat"
              name="more-vert"
              aria-label="More options for this post"
            ></igc-icon-button>
          </igc-card-header>
          <igc-card-media>
            <img
              src="${images}/card/media/yosemite.jpg"
              alt="Snow on the pine trees and the granite cliffs of Yosemite Valley, with a waterfall"
            />
          </igc-card-media>
          <igc-card-content>
            <p>
              First snow in the valley this morning. The road to Tunnel View was
              quiet, and the falls were loud.
            </p>
            ${
              open
                ? html`
                    <ul class="cd-comments" aria-label="Comments">
                      ${comments.map(
                        ({ author, text }) =>
                          html`<li><strong>${author}</strong> ${text}</li>`
                      )}
                    </ul>
                    <igc-input
                      label="Write a comment"
                      @keydown=${add}
                    ></igc-input>
                  `
                : nothing
            }
          </igc-card-content>
          <igc-card-actions>
            <igc-button
              slot="start"
              variant="flat"
              aria-label=${`${liked ? 'Unlike' : 'Like'} (${likes} likes)`}
              @click=${like}
            >
              <igc-icon
                slot="prefix"
                name=${liked ? 'favorite' : 'favorite-border'}
              ></igc-icon>
              ${likes}
            </igc-button>
            <igc-button
              slot="start"
              variant="flat"
              aria-label=${`Comments (${comments.length})`}
              @click=${comment}
            >
              <igc-icon slot="prefix" name="comment"></igc-icon>
              ${comments.length}
            </igc-button>
            <igc-icon-button
              slot="end"
              variant="flat"
              name=${saved ? 'bookmark' : 'bookmark-border'}
              aria-label=${saved ? 'Remove from saved posts' : 'Save the post'}
              @click=${save}
            ></igc-icon-button>
            <igc-icon-button
              slot="end"
              variant="flat"
              name="share"
              aria-label="Share the post"
            ></igc-icon-button>
          </igc-card-actions>
        </igc-card>
      `;
    });

    return html`
      ${styles}
      <style>
        .cd-post {
          position: relative;
        }

        .cd-post .cd-more {
          position: absolute;
          inset-block-start: 0.75rem;
          inset-inline-end: 0.5rem;
        }

        .cd-comments {
          display: grid;
          gap: 0.25rem;
          padding: 0;
          list-style: none;
        }
      </style>
      <article
        class="cd-stack"
        style="max-width: 28rem"
        aria-label="Post by Maya Patel"
        ${post.mount}
      ></article>
    `;
  },
};
