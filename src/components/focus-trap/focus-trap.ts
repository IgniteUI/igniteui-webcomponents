import { LitElement, css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { registerComponent } from '../common/definitions/register.js';
import { isFocusable, iterNodesShadow } from '../common/util.js';

/**
 *
 * @element igc-focus-trap
 *
 * @slot - The content of the focus trap component
 */
export default class IgcFocusTrapComponent extends LitElement {
  public static readonly tagName = 'igc-focus-trap';
  public static override styles = css`
    :host {
      display: contents;
    }
  `;

  /* blazorSuppress */
  public static register() {
    registerComponent(this);
  }

  @state()
  protected _focused = false;

  /**
   * Whether to manage focus state for the slotted children.
   * @attr disabled
   */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /**
   * Whether focus in currently inside the trap component.
   */
  public get focused() {
    return this._focused;
  }

  /** An array of focusable elements including elements in Shadow roots */
  public get focusableElements() {
    return Array.from(
      iterNodesShadow<HTMLElement>(this, 'SHOW_ELEMENT', (node) => {
        return isFocusable(node);
      })
    );
  }

  constructor() {
    super();

    this.addEventListener('focusin', () => (this._focused = true));
    this.addEventListener('focusout', () => (this._focused = false));
  }

  protected focusFirstElement() {
    this.focusableElements.at(0)?.focus();
  }

  protected focusLastElement() {
    this.focusableElements.at(-1)?.focus();
  }

  protected override render() {
    const tabStop = !this.focused || this.disabled ? -1 : 0;

    return html`
      <div
        id="start"
        tabindex=${tabStop}
        @focus=${this.disabled ? nothing : this.focusLastElement}
      ></div>
      <slot></slot>
      <div
        id="end"
        tabindex=${tabStop}
        @focus=${this.disabled ? nothing : this.focusFirstElement}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-focus-trap': IgcFocusTrapComponent;
  }
}
