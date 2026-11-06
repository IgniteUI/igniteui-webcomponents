import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';

import { registerComponent } from '#internals/definitions/register.js';
import { getFocusableElements } from '#internals/utils/dom.js';
import { addSafeEventListener } from '#internals/utils/events.js';

/* blazorSuppress */
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
    registerComponent(IgcFocusTrapComponent);
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
   * Whether focus is currently inside the trap component.
   */
  public get focused() {
    return this._focused;
  }

  /** An array of focusable elements including elements in Shadow roots */
  public get focusableElements() {
    return Iterator.from(this.children).flatMap(getFocusableElements).toArray();
  }

  constructor() {
    super();

    addSafeEventListener(this, 'focusin', () => {
      this._focused = true;
    });
    addSafeEventListener(this, 'focusout', () => {
      this._focused = false;
    });
  }

  public focusFirstElement() {
    this.focusableElements.at(0)?.focus();
  }

  public focusLastElement() {
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
