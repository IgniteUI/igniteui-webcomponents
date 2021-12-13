import { property, state } from 'lit/decorators.js';
import { html, LitElement } from 'lit';
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
  @property()
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

  @property({ attribute: 'selection', reflect: true })
  public selection: 'None' | 'Multiple' | 'Cascade' = 'None';

  protected render() {
    return html`
      <div class="tree-node__header">
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
        <section part="selectIndicator" ?hidden="${this.selection === 'None'}">
          <igc-checkbox .checked="false" .indeterminate="false"></igc-checkbox>
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
