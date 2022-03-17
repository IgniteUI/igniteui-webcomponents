import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { styles } from './themes/light/dropdown-group.base.css';
import IgcDropDownItemComponent from './dropdown-item';
import IgcDropDownComponent from './dropdown';

/**
 * @element igc-dropdown-group - A container for a group of `igc-dropdown-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 *
 * @csspart label - The native label element.
 */
export default class IgcDropDownGroupComponent extends LitElement {
  public static readonly tagName = 'igc-dropdown-group';

  public static override styles = styles;

  /** All child `igc-dropdown-item`s. */
  @queryAssignedElements({ flatten: true, selector: 'igc-dropdown-item' })
  public items!: Array<IgcDropDownItemComponent>;

  /** @private */
  @property({ reflect: true })
  public size: 'small' | 'medium' | 'large' = 'large';

  public override connectedCallback() {
    super.connectedCallback();

    this.setAttribute('role', 'group');
    const dropdown = this.closest('igc-dropdown') as IgcDropDownComponent;
    this.size = dropdown.size;
  }

  protected override render() {
    return html`
      <label part="label"><slot name="label"></slot></label>
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-group': IgcDropDownGroupComponent;
  }
}
