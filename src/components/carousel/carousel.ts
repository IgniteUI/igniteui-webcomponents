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

  private stoppedByInteraction = false;

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
  @property({ type: Number, reflect: false, attribute: false })
  public get total(): number {
    return this.slides.length;
  }

  /**
   * The index of the current active slide.
   */
  @property({ type: Number, reflect: false, attribute: false })
  public get current(): number {
    return this.slides.findIndex((slide) => slide.active) ?? 0;
  }

  /**
   * The slides of the carousel.
   */
  @queryAssignedElements({ selector: IgcCarouselSlideComponent.tagName })
  public slides!: Array<IgcCarouselSlideComponent>;

  /**
   * Whether the carousel is in playing state.
   */
  @property({ type: Boolean, reflect: false, attribute: false })
  public isPlaying = false;

  /**
   * Whether the carousel in in paused state.
   */
  @property({ type: Boolean, reflect: false, attribute: false })
  public isPaused = false;

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
    this.slides.forEach((slide, index) => {
      slide.index = index;
      slide.total = this.slides.length;
    });
  }

  /**
   * Resumes playing of the carousel slides.
   */
  public play(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.isPlaying = true;
      this.emitEvent('igcPlaying');
      // set interval
      this.stoppedByInteraction = false;
    }
  }

  /**
   * Pauses the carousel rotation of slides.
   */
  public pause(): void {
    if (!this.skipPauseOnInteraction) {
      this.isPlaying = false;
      this.isPaused = true;
      this.emitEvent('igcPaused');
      // set interval
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
    this.emitEvent('igcSlideChanged');
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
    this.emitEvent('igcSlideChanged');
    return true;
  }

  private getNextIndex(): number {
    return (this.current + 1) % this.total;
  }

  private getPrevIndex(): number {
    return this.current - 1 < 0 ? this.total - 1 : this.current - 1;
  }

  private async animateSlides(
    nextSlide: IgcCarouselSlideComponent,
    currentSlide: IgcCarouselSlideComponent
  ) {
    if (nextSlide.index > currentSlide.index) {
      // Animate slides in next direction
      currentSlide.toggleAnimation('out');
      nextSlide.toggleAnimation('in');
    } else {
      // Animate slides in previous direction
      currentSlide.toggleAnimation('in', 'reverse');
      nextSlide.toggleAnimation('out', 'reverse');
    }
  }

  private handleMouseEnter() {
    if (!this.skipPauseOnInteraction && this.isPlaying) {
      this.stoppedByInteraction = true;
    }
    this.pause();
  }

  private handleMouseLeave() {
    if (this.stoppedByInteraction) {
      this.play();
    }
  }

  private async handleClick(slide: IgcCarouselSlideComponent) {
    if (slide.index !== this.current) {
      await this.animateSlides(slide, this.slides[this.current]);
      slide.active = true;
      this.emitEvent('igcSlideChanged');
    }
  }

  private navigationTemplate() {
    const prev_icon = this.vertical ? 'arrow_upward' : 'navigate_before';
    const next_icon = this.vertical ? 'arrow_downward' : 'navigate_next';

    return html`
      <div
        part="navigation previous"
        role="button"
        tabindex="0"
        aria-label="Previous slide"
        aria-controls=${this.carouselId}
        @click=${this.prev}
      >
        <igc-icon
          name=${prev_icon}
          collection="internal"
          aria-hidden="true"
        ></igc-icon>
      </div>
      <div
        part="navigation next"
        role="button"
        tabindex="0"
        aria-label="Next slide"
        aria-controls=${this.carouselId}
        @click=${this.next}
      >
        <igc-icon
          name=${next_icon}
          collection="internal"
          aria-hidden="true"
        ></igc-icon>
      </div>
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
        ${this.slides.map((slide) => {
          return html`<button
            role="tab"
            aria-label="Slide ${slide.index + 1}"
            aria-selected=${slide.active ? 'true' : 'false'}
            aria-controls="${slide.id}"
            @click=${() => this.handleClick(slide)}
          >
            ${slide.index + 1}
          </button>`;
        })}
      </div>
    `;
  }

  protected override render() {
    return html`
      <section
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
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
