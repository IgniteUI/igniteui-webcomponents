import { html, LitElement, type PropertyValues } from 'lit';
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
  scrollIntoView,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcCircularProgressComponent from '../progress/circular-progress.js';
import { styles } from './themes/item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item.common.css.js';
import {
  clearTreeItemAria,
  getTreeItemChildren,
  hasTreeItemChildren,
  setAriaState,
  TREE_ITEM_TAG,
  TREE_TAG,
} from './tree.common.js';
import type IgcTreeComponent from './tree.js';
import type { IgcTreeNavigationService } from './tree.navigation.js';
import type { IgcTreeSelectionService } from './tree.selection.js';

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
  private _ariaDelegate?: HTMLElement;

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

  /** Direct `igc-tree-item` light-DOM children. */
  private get _directChildren(): IgcTreeItemComponent[] {
    return getTreeItemChildren(this);
  }

  private get _allChildren(): IgcTreeItemComponent[] {
    const result: IgcTreeItemComponent[] = [];
    this._collectDescendants(result);
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
    this._syncAria();
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

  protected override updated(changed: PropertyValues<this>): void {
    super.updated(changed);

    // ARIA state lives outside the shadow template, so it is refreshed once per
    // update rather than tracked per property.
    this._syncAria();
  }

  /**
   * @hidden @internal
   * Appends every descendant (pre-order) into `out`. Accumulating into a single
   * array keeps a deep tree's flatten cost linear rather than quadratic.
   */
  public _collectDescendants(out: IgcTreeItemComponent[]): void {
    for (const child of getTreeItemChildren(this)) {
      out.push(child);
      child._collectDescendants(out);
    }
  }

  /**
   * The full path to the tree item, starting from the top-most ancestor.
   *
   * `parent` is read into a local first: reading `parent.path` twice per level
   * would make a single access cost 2^depth instead of `depth`.
   */
  public get path(): IgcTreeItemComponent[] {
    const parent = this.parent;
    return parent ? [...parent.path, this] : [this];
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
    if (this.disabled || this.tree?.toggleNodeOnClick) {
      return;
    }
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
      this._setTabbable(0);
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
        this._setTabbable(0);
      }
      this.removeAttribute('tabIndex');
      this._isFocused = true;
      this._focusedProgrammatically = false;
    }
  }

  private _onFocusOut(ev: Event): void {
    ev?.stopPropagation();
    this._isFocused = false;
    this._setTabbable(-1);

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

    this._setTabbable(-1);
    this._syncAria();
  }

  /** Applies `value` as the tabIndex of every focusable element in the label. */
  private _setTabbable(value: number): void {
    for (const element of this._tabbableEl ?? []) {
      element.tabIndex = value;
    }
  }

  /**
   * The element carrying the item's `treeitem` semantics: the host, or the
   * first focusable element in the label slot when there is one, so that what
   * the user reaches by keyboard is what gets announced. All ARIA state has to
   * move with the role - left on a `role="none"` host it would be ignored.
   */
  private get _ariaTarget(): HTMLElement {
    return this._tabbableEl?.length ? this._tabbableEl[0] : this;
  }

  private _syncAria(): void {
    const target = this._ariaTarget;
    const delegated = target !== this;

    if (this._ariaDelegate && this._ariaDelegate !== target) {
      clearTreeItemAria(this._ariaDelegate);
      this._ariaDelegate.removeAttribute('role');
    }
    this._ariaDelegate = delegated ? target : undefined;

    this.setAttribute('role', delegated ? 'none' : 'treeitem');
    if (delegated) {
      target.setAttribute('role', 'treeitem');
      clearTreeItemAria(this);
    }

    setAriaState(
      target,
      'aria-expanded',
      this.hasChildren ? String(this.expanded) : null
    );
    setAriaState(
      target,
      'aria-selected',
      this.tree && this.tree.selection !== 'none' ? String(this.selected) : null
    );
    setAriaState(target, 'aria-disabled', this.disabled ? 'true' : null);
  }

  private async _toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;
    return this._animationPlayer.playExclusive(animation());
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
    this.hasChildren = hasTreeItemChildren(this);
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
      const ancestors = new Set(this.path.slice(0, -1));
      for (const item of this.tree.items) {
        if (!ancestors.has(item)) {
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
    return html`
      <div id="wrapper" part=${partMap(this._parts)}>
        <div
          style="width: calc(${this.level} * var(--igc-tree-indentation-size))"
          part="indentation"
          aria-hidden="true"
        >
          <slot name="indentation"></slot>
        </div>
        <div part="indicator" aria-hidden="true">
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
                  <slot name="indicator" @click=${this._expandIndicatorClick}>
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
