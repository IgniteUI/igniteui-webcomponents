import { TreeResourceStringsEN } from 'igniteui-i18n-core';
import { html, isServer, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { blazorAdditionalDependencies } from '#internals/decorators/blazorAdditionalDependencies.js';
import { registerComponent } from '#internals/definitions/register.js';
import { EventEmitterMixin } from '#internals/mixins/event-emitter.js';
import { I18nMixin } from '#internals/mixins/i18n.js';
import { setOrRemoveAttribute } from '#internals/utils/dom.js';
import { all } from '#themes/tree/themes/container.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import type { TreeSelection } from '../types.js';
import { styles } from './themes/container.base.css.js';
import IgcTreeItemComponent from './tree-item.js';
import {
  collectTreeItems,
  getTreeItemChildren,
  type IgcTreeComponentEventMap,
} from './tree.common.js';
import { IgcTreeNavigationService } from './tree.navigation.js';
import { IgcTreeSelectionService } from './tree.selection.js';

/**
 * Tree properties that items read while rendering. The tree is not a reactive
 * source for them, so a change must re-render the items by hand. Prefer to read
 * tree state at event time over extending this list.
 */
const ITEM_RENDER_DEPENDENCIES = ['selection', 'resourceStrings'] as const;

const i18n = {
  defaultEN: TreeResourceStringsEN,
};

/**
 * The tree allows users to represent hierarchical data in a tree-view structure,
 * maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.
 *
 * @element igc-tree
 *
 * @slot - Renders the tree items inside default slot.
 *
 * @fires igcSelection - Emitted when item selection is changing, before the selection completes. Cancelable.
 * @fires igcItemCollapsed - Emitted when tree item is collapsed.
 * @fires igcItemCollapsing - Emitted when tree item is about to collapse. Cancelable.
 * @fires igcItemExpanded - Emitted when tree item is expanded.
 * @fires igcItemExpanding - Emitted when tree item is about to expand. Cancelable.
 * @fires igcActiveItem - Emitted when the tree's `active` item changes.
 */
@blazorAdditionalDependencies('IgcTreeItemComponent')
export default class IgcTreeComponent extends I18nMixin(
  EventEmitterMixin<IgcTreeComponentEventMap>(LitElement),
  i18n
) {
  public static readonly tagName = 'igc-tree';
  public static override styles = [componentBase, styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTreeComponent, IgcTreeItemComponent);
  }

  /** @hidden @internal */
  public selectionService!: IgcTreeSelectionService;

  /** @hidden @internal */
  public navService!: IgcTreeNavigationService;

  /**
   * Whether only one branch of the tree can be expanded at a time. When the user
   * expands an item, the items outside its path collapse.
   * @attr single-branch-expand
   */
  @property({ attribute: 'single-branch-expand', reflect: true, type: Boolean })
  public singleBranchExpand = false;

  /**
   * Whether a click on an item toggles its expanded state.
   * @attr toggle-node-on-click
   */
  @property({ attribute: 'toggle-node-on-click', reflect: true, type: Boolean })
  public toggleNodeOnClick = false;

  /**
   * The selection mode of the tree. A change clears the current selection.
   * @attr
   */
  @property({ reflect: true })
  public selection: TreeSelection = 'none';

  /**
   * @hidden @internal
   * The direct `igc-tree-item` light-DOM children of the tree.
   */
  public get _rootItems(): IgcTreeItemComponent[] {
    return getTreeItemChildren(this);
  }

  /* blazorSuppress */
  /**
   * All items of the tree, in document order. Empty during server-side rendering.
   */
  public get items(): IgcTreeItemComponent[] {
    return isServer ? [] : collectTreeItems(this);
  }

  constructor() {
    super();

    addThemingController(this, all);

    // The analyzer records a constructor assignment as a second member, so
    // each assignment repeats the tags of its field.
    /** @hidden @internal */
    this.selectionService = new IgcTreeSelectionService(this);
    /** @hidden @internal */
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._syncAria();
    const items = this.items;

    // Mark the items that render with the tree.
    for (const item of items) {
      item.init = true;
    }

    this.navService.seedTabStop(items);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (this.hasUpdated && changed.has('selection')) {
      this.selectionService.clearItemsSelection();
    }

    // The active item's branch stays open; everything else collapses.
    if (changed.has('singleBranchExpand') && this.singleBranchExpand) {
      this._collapseOtherBranches(this.navService.activeItem);
    }

    if (ITEM_RENDER_DEPENDENCIES.some((prop) => changed.has(prop))) {
      for (const item of this.items) {
        item.requestUpdate();
      }
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    this._syncAria();
  }

  private _syncAria(): void {
    this.setAttribute('role', 'tree');

    // A tree that cannot be selected should not advertise itself as selectable.
    setOrRemoveAttribute(
      this,
      'aria-multiselectable',
      this.selection === 'none' ? null : 'true'
    );
  }

  /** @hidden @internal Collapses every item except the ancestors of `item`. */
  public _collapseOtherBranches(item: IgcTreeItemComponent | null): void {
    const keepExpanded = new Set(item ? item.path.slice(0, -1) : []);

    for (const other of this.items) {
      if (!keepExpanded.has(other)) {
        other.collapseWithEvent();
      }
    }
  }

  /* blazorSuppress */
  /** @hidden @internal */
  public expandToItem(item: IgcTreeItemComponent): void {
    for (const ancestor of item.path.slice(0, -1)) {
      ancestor.expanded = true;
    }
  }

  /* blazorSuppress */
  /** Selects the passed items. Without an argument, selects all items. Emits no event. */
  public select(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    if (items) {
      this.selectionService.selectItemsWithNoEvent(items);
      return;
    }

    // Cascading from the roots already covers every descendant.
    this.selectionService.selectItemsWithNoEvent(
      this.selection === 'cascade' ? this._rootItems : this.items
    );
  }

  /* blazorSuppress */
  /** Deselects the passed items. Without an argument, deselects all items. Emits no event. */
  public deselect(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    this.selectionService.deselectItemsWithNoEvent(items);
  }

  /* blazorSuppress */
  /**
   * Expands all of the passed items.
   * If no items are passed, expands ALL items.
   */
  public expand(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    for (const item of items ?? this.items) {
      item.expanded = true;
    }
  }

  /* blazorSuppress */
  /**
   * Collapses all of the passed items.
   * If no items are passed, collapses ALL items.
   */
  public collapse(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    for (const item of items ?? this.items) {
      item.expanded = false;
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree': IgcTreeComponent;
  }
}
