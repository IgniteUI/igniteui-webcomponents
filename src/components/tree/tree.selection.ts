import { isEmpty, lastOf } from '#internals/utils/arrays.js';
import type IgcTreeItemComponent from './tree-item.js';
import type { TreeSelectionEventInit } from './tree.common.js';
import type IgcTreeComponent from './tree.js';

type ItemSet = Set<IgcTreeItemComponent>;

/**
 * The sets that one cascade update builds. The helpers pass them explicitly,
 * not as service fields, so half-built state is never visible.
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

  /** Parents of newly connected items, reconciled in {@link _flush}. */
  private readonly _pendingParents: ItemSet = new Set();

  constructor(tree: IgcTreeComponent) {
    this._tree = tree;
  }

  private get _isCascade(): boolean {
    return this._tree.selection === 'cascade';
  }

  //#region Public API

  /** Select range from last selected item to the current specified item. */
  public selectMultipleItems(item: IgcTreeItemComponent): void {
    this._flush();
    if (isEmpty(this._itemSelection)) {
      this.selectItem(item);
      return;
    }

    const items = this._tree.items;
    const selected = Array.from(this._itemSelection);
    const lastSelectedIndex = items.indexOf(lastOf(selected));
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
    this._flush();
    if (this._tree.selection === 'none') {
      return;
    }
    this._emitSelectionEvent([...this._itemSelection, item], [item], []);
  }

  /** Deselect the specified item and emit event. */
  public deselectItem(item: IgcTreeItemComponent): void {
    this._flush();
    const newSelection = Array.from(this._itemSelection).filter(
      (i) => i !== item
    );
    this._emitSelectionEvent(newSelection, [], [item]);
  }

  /** Clears item selection */
  public clearItemsSelection(): void {
    this._flush();
    const oldSelection = Array.from(this._itemSelection);
    const oldIndeterminate = Array.from(this._indeterminateItems);

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
    this._flush();
    return this._itemSelection.has(item);
  }

  public isItemIndeterminate(item: IgcTreeItemComponent): boolean {
    this._flush();
    return this._indeterminateItems.has(item);
  }

  /** Called on the item's `disconnectedCallback`. */
  public ensureStateOnItemDelete(item: IgcTreeItemComponent): void {
    this._flush();
    // The top item of a removed subtree disconnects first and covers the
    // subtree, so a detached parent means an ancestor handles this removal.
    if (item.parent && !item.parent.isConnected) {
      return;
    }

    if (isEmpty(this._itemSelection) && isEmpty(this._indeterminateItems)) {
      return;
    }

    // Deleted items keep their own state for a move. Only their parents update.
    this.deselectItemsWithNoEvent(
      [item, ...item.getChildren({ flatten: true })],
      true
    );
  }

  /**
   * Applies the selection state of an item connected after the first render.
   * In cascade mode, its ancestors reconcile once per microtask.
   */
  public retriggerItemState(item: IgcTreeItemComponent): void {
    const selected = item.selected;

    if (
      !selected &&
      isEmpty(this._itemSelection) &&
      isEmpty(this._indeterminateItems)
    ) {
      // Nothing is selected, so neither the item nor its ancestors change.
      return;
    }

    if (!this._isCascade) {
      // The item already shows its state, and no other item depends on it.
      this._flush();
      selected
        ? this._itemSelection.add(item)
        : this._itemSelection.delete(item);
      return;
    }

    // Start from the opposite state, so that the change reflects.
    selected ? this._itemSelection.delete(item) : this._itemSelection.add(item);
    this._applyCascade((state) => this._setSubtreeState(state, item, selected));

    if (item.parent) {
      if (isEmpty(this._pendingParents)) {
        queueMicrotask(() => this._flush());
      }
      this._pendingParents.add(item.parent);
    }
  }

  /** Select specified items. No event is emitted. */
  public selectItemsWithNoEvent(items: IgcTreeItemComponent[]): void {
    this._flush();

    if (this._isCascade) {
      const added = items.filter((item) => !this._itemSelection.has(item));
      this._applyCascade((state) => this._cascadeInto(state, added, true));
      return;
    }

    const oldSelection = Array.from(this._itemSelection);

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
    this._flush();
    // On delete the removed items keep their own state, so they are excluded
    // from the "before" snapshots and never get their flags cleared.
    const excluded = onDelete ? items : undefined;

    if (this._isCascade) {
      this._applyCascade((state) => {
        if (items) {
          this._cascadeInto(state, items, false);
        } else {
          state.selected.clear();
          state.indeterminate.clear();
        }
      }, excluded);
      return;
    }

    const oldSelection = this._excluding(this._itemSelection, excluded);

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
    const currSelection = Array.from(this._itemSelection);

    if (this._sameSelection(currSelection, newSelection)) {
      return;
    }

    if (!this._isCascade) {
      if (this._confirmSelection(newSelection)) {
        this._itemSelection = new Set(newSelection);
        this._updateItemsState(currSelection);
      }
      return;
    }

    this._applyCascade((state) => {
      this._cascadeInto(state, removed, false);
      this._cascadeInto(state, added, true);
      return this._confirmSelection(Array.from(state.selected));
    });
  }

  /** Emits `igcSelection` and returns whether to apply `newSelection`. */
  private _confirmSelection(newSelection: IgcTreeItemComponent[]): boolean {
    const args: TreeSelectionEventInit = {
      detail: { newSelection },
      cancelable: true,
    };

    // An overwritten `newSelection` (Blazor) does not apply.
    return (
      this._tree.emitEvent('igcSelection', args) &&
      this._sameSelection(newSelection, args.detail.newSelection)
    );
  }

  //#endregion

  //#region Cascade selection

  /**
   * Applies `selected` to each item and its descendants, then reconciles ancestors.
   * Disabled items cascade and count towards a parent's state like enabled ones.
   */
  private _cascadeInto(
    state: CascadeState,
    items: IgcTreeItemComponent[],
    selected: boolean
  ): void {
    const covered = new Set(items);
    const parents: ItemSet = new Set();

    for (const item of items) {
      // The subtree of a covered parent includes the item.
      if (item.parent && covered.has(item.parent)) {
        continue;
      }

      this._setSubtreeState(state, item, selected);

      if (item.parent) {
        parents.add(item.parent);
      }
    }

    for (const parent of parents) {
      this._updateAncestors(state, parent);
    }
  }

  /** Applies `selected` to `item` and its descendants. */
  private _setSubtreeState(
    state: CascadeState,
    item: IgcTreeItemComponent,
    selected: boolean
  ): void {
    this._setItemState(state, item, selected);

    for (const child of item.getChildren({ flatten: true })) {
      this._setItemState(state, child, selected);
    }
  }

  /** Reconciles the ancestors that {@link retriggerItemState} queued. */
  private _flush(): void {
    if (isEmpty(this._pendingParents)) {
      return;
    }

    const parents = Array.from(this._pendingParents).filter(
      (parent) => parent.isConnected && parent.tree === this._tree
    );
    this._pendingParents.clear();

    this._applyCascade((state) => {
      for (const parent of parents) {
        this._updateAncestors(state, parent);
      }
    });
  }

  /**
   * Runs `change` on a copy of the cascade state, then commits and reflects it,
   * unless `change` returns `false`. The `excluded` items keep their own flags.
   */
  private _applyCascade(
    change: (state: CascadeState) => boolean | void,
    excluded?: IgcTreeItemComponent[]
  ): void {
    const oldSelection = this._excluding(this._itemSelection, excluded);
    const oldIndeterminate = this._excluding(
      this._indeterminateItems,
      excluded
    );
    const state: CascadeState = {
      selected: new Set(this._itemSelection),
      indeterminate: new Set(this._indeterminateItems),
    };

    if (change(state) !== false) {
      this._commit(state);
      this._updateItemsState(oldSelection, oldIndeterminate);
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
    select ? state.selected.add(item) : state.selected.delete(item);
    indeterminate
      ? state.indeterminate.add(item)
      : state.indeterminate.delete(item);
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

  /** Snapshot of `source` without any of `excluded`. */
  private _excluding(
    source: ItemSet,
    excluded?: IgcTreeItemComponent[]
  ): IgcTreeItemComponent[] {
    const items = Array.from(source);

    if (!excluded) {
      return items;
    }

    const skip = new Set(excluded);
    return items.filter((item) => !skip.has(item));
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
