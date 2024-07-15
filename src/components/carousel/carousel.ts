import { ContextProvider } from '@lit/context';
import { LitElement, html, nothing } from 'lit';
import { property, queryAll, queryAssignedElements } from 'lit/decorators.js';

import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { themes } from '../../theming/theming-decorator.js';
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
import { createCounter, partNameMap } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
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
      IgcCarouselSlideComponent,
      IgcIconComponent
    );
  }

  private static readonly increment = createCounter();
  private carouselId = `igc-carousel-${IgcCarouselComponent.increment()}`;

  private _internals: ElementInternals;
  private _lastInterval: any;
  private _playing = false;
  private _paused = false;
  private _kbnIndicators = false;

  private _context = new ContextProvider(this, {
    context: carouselContext,
    initialValue: this,
  });

  private _indicatorsContainerRef: Ref<HTMLDivElement> = createRef();

  @queryAll('[role="tab"]')
  private _indicators!: NodeListOf<HTMLButtonElement>;

  private _observerCallback({
    changes: { added, attributes },
  }: MutationControllerParams<IgcCarouselSlideComponent>) {
    const activeSlides = this.slides.filter((slide) => slide.active);

    if (activeSlides.length <= 1) {
      return;
    }

    const carouselSlides = this.slides;
    const idx = carouselSlides.indexOf(
      added.length ? added.at(-1)! : attributes.at(-1)!
    );

    for (const [i, slide] of carouselSlides.entries()) {
      if (slide.active && i !== idx) {
        slide.active = false;
      }
    }

    if (this._kbnIndicators) {
      this._indicators[this.current].focus();
      this._kbnIndicators = false;
    }

    this.requestUpdate();
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
   * Whether the carousel should render the picker controls (dots).
   * @attr skip-picker
   */
  @property({ type: Boolean, reflect: true, attribute: 'skip-picker' })
  public skipPicker = false;

  /**
   * The carousel alignment.
   * @attr vertical
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * Sets the orientation of the picker controls (dots).
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
   * Controls the maximum picker controls (dots) that can be shown. Default value is `10`.
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
   * The template used for the content of each indicator (dot).
   */
  @property({ attribute: false })
  public indicatorTemplate = (slide: IgcCarouselSlideComponent) => {
    return html`<div
      part=${partNameMap({
        dot: true,
        active: slide.active,
      })}
    ></div>`;
  };

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
    const index = this.slides.findIndex((slide) => slide.active);
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

    this.addEventListener('focus', () => this.handlePauseOnInteraction());
    this.addEventListener('blur', () => this.handlePauseOnInteraction());
    this.addEventListener('pointerenter', () =>
      this.handlePauseOnInteraction()
    );
    this.addEventListener('pointerleave', () =>
      this.handlePauseOnInteraction()
    );

    addKeybindings(this, {
      ref: this._indicatorsContainerRef,
      bindingDefaults: { preventDefault: true },
    })
      .set(arrowLeft, async () => {
        this._kbnIndicators = true;
        await this.prev();
      })
      .set(arrowRight, async () => {
        this._kbnIndicators = true;
        await this.next();
      })
      .set(homeKey, async () => {
        this._kbnIndicators = true;
        await this.select(this.slides[0]);
      })
      .set(endKey, async () => {
        this._kbnIndicators = true;
        await this.select(this.slides[this.total - 1]);
      });

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

    if (this.total && index === -1) {
      this.slides[0].active = true;
    }

    this.requestUpdate();
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
    const index = this.getNextIndex();

    if (this.skipLoop && index === 0) {
      this.pause();
      return false;
    }

    await this.animateSlides(
      this.slides[index],
      this.slides[this.current],
      'next'
    );
    return true;
  }

  /**
   * Switches to the previous slide running any animations and returns if the operation was a success.
   */
  public async prev(): Promise<boolean> {
    const index = this.getPrevIndex();

    if (this.skipLoop && index === this.total - 1) {
      this.pause();
      return false;
    }

    await this.animateSlides(
      this.slides[index],
      this.slides[this.current],
      'prev'
    );
    return true;
  }

  /**
   * Switches the passed in slide running any animations and returns if the operation was a success.
   */
  public async select(
    slide: IgcCarouselSlideComponent,
    direction?: 'next' | 'prev'
  ): Promise<boolean> {
    const index = this.slides.indexOf(slide);

    if (index === this.current) {
      return false;
    }

    const dir = direction ?? index > this.current ? 'next' : 'prev';

    await this.animateSlides(
      this.slides[index],
      this.slides[this.current],
      dir
    );
    return true;
  }

  private getNextIndex(): number {
    return (this.current + 1) % this.total;
  }

  private getPrevIndex(): number {
    return this.current - 1 < 0 ? this.total - 1 : this.current - 1;
  }

  private showIndicatorsLabel(): boolean {
    return this.total > this.maximumIndicatorsCount;
  }

  private resetInterval(): void {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private restartInterval(): void {
    this.resetInterval();

    if (!Number.isNaN(this.interval) && this.interval > 0) {
      this._lastInterval = setInterval(() => {
        const tick = +this.interval;
        if (this.isPlaying && this.total && !Number.isNaN(tick) && tick > 0) {
          this.next();
          this.emitEvent('igcSlideChanged');
        } else {
          this.pause();
        }
      }, this.interval);
    }
  }

  private handlePauseOnInteraction(): void {
    if (!this.skipPauseOnInteraction && this.isPlaying) {
      this.pause();
    } else if (!this.isPlaying) {
      this.play();
    }
  }

  private async animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent,
    dir: 'next' | 'prev'
  ) {
    if (dir === 'next') {
      // Animate slides in next direction
      await currentSlide.toggleAnimation('out');
      nextSlide.active = true;
      await nextSlide.toggleAnimation('in');
    } else {
      // Animate slides in previous direction
      await currentSlide.toggleAnimation('in', 'reverse');
      nextSlide.active = true;
      await nextSlide.toggleAnimation('out', 'reverse');
    }
  }

  private async handlePickerClick(slide: IgcCarouselSlideComponent) {
    const index = this.slides.indexOf(slide);

    if (index !== this.current) {
      const dir = index > this.current ? 'next' : 'prev';
      await this.animateSlides(slide, this.slides[this.current], dir);

      this.emitSlideChangedEvent();
    }
  }

  private async handleNavigationClick(dir: 'next' | 'prev') {
    dir === 'next' ? await this.next() : await this.prev();
    this.emitSlideChangedEvent();
  }

  private async handleNavigationKeydown(
    event: KeyboardEvent,
    dir: 'next' | 'prev'
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      dir === 'next' ? await this.next() : await this.prev();
      this.emitSlideChangedEvent();
    }
  }

  private emitSlideChangedEvent() {
    this.emitEvent('igcSlideChanged');

    if (this.interval) {
      this.restartInterval();
    }
  }

  private navigationTemplate() {
    const prev_icon = this.vertical
      ? 'keyboard_arrow_up'
      : 'keyboard_arrow_left';
    const next_icon = this.vertical
      ? 'keyboard_arrow_down'
      : 'keyboard_arrow_right';

    return html`
      <button
        type="button"
        part="navigation previous"
        aria-label="Previous slide"
        aria-controls=${this.carouselId}
        ?disabled=${this.skipLoop && this.current === 0}
        @click=${() => this.handleNavigationClick('prev')}
        @keydown=${(event: KeyboardEvent) =>
          this.handleNavigationKeydown(event, 'prev')}
      >
        <slot name="previous-button">
          <igc-icon
            name=${prev_icon}
            collection="internal"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </button>
      <button
        type="button"
        part="navigation next"
        aria-label="Next slide"
        aria-controls=${this.carouselId}
        ?disabled=${this.skipLoop && this.current === this.total - 1}
        @click=${() => this.handleNavigationClick('next')}
        @keydown=${(event: KeyboardEvent) =>
          this.handleNavigationKeydown(event, 'next')}
      >
        <slot name="next-button">
          <igc-icon
            name=${next_icon}
            collection="internal"
            aria-hidden="true"
          ></igc-icon>
        </slot>
      </button>
    `;
  }

  private pickerTemplate() {
    return html`
      <div
        ${ref(this._indicatorsContainerRef)}
        role="tablist"
        part=${partNameMap({
          indicators: true,
          start: this.indicatorsOrientation === 'start',
        })}
      >
        ${this.slides.map((slide, index) => {
          return html`<div
            role="tab"
            tabindex=${slide.active ? '0' : '-1'}
            aria-label="Slide ${index + 1}"
            aria-selected=${slide.active}
            aria-controls="${slide.id}"
            @click=${() => this.handlePickerClick(slide)}
          >
            ${this.indicatorTemplate(slide)}
          </div>`;
        })}
      </div>
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
        <span>${this.current + 1} / ${this.total}</span>
      </div>
    `;
  }

  protected override render() {
    return html`
      <section>
        ${this.skipNavigation ? nothing : this.navigationTemplate()}
        ${this.skipPicker || this.showIndicatorsLabel()
          ? nothing
          : this.pickerTemplate()}
        ${this.showIndicatorsLabel() ? this.labelTemplate() : nothing}
        <div
          id=${this.carouselId}
          aria-live=${this.interval ? 'off' : 'polite'}
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
