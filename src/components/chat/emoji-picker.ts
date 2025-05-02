import { LitElement, html } from 'lit';
import { registerComponent } from '../common/definitions/register.js';

/**
 *
 * @element igc-emoji-picker
 *
 */
export default class IgcEmojiPickerComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-emoji-picker';

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcEmojiPickerComponent);
  }

  protected override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-igc-emoji-picker': IgcEmojiPickerComponent;
  }
}
