import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { registerComponent } from '../common/definitions/register.js';
import { styles } from './themes/header.base.css.js';

/**
 *
 * @element igc-chat-header
 *
 */
export default class IgcChatHeaderComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-chat-header';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcChatHeaderComponent);
  }

  @property({ type: String, reflect: true })
  public text = '';

  protected override render() {
    return html`<div class="header">
      <div class="info">${this.text}</div>
      <div class="actions">
        <button class="action-button">⋯</button>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-header': IgcChatHeaderComponent;
  }
}
