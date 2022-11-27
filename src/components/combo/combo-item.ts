import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/item/combo-item.base.css';
import { styles as bootstrap } from '../dropdown/themes/light/dropdown-item.bootstrap.css';
import { styles as fluent } from '../dropdown/themes/light/dropdown-item.fluent.css';
import { styles as indigo } from '../dropdown/themes/light/dropdown-item.indigo.css';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import IgcCheckboxComopnent from '../checkbox/checkbox.js';
import { defineComponents } from '../common/definitions/defineComponents.js';

defineComponents(IgcCheckboxComopnent);

@themes({ bootstrap, fluent, indigo })
export default class IgcComboItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-item';
  public static override styles = styles;

  @property({ attribute: false })
  public index!: number;

  /**
   * Determines whether the item is selected.
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the item is active.
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  @watch('selected')
  protected selectedChange() {
    this.selected
      ? this.setAttribute('aria-selected', 'true')
      : this.removeAttribute('aria-selected');
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'option');
  }

  protected override render() {
    return html`
      <section part="prefix">
        <igc-checkbox ?checked=${this.selected}></igc-checkbox>
      </section>
      <section part="content">
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo-item': IgcComboItemComponent;
  }
}
