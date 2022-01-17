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

/**
 * The tree allows users to represent hierarchical data in a tree-view structure,
 * maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.
 *
 * @element igc-tree
 *
 * @slot - Renders the tree items inside default slot.
 *
 * @fires igcTreeItemSelectionEvent - Emitted when item selection is changing, before the selection completes.
 * @fires igcItemExpanding - Emitted when tree item is about to expand.
 * @fires igcItemExpanded - Emitted when tree item is expanded.
 * @fires igcItemCollapsing - Emitted when tree item is about to collapse.
 * @fires igcItemCollapsed - Emitted when tree item is collapsed.
 */
export default class IgcTreeComponent extends SizableMixin(
  EventEmitterMixin<IgcTreeEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static tagName = 'igc-tree';
  /** @private */
  public static styles = styles;

  /** @private */
  public selectionService!: IgcTreeSelectionService;
  /** @private */
  public navService!: IgcTreeNavigationService;

  /** Whether a single or multiple of a parent's child items can be expanded. */
  @property({ reflect: true, type: Boolean })
  public singleBranchExpand = false;

  /** The selection state of the tree. */
  @property({ reflect: true })
  public selection: 'none' | 'multiple' | 'cascade' = 'none';

  @watch('size', { waitUntilFirstUpdate: true })
  public onSizeChange() {
    this.navService.activeItem?.wrapper.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  public selectionModeChange() {
    this.selectionService.clearItemsSelection();
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.selection = this.selection;
    });
  }

  constructor() {
    super();
    this.selectionService = new IgcTreeSelectionService(this);
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
  }

  public connectedCallback() {
    super.connectedCallback();
    this.classList.add('igc-tree');
    this.addEventListener('keydown', this.handleKeydown);
    // set init to true for all items which are rendered along with the tree
    this.items.forEach((i: IgcTreeItemComponent) => {
      i.init = true;
    });
  }

  /** Returns all of the tree's items. */
  public get items(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-item`));
  }

  /** Returns all of the tree's items that are on root level. */
  public get rootItems(): IgcTreeItemComponent[] {
    return this.items?.filter((item) => item.level === 0);
  }

  private _comparer = <T>(value: T, item: IgcTreeItemComponent) =>
    item.value === value;

  private handleKeydown(event: KeyboardEvent) {
    this.navService.handleKeydown(event);
  }

  /** @private */
  public expandToItem(item: IgcTreeItemComponent) {
    if (item && item.parentItem) {
      item.path.forEach((i) => {
        if (i !== item && !i.expanded) {
          i.expanded = true;
        }
      });
    }
  }

  /** Select all items if the items collection is empty. Otherwise, select the items in the items collection. */
  public select(items?: IgcTreeItemComponent[]) {
    if (!items) {
      items =
        this.selection === IgcTreeSelectionType.Cascade
          ? this.rootItems
          : this.items;
    }
    this.selectionService.selectItemsWithNoEvent(items);
  }

  /** Deselect all items if the items collection is empty. Otherwise, deselect the items in the items collection. */
  public deselect(items?: IgcTreeItemComponent[]) {
    this.selectionService.deselectItemsWithNoEvent(items);
  }

  /**
   * Expands all of the passed items.
   * If no items are passed, expands ALL items.
   */
  public expand(items?: IgcTreeItemComponent[]) {
    items = items || this.items;
    items.forEach((item) => (item.expanded = true));
  }

  /**
   * Collapses all of the passed items.
   * If no items are passed, collapses ALL items.
   */
  public collapse(items?: IgcTreeItemComponent[]) {
    items = items || this.items;
    items.forEach((item) => (item.expanded = false));
  }

  /**
   * Returns all of the items that match the passed searchTerm.
   * Accepts a custom comparer function for evaluating the search term against the items.
   *
   * @remark
   * Default search compares the passed `searchTerm` against the items's `value` Input.
   * When using `findNodes` w/o a `comparer`, make sure all items have `value` passed.
   *
   * @param searchTerm The value of the searched item
   * @param comparer A custom comparer function that evaluates the passed `searchTerm` against all items.
   * @returns Array of items that match the search. `null` if no items are found.
   */
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
