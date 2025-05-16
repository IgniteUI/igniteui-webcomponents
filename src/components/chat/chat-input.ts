import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcFileInputComponent from '../file-input/file-input.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import { styles } from './themes/input.base.css.js';
import {
  type IgcMessageAttachment,
  attachmentIcon,
  sendButtonIcon,
} from './types.js';

/**
 *
 * @element igc-chat-input
 *
 */
export default class IgcChatInputComponent extends LitElement {
  /** @private */
  public static readonly tagName = 'igc-chat-input';

  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatInputComponent,
      IgcTextareaComponent,
      IgcIconButtonComponent,
      IgcChipComponent,
      IgcFileInputComponent,
      IgcIconComponent
    );
  }

  @property({ type: Boolean, attribute: 'disable-attachments' })
  public disableAttachments = false;

  @property({ type: Boolean })
  public isAiResponding = false;

  @query('textarea')
  private textInputElement!: HTMLTextAreaElement;

  @state()
  private inputValue = '';

  @state()
  private attachments: IgcMessageAttachment[] = [];

  constructor() {
    super();
    registerIconFromText('attachment', attachmentIcon, 'material');
    registerIconFromText('send-message', sendButtonIcon, 'material');
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.inputValue = target.value;
    this.adjustTextareaHeight();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!this.isAiResponding) {
        this.sendMessage();
      }
    }
  }

  private adjustTextareaHeight() {
    const textarea = this.textInputElement;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }

  private sendMessage() {
    if (!this.inputValue.trim() && this.attachments.length === 0) return;

    const messageEvent = new CustomEvent('message-send', {
      detail: { text: this.inputValue, attachments: this.attachments },
    });

    this.dispatchEvent(messageEvent);
    this.inputValue = '';
    this.attachments = [];

    if (this.textInputElement) {
      this.textInputElement.style.height = 'auto';
    }

    setTimeout(() => {
      this.textInputElement?.focus();
    }, 0);
  }

  private handleFileUpload(e: Event) {
    const input = (e.target as any).input as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const newAttachments: IgcMessageAttachment[] = [];
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      newAttachments.push({
        id: `attach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: isImage ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        thumbnail: isImage ? URL.createObjectURL(file) : undefined,
      });
    });
    this.attachments = [...this.attachments, ...newAttachments];
  }

  private removeAttachment(index: number) {
    this.attachments = this.attachments.filter((_, i) => i !== index);
  }

  protected override render() {
    return html`
      <div class="input-container">
        ${this.disableAttachments
          ? ''
          : html`
              <igc-file-input multiple @igcChange=${this.handleFileUpload}>
                <igc-icon
                  slot="file-selector-text"
                  name="attachment"
                  collection="material"
                ></igc-icon>
              </igc-file-input>
            `}

        <div class="input-wrapper">
          <igc-textarea
            class="text-input"
            placeholder="Type a message..."
            rows="1"
            .value=${this.inputValue}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
          ></igc-textarea>
        </div>

        <div class="buttons-container">
          <igc-icon-button
            name="send-message"
            collection="material"
            variant="contained"
            class="small"
            ?disabled=${this.isAiResponding ||
            (!this.inputValue.trim() && this.attachments.length === 0)}
            @click=${this.sendMessage}
          ></igc-icon-button>
        </div>
      </div>
      <div>
        ${this.attachments?.map(
          (attachment, index) => html`
            <div class="attachment-wrapper">
              <igc-chip
                removable
                @igcRemove=${() => this.removeAttachment(index)}
              >
                <span class="attachment-name">${attachment.name}</span>
              </igc-chip>
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-input': IgcChatInputComponent;
  }
}
