import IgcDropdownGroupComponent from '../dropdown/dropdown-group';

export default class IgcSelectGroupComponent extends IgcDropdownGroupComponent {
  constructor() {
    super();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
