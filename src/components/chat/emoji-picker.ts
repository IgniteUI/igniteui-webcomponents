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
      { id: 'grinning_face', emoji: '😀', name: 'Grinning Face' },
      {
        id: 'grinning_face_with_big_eyes',
        emoji: '😃',
        name: 'Grinning Face with Big Eyes',
      },
      {
        id: 'grinning_face_with_smiling_eyes',
        emoji: '😄',
        name: 'Grinning Face with Smiling Eyes',
      },
      {
        id: 'beaming_face_with_smiling_eyes',
        emoji: '😁',
        name: 'Beaming Face with Smiling Eyes',
      },
      {
        id: 'grinning_squinting_face',
        emoji: '😆',
        name: 'Grinning Squinting Face',
      },
      {
        id: 'grinning_face_with_sweat',
        emoji: '😅',
        name: 'Grinning Face with Sweat',
      },
      {
        id: 'rolling_on_the_floor_laughing',
        emoji: '🤣',
        name: 'Rolling on the Floor Laughing',
      },
      {
        id: 'face_with_tears_of_joy',
        emoji: '😂',
        name: 'Face with Tears of Joy',
      },
      {
        id: 'slightly_smiling_face',
        emoji: '🙂',
        name: 'Slightly Smiling Face',
      },
      { id: 'upside_down_face', emoji: '🙃', name: 'Upside-Down Face' },
      { id: 'winking_face', emoji: '😉', name: 'Winking Face' },
      {
        id: 'smiling_face_with_smiling_eyes',
        emoji: '😊',
        name: 'Smiling Face with Smiling Eyes',
      },
      {
        id: 'smiling_face_with_halo',
        emoji: '😇',
        name: 'Smiling Face with Halo',
      },
      {
        id: 'smiling_face_with_heart_eyes',
        emoji: '😍',
        name: 'Smiling Face with Heart-Eyes',
      },
      {
        id: 'smiling_face_with_hearts',
        emoji: '🥰',
        name: 'Smiling Face with Hearts',
      },
      { id: 'face_blowing_a_kiss', emoji: '😘', name: 'Face Blowing a Kiss' },
    ],
  },
  {
    name: 'People & Body',
    icon: '👋',
    emojis: [
      { id: 'waving_hand', emoji: '👋', name: 'Waving Hand' },
      { id: 'raised_back_of_hand', emoji: '🤚', name: 'Raised Back of Hand' },
      {
        id: 'hand_with_fingers_splayed',
        emoji: '🖐️',
        name: 'Hand with Fingers Splayed',
      },
      { id: 'raised_hand', emoji: '✋', name: 'Raised Hand' },
      { id: 'vulcan_salute', emoji: '🖖', name: 'Vulcan Salute' },
      { id: 'ok_hand', emoji: '👌', name: 'OK Hand' },
      { id: 'pinched_fingers', emoji: '🤌', name: 'Pinched Fingers' },
      { id: 'pinching_hand', emoji: '🤏', name: 'Pinching Hand' },
      { id: 'victory_hand', emoji: '✌️', name: 'Victory Hand' },
      { id: 'crossed_fingers', emoji: '🤞', name: 'Crossed Fingers' },
      { id: 'love_you_gesture', emoji: '🤟', name: 'Love-You Gesture' },
      { id: 'sign_of_the_horns', emoji: '🤘', name: 'Sign of the Horns' },
      { id: 'call_me_hand', emoji: '🤙', name: 'Call Me Hand' },
      {
        id: 'backhand_index_pointing_left',
        emoji: '👈',
        name: 'Backhand Index Pointing Left',
      },
      {
        id: 'backhand_index_pointing_right',
        emoji: '👉',
        name: 'Backhand Index Pointing Right',
      },
      { id: 'thumbs_up', emoji: '👍', name: 'Thumbs Up' },
    ],
  },
  {
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { id: 'dog_face', emoji: '🐶', name: 'Dog Face' },
      { id: 'cat_face', emoji: '🐱', name: 'Cat Face' },
      { id: 'mouse_face', emoji: '🐭', name: 'Mouse Face' },
      { id: 'hamster_face', emoji: '🐹', name: 'Hamster Face' },
      { id: 'rabbit_face', emoji: '🐰', name: 'Rabbit Face' },
      { id: 'fox_face', emoji: '🦊', name: 'Fox Face' },
      { id: 'bear_face', emoji: '🐻', name: 'Bear Face' },
      { id: 'panda_face', emoji: '🐼', name: 'Panda Face' },
      { id: 'koala_face', emoji: '🐨', name: 'Koala Face' },
      { id: 'tiger_face', emoji: '🐯', name: 'Tiger Face' },
      { id: 'lion_face', emoji: '🦁', name: 'Lion Face' },
      { id: 'cow_face', emoji: '🐮', name: 'Cow Face' },
      { id: 'pig_face', emoji: '🐷', name: 'Pig Face' },
      { id: 'frog_face', emoji: '🐸', name: 'Frog Face' },
      { id: 'monkey_face', emoji: '🐵', name: 'Monkey Face' },
      { id: 'chicken', emoji: '🐔', name: 'Chicken' },
    ],
  },
  {
    name: 'Food & Drink',
    icon: '🍔',
    emojis: [
      { id: 'red_apple', emoji: '🍎', name: 'Red Apple' },
      { id: 'pear', emoji: '🍐', name: 'Pear' },
      { id: 'orange', emoji: '🍊', name: 'Orange' },
      { id: 'lemon', emoji: '🍋', name: 'Lemon' },
      { id: 'banana', emoji: '🍌', name: 'Banana' },
      { id: 'watermelon', emoji: '🍉', name: 'Watermelon' },
      { id: 'grapes', emoji: '🍇', name: 'Grapes' },
      { id: 'strawberry', emoji: '🍓', name: 'Strawberry' },
      { id: 'blueberries', emoji: '🫐', name: 'Blueberries' },
      { id: 'melon', emoji: '🍈', name: 'Melon' },
      { id: 'cherries', emoji: '🍒', name: 'Cherries' },
      { id: 'peach', emoji: '🍑', name: 'Peach' },
      { id: 'mango', emoji: '🥭', name: 'Mango' },
      { id: 'pineapple', emoji: '🍍', name: 'Pineapple' },
      { id: 'coconut', emoji: '🥥', name: 'Coconut' },
      { id: 'kiwi_fruit', emoji: '🥝', name: 'Kiwi Fruit' },
    ],
  },
  {
    name: 'Travel & Places',
    icon: '🚗',
    emojis: [
      { id: 'car', emoji: '🚗', name: 'Car' },
      { id: 'taxi', emoji: '🚕', name: 'Taxi' },
      {
        id: 'sport_utility_vehicle',
        emoji: '🚙',
        name: 'Sport Utility Vehicle',
      },
      { id: 'bus', emoji: '🚌', name: 'Bus' },
      { id: 'trolleybus', emoji: '🚎', name: 'Trolleybus' },
      { id: 'racing_car', emoji: '🏎️', name: 'Racing Car' },
      { id: 'police_car', emoji: '🚓', name: 'Police Car' },
      { id: 'ambulance', emoji: '🚑', name: 'Ambulance' },
      { id: 'fire_engine', emoji: '🚒', name: 'Fire Engine' },
      { id: 'minibus', emoji: '🚐', name: 'Minibus' },
      { id: 'pickup_truck', emoji: '🛻', name: 'Pickup Truck' },
      { id: 'delivery_truck', emoji: '🚚', name: 'Delivery Truck' },
      { id: 'articulated_lorry', emoji: '🚛', name: 'Articulated Lorry' },
      { id: 'tractor', emoji: '🚜', name: 'Tractor' },
      { id: 'kick_scooter', emoji: '🛴', name: 'Kick Scooter' },
      { id: 'bicycle', emoji: '🚲', name: 'Bicycle' },
    ],
  },
  {
    name: 'Activities',
    icon: '⚽',
    emojis: [
      { id: 'soccer_ball', emoji: '⚽', name: 'Soccer Ball' },
      { id: 'basketball', emoji: '🏀', name: 'Basketball' },
      { id: 'american_football', emoji: '🏈', name: 'American Football' },
      { id: 'baseball', emoji: '⚾', name: 'Baseball' },
      { id: 'softball', emoji: '🥎', name: 'Softball' },
      { id: 'tennis', emoji: '🎾', name: 'Tennis' },
      { id: 'volleyball', emoji: '🏐', name: 'Volleyball' },
      { id: 'rugby_football', emoji: '🏉', name: 'Rugby Football' },
      { id: 'flying_disc', emoji: '🥏', name: 'Flying Disc' },
      { id: 'pool_8_ball', emoji: '🎱', name: 'Pool 8 Ball' },
      { id: 'yo_yo', emoji: '🪀', name: 'Yo-Yo' },
      { id: 'ping_pong', emoji: '🏓', name: 'Ping Pong' },
      { id: 'badminton', emoji: '🏸', name: 'Badminton' },
      { id: 'ice_hockey', emoji: '🏒', name: 'Ice Hockey' },
      { id: 'field_hockey', emoji: '🏑', name: 'Field Hockey' },
      { id: 'lacrosse', emoji: '🥍', name: 'Lacrosse' },
    ],
  },
  {
    name: 'Objects',
    icon: '💡',
    emojis: [
      { id: 'watch', emoji: '⌚', name: 'Watch' },
      { id: 'mobile_phone', emoji: '📱', name: 'Mobile Phone' },
      {
        id: 'mobile_phone_with_arrow',
        emoji: '📲',
        name: 'Mobile Phone with Arrow',
      },
      { id: 'laptop', emoji: '💻', name: 'Laptop' },
      { id: 'keyboard', emoji: '⌨️', name: 'Keyboard' },
      { id: 'desktop_computer', emoji: '🖥️', name: 'Desktop Computer' },
      { id: 'printer', emoji: '🖨️', name: 'Printer' },
      { id: 'computer_mouse', emoji: '🖱️', name: 'Computer Mouse' },
      { id: 'trackball', emoji: '🖲️', name: 'Trackball' },
      { id: 'joystick', emoji: '🕹️', name: 'Joystick' },
      { id: 'clamp', emoji: '🗜️', name: 'Clamp' },
      { id: 'computer_disk', emoji: '💽', name: 'Computer Disk' },
      { id: 'floppy_disk', emoji: '💾', name: 'Floppy Disk' },
      { id: 'optical_disk', emoji: '💿', name: 'Optical Disk' },
      { id: 'dvd', emoji: '📀', name: 'DVD' },
      { id: 'videocassette', emoji: '📼', name: 'Videocassette' },
    ],
  },
  {
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      { id: 'red_heart', emoji: '❤️', name: 'Red Heart' },
      { id: 'orange_heart', emoji: '🧡', name: 'Orange Heart' },
      { id: 'yellow_heart', emoji: '💛', name: 'Yellow Heart' },
      { id: 'green_heart', emoji: '💚', name: 'Green Heart' },
      { id: 'blue_heart', emoji: '💙', name: 'Blue Heart' },
      { id: 'purple_heart', emoji: '💜', name: 'Purple Heart' },
      { id: 'black_heart', emoji: '🖤', name: 'Black Heart' },
      { id: 'white_heart', emoji: '🤍', name: 'White Heart' },
      { id: 'brown_heart', emoji: '🤎', name: 'Brown Heart' },
      { id: 'broken_heart', emoji: '💔', name: 'Broken Heart' },
      { id: 'heart_exclamation', emoji: '❣️', name: 'Heart Exclamation' },
      { id: 'two_hearts', emoji: '💕', name: 'Two Hearts' },
      { id: 'revolving_hearts', emoji: '💞', name: 'Revolving Hearts' },
      { id: 'beating_heart', emoji: '💓', name: 'Beating Heart' },
      { id: 'growing_heart', emoji: '💗', name: 'Growing Heart' },
      { id: 'sparkling_heart', emoji: '💖', name: 'Sparkling Heart' },
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

  private handleEmojiClick(emojiId: string, emoji: string) {
    this.dispatchEvent(
      new CustomEvent('emoji-selected', {
        detail: { emojiId, emoji },
        bubbles: true,
        composed: true,
      })
    );
    this.hide();
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
                <igc-button  variant="flat class="emoji-button" @click=${() => this.handleEmojiClick(emoji.id, emoji.emoji)}>
                ${emoji.emoji}
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
