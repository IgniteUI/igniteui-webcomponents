import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { Constructor } from '../common/mixins/constructor';
import { EventEmitterMixin } from '../common/mixins/event-emitter';
import { styles } from './dropdown-item.material.css';

export interface IgcDropDownItemEventMap {
  igcSelectedChange: CustomEvent<any>;
}

@customElement('igc-dropdown-item')
export default class IgcDropDownItemComponent extends EventEmitterMixin<
  IgcDropDownItemEventMap,
  Constructor<LitElement>
>(LitElement) {
  /** private */
  public static styles = styles;

  @property({ type: Boolean, attribute: true, reflect: true })
  public selected = false;

  @property({ type: Boolean, attribute: true, reflect: true })
  public active = false;

  @property({ type: Boolean, attribute: true, reflect: true })
  public disabled = false;

  private _value!: string;
  @property({ type: String, attribute: true, reflect: true })
  public get value() {
    return this._value ? this._value : this.textContent;
  }

  protected get classes() {
    return {
      disabled: this.disabled,
      selected: this.selected,
      active: this.active,
    };
  }

  @watch('active')
  protected focusChanged() {
    if (this.active) {
      this.focus();
    }
  }

  private handleClick(_ev: MouseEvent) {
    if (this.disabled) {
      return;
    }
    _ev.preventDefault();
    this.active = true;
    this.selected = true;
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.active = true;
      this.selected = true;
    }
  }

  // private ensureItemFocus() {
  //   const activeItem = [...this._dropDown._items].find(
  //     (item) => item.active
  //   );
  //   if (!activeItem) {
  //     return;
  //   }
  //   activeItem.focus({ preventScroll: true });
  // }

  public connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabIndex', '0');

    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('click', this.handleClick);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  protected render() {
    return html`
      <section part="prefix"><slot name="prefix"></slot></section>
      <section part="content"><slot></slot></section>
      <section part="suffix"><slot name="suffix"></slot></section>
    `;
  }
}
