import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SizableMixin } from '../common/mixins/sizable';
import { styles } from './list.material.css';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
@customElement('igc-list')
export default class IgcListComponent extends SizableMixin(LitElement) {
  /** @private */
  public static styles = styles;

  constructor() {
    super();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}
