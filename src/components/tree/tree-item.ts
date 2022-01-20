import { property, query, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { arrayOf } from '../common/util.js';
import { styles } from './tree-item.material.css';
import IgcTreeComponent from './tree';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { classMap } from 'lit/directives/class-map.js';
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

  /** A reference to the tree the item is a part of. */
  public tree?: IgcTreeComponent;
  /** The parent item of the current tree item (if any) */
  public parent: IgcTreeItemComponent | null = null;

  /** @private */
  public init = false;

  /** @private */
  @query('.tree-node__wrapper')
  public wrapper: any;

  @state()
  private isFocused = false;

  /** @private */
  @state()
  public hasChildren = false;

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
  @property({ type: Boolean })
  public active = false;

  /** Get/Set whether the tree item is disabled. Disabled items are ignored for user interactions. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The tree item selection state. */
  @property({ reflect: true, type: Boolean })
  public selected = false;

  /**
   * The value entry that the tree item is visualizing. Required for searching through items.
   * @type any
   */
  @property({ attribute: false })
  public value = undefined;

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
        this.navService?.focusedItem?.wrapper.scrollIntoView({
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
      this.wrapper.scrollIntoView({
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

  public connectedCallback(): void {
    super.connectedCallback();
    this.tree = this.closest('igc-tree') as IgcTreeComponent;
    this.parent =
      this.parentElement?.tagName.toLowerCase() === 'igc-tree-item'
        ? (this.parentElement as IgcTreeItemComponent)
        : null;
    this.level = this.parent ? this.parent.level + 1 : 0;
    this.selection = this.tree?.selection;
    // this.navService?.update_visible_cache(this, this.expanded);
    this.setAttribute('role', 'treeitem');
    this.addEventListener('focusout', this.clearFocus);
    this.addEventListener('focusin', this.handleFocusIn);
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
  }

  public disconnectedCallback(): void {
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

  private get classes() {
    return {
      'tree-node__wrapper': true,
      'tree-node__wrapper--focused': this.isFocused,
      'tree-node__wrapper--active': this.active,
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
    this.navService?.setFocusedAndActiveItem(this);
  }

  private expandIndicatorClick(): void {
    if (this.disabled) {
      return;
    }
    this.toggle();
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

  private handleFocusIn(ev: Event): void {
    ev.stopPropagation();
    if (this.disabled) {
      return;
    }
    if (this.navService?.focusedItem !== this) {
      // if tab/shift+tab leads to tabbable element within the igc-tree-item label
      if (
        (ev.target as HTMLElement).tagName.toLowerCase() !== 'igc-tree-item'
      ) {
        this.navService?.focusItem(this, false);
      } else {
        // when tab/shift+tab from element outside of the tree
        // focuses the last focused igc-tree-item without tabbable content
        this.navService?.focusItem(this);
      }
    }
    this.isFocused = true;
  }

  private clearFocus(event: Event): void {
    event.stopPropagation();
    this.isFocused = false;
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

  protected render() {
    return html`
      <div part="wrapper" class=${classMap(this.classes)}>
        <section part="indentation">
          <slot name="indentation"></slot>
            ${arrayOf(this.level).map(
              () => html`<span class="tree-node__spacer"></span>`
            )}
          </slot>
        </section>
        <section
          part="indicator"
          class="tree-node__toggle-button"
        >
          <slot name="indicator">
            ${
              this.hasChildren
                ? html`
                    <igc-icon
                      name=${this.expanded
                        ? 'keyboard_arrow_down'
                        : 'keyboard_arrow_right'}
                      collection="internal"
                      @click=${this.expandIndicatorClick}
                    ></igc-icon>
                  `
                : ''
            }
          </slot>
        </section>
        ${
          this.selection !== IgcTreeSelectionType.None
            ? html`
                <section part="selectIndicator" class="tree-node__select">
                  <igc-checkbox
                    @click=${this.selectorClick}
                    .checked=${this.selected}
                    .indeterminate=${this.indeterminate}
                    .disabled=${this.disabled}
                    tabindex="-1"
                  ></igc-checkbox>
                </section>
              `
            : ''
        }
        <section part="label" class="tree-node__content">
          <slot name="label">
            <p>${this.label}</p>
          </slot>
        </section>
      </div>
      <slot @slotchange=${this.handleChange} ?hidden=${!this.expanded}></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
