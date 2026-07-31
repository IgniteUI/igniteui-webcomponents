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
} from '../common/controllers/key-bindings.js';
import { isLTR, scrollIntoView } from '../common/util.js';
import type IgcTreeComponent from './tree.js';
import type { IgcTreeSelectionService } from './tree.selection.js';
import type IgcTreeItemComponent from './tree-item.js';

/**
 * Handles roving-tabindex keyboard navigation and active/focused item tracking for the tree.
 *
 * Unlike the previous implementation, "visible" (keyboard-navigable) items are **not** cached.
 * They are derived on demand, only when a navigation key is actually pressed, directly from each
 * item's live `expanded`/`disabled`/`parent` state. This avoids doing any work on every single
 * item mount/expand/disable — the dominant cost in trees with many items — since navigation only
 * needs to know the visible set at the moment of a keypress, not continuously.
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
      .set(homeKey, () => this.setFocusedAndActiveItem(this._navigable[0]))
      .set(endKey, () => this.setFocusedAndActiveItem(this._lastVisible()))
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
      this._scrollIntoView(this._focusedItem);
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

  private _isNavigable(item: IgcTreeItemComponent): boolean {
    if (item.disabled) {
      return false;
    }
    for (let ancestor = item.parent; ancestor; ancestor = ancestor.parent) {
      if (!ancestor.expanded) {
        return false;
      }
    }
    return true;
  }

  private get _navigable(): IgcTreeItemComponent[] {
    return this.tree.items.filter((item) => this._isNavigable(item));
  }

  private _lastVisible(): IgcTreeItemComponent {
    const items = this._navigable;
    return items[items.length - 1];
  }

  /** Next/previous navigable item relative to `item`, or `item` itself if there isn't one. */
  private _adjacent(
    item: IgcTreeItemComponent,
    dir: 1 | -1
  ): IgcTreeItemComponent {
    const items = this._navigable;
    const index = items.indexOf(item);
    return items[index + dir] ?? item;
  }

  private _scrollIntoView(item: IgcTreeItemComponent): void {
    scrollIntoView(item.wrapper);
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
      : this.tree.items.filter((i) => i.level === 0);

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

    if (this.tree.selection === 'none') {
      this.setActiveItem(item);
      return;
    }

    this.setActiveItem(item);

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
