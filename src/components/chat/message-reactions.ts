import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcEmojiPickerComponent, { EMOJI_CATEGORIES } from './emoji-picker.js';
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
    const { emojiId } = e.detail;
    this.toggleReaction(emojiId);
  }

  private hasUserReacted(reaction: IgcMessageReaction): boolean {
    return reaction.users.includes(this.currentUserId);
  }

  private toggleReaction(emojiId: string) {
    this.dispatchEvent(
      new CustomEvent('add-reaction', {
        detail: { emojiId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getReactionById(reaction: IgcMessageReaction) {
    for (const category of EMOJI_CATEGORIES) {
      const foundReaction = category.emojis.find(
        (emoji) => emoji.id === reaction.id
      );
      if (foundReaction) {
        return {
          id: foundReaction.id,
          emoji: foundReaction.emoji,
          count: reaction.users.length,
          users: reaction.users,
        };
      }
    }
    return undefined;
  }

  protected override render() {
    return html`
      <div class="reactions-container">
        ${this.reactions?.map((_reaction) => {
          const reaction = this.getReactionById(_reaction);
          return reaction
            ? html`
                <igc-button
                  variant="flat"
                  class=${`reaction-button ${this.hasUserReacted(reaction) ? 'active' : ''}`}
                  @click=${() => this.toggleReaction(reaction.id)}
                >
                  <span class="emoji">${reaction.emoji}</span>
                  <span class="count">${reaction.count}</span>
                </igc-button>
              `
            : html``;
        })}

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
