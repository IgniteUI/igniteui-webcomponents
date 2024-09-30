import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcCarouselComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcTextareaComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

defineComponents(
  IgcCarouselComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcButtonComponent,
  IgcTextareaComponent
);

// region default
const metadata: Meta<IgcCarouselComponent> = {
  title: 'Carousel',
  component: 'igc-carousel',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-carousel` presents a set of `igc-carousel-slide`s by sequentially displaying a subset of one or more slides.',
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
      table: { defaultValue: { summary: false } },
    },
    disablePauseOnInteraction: {
      type: 'boolean',
      description:
        'Whether the carousel should ignore use interactions and not pause on them.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    hideNavigation: {
      type: 'boolean',
      description:
        'Whether the carousel should skip rendering of the default navigation buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    hideIndicators: {
      type: 'boolean',
      description:
        'Whether the carousel should render the indicator controls (dots).',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    vertical: {
      type: 'boolean',
      description: 'Whether the carousel has vertical alignment.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    indicatorsOrientation: {
      type: '"start" | "end"',
      description: 'Sets the orientation of the indicator controls (dots).',
      options: ['start', 'end'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'end' } },
    },
    indicatorsLabelFormat: {
      type: 'string',
      description:
        "The format used to set the aria-label on the carousel indicators.\nInstances of '{0}' will be replaced with the index of the corresponding slide.",
      control: 'text',
      table: { defaultValue: { summary: 'Slide {0}' } },
    },
    slidesLabelFormat: {
      type: 'string',
      description:
        "The format used to set the aria-label on the carousel slides and the text displayed\nwhen the number of indicators is greater than tha maximum indicator count.\nInstances of '{0}' will be replaced with the index of the corresponding slide.\nInstances of '{1}' will be replaced with the total amount of slides.",
      control: 'text',
      table: { defaultValue: { summary: '{0} of {1}' } },
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
        'Controls the maximum indicator controls (dots) that can be shown. Default value is `10`.',
      control: 'number',
      table: { defaultValue: { summary: 10 } },
    },
    animationType: {
      type: '"slide" | "fade" | "none"',
      description: 'The animation type.',
      options: ['slide', 'fade', 'none'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'slide' } },
    },
  },
  args: {
    disableLoop: false,
    disablePauseOnInteraction: false,
    hideNavigation: false,
    hideIndicators: false,
    vertical: false,
    indicatorsOrientation: 'end',
    indicatorsLabelFormat: 'Slide {0}',
    slidesLabelFormat: '{0} of {1}',
    maximumIndicatorsCount: 10,
    animationType: 'slide',
  },
};

export default metadata;

interface IgcCarouselArgs {
  /** Whether the carousel should skip rotating to the first slide after it reaches the last. */
  disableLoop: boolean;
  /** Whether the carousel should ignore use interactions and not pause on them. */
  disablePauseOnInteraction: boolean;
  /** Whether the carousel should skip rendering of the default navigation buttons. */
  hideNavigation: boolean;
  /** Whether the carousel should render the indicator controls (dots). */
  hideIndicators: boolean;
  /** Whether the carousel has vertical alignment. */
  vertical: boolean;
  /** Sets the orientation of the indicator controls (dots). */
  indicatorsOrientation: 'start' | 'end';
  /**
   * The format used to set the aria-label on the carousel indicators.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   */
  indicatorsLabelFormat: string;
  /**
   * The format used to set the aria-label on the carousel slides and the text displayed
   * when the number of indicators is greater than tha maximum indicator count.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   * Instances of '{1}' will be replaced with the total amount of slides.
   */
  slidesLabelFormat: string;
  /** The duration in milliseconds between changing the active slide. */
  interval: number;
  /** Controls the maximum indicator controls (dots) that can be shown. Default value is `10`. */
  maximumIndicatorsCount: number;
  /** The animation type. */
  animationType: 'slide' | 'fade' | 'none';
}
type Story = StoryObj<IgcCarouselArgs>;

// endregion

const icons = [
  {
    name: 'previous',
    text: '<svg fill="#000000" width="24" height="24" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M0 220.8C0 266.416 37.765 304 83.2 304h35.647a93.148 93.148 0 0 0 7.929 22.064c-2.507 22.006 3.503 44.978 15.985 62.791C143.9 441.342 180.159 480 242.701 480H264c60.063 0 98.512-40 127.2-40h2.679c5.747 4.952 13.536 8 22.12 8h64c17.673 0 32-12.894 32-28.8V188.8c0-15.906-14.327-28.8-32-28.8h-64c-8.584 0-16.373 3.048-22.12 8H391.2c-6.964 0-14.862-6.193-30.183-23.668l-.129-.148-.131-.146c-8.856-9.937-18.116-20.841-25.851-33.253C316.202 80.537 304.514 32 259.2 32c-56.928 0-92 35.286-92 83.2 0 8.026.814 15.489 2.176 22.4H83.2C38.101 137.6 0 175.701 0 220.8zm48 0c0-18.7 16.775-35.2 35.2-35.2h158.4c0-17.325-26.4-35.2-26.4-70.4 0-26.4 20.625-35.2 44-35.2 8.794 0 20.445 32.712 34.926 56.1 9.074 14.575 19.524 27.225 30.799 39.875 16.109 18.374 33.836 36.633 59.075 39.596v176.752C341.21 396.087 309.491 432 264 432h-21.299c-40.524 0-57.124-22.197-50.601-61.325-14.612-8.001-24.151-33.979-12.925-53.625-19.365-18.225-17.787-46.381-4.95-61.05H83.2C64.225 256 48 239.775 48 220.8zM448 360c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24z"/></svg>',
  },
  {
    name: 'next',
    text: `<svg fill="#000000" width="24" height="24" viewBox="0 0 589.308 589.308" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
    <path d="M503.587,148.307c-47.736-34.885-96.696-87.517-154.225-104.652c-5.508-1.836-9.18,1.836-10.403,6.12
    c-3.672,1.836-6.732,4.896-6.732,10.404c-1.836,39.168-1.836,78.947-1.224,118.115c-49.572-1.224-99.145-1.836-149.328-1.224
    c-34.272,0.612-128.52-7.956-156.06,22.032c-4.896-1.225-10.404,1.224-12.852,6.731c-18.36,45.288-12.24,102.816-9.792,151.164
    c2.448,56.916,6.12,113.832,11.016,170.748c0,2.448,1.224,4.284,2.448,5.508c0,3.061,2.448,6.12,7.344,6.732
    c41.616,6.731,90.576,9.792,131.58-0.612c11.016-2.448,11.016-15.3,4.284-20.808c17.748-58.141-7.344-118.116,5.508-176.868
    c55.692,3.672,112.608,1.224,168.912-1.836c0,29.988-1.224,59.976-3.672,89.964c0,1.224,0,2.448,0.612,3.672
    c-0.612,2.448-0.612,4.284-1.225,6.732c-1.224,7.956,5.509,18.972,15.301,15.3c59.363-23.256,105.264-57.528,154.224-96.696
    c34.271-27.54,87.516-66.096,89.964-114.443C591.103,204.61,530.515,167.891,503.587,148.307z"/>
    </svg>`,
  },
];

icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.text, 'material');
});

const defaultImages = [
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/card/media/the_red_ice_forest.jpg',
    alt: 'Red Ice Forest',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/card/media/yosemite.jpg',
    alt: 'Yosemite',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/card/media/ny.jpg',
    alt: 'New York',
  },
];

const fancyImages = [
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/WonderfulCoast.png',
    alt: 'Wonderful Coast',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/CulturalDip.png',
    alt: 'Cultural Dip',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/GoldenBeaches.png',
    alt: 'Golden Beaches',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/IslandOfHistory.png',
    alt: 'Island Of History',
  },
  {
    src: 'https://www.infragistics.com/angular-demos-lob/assets/images/carousel/AmazingBridge.png',
    alt: 'Amazing Bridge',
  },
];

export const Basic: Story = {
  render: (args) => html`
    <igc-carousel
      ?disable-loop=${args.disableLoop}
      ?disable-pause-on-interaction=${args.disablePauseOnInteraction}
      ?hide-navigation=${args.hideNavigation}
      ?hide-indicators=${args.hideIndicators}
      .interval=${args.interval}
      .animationType=${args.animationType}
      .vertical=${args.vertical}
      .indicatorsOrientation=${args.indicatorsOrientation}
      .maximumIndicatorsCount=${args.maximumIndicatorsCount}
      .indicatorsLabelFormat=${args.indicatorsLabelFormat}
      .slidesLabelFormat=${args.slidesLabelFormat}
    >
      ${defaultImages.map(
        ({ src, alt }) => html`
          <igc-carousel-slide>
            <img src=${src} alt=${alt} />
          </igc-carousel-slide>
        `
      )}
    </igc-carousel>
  `,
};

export const SlottedContent: Story = {
  render: (args) => html`
    <igc-carousel
      ?disable-loop=${args.disableLoop}
      ?disable-pause-on-interaction=${args.disablePauseOnInteraction}
      ?hide-navigation=${args.hideNavigation}
      ?hide-indicators=${args.hideIndicators}
      .interval=${args.interval}
      .animationType=${args.animationType}
      .vertical=${args.vertical}
      .indicatorsOrientation=${args.indicatorsOrientation}
      .maximumIndicatorsCount=${args.maximumIndicatorsCount}
      .indicatorsLabelFormat=${args.indicatorsLabelFormat}
      .slidesLabelFormat=${args.slidesLabelFormat}
    >
      <igc-icon
        slot="previous-button"
        name="previous"
        collection="material"
      ></igc-icon>

      <igc-icon slot="next-button" name="next" collection="material"></igc-icon>

      ${defaultImages.map(
        ({ src, alt }) => html`
          <igc-carousel-slide>
            <img src=${src} alt=${alt} />
          </igc-carousel-slide>

          <igc-carousel-indicator>
            <span>🤍</span>
            <span slot="active">❤️</span>
          </igc-carousel-indicator>
        `
      )}
    </igc-carousel>
  `,
};

export const InputsTemplate: Story = {
  render: (args) => html`
    <style>
      igc-carousel {
        border-radius: 10px;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
        max-width: 75%;
        margin-inline: auto;
        height: 350px;
      }
      igc-carousel-slide {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 75%;
        margin-inline: auto;
        padding-block: 8px;
      }
      igc-carousel-slide > * {
        margin-block: 8px;
      }
      igc-carousel-slide div {
        text-align: center;
      }
    </style>
    <igc-carousel
      id="carousel"
      ?disable-loop=${args.disableLoop}
      ?disable-pause-on-interaction=${args.disablePauseOnInteraction}
      ?hide-navigation=${args.hideNavigation}
      ?hide-indicators=${args.hideIndicators}
      .interval=${args.interval}
      .animationType=${args.animationType}
      .vertical=${args.vertical}
      .indicatorsOrientation=${args.indicatorsOrientation}
      .maximumIndicatorsCount=${args.maximumIndicatorsCount}
      .indicatorsLabelFormat=${args.indicatorsLabelFormat}
      .slidesLabelFormat=${args.slidesLabelFormat}
    >
      <igc-carousel-slide>
        <igc-input type="text" placeholder="Username">
          <span slot="prefix">🐱‍💻</span>
        </igc-input>
        <igc-textarea label="Leave your comment">
          <span slot="prefix">💬</span>
        </igc-textarea>
        <igc-button>Comment</igc-button>
        <div>
          <span>Not a member? 🙀</span>
          <igc-button onclick="carousel.next()">Sign up</igc-button>
        </div>
      </igc-carousel-slide>
      <igc-carousel-slide>
        <span>Registration</span>
        <igc-input type="text" placeholder="Enter your name">
          <span slot="prefix">😄</span>
        </igc-input>
        <igc-input type="email" placeholder="Enter your email">
          <span slot="prefix">✉️</span>
        </igc-input>
        <igc-input type="password" placeholder="Create a password">
          <span slot="prefix">🔒</span>
        </igc-input>
        <igc-button>Sign up</igc-button>
        <div>
          <span>Already a member?</span>
          <igc-button onclick="carousel.prev()">Comment</igc-button>
        </div>
      </igc-carousel-slide>
    </igc-carousel>
  `,
};

export const ThumbnailTemplate: Story = {
  render: (args) => html`
    <style>
      igc-carousel {
        height: 550px;
      }
      igc-carousel[vertical]::part(indicators) {
        margin-inline-end: 16px;
      }
      igc-carousel::part(indicators) {
        border-radius: 2px;
      }
      .blurred {
        filter: blur(2px);
        opacity: 0.5;
      }
    </style>
    <igc-carousel
      ?disable-loop=${args.disableLoop}
      ?disable-pause-on-interaction=${args.disablePauseOnInteraction}
      ?hide-navigation=${args.hideNavigation}
      ?hide-indicators=${args.hideIndicators}
      .interval=${args.interval}
      .animationType=${args.animationType}
      .vertical=${args.vertical}
      .indicatorsOrientation=${args.indicatorsOrientation}
      .maximumIndicatorsCount=${args.maximumIndicatorsCount}
      .indicatorsLabelFormat=${args.indicatorsLabelFormat}
      .slidesLabelFormat=${args.slidesLabelFormat}
    >
      ${fancyImages.map(
        ({ src, alt }) => html`
          <igc-carousel-slide>
            <img src=${src} alt=${alt} />
          </igc-carousel-slide>

          <igc-carousel-indicator>
            <img
              class="blurred"
              src=${src.replace('.png', 'Thumb.png')}
              alt=${`${alt} Thumb`}
              width="50"
              height="60"
            />
            <img
              slot="active"
              src=${src.replace('.png', 'Thumb.png')}
              alt=${`${alt} Thumb Active`}
              width="50"
              height="60"
            />
          </igc-carousel-indicator>
        `
      )}
    </igc-carousel>
  `,
};
