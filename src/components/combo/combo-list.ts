import { LitVirtualizer } from '@lit-labs/virtualizer/LitVirtualizer.js';

import { registerComponent } from '../common/definitions/register.js';

/* blazorSuppress */
/* blazorAlternateBaseType: BaseElement */
export default class IgcComboListComponent extends LitVirtualizer {
  public static readonly tagName = 'igc-combo-list';
  public override scroller = true;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcComboListComponent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-list': IgcComboListComponent;
  }
}
