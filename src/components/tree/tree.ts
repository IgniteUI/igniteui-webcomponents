import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { blazorAdditionalDependencies } from '../common/decorators/blazorAdditionalDependencies.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { styles } from './themes/container.base.css.js';
import { all } from './themes/container.js';
import IgcTreeItemComponent from './tree-item.js';
import type { IgcTreeEventMap } from './tree.common.js';
import { IgcTreeNavigationService } from './tree.navigation.js';
import { IgcTreeSelectionService } from './tree.selection.js';

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
 * @fires igcItemActivated - Emitted when the tree's `active` item changes.
 */
@themes(all)
@blazorAdditionalDependencies('IgcTreeItemComponent')
export default class IgcTreeComponent extends EventEmitterMixin<
  IgcTreeEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-tree';
  public static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcTreeComponent, IgcTreeItemComponent);
  }

  /** @private */
  @blazorSuppress()
  public selectionService!: IgcTreeSelectionService;
  /** @private */
  @blazorSuppress()
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
  public selection: 'none' | 'multiple' | 'cascade' = 'none';

  @watch('dir')
  protected onDirChange(): void {
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.requestUpdate();
    });
  }

  @watch('size', { waitUntilFirstUpdate: true })
  protected onSizeChange(): void {
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.requestUpdate();
    });
    this.navService.activeItem?.wrapper?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  @watch('selection', { waitUntilFirstUpdate: true })
  protected selectionModeChange(): void {
    this.selectionService.clearItemsSelection();
    this.items?.forEach((item: IgcTreeItemComponent) => {
      item.requestUpdate();
    });
  }

  @watch('singleBranchExpand')
  protected singleBranchExpandChange(): void {
    if (this.singleBranchExpand) {
      // if activeItem -> do not collapse its branch
      if (this.navService.activeItem) {
        const path = this.navService.activeItem.path;
        const remainExpanded = new Set(path.splice(0, path.length - 1));
        this.items.forEach((item) => {
          if (!remainExpanded.has(item)) {
            item.collapseWithEvent();
          }
        });
      } else {
        this.items.forEach((item) => item.collapseWithEvent());
      }
    }
  }

  constructor() {
    super();
    this.selectionService = new IgcTreeSelectionService(this);
    this.navService = new IgcTreeNavigationService(this, this.selectionService);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.addEventListener('keydown', this.handleKeydown);
    // set init to true for all items which are rendered along with the tree
    this.items.forEach((i: IgcTreeItemComponent) => {
      i.init = true;
    });
    const firstNotDisabledItem = this.items.find(
      (i: IgcTreeItemComponent) => !i.disabled
    );
    if (firstNotDisabledItem) {
      firstNotDisabledItem.tabIndex = 0;
      this.navService.focusItem(firstNotDisabledItem);
    }
  }

  /** Returns all of the tree's items. */
  @blazorSuppress()
  public get items(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll('igc-tree-item'));
  }

  private handleKeydown(event: KeyboardEvent) {
    this.navService.handleKeydown(event);
  }

  /** @private */
  public expandToItem(item: IgcTreeItemComponent): void {
    if (item?.parent) {
      item.path.forEach((i) => {
        if (i !== item && !i.expanded) {
          i.expanded = true;
        }
      });
    }
  }

  /** Select all items if the items collection is empty. Otherwise, select the items in the items collection. */
  @blazorSuppress()
  public select(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    if (!items) {
      this.selectionService.selectItemsWithNoEvent(
        this.selection === 'cascade'
          ? this.items.filter((item) => item.level === 0)
          : this.items
      );
    } else {
      this.selectionService.selectItemsWithNoEvent(items);
    }
  }

  /** Deselect all items if the items collection is empty. Otherwise, deselect the items in the items collection. */
  @blazorSuppress()
  public deselect(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    this.selectionService.deselectItemsWithNoEvent(items);
  }

  /**
   * Expands all of the passed items.
   * If no items are passed, expands ALL items.
   */
  @blazorSuppress()
  public expand(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    const _items = items || this.items;
    _items.forEach((item) => {
      item.expanded = true;
    });
  }

  /**
   * Collapses all of the passed items.
   * If no items are passed, collapses ALL items.
   */
  @blazorSuppress()
  public collapse(
    /* alternateType: TreeItemCollection */
    items?: IgcTreeItemComponent[]
  ): void {
    const _items = items || this.items;
    _items.forEach((item) => {
      item.expanded = false;
    });
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
