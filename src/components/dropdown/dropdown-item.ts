import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { styles } from './themes/light/dropdown-item.base.css.js';
import { styles as bootstrap } from './themes/light/dropdown-item.bootstrap.css.js';
import { styles as fluent } from './themes/light/dropdown-item.fluent.css.js';
import { styles as indigo } from './themes/light/dropdown-item.indigo.css.js';

/**
 * Represents an item in a dropdown list.
 *
 * @element igc-dropdown-item
 *
 * @slot prefix - Renders content before the item's main content.
 * @slot - Renders the item's main content.
 * @slot suffix - Renders content after the item's main content.
 *
 * @csspart prefix - The prefix wrapper.
 * @csspart content - The main content wrapper.
 * @csspart suffix - The suffix wrapper.
 */
@themes({ bootstrap, fluent, indigo })
export default class IgcDropdownItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-item';

  public static override styles = styles;

  private _value!: string;

  /**
   * Тhe current value of the item.
   * If not specified, the element's text content is used.
   * @attr
   */
  @property()
  public get value() {
    return this._value ? this._value : this.textContent ?? '';
  }

  public set value(value: string) {
    const oldVal = this._value;
    this._value = value;
    this.requestUpdate('value', oldVal);
  }

  /**
   * Determines whether the item is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * Determines whether the item is active.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Determines whether the item is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @watch('selected')
  protected selectedChange() {
    this.selected
      ? this.setAttribute('aria-selected', 'true')
      : this.removeAttribute('aria-selected');
    this.active = this.selected;
  }

  @watch('disabled')
  protected disabledChange() {
    this.disabled
      ? this.setAttribute('aria-disabled', 'true')
      : this.removeAttribute('aria-disabled');
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'option');
  }

  protected override render() {
    return html`
      <section part="prefix"><slot name="prefix"></slot></section>
      <section part="content"><slot></slot></section>
      <section part="suffix"><slot name="suffix"></slot></section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-dropdown-item': IgcDropdownItemComponent;
  }
}
