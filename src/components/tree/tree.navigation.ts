import IgcTreeComponent from './tree';
import IgcTreeNodeComponent from './tree-node';
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

  private _focusedNode: IgcTreeNodeComponent | null = null;

  private _lastFocusedNode: IgcTreeNodeComponent | null = null;
  private _activeNode: IgcTreeNodeComponent | null = null;

  private _visibleChildren: IgcTreeNodeComponent[] = [];
  private _invisibleChildren: Set<IgcTreeNodeComponent> = new Set();
  private _disabledChildren: Set<IgcTreeNodeComponent> = new Set();

  // private _cacheChange = new Subject<void>();

  // constructor(private treeService: IgcTreeComponentService, private selectionService: IgcTreeComponentSelectionService) {
  //     this._cacheChange.subscribe(() => {
  //         this._visibleChildren =
  //             this.tree?.nodes ?
  //                 this.tree.nodes.filter(e => !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))) :
  //                 [];
  //     });
  // }

  constructor(
    tree: IgcTreeComponent,
    selectionService: IgcTreeSelectionService
  ) {
    this.tree = tree;
    this.selectionService = selectionService;
    this.updateVisChild();
  }

  public updateVisChild(): void {
    this._visibleChildren = this.tree?.nodes
      ? this.tree.nodes.filter(
          (e) =>
            !(this._invisibleChildren.has(e) || this._disabledChildren.has(e))
        )
      : [];
  }

  public get focusedNode(): IgcTreeNodeComponent | null {
    return this._focusedNode;
  }

  public set focusedNode(value: IgcTreeNodeComponent | null) {
    if (this._focusedNode === value) {
      return;
    }
    this._lastFocusedNode = this._focusedNode;
    if (this._lastFocusedNode) {
      this._lastFocusedNode.tabIndex = -1;
    }
    this._focusedNode = value;
    if (this._focusedNode !== null) {
      this._focusedNode.tabIndex = 0;
      // this._focusedNode.header?.focus();
      this._focusedNode.focus();
    }
    this._lastFocusedNode?.requestUpdate();
    this._focusedNode?.requestUpdate();
  }

  public get activeNode(): IgcTreeNodeComponent | null {
    return this._activeNode;
  }

  public set activeNode(value: IgcTreeNodeComponent | null) {
    if (this._activeNode === value) {
      return;
    }
    this._activeNode?.requestUpdate();
    this._activeNode = value;
    this._activeNode?.requestUpdate();
    // this.tree.activeNodeChanged.emit(this._activeNode);
  }

  public get visibleChildren(): IgcTreeNodeComponent[] {
    return this._visibleChildren;
  }

  public update_disabled_cache(node: IgcTreeNodeComponent): void {
    if (node.disabled) {
      this._disabledChildren.add(node);
    } else {
      this._disabledChildren.delete(node);
    }
    // this._cacheChange.next();
    this.updateVisChild();
  }

  public init_invisible_cache() {
    this.tree.nodes
      .filter((e) => e.level === 0)
      .forEach((node) => {
        this.update_visible_cache(node, node.expanded, false);
      });
    // this._cacheChange.next();
    this.updateVisChild();
  }

  public update_visible_cache(
    node: IgcTreeNodeComponent,
    expanded: boolean,
    shouldEmit = true
  ): void {
    if (expanded) {
      node.directChildren?.forEach((child: IgcTreeNodeComponent) => {
        this._invisibleChildren.delete(child);
        this.update_visible_cache(child, child.expanded, false);
      });
    } else {
      node.allChildren.forEach((c: IgcTreeNodeComponent) =>
        this._invisibleChildren.add(c)
      );
    }

    if (shouldEmit) {
      // this._cacheChange.next();
      this.updateVisChild();
    }
  }

  /**
   * Sets the node as focused (and active)
   *
   * @param node target node
   * @param isActive if true, sets the node as active
   */
  public setFocusedAndActiveNode(
    node: IgcTreeNodeComponent,
    isActive = true
  ): void {
    if (isActive) {
      this.activeNode = node;
    }
    this.focusedNode = node;
  }

  /** Handler for keydown events. Used in tree.component.ts */
  public handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!this.focusedNode) {
      return;
    }
    if (!(NAVIGATION_KEYS.has(key) || key === '*')) {
      if (key === 'enter') {
        this.activeNode = this.focusedNode;
      }
      return;
    }
    event.preventDefault();
    if (event.repeat) {
      setTimeout(() => this.handleNavigation(event), 1);
    } else {
      this.handleNavigation(event);
    }
  }

  // public ngOnDestroy() {
  // this._cacheChange.next();
  // this._cacheChange.complete();
  // }

  private handleNavigation(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case 'home':
        this.setFocusedAndActiveNode(this.visibleChildren[0]);
        break;
      case 'end':
        this.setFocusedAndActiveNode(
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
    // if (this.focusedNode.expanded && !this.treeService.collapsingNodes.has(this.focusedNode) && this.focusedNode._children?.length) {
    if (this.focusedNode?.expanded && this.focusedNode.directChildren?.length) {
      this.activeNode = this.focusedNode;
      // this.focusedNode.collapse();
      this.focusedNode.expanded = false;
    } else {
      const parentNode = this.focusedNode?.parentTreeNode;
      if (parentNode && !parentNode.disabled) {
        this.setFocusedAndActiveNode(parentNode);
      }
    }
  }

  private handleArrowRight(): void {
    if (this.focusedNode!.directChildren?.length > 0) {
      if (!this.focusedNode?.expanded) {
        this.activeNode = this.focusedNode;
        // this.focusedNode.expand();
        this.focusedNode!.expanded = true;
      } else {
        // if (this.treeService.collapsingNodes.has(this.focusedNode)) {
        //     this.focusedNode.expand();
        //     return;
        // }
        const firstChild = this.focusedNode.directChildren.find(
          (node: IgcTreeNodeComponent) => !node.disabled
        );
        if (firstChild) {
          this.setFocusedAndActiveNode(firstChild);
        }
      }
    }
  }

  private handleUpDownArrow(isUp: boolean, event: KeyboardEvent): void {
    const next = this.getVisibleNode(this.focusedNode!, isUp ? -1 : 1);
    if (next === this.focusedNode) {
      return;
    }

    if (event.ctrlKey) {
      this.setFocusedAndActiveNode(next, false);
    } else {
      this.setFocusedAndActiveNode(next);
    }
  }

  private handleAsterisk(): void {
    const nodes = this.focusedNode?.parentTreeNode
      ? this.focusedNode!.parentTreeNode?.directChildren
      : this.tree.rootNodes;
    nodes?.forEach((node: IgcTreeNodeComponent) => {
      // if (!node.disabled && (!node.expanded || this.treeService.collapsingNodes.has(node))) {
      if (!node.disabled && !node.expanded) {
        // node.expand();
        node.expanded = true;
      }
    });
  }

  private handleSpace(shiftKey = false): void {
    if (this.tree.selection === IgcTreeSelectionType.None) {
      return;
    }

    this.activeNode = this.focusedNode;
    if (shiftKey) {
      this.selectionService.selectMultipleNodes(this.focusedNode!);
      return;
    }

    if (this.focusedNode!.selected) {
      this.selectionService.deselectNode(this.focusedNode!);
    } else {
      this.selectionService.selectNode(this.focusedNode!);
    }
  }

  /** Gets the next visible node in the given direction - 1 -> next, -1 -> previous */
  private getVisibleNode(
    node: IgcTreeNodeComponent,
    dir: 1 | -1 = 1
  ): IgcTreeNodeComponent {
    const nodeIndex = this.visibleChildren.indexOf(node);
    return this.visibleChildren[nodeIndex + dir] || node;
  }
}
