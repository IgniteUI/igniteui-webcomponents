import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import type IgcSelectItemComponent from './select-item.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from '../dropdown/themes/dropdown-group.base.css.js';
import { all } from '../dropdown/themes/group.js';
import { styles as shared } from '../dropdown/themes/shared/group/dropdown-group.common.css.js';

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
  public static register() {
    registerComponent(this);
  }

  private _internals: ElementInternals;
  private observer!: MutationObserver;
  private controlledItems!: Array<IgcSelectItemComponent>;

  /** All child `igc-select-item`s. */
  @queryAssignedElements({ flatten: true, selector: 'igc-select-item' })
  public items!: Array<IgcSelectItemComponent>;

  @queryAssignedElements({
    flatten: true,
    selector: 'igc-select-item:not([disabled])',
  })
  protected activeItems!: Array<IgcSelectItemComponent>;

  /**
   * Whether the group item and all its children are disabled.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'group';

    this.observer = new MutationObserver(this.updateControlledItems.bind(this));
  }

  public override disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
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

    this.disabledChange();
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
  protected disabledChange() {
    this._internals.ariaDisabled = `${this.disabled}`;

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
