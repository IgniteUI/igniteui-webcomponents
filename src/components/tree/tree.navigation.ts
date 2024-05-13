import { isLTR } from '../common/util.js';
import type IgcTreeItemComponent from './tree-item.js';
import type IgcTreeComponent from './tree.js';
import type { IgcTreeSelectionService } from './tree.selection.js';

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

/* blazorSuppress */
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
  }

  public updateVisChild(): void {
    this._visibleChildren = this.tree?.items
      ? this.tree.items.filter(
          (i: IgcTreeItemComponent) =>
            !(this._invisibleChildren.has(i) || this._disabledChildren.has(i))
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
    if (this._focusedItem !== null && shouldFocus) {
      this._focusedItem.tabIndex = 0;
      this._focusedItem.focus({
        preventScroll: true,
      });
      this._focusedItem.wrapper?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }

  public get activeItem(): IgcTreeItemComponent | null {
    return this._activeItem;
  }

  public setActiveItem(value: IgcTreeItemComponent | null, shouldEmit = true) {
    if (this._activeItem === value) {
      return;
    }
    if (this._activeItem && value) {
      this._activeItem.active = false;
    }
    this._activeItem = value;
    if (this._activeItem) {
      this._activeItem.active = true;
    }
    if (shouldEmit && this._activeItem) {
      this.tree.emitEvent('igcActiveItem', { detail: this._activeItem });
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

  public delete_item(item: IgcTreeItemComponent) {
    if (this.activeItem === item) {
      this.setActiveItem(null);
    }
    if (this.focusedItem === item) {
      this.focusItem(null, false);
      const firstNotDisableItem = this.tree.items.find(
        (i: IgcTreeItemComponent) => !i.disabled
      );
      if (firstNotDisableItem) {
        firstNotDisableItem.tabIndex = 0;
        this.focusItem(firstNotDisableItem, false);
      }
    }
  }

  public update_visible_cache(
    item: IgcTreeItemComponent,
    expanded: boolean,
    shouldUpdateNestedChildren = true,
    shouldUpdate = true
  ): void {
    if (expanded && !this._invisibleChildren.has(item)) {
      item.getChildren()?.forEach((child: IgcTreeItemComponent) => {
        this._invisibleChildren.delete(child);
        if (shouldUpdateNestedChildren) {
          this.update_visible_cache(child, child.expanded, true, false);
        }
      });
    } else {
      item
        .getChildren({ flatten: true })
        ?.forEach((c: IgcTreeItemComponent) => this._invisibleChildren.add(c));
    }

    if (shouldUpdate) {
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
      this.setActiveItem(item);
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
        this.setActiveItem(this.focusedItem);
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
        if (!isLTR(this.tree)) {
          this.handleArrowRight();
        } else {
          this.handleArrowLeft();
        }
        break;
      case 'arrowright':
      case 'right':
        if (!isLTR(this.tree)) {
          this.handleArrowLeft();
        } else {
          this.handleArrowRight();
        }
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
    if (this.focusedItem?.expanded && this.focusedItem.getChildren()?.length) {
      this.setActiveItem(this.focusedItem);
      this.focusedItem.collapseWithEvent();
    } else {
      const parentItem = this.focusedItem?.parent;
      if (parentItem && !parentItem.disabled) {
        this.setFocusedAndActiveItem(parentItem);
      }
    }
  }

  private handleArrowRight(): void {
    if (this.focusedItem!.getChildren()?.length > 0) {
      if (!this.focusedItem?.expanded) {
        this.setActiveItem(this.focusedItem);
        this.focusedItem!.expandWithEvent();
      } else {
        const firstChild = this.focusedItem
          .getChildren()
          .find((item: IgcTreeItemComponent) => !item.disabled);
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
    const items = this.focusedItem?.parent
      ? this.focusedItem!.parent?.getChildren()
      : this.tree.items?.filter(
          (item: IgcTreeItemComponent) => item.level === 0
        );
    items?.forEach((item: IgcTreeItemComponent) => {
      if (!item.disabled && !item.expanded && item.hasChildren) {
        item.expandWithEvent();
      }
    });
  }

  private handleSpace(shiftKey = false): void {
    if (this.tree.selection === 'none') {
      this.setActiveItem(this.focusedItem);
      return;
    }

    this.setActiveItem(this.focusedItem);
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
