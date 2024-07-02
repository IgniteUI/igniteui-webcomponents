import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { IgcCarouselComponent, defineComponents } from '../src/index.js';

defineComponents(IgcCarouselComponent);

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
  /** The animation type. */
  animationType: 'slide' | 'fade' | 'none';
}
type Story = StoryObj<IgcCarouselArgs>;

// endregion

const BasicTemplate = ({
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
    <style>
      .image-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>

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
      <igc-carousel-slide>
        <div class="image-container">
          <img
            src="https://www.infragistics.com/angular-demos-lob/assets/images/carousel/ignite-ui-angular-indigo-design.png"
          />
        </div>
      </igc-carousel-slide>
      <igc-carousel-slide>
        <div class="image-container">
          <img
            src="https://www.infragistics.com/angular-demos-lob/assets/images/carousel/slider-image-chart.png"
          />
        </div>
      </igc-carousel-slide>
      <igc-carousel-slide>
        <div class="image-container">
          <img
            src="https://www.infragistics.com/angular-demos-lob/assets/images/carousel/ignite-ui-angular-charts.png"
          />
        </div>
      </igc-carousel-slide>
    </igc-carousel>
  `;
};

export const Basic: Story = BasicTemplate.bind({});
