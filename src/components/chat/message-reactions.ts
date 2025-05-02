import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { registerComponent } from '../common/definitions/register.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcEmojiPickerComponent from './emoji-picker.js';
import { styles } from './themes/reaction.base.css';
import { type IgcMessageReaction, emojiPickerIcon } from './types.js';

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

  @property({ type: Boolean })
  showEmojiPicker = false;

  constructor() {
    super();
    registerIconFromText('emoji-picker', emojiPickerIcon, 'material');
  }

  public override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleClickOutside);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleClickOutside);
  }

  private toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  private handleClickOutside = (e: MouseEvent) => {
    if (this.showEmojiPicker && !e.composedPath().includes(this)) {
      this.showEmojiPicker = false;
    }
  };

  private addEmoji(e: CustomEvent) {
    const emoji = e.detail.emoji;
    this.toggleReaction(emoji);
    this.showEmojiPicker = false;
  }

  private hasUserReacted(reaction: IgcMessageReaction): boolean {
    return reaction.users.includes(this.currentUserId);
  }

  private toggleReaction(emoji: string) {
    this.dispatchEvent(
      new CustomEvent('add-reaction', {
        detail: { emoji },
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
              class=${`reaction-button ${this.hasUserReacted(reaction) ? 'active' : ''}`}
              @click=${() => this.toggleReaction(reaction.emoji)}
            >
              <span class="emoji">${reaction.emoji}</span>
              <span class="count">${reaction.count}</span>
            </igc-button>
          `
        )}

        <igc-icon-button
          name="emoji-picker"
          collection="material"
          variant="contained"
          class="small"
          @click=${this.toggleEmojiPicker}
        ></igc-icon-button>

        ${this.showEmojiPicker
          ? html`
              <div class="emoji-picker-container">
                <igc-emoji-picker
                  @emoji-selected=${this.addEmoji}
                ></igc-emoji-picker>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-message-reactions': IgcMessageReactionsComponent;
  }
}
