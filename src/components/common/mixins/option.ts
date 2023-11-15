import { LitElement, html } from 'lit';
import { property, queryAssignedNodes } from 'lit/decorators.js';

import { watch } from '../decorators/watch.js';

export abstract class IgcBaseOptionLikeComponent extends LitElement {
  protected _internals: ElementInternals;
  protected _value!: string;

  @queryAssignedNodes({ flatten: true })
  protected _content!: Array<Element>;

  protected get _contentSlotText() {
    return this._content.map((node) => node.textContent).join('');
  }

  /**
   * Whether the item is active.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public active = false;

  /**
   * Whether the item is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether the item is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /**
   * The current value of the item.
   * If not specified, the element's text content is used.
   *
   * @attr
   */
  @property()
  public get value(): string {
    return this._value ? this._value : this._contentSlotText;
  }

  public set value(value: string) {
    const old = this._value;
    this._value = value;
    this.requestUpdate('value', old);
  }

  @watch('disabled')
  protected disabledChange() {
    this._internals.ariaDisabled = `${this.disabled}`;
  }

  @watch('selected')
  protected selectedChange() {
    this._internals.ariaSelected = `${this.selected}`;
    this.active = this.selected;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'option';
  }

  public override connectedCallback(): void {
    // R.K. Workaround for Axe accessibility unit tests.
    // I guess it does not support ElementInternals ARIAMixin state yet
    super.connectedCallback();
    this.role = 'option';
  }

  protected override render() {
    return html`
      <section part="prefix">
        <slot name="prefix"></slot>
      </section>
      <section part="content">
        <slot></slot>
      </section>
      <section part="suffix">
        <slot name="suffix"></slot>
      </section>
    `;
  }
}
