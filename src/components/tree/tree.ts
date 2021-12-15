import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcTreeNodeComponent from './tree-node';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common';
import { IgcTreeSelectionService } from './tree.selection';

let NEXT_ID = 0;

/**
 * Displays a collection of data items in a templatable list format.
 *
 * @element igc-list
 *
 * @slot - Renders the list items and list headers inside default slot.
 */
export default class IgcTreeComponent extends SizableMixin(
  EventEmitterMixin<IgcTreeEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-tree';

  // /** @private */
  // public static styles = styles;

  public selectionService!: IgcTreeSelectionService;

  @property({ attribute: 'id', reflect: true })
  public id = `igc-tree-${NEXT_ID++}`;

  @property()
  public selection: IgcTreeSelectionType = 'none';

  @watch('selection')
  public selectionModeChange() {
    this.nodes?.forEach((node: IgcTreeNodeComponent) => {
      node.selection = this.selection;
    });
  }

  public get nodes(): Array<IgcTreeNodeComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-node`));
  }

  constructor() {
    super();
    this.selectionService = new IgcTreeSelectionService(this);
    this.updateNodes();
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  private updateNodes() {
    this.nodes?.forEach((node: IgcTreeNodeComponent) => {
      node.selectionService = this.selectionService;
    });
  }

  protected render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree': IgcTreeComponent;
  }
}
