import IgcTreeComponent from './tree';
import IgcTreeItemComponent from './tree-item';
import { IgcTreeSelectionType } from './tree.common';
import { IgcTreeSelectionService } from './tree.selection';

export const NAVIGATION_KEYS = new Set([
  'down',
  'up',
  'left',
  'right',
  'arrowdown',
  'arrowup',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'space',
  'spacebar',
  ' ',
]);

export class IgcTreeNavigationService {
  private tree!: IgcTreeComponent;
  private selectionService!: IgcTreeSelectionService;

  private _focusedItem: IgcTreeItemComponent | null = null;

  private _lastFocusedItem: IgcTreeItemComponent | null = null;
  private _activeItem: IgcTreeItemComponent | null = null;

  private _visibleChildren: IgcTreeItemComponent[] = [];
  private _invisibleChildren: Set<IgcTreeItemComponent> = new Set();
  private _disabledChildren: Set<IgcTreeItemComponent> = new Set();

  constructor(
    tree: IgcTreeComponent,
    selectionService: IgcTreeSelectionService
  ) {
    this.tree = tree;
    this.selectionService = selectionService;
    this.updateVisChild();
  }

  public updateVisChild(): void {
    this._visibleChildren = this.tree?.items
      ? this.tree.items.filter(
          (e) =>
            !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))
        )
      : [];
  }

  public get focusedItem(): IgcTreeItemComponent | null {
    return this._focusedItem;
  }

  public focusItem(value: IgcTreeItemComponent | null, shouldFocus = true) {
    if (this._focusedItem === value) {
      return;
    }
    this._lastFocusedItem = this._focusedItem;
    if (this._lastFocusedItem) {
      this._lastFocusedItem.removeAttribute('tabindex');
    }
    this._focusedItem = value;
    if (this._focusedItem !== null) {
      this._focusedItem.tabIndex = 0;
      if (shouldFocus) {
        this._focusedItem.focus();
      }
    }
    this._lastFocusedItem?.requestUpdate();
    this._focusedItem?.requestUpdate();
  }

  public get activeItem(): IgcTreeItemComponent | null {
    return this._activeItem;
  }

  public set activeItem(value: IgcTreeItemComponent | null) {
    if (this._activeItem === value) {
      return;
    }
    if (this._activeItem) {
      this._activeItem.active = false;
    }
    this._activeItem = value;
    if (this._activeItem) {
      this._activeItem.active = true;
    }
  }

  public get visibleChildren(): IgcTreeItemComponent[] {
    return this._visibleChildren;
  }

  public update_disabled_cache(item: IgcTreeItemComponent): void {
    if (item.disabled) {
      this._disabledChildren.add(item);
    } else {
      this._disabledChildren.delete(item);
    }
    this.updateVisChild();
  }

  public init_invisible_cache() {
    this.tree.items
      .filter((e) => e.level === 0)
      .forEach((item) => {
        this.update_visible_cache(item, item.expanded, false);
      });
    this.updateVisChild();
  }

  public update_visible_cache(
    item: IgcTreeItemComponent,
    expanded: boolean,
    shouldEmit = true
  ): void {
    if (expanded) {
      item.directChildren?.forEach((child: IgcTreeItemComponent) => {
        this._invisibleChildren.delete(child);
        this.update_visible_cache(child, child.expanded, false);
      });
    } else {
      item.allChildren?.forEach((c: IgcTreeItemComponent) =>
        this._invisibleChildren.add(c)
      );
    }

    if (shouldEmit) {
      this.updateVisChild();
    }
  }

  /**
   * Sets the item as focused (and active)
   *
   * @param item target item
   * @param isActive if true, sets the item as active
   */
  public setFocusedAndActiveItem(
    item: IgcTreeItemComponent,
    isActive = true,
    shouldFocus = true
  ): void {
    if (isActive) {
      this.activeItem = item;
    }
    this.focusItem(item, shouldFocus);
  }

  /** Handler for keydown events. Used in tree.component.ts */
  public handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!this.focusedItem) {
      return;
    }
    if (!(NAVIGATION_KEYS.has(key) || key === '*')) {
      if (key === 'enter') {
        this.activeItem = this.focusedItem;
      }
      return;
    }
    event.preventDefault();
    this.handleNavigation(event);
  }

  private handleNavigation(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'home':
        this.setFocusedAndActiveItem(this.visibleChildren[0]);
        break;
      case 'end':
        this.setFocusedAndActiveItem(
          this.visibleChildren[this.visibleChildren.length - 1]
        );
        break;
      case 'arrowleft':
      case 'left':
        this.handleArrowLeft();
        break;
      case 'arrowright':
      case 'right':
        this.handleArrowRight();
        break;
      case 'arrowup':
      case 'up':
        this.handleUpDownArrow(true, event);
        break;
      case 'arrowdown':
      case 'down':
        this.handleUpDownArrow(false, event);
        break;
      case '*':
        this.handleAsterisk();
        break;
      case ' ':
      case 'spacebar':
      case 'space':
        this.handleSpace(event.shiftKey);
        break;
      default:
        return;
    }
  }

  private handleArrowLeft(): void {
    // if (this.focusedItem.expanded && !this.treeService.collapsingItems.has(this.focusedItem) && this.focusedItem._children?.length) {
    if (this.focusedItem?.expanded && this.focusedItem.directChildren?.length) {
      this.activeItem = this.focusedItem;
      this.focusedItem.collapse();
    } else {
      const parentItem = this.focusedItem?.parentItem;
      if (parentItem && !parentItem.disabled) {
        this.setFocusedAndActiveItem(parentItem);
      }
    }
  }

  private handleArrowRight(): void {
    if (this.focusedItem!.directChildren?.length > 0) {
      if (!this.focusedItem?.expanded) {
        this.activeItem = this.focusedItem;
        this.focusedItem!.expand();
      } else {
        // if (this.treeService.collapsingItems.has(this.focusedItem)) {
        //     this.focusedItem.expand();
        //     return;
        // }
        const firstChild = this.focusedItem.directChildren.find(
          (item: IgcTreeItemComponent) => !item.disabled
        );
        if (firstChild) {
          this.setFocusedAndActiveItem(firstChild);
        }
      }
    }
  }

  private handleUpDownArrow(isUp: boolean, event: KeyboardEvent): void {
    const next = this.getVisibleItem(this.focusedItem!, isUp ? -1 : 1);
    if (next === this.focusedItem) {
      return;
    }

    if (event.ctrlKey) {
      this.setFocusedAndActiveItem(next, false);
    } else {
      this.setFocusedAndActiveItem(next);
    }
  }

  private handleAsterisk(): void {
    const items = this.focusedItem?.parentItem
      ? this.focusedItem!.parentItem?.directChildren
      : this.tree.rootItems;
    items?.forEach((item: IgcTreeItemComponent) => {
      // if (!item.disabled && (!item.expanded || this.treeService.collapsingItems.has(item))) {
      if (!item.disabled && !item.expanded) {
        item.expand();
      }
    });
  }

  private handleSpace(shiftKey = false): void {
    if (this.tree.selection === IgcTreeSelectionType.None) {
      return;
    }

    this.activeItem = this.focusedItem;
    if (shiftKey) {
      this.selectionService.selectMultipleItems(this.focusedItem!);
      return;
    }

    if (this.focusedItem!.selected) {
      this.selectionService.deselectItem(this.focusedItem!);
    } else {
      this.selectionService.selectItem(this.focusedItem!);
    }
  }

  /** Gets the next visible item in the given direction - 1 -> next, -1 -> previous */
  private getVisibleItem(
    item: IgcTreeItemComponent,
    dir: 1 | -1 = 1
  ): IgcTreeItemComponent {
    const itemIndex = this.visibleChildren.indexOf(item);
    return this.visibleChildren[itemIndex + dir] || item;
  }
}
