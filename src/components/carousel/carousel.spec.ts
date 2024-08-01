import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
} from '@open-wc/testing';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { finishAnimationsFor } from '../common/utils.spec.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import IgcCarouselComponent from './carousel.js';

describe('Carousel', () => {
  before(() => {
    defineComponents(IgcCarouselComponent);
  });

  const DIFF_OPTIONS = {
    ignoreAttributes: ['id'],
  };

  const BUTTON_DIFF_OPTIONS = {
    ignoreAttributes: ['type', 'variant', 'part'],
  };

  async function clickComplete(
    current: IgcCarouselSlideComponent,
    next: IgcCarouselSlideComponent
  ) {
    finishAnimationsFor(current.shadowRoot!);
    finishAnimationsFor(next.shadowRoot!);
    await elementUpdated(carousel);
    await nextFrame();
    await nextFrame();
  }

  const createCarouselComponent = () => html`
    <igc-carousel>
      <igc-carousel-slide>
        <span>1</span>
      </igc-carousel-slide>
      <igc-carousel-slide>
        <span>2</span>
      </igc-carousel-slide>
      <igc-carousel-slide>
        <span>3</span>
      </igc-carousel-slide>
    </igc-carousel>
  `;

  let carousel: IgcCarouselComponent;
  let slides: IgcCarouselSlideComponent[];

  beforeEach(async () => {
    carousel = await fixture<IgcCarouselComponent>(createCarouselComponent());
    slides = carousel.querySelectorAll(
      IgcCarouselSlideComponent.tagName
    ) as unknown as IgcCarouselSlideComponent[];
  });

  describe('Initialization', () => {
    it('passes the a11y audit', async () => {
      await expect(carousel).to.be.accessible();
      await expect(carousel).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(carousel.skipLoop).to.be.false;
      expect(carousel.skipPauseOnInteraction).to.be.false;
      expect(carousel.skipNavigation).to.be.false;
      expect(carousel.skipIndicator).to.be.false;
      expect(carousel.vertical).to.be.false;
      expect(carousel.indicatorsOrientation).to.equal('end');
      expect(carousel.interval).to.be.undefined;
      expect(carousel.maximumIndicatorsCount).to.equal(10);
      expect(carousel.animationType).to.equal('slide');
      expect(carousel.total).to.equal(slides.length);
      expect(carousel.current).to.equal(0);
      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.false;
    });

    it('is rendered correctly', () => {
      expect(carousel).dom.to.equal(
        `<igc-carousel>
          <igc-carousel-slide active>
            <span>1</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>2</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>3</span>
          </igc-carousel-slide>
        </igc-carousel>`,
        DIFF_OPTIONS
      );

      const carouselId = carousel.shadowRoot?.querySelector(
        'div[aria-live="polite"]'
      )?.id;
      expect(carousel).shadowDom.to.equal(
        `<section>
          <igc-button aria-label="Previous slide" aria-controls="${carouselId}">
            <slot name="previous-button">
              <igc-icon aria-hidden="true" collection="default" name="carousel_prev"></igc-icon>
            </slot>
          </igc-button>
          <igc-button aria-label="Next slide" aria-controls="${carouselId}">
            <slot name="next-button">
              <igc-icon aria-hidden="true" collection="default" name="carousel_next"></igc-icon>
            </slot>
          </igc-button>
          <igc-carousel-indicator-container>
            <div role="tablist">
              <slot name="indicator">
                <div aria-label="Slide 1" aria-selected="true" role="tab" tabindex="0">
                  <div></div>
                </div>
                <div aria-label="Slide 2" aria-selected="false" role="tab" tabindex="-1">
                  <div></div>
                </div>
                <div aria-label="Slide 3" aria-selected="false" role="tab" tabindex="-1">
                  <div></div>
                </div>
              </slot>
            </div>
          </igc-carousel-indicator-container>
          <div id="${carouselId}" aria-live="polite">
            <slot></slot>
          </div>
        </section>`,
        BUTTON_DIFF_OPTIONS
      );
    });

    it('slide is correctly rendered both in active/inactive states', async () => {
      expect(slides[0]).dom.to.equal(
        `<igc-carousel-slide active>
          <span>1</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[0]).shadowDom.to.equal(
        `<div part="base" tabindex="0">
          <slot></slot>
        </div>`
      );
      expect(slides[1]).dom.to.equal(
        `<igc-carousel-slide>
          <span>2</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[1]).shadowDom.to.equal(
        `<div part="base" tabindex="-1">
          <slot></slot>
        </div>`
      );

      slides[1].active = true;
      await elementUpdated(slides[1]);

      expect(slides[0]).dom.to.equal(
        `<igc-carousel-slide>
          <span>1</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[0]).shadowDom.to.equal(
        `<div part="base" tabindex="-1">
          <slot></slot>
        </div>`
      );
      expect(slides[1]).dom.to.equal(
        `<igc-carousel-slide active>
          <span>2</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[1]).shadowDom.to.equal(
        `<div part="base" tabindex="0">
          <slot></slot>
        </div>`
      );
    });

    it('should not render indicators if `skipIndicator` is true', async () => {
      let indicators = carousel.shadowRoot?.querySelector(
        'div[role="tablist"]'
      );
      expect(indicators).to.not.be.null;

      carousel.skipIndicator = true;
      await elementUpdated(carousel);

      indicators = carousel.shadowRoot?.querySelector('div[role="tablist"]');
      expect(indicators).to.be.null;
    });

    it('should not render navigation if `skipNavigation` is true', async () => {
      let navigation = carousel.shadowRoot?.querySelectorAll('igc-button');
      expect(navigation?.length).to.equal(2);

      carousel.skipNavigation = true;
      await elementUpdated(carousel);

      navigation = carousel.shadowRoot?.querySelectorAll('igc-button');
      expect(navigation?.length).to.equal(0);
    });

    it('should render indicators label if slides count is greater than `maximumIndicatorsCount`', async () => {
      let label = carousel.shadowRoot?.querySelector(
        'div[part="label indicators"]'
      );
      expect(label).to.be.null;

      carousel.maximumIndicatorsCount = 2;
      await elementUpdated(carousel);

      label = carousel.shadowRoot?.querySelector(
        'div[part="label indicators"]'
      );
      expect(label).to.not.be.null;
      expect(label?.textContent?.trim()).to.equal('1 / 3');
    });

    it('should not render indicators label if `skipIndicator` is true', async () => {
      let label = carousel.shadowRoot?.querySelector(
        'div[part="label indicators"]'
      );
      expect(label).to.be.null;

      carousel.maximumIndicatorsCount = 2;
      await elementUpdated(carousel);

      label = carousel.shadowRoot?.querySelector(
        'div[part="label indicators"]'
      );
      expect(label).to.not.be.null;
      expect(label?.textContent?.trim()).to.equal('1 / 3');

      carousel.skipIndicator = true;
      await elementUpdated(carousel);

      label = carousel.shadowRoot?.querySelector(
        'div[part="label indicators"]'
      );
      expect(label).to.be.null;
    });

    it('should set the first slide as active if none is set initially', async () => {
      // if none is set initially
      expect(carousel.current).to.equal(0);

      // if set initially, nothing changes
      carousel = await fixture<IgcCarouselComponent>(
        html`<igc-carousel>
          <igc-carousel-slide>
            <span>1</span>
          </igc-carousel-slide>
          <igc-carousel-slide active>
            <span>2</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>3</span>
          </igc-carousel-slide>
        </igc-carousel>`
      );

      expect(carousel.current).to.equal(1);
    });

    it('should set the active slide to be the last one if there are multiple active slides', async () => {
      // on initial rendering
      carousel = await fixture<IgcCarouselComponent>(
        html`<igc-carousel>
          <igc-carousel-slide active>
            <span>1</span>
          </igc-carousel-slide>
          <igc-carousel-slide active>
            <span>2</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>3</span>
          </igc-carousel-slide>
        </igc-carousel>`
      );

      expect(carousel.current).to.equal(1);

      // when adding active slides runtime
      const slide = document.createElement(IgcCarouselSlideComponent.tagName);
      slide.setAttribute('active', '');

      carousel.appendChild(slide);
      await elementUpdated(carousel);

      expect(carousel.total).to.equal(4);
      expect(carousel.current).to.equal(3);
    });
  });

  describe('Methods', () => {
    it('calls `play`, `pause` methods successfully', () => {
      carousel.play();

      expect(carousel.isPlaying).to.be.true;
      expect(carousel.isPaused).to.be.false;

      carousel.pause();

      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.true;
    });

    it('calls `next`, `prev` methods successfully', async () => {
      carousel = await fixture<IgcCarouselComponent>(
        html`<igc-carousel>
          <igc-carousel-slide>
            <span>1</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>2</span>
          </igc-carousel-slide>
        </igc-carousel>`
      );

      carousel.skipLoop = true;
      await elementUpdated(carousel);

      let animation = await carousel.next();
      expect(animation).to.be.true;
      expect(carousel.current).to.equal(1);

      animation = await carousel.next();
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(1);

      animation = await carousel.prev();
      expect(animation).to.be.true;
      expect(carousel.current).to.equal(0);

      animation = await carousel.prev();
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(0);
    });

    it('calls `select` method successfully', async () => {
      expect(carousel.current).to.equal(0);

      // select current slide
      let animation = await carousel.select(slides[0]);
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(0);

      // select invalid slide
      animation = await carousel.select(slides[3]);
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(0);

      // select last slide
      animation = await carousel.select(slides[2]);
      expect(animation).to.be.true;
      expect(carousel.current).to.equal(2);
    });
  });

  describe('Slots', () => {
    beforeEach(async () => {
      carousel = await fixture<IgcCarouselComponent>(
        html`<igc-carousel>
          <span slot="previous-button">left</span>
          <span slot="next-button">right</span>
          <igc-carousel-indicator>
            <span>empty</span>
            <span slot="active">full</span>
          </igc-carousel-indicator>

          <igc-carousel-slide>
            <span>1</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>2</span>
          </igc-carousel-slide>
          <igc-carousel-slide>
            <span>2</span>
          </igc-carousel-slide>
        </igc-carousel>`
      );
    });

    it('it should slot previous button icon', async () => {
      const prevButton = carousel.shadowRoot?.querySelectorAll('igc-button')[0];
      const slottedContent = prevButton
        ?.querySelector('slot')
        ?.assignedNodes()[0];
      expect(slottedContent?.nodeName.toLocaleLowerCase()).to.equal('span');
      expect(slottedContent?.textContent).to.equal('left');
    });

    it('it should slot next button icon', async () => {
      const nextButton = carousel.shadowRoot?.querySelectorAll('igc-button')[1];
      const slottedContent = nextButton
        ?.querySelector('slot')
        ?.assignedNodes()[0];
      expect(slottedContent?.nodeName.toLocaleLowerCase()).to.equal('span');
      expect(slottedContent?.textContent).to.equal('right');
    });

    it('it should slot indicator', async () => {
      const indicator = carousel?.querySelector('igc-carousel-indicator');
      expect(indicator).dom.to.equal(
        `<igc-carousel-indicator
          slot="indicator"
          role="tab"
          aria-label="Slide 1"
          aria-selected="true"
          tabindex="0"
        >
          <span>empty</span>
          <span slot="active">full</span>
        </igc-carousel-indicator>`,
        {
          ignoreAttributes: ['aria-controls'],
        }
      );
      expect(indicator).shadowDom.to.equal(
        `<div part="indicator inactive">
          <slot></slot>
        </div>
        <div part="indicator active">
          <slot name="active"></slot>
        </div>`,
        {
          ignoreAttributes: ['style'],
        }
      );
    });
  });

  describe('Interactions', () => {
    describe('Click', () => {
      it('it should change slide when clicking next button', async () => {
        const indicators = carousel.shadowRoot?.querySelectorAll(
          'div[role="tab"]'
        ) as NodeListOf<HTMLDivElement>;

        expect(carousel.current).to.equal(0);
        expect(indicators[0].ariaSelected).to.equal('true');

        const nextButton =
          carousel.shadowRoot?.querySelectorAll('igc-button')[1];

        nextButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await clickComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
        expect(indicators[0].ariaSelected).to.equal('false');
        expect(indicators[1].ariaSelected).to.equal('true');
      });

      it('it should change slide when clicking previous button', async () => {
        const indicators = carousel.shadowRoot?.querySelectorAll(
          'div[role="tab"]'
        ) as NodeListOf<HTMLDivElement>;

        expect(carousel.current).to.equal(0);
        expect(indicators[0].ariaSelected).to.equal('true');

        const prevButton =
          carousel.shadowRoot?.querySelectorAll('igc-button')[0];

        prevButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await clickComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(2);
        expect(indicators[0].ariaSelected).to.equal('false');
        expect(indicators[2].ariaSelected).to.equal('true');
      });

      it('it should change slide when clicking indicators', async () => {
        const indicators = carousel.shadowRoot?.querySelectorAll(
          'div[role="tab"]'
        ) as NodeListOf<HTMLDivElement>;

        expect(carousel.current).to.equal(0);
        expect(indicators[0].ariaSelected).to.equal('true');

        // select second slide
        indicators[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await clickComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
        expect(indicators[0].ariaSelected).to.equal('false');
        expect(indicators[1].ariaSelected).to.equal('true');

        // select first slide
        indicators[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await clickComplete(slides[1], slides[0]);

        expect(carousel.current).to.equal(0);
        expect(indicators[0].ariaSelected).to.equal('true');
        expect(indicators[1].ariaSelected).to.equal('false');
      });
    });
  });
});
