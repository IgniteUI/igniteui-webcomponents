import { html, LitElement } from 'lit';
import { themes } from '../../theming';
import { SizableMixin } from '../common/mixins/sizable';
import { styles } from './themes/light/list.base.css';
import { styles as bootstrap } from './themes/light/list.bootstrap.css';
import { styles as fluent } from './themes/light/list.fluent.css';
import { styles as indigo } from './themes/light/list.indigo.css';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
@themes({ bootstrap, fluent, indigo })
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
