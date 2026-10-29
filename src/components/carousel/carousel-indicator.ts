import { consume } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { carouselContext } from '#internals/context.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { formatString } from '#internals/utils/strings.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type IgcCarouselComponent from './carousel.js';
import { styles } from './themes/carousel-indicator.base.css.js';

/**
 * Used when a custom indicator needs to be passed to the carousel component.
 *
 * @element igc-carousel-indicator
 *
 * @slot - Renders the inactive state of the indicator.
 * @slot active - Renders the active state of the indicator.
 *
 * @csspart indicator - The wrapping container of the carousel dot indicator.
 * @csspart inactive - The wrapping container of the inactive dot indicator.
 * @csspart active - The wrapping container of the active dot indicator.
 */
export default class IgcCarouselIndicatorComponent extends LitElement {
  public static readonly tagName = 'igc-carousel-indicator';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcCarouselIndicatorComponent);
  }

  @consume({ context: carouselContext, subscribe: true })
  private readonly _carousel?: IgcCarouselComponent;

  protected get _labelFormat(): string {
    return this._carousel ? this._carousel.indicatorsLabelFormat : '';
  }

  /* blazorSuppress */
  /**
   * Whether the indicator is in its active state. The carousel sets this value.
   */
  @property({ attribute: false })
  public active = false;

  /* blazorSuppress */
  /**
   * The zero-based position of the indicator in the set. The carousel sets this value.
   */
  @property({ attribute: false })
  public index = 0;

  constructor() {
    super();

    addInternalsController(this, {
      initialARIA: { role: 'tab' },
      reflectRole: true,
      reflectLabel: true,
      aria: () => ({
        ariaSelected: `${this.active}`,
        ariaLabel: formatString(this._labelFormat, this.index + 1),
      }),
    });
  }

  /** @internal */
  public override connectedCallback(): void {
    super.connectedCallback();
    this.slot = this.slot || 'indicator';
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('active')) {
      this.tabIndex = this.active ? 0 : -1;
    }
  }

  protected override render() {
    const forward = this.active ? undefined : 'hidden';
    const backward = this.active ? 'hidden' : undefined;

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
