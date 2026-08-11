import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  ctrlKey,
  endKey,
  enterKey,
  homeKey,
  shiftKey,
  spaceBar,
} from '../../internals/controllers/key-bindings.js';
import { isLTR, scrollIntoView } from '../../internals/utils/dom.js';
import type IgcTreeComponent from './tree.js';
import type { IgcTreeSelectionService } from './tree.selection.js';
import type IgcTreeItemComponent from './tree-item.js';

/**
 * Handles roving-tabindex keyboard navigation and active/focused item tracking
 * for the tree.
 *
 * The navigable set is never cached. It is derived on demand, only on an actual
 * keypress, by a lazy walk that prunes collapsed branches — so no work happens
 * on item mount/expand/disable, and callers needing a single item stop as soon
 * as they have it.
 *
 * @hidden @internal
 */
export class IgcTreeNavigationService {
  private _focusedItem: IgcTreeItemComponent | null = null;
  private _activeItem: IgcTreeItemComponent | null = null;

  constructor(
    private readonly tree: IgcTreeComponent,
    private readonly selection: IgcTreeSelectionService
  ) {
    addKeybindings(tree, {
      bindingDefaults: { preventDefault: true, repeat: true },
    })
      .set(homeKey, () => this.setFocusedAndActiveItem(this._firstNavigable()))
      .set(endKey, () => this.setFocusedAndActiveItem(this._lastNavigable()))
      .set(arrowLeft, this._arrowLeft)
      .set(arrowRight, this._arrowRight)
      .set(arrowUp, () => this._arrowVertical(-1, true))
      .set(arrowDown, () => this._arrowVertical(1, true))
      .set([ctrlKey, arrowUp], () => this._arrowVertical(-1, false))
      .set([ctrlKey, arrowDown], () => this._arrowVertical(1, false))
      .set('*', this._asterisk)
      .set(spaceBar, () => this._space(false))
      .set([shiftKey, spaceBar], () => this._space(true))
      .set(enterKey, this._enter, { preventDefault: false });
  }

  public get focusedItem(): IgcTreeItemComponent | null {
    return this._focusedItem;
  }

  public get activeItem(): IgcTreeItemComponent | null {
    return this._activeItem;
  }

  public focusItem(
    value: IgcTreeItemComponent | null,
    shouldFocus = true
  ): void {
    if (this._focusedItem === value) {
      return;
    }

    this._focusedItem?.removeAttribute('tabindex');
    this._focusedItem = value;

    if (this._focusedItem && shouldFocus) {
      this._focusedItem.tabIndex = 0;
      this._focusedItem.focus({ preventScroll: true });
      scrollIntoView(this._focusedItem.wrapper);
    }
  }

  public setActiveItem(
    value: IgcTreeItemComponent | null,
    shouldEmit = true
  ): void {
    if (this._activeItem === value) {
      return;
    }

    if (this._activeItem) {
      this._activeItem.active = false;
    }

    this._activeItem = value;

    if (this._activeItem) {
      this._activeItem.active = true;
      if (shouldEmit) {
        this.tree.emitEvent('igcActiveItem', { detail: this._activeItem });
      }
    }
  }

  /** Sets the item as focused (and optionally active). */
  public setFocusedAndActiveItem(
    item: IgcTreeItemComponent | undefined,
    isActive = true,
    shouldFocus = true
  ): void {
    if (!item) {
      return;
    }
    if (isActive) {
      this.setActiveItem(item);
    }
    this.focusItem(item, shouldFocus);
  }

  /** Called by a tree item on `disconnectedCallback`. */
  public handleItemDisconnect(item: IgcTreeItemComponent): void {
    if (this._activeItem === item) {
      this.setActiveItem(null);
    }
    if (this._focusedItem === item) {
      this.focusItem(null, false);
      const next = this.tree.items.find((i) => !i.disabled);
      if (next) {
        next.tabIndex = 0;
        this.focusItem(next, false);
      }
    }
  }

  //#region Visible/navigable item resolution (computed on demand, not cached)

  /**
   * Yields the keyboard-navigable items in document order.
   *
   * A disabled item is skipped but does not hide its subtree: only a
   * *collapsed* ancestor removes descendants from the navigable set.
   */
  private *_navigable(
    items: IgcTreeItemComponent[] = this.tree._rootItems
  ): Generator<IgcTreeItemComponent, undefined> {
    for (const item of items) {
      if (!item.disabled) {
        yield item;
      }
      if (item.expanded) {
        yield* this._navigable(item.getChildren());
      }
    }
  }

  private _firstNavigable(): IgcTreeItemComponent | undefined {
    return this._navigable().next().value;
  }

  private _lastNavigable(): IgcTreeItemComponent | undefined {
    let last: IgcTreeItemComponent | undefined;
    for (const item of this._navigable()) {
      last = item;
    }
    return last;
  }

  /**
   * Next/previous navigable item relative to `item`, or `item` itself if there
   * isn't one.
   */
  private _adjacent(
    item: IgcTreeItemComponent,
    dir: 1 | -1
  ): IgcTreeItemComponent {
    const items = this._navigable();
    let first: IgcTreeItemComponent | undefined;
    let previous: IgcTreeItemComponent | undefined;

    for (const current of items) {
      first ??= current;

      if (current === item) {
        if (dir === -1) {
          return previous ?? item;
        }
        const next = items.next();
        return next.done ? item : next.value;
      }
      previous = current;
    }

    // `item` is not navigable itself - it can be focused while an ancestor is
    // collapsed out from under it. Going forward that lands on the first
    // navigable item; going backwards it stays put.
    return (dir === 1 ? first : undefined) ?? item;
  }

  //#endregion

  //#region Keyboard handlers

  private readonly _arrowLeft = (): void => {
    isLTR(this.tree)
      ? this._collapseOrGoToParent()
      : this._expandOrGoToFirstChild();
  };

  private readonly _arrowRight = (): void => {
    isLTR(this.tree)
      ? this._expandOrGoToFirstChild()
      : this._collapseOrGoToParent();
  };

  private _collapseOrGoToParent(): void {
    const item = this._focusedItem;
    if (!item) {
      return;
    }
    if (item.expanded && item.getChildren().length) {
      this.setActiveItem(item);
      item.collapseWithEvent();
      return;
    }
    if (item.parent && !item.parent.disabled) {
      this.setFocusedAndActiveItem(item.parent);
    }
  }

  private _expandOrGoToFirstChild(): void {
    const item = this._focusedItem;
    if (!item || item.getChildren().length === 0) {
      return;
    }
    if (!item.expanded) {
      this.setActiveItem(item);
      item.expandWithEvent();
      return;
    }
    const firstChild = item.getChildren().find((child) => !child.disabled);
    if (firstChild) {
      this.setFocusedAndActiveItem(firstChild);
    }
  }

  private _arrowVertical(dir: 1 | -1, shouldActivate: boolean): void {
    const item = this._focusedItem;
    if (!item) {
      return;
    }
    const next = this._adjacent(item, dir);
    if (next === item) {
      return;
    }
    this.setFocusedAndActiveItem(next, shouldActivate);
  }

  private readonly _asterisk = (): void => {
    const item = this._focusedItem;
    if (!item) {
      return;
    }
    const siblings = item.parent
      ? item.parent.getChildren()
      : this.tree._rootItems;

    for (const sibling of siblings) {
      if (!sibling.disabled && !sibling.expanded && sibling.hasChildren) {
        sibling.expandWithEvent();
      }
    }
  };

  private _space(shiftKey: boolean): void {
    const item = this._focusedItem;
    if (!item) {
      return;
    }

    this.setActiveItem(item);

    if (this.tree.selection === 'none') {
      return;
    }

    if (shiftKey) {
      this.selection.selectMultipleItems(item);
      return;
    }

    item.selected
      ? this.selection.deselectItem(item)
      : this.selection.selectItem(item);
  }

  private readonly _enter = (): void => {
    if (this._focusedItem) {
      this.setActiveItem(this._focusedItem);
    }
  };

  //#endregion
}
