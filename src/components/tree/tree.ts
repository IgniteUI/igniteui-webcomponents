import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { SizableMixin } from '../common/mixins/sizable';
import IgcTreeNodeComponent from './tree-node';

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
    return this.querySelectorAll(`igc-tree-node`);
  }

  // public connectedCallback() {
  //   super.connectedCallback();
  //   this.setAttribute('role', 'tree');
  // }

  @property()
  public selection: 'none' | 'multiple' | 'cascade' = 'none';

  @property({ attribute: 'id', reflect: true })
  public id = `igc-tree-${NEXT_ID++}`;

  protected render() {
    return html`<slot></slot>`;
  }

  @watch('selection')
  public selectionModeChange() {
    this.allNodes?.forEach((node: Node) => {
      (node as IgcTreeNodeComponent).selection = this.selection;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree': IgcTreeComponent;
  }
}
