import IgcTreeComponent from './tree';
import IgcTreeItemComponent from './tree-item';
import {
  IgcTreeItemSelectionEventArgs,
  IgcTreeItemSelectionEventDetails,
  IgcTreeSelectionType,
} from './tree.common';

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

  // OK
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

  // OK
  /** Select the specified item and emit event. */
  public selectItem(item: IgcTreeItemComponent): void {
    if (this.tree.selection === IgcTreeSelectionType.None) {
      return;
    }
    this.emitItemSelectionEvent([...this.getSelectedItems(), item], [item], []);
  }

  // OK
  /** Deselect the specified item and emit event. */
  public deselectItem(item: IgcTreeItemComponent): void {
    const newSelection = this.getSelectedItems().filter((r) => r !== item);
    this.emitItemSelectionEvent(newSelection, [], [item]);
  }

  // OK
  /** Clears item selection */
  public clearItemsSelection(): void {
    this.itemSelection.clear();
    this.indeterminateItems.clear();
  }

  // OK
  public isItemSelected(item: IgcTreeItemComponent): boolean {
    return this.itemSelection.has(item);
  }

  // OK
  public isItemIndeterminate(item: IgcTreeItemComponent): boolean {
    return this.indeterminateItems.has(item);
  }

  /** Called on `item.ngOnDestroy` to ensure state is correct after item is removed */
  public ensureStateOnItemDelete(item: IgcTreeItemComponent): void {
    if (this.tree?.selection !== IgcTreeSelectionType.Cascade) {
      return;
    }
    // requestAnimationFrame(() => {
    if (this.isItemSelected(item)) {
      // item is destroyed, do not emit event // Da ama ne
      this.deselectItemsWithNoEvent([item], true);
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
    // });
  }

  // OK
  private emitItemSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ) {
    const currSelection = this.getSelectedItems();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }

    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.emitCascadeItemSelectionEvent(
        newSelection,
        currSelection,
        added,
        removed
      );
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

  // OK
  /** Select specified items. No event is emitted. */
  public selectItemsWithNoEvent(
    items: IgcTreeItemComponent[],
    clearPrevSelection = false,
    requestUpdate = true
  ): void {
    if (this.tree && this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.cascadeSelectItemsWithNoEvent(
        items,
        clearPrevSelection,
        requestUpdate
      );
      return;
    }

    const oldSelection = this.getSelectedItems();

    if (clearPrevSelection) {
      this.itemSelection.clear();
    }
    items.forEach((item) => this.itemSelection.add(item));

    if (requestUpdate) {
      this.updateItemsState(oldSelection);
    }
  }

  // OK
  /** Deselect specified items. No event is emitted. */
  public deselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    requestUpdate = true
  ): void {
    if (this.tree && this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.cascadeDeselectItemsWithNoEvent(items, requestUpdate);
      return;
    }

    const oldSelection = this.getSelectedItems();

    if (!items) {
      this.itemSelection.clear();
    } else {
      items.forEach((item) => this.itemSelection.delete(item));
    }

    if (requestUpdate) {
      this.updateItemsState(oldSelection);
    }
  }

  // OK
  private emitCascadeItemSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    currSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const oldIndeterminate = this.getIndeterminateItems();

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
      this.updateItemsState(currSelection, oldIndeterminate);
    } else {
      // select the items within the modified args.newSelection with no event
      this.cascadeSelectItemsWithNoEvent(args.newSelection, true);
    }
  }

  // OK
  private cascadeSelectItemsWithNoEvent(
    items: IgcTreeItemComponent[],
    clearPrevSelection = false,
    requestUpdate = true
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

    if (requestUpdate) {
      this.updateItemsState(oldSelection, oldIndeterminate);
    }
  }

  // OK
  private cascadeDeselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    requestUpdate = true
  ): void {
    const oldSelection = this.getSelectedItems();
    const oldIndeterminate = this.getIndeterminateItems();

    if (!items) {
      this.itemSelection.clear();
      this.indeterminateItems.clear();
    } else {
      const args = { added: [], removed: items };
      this.calculateItemsNewSelectionState(args);

      this.itemSelection = new Set<IgcTreeItemComponent>(
        this.itemsToBeSelected
      );
      this.indeterminateItems = new Set<IgcTreeItemComponent>(
        this.itemsToBeIndeterminate
      );
    }

    if (requestUpdate) {
      this.updateItemsState(oldSelection, oldIndeterminate);
    }
  }

  // OK (eventualno setovete)
  /**
   * retrieve the items which should be added/removed to/from the old selection
   */
  private populateAddRemoveArgs(
    args: Partial<IgcTreeItemSelectionEventDetails>
  ): void {
    const newSelectionSet = new Set(args.newSelection);
    const oldSelectionSet = new Set(args.oldSelection);
    args.removed = args.oldSelection!.filter((x) => !newSelectionSet.has(x));
    args.added = args.newSelection!.filter((x) => !oldSelectionSet.has(x));
  }

  // OK (disabled children?)
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

  // OK (disabled children?)
  /** Ensures proper selection state for all predescessors and descendants during a selection event */
  private cascadeSelectionState(
    items: IgcTreeItemComponent[] | undefined,
    selected: boolean
  ): void {
    if (!items || items.length === 0) {
      return;
    }

    const parents = new Set<IgcTreeItemComponent>();
    items.forEach((item) => {
      // select/deselect items passed by event/api
      this.selectDeselectItem(item, selected);

      // select/deselect all of their children
      const itemAndAllChildren = item.allChildren || [];
      itemAndAllChildren.forEach((i: IgcTreeItemComponent) => {
        this.selectDeselectItem(i, selected);
      });

      // add their direct parent to the set
      if (item && item.parentItem) {
        parents.add(item.parentItem);
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
  private handleParentSelectionState(item: IgcTreeItemComponent) {
    if (!item) {
      return;
    }
    this.handleItemSelectionState(item);
    if (item.parentItem) {
      this.handleParentSelectionState(item.parentItem);
    }
  }

  // OK (disabled children?)
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
        this.selectDeselectItem(item, true);
      } else if (
        itemsArray.some(
          (n: IgcTreeItemComponent) =>
            this.itemsToBeSelected.has(n) || this.itemsToBeIndeterminate.has(n)
        )
      ) {
        this.selectDeselectItem(item, false, true);
      } else {
        this.selectDeselectItem(item, false);
      }
    } else {
      // if the children of the item has been deleted and the item was selected do not change its state
      if (this.isItemSelected(item)) {
        this.selectDeselectItem(item, true);
      } else {
        this.selectDeselectItem(item, false);
      }
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
        // i.requestUpdate();
        i.selected = true;
      }
    });

    oldSelection.forEach((i: IgcTreeItemComponent) => {
      if (!this.itemSelection.has(i)) {
        // i.requestUpdate();
        i.selected = false;
      }
    });

    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.indeterminateItems.forEach((i: IgcTreeItemComponent) => {
        if (!indeterminated.has(i)) {
          // i.requestUpdate();
          i.indeterminate = true;
        }
      });

      oldIndeterminate.forEach((i) => {
        if (!this.indeterminateItems.has(i)) {
          // i.requestUpdate();
          i.indeterminate = false;
        }
      });
    }
  }

  // OK
  /** Returns array of the selected items. */
  private getSelectedItems(): IgcTreeItemComponent[] {
    return this.itemSelection.size ? Array.from(this.itemSelection) : [];
  }

  // OK
  /** Returns array of the items in indeterminate state. */
  private getIndeterminateItems(): IgcTreeItemComponent[] {
    return this.indeterminateItems.size
      ? Array.from(this.indeterminateItems)
      : [];
  }

  // OK
  private areEqualCollections(
    first: IgcTreeItemComponent[],
    second: IgcTreeItemComponent[]
  ): boolean {
    return (
      first.length === second.length &&
      new Set(first.concat(second)).size === first.length
    );
  }

  // OK
  private selectDeselectItem(
    item: IgcTreeItemComponent,
    select: boolean,
    indeterminate = false
  ) {
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
}
