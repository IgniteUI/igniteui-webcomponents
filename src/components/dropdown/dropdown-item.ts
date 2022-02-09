import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './dropdown-item.material.css';

export interface IgcDropDownItemEventMap {
  igcSelect: CustomEvent<boolean>;
  igcActivate: CustomEvent<boolean>;
}

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
export default class IgcDropDownItemComponent extends EventEmitterMixin<
  IgcDropDownItemEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-dropdown-item';

  public static styles = styles;

  private _value!: string;

  /**
   * Тhe current value of the item.
   * If not specified, the element's text content is used.
   */
  @property({ type: String, attribute: true, reflect: true })
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
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  public selected = false;

  /**
   * Determines whether the item is disabled.
   */
  @property({ type: Boolean, attribute: true, reflect: true })
  public disabled = false;

  @watch('selected')
  protected selectedChange() {
    this.selected
      ? this.setAttribute('aria-selected', 'true')
      : this.removeAttribute('aria-selected');
    this.selected
      ? this.classList.add('active')
      : this.classList.remove('active');

    this.emitEvent('igcSelect', { detail: this.selected });
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
    'igc-dropdown-item': IgcDropDownItemComponent;
  }
}
