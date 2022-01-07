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

/**
 * The list-item component is a container
 * intended for row items in the list component.
 *
 * @element igc-list-item
 *
 * @slot - Renders custom content.
 * @slot start - Renders content before all other content.
 * @slot end - Renders content after all other content.
 * @slot title - Renders the title.
 * @slot subtitle - Renders the subtitle.
 *
 * @csspart start - The start container.
 * @csspart end - The end container.
 * @csspart content - The header and custom content container.
 * @csspart header - The title and subtitle container.
 * @csspart title - The title container.
 * @csspart subtitle - The subtitle container.
 */
export default class IgcTreeItemComponent extends EventEmitterMixin<
  IgcTreeEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-tree-item';

  /** @private */
  public static styles = styles;

  public tree?: IgcTreeComponent;
  public parentItem: IgcTreeItemComponent | null = null;

  /**
   * Store the current selection state before changing the items' parent (drag/drop)
   * Update those properties in disconnectedCallback
   * Use them in the connectedCallback to retrieve the previous state
   */
  // private _hasBeenSelected = false;
  // private _hasBeenIndeterminate = false;

  @query('.tree-node__header')
  public header: any;

  @state()
  public hasChildren = false;

  @state()
  public indeterminate = false;

  @state()
  private isFocused = false;

  @property()
  public selection: IgcTreeSelectionType = IgcTreeSelectionType.None;

  @property()
  public value: any;

  @property({ reflect: true, type: Boolean })
  public loading = false;

  /** The orientation of the multiple months displayed in days view. */
  @property({ reflect: true, type: Boolean })
  public expanded = false;

  @watch('expanded')
  public expandedChange(): void {
    this.navService?.update_visible_cache(this, this.expanded);
    this.tree?.scrollItemIntoView(this.navService?.focusedItem?.header);
  }

  @watch('active', { waitUntilFirstUpdate: true })
  public activeChange(): void {
    if (this.active) {
      if (this.navService) {
        this.navService.activeItem = this;
      }
      this.tree?.expandToItem(this);
      requestAnimationFrame(() => {
        this.tree?.scrollItemIntoView(this.header);
        // this.header.scrollIntoView();
      });
    }
  }

  @property({ type: Boolean })
  public active = false;

  @watch('disabled')
  public disabledChange() {
    this.navService?.update_disabled_cache(this);
  }

  @property({ reflect: true, type: Boolean })
  public disabled = false;

  @watch('selected', { waitUntilFirstUpdate: true })
  public selectedChange() {
    if (
      (this.selectionService?.isItemSelected(this) && this.selected) ||
      (!this.selectionService?.isItemSelected(this) && !this.selected)
    ) {
      return;
    }

    if (
      !(this.tree?.connected && this.tree?.items.find((i) => i === this)) &&
      this.selected
    ) {
      this.tree?.forceSelect.push(this);
      return;
    }

    if (this.selected && !this.selectionService?.isItemSelected(this)) {
      this.selectionService?.selectItemsWithNoEvent([this]);
    }
    if (!this.selected && this.selectionService?.isItemSelected(this)) {
      this.selectionService?.deselectItemsWithNoEvent([this]);
    }
  }

  @property({ reflect: true, type: Boolean })
  public selected = false;

  // public get indeterminate(): boolean {
  //   return this.selectionService?.isItemIndeterminate(this) ?? false;
  // }

  public get path(): IgcTreeItemComponent[] {
    return this.parentItem?.path ? [...this.parentItem.path, this] : [this];
  }

  public get level(): number {
    return this.parentItem ? this.parentItem.level + 1 : 0;
  }

  public get directChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.children).filter(
      (x) => x.tagName.toLowerCase() === 'igc-tree-item'
    ) as IgcTreeItemComponent[];
  }

  public get allChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-item`));
  }

  public get focused() {
    return this.isFocused && this.navService?.focusedItem === this;
  }

  private get selectionService() {
    return this.tree?.selectionService;
  }

  private get navService() {
    return this.tree?.navService;
  }

  private get classes() {
    return {
      'tree-node__header': true,
      'tree-node__wrapper--focused': this.focused,
      'tree-node__wrapper--active': this.active,
    };
  }

  constructor() {
    super();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.tree = this.closest('igc-tree') as IgcTreeComponent;
    this.parentItem =
      this.parentElement?.tagName.toLowerCase() === 'igc-tree-item'
        ? (this.parentElement as IgcTreeItemComponent)
        : null;
    this.navService?.update_visible_cache(this, this.expanded);
    this.setAttribute('role', 'treeitem');
    this.addEventListener('focusout', this.clearFocus);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('pointerdown', this.onPointerDown);
    this.selectedChange();
    this.activeChange();
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.selectionService?.ensureStateOnItemDelete(this);
  }

  public expand(): void {
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
      this.tree?.findItems(this, this.siblingComparer)?.forEach((i) => {
        i.expanded = false;
      });
    }

    this.expanded = true;
    this.tree?.emitEvent('igcItemExpanded', { detail: this });
  }

  public collapse(): void {
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

  private siblingComparer: (
    value: IgcTreeItemComponent,
    item: IgcTreeItemComponent
  ) => boolean = (value: IgcTreeItemComponent, item: IgcTreeItemComponent) =>
    item !== value && item.level === value.level;

  private indicatorClick(): void {
    if (this.loading) {
      return;
    }
    if (!this.expanded) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  public onPointerDown(event: MouseEvent) {
    event.stopPropagation();
    this.navService?.setFocusedAndActiveItem(this);
  }

  private handleFocusIn(ev: Event) {
    ev.stopPropagation();
    if (this.disabled) {
      return;
    }
    if (this.navService?.focusedItem !== this) {
      if (
        (ev.target as HTMLElement).tagName.toLowerCase() !== 'igc-tree-item'
      ) {
        this.navService?.focusItem(this, false);
      }
      this.navService?.focusItem(this);
    }
    this.isFocused = true;
  }

  private onSelectorClick(event: MouseEvent) {
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

  public handleChange(event: any) {
    this.hasChildren = !!event.target.assignedNodes().length;
  }

  public clearFocus(): void {
    this.isFocused = false;
  }

  protected render() {
    return html`
      <div part="wrapper" class=${classMap(this.classes)}>
        <section part="spacer">
          ${arrayOf(this.level).map(
            () => html`<span class="tree-node__spacer"></span>`
          )}
        </section>
        <section
          part="expandIndicator"
          @click="${this.indicatorClick}"
          class="tree-node__toggle-button"
        >
          <igc-icon
            name="navigate_before"
            collection="internal"
            ?hidden="${!this.loading}"
          ></igc-icon>

          <igc-icon
            name="${this.expanded
              ? 'keyboard_arrow_down'
              : 'keyboard_arrow_right'}"
            collection="internal"
            ?hidden="${this.loading || !this.directChildren?.length}"
          ></igc-icon>
        </section>
        <section
          part="selectIndicator"
          class="tree-node__select"
          ?hidden="${this.selection === IgcTreeSelectionType.None}"
        >
          <igc-checkbox
            @click=${this.onSelectorClick}
            .checked=${this.selected}
            .indeterminate=${this.indeterminate}
            .disabled=${this.disabled}
            tabindex="-1"
          ></igc-checkbox>
        </section>
        <section part="header" class="tree-node__content">
          <slot name="header"></slot>
        </section>
      </div>
      <slot @slotchange=${this.handleChange} ?hidden="${!this.expanded}"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
