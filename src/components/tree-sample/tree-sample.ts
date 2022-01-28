import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import IgcTreeItemComponent from '../tree/tree-item.js';
import { IgcSelectionEventArgs } from '../tree/tree.common.js';
import IgcTreeComponent from '../tree/tree.js';
import { DataService } from './data.js';

/**
 * Icon component
 *
 * @element igc-icon
 *
 *
 */
@customElement('igc-tree-sample')
export default class IgcTreeSampleComponent extends SizableMixin(LitElement) {
  /** @private */
  public static tagName = 'igc-tree-sample';

  @query('igc-tree')
  private tree!: IgcTreeComponent;

  @property({ attribute: false })
  public data: any[] = [];

  constructor() {
    super();
    this.size = 'medium';
  }

  public override connectedCallback() {
    super.connectedCallback();
    DataService.getData().then((data) => (this.data = data));
  }

  private handleSelection(ev: IgcSelectionEventArgs) {
    let prevSelectedItems;
    if (this.tree) {
      prevSelectedItems = this.tree.items.filter((item) => item.selected);
    }
    ev.detail.newSelection.forEach((item: IgcTreeItemComponent) => {
      if (item.value) {
        // item.value.selected = true;
      }
    });
    const newSelectedItems = new Set(ev.detail.newSelection);
    prevSelectedItems?.forEach((item) => {
      if (!newSelectedItems.has(item)) {
        // item.value.selected = false;
      }
    });
    console.log(this.data);
  }

  private async handleExpanded(ev: CustomEvent) {
    // if expanded through api handle manually the data as well because the event won't be emitted
    if (ev.detail.value) {
      ev.detail.value.expanded = true;
      if (ev.detail.value.loadOnDemand) {
        ev.detail.loading = true;
        await this.loadNestedData(ev.detail.value);
        ev.detail.loading = false;
      }
    }
    console.log(this.data);
  }

  private handleCollapsed(ev: CustomEvent) {
    if (ev.detail.value) {
      ev.detail.value.expanded = false;
    }
    console.log(this.data);
  }

  private async loadNestedData(dataItem: any) {
    this.requestUpdate();
    await DataService.getData(dataItem).then(
      (data) => (dataItem.children = data)
    );
    dataItem.children.forEach(
      (item: any) => (item.selected = dataItem.selected)
    );
    dataItem.loadOnDemand = false;
    this.requestUpdate();
  }

  private renderItem(dataItem: any) {
    return html`
      <igc-tree-item
        .expanded=${dataItem.expanded}
        .selected=${dataItem.selected}
        .label=${dataItem.label}
        .value=${dataItem}
      >
        <div
          slot="loading"
          style="width: 20px; height: 20px; background-image: url('http://localhost:8000/src/components/tree-sample/assets/Settings.gif'); background-size: 20px 20px"
        ></div>
        ${dataItem.loadOnDemand
          ? html`
              <div slot="indicator">
                <igc-icon
                  name="keyboard_arrow_right"
                  collection="internal"
                ></igc-icon>
              </div>
            `
          : ''}
        ${dataItem.children
          ? html`
              ${dataItem.children.map((child: any) => this.renderItem(child))}
            `
          : ''}
      </igc-tree-item>
    `;
  }

  protected override render() {
    return html`
      <div style="height: 250px;">
        <igc-tree
          id="tree"
          selection="cascade"
          .size=${this.size}
          @igcSelection=${this.handleSelection}
          @igcItemExpanded=${this.handleExpanded}
          @igcItemCollapsed=${this.handleCollapsed}
        >
          ${this.data.map((dataItem) => this.renderItem(dataItem))}
        </igc-tree>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-tree-sample': IgcTreeSampleComponent;
  }
}
