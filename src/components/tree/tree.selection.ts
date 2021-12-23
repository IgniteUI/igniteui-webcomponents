import IgcTreeComponent from './tree';
import IgcTreeItemComponent from './tree-item';
import {
  IgcTreeItemSelectionEventArgs,
  IgcTreeItemSelectionEventDetails,
  IgcTreeSelectionType,
} from './tree.common';

interface CascadeSelectionItemCollection {
  items: Set<IgcTreeItemComponent>;
  parents: Set<IgcTreeItemComponent>;
}

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

    const added = items.filter((_item) => !this.isItemSelected(_item));
    const newSelection = this.getSelectedItems().concat(added);
    this.emitItemSelectionEvent(newSelection, added, []);
  }

  /** Select the specified item and emit event. */
  public selectItem(item: IgcTreeItemComponent): void {
    if (this.tree.selection === IgcTreeSelectionType.None) {
      return;
    }
    this.emitItemSelectionEvent([...this.getSelectedItems(), item], [item], []);
  }

  /** Deselect the specified item and emit event. */
  public deselectItem(item: IgcTreeItemComponent): void {
    const newSelection = this.getSelectedItems().filter((r) => r !== item);
    this.emitItemSelectionEvent(newSelection, [], [item]);
  }

  /** Clears item selection */
  public clearItemsSelection(): void {
    this.itemSelection.clear();
    this.indeterminateItems.clear();
  }

  public isItemSelected(item: IgcTreeItemComponent): boolean {
    return this.itemSelection.has(item);
  }

  public isItemIndeterminate(item: IgcTreeItemComponent): boolean {
    return this.indeterminateItems.has(item);
  }

  /** Select specified items. No event is emitted. */
  public selectItemsWithNoEvent(
    items: IgcTreeItemComponent[],
    clearPrevSelection = false,
    shouldEmit = true
  ): void {
    if (this.tree && this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.cascadeSelectItemsWithNoEvent(items, clearPrevSelection);
      return;
    }

    const oldSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();

    if (clearPrevSelection) {
      this.itemSelection.clear();
    }
    items.forEach((item) => this.itemSelection.add(item));

    if (shouldEmit) {
      this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
    }
  }

  /** Deselect specified items. No event is emitted. */
  public deselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    shouldEmit = true
  ): void {
    const oldSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();

    if (!items) {
      this.itemSelection.clear();
    } else if (
      this.tree &&
      this.tree.selection === IgcTreeSelectionType.Cascade
    ) {
      this.cascadeDeselectItemsWithNoEvent(items);
    } else {
      items.forEach((item) => this.itemSelection.delete(item));
    }

    if (shouldEmit) {
      this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
    }
  }

  /** Called on `item.ngOnDestroy` to ensure state is correct after item is removed */
  public ensureStateOnItemDelete(item: IgcTreeItemComponent): void {
    if (this.tree?.selection !== IgcTreeSelectionType.Cascade) {
      return;
    }
    requestAnimationFrame(() => {
      if (this.isItemSelected(item)) {
        // item is destroyed, do not emit event
        this.deselectItemsWithNoEvent([item], false);
      } else {
        if (!item.parentItem) {
          return;
        }
        const assitantLeafItem = item.parentItem?.allChildren.find(
          (e: IgcTreeItemComponent) => !e.directChildren?.length
        );
        if (!assitantLeafItem) {
          return;
        }
        this.retriggerItemState(assitantLeafItem);
      }
    });
  }

  /** Retriggers a item's selection state */
  private retriggerItemState(item: IgcTreeItemComponent): void {
    if (item.selected) {
      this.itemSelection.delete(item);
      this.selectItemsWithNoEvent([item], false, false);
    } else {
      this.itemSelection.add(item);
      this.deselectItemsWithNoEvent([item], false);
    }
  }

  /** Returns array of the selected items. */
  private getSelectedItems(): IgcTreeItemComponent[] {
    return this.itemSelection.size ? Array.from(this.itemSelection) : [];
  }

  /** Returns array of the items in indeterminate state. */
  private getIndeterminateItems(): IgcTreeItemComponent[] {
    return this.indeterminateItems.size
      ? Array.from(this.indeterminateItems)
      : [];
  }

  private emitItemSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ) {
    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.emitCascadeItemSelectionEvent(newSelection, added, removed);
      return;
    }
    const currSelection = this.getSelectedItems();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }
    const args: IgcTreeItemSelectionEventArgs = {
      detail: {
        oldSelection: currSelection,
        newSelection,
        added,
        removed,
      },
      cancelable: true,
    };

    const allowed = this.tree.emitEvent('igcTreeItemSelectionEvent', args);
    if (!allowed) {
      return;
    }
    this.selectItemsWithNoEvent(args.detail.newSelection, true);
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

  private cascadeSelectItemsWithNoEvent(
    items: IgcTreeItemComponent[],
    clearPrevSelection = false
  ): void {
    const oldSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();

    if (clearPrevSelection) {
      this.indeterminateItems.clear();
      this.itemSelection.clear();
      this.calculateItemsNewSelectionState({ added: items, removed: [] });
    } else {
      const newSelection = [...oldSelection, ...items];
      const args: Partial<IgcTreeItemSelectionEventDetails> = {
        oldSelection,
        newSelection,
      };

      // retrieve only the rows without their parents/children which has to be added to the selection
      this.populateAddRemoveArgs(args);

      this.calculateItemsNewSelectionState(args);
    }
    this.itemSelection = new Set(this.itemsToBeSelected);
    this.indeterminateItems = new Set(this.itemsToBeIndeterminate);

    this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
  }

  private cascadeDeselectItemsWithNoEvent(items: IgcTreeItemComponent[]): void {
    const args = { added: [], removed: items };
    this.calculateItemsNewSelectionState(args);

    this.itemSelection = new Set<IgcTreeItemComponent>(this.itemsToBeSelected);
    this.indeterminateItems = new Set<IgcTreeItemComponent>(
      this.itemsToBeIndeterminate
    );
  }

  /**
   * populates the nodesToBeSelected and nodesToBeIndeterminate sets
   * with the items which will be eventually in selected/indeterminate state
   */
  private calculateItemsNewSelectionState(
    args: Partial<IgcTreeItemSelectionEventDetails>
  ): void {
    this.itemsToBeSelected = new Set<IgcTreeItemComponent>(
      args?.oldSelection ? args.oldSelection : this.getSelectedItems()
    );
    this.itemsToBeIndeterminate = new Set<IgcTreeItemComponent>(
      this.getIndeterminateItems()
    );

    this.cascadeSelectionState(args.removed, false);
    this.cascadeSelectionState(args.added, true);
  }

  /** Ensures proper selection state for all predescessors and descendants during a selection event */
  private cascadeSelectionState(
    items: IgcTreeItemComponent[] | undefined,
    selected: boolean
  ): void {
    if (!items || items.length === 0) {
      return;
    }

    if (items && items.length > 0) {
      const itemCollection: CascadeSelectionItemCollection =
        this.getCascadingItemCollection(items);

      itemCollection.items.forEach((item) => {
        if (selected) {
          this.itemsToBeSelected.add(item);
        } else {
          this.itemsToBeSelected.delete(item);
        }
        this.itemsToBeIndeterminate.delete(item);
      });

      Array.from(itemCollection.parents).forEach((parent) => {
        this.handleParentSelectionState(parent);
      });
    }
  }

  private emitCascadeItemSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const currSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }

    const args: IgcTreeItemSelectionEventDetails = {
      oldSelection: currSelection,
      newSelection,
      added,
      removed,
    };

    this.calculateItemsNewSelectionState(args);

    args.newSelection = Array.from(this.itemsToBeSelected);

    // retrieve items/parents/children which has been added/removed from the selection
    this.populateAddRemoveArgs(args);

    const allowed = this.tree.emitEvent('igcTreeItemSelectionEvent', {
      detail: args,
      cancelable: true,
    });

    if (!allowed) {
      return;
    }

    // if args.newSelection hasn't been modified
    if (
      this.areEqualCollections(
        Array.from(this.itemsToBeSelected),
        args.newSelection
      )
    ) {
      this.itemSelection = new Set<IgcTreeItemComponent>(
        this.itemsToBeSelected
      );
      this.indeterminateItems = new Set(this.itemsToBeIndeterminate);
      this.emitSelectedChangeEvent(currSelection, oldIndeterminate);
    } else {
      // select the items within the modified args.newSelection with no event
      this.cascadeSelectItemsWithNoEvent(args.newSelection, true);
    }
  }

  /**
   * recursively handle the selection state of the direct and indirect parents
   */
  private handleParentSelectionState(item: IgcTreeItemComponent) {
    if (!item) {
      return;
    }
    this.handleItemSelectionState(item);
    if (item.parentItem) {
      this.handleParentSelectionState(item.parentItem);
    }
  }

  /**
   * Handle the selection state of a given item based the selection states of its direct children
   */
  private handleItemSelectionState(item: IgcTreeItemComponent) {
    const itemsArray = item && item.directChildren ? item.directChildren : [];
    if (itemsArray.length) {
      if (
        itemsArray.every((n: IgcTreeItemComponent) =>
          this.itemsToBeSelected.has(n)
        )
      ) {
        this.itemsToBeSelected.add(item);
        this.itemsToBeIndeterminate.delete(item);
      } else if (
        itemsArray.some(
          (n: IgcTreeItemComponent) =>
            this.itemsToBeSelected.has(n) || this.itemsToBeIndeterminate.has(n)
        )
      ) {
        this.itemsToBeIndeterminate.add(item);
        this.itemsToBeSelected.delete(item);
      } else {
        this.itemsToBeIndeterminate.delete(item);
        this.itemsToBeSelected.delete(item);
      }
    } else {
      // if the children of the item has been deleted and the item was selected do not change its state
      if (this.isItemSelected(item)) {
        this.itemsToBeSelected.add(item);
      } else {
        this.itemsToBeSelected.delete(item);
      }
      this.itemsToBeIndeterminate.delete(item);
    }
  }

  /**
   * Get a collection of all items affected by the change event
   *
   * @param nodesToBeProcessed set of the items to be selected/deselected
   * @returns a collection of all affected items and all their parents
   */
  private getCascadingItemCollection(
    items: IgcTreeItemComponent[]
  ): CascadeSelectionItemCollection {
    const collection: CascadeSelectionItemCollection = {
      parents: new Set<IgcTreeItemComponent>(),
      items: new Set<IgcTreeItemComponent>(items),
    };

    Array.from(collection.items).forEach((item) => {
      const itemAndAllChildren = item.allChildren || [];
      itemAndAllChildren.forEach((i: IgcTreeItemComponent) => {
        collection.items.add(i);
      });

      if (item && item.parentItem) {
        collection.parents.add(item.parentItem);
      }
    });
    return collection;
  }

  /**
   * retrieve the items which should be added/removed to/from the old selection
   */
  private populateAddRemoveArgs(
    args: Partial<IgcTreeItemSelectionEventDetails>
  ): void {
    args.removed = args.oldSelection!.filter(
      (x) => args.newSelection!.indexOf(x) < 0
    );
    args.added = args.newSelection!.filter(
      (x) => args.oldSelection!.indexOf(x) < 0
    );
  }

  /** Emits the `selectedChange` event for each item affected by the selection */
  private emitSelectedChangeEvent(
    oldSelection: IgcTreeItemComponent[],
    oldIndeterminate?: IgcTreeItemComponent[]
  ): void {
    this.getSelectedItems().forEach((n: IgcTreeItemComponent) => {
      if (oldSelection.indexOf(n) < 0) {
        n.requestUpdate();
        // n.selectedChange.emit(true);
      }
    });

    oldSelection.forEach((n) => {
      if (!this.itemSelection.has(n)) {
        n.requestUpdate();
        // n.selectedChange.emit(false);
      }
    });

    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.indeterminateItems.forEach((n: IgcTreeItemComponent) => {
        if (oldIndeterminate && oldIndeterminate?.indexOf(n) < 0) {
          n.requestUpdate();
          // n.selectedChange.emit(true);
        }
      });

      oldIndeterminate?.forEach((n) => {
        if (!this.indeterminateItems.has(n)) {
          n.requestUpdate();
          // n.selectedChange.emit(false);
        }
      });
    }
  }
}
