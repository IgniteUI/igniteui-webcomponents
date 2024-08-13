import { ContextProvider } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import {
  property,
  queryAll,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';

import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcButtonComponent from '../button/button.js';
import { addKeyboardFocusRing } from '../common/controllers/focus-ring.js';
import {
  addKeybindings,
  arrowLeft,
  arrowRight,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import {
  type MutationControllerParams,
  createMutationController,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  asNumber,
  createCounter,
  findElementFromEventPath,
  isLTR,
  partNameMap,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcCarouselIndicatorContainerComponent from './carousel-indicator-container.js';
import IgcCarouselIndicatorComponent from './carousel-indicator.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import { carouselContext } from './context.js';
import { styles } from './themes/carousel.base.css.js';
import { all } from './themes/container.js';
import { styles as shared } from './themes/shared/carousel.common.css.js';

export interface IgcCarouselComponentEventMap {
  igcSlideChanged: CustomEvent<void>;
  igcPlaying: CustomEvent<void>;
  igcPaused: CustomEvent<void>;
}

/**
 * The `igc-carousel` presents a set of `igc-carousel-slide`s by sequentially displaying a subset of one or more slides.
 *
 * @element igc-carousel
 *
 * @slot Default slot for the carousel. Any projected `igc-carousel-slide` components should be projected here.
 *
 * @fires igcSlideChanged - Emitted when the current active slide is changed either by user interaction or by the interval callback.
 * @fires igcPlaying - Emitted when the carousel enters playing state by a user interaction.
 * @fires igcPaused - Emitted when the carousel enters paused state by a user interaction.
 *
 * @csspart
 */

@themes(all)
export default class IgcCarouselComponent extends EventEmitterMixin<
  IgcCarouselComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static styles = [styles, shared];
  public static readonly tagName = 'igc-carousel';

  /* blazorSuppress */
  public static register() {
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
  private _carouselId = `igc-carousel-${IgcCarouselComponent.increment()}`;
  private _carouselKeyboardInteractionFocus = addKeyboardFocusRing(this);

  private _internals: ElementInternals;
  private _lastInterval: any;
  private _hasKeyboardInteractionOnIndicators = false;
  private _hasMouseStop = false;

  private _context = new ContextProvider(this, {
    context: carouselContext,
    initialValue: this,
  });

  private _indicatorsContainerRef: Ref<HTMLDivElement> = createRef();
  private _prevButtonRef: Ref<IgcButtonComponent> = createRef();
  private _nextButtonRef: Ref<IgcButtonComponent> = createRef();

  private get hasProjectedIndicators(): boolean {
    return this._projectedIndicators.length > 0;
  }

  private get showIndicatorsLabel(): boolean {
    return this.total > this.maximumIndicatorsCount;
  }

  private get nextIndex(): number {
    return (this.current + 1) % this.total;
  }

  private get prevIndex(): number {
    return this.current - 1 < 0 ? this.total - 1 : this.current - 1;
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

  @state()
  private _paused = false;

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcCarouselSlideComponent>) {
    const activeSlides = this.slides.filter((slide) => slide.active);

    if (activeSlides.length <= 1) {
      return;
    }
    const idx = this.slides.indexOf(
      added.length ? added.at(-1)! : attributes.at(-1)!
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
   * @attr skip-loop
   */
  @property({ type: Boolean, reflect: true, attribute: 'skip-loop' })
  public skipLoop = false;

  /**
   * Whether the carousel should ignore use interactions and not pause on them.
   * @attr skip-pause-on-interaction
   */
  @property({
    type: Boolean,
    reflect: true,
    attribute: 'skip-pause-on-interaction',
  })
  public skipPauseOnInteraction = false;

  /**
   * Whether the carousel should skip rendering of the default navigation buttons.
   * @attr skip-navigation
   */
  @property({ type: Boolean, reflect: true, attribute: 'skip-navigation' })
  public skipNavigation = false;

  /**
   * Whether the carousel should render the indicator controls (dots).
   * @attr skip-indicator
   */
  @property({ type: Boolean, reflect: true, attribute: 'skip-indicator' })
  public skipIndicator = false;

  /**
   * The carousel alignment.
   * @attr vertical
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * Sets the orientation of the indicator controls (dots).
   * @attr indicators-orientation
   */
  @property({ reflect: false, attribute: 'indicators-orientation' })
  public indicatorsOrientation: 'start' | 'end' = 'end';

  /**
   * The duration in milliseconds between changing the active slide.
   * @attr interval
   */
  @property({ type: Number, reflect: false })
  public interval!: number;

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
  public animationType: 'slide' | 'fade' | 'none' = 'slide';

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
    const index = this.slides.indexOf(this._activeSlide);
    return index === -1 ? 0 : index;
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

  @watch('animationType', { waitUntilFirstUpdate: true })
  protected animationTypeChange() {
    this._context.setValue(this, true);
  }

  @watch('interval', { waitUntilFirstUpdate: true })
  protected intervalChange() {
    if (!this.isPlaying) {
      this._playing = true;
    }

    this.restartInterval();
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'region';
    this._internals.ariaRoleDescription = 'carousel';

    this.addEventListener('pointerdown', this.handlePointerDown);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);

    addKeybindings(this, {
      ref: this._indicatorsContainerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, async () => await this.handleArrowLeft())
      .set(arrowRight, async () => await this.handleArrowRight())
      .set(homeKey, async () => await this.handleHomeKey())
      .set(endKey, async () => await this.handleEndKey());

    addKeybindings(this, {
      ref: this._prevButtonRef,
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(
      async () => await this.handleNavigationKeydown('prev')
    );

    addKeybindings(this, {
      ref: this._nextButtonRef,
      bindingDefaults: { preventDefault: true },
    }).setActivateHandler(
      async () => await this.handleNavigationKeydown('next')
    );

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

  protected override firstUpdated() {
    const index = this.slides.findIndex((slide) => slide.active);

    if (this.total) {
      index === -1
        ? this.activateSlide(this.slides[0], true)
        : this.activateSlide(this.slides[index], true);
    }
  }

  private handleSlotChange(): void {
    this.requestUpdate();
  }

  private handleIndicatorSlotChange(): void {
    if (this.hasProjectedIndicators) {
      this.slides.forEach((slide, i) => {
        const indicator = this._projectedIndicators[i];
        if (indicator) {
          this.setIndicatorAttributes(indicator, slide, i);
          this.setIndicatorVisibility(indicator, slide.active);
        }
      });
    }
  }

  private handlePointerDown(): void {
    if (this._carouselKeyboardInteractionFocus.focused) {
      this._carouselKeyboardInteractionFocus.reset();
    }
  }

  private handlePointerEnter(): void {
    this._hasMouseStop = true;
    if (this._carouselKeyboardInteractionFocus.focused) return;
    this.handlePauseOnInteraction();
  }

  private handlePointerLeave(): void {
    this._hasMouseStop = false;
    if (this._carouselKeyboardInteractionFocus.focused) return;
    this.handlePauseOnInteraction();
  }

  private handleFocusIn(): void {
    if (this._carouselKeyboardInteractionFocus.focused || this._hasMouseStop)
      return;
    this.handlePauseOnInteraction();
  }

  private handleFocusOut(event: FocusEvent): void {
    if (
      this.contains(event.relatedTarget as Node) ||
      this.shadowRoot?.contains(event.relatedTarget as Node)
    ) {
      return;
    }

    if (this._carouselKeyboardInteractionFocus.focused) {
      this._carouselKeyboardInteractionFocus.reset();

      if (!this._hasMouseStop) {
        this.handlePauseOnInteraction();
      }
    }
  }

  private async handleArrowLeft(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    isLTR(this) ? await this.prev() : await this.next();
    this.emitSlideChangedEvent();
  }

  private async handleArrowRight(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    isLTR(this) ? await this.next() : await this.prev();
    this.emitSlideChangedEvent();
  }

  private async handleHomeKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    isLTR(this)
      ? await this.select(this.slides[0])
      : await this.select(this.slides[this.total - 1]);
    this.emitSlideChangedEvent();
  }

  private async handleEndKey(): Promise<void> {
    this._hasKeyboardInteractionOnIndicators = true;
    isLTR(this)
      ? await this.select(this.slides[this.total - 1])
      : await this.select(this.slides[0]);
    this.emitSlideChangedEvent();
  }

  private async handleIndicatorClick(event: MouseEvent): Promise<void> {
    const indicator = findElementFromEventPath<IgcCarouselIndicatorComponent>(
      IgcCarouselIndicatorComponent.tagName,
      event
    ) as IgcCarouselIndicatorComponent;

    const index = this.hasProjectedIndicators
      ? this._projectedIndicators.indexOf(indicator)
      : Array.from(this._defaultIndicators).indexOf(indicator);

    if (index !== this.current && this.slides[index]) {
      const dir = index > this.current ? 'next' : 'prev';
      await this.select(this.slides[index], dir);

      this.emitSlideChangedEvent();
    }
  }

  private async handleNavigationClick(dir: 'next' | 'prev'): Promise<void> {
    dir === 'next' ? await this.next() : await this.prev();
    this.emitSlideChangedEvent();
  }

  private async handleNavigationKeydown(dir: 'next' | 'prev'): Promise<void> {
    dir === 'next' ? await this.next() : await this.prev();
    this.emitSlideChangedEvent();
  }

  private emitSlideChangedEvent(): void {
    this.emitEvent('igcSlideChanged');

    if (this.interval) {
      this.restartInterval();
    }
  }

  private activateSlide(
    slide: IgcCarouselSlideComponent,
    firstUpdate = false
  ): void {
    if (this._activeSlide) {
      this._activeSlide.active = false;

      if (this.hasProjectedIndicators) {
        this.updateProjectedIndicatorState(false);
      }
    }

    this._activeSlide = slide;
    this._activeSlide.active = true;

    if (this.hasProjectedIndicators && !firstUpdate) {
      this.updateProjectedIndicatorState(true);
    }

    if (this._hasKeyboardInteractionOnIndicators) {
      this.hasProjectedIndicators
        ? this._projectedIndicators[this.current].focus()
        : this._defaultIndicators[this.current].focus();

      this._hasKeyboardInteractionOnIndicators = false;
    }
  }

  private updateProjectedIndicatorState(isActive: boolean): void {
    const index = this.slides.indexOf(this._activeSlide);
    const indicator = this._projectedIndicators[index];
    indicator.tabIndex = isActive ? 0 : -1;
    indicator.ariaSelected = isActive ? 'true' : 'false';
    this.setIndicatorVisibility(indicator, isActive);
  }

  private resetInterval(): void {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private restartInterval(): void {
    this.resetInterval();

    const tick = asNumber(this.interval);
    if (tick > 0) {
      this._lastInterval = setInterval(() => {
        if (this.isPlaying && this.total) {
          this.next();
          this.emitEvent('igcSlideChanged');
        } else {
          this.pause();
        }
      }, this.interval);
    }
  }

  private setIndicatorAttributes(
    indicator: IgcCarouselIndicatorComponent,
    slide: IgcCarouselSlideComponent,
    index: number
  ): void {
    indicator.role = 'tab';
    indicator.tabIndex = slide.active ? 0 : -1;
    indicator.ariaLabel = `Slide ${index + 1}`;
    indicator.ariaSelected = slide.active ? 'true' : 'false';
    indicator.setAttribute('aria-controls', slide.id);
  }

  private setIndicatorVisibility(
    indicator: IgcCarouselIndicatorComponent,
    isActive: boolean
  ): void {
    if (!indicator) {
      return;
    }
    const forward = `${isActive ? 'visible' : 'hidden'}`;
    const backward = `${isActive ? 'hidden' : 'visible'}`;

    const active = indicator.shadowRoot?.querySelector(
      '[part="indicator active"]'
    ) as HTMLElement;

    const inactive = indicator.shadowRoot?.querySelector(
      '[part="indicator inactive"]'
    ) as HTMLElement;

    active.style.visibility = forward;
    inactive.style.visibility = backward;
  }

  private handlePauseOnInteraction(): void {
    if (!this.interval || this.skipPauseOnInteraction) return;

    if (this.isPlaying) {
      this.pause();
      this.emitEvent('igcPaused');
    } else {
      this.play();
      this.emitEvent('igcPlaying');
    }
  }

  private async animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent,
    dir: 'next' | 'prev'
  ): Promise<void> {
    if (dir === 'next') {
      // Animate slides in next direction
      await currentSlide.toggleAnimation('out');
      this.activateSlide(nextSlide);
      await nextSlide.toggleAnimation('in');
    } else {
      // Animate slides in previous direction
      await currentSlide.toggleAnimation('in', 'reverse');
      this.activateSlide(nextSlide);
      await nextSlide.toggleAnimation('out', 'reverse');
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
   * Switches to the next slide running any animations and returns if the operation was a success.
   */
  public async next(): Promise<boolean> {
    if (this.skipLoop && this.nextIndex === 0) {
      this.pause();
      return false;
    }

    return await this.select(this.slides[this.nextIndex], 'next');
  }

  /**
   * Switches to the previous slide running any animations and returns if the operation was a success.
   */
  public async prev(): Promise<boolean> {
    if (this.skipLoop && this.prevIndex === this.total - 1) {
      this.pause();
      return false;
    }

    return await this.select(this.slides[this.prevIndex], 'prev');
  }

  /**
   * Switches the passed in slide running any animations and returns if the operation was a success.
   */
  public async select(
    slide: IgcCarouselSlideComponent,
    direction?: 'next' | 'prev'
  ): Promise<boolean> {
    const index = this.slides.indexOf(slide);

    if (index === this.current || index === -1) {
      return false;
    }

    const dir = direction ?? (index > this.current ? 'next' : 'prev');

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
        ?disabled=${this.skipLoop && this.current === 0}
        @click=${() => this.handleNavigationClick('prev')}
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
        ?disabled=${this.skipLoop && this.current === this.total - 1}
        @click=${() => this.handleNavigationClick('next')}
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
    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i];
      const forward = `${slide.active ? 'visible' : 'hidden'}`;
      const backward = `${slide.active ? 'hidden' : 'visible'}`;
      yield html`<igc-carousel-indicator
        exportparts="indicator, active, inactive"
        role="tab"
        tabindex=${slide.active ? 0 : -1}
        aria-label="Slide ${i + 1}"
        aria-selected=${slide.active}
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
      </igc-carousel-indicator>`;
    }
  }

  private indicatorTemplate() {
    return html`
      <igc-carousel-indicator-container>
        <div
          ${ref(this._indicatorsContainerRef)}
          role="tablist"
          part=${partNameMap({
            indicators: true,
            start: this.indicatorsOrientation === 'start',
          })}
        >
          <slot
            name="indicator"
            @slotchange=${this.handleIndicatorSlotChange}
            @click=${this.handleIndicatorClick}
          >
            ${this.renderIndicators()}
          </slot>
        </div>
      </igc-carousel-indicator-container>
    `;
  }

  private labelTemplate() {
    return html`
      <div
        part=${partNameMap({
          label: true,
          indicators: true,
          start: this.indicatorsOrientation === 'start',
        })}
      >
        <span>${this.current + 1}/${this.total}</span>
      </div>
    `;
  }

  protected override render() {
    return html`
      <section @focusin=${this.handleFocusIn} @focusout=${this.handleFocusOut}>
        ${this.skipNavigation ? nothing : this.navigationTemplate()}
        ${this.skipIndicator || this.showIndicatorsLabel
          ? nothing
          : this.indicatorTemplate()}
        ${!this.skipIndicator && this.showIndicatorsLabel
          ? this.labelTemplate()
          : nothing}
        <div
          id=${this._carouselId}
          aria-live=${this.interval && this.isPlaying ? 'off' : 'polite'}
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
