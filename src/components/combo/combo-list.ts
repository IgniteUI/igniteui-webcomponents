import { LitVirtualizer } from '@lit-labs/virtualizer/LitVirtualizer.js';
import { registerComponent } from '../common/util.js';

export default class IgcComboListComponent extends LitVirtualizer {
  public static readonly tagName = 'igc-combo-list';
  public override scroller = true;

  public static register() {
    registerComponent(this);
  }

  public override async connectedCallback() {
    await super.layoutComplete;

    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'listbox');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-list': IgcComboListComponent;
  }
}
