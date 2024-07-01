import { LitElement, html } from 'lit';
import { property, queryAssignedNodes } from 'lit/decorators.js';

export abstract class IgcBaseOptionLikeComponent extends LitElement {
  protected _internals: ElementInternals;

  protected _active = false;
  protected _disabled = false;
  protected _selected = false;
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
  public set active(value: boolean) {
    this._active = Boolean(value);
  }

  public get active() {
    return this._active;
  }

  /**
   * Whether the item is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set disabled(value: boolean) {
    this._disabled = Boolean(value);
    this._internals.ariaDisabled = `${this._disabled}`;
  }

  public get disabled() {
    return this._disabled;
  }

  /**
   * Whether the item is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set selected(value: boolean) {
    this._selected = Boolean(value);
    this._internals.ariaSelected = `${this._selected}`;
    this.active = this.selected;
  }

  public get selected() {
    return this._selected;
  }

  /**
   * The current value of the item.
   * If not specified, the element's text content is used.
   *
   * @attr
   */
  @property()
  public set value(value: string) {
    this._value = value;
  }

  public get value(): string {
    return this._value ? this._value : this._contentSlotText;
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
