import { property } from 'lit/decorators.js';
import IgcDropdownGroupComponent from '../dropdown/dropdown-group';
import IgcSelectComponent from './select';

export default class IgcSelectGroupComponent extends IgcDropdownGroupComponent {
  public static override readonly tagName =
    'igc-select-group' as 'igc-dropdown-group';

  @property({ reflect: true })
  public disabled = false;

  public override connectedCallback() {
    this.setAttribute('role', 'group');
    const select = this.closest('igc-select') as IgcSelectComponent;
    this.size = select?.size;
  }

  constructor() {
    super();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
