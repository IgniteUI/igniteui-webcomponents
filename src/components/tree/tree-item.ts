import { html, LitElement, nothing, type PropertyValues } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import {
  addSafeEventListener,
  getElementFromPath,
  isLTR,
  scrollIntoView,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcCircularProgressComponent from '../progress/circular-progress.js';
import { styles } from './themes/item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item.common.css.js';
import type IgcTreeComponent from './tree.js';
import type { IgcTreeNavigationService } from './tree.navigation.js';
import type { IgcTreeSelectionService } from './tree.selection.js';

const TREE_ITEM_TAG = 'igc-tree-item';
const TREE_TAG = 'igc-tree';

/**
 * The tree-item component represents a child item of the tree component or another tree item.
 *
 * @element igc-tree-item
 *
 * @slot - Renders nested tree-item component.
 * @slot label - Renders the tree item container.
 * @slot indicator - Renders the expand indicator container.
 * @slot loading - Renders the tree item loading indicator container.
 * @slot indentation - Renders the container (by default the space) before the tree item.
 *
 * @csspart wrapper - The wrapper for the tree item.
 * @csspart selected - Indicates selected state. Applies to `wrapper`.
 * @csspart focused - Indicates focused state. Applies to `wrapper`.
 * @csspart active - Indicates an active state. Applies to `wrapper`.
 * @csspart indicator - The expand indicator of the tree item.
 * @csspart label - The tree item content.
 * @csspart text - The tree item displayed text.
 * @csspart select - The checkbox of the tree item when selection is enabled.
 */
export default class IgcTreeItemComponent extends LitElement {
  public static readonly tagName = TREE_ITEM_TAG;
  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcTreeItemComponent,
      IgcIconComponent,
      IgcCheckboxComponent,
      IgcCircularProgressComponent
    );
  }

  private _tabbableEl?: HTMLElement[];
  private _focusedProgrammatically = false;

  private _groupRef: Ref<HTMLElement> = createRef();

  private _animationPlayer = addAnimationController(this, this._groupRef);

  private _tree?: IgcTreeComponent;

  /* blazorSuppress */
  /**
   * A reference to the tree the item is a part of.
   */
  public get tree(): IgcTreeComponent | undefined {
    return this._tree;
  }

  /** The parent item of the current tree item (if any) */
  public parent: IgcTreeItemComponent | null = null;

  /** @hidden @internal */
  public init = false;

  @queryAssignedElements({ slot: 'label', flatten: true })
  private _contentList!: Array<HTMLElement>;

  private get _selectionService(): IgcTreeSelectionService | undefined {
    return this.tree?.selectionService;
  }

  private get _navService(): IgcTreeNavigationService | undefined {
    return this.tree?.navService;
  }

  private get _parts() {
    return {
      wrapper: true,
      selected: this.selected,
      focused: this._isFocused,
      active: this.active,
    };
  }

  /**
   * Direct `igc-tree-item` light-DOM children. Tree items are expected to be nested directly
   * (wrapping a nested item in another element, e.g. a `<div>`, is not supported) — this keeps
   * child resolution a cheap, native `.children` scan instead of a subtree-wide DOM query.
   */
  private get _directChildren(): IgcTreeItemComponent[] {
    return Array.from(this.children).filter(
      (el): el is IgcTreeItemComponent =>
        el.tagName.toLowerCase() === TREE_ITEM_TAG
    );
  }

  private get _allChildren(): IgcTreeItemComponent[] {
    const result: IgcTreeItemComponent[] = [];
    this._collectAllChildren(result);
    return result;
  }

  /** @hidden @internal */
  @query('#wrapper')
  public wrapper!: HTMLElement;

  @state()
  private _isFocused = false;

  /** @hidden @internal */
  @state()
  public hasChildren = false;

  /** The depth of the item, relative to the root. */
  @state()
  public level = 0;

  /** @hidden @internal */
  @state()
  public indeterminate = false;

  /**
   * The tree item label.
   * @attr
   */
  @property()
  public label = '';

  /**
   * The tree item expansion state.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public expanded = false;

  /**
   * Marks the item as the tree's active item.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public active = false;

  /**
   * Get/Set whether the tree item is disabled. Disabled items are ignored for user interactions.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /**
   * The tree item selection state.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public selected = false;

  /**
   * To be used for load-on-demand scenarios in order to specify whether the item is loading data.
   * @attr
   */
  @property({ reflect: true, type: Boolean })
  public loading = false;

  /**
   * The value entry that the tree item is visualizing. Required for searching through items.
   * @type any
   * @attr
   */
  @property({ attribute: true })
  public value: any = undefined;

  constructor() {
    super();

    addThemingController(this, all);

    addSafeEventListener(this, 'click', this._itemClick);
    addSafeEventListener(this, 'focus', this._onFocus);
    addSafeEventListener(this, 'blur', this._onBlur);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._tree =
      (this.closest(TREE_TAG) as IgcTreeComponent | null) ?? undefined;
    this.parent =
      this.parentElement?.tagName.toLowerCase() === TREE_ITEM_TAG
        ? (this.parentElement as IgcTreeItemComponent)
        : null;
    this.level = this.parent ? this.parent.level + 1 : 0;
    this.setAttribute('role', 'treeitem');
    this._activeChange();
    // if the item is not added/moved runtime
    if (this.init) {
      this._selectedChange();
    } else {
      // re-trigger the item selection state in order to update the collections within the selectionService
      // and to handle correctly the itemParents recursively to the top-most ancestor
      this._selectionService?.retriggerItemState(this);
    }
    this.init = false;
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._selectionService?.ensureStateOnItemDelete(this);
    this._navService?.handleItemDisconnect(this);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (
      this.hasUpdated &&
      (changed.has('expanded') || changed.has('hasChildren'))
    ) {
      this._bothChange();
    }

    if (changed.has('expanded')) {
      const oldValue = changed.get('expanded') as boolean;
      if (oldValue !== this.expanded) {
        this._expandedChange(oldValue);
      }
    }

    if (this.hasUpdated && changed.has('active')) {
      const oldValue = changed.get('active') as boolean;
      if (oldValue !== this.active) {
        this._activeChange();
      }
    }

    if (this.hasUpdated && changed.has('selected')) {
      const oldValue = changed.get('selected') as boolean;
      if (oldValue !== this.selected) {
        this._selectedChange();
      }
    }
  }

  /**
   * Appends every descendant (pre-order) into `out` in a single pass.
   *
   * Building this iteratively (rather than the more obvious `flatMap` + spread recursion)
   * avoids repeatedly copying already-collected arrays at every level of the tree, which would
   * otherwise turn a deeply nested tree's flatten cost from linear into quadratic.
   */
  private _collectAllChildren(out: IgcTreeItemComponent[]): void {
    for (const child of this._directChildren) {
      out.push(child);
      child._collectAllChildren(out);
    }
  }

  /** The full path to the tree item, starting from the top-most ancestor. */
  public get path(): IgcTreeItemComponent[] {
    return this.parent?.path ? [...this.parent.path, this] : [this];
  }

  private _itemClick(event: MouseEvent): void {
    if (this.disabled || this !== getElementFromPath(this.tagName, event)) {
      return;
    }
    this.tabIndex = 0;
    if (this.tree?.toggleNodeOnClick && event.button === 0) {
      this.expanded ? this.collapseWithEvent() : this.expandWithEvent();
    }
    this._navService?.setFocusedAndActiveItem(this, true, true);
  }

  private _expandIndicatorClick(): void {
    if (this.disabled) return;
    this.expanded ? this.collapseWithEvent() : this.expandWithEvent();
  }

  private _selectorClick(event: MouseEvent): void {
    event.preventDefault();
    if (this.tree?.toggleNodeOnClick) {
      event.stopPropagation();
    }
    if (event.shiftKey) {
      this._selectionService?.selectMultipleItems(this);
      return;
    }
    this.selected
      ? this._selectionService?.deselectItem(this)
      : this._selectionService?.selectItem(this);
  }

  private _onFocus(): void {
    if (this.disabled) {
      return;
    }
    if (this._navService?.focusedItem !== this) {
      this._navService?.focusItem(this, false);
      scrollIntoView(this.wrapper, { behavior: 'smooth' });
    }
    if (this._tabbableEl?.length) {
      // set tabIndex = 0 to all tabbable elements
      // focus the first one
      this._tabbableEl.forEach((element: HTMLElement) => {
        element.tabIndex = 0;
      });
      this._focusedProgrammatically = true;
      this._tabbableEl[0].focus();
      return;
    }
    this._isFocused = true;
  }

  private _onBlur(): void {
    this._isFocused = false;
  }

  private _onFocusIn(ev: Event): void {
    ev?.stopPropagation();
    if (!this.disabled) {
      // clicking directly over tabbable element when the item is not focused
      if (!this._focusedProgrammatically) {
        this._tabbableEl?.forEach((element: HTMLElement) => {
          element.tabIndex = 0;
        });
      }
      this.removeAttribute('tabIndex');
      this._isFocused = true;
      this._focusedProgrammatically = false;
    }
  }

  private _onFocusOut(ev: Event): void {
    ev?.stopPropagation();
    this._isFocused = false;
    this._tabbableEl?.forEach((element: HTMLElement) => {
      element.tabIndex = -1;
    });

    if (this._navService?.focusedItem === this) {
      // called twice when clicking on already focused item with link (itemClick handler)
      this.setAttribute('tabindex', '0');
    }
  }

  private _labelChange(): void {
    const firstElement = this._contentList[0];
    const tabbableSelector =
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

    this._tabbableEl = [
      ...firstElement.querySelectorAll<HTMLElement>(tabbableSelector),
    ];
    if (firstElement.matches(tabbableSelector)) {
      this._tabbableEl.splice(0, 0, firstElement);
    }

    if (this._tabbableEl?.length) {
      this.setAttribute('role', 'none');
      this._tabbableEl[0].setAttribute('role', 'treeitem');

      this._tabbableEl.forEach((element: HTMLElement) => {
        element.tabIndex = -1;
      });
    } else {
      this.setAttribute('role', 'treeitem');
    }
  }

  private async _toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;
    return this._animationPlayer.playExclusive(animation());
  }

  private _bothChange(): void {
    if (this.hasChildren) {
      this.setAttribute('aria-expanded', this.expanded.toString());
    } else {
      this.removeAttribute('aria-expanded');
    }
  }

  private _expandedChange(oldValue: boolean): void {
    if (!oldValue) {
      return;
    }
    // await for load on demand children
    Promise.resolve().then(() => {
      if (this._navService?.focusedItem !== this && !this._isFocused) {
        scrollIntoView(this._navService?.focusedItem?.wrapper, {
          behavior: 'smooth',
        });
      }
    });
  }

  private _activeChange(): void {
    if (
      (this.active && this._navService?.activeItem === this) ||
      !this.active
    ) {
      return;
    }
    if (this._navService) {
      this._navService.setActiveItem(this, false);
    }
    // Expand and scroll to the newly active item
    this.tree?.expandToItem(this);
    // Await for expanding
    Promise.resolve().then(() => {
      scrollIntoView(this.wrapper, { behavior: 'smooth' });
    });
  }

  private _selectedChange(): void {
    if (this.selected && !this._selectionService?.isItemSelected(this)) {
      this._selectionService?.selectItemsWithNoEvent([this]);
    }
    if (!this.selected && this._selectionService?.isItemSelected(this)) {
      this._selectionService?.deselectItemsWithNoEvent([this]);
    }
  }

  private _handleChange(): void {
    this.hasChildren = !!this._directChildren.length;
  }

  /* blazorSuppress */
  /**
   * Returns a collection of child items.
   * If the parameter value is true returns all tree item's direct children,
   * otherwise - only the direct children.
   */
  public getChildren(
    options: { flatten: boolean } = { flatten: false }
  ): IgcTreeItemComponent[] {
    return options.flatten ? this._allChildren : this._directChildren;
  }

  /**
   * @hidden @internal
   * Expands the tree item.
   */
  public async expandWithEvent() {
    if (this.expanded) {
      return;
    }
    const args = {
      detail: this,
      cancelable: true,
    };

    const allowed = this.tree?.emitEvent('igcItemExpanding', args);

    if (!allowed) {
      return;
    }

    if (this.tree?.singleBranchExpand) {
      const pathSet = new Set(this.path.splice(0, this.path.length - 1));
      for (const item of this.tree.items) {
        if (!pathSet.has(item)) {
          item.collapseWithEvent();
        }
      }
    }

    this.expanded = true;
    if (await this._toggleAnimation('open')) {
      this.tree?.emitEvent('igcItemExpanded', { detail: this });
    }
  }

  /**
   * @hidden @internal
   * Collapses the tree item.
   */
  public async collapseWithEvent() {
    if (!this.expanded) {
      return;
    }
    const args = {
      detail: this,
      cancelable: true,
    };

    const allowed = this.tree?.emitEvent('igcItemCollapsing', args);

    if (!allowed) {
      return;
    }

    this.expanded = false;
    if (await this._toggleAnimation('close')) {
      this.tree?.emitEvent('igcItemCollapsed', { detail: this });
    }
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
    const indicatorParts = {
      indicator: true,
      rtl: !(this.tree ? isLTR(this.tree) : true),
    };

    return html`
      <div id="wrapper" part=${partMap(this._parts)}>
        <div
          style="width: calc(${this.level} * var(--igc-tree-indentation-size))"
          part="indentation"
          aria-hidden="true"
        >
          <slot name="indentation"></slot>
        </div>
        <div part=${partMap(indicatorParts)} aria-hidden="true">
          ${
            this.loading
              ? html`
                  <slot name="loading">
                    <igc-circular-progress
                      indeterminate
                    ></igc-circular-progress>
                  </slot>
                `
              : html`
                  <slot
                    name="indicator"
                    @click=${
                      this.tree?.toggleNodeOnClick
                        ? nothing
                        : this._expandIndicatorClick
                    }
                  >
                    ${
                      this.hasChildren
                        ? html`
                            <igc-icon
                              aria-label=${ifDefined(
                                this.expanded
                                  ? this.tree?.resourceStrings.collapse
                                  : this.tree?.resourceStrings.expand
                              )}
                              name=${
                                this.expanded ? 'tree_collapse' : 'tree_expand'
                              }
                              collection="default"
                            >
                            </igc-icon>
                          `
                        : ''
                    }
                  </slot>
                `
          }
        </div>
        ${
          this.tree?.selection !== 'none'
            ? html`
                <div part="select" aria-hidden="true">
                  <igc-checkbox
                    tabindex="-1"
                    @click=${this._selectorClick}
                    .checked=${this.selected}
                    .indeterminate=${this.indeterminate}
                    .disabled=${this.disabled}
                  >
                  </igc-checkbox>
                </div>
              `
            : ''
        }
        <div part="label">
          <slot
            name="label"
            @slotchange=${this._labelChange}
            @focusin=${this._onFocusIn}
            @focusout=${this._onFocusOut}
          >
            <span part="text">${this.label}</span>
          </slot>
        </div>
      </div>
      <div ${ref(this._groupRef)} role="group" .inert=${!this.expanded}>
        <slot @slotchange=${this._handleChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
