import { ContextProvider } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import {
  property,
  queryAll,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';

import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import { carouselContext } from '../common/context.js';
import {
  addGesturesController,
  type SwipeEvent,
} from '../common/controllers/gestures.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  asNumber,
  createCounter,
  findElementFromEventPath,
  first,
  formatString,
  isLTR,
  last,
  wrap,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import type {
  CarouselIndicatorsOrientation,
  HorizontalTransitionAnimation,
} from '../types.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselIndicatorContainerComponent from './carousel-indicator-container.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import { styles } from './themes/carousel.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/carousel.common.css.js';

export interface IgcCarouselComponentEventMap {
  igcSlideChanged: CustomEvent<number>;
  igcPlaying: CustomEvent<void>;
  igcPaused: CustomEvent<void>;
}

/**
 * The `igc-carousel` presents a set of `igc-carousel-slide`s by sequentially displaying a subset of one or more slides.
 *
 * @element igc-carousel
 *
 * @slot Default slot for the carousel. Any projected `igc-carousel-slide` components should be projected here.
 * @slot previous-button - Renders content inside the previous button.
 * @slot next-button - Renders content inside the next button.
 *
 * @fires igcSlideChanged - Emitted when the current active slide is changed either by user interaction or by the interval callback.
 * @fires igcPlaying - Emitted when the carousel enters playing state by a user interaction.
 * @fires igcPaused - Emitted when the carousel enters paused state by a user interaction.
 *
 * @csspart navigation - The wrapper container of each carousel navigation button.
 * @csspart previous - The wrapper container of the carousel previous navigation button.
 * @csspart next - The wrapper container of the carousel next navigation button.
 * @csspart dot - The carousel dot indicator container.
 * @csspart active - The carousel active dot indicator container.
 * @csspart label - The label container of the carousel indicators.
 * @csspart start - The wrapping container of all carousel indicators when indicators-orientation is set to start.
 */
export default class IgcCarouselComponent extends EventEmitterMixin<
  IgcCarouselComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static styles = [styles, shared];
  public static readonly tagName = 'igc-carousel';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcCarouselComponent,
      IgcCarouselIndicatorComponent,
      IgcCarouselIndicatorContainerComponent,
      IgcCarouselSlideComponent,
      IgcIconComponent,
      IgcButtonComponent
    );
  }

  private static readonly increment = createCounter();
  private readonly _carouselId = `igc-carousel-${IgcCarouselComponent.increment()}`;

  private _paused = false;
  private _lastInterval!: ReturnType<typeof setInterval> | null;
  private _hasKeyboardInteractionOnIndicators = false;
  private _hasPointerInteraction = false;
  private _hasInnerFocus = false;

  private _context = new ContextProvider(this, {
    context: carouselContext,
    initialValue: this,
  });

  private readonly _carouselSlidesContainerRef = createRef<HTMLDivElement>();
  private readonly _indicatorsContainerRef = createRef<HTMLDivElement>();
  private readonly _prevButtonRef = createRef<IgcButtonComponent>();
  private readonly _nextButtonRef = createRef<IgcButtonComponent>();

  private get hasProjectedIndicators(): boolean {
    return this._projectedIndicators.length > 0;
  }

  private get showIndicatorsLabel(): boolean {
    return this.total > this.maximumIndicatorsCount;
  }

  private get nextIndex(): number {
    return wrap(0, this.total - 1, this.current + 1);
  }

  private get prevIndex(): number {
    return wrap(0, this.total - 1, this.current - 1);
  }

  @queryAll(IgcCarouselIndicatorComponent.tagName)
  private _defaultIndicators!: NodeListOf<IgcCarouselIndicatorComponent>;

  @queryAssignedElements({
    selector: IgcCarouselIndicatorComponent.tagName,
    slot: 'indicator',
  })
  private _projectedIndicators!: Array<IgcCarouselIndicatorComponent>;

  @state()
  private _activeSlide!: IgcCarouselSlideComponent;

  @state()
  private _playing = false;

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcCarouselSlideComponent>) {
    const activeSlides = this.slides.filter((slide) => slide.active);

    if (activeSlides.length <= 1) {
      return;
    }
    const idx = this.slides.indexOf(
      added.length ? last(added).node : last(attributes).node
    );

    for (const [i, slide] of this.slides.entries()) {
      if (slide.active && i !== idx) {
        slide.active = false;
      }
    }

    this.activateSlide(this.slides[idx]);
  }

  /**
   * Whether the carousel should skip rotating to the first slide after it reaches the last.
   * @attr disable-loop
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-loop' })
  public disableLoop = false;

  /**
   * Whether the carousel should ignore use interactions and not pause on them.
   * @attr disable-pause-on-interaction
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'disable-pause-on-interaction',
  })
  public disablePauseOnInteraction = false;

  /**
   * Whether the carousel should skip rendering of the default navigation buttons.
   * @attr hide-navigation
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-navigation' })
  public hideNavigation = false;

  /**
   * Whether the carousel should render the indicator controls (dots).
   * @attr hide-indicators
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-indicators' })
  public hideIndicators = false;

  /**
   * Whether the carousel has vertical alignment.
   * @attr vertical
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * Sets the orientation of the indicator controls (dots).
   * @attr indicators-orientation
   */
  @property({ reflect: false, attribute: 'indicators-orientation' })
  public indicatorsOrientation: CarouselIndicatorsOrientation = 'end';

  /**
   * The format used to set the aria-label on the carousel indicators.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   *
   * @attr indicators-label-format
   */
  @property({ attribute: 'indicators-label-format' })
  public indicatorsLabelFormat = 'Slide {0}';

  /**
   * The format used to set the aria-label on the carousel slides and the text displayed
   * when the number of indicators is greater than tha maximum indicator count.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   * Instances of '{1}' will be replaced with the total amount of slides.
   *
   * @attr slides-label-format
   */
  @property({ attribute: 'slides-label-format' })
  public slidesLabelFormat = '{0} of {1}';

  /**
   * The duration in milliseconds between changing the active slide.
   * @attr interval
   */
  @property({ type: Number, reflect: false })
  public interval: number | undefined;

  /**
   * Controls the maximum indicator controls (dots) that can be shown. Default value is `10`.
   * @attr maximum-indicators-count
   */
  @property({
    type: Number,
    reflect: false,
    attribute: 'maximum-indicators-count',
  })
  public maximumIndicatorsCount = 10;

  /**
   * The animation type.
   * @attr animation-type
   */
  @property({ attribute: 'animation-type' })
  public animationType: HorizontalTransitionAnimation = 'slide';

  /* blazorSuppress */
  /**
   * The slides of the carousel.
   */
  @queryAssignedElements({ selector: IgcCarouselSlideComponent.tagName })
  public slides!: Array<IgcCarouselSlideComponent>;

  /**
   * The total number of slides.
   */
  public get total(): number {
    return this.slides.length;
  }

  /**
   * The index of the current active slide.
   */
  public get current(): number {
    return Math.max(0, this.slides.indexOf(this._activeSlide));
  }

  /**
   * Whether the carousel is in playing state.
   */
  public get isPlaying(): boolean {
    return this._playing;
  }

  /**
   * Whether the carousel in in paused state.
   */
  public get isPaused(): boolean {
    return this._paused;
  }

  @watch('animationType')
  @watch('slidesLabelFormat')
  @watch('indicatorsLabelFormat')
  protected contextChanged() {
    this._context.setValue(this, true);
  }

  @watch('interval')
  protected intervalChange() {
    if (!this.isPlaying) {
      this._playing = true;
    }

    this.restartInterval();
  }

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'region',
        ariaRoleDescription: 'carousel',
      },
    });

    addThemingController(this, all);

    addSafeEventListener(this, 'pointerenter', this.handlePointerInteraction);
    addSafeEventListener(this, 'pointerleave', this.handlePointerInteraction);
    addSafeEventListener(this, 'pointerdown', () => {
      this._hasInnerFocus = false;
    });
    addSafeEventListener(this, 'focusin', this.handleFocusInteraction);
    addSafeEventListener(this, 'focusout', this.handleFocusInteraction);

    addGesturesController(this, {
      ref: this._carouselSlidesContainerRef,
      touchOnly: true,
    })
      .set('swipe-left', this.handleHorizontalSwipe)
      .set('swipe-right', this.handleHorizontalSwipe)
      .set('swipe-up', this.handleVerticalSwipe)
      .set('swipe-down', this.handleVerticalSwipe);

    addKeybindings(this, {
      ref: this._indicatorsContainerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, this.handleArrowLeft)
      .set(arrowRight, this.handleArrowRight)
      .set(homeKey, this.handleHomeKey)
      .set(endKey, this.handleEndKey);

    addKeybindings(this, {
      ref: this._prevButtonRef,
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleNavigationInteractionPrevious);

    addKeybindings(this, {
      ref: this._nextButtonRef,
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(this.handleNavigationInteractionNext);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcCarouselSlideComponent.tagName],
      config: {
        attributeFilter: ['active'],
        childList: true,
        subtree: true,
      },
    });
  }

  private handleSlotChange(): void {
    if (this.total) {
      this.activateSlide(
        this.slides.findLast((slide) => slide.active) ?? first(this.slides)
      );
    }
  }

  private handleIndicatorSlotChange(): void {
    this.requestUpdate();
  }

  private handlePointerInteraction(event: PointerEvent): void {
    this._hasPointerInteraction = event.type === 'pointerenter';

    if (!this._hasInnerFocus) {
      this.handlePauseOnInteraction();
    }
  }

  private handleFocusInteraction(event: FocusEvent): void {
    // focusin - element that lost focus
    // focusout - element that gained focus
    const node = event.relatedTarget as Node;

    if (this.contains(node)) {
      return;
    }

    this._hasInnerFocus = event.type === 'focusin';

    if (!this._hasPointerInteraction) {
      this.handlePauseOnInteraction();
    }
  }

  private handlePauseOnInteraction(): void {
    if (!this.interval || this.disablePauseOnInteraction) return;

    if (this.isPlaying) {
      this.pause();
      this.emitEvent('igcPaused');
    } else {
      this.play();
      this.emitEvent('igcPlaying');
    }
  }

  private async handleArrowLeft(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this.handleInteraction(isLTR(this) ? this.prev : this.next);
  }

  private async handleArrowRight(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this.handleInteraction(isLTR(this) ? this.next : this.prev);
  }

  private async handleHomeKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this.handleInteraction(() =>
      this.select(isLTR(this) ? first(this.slides) : last(this.slides))
    );
  }

  private async handleEndKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this.handleInteraction(() =>
      this.select(isLTR(this) ? last(this.slides) : first(this.slides))
    );
  }

  private handleVerticalSwipe({ data: { direction } }: SwipeEvent) {
    if (this.vertical) {
      this.handleInteraction(direction === 'up' ? this.next : this.prev);
    }
  }

  private handleHorizontalSwipe({ data: { direction } }: SwipeEvent) {
    if (!this.vertical) {
      this.handleInteraction(async () => {
        if (isLTR(this)) {
          direction === 'left' ? await this.next() : await this.prev();
        } else {
          direction === 'left' ? await this.prev() : await this.next();
        }
      });
    }
  }

  private async handleIndicatorClick(event: PointerEvent): Promise<void> {
    const indicator = findElementFromEventPath<IgcCarouselIndicatorComponent>(
      IgcCarouselIndicatorComponent.tagName,
      event
    )!;

    const index = this.hasProjectedIndicators
      ? this._projectedIndicators.indexOf(indicator)
      : Array.from(this._defaultIndicators).indexOf(indicator);

    this.handleInteraction(() =>
      this.select(this.slides[index], index > this.current ? 'next' : 'prev')
    );
  }

  private handleNavigationInteractionNext() {
    this.handleInteraction(this.next);
  }

  private handleNavigationInteractionPrevious() {
    this.handleInteraction(this.prev);
  }

  private async handleInteraction(
    callback: () => Promise<unknown>
  ): Promise<void> {
    if (this.interval) {
      this.resetInterval();
    }

    await callback.call(this);
    this.emitEvent('igcSlideChanged', { detail: this.current });

    if (this.interval) {
      this.restartInterval();
    }
  }

  private activateSlide(slide: IgcCarouselSlideComponent): void {
    if (this._activeSlide) {
      this._activeSlide.active = false;
    }

    this._activeSlide = slide;
    this._activeSlide.active = true;

    if (this._hasKeyboardInteractionOnIndicators) {
      this.hasProjectedIndicators
        ? this._projectedIndicators[this.current].focus()
        : this._defaultIndicators[this.current].focus();

      this._hasKeyboardInteractionOnIndicators = false;
    }
  }

  private updateProjectedIndicators(): void {
    for (const [idx, slide] of this.slides.entries()) {
      const indicator = this._projectedIndicators[idx];
      indicator.active = slide.active;
      indicator.index = idx;

      this.setAttribute('aria-controls', slide.id);
    }
  }

  private resetInterval(): void {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private restartInterval(): void {
    this.resetInterval();

    if (asNumber(this.interval) > 0) {
      this._lastInterval = setInterval(() => {
        if (this.isPlaying && this.total) {
          this.next();
          this.emitEvent('igcSlideChanged', { detail: this.current });
        } else {
          this.pause();
        }
      }, this.interval);
    }
  }

  private async animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent,
    dir: 'next' | 'prev'
  ): Promise<void> {
    if (dir === 'next') {
      // Animate slides in next direction
      currentSlide.previous = true;
      currentSlide.toggleAnimation('out');
      this.activateSlide(nextSlide);
      await nextSlide.toggleAnimation('in');
      currentSlide.previous = false;
    } else {
      // Animate slides in previous direction
      currentSlide.previous = true;
      currentSlide.toggleAnimation('in', 'reverse');
      this.activateSlide(nextSlide);
      await nextSlide.toggleAnimation('out', 'reverse');
      currentSlide.previous = false;
    }
  }

  /**
   * Resumes playing of the carousel slides.
   */
  public play(): void {
    if (!this.isPlaying) {
      this._paused = false;
      this._playing = true;
      this.restartInterval();
    }
  }

  /**
   * Pauses the carousel rotation of slides.
   */
  public pause(): void {
    if (this.isPlaying) {
      this._playing = false;
      this._paused = true;
      this.resetInterval();
    }
  }

  /**
   * Switches to the next slide, runs any animations, and returns if the operation was successful.
   */
  public async next(): Promise<boolean> {
    if (this.disableLoop && this.nextIndex === 0) {
      this.pause();
      return false;
    }

    return await this.select(this.slides[this.nextIndex], 'next');
  }

  /**
   * Switches to the previous slide, runs any animations, and returns if the operation was successful.
   */
  public async prev(): Promise<boolean> {
    if (this.disableLoop && this.prevIndex === this.total - 1) {
      this.pause();
      return false;
    }

    return await this.select(this.slides[this.prevIndex], 'prev');
  }

  /* blazorSuppress */
  /**
   * Switches to the passed-in slide, runs any animations, and returns if the operation was successful.
   */
  public async select(
    slide: IgcCarouselSlideComponent,
    animationDirection?: 'next' | 'prev'
  ): Promise<boolean>;
  /**
   * Switches to slide by index, runs any animations, and returns if the operation was successful.
   */
  public async select(
    index: number,
    animationDirection?: 'next' | 'prev'
  ): Promise<boolean>;
  public async select(
    slideOrIndex: IgcCarouselSlideComponent | number,
    animationDirection?: 'next' | 'prev'
  ): Promise<boolean> {
    let index: number;
    let slide: IgcCarouselSlideComponent | undefined;

    if (typeof slideOrIndex === 'number') {
      index = slideOrIndex;
      slide = this.slides.at(index);
    } else {
      slide = slideOrIndex;
      index = this.slides.indexOf(slide);
    }

    if (index === this.current || index === -1 || !slide) {
      return false;
    }

    const dir = animationDirection ?? (index > this.current ? 'next' : 'prev');

    await this.animateSlides(slide, this._activeSlide, dir);
    return true;
  }

  private navigationTemplate() {
    return html`
      <igc-button
        ${ref(this._prevButtonRef)}
        type="button"
        part="navigation previous"
        aria-label="Previous slide"
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === 0}
        @click=${this.handleNavigationInteractionPrevious}
      >
        <slot name="previous-button">
          <igc-icon
            name="carousel_prev"
            collection="default"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </igc-button>
      <igc-button
        ${ref(this._nextButtonRef)}
        type="button"
        part="navigation next"
        aria-label="Next slide"
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === this.total - 1}
        @click=${this.handleNavigationInteractionNext}
      >
        <slot name="next-button">
          <igc-icon
            name="carousel_next"
            collection="default"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </igc-button>
    `;
  }

  protected *renderIndicators() {
    for (const [i, slide] of this.slides.entries()) {
      const forward = slide.active ? 'visible' : 'hidden';
      const backward = slide.active ? 'hidden' : 'visible';

      yield html`
        <igc-carousel-indicator
          exportparts="indicator, active, inactive"
          .active=${slide.active}
          .index=${i}
        >
          <div
            part="dot"
            style=${styleMap({ visibility: backward, zIndex: 1 })}
          ></div>
          <div
            part="dot active"
            slot="active"
            style=${styleMap({ visibility: forward })}
          ></div>
        </igc-carousel-indicator>
      `;
    }
  }

  private indicatorTemplate() {
    const parts = {
      indicators: true,
      start: this.indicatorsOrientation === 'start',
    };

    return html`
      <igc-carousel-indicator-container>
        <div
          ${ref(this._indicatorsContainerRef)}
          role="tablist"
          part=${partMap(parts)}
        >
          <slot
            name="indicator"
            @slotchange=${this.handleIndicatorSlotChange}
            @click=${this.handleIndicatorClick}
          >
            ${this.hasProjectedIndicators
              ? this.updateProjectedIndicators()
              : this.renderIndicators()}
          </slot>
        </div>
      </igc-carousel-indicator-container>
    `;
  }

  private labelTemplate() {
    const parts = {
      label: true,
      indicators: true,
      start: this.indicatorsOrientation === 'start',
    };
    const value = formatString(
      this.slidesLabelFormat,
      this.current + 1,
      this.total
    );

    return html`
      <div part=${partMap(parts)}>
        <span>${value}</span>
      </div>
    `;
  }

  protected override render() {
    return html`
      <section>
        ${this.hideNavigation ? nothing : this.navigationTemplate()}
        ${this.hideIndicators || this.showIndicatorsLabel
          ? nothing
          : this.indicatorTemplate()}
        ${!this.hideIndicators && this.showIndicatorsLabel
          ? this.labelTemplate()
          : nothing}
        <div
          ${ref(this._carouselSlidesContainerRef)}
          id=${this._carouselId}
          aria-live=${this.interval && this._playing ? 'off' : 'polite'}
        >
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel': IgcCarouselComponent;
  }
}
