import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { coercedProperty } from '#internals/decorators/coerced-property.js';
import { registerComponent } from '#internals/definitions/register.js';
import { addThemingController } from '#theming/theming-controller.js';
import type { DividerType } from '../types.js';
import { styles } from './themes/divider.base.css.js';
import { styles as shared } from './themes/shared/divider.common.css.js';
import { all } from './themes/themes.js';

/**
 * The divider allows the content author to easily create a horizontal/vertical
 * rule as a break between content, to better organize information on a page.
 *
 * @element igc-divider
 *
 * @cssproperty --color - Sets the color of the divider.
 * @cssproperty --inset - Shrinks the divider by the given amount from the start. If `middle` is set it will shrink from both sides.
 *
 */
export default class IgcDividerComponent extends LitElement {
  public static readonly tagName = 'igc-divider';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDividerComponent);
  }

  /**
   * Whether to render a vertical divider line.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  @coercedProperty<boolean>({
    transform: ({ value }) => Boolean(value),
  })
  public vertical = false;

  /**
   * When set and inset is provided, it will shrink the divider line from both sides.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public middle = false;

  /* alternateName: lineType */
  /**
   * Whether to render a solid or a dashed divider line.
   * @attr type
   * @default 'solid'
   */
  @property({ reflect: true })
  public type: DividerType = 'solid';

  constructor() {
    super();
    addThemingController(this, all);

    addInternalsController(this, {
      initialARIA: { role: 'separator' },
      aria: () => ({
        ariaOrientation: this.vertical ? 'vertical' : 'horizontal',
      }),
    });
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-divider': IgcDividerComponent;
  }
}
