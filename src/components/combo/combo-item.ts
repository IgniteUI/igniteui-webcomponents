import { html, LitElement } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/item/combo-item.base.css.js';
import { styles as bootstrap } from '../dropdown/themes/light/dropdown-item.bootstrap.css.js';
import { styles as fluent } from '../dropdown/themes/light/dropdown-item.fluent.css.js';
import { styles as indigo } from '../dropdown/themes/light/dropdown-item.indigo.css.js';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/util.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';

@themes({ bootstrap, fluent, indigo })
export default class IgcComboItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-item';
  public static override styles = styles;

  public static register() {
    registerComponent(this, [IgcCheckboxComponent]);
  }

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
        <igc-checkbox
          aria-hidden="true"
          ?checked=${this.selected}
          tabindex="-1"
          exportparts="control: checkbox, indicator: checkbox-indicator, checked"
        ></igc-checkbox>
      </section>
      <section id="content" part="content">
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
