import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EaseInOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { carouselContext } from '../common/context.js';
import { createAsyncContext } from '../common/controllers/async-consumer.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import { formatString } from '../common/util.js';
import { animations } from './animations.js';
import type IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-slide.base.css.js';

let nextId = 1;

/**
 * A single content container within a set of containers used in the context of an `igc-carousel`.
 *
 * @element igc-carousel-slide
 *
 * @slot Default slot for the carousel slide.
 */
export default class IgcCarouselSlideComponent extends LitElement {
  public static override styles = styles;
  public static readonly tagName = 'igc-carousel-slide';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCarouselSlideComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'tabpanel',
      ariaRoleDescription: 'slide',
    },
  });

  private readonly _player = addAnimationController(this);

  private _carousel?: IgcCarouselComponent;

  // Set carousel reference once provider is ready
  private readonly _context = createAsyncContext(
    this,
    carouselContext,
    (carousel) => {
      this._carousel = carousel;
    }
  );

  private get _carouselInstance(): IgcCarouselComponent | undefined {
    return this._carousel ?? this._context.value;
  }

  protected get _index(): number {
    return this._carouselInstance
      ? this._carouselInstance.slides.indexOf(this)
      : 0;
  }

  protected get _total(): number {
    return this._carouselInstance ? this._carouselInstance.slides.length : 0;
  }

  protected get _animation() {
    const animation = this._carouselInstance?.animationType ?? 'slide';

    if (animation === 'slide') {
      return this._carouselInstance?.vertical ? 'slideVer' : 'slideHor';
    }

    return animation;
  }

  protected get _labelFormat(): string {
    return this._carouselInstance
      ? this._carouselInstance.slidesLabelFormat
      : '';
  }

  /**
   * The current active slide for the carousel component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /* blazorSuppress */
  @property({ type: Boolean, reflect: true })
  public previous = false;

  /**
   * @hidden @internal
   * @deprecated since 5.4.0. Use Carousel's `select` method instead.
   */
  public async toggleAnimation(
    type: 'in' | 'out',
    direction: 'normal' | 'reverse' = 'normal'
  ): Promise<boolean> {
    const animation = animations.get(this._animation)!.get(type)!;

    return await this._player.playExclusive(
      animation({
        duration: 320,
        easing: EaseInOut.Quad,
        direction,
      })
    );
  }

  protected override willUpdate(): void {
    this._internals.setARIA({
      ariaLabel: formatString(this._labelFormat, this._index + 1, this._total),
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || `igc-carousel-slide-${nextId++}`;
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-slide': IgcCarouselSlideComponent;
  }
}
