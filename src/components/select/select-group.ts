import { property, queryAssignedElements } from 'lit/decorators.js';
import IgcDropdownGroupComponent from '../dropdown/dropdown-group';
import IgcSelectComponent from './select';
import IgcSelectItemComponent from './select-item';

export default class IgcSelectGroupComponent extends IgcDropdownGroupComponent {
  public static override readonly tagName =
    'igc-select-group' as 'igc-dropdown-group';

  /** All child `igc-select-item`s. */
  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  public override items!: Array<IgcSelectItemComponent>;

  @property({ reflect: true })
  public disabled = false;

  public override connectedCallback() {
    super.connectedCallback();

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
