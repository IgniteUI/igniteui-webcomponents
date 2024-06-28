import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { registerComponent } from '../common/definitions/register.js';
import { createCounter } from '../common/util.js';
import { styles } from './themes/carousel-slide.base.css.js';

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
  public static override styles = [styles];
  public static readonly tagName = 'igc-carousel-slide';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcCarouselSlideComponent);
  }

  private static readonly increment = createCounter();

  private _internals: ElementInternals;

  /**
   * The current active slide for the carousel component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * The index of the slide inside the carousel.
   * @hidden @internal @private
   */
  public index = 0;

  /**
   * The total number of slides inside the carousel.
   * @hidden @internal @private
   */
  public total = 0;

  constructor() {
    super();
    this._internals = this.attachInternals();

    this._internals.role = 'tabpanel';
    this._internals.ariaRoleDescription = 'slide';
    this._internals.ariaLabel = `${this.index} of ${this.total}`;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.id =
      this.getAttribute('id') ||
      `igc-carousel-slide-${IgcCarouselSlideComponent.increment()}`;
  }

  protected override render() {
    return html`
      <div>
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
