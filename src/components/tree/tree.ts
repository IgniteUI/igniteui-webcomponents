import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcTreeNodeComponent from './tree-node';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common';
import { IgcTreeNavigationService } from './tree.navigation';
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
  public navService!: IgcTreeNavigationService;

  @property({ attribute: 'id', reflect: true })
  public id = `igc-tree-${NEXT_ID++}`;

  @property()
  public selection: IgcTreeSelectionType = 'none';

  @watch('selection')
  public selectionModeChange() {
    this.selectionService.clearNodesSelection();
    this.nodes?.forEach((node: IgcTreeNodeComponent) => {
      node.selection = this.selection;
    });
  }

  public get nodes(): Array<IgcTreeNodeComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-node`));
  }

  public get rootNodes(): IgcTreeNodeComponent[] {
    return this.nodes?.filter((node) => node.level === 0);
  }

  constructor() {
    super();
    this.selectionService = new IgcTreeSelectionService(this);
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
    this.updateNodes();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  private updateNodes() {
    this.nodes?.forEach((node: IgcTreeNodeComponent) => {
      node.selectionService = this.selectionService;
      node.navService = this.navService;
    });
    // if (!this.navService.activeNode) {
    //   this.nodes.find((n: IgcTreeNodeComponent) => !n.disabled)!.tabIndex = 0;
    // }
  }

  private handleKeydown(event: KeyboardEvent) {
    this.navService.handleKeydown(event);
  }

  public deselectAll(nodes?: IgcTreeNodeComponent[]) {
    this.selectionService.deselectNodesWithNoEvent(nodes);
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
