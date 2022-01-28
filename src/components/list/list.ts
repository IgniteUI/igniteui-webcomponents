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
export default class IgcListComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-list';

  public static override styles = styles;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list': IgcListComponent;
  }
}
