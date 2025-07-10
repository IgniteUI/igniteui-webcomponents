import { consume } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { carouselContext } from '../common/context.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import { formatString } from '../common/util.js';
import type IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-indicator.base.css.js';

/**
 * Used when a custom indicator needs to be passed to the `igc-carousel` component.
 *
 * @element igc-carousel-indicator
 *
 * @slot - Default slot for projected inactive indicator.
 * @slot active - Default slot for projected active indicator.
 *
 * @csspart indicator - The wrapping container of the carousel dot indicator.
 * @csspart inactive - The wrapping container of the inactive dot indicator.
 * @csspart active - The wrapping container of the active dot indicator.
 */
export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCarouselIndicatorComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'tab' },
  });

  @consume({ context: carouselContext, subscribe: true })
  private _carousel?: IgcCarouselComponent;

  protected get _labelFormat(): string {
    return this._carousel ? this._carousel.indicatorsLabelFormat : '';
  }

  /* blazorSuppress */
  @property({ attribute: false })
  public active = false;

  /* blazorSuppress */
  @property({ attribute: false })
  public index = 0;

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.role = 'tab';
    this.slot = this.slot || 'indicator';
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('active')) {
      this.tabIndex = this.active ? 0 : -1;
      this._internals.setARIA({ ariaSelected: this.active.toString() });
    }

    this._internals.setARIA({
      ariaLabel: formatString(this._labelFormat, this.index + 1),
    });
  }

  protected override render() {
    const forward = this.active ? 'visible' : 'hidden';
    const backward = this.active ? 'hidden' : 'visible';

    return html`
      <div
        part="indicator inactive"
        style=${styleMap({ visibility: backward })}
      >
        <slot></slot>
      </div>
      <div part="indicator active" style=${styleMap({ visibility: forward })}>
        <slot name="active"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-carousel-indicator': IgcCarouselIndicatorComponent;
  }
}
