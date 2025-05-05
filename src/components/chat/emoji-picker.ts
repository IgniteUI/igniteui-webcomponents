import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IgcButtonComponent from '../button/button.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import { addRootClickHandler } from '../common/controllers/root-click.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcInputComponent from '../input/input.js';
import IgcPopoverComponent from '../popover/popover.js';
import { styles } from './themes/emoji-picker.base.css.js';
import { emojiPickerIcon } from './types.js';

export const EMOJI_CATEGORIES = [
  {
    name: 'Smileys & Emotion',
    icon: '😊',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '🙃',
      '😉',
      '😊',
      '😇',
      '😍',
      '🥰',
      '😘',
    ],
  },
  {
    name: 'People & Body',
    icon: '👋',
    emojis: [
      '👋',
      '🤚',
      '🖐️',
      '✋',
      '🖖',
      '👌',
      '🤌',
      '🤏',
      '✌️',
      '🤞',
      '🤟',
      '🤘',
      '🤙',
      '👈',
      '👉',
      '👍',
    ],
  },
  {
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
    ],
  },
  {
    name: 'Food & Drink',
    icon: '🍔',
    emojis: [
      '🍎',
      '🍐',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🍓',
      '🫐',
      '🍈',
      '🍒',
      '🍑',
      '🥭',
      '🍍',
      '🥥',
      '🥝',
    ],
  },
  {
    name: 'Travel & Places',
    icon: '🚗',
    emojis: [
      '🚗',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🏎️',
      '🚓',
      '🚑',
      '🚒',
      '🚐',
      '🛻',
      '🚚',
      '🚛',
      '🚜',
      '🛴',
      '🚲',
    ],
  },
  {
    name: 'Activities',
    icon: '⚽',
    emojis: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🥎',
      '🎾',
      '🏐',
      '🏉',
      '🥏',
      '🎱',
      '🪀',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
    ],
  },
  {
    name: 'Objects',
    icon: '💡',
    emojis: [
      '⌚',
      '📱',
      '📲',
      '💻',
      '⌨️',
      '🖥️',
      '🖨️',
      '🖱️',
      '🖲️',
      '🕹️',
      '🗜️',
      '💽',
      '💾',
      '💿',
      '📀',
      '📼',
    ],
  },
  {
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
    ],
  },
];

/**
 *
 * @element igc-emoji-picker
 *
 */
export default class IgcEmojiPickerComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-emoji-picker';

  public static override styles = styles;

  protected _rootClickController = addRootClickHandler(this);

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcEmojiPickerComponent,
      IgcPopoverComponent,
      IgcIconButtonComponent,
      IgcButtonComponent,
      IgcInputComponent
    );
  }

  /**
   * Sets the open state of the component.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public open = false;

  @state()
  private _target?: HTMLElement;

  @query('slot[name="target"]', true)
  protected trigger!: HTMLSlotElement;

  @state()
  private _activeCategory = 0;

  @watch('open', { waitUntilFirstUpdate: true })
  protected openStateChange() {
    this._rootClickController.update();

    if (!this.open) {
      this._target = undefined;
      this._rootClickController.update({ target: undefined });
    }
  }

  constructor() {
    super();
    this._rootClickController.update({ hideCallback: this.handleClosing });
    registerIconFromText('target', emojiPickerIcon, 'material');
  }

  protected handleClosing() {
    this.hide();
  }

  public async hide(): Promise<boolean> {
    if (!this.open) {
      return false;
    }

    this.open = false;

    return true;
  }

  protected handleAnchorClick() {
    this.open = !this.open;
  }

  private handleCategoryChange(index: number) {
    this._activeCategory = index;
  }

  private handleEmojiClick(emoji: string) {
    this.dispatchEvent(
      new CustomEvent('emoji-selected', {
        detail: { emoji },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getFilteredEmojis() {
    return EMOJI_CATEGORIES[this._activeCategory].emojis;
  }

  protected override render() {
    const filteredEmojis = this.getFilteredEmojis();

    return html`<igc-popover
      ?open=${this.open}
      flip
      .anchor=${this._target}
      placement="top-start"
      shift
    >
      <igc-icon-button
        slot="anchor"
        id="emoji-target"
        name="target"
        collection="material"
        variant="contained"
        class="small"
        @click=${this.handleAnchorClick}
      ></igc-icon-button>
      <div
        part="base"
        class="emoji-picker-container"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <div class="emoji-categories">
          ${EMOJI_CATEGORIES.map(
            (category, index) => html`
                <igc-button
                    variant="flat
                    class="category-button ${this._activeCategory === index ? 'active' : ''}"
                    @click=${() => this.handleCategoryChange(index)}
                    title=${category.name}
                    >
                    ${category.icon}
                </igc-button>
            `
          )}
        </div>

        <div class="emoji-grid">
          ${filteredEmojis.map(
            (emoji) => html`
                <igc-button  variant="flat class="emoji-button" @click=${() => this.handleEmojiClick(emoji)}>
                ${emoji}
                </igc-button>
            `
          )}
          ${filteredEmojis.length === 0
            ? html`<div
                style="grid-column: span 8; text-align: center; color: var(--gray-500);"
              >
                No emojis found
              </div>`
            : ''}
        </div>
      </div>
    </igc-popover>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-igc-emoji-picker': IgcEmojiPickerComponent;
  }
}
