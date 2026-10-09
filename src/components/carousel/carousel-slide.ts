import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { EaseInOut } from '#animations/easings.js';
import { addAnimationController } from '#animations/player.js';
import { carouselContext } from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { createIdGenerator, formatString } from '#internals/utils/strings.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { animations } from './animations.js';
import type IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-slide.base.css.js';

const nextId = createIdGenerator('igc-carousel-slide');

/**
 * A single content container within a set of containers used in the context of a carousel.
 *
 * @element igc-carousel-slide
 *
 * @slot - Default slot for the carousel slide.
 */
export default class IgcCarouselSlideComponent extends LitElement {
  public static override styles = [componentBase, styles];
  public static readonly tagName = 'igc-carousel-slide';

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCarouselSlideComponent);
  }

  private readonly _player = addAnimationController(this);

  private _carousel?: IgcCarouselComponent;

  protected get _animation() {
    const animation = this._carousel?.animationType ?? 'slide';

    if (animation === 'slide') {
      return this._carousel?.vertical ? 'slideVer' : 'slideHor';
    }

    return animation;
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

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: {
        role: 'tabpanel',
        ariaRoleDescription: 'slide',
      },
      aria: () => ({
        ariaLabel: this._carousel
          ? formatString(
              this._carousel.slidesLabelFormat,
              this._carousel.slides.indexOf(this) + 1,
              this._carousel.total
            )
          : '',
      }),
    });

    // Read the carousel when the provider is ready (Blazor timing).
    addAsyncContextConsumer(this, carouselContext, (carousel) => {
      this._carousel = carousel;
    });
  }

  /**
   * @hidden @internal
   * @deprecated since 5.4.0. Use Carousel's `select` method instead.
   */
  public async toggleAnimation(
    type: 'in' | 'out',
    direction: 'normal' | 'reverse' = 'normal'
  ): Promise<boolean> {
    const animation = animations[this._animation][type];

    return await this._player.playExclusive(
      animation({
        duration: 320,
        easing: EaseInOut.Quad,
        direction,
      })
    );
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.id = this.id || nextId();
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
