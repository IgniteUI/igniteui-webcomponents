import {
  elementUpdated,
  expect,
  fixture,
  html,
  nextFrame,
  waitUntil,
} from '@open-wc/testing';

import { type SinonFakeTimers, spy, stub, useFakeTimers } from 'sinon';
import IgcButtonComponent from '../button/button.js';
import {
  arrowLeft,
  arrowRight,
  endKey,
  enterKey,
  homeKey,
  spaceBar,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  finishAnimationsFor,
  simulateClick,
  simulateKeyboard,
  simulateLostPointerCapture,
  simulatePointerDown,
  simulatePointerMove,
} from '../common/utils.spec.js';
import IgcCarouselComponent from './carousel.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselSlideComponent from './carousel-slide.js';

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
                <igc-carousel-indicator
                  role="tab"
                  tabindex="0"
                  slot="indicator"
                  exportparts="indicator, active, inactive"
                >
                  <div></div>
                  <div slot="active"></div>
                </igc-carousel-indicator>
                <igc-carousel-indicator
                  role="tab"
                  tabindex="-1"
                  slot="indicator"
                  exportparts="indicator, active, inactive"
                >
                  <div></div>
                  <div slot="active"></div>
                </igc-carousel-indicator>
                <igc-carousel-indicator
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

      // slidesLabelFormat integration
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

      // select fist slide by index
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

        // select second slide
        simulateClick(defaultIndicators[1]);
        await waitUntil(() =>
          eventSpy.calledWith('igcSlideChanged', { detail: 1 })
        );

        expect(carousel.current).to.equal(1);
        expect(defaultIndicators[0].active).to.be.false;
        expect(defaultIndicators[1].active).to.be.true;
        expect(eventSpy.firstCall).calledWith('igcSlideChanged', { detail: 1 });

        // select first slide
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

        // hover carousel
        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        // focus a focusable element
        carousel.dispatchEvent(new FocusEvent('focusin'));
        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        // element focus/interaction is present
        // -> should not start rotation on pointerleave
        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        // hover carousel
        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        // loose focus
        carousel.dispatchEvent(new FocusEvent('focusout'));
        await elementUpdated(carousel);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(divContainer.ariaLive).to.equal('polite');

        // hover out of the carousel
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

        // hover carousel
        carousel.dispatchEvent(new PointerEvent('pointerenter'));
        await elementUpdated(carousel);

        await clock.tickAsync(1);

        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(carousel.current).to.equal(0);

        // focus a focusable element
        carousel.dispatchEvent(new FocusEvent('focusin'));
        await elementUpdated(carousel);

        // hover out of the carousel
        carousel.dispatchEvent(new PointerEvent('pointerleave'));
        await elementUpdated(carousel);

        await clock.tickAsync(200);

        // an interactive element is focused
        // -> should not start rotation on pointerleave
        expect(carousel.isPlaying).to.be.false;
        expect(carousel.isPaused).to.be.true;
        expect(carousel.current).to.equal(0);

        // loose focus
        carousel.dispatchEvent(new FocusEvent('focusout'));
        await elementUpdated(carousel);

        await clock.tickAsync(200);

        // the interactive element loses focus
        // -> should start rotation
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
});
