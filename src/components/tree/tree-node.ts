import { property, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { arrayOf } from '../common/util.js';
import { styles } from './tree-node.material.css';
import { IgcTreeSelectionService } from './tree.selection.js';
import IgcTreeComponent from './tree';
import { IgcTreeEventMap, IgcTreeSelectionType } from './tree.common.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';

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
export default class IgcTreeNodeComponent extends EventEmitterMixin<
  IgcTreeEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** @private */
  public static tagName = 'igc-tree-node';

  /** @private */
  public static styles = styles;

  public selectionService!: IgcTreeSelectionService;

  @state()
  public directChildren: any;

  /** The orientation of the multiple months displayed in days view. */
  @property({ reflect: true, type: Boolean })
  public expanded = false;

  @property()
  public selection: IgcTreeSelectionType = 'none';

  @property({ reflect: true, type: Boolean })
  public get selected(): boolean {
    return this.selectionService.isNodeSelected(this);
  }

  public set selected(val: boolean) {
    // if (!(this.tree?.nodes && this.tree.nodes.find((e) => e === this)) && val) {
    //   this.tree.forceSelect.push(this);
    //   return;
    // }
    if (val && !this.selectionService.isNodeSelected(this)) {
      this.selectionService.selectNodesWithNoEvent([this]);
    }
    if (!val && this.selectionService.isNodeSelected(this)) {
      this.selectionService.deselectNodesWithNoEvent([this]);
    }
  }

  public get indeterminate(): boolean {
    return this.selectionService.isNodeIndeterminate(this);
  }

  public get tree(): IgcTreeComponent {
    return this.closest('igc-tree') as IgcTreeComponent;
  }

  public get parentTreeNode(): IgcTreeNodeComponent | null {
    return this.parentElement?.tagName.toLowerCase() === 'igc-tree-node'
      ? (this.parentElement as IgcTreeNodeComponent)
      : null;
  }

  public get level(): number {
    return this.parentTreeNode ? this.parentTreeNode.level + 1 : 0;
  }

  public get allChildren(): Array<IgcTreeNodeComponent> {
    return Array.from(this.querySelectorAll(`igc-tree-node`));
  }

  constructor() {
    super();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
  }

  private handleClick(): void {
    this.expanded = !this.expanded;
  }

  private onSelectorClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    // this.navService.handleFocusedAndActiveNode(this);
    if (event.shiftKey) {
      this.selectionService.selectMultipleNodes(this);
      return;
    }
    if (this.selected) {
      this.selectionService.deselectNode(this);
    } else {
      this.selectionService.selectNode(this);
    }
  }

  public handleChange(event: any) {
    this.directChildren = event.target.assignedNodes();
  }

  protected render() {
    return html`
      <div class="tree-node__header">
        <section part="spacer">
          ${arrayOf(this.level).map(
            () => html`<span class="igc-tree-node__spacer"></span>`
          )}
        </section>
        <section
          part="expandIndicator"
          @click="${this.handleClick}"
          style="width: 20px; height: 53.6px"
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
          ?hidden="${this.selection === IgcTreeSelectionType.None}"
        >
          <igc-checkbox
            @click=${this.onSelectorClick}
            .checked=${this.selected}
            .indeterminate=${this.indeterminate}
          ></igc-checkbox>
        </section>
        <section part="header">
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
    'igc-tree-node': IgcTreeNodeComponent;
  }
}
