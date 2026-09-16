import { html, LitElement } from 'lit';
import { property, queryAssignedNodes } from 'lit/decorators.js';
import { addInternalsController } from '../controllers/internals.js';

/* omitModule */
export abstract class IgcBaseOptionLikeComponent extends LitElement {
  protected readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'option' },
    reflectRole: true,
    aria: () => ({
      ariaDisabled: `${this.disabled}`,
      ariaSelected: `${this.selected}`,
    }),
  });

  protected _active = false;
  protected _disabled = false;
  protected _selected = false;
  protected _value!: string;

  @queryAssignedNodes({ flatten: true })
  protected readonly _content!: Array<Element>;

  protected get _contentSlotText(): string {
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

  public get active(): boolean {
    return this._active;
  }

  /**
   * Whether the item is disabled.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set disabled(value: boolean) {
    this._disabled = Boolean(value);
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Whether the item is selected.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public set selected(value: boolean) {
    this._selected = Boolean(value);
    this.active = this.selected;
  }

  public get selected(): boolean {
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
