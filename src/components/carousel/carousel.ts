import {
  CarouselResourceStringsEN,
  type ICarouselResourceStrings,
} from 'igniteui-i18n-core';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, queryAll, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { carouselContext } from '#internals/context.js';
import { addContextProvider } from '#internals/controllers/context-provider.js';
import {
  addGesturesController,
  type SwipeEvent,
} from '#internals/controllers/gestures.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  endKey,
  homeKey,
} from '#internals/controllers/key-bindings.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import {
  addSlotController,
  type InferSlotNames,
  type SlotChangeCallbackParameters,
  setSlots,
} from '#internals/controllers/slot.js';
import { shadowOptions } from '#internals/decorators/shadow-options.js';
import { registerComponent } from '#internals/definitions/register.js';
import type { I18nControllerConfig } from '#internals/i18n/i18n-controller.js';
import type { Constructor } from '#internals/mixins/constructor.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { partMap } from '#internals/part-map.js';
import { renderSlottedIcon } from '#internals/templates/slotted-icon.js';
import { firstOf, isEmpty, lastOf } from '#internals/utils/arrays.js';
import { isLTR } from '#internals/utils/dom.js';
import {
  addSafeEventListener,
  getElementFromPath,
} from '#internals/utils/events.js';
import { asNumber, wrap } from '#internals/utils/math.js';
import { createIdGenerator, formatString } from '#internals/utils/strings.js';
import { addThemingController } from '#theming/theming-controller.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconComponent from '../icon/icon.js';
import type {
  CarouselIndicatorsOrientation,
  HorizontalTransitionAnimation,
} from '../types.js';
import IgcCarouselIndicatorContainerComponent from './carousel-indicator-container.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import { styles } from './themes/carousel.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/carousel.common.css.js';

export interface IgcCarouselComponentEventMap {
  igcSlideChanged: CustomEvent<number>;
  igcPlaying: CustomEvent<void>;
  igcPaused: CustomEvent<void>;
}

const nextId = createIdGenerator('igc-carousel');
const Slots = setSlots('indicator', 'previous-button', 'next-button');

const i18n: I18nControllerConfig<ICarouselResourceStrings> = {
  defaultEN: CarouselResourceStringsEN,
};

/**
 * The carousel presents a set of slides by sequentially displaying a subset of one or more.
 *
 * @element igc-carousel
 *
 * @slot Default slot for the carousel. Any carousel slides should be projected here.
 * @slot indicator - Renders the custom indicators of the carousel. An `igc-carousel-indicator` sets this slot itself.
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
@shadowOptions({ delegatesFocus: true })
export default class IgcCarouselComponent extends I18nMixin(
  EventEmitterMixin<IgcCarouselComponentEventMap, Constructor<LitElement>>(
    LitElement
  ),
  i18n
) {
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

  private readonly _carouselId = nextId();
  private _paused = false;
  private _lastInterval: ReturnType<typeof setInterval> | null = null;
  private _hasKeyboardInteractionOnIndicators = false;
  private _hasPointerInteraction = false;
  private _hasInnerFocus = false;

  /**
   * Whether an interaction - a pointer over the carousel, or focus inside it -
   * caused the current paused state. An explicit `pause()` call does not set it.
   */
  private _pausedByInteraction = false;

  private _slides: IgcCarouselSlideComponent[] = [];
  private _projectedIndicators: IgcCarouselIndicatorComponent[] = [];

  @state()
  private _activeSlide?: IgcCarouselSlideComponent;

  @state()
  private _playing = false;

  private readonly _slots = addSlotController(this, {
    slots: Slots,
    onChange: this._handleSlotChange,
    initial: true,
  });

  private readonly _context = addContextProvider(this, {
    context: carouselContext,
    watch: ['animationType', 'slidesLabelFormat', 'indicatorsLabelFormat'],
    value: () => this,
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

  /** The indicators that the carousel shows. */
  private get _indicators(): IgcCarouselIndicatorComponent[] {
    return this._hasProjectedIndicators
      ? this._projectedIndicators
      : Array.from(this._defaultIndicators);
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
   *
   * @attr disable-loop
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'disable-loop' })
  public disableLoop = false;

  /**
   * Whether the carousel should ignore use interactions and not pause on them.
   *
   * @attr disable-pause-on-interaction
   * @default false
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'disable-pause-on-interaction',
  })
  public disablePauseOnInteraction = false;

  /**
   * Whether the carousel should skip rendering of the default navigation buttons.
   *
   * @attr hide-navigation
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-navigation' })
  public hideNavigation = false;

  /**
   * Whether the carousel should render the indicator controls (dots).
   *
   * @attr hide-indicators
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'hide-indicators' })
  public hideIndicators = false;

  /**
   * Whether the carousel has vertical alignment.
   *
   * @attr vertical
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * The orientation of the indicator controls (dots).
   *
   * @attr indicators-orientation
   * @default end
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

  public get indicatorsLabelFormat() {
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
   * The maximum number of indicator controls (dots) that can be shown. Default value is `10`.
   *
   * @attr maximum-indicators-count
   * @default 10
   */
  @property({ type: Number, attribute: 'maximum-indicators-count' })
  public maximumIndicatorsCount = 10;

  /**
   * The animation type.
   *
   * @attr animation-type
   * @default 'slide'
   */
  @property({ attribute: 'animation-type' })
  public animationType: HorizontalTransitionAnimation = 'slide';

  /* blazorSuppress */
  /** The slides of the carousel. */
  public get slides(): IgcCarouselSlideComponent[] {
    return Array.from(this._slides);
  }

  /** Total number of slides. */
  public get total(): number {
    return this._slides.length;
  }

  /** The index of the current active slide. */
  public get current(): number {
    return this._activeSlide
      ? Math.max(0, this._slides.indexOf(this._activeSlide))
      : 0;
  }

  /** Whether the carousel is in playing state. */
  public get isPlaying(): boolean {
    return this._playing;
  }

  /** Whether the carousel is in paused state. */
  public get isPaused(): boolean {
    return this._paused;
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

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('interval')) {
      this._setRotation(asNumber(this.interval) > 0);
    }
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();

    if (this.hasUpdated) {
      this._restartInterval();
    }
  }

  /** @internal */
  public override disconnectedCallback(): void {
    this._resetInterval();
    super.disconnectedCallback();
  }

  protected override async firstUpdated(): Promise<void> {
    await this.updateComplete;
    // Republish for consumers created after their own first render (Blazor timing).
    this._context.publish();

    if (!isEmpty(this._slides)) {
      this._activateSlide(
        this._slides.findLast((slide) => slide.active) ?? firstOf(this._slides)
      );
    }
  }

  protected override updated(): void {
    if (this._hasProjectedIndicators) {
      this._updateProjectedIndicators();
    }
  }

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcCarouselSlideComponent>) {
    const activeSlides = this._slides.filter((slide) => slide.active);

    if (activeSlides.length <= 1) {
      return;
    }

    const node = isEmpty(added)
      ? (lastOf(attributes)?.node ?? lastOf(activeSlides))
      : lastOf(added).node;

    const idx = this._slides.indexOf(node);

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
      const previousSlide = this._activeSlide;
      const previousIndex = this.current;

      this._slides = this._slots.getAssignedElements('[default]', {
        selector: IgcCarouselSlideComponent.tagName,
      });

      if (previousSlide && !this._slides.includes(previousSlide)) {
        this._reactivateSlide(previousSlide, previousIndex);
      }
    }

    if (params.slot === 'indicator') {
      this._projectedIndicators = this._slots.getAssignedElements('indicator', {
        selector: IgcCarouselIndicatorComponent.tagName,
      });
    }
  }

  private _handlePointerInteraction(event: PointerEvent): void {
    this._hasPointerInteraction = event.type === 'pointerenter';
    this._handlePauseOnInteraction();
  }

  private _handleFocusInteraction(event: FocusEvent): void {
    // focusin - element that lost focus
    // focusout - element that gained focus
    const node = event.relatedTarget as Node;

    if (this.contains(node)) {
      return;
    }

    this._hasInnerFocus = event.type === 'focusin';
    this._handlePauseOnInteraction();
  }

  private _handleIndicatorClick(event: PointerEvent): void {
    const indicator = getElementFromPath(
      IgcCarouselIndicatorComponent.tagName,
      event
    )!;

    const index = this._indicators.indexOf(indicator);

    this._handleInteraction(() =>
      this.select(this._slides[index], index > this.current ? 'next' : 'prev')
    );
  }

  //#endregion

  //#region Keyboard event listeners

  private _handleArrowLeft(): void {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(isLTR(this) ? this.prev : this.next);
  }

  private _handleArrowRight(): void {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(isLTR(this) ? this.next : this.prev);
  }

  private _handleHomeKey(): void {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(() =>
      this.select(isLTR(this) ? firstOf(this._slides) : lastOf(this._slides))
    );
  }

  private _handleEndKey(): void {
    this._hasKeyboardInteractionOnIndicators = true;
    this._handleInteraction(() =>
      this.select(isLTR(this) ? lastOf(this._slides) : firstOf(this._slides))
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

    this._hasKeyboardInteractionOnIndicators = false;

    if (this.interval) {
      this._restartInterval();
    }
  }

  private _handlePauseOnInteraction(): void {
    if (!this.interval || this.disablePauseOnInteraction) return;

    const interacting = this._hasPointerInteraction || this._hasInnerFocus;

    if (interacting) {
      if (!this.isPlaying) return;

      this.pause();
      this._pausedByInteraction = true;
      this.emitEvent('igcPaused');
      return;
    }

    if (this._pausedByInteraction) {
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
      this._indicators[this.current]?.focus();
      this._hasKeyboardInteractionOnIndicators = false;
    }
  }

  /**
   * Moves the active state from a slide that left the carousel to the slide
   * that takes its position.
   */
  private _reactivateSlide(
    removed: IgcCarouselSlideComponent,
    index: number
  ): void {
    removed.active = false;
    this._activeSlide = undefined;

    if (!isEmpty(this._slides)) {
      this._activateSlide(this._slides[Math.min(index, this.total - 1)]);
    }
  }

  private _updateProjectedIndicators(): void {
    const current = this.current;

    for (const [idx, indicator] of this._projectedIndicators.entries()) {
      const slide = this._slides.at(idx);

      indicator.active = idx === current;
      indicator.index = idx;

      if (slide) {
        indicator.setAttribute('aria-controls', slide.id);
      } else {
        indicator.removeAttribute('aria-controls');
      }
    }
  }

  /**
   * Sets the rotation state of the carousel, and starts or clears its timer.
   */
  private _setRotation(playing: boolean, paused = false): void {
    this._playing = playing;
    this._paused = paused;
    this._pausedByInteraction = false;
    this._restartInterval();
  }

  private _resetInterval(): void {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private _restartInterval(): void {
    this._resetInterval();

    if (!this.isPlaying || asNumber(this.interval) <= 0) {
      return;
    }

    this._lastInterval = setInterval(() => {
      if (
        this.isPlaying &&
        this.total &&
        !(this.disableLoop && this._nextIndex === 0)
      ) {
        this.select(this._slides[this._nextIndex], 'next');
        this.emitEvent('igcSlideChanged', { detail: this.current });
      } else {
        this.pause();
      }
    }, this.interval);
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
      this._setRotation(true);
    }
  }

  /**
   * Pauses the rotation of the carousel slides.
   */
  public pause(): void {
    if (this.isPlaying) {
      this._setRotation(false, true);
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

    if (!this._activeSlide) {
      this._activateSlide(slide);
      return true;
    }

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
        aria-label=${this.resourceStrings.carousel_previous_slide}
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === 0}
        @click=${this._handleNavigationInteractionPrevious}
      >
        ${renderSlottedIcon({ slot: 'previous-button', icon: 'carousel_prev' })}
      </igc-button>

      <igc-button
        ${ref(this._nextButtonRef)}
        type="button"
        part="navigation next"
        aria-label=${this.resourceStrings.carousel_next_slide}
        aria-controls=${this._carouselId}
        ?disabled=${this.disableLoop && this.current === this.total - 1}
        @click=${this._handleNavigationInteractionNext}
      >
        ${renderSlottedIcon({ slot: 'next-button', icon: 'carousel_next' })}
      </igc-button>
    `;
  }

  private _renderIndicators() {
    return this._slides.map((slide, i) => {
      const forward = slide.active ? 'visible' : 'hidden';
      const backward = slide.active ? 'hidden' : 'visible';

      return html`
        <igc-carousel-indicator
          exportparts="indicator, active, inactive"
          .active=${slide.active}
          .index=${i}
        >
          <div part="dot" style=${styleMap({ visibility: backward })}></div>
          <div
            part="dot active"
            slot="active"
            style=${styleMap({ visibility: forward })}
          ></div>
        </igc-carousel-indicator>
      `;
    });
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
              this._hasProjectedIndicators ? nothing : this._renderIndicators()
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
        ${hasNoIndicators ? nothing : this._renderIndicatorContainer()}
        ${cache(this.hideNavigation ? nothing : this._renderNavigation())}
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
