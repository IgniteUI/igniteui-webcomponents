import { property, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
import { arrayOf } from '../common/util.js';
import { styles } from './tree-node.material.css';
import IgcTreeComponent from './tree';

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
export default class IgcTreeNodeComponent extends LitElement {
  /** @private */
  public static tagName = 'igc-tree-node';

  /** @private */
  public static styles = styles;

  /** The orientation of the multiple months displayed in days view. */
  @property({ reflect: true, type: Boolean })
  public expanded = false;

  @state()
  private childrens: any;

  private handleClick(): void {
    this.expanded = !this.expanded;
  }

  constructor() {
    super();
  }

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
  }

  public handleChange(event: any) {
    this.childrens = event.target.assignedNodes();
  }

  public get tree(): IgcTreeComponent {
    return this.closest('igc-tree') as IgcTreeComponent;
  }

  public get level(): number {
    return this.parentElement?.tagName.toLowerCase() === 'igc-tree'
      ? 0
      : (this.parentElement as IgcTreeNodeComponent).level + 1;
  }

  @property()
  public selection: 'none' | 'multiple' | 'cascade' = 'none';

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
          ?hidden="${!this.childrens?.length}"
        >
          <!--<igc-icon [attr.aria-label]="expanded ? resourceStrings.igx_collapse : resourceStrings.igx_expand"></igc-icon> -->
          <igc-icon
            name="${this.expanded
              ? 'keyboard_arrow_down'
              : 'keyboard_arrow_right'}"
            collection="internal"
          ></igc-icon>
        </section>
        <section part="selectIndicator" ?hidden="${this.selection === 'none'}">
          <igc-checkbox></igc-checkbox>
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
