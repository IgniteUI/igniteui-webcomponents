import { ContextProvider } from '@lit/context';
import {
  CarouselResourceStringsEN,
  type ICarouselResourceStrings,
} from 'igniteui-i18n-core';
import { html, LitElement, nothing } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
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
import {
  addSlotController,
  type InferSlotNames,
  type SlotChangeCallbackParameters,
  setSlots,
} from '../common/controllers/slot.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { addI18nController } from '../common/i18n/i18n-controller.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  asNumber,
  findElementFromEventPath,
  first,
  formatString,
  isEmpty,
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

let nextId = 1;
const Slots = setSlots('indicator', 'previous-button', 'next-button');

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

  //#region Internal state

  private readonly _carouselId = `igc-carousel-${nextId++}`;
  private _paused = false;
  private _lastInterval!: ReturnType<typeof setInterval> | null;
  private _hasKeyboardInteractionOnIndicators = false;
  private _hasPointerInteraction = false;
  private _hasInnerFocus = false;

  private _slides: IgcCarouselSlideComponent[] = [];
  private _projectedIndicators: IgcCarouselIndicatorComponent[] = [];

  @state()
  private _activeSlide!: IgcCarouselSlideComponent;

  @state()
  private _playing = false;

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    onChange: this._handleSlotChange,
    initial: true,
  });

  private readonly _i18nController =
    addI18nController<ICarouselResourceStrings>(this, {
      defaultEN: CarouselResourceStringsEN,
    });

  private readonly _context = new ContextProvider(this, {
    context: carouselContext,
    initialValue: this,
  });

  @queryAll(IgcCarouselIndicatorComponent.tagName)
  private readonly _defaultIndicators!: NodeListOf<IgcCarouselIndicatorComponent>;

  private readonly _carouselSlidesContainerRef = createRef<HTMLDivElement>();
  private readonly _indicatorsContainerRef = createRef<HTMLDivElement>();
  private readonly _prevButtonRef = createRef<IgcButtonComponent>();
  private readonly _nextButtonRef = createRef<IgcButtonComponent>();

  private get _hasProjectedIndicators(): boolean {
    return !isEmpty(this._projectedIndicators);
  }

  private get _showIndicatorsLabel(): boolean {
    return this.total > this.maximumIndicatorsCount;
  }

  private get _nextIndex(): number {
    return wrap(0, this.total - 1, this.current + 1);
  }

  private get _previousIndex(): number {
    return wrap(0, this.total - 1, this.current - 1);
  }

  //#endregion

  //#region Public attributes and properties

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
  @property({ attribute: 'indicators-orientation' })
  public indicatorsOrientation: CarouselIndicatorsOrientation = 'end';

  /**
   * The format used to set the aria-label on the carousel indicators.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   *
   * @attr indicators-label-format
   */
  @property({ attribute: 'indicators-label-format' })
  public set indicatorsLabelFormat(value: string) {
    this._indicatorsLabelFormat = value;
  }

  public get() {
    return (
      this._indicatorsLabelFormat ??
      `${this.resourceStrings.carousel_slide} {0}`
    );
  }
  private _indicatorsLabelFormat: string | undefined;

  /**
   * The format used to set the aria-label on the carousel slides and the text displayed
   * when the number of indicators is greater than tha maximum indicator count.
   * Instances of '{0}' will be replaced with the index of the corresponding slide.
   * Instances of '{1}' will be replaced with the total amount of slides.
   *
   * @attr slides-label-format
   */
  @property({ attribute: 'slides-label-format' })
  public set slidesLabelFormat(value: string) {
    this._slidesLabelFormat = value;
  }

  public get slidesLabelFormat() {
    return (
      this._slidesLabelFormat ?? `{0} ${this.resourceStrings.carousel_of} {1}`
    );
  }

  private _slidesLabelFormat: string | undefined;

  /**
   * The duration in milliseconds between changing the active slide.
   * @attr interval
   */
  @property({ type: Number })
  public interval: number | undefined;

  /**
   * Controls the maximum indicator controls (dots) that can be shown. Default value is `10`.
   * @attr maximum-indicators-count
   */
  @property({ type: Number, attribute: 'maximum-indicators-count' })
  public maximumIndicatorsCount = 10;

  /**
   * The animation type.
   * @attr animation-type
   */
  @property({ attribute: 'animation-type' })
  public animationType: HorizontalTransitionAnimation = 'slide';

  /**
   * Gets/Sets the locale used for formatting and displaying the dates in the component.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale() {
    return this._i18nController.locale;
  }

  /**
   * The resource strings for localization.
   */
  @property({ attribute: false })
  public set resourceStrings(value: ICarouselResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): ICarouselResourceStrings {
    return this._i18nController.resourceStrings;
  }

  /* blazorSuppress */
  /**
   * The slides of the carousel.
   */
  public get slides(): IgcCarouselSlideComponent[] {
    return Array.from(this._slides);
  }

  /**
   * The total number of slides.
   */
  public get total(): number {
    return this._slides.length;
  }

  /**
   * The index of the current active slide.
   */
  public get current(): number {
    return Math.max(0, this._slides.indexOf(this._activeSlide));
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

  //#endregion

  //#region Watchers

  @watch('animationType')
  @watch('slidesLabelFormat')
  @watch('indicatorsLabelFormat')
  protected _contextChanged(): void {
    this._context.setValue(this, true);
  }

  @watch('interval')
  protected _intervalChange(): void {
    if (!this.isPlaying) {
      this._playing = true;
    }

    this._restartInterval();
  }

  //#endregion

  //#region Life-cycle hooks and observer callback

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'region',
        ariaRoleDescription: 'carousel',
      },
    });

    addThemingController(this, all);

    addSafeEventListener(this, 'pointerenter', this._handlePointerInteraction);
    addSafeEventListener(this, 'pointerleave', this._handlePointerInteraction);
    addSafeEventListener(this, 'focusin', this._handleFocusInteraction);
    addSafeEventListener(this, 'focusout', this._handleFocusInteraction);

    addGesturesController(this, {
      ref: this._carouselSlidesContainerRef,
      touchOnly: true,
    })
      .set('swipe-left', this._handleHorizontalSwipe)
      .set('swipe-right', this._handleHorizontalSwipe)
      .set('swipe-up', this._handleVerticalSwipe)
      .set('swipe-down', this._handleVerticalSwipe);

    addKeybindings(this, {
      ref: this._indicatorsContainerRef,
    })
      .set(arrowLeft, this._handleArrowLeft)
      .set(arrowRight, this._handleArrowRight)
      .set(homeKey, this._handleHomeKey)
      .set(endKey, this._handleEndKey);

    addKeybindings(this, {
      ref: this._prevButtonRef,
    }).setActivateHandler(this._handleNavigationInteractionPrevious);

    addKeybindings(this, {
      ref: this._nextButtonRef,
    }).setActivateHandler(this._handleNavigationInteractionNext);

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

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;

    if (!isEmpty(this._slides)) {
      this._activateSlide(
        this._slides.findLast((slide) => slide.active) ?? first(this._slides)
      );
    }
  }

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcCarouselSlideComponent>) {
    const activeSlides = this._slides.filter((slide) => slide.active);

    if (activeSlides.length <= 1) {
      return;
    }

    const idx = this._slides.indexOf(
      added.length ? last(added).node : last(attributes).node
    );

    for (const [i, slide] of this._slides.entries()) {
      if (slide.active && i !== idx) {
        slide.active = false;
      }
    }

    this._activateSlide(this._slides[idx]);
  }

  //#endregion

  //#region Event listeners

  private _handleSlotChange(
    params: SlotChangeCallbackParameters<InferSlotNames<typeof Slots>>
  ): void {
    if (params.isDefault || params.isInitial) {
      this._slides = this._slots.getAssignedElements('[default]', {
        selector: IgcCarouselSlideComponent.tagName,
      });
    }

    if (params.slot === 'indicator') {
      this._projectedIndicators = this._slots.getAssignedElements('indicator', {
        selector: IgcCarouselIndicatorComponent.tagName,
      });
    }
  }

  private _handlePointerInteraction(event: PointerEvent): void {
    this._hasPointerInteraction = event.type === 'pointerenter';

    if (!this._hasInnerFocus) {
      this._handlePauseOnInteraction();
    }
  }

  private _handleFocusInteraction(event: FocusEvent): void {
    // focusin - element that lost focus
    // focusout - element that gained focus
    const node = event.relatedTarget as Node;

    if (this.contains(node)) {
      return;
    }

    this._hasInnerFocus = event.type === 'focusin';

    if (!this._hasPointerInteraction) {
      this._handlePauseOnInteraction();
    }
  }

  private async _handleIndicatorClick(event: PointerEvent): Promise<void> {
    const indicator = findElementFromEventPath<IgcCarouselIndicatorComponent>(
      IgcCarouselIndicatorComponent.tagName,
      event
    )!;

    const index = this._hasProjectedIndicators
      ? this._projectedIndicators.indexOf(indicator)
      : Array.from(this._defaultIndicators).indexOf(indicator);

    this._handleInteraction(() =>
      this.select(this._slides[index], index > this.current ? 'next' : 'prev')
    );
  }

  //#endregion

  //#region Keyboard event listeners

  private async _handleArrowLeft(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(isLTR(this) ? this.prev : this.next);
  }

  private async _handleArrowRight(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(isLTR(this) ? this.next : this.prev);
  }

  private async _handleHomeKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(() =>
      this.select(isLTR(this) ? first(this._slides) : last(this._slides))
    );
  }

  private async _handleEndKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(() =>
      this.select(isLTR(this) ? last(this._slides) : first(this._slides))
    );
  }

  //#endregion

  //#region Gestures event listeners

  private _handleVerticalSwipe({ data: { direction } }: SwipeEvent): void {
    if (this.vertical) {
      this._handleInteraction(direction === 'up' ? this.next : this.prev);
    }
  }

  private _handleHorizontalSwipe({ data: { direction } }: SwipeEvent): void {
    if (!this.vertical) {
      const callback = () => {
        if (isLTR(this)) {
          return direction === 'left' ? this.next : this.prev;
        }
        return direction === 'left' ? this.prev : this.next;
      };

      this._handleInteraction(callback());
    }
  }

  //#endregion

  //#region Internal API

  private _handleNavigationInteractionNext(): void {
    this._handleInteraction(this.next);
  }

  private _handleNavigationInteractionPrevious(): void {
    this._handleInteraction(this.prev);
  }

  private async _handleInteraction(
    callback: () => Promise<boolean>
  ): Promise<void> {
    if (this.interval) {
      this._resetInterval();
    }

    if (await callback.call(this)) {
      this.emitEvent('igcSlideChanged', { detail: this.current });
    }

    if (this.interval) {
      this._restartInterval();
    }
  }

  private _handlePauseOnInteraction(): void {
    if (!this.interval || this.disablePauseOnInteraction) return;

    if (this.isPlaying) {
      this.pause();
      this.emitEvent('igcPaused');
    } else {
      this.play();
      this.emitEvent('igcPlaying');
    }
  }

  private _activateSlide(slide: IgcCarouselSlideComponent): void {
    if (this._activeSlide) {
      this._activeSlide.active = false;
    }

    this._activeSlide = slide;
    this._activeSlide.active = true;

    if (this._hasKeyboardInteractionOnIndicators) {
      this._hasProjectedIndicators
        ? this._projectedIndicators[this.current].focus()
        : this._defaultIndicators[this.current].focus();

      this._hasKeyboardInteractionOnIndicators = false;
    }
  }

  private _updateProjectedIndicators(): void {
    for (const [idx, slide] of this._slides.entries()) {
      const indicator = this._projectedIndicators[idx];
      indicator.active = slide.active;
      indicator.index = idx;
    }

    if (this._activeSlide) {
      this.setAttribute('aria-controls', this._activeSlide.id);
    }
  }

  private _resetInterval(): void {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private _restartInterval(): void {
    this._resetInterval();

    if (asNumber(this.interval) > 0) {
      this._lastInterval = setInterval(() => {
        if (
          this.isPlaying &&
          this.total &&
          !(this.disableLoop && this._nextIndex === 0)
        ) {
          this.select(this.slides[this._nextIndex], 'next');
          this.emitEvent('igcSlideChanged', { detail: this.current });
        } else {
          this.pause();
        }
      }, this.interval);
    }
  }

  private async _animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent,
    dir: 'next' | 'prev'
  ): Promise<void> {
    if (dir === 'next') {
      // Animate slides in next direction
      currentSlide.previous = true;
      currentSlide.toggleAnimation('out');
      this._activateSlide(nextSlide);
      await nextSlide.toggleAnimation('in');
      currentSlide.previous = false;
    } else {
      // Animate slides in previous direction
      currentSlide.previous = true;
      currentSlide.toggleAnimation('in', 'reverse');
      this._activateSlide(nextSlide);
      await nextSlide.toggleAnimation('out', 'reverse');
      currentSlide.previous = false;
    }
  }

  //#endregion

  //#region Public API

  /**
   * Resumes playing of the carousel slides.
   */
  public play(): void {
    if (!this.isPlaying) {
      this._paused = false;
      this._playing = true;
      this._restartInterval();
    }
  }

  /**
   * Pauses the carousel rotation of slides.
   */
  public pause(): void {
    if (this.isPlaying) {
      this._playing = false;
      this._paused = true;
      this._resetInterval();
    }
  }

  /**
   * Switches to the next slide, runs any animations, and returns if the operation was successful.
   */
  public async next(): Promise<boolean> {
    if (this.disableLoop && this._nextIndex === 0) {
      this.pause();
      return false;
    }

    return await this.select(this._slides[this._nextIndex], 'next');
  }

  /**
   * Switches to the previous slide, runs any animations, and returns if the operation was successful.
   */
  public async prev(): Promise<boolean> {
    if (this.disableLoop && this._previousIndex === this.total - 1) {
      this.pause();
      return false;
    }

    return await this.select(this._slides[this._previousIndex], 'prev');
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
      slide = this._slides.at(index);
    } else {
      slide = slideOrIndex;
      index = this._slides.indexOf(slide);
    }

    if (index === this.current || index === -1 || !slide) {
      return false;
    }

    const dir = animationDirection ?? (index > this.current ? 'next' : 'prev');

    await this._animateSlides(slide, this._activeSlide, dir);
    return true;
  }

  //#endregion

  //#region Template renderers

  private _renderNavigation() {
    return html`
      <igc-button
        ${ref(this._prevButtonRef)}
        type="button"
        part="navigation previous"
        aria-label=${this.resourceStrings.carousel_previous_slide ??
        'previous slide'}
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === 0}
        @click=${this._handleNavigationInteractionPrevious}
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
        aria-label=${this.resourceStrings.carousel_next_slide ?? 'next slide'}
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === this.total - 1}
        @click=${this._handleNavigationInteractionNext}
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

  protected *_renderIndicators() {
    for (const [i, slide] of this._slides.entries()) {
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

  private _renderIndicatorContainer() {
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
          <slot name="indicator" @click=${this._handleIndicatorClick}>
            ${cache(
              this._hasProjectedIndicators
                ? this._updateProjectedIndicators()
                : this._renderIndicators()
            )}
          </slot>
        </div>
      </igc-carousel-indicator-container>
    `;
  }

  private _renderLabel() {
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
    const hasNoIndicators = this.hideIndicators || this._showIndicatorsLabel;
    const hasLabel = !this.hideIndicators && this._showIndicatorsLabel;

    return html`
      <section>
        ${cache(this.hideNavigation ? nothing : this._renderNavigation())}
        ${hasNoIndicators ? nothing : this._renderIndicatorContainer()}
        ${hasLabel ? this._renderLabel() : nothing}
        <div
          ${ref(this._carouselSlidesContainerRef)}
          id=${this._carouselId}
          aria-live=${this.interval && this._playing ? 'off' : 'polite'}
        >
          <slot></slot>
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
