import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { addInternalsController } from '#internals/controllers/internals.js';
import { registerComponent } from '#internals/definitions/register.js';
import { all } from '#themes/divider/themes/themes.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { DividerType } from '../types.js';
import { styles } from './themes/divider.base.css.js';
import { styles as shared } from './themes/shared/divider.common.css.js';

/**
 * Shows a horizontal or vertical rule as a break between content on a page.
 *
 * @element igc-divider
 *
 * @cssproperty --color - The color of the divider.
 * @cssproperty --inset - The amount by which the line shrinks from the start. When `middle` is set, the line shrinks from both sides.
 *
 */
export default class IgcDividerComponent extends LitElement {
  public static readonly tagName = 'igc-divider';
  public static override styles = [componentBase, styles, shared];

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
  public vertical = false;

  /**
   * Whether the `--inset` value shrinks the line from both sides, not only from the start.
   * @attr
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public middle = false;

  /* alternateName: lineType */
  /**
   * The style of the divider line: solid or dashed.
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
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-divider': IgcDividerComponent;
  }
}
