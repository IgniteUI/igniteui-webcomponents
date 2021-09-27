import { html, LitElement } from 'lit';
import { SizableMixin } from '../common/mixins/sizable';
import { styles } from './list.material.css';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
export class IgcListComponent extends SizableMixin(LitElement) {
  /** @private */
  public static styles = styles;

  constructor() {
    super();
    this.setAttribute('role', 'list');
  }

  protected render() {
    return html`<slot></slot>`;
  }
}
