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
import type { IgcTreeComponentEventMap } from './tree.common.js';
import { IgcTreeNavigationService } from './tree.navigation.js';
import { IgcTreeSelectionService } from './tree.selection.js';
import IgcTreeItemComponent from './tree-item.js';

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

  /* blazorSuppress */
  /**
   * Returns all of the tree's items.
   */
  public get items(): IgcTreeItemComponent[] {
    const result: IgcTreeItemComponent[] = [];
    for (const el of this.children) {
      if (el.tagName.toLowerCase() === IgcTreeItemComponent.tagName) {
        const item = el as IgcTreeItemComponent;
        result.push(item, ...item.getChildren({ flatten: true }));
      }
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
    this.setAttribute('role', 'tree');
    const items = this.items;
    // set init to true for all items which are rendered along with the tree
    for (const item of items) {
      item.init = true;
    }
    const firstNotDisabledItem = items.find((i) => !i.disabled);
    if (firstNotDisabledItem) {
      firstNotDisabledItem.tabIndex = 0;
      this.navService.focusItem(firstNotDisabledItem);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (this.hasUpdated && changed.has('selection')) {
      this._selectionModeChange();
    }

    if (changed.has('singleBranchExpand')) {
      this._singleBranchExpandChange();
    }

    if (changed.has('selection') || changed.has('resourceStrings')) {
      for (const item of this.items) {
        item.requestUpdate();
      }
    }
  }

  private _selectionModeChange(): void {
    this.selectionService.clearItemsSelection();
  }

  private _singleBranchExpandChange(): void {
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
        for (const item of this.items) {
          item.collapseWithEvent();
        }
      }
    }
  }

  /* blazorSuppress */
  /** @hidden @internal */
  public expandToItem(item: IgcTreeItemComponent): void {
    if (item?.parent) {
      item.path.forEach((i) => {
        if (i !== item && !i.expanded) {
          i.expanded = true;
        }
      });
    }
  }

  /* blazorSuppress */
  /** Select all items if the items collection is empty. Otherwise, select the items in the items collection. */
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
    const _items = items || this.items;
    _items.forEach((item) => {
      item.expanded = true;
    });
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
