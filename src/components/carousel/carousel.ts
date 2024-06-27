import { LitElement, html, nothing } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { createCounter } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcCarouselSlideComponent from './carousel-slide.js';
import { styles } from './themes/carousel.base.css.js';

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

export default class IgcCarouselComponent extends EventEmitterMixin<
  IgcCarouselComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static styles = [styles];
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
   * The duration in milliseconds between changing the active slide.
   * @attr interval
   */
  @property({ type: Number, reflect: false })
  public interval!: number;

  /**
   * The total number of slides.
   */
  @property({ type: Number, reflect: false, attribute: false })
  public total!: number;

  /**
   * The index of the current active slide.
   */
  @property({ type: Number, reflect: false, attribute: false })
  public current!: number;

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

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'region';
    this._internals.ariaRoleDescription = 'carousel';
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
  public play(): void {}

  /**
   * Pauses the carousel rotation of slides.
   */
  public pause(): void {}

  /**
   * Switches to the next slide running any animations and returns if the operation was a success.
   */
  public async next(): Promise<boolean> {
    return false;
  }

  /**
   * Switches to the previous slide running any animations and returns if the operation was a success.
   */
  public async prev(): Promise<boolean> {
    return false;
  }

  private handleClick(slide: IgcCarouselSlideComponent) {
    slide.active = true;
    this.emitEvent('igcSlideChanged');
  }

  private navigationTemplate() {
    return html`
      <div
        role="button"
        tabindex="0"
        aria-label="Previous slide"
        aria-controls=${this.carouselId}
        @click=${this.prev}
      >
        <igc-icon
          name="navigate_before"
          collection="internal"
          aria-hidden="true"
        ></igc-icon>
      </div>
      <div
        role="button"
        tabindex="0"
        aria-label="Next slide"
        aria-controls=${this.carouselId}
        @click=${this.next}
      >
        <igc-icon
          name="navigate_next"
          collection="internal"
          aria-hidden="true"
        ></igc-icon>
      </div>
    `;
  }

  private pickerTemplate() {
    return html`
      <div role="tablist">
        ${this.slides.map((slide) => {
          return html` <div
            role="tab"
            aria-label="Slide ${slide.index + 1}"
            aria-selected=${slide.active ? 'true' : 'false'}
            aria-controls="${slide.id}"
            @click=${() => this.handleClick(slide)}
          ></div>`;
        })}
      </div>
    `;
  }

  protected override render() {
    return html`
      <section>
        ${this.skipNavigation ? nothing : this.navigationTemplate()}
        <div
          id=${this.carouselId}
          aria-live=${this.interval ? 'off' : 'polite'}
        >
          <slot></slot>
        </div>
        ${this.withPicker ? this.pickerTemplate() : nothing}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel': IgcCarouselComponent;
  }
}
