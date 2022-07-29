import IgcDropdownHeaderComponent from '../dropdown/dropdown-header.js';

/**
 * @element igc-select-header - Represents a header item in a select component.
 *
 * @slot - Renders the header.
 */
export default class IgcSelectHeaderComponent extends IgcDropdownHeaderComponent {
  /** @private */
  public static override readonly tagName = 'igc-select-header';
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-header': IgcSelectHeaderComponent;
  }
}
