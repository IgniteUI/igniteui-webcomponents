import { property, queryAssignedElements } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import IgcDropdownGroupComponent from '../dropdown/dropdown-group';
import IgcSelectComponent from './select';
import IgcSelectItemComponent from './select-item';

export default class IgcSelectGroupComponent extends IgcDropdownGroupComponent {
  public static override readonly tagName =
    'igc-select-group' as 'igc-dropdown-group';

  private observer!: MutationObserver;
  private controlledItems!: Array<IgcSelectItemComponent>;

  /** All child `igc-select-item`s. */
  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  public override items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({
    flatten: true,
    selector: 'igc-select-item:not([disabled])',
  })
  protected activeItems!: Array<IgcSelectItemComponent>;

  @property({ reflect: true, type: Boolean })
  public disabled = false;

  constructor() {
    super();
    this.observer = new MutationObserver(this.updateControlledItems.bind(this));
  }

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'group');
    const select = this.closest('igc-select') as IgcSelectComponent;
    this.size = select?.size;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.controlledItems = this.activeItems;

    this.items.forEach((i) => {
      this.observer.observe(i, { attributes: true });
    });
  }

  protected updateControlledItems(mutations: MutationRecord[]) {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'disabled') {
        const item = mutation.target as IgcSelectItemComponent;

        if (!this.disabled) {
          this.controlledItems = this.activeItems;
        }

        if (this.disabled && !item.disabled) {
          item.disabled = true;
        }
      }
    });
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected disabledChange() {
    this.disabled
      ? this.setAttribute('aria-disabled', 'true')
      : this.removeAttribute('aria-disabled');

    this.controlledItems.forEach((i) => (i.disabled = this.disabled));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
