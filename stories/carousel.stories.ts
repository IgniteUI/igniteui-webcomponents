import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcCarouselComponent,
  IgcIconComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

defineComponents(IgcCarouselComponent, IgcIconComponent);

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
    actions: { handles: ['igcSlideChanged'] },
  },
  argTypes: {
    skipLoop: {
      type: 'boolean',
      description:
        'Whether the carousel should skip rotating to the first slide after it reaches the last.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    skipPauseOnInteraction: {
      type: 'boolean',
      description:
        'Whether the carousel should ignore use interactions and not pause on them.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    skipNavigation: {
      type: 'boolean',
      description:
        'Whether the carousel should skip rendering of the default navigation buttons.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    withPicker: {
      type: 'boolean',
      description:
        'Whether the carousel should render the picker controls (dots).',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    vertical: {
      type: 'boolean',
      description: 'The carousel alignment.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    indicatorsOrientation: {
      type: '"start" | "end"',
      description: 'Sets the orientation of the picker controls (dots).',
      options: ['start', 'end'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'end' } },
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
        'Controls the maximum picker controls (dots) that can be shown. Default value is `10`.',
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
    skipLoop: false,
    skipPauseOnInteraction: false,
    skipNavigation: false,
    withPicker: false,
    vertical: false,
    indicatorsOrientation: 'end',
    maximumIndicatorsCount: 10,
    animationType: 'slide',
  },
};

export default metadata;

interface IgcCarouselArgs {
  /** Whether the carousel should skip rotating to the first slide after it reaches the last. */
  skipLoop: boolean;
  /** Whether the carousel should ignore use interactions and not pause on them. */
  skipPauseOnInteraction: boolean;
  /** Whether the carousel should skip rendering of the default navigation buttons. */
  skipNavigation: boolean;
  /** Whether the carousel should render the picker controls (dots). */
  withPicker: boolean;
  /** The carousel alignment. */
  vertical: boolean;
  /** Sets the orientation of the picker controls (dots). */
  indicatorsOrientation: 'start' | 'end';
  /** The duration in milliseconds between changing the active slide. */
  interval: number;
  /** Controls the maximum picker controls (dots) that can be shown. Default value is `10`. */
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
  {
    name: 'indicator',
    text: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
];

icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.text, 'material');
});

const BasicTemplate = ({
  skipLoop,
  skipPauseOnInteraction,
  skipNavigation,
  withPicker,
  vertical,
  indicatorsOrientation,
  maximumIndicatorsCount,
  interval,
  animationType,
}: IgcCarouselArgs) => {
  return html`
    <igc-carousel
      ?skip-loop=${skipLoop}
      ?skip-pause-on-interaction=${skipPauseOnInteraction}
      ?skip-navigation=${skipNavigation}
      ?with-picker=${withPicker}
      .interval=${interval}
      .animationType=${animationType}
      .vertical=${vertical}
      .indicatorsOrientation=${indicatorsOrientation}
      .maximumIndicatorsCount=${maximumIndicatorsCount}
    >
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/the_red_ice_forest.jpg"
          alt="Red Ice Forest"
        />
      </igc-carousel-slide>
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/yosemite.jpg"
          alt="Yosemite"
        />
      </igc-carousel-slide>
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/ny.jpg"
          alt="New York"
        />
      </igc-carousel-slide>
    </igc-carousel>
  `;
};

const SlottedContentTemplate = ({
  skipLoop,
  skipPauseOnInteraction,
  skipNavigation,
  withPicker,
  vertical,
  indicatorsOrientation,
  interval,
  animationType,
}: IgcCarouselArgs) => {
  return html`
    <igc-carousel
      ?skip-loop=${skipLoop}
      ?skip-pause-on-interaction=${skipPauseOnInteraction}
      ?skip-navigation=${skipNavigation}
      ?with-picker=${withPicker}
      .interval=${interval}
      .animationType=${animationType}
      .vertical=${vertical}
      .indicatorsOrientation=${indicatorsOrientation}
    >
      <igc-icon
        slot="previous-button"
        name="previous"
        collection="material"
      ></igc-icon>
      <igc-icon slot="next-button" name="next" collection="material"></igc-icon>
      <igc-icon
        slot="indicator"
        name="indicator"
        collection="material"
      ></igc-icon>
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/the_red_ice_forest.jpg"
          alt="Red Ice Forest"
        />
      </igc-carousel-slide>
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/yosemite.jpg"
          alt="Yosemite"
        />
      </igc-carousel-slide>
      <igc-carousel-slide>
        <img
          src="https://www.infragistics.com/angular-demos-lob/assets/images/card/media/ny.jpg"
          alt="New York"
        />
      </igc-carousel-slide>
    </igc-carousel>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
export const SlottedContent: Story = SlottedContentTemplate.bind({});
