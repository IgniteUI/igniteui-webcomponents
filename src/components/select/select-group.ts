import { property, queryAssignedElements } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import IgcDropdownGroupComponent from '../dropdown/dropdown-group.js';
import IgcSelectItemComponent from './select-item.js';

/**
 * @element igc-select-group - A container for a group of `igc-select-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
export default class IgcSelectGroupComponent extends IgcDropdownGroupComponent {
  /** @private */
  public static override readonly tagName = 'igc-select-group';

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

  public override disconnectedCallback() {
    this.observer.disconnect();
  }

  protected override getParent() {
    return this.closest('igc-select')!;
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.controlledItems = this.activeItems;

    this.items.forEach((i) => {
      this.observer.observe(i, {
        attributes: true,
        attributeFilter: ['disabled'],
      });
    });

    this.updateDisabled();
  }

  protected updateControlledItems(mutations: MutationRecord[]) {
    mutations.forEach((mutation) => {
      const item = mutation.target as IgcSelectItemComponent;

      if (!this.disabled) {
        this.controlledItems = this.activeItems;
      }

      if (this.disabled && !item.disabled) {
        item.disabled = true;
      }
    });
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected updateDisabled() {
    this.disabled
      ? this.setAttribute('aria-disabled', 'true')
      : this.removeAttribute('aria-disabled');

    this.controlledItems?.forEach((i) => (i.disabled = this.disabled));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
