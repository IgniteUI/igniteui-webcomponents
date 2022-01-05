import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { styles } from './tree.material.css';
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

  /** @private */
  public static styles = styles;

  public selectionService!: IgcTreeSelectionService;
  public navService!: IgcTreeNavigationService;

  public forceSelect: IgcTreeItemComponent[] = [];
  public connected = false;

  @property({ attribute: 'id', reflect: true })
  public id = `igc-tree-${NEXT_ID++}`;

  @property({ reflect: true, type: Boolean })
  public singleBranchExpand = false;

  @property()
  public selection: IgcTreeSelectionType = 'none';

  @watch('size', { waitUntilFirstUpdate: true })
  public onSizeChange() {
    this.scrollItemIntoView(this.navService.activeItem?.header);
  }

  @watch('selection')
  public selectionModeChange(oldValue: IgcTreeSelectionType) {
    if (oldValue) {
      this.selectionService.clearItemsSelection();
    }
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
  }

  public connectedCallback() {
    super.connectedCallback();
    this.connected = true;
    this.classList.add('igc-tree');
    this.addEventListener('keydown', this.handleKeydown);
    this.updateItems();
  }

  public disconnectedCallback(): void {
    this.connected = false;
  }

  private _comparer = <T>(value: T, item: IgcTreeItemComponent) =>
    item.value === value;

  private updateItems() {
    const toBeSelected = [...this.forceSelect];
    this.selectionService.selectItemsWithNoEvent(toBeSelected);
    this.forceSelect = [];
  }

  private handleKeydown(event: KeyboardEvent) {
    this.navService.handleKeydown(event);
  }

  public scrollItemIntoView(el: HTMLElement) {
    if (!el) {
      return;
    }
    const nodeRect = el.getBoundingClientRect();
    const treeRect = this.getBoundingClientRect();
    const topOffset =
      treeRect.top > nodeRect.top ? nodeRect.top - treeRect.top : 0;
    const bottomOffset =
      treeRect.bottom < nodeRect.bottom ? nodeRect.bottom - treeRect.bottom : 0;
    const shouldScroll = !!topOffset || !!bottomOffset;
    if (shouldScroll && this.scrollHeight > this.clientHeight) {
      // this.nativeElement.scrollTop = nodeRect.y - treeRect.y - nodeRect.height;
      this.scrollTop =
        this.scrollTop +
        bottomOffset +
        topOffset +
        (topOffset ? -1 : +1) * nodeRect.height;
    }
  }

  public expandToItem(item: IgcTreeItemComponent) {
    if (item && item.parentItem) {
      item.path.forEach((i) => {
        if (i !== item && !i.expanded) {
          i.expanded = true;
        }
      });
    }
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
    return html`<slot @slotchange=${this.updateItems}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree': IgcTreeComponent;
  }
}
