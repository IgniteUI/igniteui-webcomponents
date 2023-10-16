import { LitVirtualizer } from '@lit-labs/virtualizer';
import { registerComponent } from '../common/definitions/register.js';

/* blazorSuppress */
/* blazorAlternateBaseType: BaseElement */
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
