import IgcDropdownItemComponent from '../dropdown/dropdown-item';

export default class IgcSelectItemComponent extends IgcDropdownItemComponent {
  constructor() {
    super();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-item': IgcSelectItemComponent;
  }
}
