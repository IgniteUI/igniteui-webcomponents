import IgcTreeComponent from './tree';
import IgcTreeNodeComponent from './tree-node';
import {
  IgcTreeNodeSelectionEventArgs,
  IgcTreeNodeSelectionEventDetails,
  IgcTreeSelectionType,
} from './tree.common';

interface CascadeSelectionNodeCollection {
  nodes: Set<IgcTreeNodeComponent>;
  parents: Set<IgcTreeNodeComponent>;
}

export class IgcTreeSelectionService {
  private tree!: IgcTreeComponent;
  private nodeSelection: Set<IgcTreeNodeComponent> =
    new Set<IgcTreeNodeComponent>();
  private indeterminateNodes: Set<IgcTreeNodeComponent> =
    new Set<IgcTreeNodeComponent>();

  private nodesToBeSelected!: Set<IgcTreeNodeComponent>;
  private nodesToBeIndeterminate!: Set<IgcTreeNodeComponent>;

  constructor(tree: IgcTreeComponent) {
    this.tree = tree;
  }

  /** Select range from last selected node to the current specified node. */
  public selectMultipleNodes(node: IgcTreeNodeComponent): void {
    if (!this.nodeSelection.size) {
      this.selectNode(node);
      return;
    }
    const lastSelectedNodeIndex = this.tree.nodes.indexOf(
      this.getSelectedNodes()[this.nodeSelection.size - 1]
    );
    const currentNodeIndex = this.tree.nodes.indexOf(node);
    const nodes = this.tree.nodes.slice(
      Math.min(currentNodeIndex, lastSelectedNodeIndex),
      Math.max(currentNodeIndex, lastSelectedNodeIndex) + 1
    );

    const added = nodes.filter((_node) => !this.isNodeSelected(_node));
    const newSelection = this.getSelectedNodes().concat(added);
    this.emitNodeSelectionEvent(newSelection, added, []);
  }

  /** Select the specified node and emit event. */
  public selectNode(node: IgcTreeNodeComponent): void {
    if (this.tree.selection === IgcTreeSelectionType.None) {
      return;
    }
    this.emitNodeSelectionEvent([...this.getSelectedNodes(), node], [node], []);
  }

  /** Deselect the specified node and emit event. */
  public deselectNode(node: IgcTreeNodeComponent): void {
    const newSelection = this.getSelectedNodes().filter((r) => r !== node);
    this.emitNodeSelectionEvent(newSelection, [], [node]);
  }

  /** Clears node selection */
  public clearNodesSelection(): void {
    this.nodeSelection.clear();
    this.indeterminateNodes.clear();
  }

  public isNodeSelected(node: IgcTreeNodeComponent): boolean {
    return this.nodeSelection.has(node);
  }

  public isNodeIndeterminate(node: IgcTreeNodeComponent): boolean {
    return this.indeterminateNodes.has(node);
  }

  /** Select specified nodes. No event is emitted. */
  public selectNodesWithNoEvent(
    nodes: IgcTreeNodeComponent[],
    clearPrevSelection = false,
    shouldEmit = true
  ): void {
    if (this.tree && this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.cascadeSelectNodesWithNoEvent(nodes, clearPrevSelection);
      return;
    }

    const oldSelection = this.getSelectedNodes();
    const oldIndeterminate = this.getIndeterminateNodes();

    if (clearPrevSelection) {
      this.nodeSelection.clear();
    }
    nodes.forEach((node) => this.nodeSelection.add(node));

    if (shouldEmit) {
      this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
    }
  }

  /** Deselect specified nodes. No event is emitted. */
  public deselectNodesWithNoEvent(
    nodes?: IgcTreeNodeComponent[],
    shouldEmit = true
  ): void {
    const oldSelection = this.getSelectedNodes();
    const oldIndeterminate = this.getIndeterminateNodes();

    if (!nodes) {
      this.nodeSelection.clear();
    } else if (
      this.tree &&
      this.tree.selection === IgcTreeSelectionType.Cascade
    ) {
      this.cascadeDeselectNodesWithNoEvent(nodes);
    } else {
      nodes.forEach((node) => this.nodeSelection.delete(node));
    }

    if (shouldEmit) {
      this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
    }
  }

  /** Called on `node.ngOnDestroy` to ensure state is correct after node is removed */
  public ensureStateOnNodeDelete(node: IgcTreeNodeComponent): void {
    if (this.tree?.selection !== IgcTreeSelectionType.Cascade) {
      return;
    }
    requestAnimationFrame(() => {
      if (this.isNodeSelected(node)) {
        // node is destroyed, do not emit event
        this.deselectNodesWithNoEvent([node], false);
      } else {
        if (!node.parentTreeNode) {
          return;
        }
        const assitantLeafNode = node.parentTreeNode?.allChildren.find(
          (e: IgcTreeNodeComponent) => !e.directChildren?.length
        );
        if (!assitantLeafNode) {
          return;
        }
        this.retriggerNodeState(assitantLeafNode);
      }
    });
  }

  /** Retriggers a node's selection state */
  private retriggerNodeState(node: IgcTreeNodeComponent): void {
    if (node.selected) {
      this.nodeSelection.delete(node);
      this.selectNodesWithNoEvent([node], false, false);
    } else {
      this.nodeSelection.add(node);
      this.deselectNodesWithNoEvent([node], false);
    }
  }

  /** Returns array of the selected nodes. */
  private getSelectedNodes(): IgcTreeNodeComponent[] {
    return this.nodeSelection.size ? Array.from(this.nodeSelection) : [];
  }

  /** Returns array of the nodes in indeterminate state. */
  private getIndeterminateNodes(): IgcTreeNodeComponent[] {
    return this.indeterminateNodes.size
      ? Array.from(this.indeterminateNodes)
      : [];
  }

  private emitNodeSelectionEvent(
    newSelection: IgcTreeNodeComponent[],
    added: IgcTreeNodeComponent[],
    removed: IgcTreeNodeComponent[]
  ) {
    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.emitCascadeNodeSelectionEvent(newSelection, added, removed);
      return;
    }
    const currSelection = this.getSelectedNodes();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }
    const args: IgcTreeNodeSelectionEventArgs = {
      detail: {
        oldSelection: currSelection,
        newSelection,
        added,
        removed,
        cancel: false,
      },
      cancelable: true,
    };
    this.tree.emitEvent('IgcTreeNodeSelectionEvent', args);
    if (args.detail.cancel) {
      return;
    }
    this.selectNodesWithNoEvent(args.detail.newSelection, true);
  }

  private areEqualCollections(
    first: IgcTreeNodeComponent[],
    second: IgcTreeNodeComponent[]
  ): boolean {
    return (
      first.length === second.length &&
      new Set(first.concat(second)).size === first.length
    );
  }

  private cascadeSelectNodesWithNoEvent(
    nodes: IgcTreeNodeComponent[],
    clearPrevSelection = false
  ): void {
    const oldSelection = this.getSelectedNodes();
    const oldIndeterminate = this.getIndeterminateNodes();

    if (clearPrevSelection) {
      this.indeterminateNodes.clear();
      this.nodeSelection.clear();
      this.calculateNodesNewSelectionState({ added: nodes, removed: [] });
    } else {
      const newSelection = [...oldSelection, ...nodes];
      const args: Partial<IgcTreeNodeSelectionEventDetails> = {
        oldSelection,
        newSelection,
      };

      // retrieve only the rows without their parents/children which has to be added to the selection
      this.populateAddRemoveArgs(args);

      this.calculateNodesNewSelectionState(args);
    }
    this.nodeSelection = new Set(this.nodesToBeSelected);
    this.indeterminateNodes = new Set(this.nodesToBeIndeterminate);

    this.emitSelectedChangeEvent(oldSelection, oldIndeterminate);
  }

  private cascadeDeselectNodesWithNoEvent(nodes: IgcTreeNodeComponent[]): void {
    const args = { added: [], removed: nodes };
    this.calculateNodesNewSelectionState(args);

    this.nodeSelection = new Set<IgcTreeNodeComponent>(this.nodesToBeSelected);
    this.indeterminateNodes = new Set<IgcTreeNodeComponent>(
      this.nodesToBeIndeterminate
    );
  }

  /**
   * populates the nodesToBeSelected and nodesToBeIndeterminate sets
   * with the nodes which will be eventually in selected/indeterminate state
   */
  private calculateNodesNewSelectionState(
    args: Partial<IgcTreeNodeSelectionEventDetails>
  ): void {
    this.nodesToBeSelected = new Set<IgcTreeNodeComponent>(
      args?.oldSelection ? args.oldSelection : this.getSelectedNodes()
    );
    this.nodesToBeIndeterminate = new Set<IgcTreeNodeComponent>(
      this.getIndeterminateNodes()
    );

    this.cascadeSelectionState(args.removed, false);
    this.cascadeSelectionState(args.added, true);
  }

  /** Ensures proper selection state for all predescessors and descendants during a selection event */
  private cascadeSelectionState(
    nodes: IgcTreeNodeComponent[] | undefined,
    selected: boolean
  ): void {
    if (!nodes || nodes.length === 0) {
      return;
    }

    if (nodes && nodes.length > 0) {
      const nodeCollection: CascadeSelectionNodeCollection =
        this.getCascadingNodeCollection(nodes);

      nodeCollection.nodes.forEach((node) => {
        if (selected) {
          this.nodesToBeSelected.add(node);
        } else {
          this.nodesToBeSelected.delete(node);
        }
        this.nodesToBeIndeterminate.delete(node);
      });

      Array.from(nodeCollection.parents).forEach((parent) => {
        this.handleParentSelectionState(parent);
      });
    }
  }

  private emitCascadeNodeSelectionEvent(
    newSelection: IgcTreeNodeComponent[],
    added: IgcTreeNodeComponent[],
    removed: IgcTreeNodeComponent[]
  ): void {
    const currSelection = this.getSelectedNodes();
    const oldIndeterminate = this.getIndeterminateNodes();
    if (this.areEqualCollections(currSelection, newSelection)) {
      return;
    }

    const args: IgcTreeNodeSelectionEventDetails = {
      oldSelection: currSelection,
      newSelection,
      added,
      removed,
      cancel: false,
    };

    this.calculateNodesNewSelectionState(args);

    args.newSelection = Array.from(this.nodesToBeSelected);

    // retrieve nodes/parents/children which has been added/removed from the selection
    this.populateAddRemoveArgs(args);

    this.tree.emitEvent('IgcTreeNodeSelectionEvent', {
      detail: args,
      cancelable: true,
    });

    if (args.cancel) {
      return;
    }

    // if args.newSelection hasn't been modified
    if (
      this.areEqualCollections(
        Array.from(this.nodesToBeSelected),
        args.newSelection
      )
    ) {
      this.nodeSelection = new Set<IgcTreeNodeComponent>(
        this.nodesToBeSelected
      );
      this.indeterminateNodes = new Set(this.nodesToBeIndeterminate);
      this.emitSelectedChangeEvent(currSelection, oldIndeterminate);
    } else {
      // select the nodes within the modified args.newSelection with no event
      this.cascadeSelectNodesWithNoEvent(args.newSelection, true);
    }
  }

  /**
   * recursively handle the selection state of the direct and indirect parents
   */
  private handleParentSelectionState(node: IgcTreeNodeComponent) {
    if (!node) {
      return;
    }
    this.handleNodeSelectionState(node);
    if (node.parentTreeNode) {
      this.handleParentSelectionState(node.parentTreeNode);
    }
  }

  /**
   * Handle the selection state of a given node based the selection states of its direct children
   */
  private handleNodeSelectionState(node: IgcTreeNodeComponent) {
    const nodesArray = node && node.directChildren ? node.directChildren : [];
    if (nodesArray.length) {
      if (
        nodesArray.every((n: IgcTreeNodeComponent) =>
          this.nodesToBeSelected.has(n)
        )
      ) {
        this.nodesToBeSelected.add(node);
        this.nodesToBeIndeterminate.delete(node);
      } else if (
        nodesArray.some(
          (n: IgcTreeNodeComponent) =>
            this.nodesToBeSelected.has(n) || this.nodesToBeIndeterminate.has(n)
        )
      ) {
        this.nodesToBeIndeterminate.add(node);
        this.nodesToBeSelected.delete(node);
      } else {
        this.nodesToBeIndeterminate.delete(node);
        this.nodesToBeSelected.delete(node);
      }
    } else {
      // if the children of the node has been deleted and the node was selected do not change its state
      if (this.isNodeSelected(node)) {
        this.nodesToBeSelected.add(node);
      } else {
        this.nodesToBeSelected.delete(node);
      }
      this.nodesToBeIndeterminate.delete(node);
    }
  }

  /**
   * Get a collection of all nodes affected by the change event
   *
   * @param nodesToBeProcessed set of the nodes to be selected/deselected
   * @returns a collection of all affected nodes and all their parents
   */
  private getCascadingNodeCollection(
    nodes: IgcTreeNodeComponent[]
  ): CascadeSelectionNodeCollection {
    const collection: CascadeSelectionNodeCollection = {
      parents: new Set<IgcTreeNodeComponent>(),
      nodes: new Set<IgcTreeNodeComponent>(nodes),
    };

    Array.from(collection.nodes).forEach((node) => {
      const nodeAndAllChildren = node.allChildren || [];
      nodeAndAllChildren.forEach((n: IgcTreeNodeComponent) => {
        collection.nodes.add(n);
      });

      if (node && node.parentTreeNode) {
        collection.parents.add(node.parentTreeNode);
      }
    });
    return collection;
  }

  /**
   * retrieve the nodes which should be added/removed to/from the old selection
   */
  private populateAddRemoveArgs(
    args: Partial<IgcTreeNodeSelectionEventDetails>
  ): void {
    args.removed = args.oldSelection!.filter(
      (x) => args.newSelection!.indexOf(x) < 0
    );
    args.added = args.newSelection!.filter(
      (x) => args.oldSelection!.indexOf(x) < 0
    );
  }

  /** Emits the `selectedChange` event for each node affected by the selection */
  private emitSelectedChangeEvent(
    oldSelection: IgcTreeNodeComponent[],
    oldIndeterminate?: IgcTreeNodeComponent[]
  ): void {
    this.getSelectedNodes().forEach((n: IgcTreeNodeComponent) => {
      if (oldSelection.indexOf(n) < 0) {
        n.requestUpdate();
        // n.selectedChange.emit(true);
      }
    });

    oldSelection.forEach((n) => {
      if (!this.nodeSelection.has(n)) {
        n.requestUpdate();
        // n.selectedChange.emit(false);
      }
    });

    if (this.tree.selection === IgcTreeSelectionType.Cascade) {
      this.indeterminateNodes.forEach((n: IgcTreeNodeComponent) => {
        if (oldIndeterminate && oldIndeterminate?.indexOf(n) < 0) {
          n.requestUpdate();
          // n.selectedChange.emit(true);
        }
      });

      oldIndeterminate?.forEach((n) => {
        if (!this.indeterminateNodes.has(n)) {
          n.requestUpdate();
          // n.selectedChange.emit(false);
        }
      });
    }
  }
}
