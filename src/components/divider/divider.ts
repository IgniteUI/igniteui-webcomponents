import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { registerComponent } from '../common/definitions/register.js';
import type { DividerType } from '../types.js';
import { styles } from './themes/divider.base.css.js';
import { styles as shared } from './themes/shared/divider.common.css.js';
import { all } from './themes/themes.js';

/**
 * The igc-divider allows the content author to easily create a horizontal/vertical rule as a break between content to better organize information on a page.
 *
 * @element igc-divider
 *
 * @cssproperty --color - Sets the color of the divider.
 * @cssproperty --inset - Shrinks the divider by the given amount from the start. If `middle` is set it will shrink from both sides.
 *
 */
@themes(all)
export default class IgcDividerComponent extends LitElement {
  public static readonly tagName = 'igc-divider';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcDividerComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'separator',
      ariaOrientation: 'vertical',
    },
  });

  private _vertical = false;

  /**
   * Whether to render a vertical divider line.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public set vertical(value: boolean) {
    this._vertical = Boolean(value);
    this._internals.setARIA({
      ariaOrientation: this._vertical ? 'vertical' : 'horizontal',
    });
  }

  public get vertical(): boolean {
    return this._vertical;
  }

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

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-divider': IgcDividerComponent;
  }
}
