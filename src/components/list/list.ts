import { html, LitElement } from 'lit';
import { SizableMixin } from '../common/mixins/sizable';
import { styles } from './list.material.css';

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
