import { IgcGroupBaseComponent } from '#internals/bases/group.js';
import { registerComponent } from '#internals/definitions/register.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcColorSwatchComponent from './color-swatch.js';
import { styles } from './themes/color-swatch-group.base.css.js';

/**
 * A labelled group of color swatches in a color panel or a color picker.
 *
 * @element igc-color-swatch-group
 *
 * @slot label - The label of the group. Its text also names the group.
 * @slot - The swatches of the group.
 *
 * @csspart label - The label element.
 */
export default class IgcColorSwatchGroupComponent extends IgcGroupBaseComponent {
  public static readonly tagName = 'igc-color-swatch-group';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcColorSwatchGroupComponent, IgcColorSwatchComponent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-color-swatch-group': IgcColorSwatchGroupComponent;
  }
}
