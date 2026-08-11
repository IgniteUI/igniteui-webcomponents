import {
  type ITreeResourceStrings,
  TreeResourceStringsEN,
} from 'igniteui-i18n-core';
import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { registerComponent } from '../common/definitions/register.js';
import { addI18nController } from '../common/i18n/i18n-controller.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import type { TreeSelection } from '../types.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import {
  getTreeItemChildren,
  type IgcTreeComponentEventMap,
  setAriaState,
} from './tree.common.js';
import { IgcTreeNavigationService } from './tree.navigation.js';
import { IgcTreeSelectionService } from './tree.selection.js';
import IgcTreeItemComponent from './tree-item.js';

/**
 * Tree properties that items read while rendering. The tree is not a reactive
 * source for them, so changing one has to re-render the items by hand or they
 * keep rendering stale output.
 *
 * Prefer reading tree state at event time over extending this - a handler
 * always sees the current value and costs no re-render. Direction is handled in
 * CSS via `:dir()` for the same reason.
 */
const ITEM_RENDER_DEPENDENCIES = ['selection', 'resourceStrings'] as const;

/**
 * The tree allows users to represent hierarchical data in a tree-view structure,
 * maintaining parent-child relationships, as well as to define static tree-view structure without a corresponding data model.
 *
 * @element igc-tree
 *
 * @slot - Renders the tree items inside default slot.
 *
 * @fires igcSelection - Emitted when item selection is changing, before the selection completes.
 * @fires igcItemCollapsed - Emitted when tree item is collapsed.
 * @fires igcItemCollapsing - Emitted when tree item is about to collapse.
 * @fires igcItemExpanded - Emitted when tree item is expanded.
 * @fires igcItemExpanding - Emitted when tree item is about to expand.
 * @fires igcActiveItem - Emitted when the tree's `active` item changes.
 */
@blazorAdditionalDependencies('IgcTreeItemComponent')
export default class IgcTreeComponent extends EventEmitterMixin<
  IgcTreeComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tree';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTreeComponent, IgcTreeItemComponent);
  }

  private readonly _i18nController = addI18nController<ITreeResourceStrings>(
    this,
    {
      defaultEN: TreeResourceStringsEN,
    }
  );

  /** @hidden @internal */
  public selectionService!: IgcTreeSelectionService;

  /** @hidden @internal */
  public navService!: IgcTreeNavigationService;

  /**
   * Whether a single or multiple of a parent's child items can be expanded.
   * @attr single-branch-expand
   */
  @property({ attribute: 'single-branch-expand', reflect: true, type: Boolean })
  public singleBranchExpand = false;

  /**
   * Whether clicking over nodes will change their expanded state or not.
   * @attr toggle-node-on-click
   */
  @property({ attribute: 'toggle-node-on-click', reflect: true, type: Boolean })
  public toggleNodeOnClick = false;

  /**
   * The selection state of the tree.
   * @attr
   */
  @property({ reflect: true })
  public selection: TreeSelection = 'none';

  /**
   * Gets/Sets the locale used for getting language, affecting resource strings.
   * @attr locale
   */
  @property()
  public set locale(value: string) {
    this._i18nController.locale = value;
  }

  public get locale() {
    return this._i18nController.locale;
  }

  /**
   * The resource strings for localization.
   * Currently only aria-labels of the default expand/collapse icons are localized for the tree item.
   */
  @property({ attribute: false })
  public set resourceStrings(value: ITreeResourceStrings) {
    this._i18nController.resourceStrings = value;
  }

  public get resourceStrings(): ITreeResourceStrings {
    return this._i18nController.resourceStrings;
  }

  /**
   * @hidden @internal
   * The tree's top-most items, i.e. its direct `igc-tree-item` light-DOM children.
   */
  public get _rootItems(): IgcTreeItemComponent[] {
    return getTreeItemChildren(this);
  }

  /* blazorSuppress */
  /**
   * Returns all of the tree's items.
   */
  public get items(): IgcTreeItemComponent[] {
    // A shared accumulator, rather than spreading each root's flattened
    // descendants, which would copy every subtree an extra time.
    const result: IgcTreeItemComponent[] = [];

    for (const item of this._rootItems) {
      result.push(item);
      item._collectDescendants(result);
    }

    return result;
  }

  constructor() {
    super();

    addThemingController(this, all);

    this.selectionService = new IgcTreeSelectionService(this);
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._syncAria();
    const items = this.items;

    // set init to true for all items which are rendered along with the tree
    for (const item of items) {
      item.init = true;
    }

    // Seed the roving tabindex without moving DOM focus - connecting a tree must
    // not pull focus away from wherever the user currently is.
    const firstNotDisabledItem = items.find((i) => !i.disabled);
    if (firstNotDisabledItem) {
      firstNotDisabledItem.tabIndex = 0;
      this.navService.focusItem(firstNotDisabledItem, false);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (this.hasUpdated && changed.has('selection')) {
      this.selectionService.clearItemsSelection();
    }

    if (changed.has('singleBranchExpand')) {
      this._singleBranchExpandChange();
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
    setAriaState(
      this,
      'aria-multiselectable',
      this.selection === 'none' ? null : 'true'
    );
  }

  private _singleBranchExpandChange(): void {
    if (!this.singleBranchExpand) {
      return;
    }

    // The active item's branch stays open; everything else collapses.
    const active = this.navService.activeItem;
    const keepExpanded = new Set(active ? active.path.slice(0, -1) : []);

    for (const item of this.items) {
      if (!keepExpanded.has(item)) {
        item.collapseWithEvent();
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
  /** Select all items if the items collection is empty. Otherwise, select the items in the items collection. */
  public select(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    if (items) {
      this.selectionService.selectItemsWithNoEvent(items);
      return;
    }

    // Cascading down from the roots already covers every descendant, so there
    // is no need to walk the whole tree to build the list.
    this.selectionService.selectItemsWithNoEvent(
      this.selection === 'cascade' ? this._rootItems : this.items
    );
  }

  /* blazorSuppress */
  /** Deselect all items if the items collection is empty. Otherwise, deselect the items in the items collection. */
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
