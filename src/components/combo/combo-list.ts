import { LitVirtualizer } from '@lit-labs/virtualizer';

export default class IgcComboListComponent extends LitVirtualizer {
  public static readonly tagName = 'igc-combo-list';
  public override scroller = true;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-list': IgcComboListComponent;
  }
}
