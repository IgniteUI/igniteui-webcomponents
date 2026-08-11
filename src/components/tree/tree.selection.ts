import { isEmpty } from '../common/util.js';
import type { TreeSelectionEventInit } from './tree.common.js';
import type IgcTreeComponent from './tree.js';
import type IgcTreeItemComponent from './tree-item.js';

type ItemSet = Set<IgcTreeItemComponent>;

/**
 * The sets being built up during a single cascade update. Passed explicitly
 * between the cascade helpers rather than kept as scratch fields on the service,
 * so no half-built state is observable outside the update that produced it.
 */
type CascadeState = {
  selected: ItemSet;
  indeterminate: ItemSet;
};

/* blazorSuppress */
export class IgcTreeSelectionService {
  private readonly _tree: IgcTreeComponent;

  private _itemSelection: ItemSet = new Set();
  private _indeterminateItems: ItemSet = new Set();

  constructor(tree: IgcTreeComponent) {
    this._tree = tree;
  }

  private get _isCascade(): boolean {
    return this._tree.selection === 'cascade';
  }

  //#region Public API

  /** Select range from last selected item to the current specified item. */
  public selectMultipleItems(item: IgcTreeItemComponent): void {
    if (isEmpty(this._itemSelection)) {
      this.selectItem(item);
      return;
    }

    const items = this._tree.items;
    const selected = this._selectedSnapshot();
    const lastSelectedIndex = items.indexOf(selected[selected.length - 1]);
    const currentIndex = items.indexOf(item);

    const range = items.slice(
      Math.min(currentIndex, lastSelectedIndex),
      Math.max(currentIndex, lastSelectedIndex) + 1
    );
    const added = range.filter((i) => !this.isItemSelected(i));

    this._emitSelectionEvent(selected.concat(added), added, []);
  }

  /** Select the specified item and emit event. */
  public selectItem(item: IgcTreeItemComponent): void {
    if (this._tree.selection === 'none') {
      return;
    }
    this._emitSelectionEvent([...this._itemSelection, item], [item], []);
  }

  /** Deselect the specified item and emit event. */
  public deselectItem(item: IgcTreeItemComponent): void {
    const newSelection = this._selectedSnapshot().filter((i) => i !== item);
    this._emitSelectionEvent(newSelection, [], [item]);
  }

  /** Clears item selection */
  public clearItemsSelection(): void {
    const oldSelection = this._selectedSnapshot();
    const oldIndeterminate = this._indeterminateSnapshot();

    this._itemSelection.clear();
    this._indeterminateItems.clear();

    for (const item of oldSelection) {
      item.selected = false;
    }
    for (const item of oldIndeterminate) {
      item.indeterminate = false;
    }
  }

  public isItemSelected(item: IgcTreeItemComponent): boolean {
    return this._itemSelection.has(item);
  }

  public isItemIndeterminate(item: IgcTreeItemComponent): boolean {
    return this._indeterminateItems.has(item);
  }

  /** Called on item`s disconnectedCallback */
  public ensureStateOnItemDelete(item: IgcTreeItemComponent): void {
    // Removing a subtree fires `disconnectedCallback` for the topmost item
    // first and then for every descendant. That first call already covers the
    // whole subtree below it, so a detached parent means an ancestor is
    // handling this removal and repeating the work here would be redundant.
    if (item.parent && !item.parent.isConnected) {
      return;
    }

    // Nothing to reconcile if no item is in a selected or indeterminate state.
    if (isEmpty(this._itemSelection) && isEmpty(this._indeterminateItems)) {
      return;
    }

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
      this._itemSelection.delete(item);
      this.selectItemsWithNoEvent([item]);
    } else {
      this._itemSelection.add(item);
      this.deselectItemsWithNoEvent([item]);
    }
  }

  /** Select specified items. No event is emitted. */
  public selectItemsWithNoEvent(items: IgcTreeItemComponent[]): void {
    const oldSelection = this._selectedSnapshot();

    if (this._isCascade) {
      this._cascadeSelectWithNoEvent(items, oldSelection);
      return;
    }

    for (const item of items) {
      this._itemSelection.add(item);
    }

    this._updateItemsState(oldSelection);
  }

  /** Deselect specified items. No event is emitted. */
  public deselectItemsWithNoEvent(
    items?: IgcTreeItemComponent[],
    onDelete = false
  ): void {
    if (this._isCascade) {
      this._cascadeDeselectWithNoEvent(items, onDelete);
      return;
    }

    // On delete the removed items keep their own state, so they are excluded
    // from the "before" snapshot and never get their `selected` flag cleared.
    const oldSelection = onDelete
      ? this._excluding(this._itemSelection, items)
      : this._selectedSnapshot();

    if (items) {
      for (const item of items) {
        this._itemSelection.delete(item);
      }
    } else {
      this._itemSelection.clear();
    }

    this._updateItemsState(oldSelection);
  }

  //#endregion

  //#region Selection events

  private _emitSelectionEvent(
    newSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const currSelection = this._selectedSnapshot();

    if (this._sameSelection(currSelection, newSelection)) {
      return;
    }

    if (this._isCascade) {
      this._emitCascadeSelectionEvent(currSelection, added, removed);
      return;
    }

    const args: TreeSelectionEventInit = {
      detail: { newSelection },
      cancelable: true,
    };

    if (!this._tree.emitEvent('igcSelection', args)) {
      return;
    }

    // if newSelection is overwritten do not proceed (Blazor)
    if (this._sameSelection(newSelection, args.detail.newSelection)) {
      this._itemSelection = new Set(newSelection);
      this._updateItemsState(currSelection);
    }
  }

  private _emitCascadeSelectionEvent(
    currSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): void {
    const oldIndeterminate = this._indeterminateSnapshot();
    const state = this._calculateCascadeState(currSelection, added, removed);
    const newSelection = Array.from(state.selected);

    const args: TreeSelectionEventInit = {
      detail: { newSelection },
      cancelable: true,
    };

    if (!this._tree.emitEvent('igcSelection', args)) {
      return;
    }

    // if newSelection is overwritten do not proceed (Blazor)
    if (this._sameSelection(newSelection, args.detail.newSelection)) {
      this._commit(state);
      this._updateItemsState(currSelection, oldIndeterminate);
    }
  }

  //#endregion

  //#region Cascade selection

  private _cascadeSelectWithNoEvent(
    items: IgcTreeItemComponent[],
    oldSelection: IgcTreeItemComponent[]
  ): void {
    const oldIndeterminate = this._indeterminateSnapshot();
    const newSelection = [...oldSelection, ...items];

    // retrieve only the rows without their parents/children which has to be added to the selection
    const newSelectionSet = new Set(newSelection);
    const removed = oldSelection.filter((i) => !newSelectionSet.has(i));
    const added = newSelection.filter((i) => !this._itemSelection.has(i));

    this._commit(this._calculateCascadeState(oldSelection, added, removed));
    this._updateItemsState(oldSelection, oldIndeterminate);
  }

  private _cascadeDeselectWithNoEvent(
    items?: IgcTreeItemComponent[],
    onDelete = false
  ): void {
    const oldSelection = onDelete
      ? this._excluding(this._itemSelection, items)
      : this._selectedSnapshot();
    const oldIndeterminate = onDelete
      ? this._excluding(this._indeterminateItems, items)
      : this._indeterminateSnapshot();

    if (items) {
      this._commit(this._calculateCascadeState(oldSelection, [], items));
    } else {
      this._itemSelection.clear();
      this._indeterminateItems.clear();
    }

    this._updateItemsState(oldSelection, oldIndeterminate);
  }

  /**
   * The sets resulting from applying `added` and `removed` on top of
   * `oldSelection`.
   *
   * Disabled items cascade exactly like enabled ones: selected and deselected
   * with their ancestors, and counted towards a parent's state.
   */
  private _calculateCascadeState(
    oldSelection: IgcTreeItemComponent[],
    added: IgcTreeItemComponent[],
    removed: IgcTreeItemComponent[]
  ): CascadeState {
    const state: CascadeState = {
      selected: new Set(oldSelection),
      indeterminate: new Set(this._indeterminateItems),
    };

    this._cascadeInto(state, removed, false);
    this._cascadeInto(state, added, true);

    return state;
  }

  /** Applies `selected` to each item and its descendants, then reconciles ancestors. */
  private _cascadeInto(
    state: CascadeState,
    items: IgcTreeItemComponent[] | undefined,
    selected: boolean
  ): void {
    if (!items || isEmpty(items)) {
      return;
    }

    const parents: ItemSet = new Set();

    for (const item of items) {
      this._setItemState(state, item, selected);

      for (const child of item.getChildren({ flatten: true })) {
        this._setItemState(state, child, selected);
      }

      if (item.parent) {
        parents.add(item.parent);
      }
    }

    for (const parent of parents) {
      this._updateAncestors(state, parent);
    }
  }

  /** Reconciles `item` and every ancestor above it against their children. */
  private _updateAncestors(
    state: CascadeState,
    item: IgcTreeItemComponent
  ): void {
    for (
      let current: IgcTreeItemComponent | null = item;
      current;
      current = current.parent
    ) {
      this._applyItemState(state, current);
    }
  }

  /** Derives an item's state from the states of its direct children. */
  private _applyItemState(
    state: CascadeState,
    item: IgcTreeItemComponent
  ): void {
    const children = item.getChildren();

    if (isEmpty(children)) {
      // An item whose children were deleted keeps whatever state it had.
      this._setItemState(state, item, this.isItemSelected(item));
      return;
    }

    if (children.every((child) => state.selected.has(child))) {
      this._setItemState(state, item, true);
    } else if (
      children.some(
        (child) => state.selected.has(child) || state.indeterminate.has(child)
      )
    ) {
      this._setItemState(state, item, false, true);
    } else {
      this._setItemState(state, item, false);
    }
  }

  private _setItemState(
    state: CascadeState,
    item: IgcTreeItemComponent,
    select: boolean,
    indeterminate = false
  ): void {
    if (indeterminate) {
      state.indeterminate.add(item);
      state.selected.delete(item);
      return;
    }

    if (select) {
      state.selected.add(item);
      state.indeterminate.delete(item);
    } else {
      state.selected.delete(item);
      state.indeterminate.delete(item);
    }
  }

  private _commit(state: CascadeState): void {
    this._itemSelection = state.selected;
    this._indeterminateItems = state.indeterminate;
  }

  //#endregion

  //#region Internal helpers

  /** Reflects the computed selection onto the affected items. */
  private _updateItemsState(
    oldSelection: IgcTreeItemComponent[],
    oldIndeterminate: IgcTreeItemComponent[] = []
  ): void {
    this._reflect(this._itemSelection, oldSelection, (item, value) => {
      item.selected = value;
    });

    if (this._isCascade) {
      this._reflect(
        this._indeterminateItems,
        oldIndeterminate,
        (item, value) => {
          item.indeterminate = value;
        }
      );
    }
  }

  /** Applies the transition from `previous` to `current` to the items that moved. */
  private _reflect(
    current: ItemSet,
    previous: IgcTreeItemComponent[],
    apply: (item: IgcTreeItemComponent, value: boolean) => void
  ): void {
    const before = new Set(previous);

    for (const item of current) {
      if (!before.has(item)) {
        apply(item, true);
      }
    }
    for (const item of previous) {
      if (!current.has(item)) {
        apply(item, false);
      }
    }
  }

  private _selectedSnapshot(): IgcTreeItemComponent[] {
    return Array.from(this._itemSelection);
  }

  private _indeterminateSnapshot(): IgcTreeItemComponent[] {
    return Array.from(this._indeterminateItems);
  }

  /** Snapshot of `source` without any of `excluded`. */
  private _excluding(
    source: ItemSet,
    excluded?: IgcTreeItemComponent[]
  ): IgcTreeItemComponent[] {
    const skip = new Set(excluded);
    const result: IgcTreeItemComponent[] = [];

    for (const item of source) {
      if (!skip.has(item)) {
        result.push(item);
      }
    }

    return result;
  }

  private _sameSelection(
    first: IgcTreeItemComponent[],
    second: IgcTreeItemComponent[]
  ): boolean {
    if (first.length !== second.length) {
      return false;
    }
    const set = new Set(first);
    return second.every((item) => set.has(item));
  }

  //#endregion
}
