import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  createMutationController,
  type MutationControllerParams,
} from '../common/controllers/mutation-observer.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from '../dropdown/themes/dropdown-group.base.css.js';
import { all } from '../dropdown/themes/group.js';
import { styles as shared } from '../dropdown/themes/shared/group/dropdown-group.common.css.js';
import IgcSelectItemComponent from './select-item.js';

/**
 * @element igc-select-group - A container for a group of `igc-select-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
@themes(all)
export default class IgcSelectGroupComponent extends LitElement {
  public static readonly tagName = 'igc-select-group';
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcSelectGroupComponent);
  }

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'group',
    },
  });

  private controlledItems!: Array<IgcSelectItemComponent>;

  /** All child `igc-select-item`s. */
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
    for (const { node: item } of attributes) {
      if (!this.disabled) {
        this.controlledItems = this.activeItems;
      }

      if (this.disabled && !item.disabled) {
        item.disabled = true;
      }
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

    createMutationController(this, {
      callback: this._observerCallback,
      filter: [IgcSelectItemComponent.tagName],
      config: {
        attributeFilter: ['disabled'],
        subtree: true,
      },
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.controlledItems = this.activeItems;

    this.disabledChange();
  }

  @watch('disabled', { waitUntilFirstUpdate: true })
  protected disabledChange() {
    this._internals.setARIA({ ariaDisabled: this.disabled.toString() });

    for (const item of this.controlledItems) {
      item.disabled = this.disabled;
    }
  }

  protected override render() {
    return html`
      <label part="label">
        <slot name="label"></slot>
      </label>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-group': IgcSelectGroupComponent;
  }
}
