import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcCarouselComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCarouselComponent,
  IgcIconButtonComponent,
  IgcIconComponent
);

registerMaterialIcons(
  'chevron-left',
  'chevron-right',
  'done-all',
  'explore',
  'folder-open',
  'group-add',
  'pause',
  'play-arrow'
);

// region default
const metadata: Meta<IgcCarouselComponent> = {
  title: 'Carousel',
  component: 'igc-carousel',
  parameters: {
    docs: {
      description: {
        component:
          'The carousel presents a set of slides by sequentially displaying a subset of one or more.',
      },
    },
    actions: { handles: ['igcSlideChanged', 'igcPlaying', 'igcPaused'] },
  },
  argTypes: {
    disableLoop: {
      type: 'boolean',
      description:
        'Whether the carousel should skip rotating to the first slide after it reaches the last.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disablePauseOnInteraction: {
      type: 'boolean',
      description:
        'Whether the carousel should ignore user interactions and not pause on them.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideNavigation: {
      type: 'boolean',
      description:
        'Whether the carousel should skip rendering of the default navigation buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideIndicators: {
      type: 'boolean',
      description:
        'Whether the carousel should render the indicator controls (dots).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    vertical: {
      type: 'boolean',
      description: 'Whether the carousel has vertical alignment.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    indicatorsOrientation: {
      type: { name: 'enum', value: ['start', 'end'] },
      description: 'The orientation of the indicator controls (dots).',
      options: ['start', 'end'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'end' } },
    },
    indicatorsLabelFormat: {
      type: 'string',
      description:
        "The format used to set the aria-label on the carousel indicators.\nInstances of '{0}' will be replaced with the index of the corresponding slide.",
      control: 'text',
    },
    slidesLabelFormat: {
      type: 'string',
      description:
        "The format used to set the aria-label on the carousel slides and the text displayed\nwhen the number of indicators is greater than the maximum indicator count.\nInstances of '{0}' will be replaced with the index of the corresponding slide.\nInstances of '{1}' will be replaced with the total amount of slides.",
      control: 'text',
    },
    interval: {
      type: 'number',
      description:
        'The duration in milliseconds between changing the active slide.',
      control: 'number',
    },
    maximumIndicatorsCount: {
      type: 'number',
      description:
        'The maximum number of indicator controls (dots) that can be shown. Default value is `10`.',
      control: 'number',
      table: { defaultValue: { summary: '10' } },
    },
    animationType: {
      type: { name: 'enum', value: ['slide', 'fade', 'none'] },
      description: 'The animation type.',
      options: ['slide', 'fade', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings. Falls back to the global locale.',
      control: 'text',
    },
  },
  args: {
    disableLoop: false,
    disablePauseOnInteraction: false,
    hideNavigation: false,
    hideIndicators: false,
    vertical: false,
    indicatorsOrientation: 'end',
    maximumIndicatorsCount: 10,
    animationType: 'slide',
  },
};

export default metadata;

interface IgcCarouselArgs {
  /** Whether the carousel should skip rotating to the first slide after it reaches the last. */
  disableLoop: boolean;
  /** Whether the carousel should ignore user interactions and not pause on them. */
  disablePauseOnInteraction: boolean;
  /** Whether the carousel should skip rendering of the default navigation buttons. */
  hideNavigation: boolean;
  /** Whether the carousel should render the indicator controls (dots). */
  hideIndicators: boolean;
  /** Whether the carousel has vertical alignment. */
  vertical: boolean;
  /** The orientation of the indicator controls (dots). */
  indicatorsOrientation: 'start' | 'end';
  /**
   * The format used to set the aria-label on the carousel indicators.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   */
  indicatorsLabelFormat: string;
  /**
   * The format used to set the aria-label on the carousel slides and the text displayed
   * when the number of indicators is greater than the maximum indicator count.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   * Instances of '{1}' will be replaced with the total amount of slides.
   */
  slidesLabelFormat: string;
  /** The duration in milliseconds between changing the active slide. */
  interval: number;
  /** The maximum number of indicator controls (dots) that can be shown. Default value is `10`. */
  maximumIndicatorsCount: number;
  /** The animation type. */
  animationType: 'slide' | 'fade' | 'none';
  /** The locale for the resource strings. Falls back to the global locale. */
  locale: string;
}
type Story = StoryObj<IgcCarouselArgs>;

// endregion

const images = 'https://www.infragistics.com/angular-demos-lob/assets/images';

const photos = [
  {
    src: `${images}/card/media/the_red_ice_forest.jpg`,
    alt: 'The red and dark blue tops of the trees of a forest, seen from above',
  },
  {
    src: `${images}/card/media/yosemite.jpg`,
    alt: 'Snow on the pine trees and the granite cliffs of Yosemite Valley',
  },
  {
    src: `${images}/card/media/ny.jpg`,
    alt: 'The skyline of Lower Manhattan at sunset, seen across the Hudson River',
  },
];

const destinations = [
  {
    image: 'WonderfulCoast',
    alt: 'Pastel houses on a steep green cliff above a bay with boats',
    title: 'The Amalfi Coast',
    text: 'Seven days of cliff villages, boat trips and lemon groves.',
    price: 39,
  },
  {
    image: 'IslandOfHistory',
    alt: 'White houses, a windmill and a dome above the sea at sunset',
    title: 'Santorini',
    text: 'Watch the sunset from the cliffs of Oia.',
    price: 45,
  },
  {
    image: 'GoldenBeaches',
    alt: 'A woman in a sun hat on a swing chair on a white sand beach',
    title: 'The Maldives',
    text: 'White sand, clear water and a house above the sea.',
    price: 49,
  },
  {
    image: 'CulturalDip',
    alt: 'A pagoda with red roofs and white stone railings',
    title: 'Singapore',
    text: 'Gardens, temples and the food markets of the city.',
    price: 35,
  },
  {
    image: 'AmazingBridge',
    alt: 'The Golden Gate Bridge at sunset',
    title: 'San Francisco',
    text: 'Drive the coast road from the Golden Gate to Big Sur.',
    price: 42,
  },
];

const styles = html`
  ${storyStyles}
  <style>
    .cr-stack {
      display: grid;
      gap: 1rem;
      max-width: 60rem;
    }

    .cr-stack :is(h2, h3, h4, p, ol, ul) {
      margin: 0;
    }

    .cr-panel {
      display: grid;
      gap: 0.75rem;
      align-content: start;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cr-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A carousel of photos. Use the controls panel to change the animation, the alignment, the loop and the controls. Set `interval` to rotate the slides automatically: the carousel pauses while the pointer is over it or the focus is in it, unless `disablePauseOnInteraction` is set. The carousel has `role="region"`, so it has an `aria-label`, and each image has an `alt` text.',
      },
    },
  },
  render: (args) => html`
    <igc-carousel
      aria-label="Photos"
      style="height: 26rem; max-width: 46rem"
      ?disable-loop=${args.disableLoop}
      ?disable-pause-on-interaction=${args.disablePauseOnInteraction}
      ?hide-navigation=${args.hideNavigation}
      ?hide-indicators=${args.hideIndicators}
      ?vertical=${args.vertical}
      .interval=${args.interval}
      .animationType=${args.animationType}
      .indicatorsOrientation=${args.indicatorsOrientation}
      .maximumIndicatorsCount=${args.maximumIndicatorsCount}
      .indicatorsLabelFormat=${args.indicatorsLabelFormat}
      .slidesLabelFormat=${args.slidesLabelFormat}
      locale=${ifDefined(args.locale)}
    >
      ${photos.map(
        ({ src, alt }) => html`
          <igc-carousel-slide>
            <img src=${src} alt=${alt} />
          </igc-carousel-slide>
        `
      )}
    </igc-carousel>
  `,
};

export const Hero: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The hero of the home page of a travel agency. `interval` rotates the slides every six seconds, and `animation-type="fade"` cross-fades them. A slide can hold any content: here an image, a heading, a text and a link button. The rotation pauses while the pointer is over the carousel or the focus is in it, but WCAG 2.2.2 also asks for a control that stops it. So the first control is a button that calls `pause()` and `play()`. The button shows what the user selected, and not the state of the rotation, because the carousel also pauses for a short time when the user interacts with it. When the user prefers reduced motion, the story does not start the rotation and uses `animation-type="none"`. The `previous-button` and `next-button` slots replace the arrow icons.',
      },
    },
  },
  render: () => {
    const interval = 6000;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rotating = !reduced;
    let carousel: IgcCarouselComponent | undefined;
    let host: HTMLElement | undefined;

    const toggle = () => {
      if (rotating) {
        carousel!.pause();
      } else {
        carousel!.interval = interval;
        carousel!.play();
      }

      rotating = !rotating;
      update();
    };

    const update = () => {
      if (!host) {
        return;
      }

      render(
        html`
          <igc-icon-button
            class="cr-rotation"
            variant="flat"
            name=${rotating ? 'pause' : 'play-arrow'}
            aria-label=${rotating ? 'Stop the slide show' : 'Start the slide show'}
            @click=${toggle}
          ></igc-icon-button>
        `,
        host
      );
    };

    return html`
      ${styles}
      <style>
        .cr-hero {
          position: relative;
          max-width: 60rem;
        }

        .cr-hero igc-carousel {
          height: 28rem;
          border-radius: 12px;
          overflow: hidden;
        }

        .cr-hero .cr-rotation {
          position: absolute;
          inset-block-start: 1rem;
          inset-inline-end: 1rem;
          z-index: 11;
          border-radius: 50%;
          background: var(--ig-surface-500);
        }

        .cr-hero-caption {
          position: absolute;
          inset-inline: 0;
          inset-block-end: 0;
          display: grid;
          gap: 0.5rem;
          justify-items: start;
          padding: 4rem 5rem 4.5rem;
          background: linear-gradient(transparent, rgb(0 0 0 / 0.75));
          color: #fff;
        }

        .cr-hero-caption h2 {
          margin: 0;
          font-size: 2rem;
        }

        .cr-hero-caption p {
          margin: 0;
        }
      </style>
      <div class="cr-hero">
        <span
          ${ref((element) => {
            host = element as HTMLElement | undefined;
            update();
          })}
        ></span>
        <igc-carousel
          aria-label="Featured tours"
          animation-type=${reduced ? 'none' : 'fade'}
          .interval=${reduced ? undefined : interval}
          ${ref((element) => {
            carousel = element as IgcCarouselComponent | undefined;
          })}
        >
          <igc-icon slot="previous-button" name="chevron-left"></igc-icon>
          <igc-icon slot="next-button" name="chevron-right"></igc-icon>
          ${destinations.map(
            ({ image, alt, title, text }) => html`
              <igc-carousel-slide>
                <img src="${images}/carousel/${image}.png" alt=${alt} />
                <div class="cr-hero-caption">
                  <h2>${title}</h2>
                  <p>${text}</p>
                  <igc-button
                    href="#${image}"
                    @click=${(event: Event) => event.preventDefault()}
                  >
                    See the tour
                  </igc-button>
                </div>
              </igc-carousel-slide>
            `
          )}
        </igc-carousel>
      </div>
    `;
  },
};

export const Gallery: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The product page of a shop for photo prints. Each `igc-carousel-slide` has an `igc-carousel-indicator` with a thumbnail, which replaces the default dot. The default slot of the indicator holds the inactive thumbnail, and the `active` slot holds the thumbnail of the active slide. The indicators have the `tab` role, and `indicators-label-format` gives them their names, so the thumbnails have an empty `alt`. `igcSlideChanged` and `current` keep the product details next to the gallery in sync, for the arrows, the thumbnails, the arrow keys and the swipe.',
      },
    },
  },
  render: () => {
    let current = 0;
    let added = '';

    const { mount, update } = renderInto(() => {
      const { title, price } = destinations[current];

      return html`
        <h3>${title}</h3>
        <p class="muted">Fine art print on matte paper, 40 × 30 cm</p>
        <p style="font-size: 1.5rem"><strong>$${price}</strong></p>
        <div class="cr-actions">
          <igc-button
            @click=${() => {
              added = `We added the ${title} print to your cart.`;
              update();
            }}
          >
            Add to cart
          </igc-button>
        </div>
        <p class="muted" role="status">${added}</p>
      `;
    });

    const change = ({ detail }: CustomEvent<number>) => {
      current = detail;
      added = '';
      update();
    };

    return html`
      ${styles}
      <style>
        .cr-gallery {
          display: grid;
          grid-template-columns: minmax(18rem, 2fr) minmax(14rem, 1fr);
          gap: 1.5rem;
          align-items: start;
        }

        .cr-gallery igc-carousel {
          height: 30rem;
        }

        .cr-gallery igc-carousel::part(indicators) {
          border-radius: 4px;
        }

        .cr-gallery .cr-thumb {
          display: block;
          width: 45px;
          height: 60px;
          border-radius: 2px;
          object-fit: cover;
        }

        .cr-gallery .cr-thumb:not([slot]) {
          opacity: 0.6;
        }

        .cr-gallery .cr-thumb[slot='active'] {
          outline: 2px solid #fff;
          outline-offset: -2px;
        }

        @media (max-width: 40rem) {
          .cr-gallery {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="cr-stack cr-gallery">
        <igc-carousel
          aria-label="Print photos"
          indicators-label-format="Show print {0}"
          @igcSlideChanged=${change}
        >
          ${destinations.map(
            ({ image, alt }) => html`
              <igc-carousel-slide>
                <img src="${images}/carousel/${image}.png" alt=${alt} />
              </igc-carousel-slide>
              <igc-carousel-indicator>
                <img
                  class="cr-thumb"
                  src="${images}/carousel/${image}Thumb.png"
                  alt=""
                />
                <img
                  class="cr-thumb"
                  slot="active"
                  src="${images}/carousel/${image}Thumb.png"
                  alt=""
                />
              </igc-carousel-indicator>
            `
          )}
        </igc-carousel>
        <section
          class="cr-panel"
          aria-label="Product details"
          ${mount}
        ></section>
      </div>
    `;
  },
};

const steps = [
  {
    icon: 'explore',
    title: 'Welcome to Acme Projects',
    text: 'This short tour shows you the basics. It takes one minute.',
  },
  {
    icon: 'folder-open',
    title: 'Keep your work in projects',
    text: 'A project holds the tasks, the files and the discussions for one goal.',
  },
  {
    icon: 'group-add',
    title: 'Invite your team',
    text: 'Add people with their email address. They get access to the projects that you share with them.',
  },
  {
    icon: 'done-all',
    title: 'You are ready',
    text: 'Create your first project, or open the sample project to look around.',
  },
];

export const Onboarding: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The first-run tour of an application. `hide-navigation` removes the arrows, and the story renders its own Back and Next buttons, which call `prev()` and `next()`. `disable-loop` stops the tour at the last step. `next()` and `prev()` do not emit `igcSlideChanged`, so the buttons read `current` after the returned promise resolves. A click on a dot emits `igcSlideChanged`, and the story updates the buttons from it. The slides container is a polite live region while the carousel does not rotate, so a screen reader reads the new step.',
      },
    },
  },
  render: () => {
    let carousel: IgcCarouselComponent | undefined;
    let footer: HTMLElement | undefined;
    let current = 0;
    let finished = false;

    const go = (direction: 'prev' | 'next') => async () => {
      if (direction === 'next' && current === steps.length - 1) {
        finished = true;
        update();
        return;
      }

      await (direction === 'next' ? carousel!.next() : carousel!.prev());
      current = carousel!.current;
      update();
    };

    const restart = async () => {
      finished = false;
      await carousel!.select(0);
      current = 0;
      update();
    };

    const update = () => {
      if (!footer) {
        return;
      }

      const last = current === steps.length - 1;

      render(
        finished
          ? html`
              <p>You finished the tour.</p>
              <igc-button variant="outlined" @click=${restart}>
                Show the tour again
              </igc-button>
            `
          : html`
              <igc-button
                variant="flat"
                @click=${() => {
                  finished = true;
                  update();
                }}
              >
                Skip the tour
              </igc-button>
              <span class="cr-spacer"></span>
              <span class="muted">Step ${current + 1} of ${steps.length}</span>
              <igc-button
                variant="outlined"
                ?disabled=${current === 0}
                @click=${go('prev')}
              >
                Back
              </igc-button>
              <igc-button @click=${go('next')}>
                ${last ? 'Get started' : 'Next'}
              </igc-button>
            `,
        footer
      );
    };

    return html`
      ${styles}
      <style>
        .cr-tour {
          max-width: 36rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 12px;
          overflow: hidden;
        }

        .cr-tour igc-carousel {
          height: 18rem;
        }

        .cr-tour igc-carousel-slide {
          display: grid;
          place-content: center;
          justify-items: center;
          gap: 0.75rem;
          padding: 1.5rem 2rem 3.5rem;
          text-align: center;
        }

        .cr-tour igc-carousel-slide igc-icon {
          --ig-icon-size: 3rem;
          color: var(--ig-primary-500);
        }

        .cr-tour-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-block-start: 1px solid var(--ig-gray-300);
        }

        .cr-spacer {
          flex: 1;
        }
      </style>
      <section class="cr-stack cr-tour" aria-label="Product tour">
        <igc-carousel
          aria-label="Steps"
          hide-navigation
          disable-loop
          @igcSlideChanged=${({ detail }: CustomEvent<number>) => {
            current = detail;
            update();
          }}
          ${ref((element) => {
            carousel = element as IgcCarouselComponent | undefined;
          })}
        >
          ${steps.map(
            ({ icon, title, text }) => html`
              <igc-carousel-slide>
                <igc-icon name=${icon} aria-hidden="true"></igc-icon>
                <h3>${title}</h3>
                <p class="muted">${text}</p>
              </igc-carousel-slide>
            `
          )}
        </igc-carousel>
        <div
          class="cr-tour-footer"
          ${ref((element) => {
            footer = element as HTMLElement | undefined;
            update();
          })}
        ></div>
      </section>
    `;
  },
};

const announcements = [
  {
    date: 'September 28',
    title: 'Dark mode is here',
    text: 'Turn it on in Settings, under Appearance.',
  },
  {
    date: 'September 21',
    title: 'Scheduled maintenance',
    text: 'The service is not available on Saturday from 02:00 to 04:00 UTC.',
  },
  {
    date: 'September 14',
    title: 'New export formats',
    text: 'You can now export the reports as CSV, XLSX and PDF files.',
  },
  {
    date: 'September 7',
    title: 'Faster search',
    text: 'The search results now load up to three times faster.',
  },
];

export const Announcements: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An announcements widget in the sidebar of a dashboard. `vertical` stacks the slides and moves them up and down, and the arrows are at the top and the bottom. `indicators-orientation="start"` puts the dots on the start side, so they do not cover the text. The widget does not rotate on its own: the user reads at their own speed.',
      },
    },
  },
  render: () => html`
    ${styles}
    <style>
      .cr-news {
        max-width: 22rem;
      }

      .cr-news igc-carousel {
        height: 15rem;
      }

      .cr-news igc-carousel-slide {
        display: grid;
        align-content: center;
        gap: 0.25rem;
        padding: 3.5rem 1.5rem 3.5rem 3.5rem;
      }

      .cr-news h4 {
        font-size: 1rem;
      }
    </style>
    <section class="cr-stack cr-panel cr-news" aria-labelledby="cr-news-title">
      <h3 id="cr-news-title">What is new</h3>
      <igc-carousel
        aria-label="Announcements"
        vertical
        indicators-orientation="start"
      >
        ${announcements.map(
          ({ date, title, text }) => html`
            <igc-carousel-slide>
              <p class="muted">${date}</p>
              <h4>${title}</h4>
              <p>${text}</p>
            </igc-carousel-slide>
          `
        )}
      </igc-carousel>
    </section>
  `,
};

const deck = [
  {
    title: 'Q3 2026 business review',
    points: ['Acme Analytics', 'October 1, 2026'],
  },
  {
    title: 'Agenda',
    points: ['Highlights', 'Revenue and customers', 'Product and support'],
  },
  {
    title: 'Highlights',
    points: ['Revenue grew 18%', 'Two new regions', 'Release 4.2 shipped'],
  },
  {
    title: 'Revenue',
    points: ['$4.8M in Q3', '$1.1M from new customers', 'Churn at 2.1%'],
  },
  {
    title: 'Customers',
    points: ['1,284 active accounts', '96 new accounts', 'NPS of 52'],
  },
  {
    title: 'Product',
    points: ['Dark mode', 'New export formats', 'Faster search'],
  },
  {
    title: 'Support',
    points: ['3,120 tickets', 'First reply in 2 hours', '94% satisfaction'],
  },
  {
    title: 'Team',
    points: ['12 new people', 'An office in Lisbon', 'A new onboarding plan'],
  },
  {
    title: 'Risks',
    points: ['Hiring in data science', 'Cloud costs', 'A new competitor'],
  },
  {
    title: 'Q4 goals',
    points: ['$5.5M revenue', 'Single sign-on', 'Mobile application beta'],
  },
  {
    title: 'Budget',
    points: ['$1.2M for hiring', '$400K for marketing', '$250K for cloud'],
  },
  {
    title: 'Questions',
    points: ['Send your questions to the leadership team'],
  },
];

export const SlideDeck: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A presentation viewer. The deck has 12 slides, which is more than `maximum-indicators-count` (10), so a label replaces the dots. `slides-label-format="Slide {0} of {1}"` sets the text of the label and the labels of the slides. Without the dots, the carousel has two tab stops: the arrows. The outline next to the carousel calls `select()` with the index of a slide, and `igcSlideChanged` marks the current slide in the outline with `aria-current`.',
      },
    },
  },
  render: () => {
    let carousel: IgcCarouselComponent | undefined;
    let outline: HTMLElement | undefined;
    let current = 0;

    const go = (index: number) => async () => {
      await carousel!.select(index);
      current = carousel!.current;
      update();
    };

    const update = () => {
      if (!outline) {
        return;
      }

      render(
        html`
          <ol>
            ${deck.map(
              ({ title }, index) => html`
                <li>
                  <button
                    type="button"
                    aria-current=${index === current ? 'true' : 'false'}
                    @click=${go(index)}
                  >
                    ${title}
                  </button>
                </li>
              `
            )}
          </ol>
        `,
        outline
      );
    };

    return html`
      ${styles}
      <style>
        .cr-deck {
          display: grid;
          grid-template-columns: minmax(20rem, 3fr) minmax(12rem, 1fr);
          gap: 1.5rem;
          align-items: start;
        }

        /* The carousel takes the height of its parent. */
        .cr-deck-frame {
          aspect-ratio: 16 / 9;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
          overflow: hidden;
        }

        .cr-deck igc-carousel-slide {
          display: grid;
          align-content: center;
          gap: 1rem;
          padding: 2rem 5rem 3.5rem;
        }

        .cr-deck igc-carousel-slide h3 {
          font-size: 1.75rem;
        }

        .cr-deck igc-carousel-slide ul {
          display: grid;
          gap: 0.5rem;
          font-size: 1.125rem;
        }

        .cr-outline ol {
          display: grid;
          gap: 0.125rem;
          padding: 0;
          list-style: none;
          counter-reset: slide;
        }

        .cr-outline li {
          counter-increment: slide;
        }

        .cr-outline button {
          display: flex;
          gap: 0.5rem;
          width: 100%;
          padding: 0.375rem 0.5rem;
          border: 0;
          border-radius: 4px;
          background: none;
          color: inherit;
          font: inherit;
          text-align: start;
          cursor: pointer;
        }

        .cr-outline button::before {
          content: counter(slide);
          min-width: 1.5rem;
          color: var(--ig-gray-700);
        }

        .cr-outline button:hover {
          background: var(--ig-gray-100);
        }

        .cr-outline button[aria-current='true'] {
          background: var(--ig-primary-100);
          color: var(--ig-primary-100-contrast);
        }

        .cr-outline button[aria-current='true']::before {
          color: inherit;
        }

        @media (max-width: 48rem) {
          .cr-deck {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="cr-stack cr-deck">
        <div class="cr-deck-frame">
          <igc-carousel
            aria-label="Q3 2026 business review"
            slides-label-format="Slide {0} of {1}"
            @igcSlideChanged=${({ detail }: CustomEvent<number>) => {
              current = detail;
              update();
            }}
            ${ref((element) => {
              carousel = element as IgcCarouselComponent | undefined;
            })}
          >
            ${deck.map(
              ({ title, points }) => html`
                <igc-carousel-slide>
                  <h3>${title}</h3>
                  <ul>
                    ${points.map((point) => html`<li>${point}</li>`)}
                  </ul>
                </igc-carousel-slide>
              `
            )}
          </igc-carousel>
        </div>
        <nav
          class="cr-outline"
          aria-label="Slides"
          ${ref((element) => {
            outline = element as HTMLElement | undefined;
            update();
          })}
        ></nav>
      </div>
    `;
  },
};
