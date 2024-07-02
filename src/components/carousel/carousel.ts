import { LitElement, html, nothing } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
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
  private _stoppedByInteraction = false;
  private _lastInterval: any;
  private _playing = false;
  private _paused = false;

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
   * @attr with-picker
   */
  @property({ type: Boolean, reflect: true, attribute: 'with-picker' })
  public withPicker = false;

  /**
   * The carousel alignment.
   * @attr vertical
   */
  @property({ type: Boolean, reflect: true })
  public vertical = false;

  /**
   * Sets the orientation of the picker controls (dots).
   * @attr
   */
  @property({ reflect: true, attribute: 'indicators-orientation' })
  public indicatorsOrientation: 'start' | 'end' = 'end';

  /**
   * The duration in milliseconds between changing the active slide.
   * @attr interval
   */
  @property({ type: Number, reflect: false })
  public interval!: number;

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
   * The slides of the carousel.
   */
  @queryAssignedElements({ selector: IgcCarouselSlideComponent.tagName })
  public slides!: Array<IgcCarouselSlideComponent>;

  /**
   * Whether the carousel is in playing state.
   */
  public get isPlaying() {
    return this._playing;
  }

  /**
   * Whether the carousel in in paused state.
   */
  public get isPaused() {
    return this._paused;
  }

  /**
   * The animation type.
   * @attr animation-type
   */
  @property({ attribute: 'animation-type' })
  public animationType: 'slide' | 'fade' | 'none' = 'slide';

  @watch('animationType', { waitUntilFirstUpdate: true })
  protected animationTypeChange() {
    this.slides.forEach((slide: IgcCarouselSlideComponent) => {
      slide.animation = this.animationType;
    });
  }

  @watch('interval', { waitUntilFirstUpdate: true })
  protected intervalChange() {
    this.restartInterval();
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'region';
    this._internals.ariaRoleDescription = 'carousel';

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
  }

  /**
   * Resumes playing of the carousel slides.
   */
  public play(): void {
    if (!this.isPlaying) {
      this._paused = false;
      this._playing = true;
      this.restartInterval();
      this._stoppedByInteraction = false;
    }
  }

  /**
   * Pauses the carousel rotation of slides.
   */
  public pause(): void {
    if (!this.skipPauseOnInteraction) {
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

    await this.animateSlides(this.slides[index], this.slides[this.current]);
    this.slides[index].active = true;
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

    await this.animateSlides(this.slides[index], this.slides[this.current]);
    this.slides[index].active = true;
    return true;
  }

  private getNextIndex(): number {
    return (this.current + 1) % this.total;
  }

  private getPrevIndex(): number {
    return this.current - 1 < 0 ? this.total - 1 : this.current - 1;
  }

  private resetInterval() {
    if (this._lastInterval) {
      clearInterval(this._lastInterval);
      this._lastInterval = null;
    }
  }

  private restartInterval() {
    this.resetInterval();

    if (!Number.isNaN(this.interval) && this.interval > 0) {
      this._lastInterval = setInterval(() => {
        const tick = +this.interval;
        if (this.isPlaying && this.total && !Number.isNaN(tick) && tick > 0) {
          this.next();
        } else {
          this.pause();
        }
      }, this.interval);
    }
  }

  private async animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent
  ) {
    // if (nextSlide.index > currentSlide.index) {
    //   // Animate slides in next direction
    //   currentSlide.toggleAnimation('out');
    //   nextSlide.toggleAnimation('in');
    // } else {
    //   // Animate slides in previous direction
    //   currentSlide.toggleAnimation('in', 'reverse');
    //   nextSlide.toggleAnimation('out', 'reverse');
    // }

    currentSlide.toggleAnimation('in', 'reverse');
    nextSlide.toggleAnimation('out', 'reverse');
  }

  private handlePointerEnter() {
    if (!this.skipPauseOnInteraction && this.isPlaying) {
      this._stoppedByInteraction = true;
    }
    this.pause();
  }

  private handlePointerLeave() {
    if (this._stoppedByInteraction) {
      this.play();
    }
  }

  private async handleClick(slide: IgcCarouselSlideComponent) {
    // if (slide.index !== this.current) {
    //   await this.animateSlides(slide, this.slides[this.current]);
    //   slide.active = true;
    //   this.emitEvent('igcSlideChanged');
    //   this.restartInterval();
    // }

    await this.animateSlides(slide, this.slides[this.current]);
    slide.active = true;
    this.emitEvent('igcSlideChanged');
    this.restartInterval();
  }

  private navigationTemplate() {
    const prev_icon = this.vertical ? 'arrow_upward' : 'navigate_before';
    const next_icon = this.vertical ? 'arrow_downward' : 'navigate_next';

    return html`
      <button
        part="navigation previous"
        aria-label="Previous slide"
        aria-controls=${this.carouselId}
        @click=${this.prev}
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
        part="navigation next"
        aria-label="Next slide"
        aria-controls=${this.carouselId}
        @click=${this.next}
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
        role="tablist"
        part=${partNameMap({
          indicators: true,
          start: this.indicatorsOrientation === 'start',
        })}
      >
        ${this.slides.map((slide, index) => {
          return html`<button
            role="tab"
            aria-label="Slide ${index + 1}"
            aria-selected=${slide.active ? 'true' : 'false'}
            aria-controls="${slide.id}"
            @click=${() => this.handleClick(slide)}
          >
            ${index + 1}
            <slot name="indicator"></slot>
          </button>`;
        })}
      </div>
    `;
  }

  protected override render() {
    return html`
      <section
        @pointerenter=${this.handlePointerEnter}
        @pointerleave=${this.handlePointerLeave}
      >
        ${this.skipNavigation ? nothing : this.navigationTemplate()}
        ${this.withPicker ? this.pickerTemplate() : nothing}
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
