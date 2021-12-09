import { html, LitElement } from 'lit';
import { customElement, property, queryAssignedNodes } from 'lit/decorators.js';
import { styles } from './dropdown-group.material.css';
import IgcDropDownItemComponent from './dropdown-item';

/**
 * @element igc-dropdown-group - A container for a group of `igc-dropdown-item` components.
 *
 * @slot label - Contains the group's label.
 * @slot - Intended to contain the items belonging to this group.
 */
@customElement('igc-dropdown-group')
export default class IgcDropDownGroupComponent extends LitElement {
  /** private */
  public static styles = styles;

  @property({ type: Boolean })
  public disabled = false;

  @queryAssignedNodes(undefined, true, 'igc-dropdown-item')
  public items!: NodeListOf<IgcDropDownItemComponent>;

  protected render() {
    return html`
      <label><slot name="label"></slot></label>
      <slot></slot>
    `;
  }
}
