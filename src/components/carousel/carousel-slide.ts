import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { type Ref, createRef, ref } from 'lit/directives/ref.js';
import { EaseInOut } from '../../animations/easings.js';
import { addAnimationController } from '../../animations/player.js';
import { registerComponent } from '../common/definitions/register.js';
import { createCounter } from '../common/util.js';
import { type Animation, animations } from '../stepper/animations.js';
import IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-slide.base.css.js';
import { styles as shared } from './themes/shared/slide/slide.common.css.js';

/**
 * A single content container within a set of containers used in the context of an `igc-carousel`.
 *
 * @element igc-carousel-slide
 *
 * @slot Default slot for the carousel slide.
 *
 * @csspart
 */

export default class IgcCarouselSlideComponent extends LitElement {
  public static override styles = [styles, shared];
  public static readonly tagName = 'igc-carousel-slide';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselSlideComponent);
  }

  private static readonly increment = createCounter();

  private _internals: ElementInternals;
  private _slideRef: Ref<HTMLElement> = createRef();
  private _animationPlayer = addAnimationController(this, this._slideRef);

  /**
   * The current active slide for the carousel component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /** @hidden @internal @private */
  public animation: Animation = 'slide';

  public async toggleAnimation(
    type: 'in' | 'out',
    direction: 'normal' | 'reverse' = 'normal'
  ) {
    const animation = animations.get(this.animation)!.get(type)!;

    const options: KeyframeAnimationOptions = {
      duration: 320,
      easing: EaseInOut.Quad,
      direction,
    };

    const [_, event] = await Promise.all([
      this._animationPlayer.stopAll(),
      this._animationPlayer.play(animation(options)),
    ]);

    return event.type;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'tabpanel';
    this._internals.ariaRoleDescription = 'slide';
  }

  protected override willUpdate(): void {
    const carousel = this.closest(IgcCarouselComponent.tagName);

    let index = 0;
    let total = 0;

    if (carousel) {
      index = carousel.slides.indexOf(this);
      total = carousel.total;
    }

    this._internals.ariaLabel = `${index + 1} of ${total}`;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.id =
      this.getAttribute('id') ||
      `igc-carousel-slide-${IgcCarouselSlideComponent.increment()}`;
  }

  protected override render() {
    return html`
      <div
        ${ref(this._slideRef)}
        tabindex=${this.active ? '0' : '-1'}
        part="base"
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-slide': IgcCarouselSlideComponent;
  }
}
