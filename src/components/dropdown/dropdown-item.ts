import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';

import { styles } from './themes/dropdown-item.base.css.js';
import { all } from './themes/item.js';
import { themes } from '../../theming/theming-decorator.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';

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
@themes(all)
export default class IgcDropdownItemComponent extends LitElement {
  public static readonly tagName: string = 'igc-dropdown-item';
  public static override styles = styles;

  public static register() {
    registerComponent(this);
  }

  private _internals: ElementInternals;
  private _value!: string;

  @query(`slot:not([name])`, true)
  private _content!: HTMLSlotElement;

  protected get slotTextContent() {
    return this._content
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent)
      .join('');
  }

  /**
   * Тhe current value of the item.
   * If not specified, the element's text content is used.
   *
   * @attr
   */
  @property()
  public get value(): string {
    return this._value ? this._value : this.slotTextContent;
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
    this._internals.ariaSelected = `${this.selected}`;
    this.active = this.selected;
  }

  @watch('disabled')
  protected disabledChange() {
    this._internals.ariaDisabled = `${this.disabled}`;
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'option';
  }

  public override connectedCallback() {
    // R.K. Workaround for Axe accessibility unit tests.
    // I guess it does not support ElementInternals ARIAMixin state yet
    super.connectedCallback();
    this.role = 'option';
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
