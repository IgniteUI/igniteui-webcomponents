import { property, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { arrayOf } from '../common/util.js';
import { styles } from './tree-item.material.css';
import { IgcTreeSelectionService } from './tree.selection.js';
import IgcTreeComponent from './tree';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';
import { IgcTreeNavigationService } from './tree.navigation.js';
import { classMap } from 'lit/directives/class-map.js';

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

  public selectionService!: IgcTreeSelectionService;
  public navService!: IgcTreeNavigationService;

  private _disabled = false;

  @state()
  private _expanded = false;

  @state()
  public directChildren: any;

  @state()
  private isFocused!: boolean;

  @property()
  public selection: IgcTreeSelectionType = IgcTreeSelectionType.None;

  @property()
  public value: any;

  /** The orientation of the multiple months displayed in days view. */
  @property({ reflect: true, type: Boolean })
  public get expanded(): boolean {
    return this._expanded;
  }

  public set expanded(val: boolean) {
    this._expanded = val;
    this.navService.update_visible_cache(this, val);
  }

  @property({ type: Boolean })
  public set active(value: boolean) {
    if (value) {
      this.navService.activeItem = this;
      // this.tree.activeNodeBindingChange.emit(this);
    }
  }

  public get active(): boolean {
    return this.navService.activeItem === this;
  }

  @property({ reflect: true, type: Boolean })
  public get disabled(): boolean {
    return this._disabled;
  }

  public set disabled(val: boolean) {
    this._disabled = val;
    this.navService.update_disabled_cache(this);
  }

  @property({ reflect: true, type: Boolean })
  public get selected(): boolean {
    return this.selectionService.isItemSelected(this);
  }

  public set selected(val: boolean) {
    // if (!(this.tree?.nodes && this.tree.nodes.find((e) => e === this)) && val) {
    //   this.tree.forceSelect.push(this);
    //   return;
    // }
    if (val && !this.selectionService.isItemSelected(this)) {
      this.selectionService.selectItemsWithNoEvent([this]);
    }
    if (!val && this.selectionService.isItemSelected(this)) {
      this.selectionService.deselectItemsWithNoEvent([this]);
    }
  }

  public get indeterminate(): boolean {
    return this.selectionService.isItemIndeterminate(this);
  }

  public get tree(): IgcTreeComponent {
    return this.closest('igc-tree') as IgcTreeComponent;
  }

  public get path(): IgcTreeItemComponent[] {
    return this.parentItem?.path ? [...this.parentItem.path, this] : [this];
  }

  public get parentItem(): IgcTreeItemComponent | null {
    return this.parentElement?.tagName.toLowerCase() === 'igc-tree-item'
      ? (this.parentElement as IgcTreeItemComponent)
      : null;
  }

  public get level(): number {
    return this.parentItem ? this.parentItem.level + 1 : 0;
  }

  public get allChildren(): Array<IgcTreeItemComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-item`));
  }

  public get focused() {
    return this.isFocused && this.navService.focusedItem === this;
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
    this.navService.update_visible_cache(this, this._expanded);
    this.setAttribute('role', 'treeitem');
    this.addEventListener('focusout', this.clearFocus);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('pointerdown', this.onPointerDown);
  }

  private expand(): void {
    if (this.expanded) {
      return;
    }
    const args = {
      detail: {
        node: this,
      },
      cancelable: true,
    };

    const allowed = this.tree.emitEvent('igcItemExpanding', args);

    if (!allowed) {
      return;
    }

    if (this.tree.singleBranchExpand) {
      this.tree.findItems(this, this.siblingComparer)?.forEach((i) => {
        i.expanded = false;
      });
    }

    this.expanded = true;
    this.tree.emitEvent('igcItemExpanded', { detail: this });
  }

  private collapse(): void {
    if (!this.expanded) {
      return;
    }
    const args = {
      detail: {
        node: this,
      },
      cancelable: true,
    };

    const allowed = this.tree.emitEvent('igcItemCollapsing', args);

    if (!allowed) {
      return;
    }
    this.expanded = false;
    this.tree.emitEvent('igcItemCollapsed', { detail: this });
  }

  private siblingComparer: (
    value: IgcTreeItemComponent,
    item: IgcTreeItemComponent
  ) => boolean = (value: IgcTreeItemComponent, item: IgcTreeItemComponent) =>
    item !== value && item.level === value.level;

  private indicatorClick(): void {
    if (!this.expanded) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  public onPointerDown(event: MouseEvent) {
    event.stopPropagation();
    this.navService.setFocusedAndActiveItem(this);
  }

  private handleFocusIn(ev: Event) {
    ev.stopPropagation();
    if (this.disabled) {
      return;
    }
    if (this.navService.focusedItem !== this) {
      if (
        (ev.target as HTMLElement).tagName.toLowerCase() !== 'igc-tree-item'
      ) {
        this.navService.focusItem(this, false);
      }
      this.navService.focusItem(this);
    }
    this.isFocused = true;
  }

  private onSelectorClick(event: MouseEvent) {
    event.preventDefault();
    if (event.shiftKey) {
      this.selectionService.selectMultipleItems(this);
      return;
    }
    if (this.selected) {
      this.selectionService.deselectItem(this);
    } else {
      this.selectionService.selectItem(this);
    }
  }

  public handleChange(event: any) {
    this.directChildren = event.target.assignedNodes();
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
          <!--<igc-icon [attr.aria-label]="expanded ? resourceStrings.igx_collapse : resourceStrings.igx_expand"></igc-icon> -->
          <igc-icon
            name="${this.expanded
              ? 'keyboard_arrow_down'
              : 'keyboard_arrow_right'}"
            collection="internal"
            ?hidden="${!this.directChildren?.length}"
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
      <slot
        name="child"
        @slotchange=${this.handleChange}
        ?hidden="${!this.expanded}"
      ></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-item': IgcTreeItemComponent;
  }
}
