import { isEmpty } from '../common/util.js';
import type { TreeSelectionEventInit } from './tree.common.js';
import type IgcTreeComponent from './tree.js';
import type IgcTreeItemComponent from './tree-item.js';

/* blazorSuppress */
export class IgcTreeSelectionService {
  private tree!: IgcTreeComponent;
  private itemSelection: Set<IgcTreeItemComponent> =
    new Set<IgcTreeItemComponent>();
  private indeterminateItems: Set<IgcTreeItemComponent> =
    new Set<IgcTreeItemComponent>();
  private itemsToBeSelected!: Set<IgcTreeItemComponent>;
  private itemsToBeIndeterminate!: Set<IgcTreeItemComponent>;

  constructor(tree: IgcTreeComponent) {
    this.tree = tree;
  }

  /** Select range from last selected item to the current specified item. */
  public selectMultipleItems(item: IgcTreeItemComponent): void {
    if (!this.itemSelection.size) {
      this.selectItem(item);
      return;
    }
    const lastSelectedItemIndex = this.tree.items.indexOf(
      this.getSelectedItems()[this.itemSelection.size - 1]
    );
    const currentItemIndex = this.tree.items.indexOf(item);
    const items = this.tree.items.slice(
      Math.min(currentItemIndex, lastSelectedItemIndex),
      Math.max(currentItemIndex, lastSelectedItemIndex) + 1
    );

    const added = items.filter(
      (_item: IgcTreeItemComponent) => !this.isItemSelected(_item)
    );
    const newSelection = this.getSelectedItems().concat(added);
    this.emitItemSelectionEvent(newSelection, added, []);
  }

  /** Select the specified item and emit event. */
  public selectItem(item: IgcTreeItemComponent): void {
    if (this.tree.selection === 'none') {
      return;
    }
    this.emitItemSelectionEvent([...this.getSelectedItems(), item], [item], []);
  }

  /** Deselect the specified item and emit event. */
  public deselectItem(item: IgcTreeItemComponent): void {
    const newSelection = this.getSelectedItems().filter(
      (_item: IgcTreeItemComponent) => _item !== item
    );
    this.emitItemSelectionEvent(newSelection, [], [item]);
  }

  /** Clears item selection */
  public clearItemsSelection(): void {
    const oldSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();
    this.itemSelection.clear();
    this.indeterminateItems.clear();
    oldSelection.forEach((i: IgcTreeItemComponent) => {
      i.selected = false;
    });
    oldIndeterminate.forEach((i: IgcTreeItemComponent) => {
      i.indeterminate = false;
    });
  }

  public isItemSelected(item: IgcTreeItemComponent): boolean {
    return this.itemSelection.has(item);
  }

  public isItemIndeterminate(item: IgcTreeItemComponent): boolean {
    return this.indeterminateItems.has(item);
  }

  /** Called on item`s disconnectedCallback */
  public ensureStateOnItemDelete(item: IgcTreeItemComponent): void {
    // Don't update the internal state of the deleted items because when moving they should keep it
    // However update the state of their parents
    this.deselectItemsWithNoEvent(
      [item, ...item.getChildren({ flatten: true })],
      true
    );
  }

  /** Retrigger the selection state of the item. */
  public retriggerItemState(item: IgcTreeItemComponent): void {
    if (item.selected) {
      this.itemSelection.delete(item);
      this.selectItemsWithNoEvent([item]);
    } else {
      this.itemSelection.add(item);
      this.deselectItemsWithNoEvent([item]);
    }
  }

  private emitItemSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const currSelection = this.getSelectedItems();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }

    if (this.tree.selection === 'cascade') {
      this.emitCascadeItemSelectionEvent(currSelection, added, removed);
      return;
    }

    const args: TreeSelectionEventInit = {
      detail: {
        newSelection,
      },
      cancelable: true,
    };

    const allowed = this.tree.emitEvent('igcSelection', args);
    if (!allowed) {
      return;
    }

    // if newSelection is overwritten do not proceed (Blazor)
    if (this.areEqualCollections(newSelection, args.detail.newSelection)) {
      this.itemSelection = new Set(newSelection);
      this.updateItemsState(currSelection);
    }
  }

  /** Select specified items. No event is emitted. */
  public selectItemsWithNoEvent(items: IgcTreeItemComponent[]): void {
    const oldSelection = this.getSelectedItems();

    if (this.tree && this.tree.selection === 'cascade') {
      this.cascadeSelectItemsWithNoEvent(items, oldSelection);
      return;
    }

    for (const item of items) {
      this.itemSelection.add(item);
    }

    this.updateItemsState(oldSelection);
  }

  /** Deselect specified items. No event is emitted. */
  public deselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    onDelete = false
  ): void {
    if (this.tree && this.tree.selection === 'cascade') {
      this.cascadeDeselectItemsWithNoEvent(items, onDelete);
      return;
    }
    const itemSet = new Set(items);
    const oldSelection = onDelete
      ? this.getSelectedItems().filter(
          (i: IgcTreeItemComponent) => !itemSet!.has(i)
        )
      : this.getSelectedItems();

    if (!items) {
      this.itemSelection.clear();
    } else {
      for (const item of items) {
        this.itemSelection.delete(item);
      }
    }

    this.updateItemsState(oldSelection);
  }

  private emitCascadeItemSelectionEvent(
    currSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const oldIndeterminate = this.getIndeterminateItems();

    this.calculateItemsNewSelectionState(currSelection, added, removed);

    const args: TreeSelectionEventInit = {
      detail: {
        newSelection: Array.from(this.itemsToBeSelected),
      },
      cancelable: true,
    };

    const allowed = this.tree.emitEvent('igcSelection', args);

    if (!allowed) {
      return;
    }

    // if newSelection is overwritten do not proceed (Blazor)
    if (
      this.areEqualCollections(
        Array.from(this.itemsToBeSelected),
        args.detail.newSelection
      )
    ) {
      this.itemSelection = new Set<IgcTreeItemComponent>(
        this.itemsToBeSelected
      );
      this.indeterminateItems = new Set(this.itemsToBeIndeterminate);
      this.updateItemsState(currSelection, oldIndeterminate);
    }
  }

  private cascadeSelectItemsWithNoEvent(
    items: IgcTreeItemComponent[],
    oldSelection: IgcTreeItemComponent[]
  ): void {
    const oldIndeterminate = this.getIndeterminateItems();

    const newSelection = [...oldSelection, ...items];

    // retrieve only the rows without their parents/children which has to be added to the selection
    const newSelectionSet = new Set(newSelection);
    const removed = oldSelection!.filter((x) => !newSelectionSet.has(x));
    const added = newSelection!.filter((x) => !this.itemSelection.has(x));

    this.calculateItemsNewSelectionState(oldSelection, added, removed);

    this.itemSelection = new Set(this.itemsToBeSelected);
    this.indeterminateItems = new Set(this.itemsToBeIndeterminate);

    this.updateItemsState(oldSelection, oldIndeterminate);
  }

  private cascadeDeselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    onDelete = false
  ): void {
    const itemSet = new Set(items);
    const oldSelection = onDelete
      ? this.getSelectedItems().filter(
          (i: IgcTreeItemComponent) => !itemSet!.has(i)
        )
      : this.getSelectedItems();
    const oldIndeterminate = onDelete
      ? this.getIndeterminateItems().filter(
          (i: IgcTreeItemComponent) => !itemSet!.has(i)
        )
      : this.getIndeterminateItems();

    if (!items) {
      this.itemSelection.clear();
      this.indeterminateItems.clear();
    } else {
      this.calculateItemsNewSelectionState(oldSelection, [], items);

      this.itemSelection = new Set<IgcTreeItemComponent>(
        this.itemsToBeSelected
      );
      this.indeterminateItems = new Set<IgcTreeItemComponent>(
        this.itemsToBeIndeterminate
      );
    }

    this.updateItemsState(oldSelection, oldIndeterminate);
  }

  // OK (disabled children?)
  /**
   * populates the itemsToBeSelected and itemsToBeIndeterminate sets
   * with the items which will be eventually in selected/indeterminate state
   */
  private calculateItemsNewSelectionState(
    oldSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    this.itemsToBeSelected = new Set<IgcTreeItemComponent>(oldSelection);
    this.itemsToBeIndeterminate = new Set<IgcTreeItemComponent>(
      this.getIndeterminateItems()
    );

    this.cascadeSelectionState(removed, false);
    this.cascadeSelectionState(added, true);
  }

  // OK (disabled children?)
  /** Ensures proper selection state for all predescessors and descendants during a selection event */
  private cascadeSelectionState(
    items: IgcTreeItemComponent[] | undefined,
    selected: boolean
  ): void {
    if (!items || isEmpty(items)) {
      return;
    }

    const parents = new Set<IgcTreeItemComponent>();
    items.forEach((item: IgcTreeItemComponent) => {
      // select/deselect items passed by event/api
      this.selectDeselectItem(item, selected);

      // select/deselect all of their children
      const itemAndAllChildren = item.getChildren({ flatten: true }) || [];
      itemAndAllChildren.forEach((i: IgcTreeItemComponent) => {
        this.selectDeselectItem(i, selected);
      });

      // add their direct parent to the set
      if (item?.parent) {
        parents.add(item.parent);
      }
    });

    // handle direct parents from the set
    for (const parent of parents) {
      this.handleParentSelectionState(parent);
    }
  }

  // OK (disabled children?)
  /**
   * recursively handle the selection state of the direct and indirect parents
   */
  private handleParentSelectionState(item: IgcTreeItemComponent): void {
    if (!item) {
      return;
    }
    this.handleItemSelectionState(item);
    if (item.parent) {
      this.handleParentSelectionState(item.parent);
    }
  }

  // OK (disabled children?)
  /**
   * Handle the selection state of a given item based the selection states of its direct children
   */
  private handleItemSelectionState(item: IgcTreeItemComponent): void {
    const itemsArray = item?.getChildren() ? item.getChildren() : [];
    if (itemsArray.length) {
      if (
        itemsArray.every((i: IgcTreeItemComponent) =>
          this.itemsToBeSelected.has(i)
        )
      ) {
        this.selectDeselectItem(item, true);
      } else if (
        itemsArray.some(
          (i: IgcTreeItemComponent) =>
            this.itemsToBeSelected.has(i) || this.itemsToBeIndeterminate.has(i)
        )
      ) {
        this.selectDeselectItem(item, false, true);
      } else {
        this.selectDeselectItem(item, false);
      }
    } else if (this.isItemSelected(item)) {
      // if the children of the item has been deleted and the item was selected do not change its state
      this.selectDeselectItem(item, true);
    } else {
      this.selectDeselectItem(item, false);
    }
  }

  /** Emits the `selectedChange` event for each item affected by the selection */
  private updateItemsState(
    oldSelection: IgcTreeItemComponent[],
    oldIndeterminate: IgcTreeItemComponent[] = []
  ): void {
    const selected = new Set<IgcTreeItemComponent>(oldSelection);
    const indeterminated = new Set<IgcTreeItemComponent>(oldIndeterminate);

    this.getSelectedItems().forEach((i: IgcTreeItemComponent) => {
      if (!selected.has(i)) {
        i.selected = true;
      }
    });

    oldSelection.forEach((i: IgcTreeItemComponent) => {
      if (!this.itemSelection.has(i)) {
        i.selected = false;
      }
    });

    if (this.tree.selection === 'cascade') {
      this.indeterminateItems.forEach((i: IgcTreeItemComponent) => {
        if (!indeterminated.has(i)) {
          i.indeterminate = true;
        }
      });

      oldIndeterminate.forEach((i: IgcTreeItemComponent) => {
        if (!this.indeterminateItems.has(i)) {
          i.indeterminate = false;
        }
      });
    }
  }

  /** Returns array of the selected items. */
  private getSelectedItems(): IgcTreeItemComponent[] {
    return Array.from(this.itemSelection);
  }

  /** Returns array of the items in indeterminate state. */
  private getIndeterminateItems(): IgcTreeItemComponent[] {
    return Array.from(this.indeterminateItems);
  }

  private areEqualCollections(
    first: IgcTreeItemComponent[],
    second: IgcTreeItemComponent[]
  ): boolean {
    return (
      first.length === second.length &&
      new Set(first.concat(second)).size === first.length
    );
  }

  private selectDeselectItem(
    item: IgcTreeItemComponent,
    select: boolean,
    indeterminate = false
  ): void {
    if (indeterminate) {
      this.itemsToBeIndeterminate.add(item);
      this.itemsToBeSelected.delete(item);
      return;
    }

    if (select) {
      this.itemsToBeSelected.add(item);
      this.itemsToBeIndeterminate.delete(item);
    } else {
      this.itemsToBeSelected.delete(item);
      this.itemsToBeIndeterminate.delete(item);
    }
  }
}
