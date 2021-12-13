import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { SizableMixin } from '../common/mixins/sizable';

let NEXT_ID = 0;

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
export default class IgcTreeComponent extends SizableMixin(LitElement) {
  /** @private */
  public static tagName = 'igc-tree';

  // /** @private */
  // public static styles = styles;

  constructor() {
    super();
  }

  public get allNodes(): NodeList {
    return document.querySelectorAll(`#${this.id} igc-tree-node`);
  }

  // public connectedCallback() {
  //   super.connectedCallback();
  //   this.setAttribute('role', 'tree');
  // }

  @property({ attribute: 'selection', reflect: true })
  public selection: 'None' | 'Multiple' | 'Cascade' = 'None';

  @property({ attribute: 'id', reflect: true })
  public id = `igc-tree-${NEXT_ID++}`;

  protected render() {
    return html`<slot></slot>`;
  }

  public attributeChangedCallback(
    name: string,
    _old: string | null,
    value: string | null
  ): void {
    if (
      name === 'selection' &&
      (value === 'None' || value === 'Multiple' || value === 'Cascade')
    ) {
      this.allNodes?.forEach((node: any) => {
        node.selection = value;
      });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree': IgcTreeComponent;
  }
}
