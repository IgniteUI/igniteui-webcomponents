import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';

import { type SinonFakeTimers, spy, stub, useFakeTimers } from 'sinon';
import {
  arrowLeft,
  arrowRight,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  finishAnimationsFor,
  getAnimationsFor,
} from '#internals/testing/helpers.spec.js';
import {
  simulateClick,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '#internals/testing/simulate.spec.js';
import IgcButtonComponent from '../button/button.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import IgcCarouselComponent from './carousel.js';

describe('Carousel', () => {
  before(() => {
    defineComponents(IgcCarouselComponent);
  });

  const DIFF_OPTIONS = {
    ignoreAttributes: ['id'],
  };

  async function slideChangeComplete(
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

  const createCarousel = ({ indicators = 0, slides = 0 }) => html`
    <igc-carousel>
      ${Array.from(
        { length: indicators },
        (_, i) =>
          html`<igc-carousel-indicator
            ><span>${i}</span></igc-carousel-indicator
          >`
      )}
      ${Array.from(
        { length: slides },
        (_, i) =>
          html`<igc-carousel-slide><span>${i}</span></igc-carousel-slide>`
      )}
    </igc-carousel>
  `;

  let carousel: IgcCarouselComponent;
  let slides: IgcCarouselSlideComponent[];
  let carouselSlidesContainer: Element;
  let nextButton: IgcButtonComponent;
  let prevButton: IgcButtonComponent;
  let defaultIndicators: IgcCarouselIndicatorComponent[];
  let clock: SinonFakeTimers;

  beforeEach(async () => {
    carousel = await fixture<IgcCarouselComponent>(createCarouselComponent());

    slides = Array.from(
      carousel.querySelectorAll(IgcCarouselSlideComponent.tagName)
    );

    [prevButton, nextButton] = carousel.renderRoot.querySelectorAll(
      IgcButtonComponent.tagName
    );

    defaultIndicators = Array.from(
      carousel.renderRoot.querySelectorAll(
        IgcCarouselIndicatorComponent.tagName
      )
    );
  });

  describe('Initialization', () => {
    it('passes the a11y audit', async () => {
      await expect(carousel).to.be.accessible();
      await expect(carousel).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(carousel.disableLoop).to.be.false;
      expect(carousel.disablePauseOnInteraction).to.be.false;
      expect(carousel.hideNavigation).to.be.false;
      expect(carousel.hideIndicators).to.be.false;
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
          <igc-carousel-indicator-container>
            <div role="tablist">
              <slot name="indicator">
                <igc-carousel-indicator
                  aria-label="slide 1"
                  role="tab"
                  tabindex="0"
                  slot="indicator"
                  exportparts="indicator, active, inactive"
                >
                  <div></div>
                  <div slot="active"></div>
                </igc-carousel-indicator>
                <igc-carousel-indicator
                  aria-label="slide 2"
                  role="tab"
                  tabindex="-1"
                  slot="indicator"
                  exportparts="indicator, active, inactive"
                >
                  <div></div>
                  <div slot="active"></div>
                </igc-carousel-indicator>
                <igc-carousel-indicator
                  aria-label="slide 3"
                  role="tab"
                  tabindex="-1"
                  slot="indicator"
                  exportparts="indicator, active, inactive"
                >
                  <div></div>
                  <div slot="active"></div>
                </igc-carousel-indicator>
              </slot>
            </div>
          </igc-carousel-indicator-container>
          <igc-button aria-label="previous slide" aria-controls="${carouselId}">
            <slot name="previous-button">
              <igc-icon aria-hidden="true" collection="default" name="carousel_prev"></igc-icon>
            </slot>
          </igc-button>
          <igc-button aria-label="next slide" aria-controls="${carouselId}">
            <slot name="next-button">
              <igc-icon aria-hidden="true" collection="default" name="carousel_next"></igc-icon>
            </slot>
          </igc-button>
          <div id="${carouselId}" aria-live="polite">
            <slot></slot>
          </div>
        </section>`,
        {
          ignoreAttributes: ['type', 'variant', 'part', 'style'],
        }
      );
    });

    it('slide is correctly rendered both in active/inactive states', async () => {
      expect(slides[0]).dom.to.equal(
        `<igc-carousel-slide active>
          <span>1</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[1]).dom.to.equal(
        `<igc-carousel-slide>
          <span>2</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );

      slides[1].active = true;
      await elementUpdated(slides[1]);

      expect(slides[0]).dom.to.equal(
        `<igc-carousel-slide>
          <span>1</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
      expect(slides[1]).dom.to.equal(
        `<igc-carousel-slide active>
          <span>2</span>
        </igc-carousel-slide>`,
        DIFF_OPTIONS
      );
    });

    it('should not render indicators if `hideIndicators` is true', async () => {
      let indicators = carousel.shadowRoot?.querySelector(
        'div[role="tablist"]'
      );
      expect(indicators).to.not.be.null;

      carousel.hideIndicators = true;
      await elementUpdated(carousel);

      indicators = carousel.shadowRoot?.querySelector('div[role="tablist"]');
      expect(indicators).to.be.null;
    });

    it('should not render navigation if `hideNavigation` is true', async () => {
      let navigation = carousel.shadowRoot?.querySelectorAll('igc-button');
      expect(navigation?.length).to.equal(2);

      carousel.hideNavigation = true;
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
      expect(label?.textContent?.trim()).to.equal('1 of 3');

      carousel.slidesLabelFormat = 'Showing picture {0} of {1} total slides';
      await elementUpdated(carousel);

      expect(label?.textContent?.trim()).to.equal(
        'Showing picture 1 of 3 total slides'
      );
    });

    it('should not render indicators label if `hideIndicators` is true', async () => {
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
      expect(label?.textContent?.trim()).to.equal('1 of 3');

      carousel.hideIndicators = true;
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

      carousel.disableLoop = true;
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

      // select current slide by index
      animation = await carousel.select(2);
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(2);

      // select invalid slide by index
      animation = await carousel.select(3);
      expect(animation).to.be.false;
      expect(carousel.current).to.equal(2);

      // select first slide by index
      animation = await carousel.select(0);
      expect(animation).to.be.true;
      expect(carousel.current).to.equal(0);
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
        </igc-carousel>`
      );

      nextButton = carousel.shadowRoot?.querySelectorAll(
        'igc-button'
      )[1] as IgcButtonComponent;
      prevButton = carousel.shadowRoot?.querySelectorAll(
        'igc-button'
      )[0] as IgcButtonComponent;
    });

    it('should slot previous button icon', async () => {
      const slottedContent = prevButton
        ?.querySelector('slot')
        ?.assignedNodes()[0];
      expect(slottedContent?.nodeName.toLocaleLowerCase()).to.equal('span');
      expect(slottedContent?.textContent).to.equal('left');
    });

    it('should slot next button icon', async () => {
      const slottedContent = nextButton
        ?.querySelector('slot')
        ?.assignedNodes()[0];
      expect(slottedContent?.nodeName.toLocaleLowerCase()).to.equal('span');
      expect(slottedContent?.textContent).to.equal('right');
    });

    it('should slot indicator', async () => {
      const indicator = carousel?.querySelector('igc-carousel-indicator');
      expect(indicator).dom.to.equal(
        `<igc-carousel-indicator
          aria-label="slide 1"
          slot="indicator"
          role="tab"
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
    describe('Focus', () => {
      it('should delegate focus to the active indicator in the indicator container when present', async () => {
        carousel.focus();
        expect(carousel.shadowRoot?.activeElement).to.equal(
          carousel.renderRoot.querySelector(
            'igc-carousel-indicator[tabindex="0"]'
          )
        );
      });

      it('should delegate focus to the previous button when the indicator container is not present', async () => {
        carousel.hideIndicators = true;
        await elementUpdated(carousel);

        carousel.focus();
        expect(carousel.shadowRoot?.activeElement).to.equal(prevButton);
      });
    });

    describe('Click', () => {
      it('should change slide when clicking next button', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        expect(carousel.current).to.equal(0);
        expect(defaultIndicators[0].active).to.be.true;

        simulateClick(nextButton!);
        await waitUntil(() => eventSpy.calledWith('igcSlideChanged'));

        expect(carousel.current).to.equal(1);
        expect(defaultIndicators[0].active).to.be.false;
        expect(defaultIndicators[1].active).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcSlideChanged', { detail: 1 });
      });

      it('should change slide when clicking previous button', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        expect(carousel.current).to.equal(0);
        expect(defaultIndicators[0].active).to.be.true;

        simulateClick(prevButton!);
        await waitUntil(() => eventSpy.calledWith('igcSlideChanged'));

        expect(carousel.current).to.equal(2);
        expect(defaultIndicators[0].active).to.be.false;
        expect(defaultIndicators[2].active).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcSlideChanged', { detail: 2 });
      });

      it('should change slide when clicking indicators', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        expect(carousel.current).to.equal(0);
        expect(defaultIndicators[0].active).to.be.true;

        simulateClick(defaultIndicators[1]);
        await waitUntil(() =>
          eventSpy.calledWith('igcSlideChanged', { detail: 1 })
        );

        expect(carousel.current).to.equal(1);
        expect(defaultIndicators[0].active).to.be.false;
        expect(defaultIndicators[1].active).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcSlideChanged', { detail: 1 });

        simulateClick(defaultIndicators[0]);
        await waitUntil(() =>
          eventSpy.calledWith('igcSlideChanged', { detail: 0 })
        );

        expect(carousel.current).to.equal(0);
        expect(defaultIndicators[0].active).to.be.true;
        expect(defaultIndicators[1].active).to.be.false;
        expect(eventSpy.secondCall).calledWith('igcSlideChanged', {
          detail: 0,
        });
      });

      it('should properly call `igcSlideChanged` event', async () => {
        const eventSpy = spy(carousel, 'emitEvent');

        stub(carousel, 'select')
          .onFirstCall()
          .resolves(true)
          .onSecondCall()
          .resolves(false);

        // select second indicator
        simulateClick(defaultIndicators[1]);
        await slideChangeComplete(slides[0], slides[1]);

        // select second indicator again
        simulateClick(defaultIndicators[1]);
        await slideChangeComplete(slides[0], slides[1]);

        expect(eventSpy.callCount).to.equal(1);
      });
    });

    describe('Keyboard', () => {
      it('should change to next slide on Enter/Space keys', async () => {
        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        simulateKeyboard(nextButton!, spaceBar);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);

        simulateKeyboard(nextButton!, enterKey);
        await slideChangeComplete(slides[1], slides[2]);

        expect(carousel.current).to.equal(2);
      });

      it('should change to previous slide on Enter/Space keys', async () => {
        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        simulateKeyboard(prevButton!, spaceBar);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(2);

        simulateKeyboard(prevButton!, enterKey);
        await slideChangeComplete(slides[2], slides[1]);

        expect(carousel.current).to.equal(1);
      });

      it('should change slides on ArrowLeft/ArrowRight/Home/End keys (LTR)', async () => {
        const indicatorsContainer = carousel.shadowRoot?.querySelector(
          'div[role="tablist"]'
        ) as HTMLDivElement;
        expect(carousel.current).to.equal(0);

        simulateKeyboard(indicatorsContainer, arrowRight);
        await slideChangeComplete(slides[0], slides[1]);
        expect(carousel.current).to.equal(1);

        simulateKeyboard(indicatorsContainer, arrowLeft);
        await slideChangeComplete(slides[1], slides[0]);
        expect(carousel.current).to.equal(0);

        simulateKeyboard(indicatorsContainer, endKey);
        await slideChangeComplete(slides[0], slides[2]);
        expect(carousel.current).to.equal(2);

        simulateKeyboard(indicatorsContainer, homeKey);
        await slideChangeComplete(slides[2], slides[0]);
        expect(carousel.current).to.equal(0);
      });

      it('should change slides on ArrowLeft/ArrowRight/Home/End keys (RTL)', async () => {
        carousel.dir = 'rtl';
        await elementUpdated(carousel);
        const indicatorsContainer = carousel.shadowRoot?.querySelector(
          'div[role="tablist"]'
        ) as HTMLDivElement;
        expect(carousel.current).to.equal(0);

        simulateKeyboard(indicatorsContainer, arrowRight);
        await slideChangeComplete(slides[0], slides[2]);
        expect(carousel.current).to.equal(2);

        simulateKeyboard(indicatorsContainer, arrowLeft);
        await slideChangeComplete(slides[2], slides[0]);
        expect(carousel.current).to.equal(0);

        simulateKeyboard(indicatorsContainer, homeKey);
        await slideChangeComplete(slides[0], slides[2]);
        expect(carousel.current).to.equal(2);

        simulateKeyboard(indicatorsContainer, endKey);
        await slideChangeComplete(slides[2], slides[0]);
        expect(carousel.current).to.equal(0);
      });
    });

    describe('Automatic rotation', () => {
      beforeEach(async () => {
        clock = useFakeTimers({ toFake: ['setInterval'] });
      });

      afterEach(() => clock.restore());

      it('should automatically change slides', async () => {
        expect(carousel.current).to.equal(0);

        carousel.interval = 200;
        await elementUpdated(carousel);

        await clock.tickAsync(200);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
      });

      it('should properly call `igcSlideChanged` event', async () => {
        const eventSpy = spy(carousel, 'emitEvent');

        carousel.disableLoop = true;
        carousel.interval = 100;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        await clock.tickAsync(300);

        expect(carousel.current).to.equal(2);
        expect(eventSpy.callCount).to.equal(2);
      });

      it('should pause/play on pointerenter/pointerleave', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        const divContainer = carousel.shadowRoot?.querySelector(
          'div[aria-live]'
        ) as HTMLDivElement;

        expect(divContainer.ariaLive).to.equal('polite');

        carousel.interval = 2000;
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        expect(eventSpy.callCount).to.equal(2);
        expect(eventSpy.firstCall).calledWith('igcPaused');
        expect(eventSpy.secondCall).calledWith('igcPlaying');
      });

      it('should pause/play on keyboard interaction', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        const divContainer = carousel.shadowRoot?.querySelector(
          'div[aria-live]'
        ) as HTMLDivElement;

        expect(divContainer.ariaLive).to.equal('polite');

        carousel.interval = 2000;
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        carousel.dispatchEvent(new FocusEvent('focusin'));
        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        // Focus is still inside, so pointerleave does not resume the rotation.
        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        carousel.dispatchEvent(new FocusEvent('focusout'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        expect(eventSpy.callCount).to.equal(2);
        expect(eventSpy.firstCall).calledWith('igcPaused');
        expect(eventSpy.secondCall).calledWith('igcPlaying');
      });

      it('should pause when focusing an interactive element - issue #1731', async () => {
        carousel.interval = 200;
        await elementUpdated(carousel);

        await clock.tickAsync(199);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(carousel.current).to.equal(0);

        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        await clock.tickAsync(1);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(carousel.current).to.equal(0);

        carousel.dispatchEvent(new FocusEvent('focusin'));
        await elementUpdated(carousel);

        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        await clock.tickAsync(200);

        // Focus is still inside, so pointerleave does not resume the rotation.
        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(carousel.current).to.equal(0);

        carousel.dispatchEvent(new FocusEvent('focusout'));
        await elementUpdated(carousel);

        await clock.tickAsync(200);

        // The focus left, so the rotation resumes.
        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(carousel.current).to.equal(2);
      });

      it('should not pause on interaction if `disablePauseOnInteraction` is true', async () => {
        const eventSpy = spy(carousel, 'emitEvent');
        const divContainer = carousel.shadowRoot?.querySelector(
          'div[aria-live]'
        ) as HTMLDivElement;

        expect(divContainer.ariaLive).to.equal('polite');

        carousel.interval = 2000;
        carousel.disablePauseOnInteraction = true;
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.true;
        expect(carousel.isPaused).to.be.false;
        expect(divContainer.ariaLive).to.equal('off');

        expect(eventSpy.callCount).to.equal(0);
      });
    });

    describe('Swipe', () => {
      beforeEach(() => {
        carouselSlidesContainer = carousel.shadowRoot?.querySelector(
          'div[aria-live="polite"]'
        ) as Element;
      });

      it('should change to next slide on swipe-left', async () => {
        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
      });

      it('should change to previous slide on swipe-left (RTL)', async () => {
        carousel.dir = 'rtl';
        await elementUpdated(carousel);
        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(2);
      });

      it('should change to previous slide on swipe-right', async () => {
        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(2);
      });

      it('should change to next slide on swipe-right (RTL)', async () => {
        carousel.dir = 'rtl';
        await elementUpdated(carousel);
        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
      });

      it('should not change to next/previous slide on swipe left/right when `vertical` is true', async () => {
        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        // swipe left
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(0);

        // swipe right
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(0);
      });

      it('should change to next slide on swipe-up', async () => {
        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(1);
      });

      it('should change to previous slide on swipe-down', async () => {
        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(2);
      });

      it('should not change to next/previous slide on swipe up/down when `vertical` is false', async () => {
        expect(carousel.current).to.equal(0);
        expect(carousel.vertical).to.be.false;

        // swipe up
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(0);

        // swipe down
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(0);
      });

      it('should not change to next/previous slide on mouse swipe', async () => {
        expect(carousel.current).to.equal(0);

        // swipe left
        simulatePointerDown(carouselSlidesContainer, { pointerType: 'mouse' });
        simulatePointerMove(
          carouselSlidesContainer,
          { pointerType: 'mouse' },
          { x: -100 },
          10
        );
        simulateLostPointerCapture(carouselSlidesContainer, {
          pointerType: 'mouse',
        });
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(0);

        // swipe right
        simulatePointerDown(carouselSlidesContainer, { pointerType: 'mouse' });
        simulatePointerMove(
          carouselSlidesContainer,
          { pointerType: 'mouse' },
          { x: 100 },
          10
        );
        simulateLostPointerCapture(carouselSlidesContainer, {
          pointerType: 'mouse',
        });
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(0);

        // swipe up
        simulatePointerDown(carouselSlidesContainer, { pointerType: 'mouse' });
        simulatePointerMove(
          carouselSlidesContainer,
          { pointerType: 'mouse' },
          { y: -100 },
          10
        );
        simulateLostPointerCapture(carouselSlidesContainer, {
          pointerType: 'mouse',
        });
        await slideChangeComplete(slides[0], slides[1]);

        expect(carousel.current).to.equal(0);

        // swipe down
        simulatePointerDown(carouselSlidesContainer, { pointerType: 'mouse' });
        simulatePointerMove(
          carouselSlidesContainer,
          { pointerType: 'mouse' },
          { y: 100 },
          10
        );
        simulateLostPointerCapture(carouselSlidesContainer, {
          pointerType: 'mouse',
        });
        await slideChangeComplete(slides[0], slides[2]);

        expect(carousel.current).to.equal(0);
      });

      it('should properly call `igcSlideChanged` event', async () => {
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

        carouselSlidesContainer = carousel.shadowRoot?.querySelector(
          'div[aria-live="polite"]'
        ) as Element;

        const eventSpy = spy(carousel, 'emitEvent');

        const prevStub = stub(carousel, 'prev');
        const nextStub = stub(carousel, 'next');

        prevStub.resolves(false);
        nextStub.onFirstCall().resolves(true).onSecondCall().resolves(false);

        carousel.disableLoop = true;
        await elementUpdated(carousel);

        expect(carousel.current).to.equal(0);

        // swipe right - disabled
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[2]);

        // swipe left
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        // swipe left - disabled
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { x: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[0], slides[1]);

        expect(eventSpy.callCount).to.equal(1);

        eventSpy.resetHistory();
        prevStub.resetHistory();
        nextStub.resetHistory();

        prevStub.resolves(false);
        nextStub.onFirstCall().resolves(true).onSecondCall().resolves(false);

        carousel.vertical = true;
        await elementUpdated(carousel);

        expect(eventSpy.callCount).to.equal(0);

        // swipe down - disabled
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: 100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[2], slides[0]);

        // swipe up
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[2], slides[1]);

        // swipe up - disabled
        simulatePointerDown(carouselSlidesContainer);
        simulatePointerMove(carouselSlidesContainer, {}, { y: -100 }, 10);
        simulateLostPointerCapture(carouselSlidesContainer);
        await slideChangeComplete(slides[1], slides[0]);

        expect(eventSpy.callCount).to.equal(1);
      });
    });
  });

  describe('Autoplay lifecycle', () => {
    let clock: SinonFakeTimers;

    beforeEach(() => {
      clock = useFakeTimers({
        toFake: ['setInterval', 'clearInterval', 'setTimeout'],
      });
    });

    afterEach(() => clock.restore());

    async function startRotation(interval = 1000) {
      carousel.interval = interval;
      await elementUpdated(carousel);
    }

    it('should stop the rotation when removed from the DOM', async () => {
      await startRotation();

      const eventSpy = spy(carousel, 'emitEvent');
      carousel.remove();
      await clock.tickAsync(3500);

      expect(eventSpy.callCount).to.equal(0);
      expect(clock.countTimers()).to.equal(0);
    });

    it('should resume the rotation when re-attached while playing', async () => {
      await startRotation();

      const parent = carousel.parentElement!;
      carousel.remove();
      parent.append(carousel);
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.true;
      expect(clock.countTimers()).to.equal(1);
    });

    it('should not resume a paused carousel on pointer interaction', async () => {
      const eventSpy = spy(carousel, 'emitEvent');

      await startRotation();

      carousel.pause();
      carousel.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.false;

      carousel.dispatchEvent(new PointerEvent('pointerleave'));
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.true;
      expect(eventSpy).not.calledWith('igcPlaying');
    });

    it('should not resume a paused carousel on focus interaction', async () => {
      await startRotation();

      carousel.pause();
      carousel.dispatchEvent(new FocusEvent('focusin'));
      carousel.dispatchEvent(new FocusEvent('focusout'));
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.true;
    });

    it('should reset the playing state when the interval is cleared', async () => {
      await startRotation();

      expect(carousel.isPlaying).to.be.true;

      carousel.interval = undefined;
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.false;
      expect(clock.countTimers()).to.equal(0);
    });

    it('should restart the rotation of a paused carousel on a new interval', async () => {
      await startRotation();

      carousel.pause();
      expect(carousel.isPaused).to.be.true;

      await startRotation(500);

      expect(carousel.isPlaying).to.be.true;
      expect(carousel.isPaused).to.be.false;
    });

    it('should keep an explicit pause after the interaction ends', async () => {
      await startRotation();

      carousel.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(carousel);

      carousel.pause();
      carousel.dispatchEvent(new PointerEvent('pointerleave'));
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.false;
      expect(carousel.isPaused).to.be.true;
    });

    it('should keep the rotation paused when the interval changes during an interaction', async () => {
      await startRotation();

      carousel.dispatchEvent(new PointerEvent('pointerenter'));
      await elementUpdated(carousel);

      await startRotation(500);

      expect(carousel.isPlaying).to.be.false;
      expect(clock.countTimers()).to.equal(0);

      carousel.dispatchEvent(new PointerEvent('pointerleave'));
      await elementUpdated(carousel);

      expect(carousel.isPlaying).to.be.true;
    });

    it('should not start a timer while detached', async () => {
      const parent = carousel.parentElement!;
      carousel.remove();

      carousel.interval = 1000;
      await elementUpdated(carousel);

      const eventSpy = spy(carousel, 'emitEvent');
      await clock.tickAsync(3500);

      expect(eventSpy).not.calledWith('igcSlideChanged');
      expect(clock.countTimers()).to.equal(0);

      parent.append(carousel);
      await elementUpdated(carousel);

      expect(clock.countTimers()).to.equal(1);
    });

    it('should not leave a timer behind at the `disableLoop` end stop', async () => {
      carousel.disableLoop = true;
      await startRotation();

      await carousel.select(2);
      await slideChangeComplete(slides[0], slides[2]);

      simulateKeyboard(defaultIndicators[2], arrowRight);
      await elementUpdated(carousel);
      await nextFrame();

      expect(carousel.current).to.equal(2);
      expect(carousel.isPlaying).to.be.false;
      expect(clock.countTimers()).to.equal(0);
    });
  });

  describe('Slide and indicator integrity', () => {
    async function removeSlide(slide: IgcCarouselSlideComponent) {
      slide.remove();
      await elementUpdated(carousel);
      await nextFrame();
    }

    it('should move the active state when the active slide is removed', async () => {
      await carousel.select(1);
      await slideChangeComplete(slides[0], slides[1]);

      await removeSlide(slides[1]);

      expect(carousel.total).to.equal(2);
      expect(carousel.current).to.equal(1);
      expect(carousel.slides.map((slide) => slide.active)).to.eql([
        false,
        true,
      ]);
    });

    it('should activate the last slide when the removed one was last', async () => {
      await carousel.select(2);
      await slideChangeComplete(slides[0], slides[2]);

      await removeSlide(slides[2]);

      expect(carousel.current).to.equal(1);
      expect(carousel.slides[1].active).to.be.true;
    });

    it('should not throw when the last remaining slide is removed', async () => {
      const single = await fixture<IgcCarouselComponent>(
        createCarousel({ slides: 1 })
      );
      await nextFrame();

      single.slides[0].remove();
      await elementUpdated(single);
      await nextFrame();

      expect(single.total).to.equal(0);
      expect(single.current).to.equal(0);
    });

    it('should render with fewer projected indicators than slides', async () => {
      const errors: unknown[] = [];
      const onError = (event: ErrorEvent) =>
        errors.push(event.error ?? event.message);

      window.addEventListener('error', onError);

      const el = await fixture<IgcCarouselComponent>(
        createCarousel({ indicators: 1, slides: 2 })
      );
      await nextFrame();
      window.removeEventListener('error', onError);

      const [indicator] = el.querySelectorAll(
        IgcCarouselIndicatorComponent.tagName
      );

      expect(errors).to.be.empty;
      expect(indicator.active).to.be.true;
      expect(indicator.getAttribute('aria-controls')).to.equal(el.slides[0].id);
    });

    it('should render with more projected indicators than slides', async () => {
      const el = await fixture<IgcCarouselComponent>(
        createCarousel({ indicators: 2, slides: 1 })
      );
      await nextFrame();

      const indicators = Array.from(
        el.querySelectorAll(IgcCarouselIndicatorComponent.tagName)
      );

      expect(indicators[1].active).to.be.false;
      expect(indicators[1].hasAttribute('aria-controls')).to.be.false;
    });

    it('should activate a slide added to an empty carousel', async () => {
      const el = await fixture<IgcCarouselComponent>(createCarousel({}));
      await nextFrame();

      const slide = document.createElement(IgcCarouselSlideComponent.tagName);
      el.append(slide);
      await elementUpdated(el);
      await nextFrame();

      expect(el.total).to.equal(1);
      expect(el.current).to.equal(0);
      expect(slide.active).to.be.true;
    });

    it('should activate a slide added after the carousel was emptied', async () => {
      const el = await fixture<IgcCarouselComponent>(
        createCarousel({ slides: 1 })
      );
      await nextFrame();

      el.slides[0].remove();
      await elementUpdated(el);
      await nextFrame();

      const slide = document.createElement(IgcCarouselSlideComponent.tagName);
      el.append(slide);
      await elementUpdated(el);
      await nextFrame();

      expect(el.total).to.equal(1);
      expect(slide.active).to.be.true;
    });

    it('should not activate a projected indicator without a slide', async () => {
      const el = await fixture<IgcCarouselComponent>(
        createCarousel({ indicators: 2, slides: 1 })
      );
      await nextFrame();

      el.slides[0].remove();
      await elementUpdated(el);
      await nextFrame();

      const indicators = Array.from(
        el.querySelectorAll(IgcCarouselIndicatorComponent.tagName)
      );

      expect(el.total).to.equal(0);
      expect(indicators.some((indicator) => indicator.active)).to.be.false;
    });

    it('should not steal focus on a programmatic change after a no-op key press', async () => {
      carousel.disableLoop = true;
      await carousel.select(2);
      await slideChangeComplete(slides[0], slides[2]);

      // At the last slide with `disableLoop` the key press changes nothing
      simulateKeyboard(defaultIndicators[2], arrowRight);
      await elementUpdated(carousel);
      await nextFrame();

      (carousel.shadowRoot!.activeElement as HTMLElement | null)?.blur();

      await carousel.select(0);
      await slideChangeComplete(slides[2], slides[0]);

      expect(carousel.shadowRoot!.activeElement).to.be.null;
    });

    it('should not throw on `select` before the first render', async () => {
      const el = document.createElement(IgcCarouselComponent.tagName);

      for (const _ of [0, 1, 2]) {
        el.appendChild(
          document.createElement(IgcCarouselSlideComponent.tagName)
        );
      }

      document.body.appendChild(el);
      expect(await el.select(1)).to.be.false;
      el.remove();
    });
  });

  describe('Animations, labels and projected indicators', () => {
    /** The keyframes of the animations the slide plays on its host. */
    function keyframesOf(slide: IgcCarouselSlideComponent) {
      return getAnimationsFor(slide).flatMap((animation) =>
        (animation.effect as KeyframeEffect).getKeyframes()
      );
    }

    it('should apply a custom `indicatorsLabelFormat` to the indicators', async () => {
      carousel.indicatorsLabelFormat = 'Go to slide {0}';
      await elementUpdated(carousel);
      await elementUpdated(defaultIndicators[1]);

      expect(carousel.indicatorsLabelFormat).to.equal('Go to slide {0}');
      expect(defaultIndicators[1].getAttribute('aria-label')).to.equal(
        'Go to slide 2'
      );
    });

    it('should play a fade animation when `animationType` is fade', async () => {
      carousel.animationType = 'fade';
      await elementUpdated(carousel);

      const selected = carousel.select(1);
      const frames = keyframesOf(slides[1]);
      finishAnimationsFor(slides[0]);
      finishAnimationsFor(slides[1]);
      await selected;

      expect(frames).to.not.be.empty;
      expect(frames.every((frame) => 'opacity' in frame)).to.be.true;
      expect(frames.some((frame) => 'transform' in frame)).to.be.false;
      expect(carousel.current).to.equal(1);
    });

    it('should play a vertical slide animation when `vertical` is set', async () => {
      carousel.vertical = true;
      await elementUpdated(carousel);

      const selected = carousel.select(1);
      const frames = keyframesOf(slides[1]);
      finishAnimationsFor(slides[0]);
      finishAnimationsFor(slides[1]);
      await selected;

      expect(frames.map((frame) => frame.transform)).to.eql([
        'translateY(100%)',
        'translateY(0px)',
      ]);
    });

    it('should switch slides without keyframes when `animationType` is none', async () => {
      carousel.animationType = 'none';
      await elementUpdated(carousel);

      const selected = carousel.select(2);
      const frames = keyframesOf(slides[2]);

      expect(await selected).to.be.true;
      expect(frames).to.be.empty;
      expect(carousel.current).to.equal(2);
      expect(slides[2].active).to.be.true;
      expect(slides[0].active).to.be.false;
    });

    it('should slide horizontally for a slide outside of a carousel', async () => {
      const slide = await fixture<IgcCarouselSlideComponent>(
        html`<igc-carousel-slide><span>1</span></igc-carousel-slide>`
      );

      const played = slide.toggleAnimation('in');
      const frames = keyframesOf(slide);
      finishAnimationsFor(slide);

      expect(await played).to.be.true;
      expect(frames.map((frame) => frame.transform)).to.eql([
        'translateX(100%)',
        'translateX(0px)',
      ]);
    });

    it('should select the slide of a clicked projected indicator', async () => {
      const el = await fixture<IgcCarouselComponent>(
        createCarousel({ indicators: 3, slides: 3 })
      );
      await nextFrame();

      const indicators = Array.from(
        el.querySelectorAll(IgcCarouselIndicatorComponent.tagName)
      );
      const eventSpy = spy(el, 'emitEvent');

      simulateClick(indicators[2]);
      await waitUntil(() =>
        eventSpy.calledWith('igcSlideChanged', { detail: 2 })
      );
      await elementUpdated(el);

      expect(el.current).to.equal(2);
      expect(eventSpy).calledWith('igcSlideChanged', { detail: 2 });
      expect(indicators[2].active).to.be.true;
      expect(indicators[0].active).to.be.false;
    });

    it('should keep a slide that is activated and moved as the only active one', async () => {
      // The move adds a known slide while two slides are active.
      slides[1].active = true;
      carousel.append(slides[1]);
      await elementUpdated(carousel);
      await nextFrame();

      expect(carousel.slides).to.eql([slides[0], slides[2], slides[1]]);
      expect(carousel.current).to.equal(2);
      expect(carousel.slides.map((slide) => slide.active)).to.eql([
        false,
        false,
        true,
      ]);
    });

    it('should keep the last active slide when one is activated while another is removed', async () => {
      // The removal is observed before the `active` attribute is reflected.
      slides[1].remove();
      slides[2].active = true;
      await elementUpdated(carousel);
      await nextFrame();

      expect(carousel.total).to.equal(2);
      expect(carousel.current).to.equal(1);
      expect(carousel.slides.map((slide) => slide.active)).to.eql([
        false,
        true,
      ]);
    });

    it('should stay paused while the focus moves between slotted elements', async () => {
      const el = await fixture<IgcCarouselComponent>(html`
        <igc-carousel interval="10000">
          <igc-carousel-slide>
            <button id="first">First</button>
            <button id="second">Second</button>
          </igc-carousel-slide>
        </igc-carousel>
      `);
      const [first, second] = el.querySelectorAll('button');
      const eventSpy = spy(el, 'emitEvent');

      first.focus();
      await elementUpdated(el);

      expect(el.isPaused).to.be.true;
      expect(eventSpy).calledOnceWith('igcPaused');

      // Without the guard the focusout would resume and the focusin pause again.
      second.focus();
      await elementUpdated(el);

      expect(el.isPaused).to.be.true;
      expect(el.isPlaying).to.be.false;
      expect(eventSpy).calledOnce;
    });

    it('should activate the selected slide when no slide is active yet', async () => {
      const el = document.createElement(IgcCarouselComponent.tagName);

      for (const _ of [0, 1, 2]) {
        el.appendChild(
          document.createElement(IgcCarouselSlideComponent.tagName)
        );
      }

      // `select` runs right after the first render, before the carousel
      // activates its initial slide.
      let hadActiveSlide = true;
      let selected: Promise<boolean> | undefined;

      el.addController({
        hostUpdated() {
          if (!selected) {
            hadActiveSlide = el.slides.some((slide) => slide.active);
            selected = el.select(1);
          }
        },
      });

      document.body.appendChild(el);
      await el.updateComplete;

      expect(hadActiveSlide).to.be.false;
      expect(await selected).to.be.true;
      expect(el.current).to.equal(1);
      expect(el.slides.map((slide) => slide.active)).to.eql([
        false,
        true,
        false,
      ]);
      el.remove();
    });
  });
});
