import { html, LitElement } from 'lit';
import { queryAssignedNodes } from 'lit/decorators.js';
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
  /** @private */
  public static tagName = 'igc-dropdown-group';

  /** private */
  public static styles = styles;

  /** All child `igc-dropdown-item`s. */
  @queryAssignedNodes(undefined, true, 'igc-dropdown-item')
  public items!: NodeListOf<IgcDropDownItemComponent>;

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
  }

  protected render() {
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
