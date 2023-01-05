import { registerComponent } from '../common/util.js';
import IgcDropdownHeaderComponent from '../dropdown/dropdown-header.js';

/**
 * @element igc-select-header - Represents a header item in a select component.
 *
 * @slot - Renders the header.
 */
export default class IgcSelectHeaderComponent extends IgcDropdownHeaderComponent {
  public static override readonly tagName = 'igc-select-header';

  public static override register() {
    registerComponent(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-header': IgcSelectHeaderComponent;
  }
}
