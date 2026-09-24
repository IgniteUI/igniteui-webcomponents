import type { PropertyValues } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import type { ARIAState } from '#internals/controllers/internals.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '#internals/controllers/mutation-observer.js';
import { registerComponent } from '#internals/definitions/register.js';
import { IgcGroupBaseComponent } from '#internals/mixins/group.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles } from '../dropdown/themes/dropdown-group.base.css.js';
import { all } from '../dropdown/themes/group.js';
import { styles as shared } from '../dropdown/themes/shared/group/dropdown-group.common.css.js';
import IgcSelectItemComponent from './select-item.js';

/**
 * A container for a group of select items.
 * @element igc-select-group
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
export default class IgcSelectGroupComponent extends IgcGroupBaseComponent {
  public static readonly tagName = 'igc-select-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectGroupComponent);
  }

  private controlledItems!: Array<IgcSelectItemComponent>;

  /** All child select items. */
  @queryAssignedElements({
    flatten: true,
    selector: IgcSelectItemComponent.tagName,
  })
  public items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({
    flatten: true,
    selector: `${IgcSelectItemComponent.tagName}:not([disabled])`,
  })
  protected activeItems!: Array<IgcSelectItemComponent>;

  private _observerCallback({
    changes: { attributes },
  }: MutationControllerParams<IgcSelectItemComponent>) {
    // An enabled group follows its items; a disabled one holds them disabled.
    if (!this.disabled) {
      this.controlledItems = this.activeItems;
      return;
    }

    for (const { node: item } of attributes) {
      item.disabled = true;
    }
  }

  /**
   * Whether the group item and all its children are disabled.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  constructor() {
    super();

    addThemingController(this, all);

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcSelectItemComponent.tagName],
      config: {
        attributeFilter: ['disabled'],
        subtree: true,
      },
    });
  }

  protected override _resolveARIA(): ARIAState {
    return { ariaDisabled: `${this.disabled}` };
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (this.hasUpdated && changedProperties.has('disabled')) {
      this.disabledChange();
    }
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.controlledItems = this.activeItems;

    this.disabledChange();
  }

  protected disabledChange() {
    for (const item of this.controlledItems) {
      item.disabled = this.disabled;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
