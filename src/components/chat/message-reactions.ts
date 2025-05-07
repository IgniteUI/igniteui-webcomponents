import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcEmojiPickerComponent from './emoji-picker.js';
import { styles } from './themes/reaction.base.css';
import type { IgcMessageReaction } from './types.js';

/**
 *
 * @element igc-message-reactions
 *
 */
export class IgcMessageReactionsComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-message-reactions';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcMessageReactionsComponent,
      IgcButtonComponent,
      IgcIconButtonComponent,
      IgcEmojiPickerComponent
    );
  }

  @property({ type: Array })
  reactions: IgcMessageReaction[] = [];

  @property({ type: String })
  messageId = '';

  @property({ type: String })
  currentUserId = '';

  public override connectedCallback() {
    super.connectedCallback();
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
  }

  private addEmoji(e: CustomEvent) {
    const { emojiId, emoji } = e.detail;
    this.toggleReaction(emojiId, emoji);
  }

  private hasUserReacted(reaction: IgcMessageReaction): boolean {
    return reaction.users.includes(this.currentUserId);
  }

  private toggleReaction(emojiId: string, emoji: string) {
    this.dispatchEvent(
      new CustomEvent('add-reaction', {
        detail: { emojiId, emoji },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`
      <div class="reactions-container">
        ${this.reactions?.map(
          (reaction) => html`
            <igc-button
              variant="flat"
              class=${`reaction-button ${this.hasUserReacted(reaction) ? 'active' : ''}`}
              @click=${() => this.toggleReaction(reaction.id, reaction.emoji)}
            >
              <span class="emoji">${reaction.emoji}</span>
              <span class="count">${reaction.count}</span>
            </igc-button>
          `
        )}

        <igc-emoji-picker @emoji-selected=${this.addEmoji}></igc-emoji-picker>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-reactions': IgcMessageReactionsComponent;
  }
}
