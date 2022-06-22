import IgcDropdownHeaderComponent from '../dropdown/dropdown-header';

/**
 * @element igc-select-header - Represents a header item in a select.
 *
 * @slot - Renders the header.
 */
export default class IgcSelectHeaderComponent extends IgcDropdownHeaderComponent {
  public static override readonly tagName =
    'igc-select-header' as 'igc-dropdown-header';
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-header': IgcSelectHeaderComponent;
  }
}
