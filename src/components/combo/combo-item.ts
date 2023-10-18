import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import IgcCheckboxComponent from '../checkbox/checkbox.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { all } from '../dropdown/themes/item.js';
import { styles } from './themes/combo-item.base.css.js';

/* blazorSuppress */
@themes(all)
export default class IgcComboItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-combo-item';
  public static override styles = styles;

  public static register() {
    registerComponent(this, IgcCheckboxComponent);
  }

  @property({ attribute: false })
  public index!: number;

  /**
   * Determines whether the item is selected.
   * @attr selected
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the item is active.
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Determines whether the item is active.
   * @attr hide-checkbox
   */
  @property({ attribute: 'hide-checkbox', type: Boolean, reflect: false })
  public hideCheckbox = false;

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

  private renderCheckbox() {
    return html`<section part="prefix">
      <igc-checkbox
        aria-hidden="true"
        ?checked=${this.selected}
        tabindex="-1"
        exportparts="control: checkbox, indicator: checkbox-indicator, checked"
      ></igc-checkbox>
    </section>`;
  }

  protected override render() {
    return html`
      ${!this.hideCheckbox ? this.renderCheckbox() : nothing}
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
