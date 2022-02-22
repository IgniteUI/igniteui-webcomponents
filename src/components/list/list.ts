import { html, LitElement } from 'lit';
import { DynamicTheme, theme } from '../../theming';
import { SizableMixin } from '../common/mixins/sizable';

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
export default class IgcListComponent extends SizableMixin(LitElement) {
  public static readonly tagName = 'igc-list';
  @theme({
    material: './list/themes/light/list.material.scss',
    bootstrap: './list/themes/light/list.bootstrap.scss',
    fluent: './list/themes/light/list.fluent.scss',
    indigo: './list/themes/light/list.indigo.scss',
  })
  protected theme!: DynamicTheme;

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
