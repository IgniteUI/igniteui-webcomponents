import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcTreeItemComponent from './tree-item';
import {
  IgcTreeEventMap,
  IgcTreeSearchResolver,
  IgcTreeSelectionType,
} from './tree.common';
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

  @property({ reflect: true, type: Boolean })
  public singleBranchExpand = false;

  @property()
  public selection: IgcTreeSelectionType = 'none';

  @watch('selection')
  public selectionModeChange() {
    this.selectionService.clearItemsSelection();
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.selection = this.selection;
    });
  }

  public get items(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-item`));
  }

  public get rootItems(): IgcTreeItemComponent[] {
    return this.items?.filter((item) => item.level === 0);
  }

  constructor() {
    super();
    this.selectionService = new IgcTreeSelectionService(this);
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
    this.updateItems();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  private _comparer = <T>(value: T, item: IgcTreeItemComponent) =>
    item.value === value;

  private updateItems() {
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.selectionService = this.selectionService;
      item.navService = this.navService;
    });
    // if (!this.navService.activeNode) {
    //   this.nodes.find((n: IgcTreeNodeComponent) => !n.disabled)!.tabIndex = 0;
    // }
  }

  private handleKeydown(event: KeyboardEvent) {
    this.navService.handleKeydown(event);
  }

  public deselect(items?: IgcTreeItemComponent[]) {
    this.selectionService.deselectItemsWithNoEvent(items);
  }

  public select(items?: IgcTreeItemComponent[]) {
    if (!items) {
      items =
        this.selection === IgcTreeSelectionType.Cascade
          ? this.rootItems
          : this.items;
    }
    this.selectionService.selectItemsWithNoEvent(items);
  }

  public collapse(items?: IgcTreeItemComponent[]) {
    items = items || this.items;
    items.forEach((item) => (item.expanded = false));
  }

  public expand(items?: IgcTreeItemComponent[]) {
    items = items || this.items;
    items.forEach((item) => (item.expanded = true));
  }

  public findItems(
    searchTerm: any,
    comparer?: IgcTreeSearchResolver
  ): IgcTreeItemComponent[] | null {
    const compareFunc = comparer || this._comparer;
    const results = this.items.filter((item) => compareFunc(searchTerm, item));
    return results?.length === 0 ? null : results;
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
