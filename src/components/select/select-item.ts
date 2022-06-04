import IgcDropdownItemComponent from '../dropdown/dropdown-item';

export default class IgcSelectItemComponent extends IgcDropdownItemComponent {
  public static override readonly tagName =
    'igc-select-item' as 'igc-dropdown-item';

  constructor() {
    super();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-item': IgcSelectItemComponent;
  }
}
