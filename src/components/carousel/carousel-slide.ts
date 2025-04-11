import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { EaseInOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { carouselContext } from '../common/context.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter, formatString } from '../common/util.js';
import { animations } from './animations.js';
import type IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-slide.base.css.js';

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
  public static register() {
    registerComponent(IgcCarouselSlideComponent);
  }

  private static readonly increment = createCounter();

  private _internals: ElementInternals;
  private _animationPlayer = addAnimationController(this);

  @consume({ context: carouselContext, subscribe: true })
  private _carousel?: IgcCarouselComponent;

  protected get _index() {
    return this._carousel ? this._carousel.slides.indexOf(this) : 0;
  }

  protected get _total() {
    return this._carousel ? this._carousel.slides.length : 0;
  }

  protected get _animation() {
    const animation = this._carousel?.animationType ?? 'slide';

    if (animation === 'slide') {
      return this._carousel?.vertical ? 'slideVer' : 'slideHor';
    }

    return animation;
  }

  protected get _labelFormat() {
    return this._carousel ? this._carousel.slidesLabelFormat : '';
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
  ) {
    const animation = animations.get(this._animation)!.get(type)!;

    const options: KeyframeAnimationOptions = {
      duration: 320,
      easing: EaseInOut.Quad,
      direction,
    };

    const [_, event] = await Promise.all([
      this._animationPlayer.stopAll(),
      this._animationPlayer.play(animation(options)),
    ]);

    return event.type === 'finish';
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'tabpanel';
    this._internals.ariaRoleDescription = 'slide';
  }

  protected override willUpdate(): void {
    this._internals.ariaLabel = formatString(
      this._labelFormat,
      this._index + 1,
      this._total
    );
  }

  public override connectedCallback(): void {
    super.connectedCallback();

    this.id =
      this.id || `igc-carousel-slide-${IgcCarouselSlideComponent.increment()}`;
  }

  protected override render() {
    return html` <slot></slot> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-slide': IgcCarouselSlideComponent;
  }
}
