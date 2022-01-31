import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { partNameMap } from '../common/util.js';
import { styles } from './tree-item.material.css';
import IgcTreeComponent from './tree';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { watch } from '../common/decorators';
import { IgcTreeSelectionService } from './tree.selection.js';
import { IgcTreeNavigationService } from './tree.navigation.js';

/**
 * The tree-item component represents a child item of the tree component or another tree item.
 *
 * @element igc-tree-item
 *
 * @slot - Renders nested tree-item component.
 * @slot label - Renders the tree item container.
 * @slot indicator - Renders the expand indicator container.
 * @slot indentation - Renders the container (by default the space) before the tree item.
 */
export default class IgcTreeItemComponent extends EventEmitterMixin<
  IgcTreeEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-tree-item';
  /** @private */
  public static styles = styles;

  private tabbableEl!: NodeListOf<HTMLElement>;
  private focusedProgrammatically = false;

  /** A reference to the tree the item is a part of. */
  public tree?: IgcTreeComponent;
  /** The parent item of the current tree item (if any) */
  public parent: IgcTreeItemComponent | null = null;

  /** @private */
  public init = false;

  @queryAssignedElements({ slot: 'label', flatten: true })
  private contentList!: Array<HTMLElement>;

  /** @private */
  @query('#wrapper')
  public wrapper!: HTMLElement;

  @state()
  private isFocused = false;

  /** @private */
  @state()
  public hasChildren = false;

  /** @private */
  @state()
  public size = 'large';

  /** The depth of the node, relative to the root. */
  @state()
  public level = 0;

  /** @private */
  @state()
  public indeterminate = false;

  /** @private */
  @state()
  public selection: IgcTreeSelectionType = IgcTreeSelectionType.None;

  /** The tree item label. */
  @property({ reflect: true })
  public label = '';

  /** The tree item expansion state. */
  @property({ reflect: true, type: Boolean })
  public expanded = false;

  /** Marks the item as the tree's active item. */
  @property({ reflect: true, type: Boolean })
  public active = false;

  /** Get/Set whether the tree item is disabled. Disabled items are ignored for user interactions. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The tree item selection state. */
  @property({ reflect: true, type: Boolean })
  public selected = false;

  /** To be used for load-on-demand scenarios in order to specify whether the item is loading data. */
  @property({ reflect: true, type: Boolean })
  public loading = false;

  /**
   * The value entry that the tree item is visualizing. Required for searching through items.
   * @type any
   */
  @property({ attribute: true })
  public value: any = undefined;

  @watch('size')
  public sizeMultiplier(): number {
    switch (this.size) {
      case 'medium':
        return 2 / 3;
      case 'small':
        return 1 / 2;
      default:
        return 1;
    }
  }

  @watch('expanded', { waitUntilFirstUpdate: true })
  @watch('hasChildren', { waitUntilFirstUpdate: true })
  protected bothChange(): void {
    if (this.hasChildren) {
      this.setAttribute('aria-expanded', this.expanded.toString());
    } else {
      this.removeAttribute('aria-expanded');

      // this.expanded = false; and check for loadOnDemand
    }
  }

  @watch('expanded')
  public expandedChange(oldValue: boolean): void {
    // always update the visible cache
    this.navService?.update_visible_cache(this, this.expanded);
    if (!oldValue) {
      return;
    }
    // await for load on demand children
    Promise.resolve().then(() => {
      if (this.navService?.focusedItem !== this && !this.isFocused) {
        this.navService?.focusedItem?.wrapper?.scrollIntoView({
          behavior: 'auto',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });
  }

  @watch('active', { waitUntilFirstUpdate: true })
  public activeChange(): void {
    if ((this.active && this.navService?.activeItem === this) || !this.active) {
      return;
    }
    if (this.navService) {
      this.navService.setActiveItem(this, false);
    }
    // Expand and scroll to the newly active item
    this.tree?.expandToItem(this);
    // Await for expanding
    Promise.resolve().then(() => {
      this.wrapper?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    });
  }

  @watch('disabled')
  public disabledChange(): void {
    this.navService?.update_disabled_cache(this);
  }

  @watch('selected', { waitUntilFirstUpdate: true })
  public selectedChange(): void {
    if (this.selected && !this.selectionService?.isItemSelected(this)) {
      this.selectionService?.selectItemsWithNoEvent([this]);
    }
    if (!this.selected && this.selectionService?.isItemSelected(this)) {
      this.selectionService?.deselectItemsWithNoEvent([this]);
    }
  }

  constructor() {
    super();
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.tree = this.closest('igc-tree') as IgcTreeComponent;
    this.size = this.tree?.size;
    this.parent =
      this.parentElement?.tagName.toLowerCase() === 'igc-tree-item'
        ? (this.parentElement as IgcTreeItemComponent)
        : null;
    this.level = this.parent ? this.parent.level + 1 : 0;
    this.selection = this.tree?.selection;
    // this.navService?.update_visible_cache(this, this.expanded);
    this.setAttribute('role', 'treeitem');
    this.addEventListener('blur', this.onBlur);
    this.addEventListener('focus', this.onFocus);
    this.addEventListener('pointerdown', this.pointerDown);
    this.activeChange();
    // if the item is not added/moved runtime
    if (this.init) {
      this.selectedChange();
    } else {
      // retriger the item selection state in order to update the collections within the selectionService
      // and to handle correctly the itemParents recursively to the top-most ancestor
      this.selectionService?.retriggerItemState(this);
    }
    this.init = false;
    this.labelChange();
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.selectionService?.ensureStateOnItemDelete(this);
    this.navService?.delete_item(this);
  }

  private get selectionService(): IgcTreeSelectionService | undefined {
    return this.tree?.selectionService;
  }

  private get navService(): IgcTreeNavigationService | undefined {
    return this.tree?.navService;
  }

  private get parts() {
    return {
      selected: this.selected,
      focused: this.isFocused,
      active: this.active,
    };
  }

  private get directChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.children).filter(
      (x) => x.tagName.toLowerCase() === 'igc-tree-item'
    ) as IgcTreeItemComponent[];
  }

  private get allChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-item`));
  }

  /** The full path to the tree item, starting from the top-most ancestor. */
  public get path(): IgcTreeItemComponent[] {
    return this.parent?.path ? [...this.parent.path, this] : [this];
  }

  private pointerDown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.tabIndex = 0;
    this.navService?.setFocusedAndActiveItem(this, true, false);
  }

  private expandIndicatorClick(): void {
    if (this.disabled) {
      return;
    }
    if (this.expanded) {
      this.collapseWithEvent();
    } else {
      this.expandWithEvent();
    }
  }

  private selectorClick(event: MouseEvent): void {
    event.preventDefault();
    if (event.shiftKey) {
      this.selectionService?.selectMultipleItems(this);
      return;
    }
    if (this.selected) {
      this.selectionService?.deselectItem(this);
    } else {
      this.selectionService?.selectItem(this);
    }
  }

  private onFocus(): void {
    if (this.disabled) {
      return;
    }
    if (this.navService?.focusedItem !== this) {
      this.navService?.focusItem(this, false);
      this.wrapper?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
        inline: 'nearest',
      });
    }
    if (this.tabbableEl && this.tabbableEl.length) {
      // set tabIndex = 0 to all tabbable elements
      // focus the first one
      this.tabbableEl.forEach((element: HTMLElement) => {
        element.tabIndex = 0;
      });
      this.focusedProgrammatically = true;
      this.tabbableEl[0].focus();
      return;
    }
    this.isFocused = true;
  }

  private onBlur(): void {
    this.isFocused = false;
  }

  private onFocusIn(ev: Event): void {
    ev?.stopPropagation();
    if (!this.disabled) {
      // clicking directly over tabbable element when the item is not focused
      if (!this.focusedProgrammatically) {
        this.tabbableEl.forEach((element: HTMLElement) => {
          element.tabIndex = 0;
        });
      }
      this.removeAttribute('tabIndex');
      this.isFocused = true;
      this.focusedProgrammatically = false;
    }
  }

  private onFocusOut(ev: Event): void {
    ev?.stopPropagation();
    this.isFocused = false;
    this.tabbableEl.forEach((element: HTMLElement) => {
      element.tabIndex = -1;
    });

    if (this.navService?.focusedItem === this) {
      // called twice when clicking on already focused item with link (pointerDown handler)
      this.setAttribute('tabindex', '0');
    }
  }

  private labelChange(): void {
    this.tabbableEl = this.contentList[0]?.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    if (this.tabbableEl && this.tabbableEl.length) {
      this.setAttribute('role', 'none');
      this.tabbableEl.forEach((element: HTMLElement) => {
        element.tabIndex = -1;
        element.setAttribute('role', 'treeitem');
      });
    } else {
      this.setAttribute('role', 'treeitem');
    }
  }

  private handleChange(): void {
    this.hasChildren = !!this.directChildren.length;
    // there is no need to update nested children beacuse they're state is already up to date
    this.navService?.update_visible_cache(this, this.expanded, false);
  }

  /**
   * Returns a collection of child items.
   * If the parameter value is true returns all tree item's direct children,
   * otherwise - only the direct children.
   */
  public getChildren(
    options: { flatten: boolean } = { flatten: false }
  ): IgcTreeItemComponent[] {
    if (options.flatten) {
      return this.allChildren;
    } else {
      return this.directChildren;
    }
  }

  /**
   * @private
   * Expands the tree item.
   */
  public expandWithEvent(): void {
    if (this.expanded) {
      return;
    }
    const args = {
      detail: {
        node: this,
      },
      cancelable: true,
    };

    const allowed = this.tree?.emitEvent('igcItemExpanding', args);

    if (!allowed) {
      return;
    }

    if (this.tree?.singleBranchExpand) {
      const pathSet = new Set(this.path.splice(0, this.path.length - 1));
      this.tree.items.forEach((item: IgcTreeItemComponent) => {
        if (!pathSet.has(item)) {
          item.collapseWithEvent();
        }
      });
    }

    this.expanded = true;
    this.tree?.emitEvent('igcItemExpanded', { detail: this });
  }

  /**
   * @private
   * Collapses the tree item.
   */
  public collapseWithEvent(): void {
    if (!this.expanded) {
      return;
    }
    const args = {
      detail: {
        node: this,
      },
      cancelable: true,
    };

    const allowed = this.tree?.emitEvent('igcItemCollapsing', args);

    if (!allowed) {
      return;
    }
    this.expanded = false;
    this.tree?.emitEvent('igcItemCollapsed', { detail: this });
  }

  /** Toggles tree item expansion state. */
  public toggle(): void {
    this.expanded = !this.expanded;
  }

  /** Expands the tree item. */
  public expand(): void {
    this.expanded = true;
  }

  /** Collapses the tree item. */
  public collapse(): void {
    this.expanded = false;
  }

  protected override render() {
    return html`
      <div id="wrapper" part="wrapper ${this.size} ${partNameMap(this.parts)}">
        <div
          style="width: calc(${this
            .level} * var(--igc-tree-indentation-size) * ${this.sizeMultiplier()})"
          part="indentation"
          aria-hidden="true"
        >
          <slot name="indentation"></slot>
        </div>
        <div part="indicator" aria-hidden="true">
          ${this.loading
            ? html`
                <slot name="loading">
                  <igc-icon
                    name="navigate_before"
                    collection="internal"
                  ></igc-icon>
                </slot>
              `
            : html`
                <slot name="indicator" @click=${this.expandIndicatorClick}>
                  ${this.hasChildren
                    ? html`
                        <igc-icon
                          name=${this.expanded
                            ? 'keyboard_arrow_down'
                            : 'keyboard_arrow_right'}
                          collection="internal"
                        >
                        </igc-icon>
                      `
                    : ''}
                </slot>
              `}
        </div>
        ${this.selection !== IgcTreeSelectionType.None
          ? html`
              <div part="select" aria-hidden="true">
                <igc-checkbox
                  @click=${this.selectorClick}
                  .checked=${this.selected}
                  .indeterminate=${this.indeterminate}
                  .disabled=${this.disabled}
                  tabindex="-1"
                >
                </igc-checkbox>
              </div>
            `
          : ''}
        <div part="label">
          <slot
            name="label"
            @slotchange=${this.labelChange}
            @focusin=${this.onFocusIn}
            @focusout=${this.onFocusOut}
          >
            <span part="text">${this.label}</span>
          </slot>
        </div>
      </div>
      <div role="group" aria-hidden="true">
        <slot @slotchange=${this.handleChange} ?hidden=${!this.expanded}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
