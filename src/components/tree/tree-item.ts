import { LitElement, html, nothing } from 'lit';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { type Ref, createRef, ref } from 'lit/directives/ref.js';

import { addAnimationController } from '../../animations/player.js';
import { growVerIn, growVerOut } from '../../animations/presets/grow/index.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import {
  findElementFromEventPath,
  isLTR,
  partNameMap,
} from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcCircularProgressComponent from '../progress/circular-progress.js';
import { styles } from './themes/item.base.css.js';
import { all } from './themes/item.js';
import { styles as shared } from './themes/shared/item.common.css.js';
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
@themes(all)
export default class IgcTreeItemComponent extends LitElement {
  public static readonly tagName = 'igc-tree-item';
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

  private tabbableEl?: HTMLElement[];
  private focusedProgrammatically = false;

  private groupRef: Ref<HTMLElement> = createRef();

  private animationPlayer = addAnimationController(this, this.groupRef);

  /* blazorSuppress */
  /** A reference to the tree the item is a part of. */
  public tree?: IgcTreeComponent;
  /** The parent item of the current tree item (if any) */
  public parent: IgcTreeItemComponent | null = null;

  /* blazorSuppress */
  /** @private */
  public init = false;

  @queryAssignedElements({ slot: 'label', flatten: true })
  private contentList!: Array<HTMLElement>;

  /* blazorSuppress */
  /** @private */
  @query('#wrapper')
  public wrapper!: HTMLElement;

  @state()
  private isFocused = false;

  /* blazorSuppress */
  /** @private */
  @state()
  public hasChildren = false;

  /** The depth of the item, relative to the root. */
  @state()
  public level = 0;

  /* blazorSuppress */
  /** @private */
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

  private async toggleAnimation(dir: 'open' | 'close') {
    const animation = dir === 'open' ? growVerIn : growVerOut;

    const [_, event] = await Promise.all([
      this.animationPlayer.stopAll(),
      this.animationPlayer.play(animation()),
    ]);

    return event.type === 'finish';
  }

  @watch('expanded', { waitUntilFirstUpdate: true })
  @watch('hasChildren', { waitUntilFirstUpdate: true })
  protected bothChange(): void {
    if (this.hasChildren) {
      this.setAttribute('aria-expanded', this.expanded.toString());
    } else {
      this.removeAttribute('aria-expanded');
    }
  }

  @watch('expanded')
  protected expandedChange(oldValue: boolean): void {
    // always update the visible cache
    this.navService?.update_visible_cache(this, this.expanded);
    if (!oldValue) {
      return;
    }
    // await for load on demand children
    Promise.resolve().then(() => {
      if (this.navService?.focusedItem !== this && !this.isFocused) {
        this.navService?.focusedItem?.wrapper?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });
  }

  @watch('active', { waitUntilFirstUpdate: true })
  protected activeChange(): void {
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
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    });
  }

  @watch('disabled')
  protected disabledChange(): void {
    this.navService?.update_disabled_cache(this);
  }

  @watch('selected', { waitUntilFirstUpdate: true })
  protected selectedChange(): void {
    if (this.selected && !this.selectionService?.isItemSelected(this)) {
      this.selectionService?.selectItemsWithNoEvent([this]);
    }
    if (!this.selected && this.selectionService?.isItemSelected(this)) {
      this.selectionService?.deselectItemsWithNoEvent([this]);
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.tree = this.closest('igc-tree') as IgcTreeComponent;
    this.parent = this.parentElement?.closest(
      'igc-tree-item'
    ) as IgcTreeItemComponent | null;
    this.level = this.parent ? this.parent.level + 1 : 0;
    this.setAttribute('role', 'treeitem');
    this.addEventListener('blur', this.onBlur);
    this.addEventListener('focus', this.onFocus);
    this.addEventListener('click', this.itemClick);
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
    return this.allChildren.filter(
      (x) => (x.parent ?? x.parentElement?.closest('igc-tree-item')) === this
    ) as IgcTreeItemComponent[];
  }

  private get allChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll('igc-tree-item'));
  }

  /** The full path to the tree item, starting from the top-most ancestor. */
  public get path(): IgcTreeItemComponent[] {
    return this.parent?.path ? [...this.parent.path, this] : [this];
  }

  private itemClick(event: MouseEvent): void {
    if (
      this.disabled ||
      this !== findElementFromEventPath(this.tagName, event)
    ) {
      return;
    }
    this.tabIndex = 0;
    if (this.tree?.toggleNodeOnClick && event.button === 0) {
      if (this.expanded) {
        this.collapseWithEvent();
      } else {
        this.expandWithEvent();
      }
    }
    this.navService?.setFocusedAndActiveItem(this, true, true);
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
    if (this.tree?.toggleNodeOnClick) {
      event.stopPropagation();
    }
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
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
    if (this.tabbableEl?.length) {
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
        this.tabbableEl?.forEach((element: HTMLElement) => {
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
    this.tabbableEl?.forEach((element: HTMLElement) => {
      element.tabIndex = -1;
    });

    if (this.navService?.focusedItem === this) {
      // called twice when clicking on already focused item with link (itemClick handler)
      this.setAttribute('tabindex', '0');
    }
  }

  private labelChange(): void {
    const firstElement = this.contentList[0];
    const tabbableSelector =
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

    this.tabbableEl = [
      ...firstElement.querySelectorAll<HTMLElement>(tabbableSelector),
    ];
    if (firstElement.matches(tabbableSelector)) {
      this.tabbableEl.splice(0, 0, firstElement);
    }

    if (this.tabbableEl?.length) {
      this.setAttribute('role', 'none');
      this.tabbableEl[0].setAttribute('role', 'treeitem');

      this.tabbableEl.forEach((element: HTMLElement) => {
        element.tabIndex = -1;
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

  /* blazorSuppress */
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
    }
    return this.directChildren;
  }

  /**
   * @private
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
      this.tree.items.forEach((item: IgcTreeItemComponent) => {
        if (!pathSet.has(item)) {
          item.collapseWithEvent();
        }
      });
    }

    this.expanded = true;
    if (await this.toggleAnimation('open')) {
      this.tree?.emitEvent('igcItemExpanded', { detail: this });
    }
  }

  /**
   * @private
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
    if (await this.toggleAnimation('close')) {
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
    const ltr = this.tree ? isLTR(this.tree) : true;

    return html`
      <div id="wrapper" part="wrapper ${partNameMap(this.parts)}">
        <div
          style="width: calc(${this.level} * var(--igc-tree-indentation-size))"
          part="indentation"
          aria-hidden="true"
        >
          <slot name="indentation"></slot>
        </div>
        <div part="indicator" aria-hidden="true">
          ${this.loading
            ? html`
                <slot name="loading">
                  <igc-circular-progress indeterminate></igc-circular-progress>
                </slot>
              `
            : html`
                <slot
                  name="indicator"
                  @click=${this.tree?.toggleNodeOnClick
                    ? nothing
                    : this.expandIndicatorClick}
                >
                  ${this.hasChildren
                    ? html`
                        <igc-icon
                          name=${this.expanded
                            ? 'keyboard_arrow_down'
                            : !ltr
                              ? 'navigate_before'
                              : 'keyboard_arrow_right'}
                          collection="internal"
                        >
                        </igc-icon>
                      `
                    : ''}
                </slot>
              `}
        </div>
        ${this.tree?.selection !== 'none'
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
      <div ${ref(this.groupRef)} role="group" aria-hidden=${!this.expanded}>
        <slot @slotchange=${this.handleChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
