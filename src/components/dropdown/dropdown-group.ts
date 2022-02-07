import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators.js';
import { styles } from './dropdown-group.material.css';
import IgcDropDownItemComponent from './dropdown-item';

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

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
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
