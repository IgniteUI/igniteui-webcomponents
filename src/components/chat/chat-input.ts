import { consume } from '@lit/context';
import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { chatContext } from '../common/context.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcFileInputComponent from '../file-input/file-input.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type IgcChatComponent from './chat.js';
import { styles } from './themes/input.base.css.js';
import {
  attachmentIcon,
  type IgcMessageAttachment,
  sendButtonIcon,
} from './types.js';

/**
 *
 * @element igc-chat-input
 *
 */
export default class IgcChatInputComponent extends LitElement {
  public static readonly tagName = 'igc-chat-input';

  public static override styles = styles;

  @consume({ context: chatContext, subscribe: true })
  private _chat?: IgcChatComponent;

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

  @query(IgcTextareaComponent.tagName)
  private textInputElement!: IgcTextareaComponent;

  @watch('acceptedFiles', { waitUntilFirstUpdate: true })
  protected acceptedFilesChange(): void {
    this.updateAcceptedTypesCache();
  }

  @state()
  private inputValue = '';

  @state()
  private dragClass = '';

  @property({ attribute: false })
  public attachments: IgcMessageAttachment[] = [];

  // Cache for accepted file types
  private _acceptedTypesCache: {
    extensions: Set<string>;
    mimeTypes: Set<string>;
    wildcardTypes: Set<string>;
  } | null = null;

  constructor() {
    super();
    registerIconFromText('attachment', attachmentIcon, 'material');
    registerIconFromText('send-message', sendButtonIcon, 'material');
  }

  protected override firstUpdated() {
    this.setupDragAndDrop();
    this.updateAcceptedTypesCache();
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.inputValue = target.value;
    this.adjustTextareaHeight();
    const inputEvent = new CustomEvent('input-change', {
      detail: { value: this.inputValue },
    });
    this.dispatchEvent(inputEvent);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    } else {
      const typingEvent = new CustomEvent('typing-change', {
        detail: { isTyping: true },
      });
      this.dispatchEvent(typingEvent);
      // wait 3 seconds and dispatch a stop-typing event
      setTimeout(() => {
        const stopTypingEvent = new CustomEvent('typing-change', {
          detail: { isTyping: false },
        });
        this.dispatchEvent(stopTypingEvent);
      }, 3000);
    }
  }

  private handleFocus() {
    const focusEvent = new CustomEvent('focus-input');
    this.dispatchEvent(focusEvent);
  }

  private handleBlur() {
    const blurEvent = new CustomEvent('blur-input');
    this.dispatchEvent(blurEvent);
  }

  private setupDragAndDrop() {
    const container = this.shadowRoot?.querySelector(
      '.input-container'
    ) as HTMLElement;
    if (container) {
      container.addEventListener('dragenter', this.handleDragEnter.bind(this));
      container.addEventListener('dragover', this.handleDragOver.bind(this));
      container.addEventListener('dragleave', this.handleDragLeave.bind(this));
      container.addEventListener('drop', this.handleDrop.bind(this));
    }
  }

  private handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer?.items || []).filter(
      (item) => item.kind === 'file'
    );
    const hasValidFiles = files.some((item) =>
      this.isFileTypeAccepted(item.getAsFile() as File, item.type)
    );

    this.dragClass = hasValidFiles ? 'dragging' : '';

    const dragEvent = new CustomEvent('drag-attachment');
    this.dispatchEvent(dragEvent);
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Check if we're actually leaving the container
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      this.dragClass = '';
    }
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.dragClass = '';

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => this.isFileTypeAccepted(file));

    const dropEvent = new CustomEvent('drop-attachment');
    this.dispatchEvent(dropEvent);

    this.attachFiles(validFiles);
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

    const messageEvent = new CustomEvent('message-created', {
      detail: { text: this.inputValue, attachments: this.attachments },
    });

    this.dispatchEvent(messageEvent);
    this.inputValue = '';

    if (this.textInputElement) {
      this.textInputElement.style.height = 'auto';
    }

    this.updateComplete.then(() => {
      this.textInputElement?.focus();
    });
  }

  private handleFileUpload(e: Event) {
    const input = (e.target as any).input as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.attachFiles(files);
  }

  private attachFiles(files: File[]) {
    const newAttachments: IgcMessageAttachment[] = [];
    let count = this.attachments.length;
    files.forEach((file) => {
      const isImage = file.type.startsWith('image/');
      newAttachments.push({
        id: Date.now().toString() + count++,
        // type: isImage ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        file: file,
        thumbnail: isImage ? URL.createObjectURL(file) : undefined,
      });
    });

    const attachmentEvent = new CustomEvent('attachment-change', {
      detail: [...this.attachments, ...newAttachments],
    });
    this.dispatchEvent(attachmentEvent);
  }

  private updateAcceptedTypesCache() {
    if (!this._chat?.options?.acceptedFiles) {
      this._acceptedTypesCache = null;
      return;
    }

    const types = this._chat?.options?.acceptedFiles
      .split(',')
      .map((type) => type.trim().toLowerCase());
    this._acceptedTypesCache = {
      extensions: new Set(types.filter((t) => t.startsWith('.'))),
      mimeTypes: new Set(
        types.filter((t) => !t.startsWith('.') && !t.endsWith('/*'))
      ),
      wildcardTypes: new Set(
        types.filter((t) => t.endsWith('/*')).map((t) => t.slice(0, -2))
      ),
    };
  }

  private isFileTypeAccepted(file: File, type = ''): boolean {
    if (!this._acceptedTypesCache) return true;

    if (file === null && type === '') return false;

    const fileType =
      file != null ? file.type.toLowerCase() : type.toLowerCase();
    const fileExtension =
      file != null
        ? `.${file.name.split('.').pop()?.toLowerCase()}`
        : `.${type.split('/').pop()?.toLowerCase()}`;

    // Check file extension
    if (this._acceptedTypesCache.extensions.has(fileExtension)) {
      return true;
    }

    // Check exact MIME type
    if (this._acceptedTypesCache.mimeTypes.has(fileType)) {
      return true;
    }

    // Check wildcard MIME types
    const [fileBaseType] = fileType.split('/');
    return this._acceptedTypesCache.wildcardTypes.has(fileBaseType);
  }

  private removeAttachment(index: number) {
    const attachmentEvent = new CustomEvent('attachment-change', {
      detail: this.attachments.filter((_, i) => i !== index),
    });

    this.dispatchEvent(attachmentEvent);
  }

  private renderFileUploadArea() {
    return html` ${this._chat?.options?.disableAttachments
      ? ''
      : html`
          <igc-file-input
            multiple
            .accept=${this._chat?.options?.acceptedFiles}
            @igcChange=${this.handleFileUpload}
          >
            <igc-icon
              slot="file-selector-text"
              name="attachment"
              collection="material"
            ></igc-icon>
          </igc-file-input>
        `}`;
  }

  private renderActionsArea() {
    return html` <div class="buttons-container">
      <igc-icon-button
        name="send-message"
        collection="material"
        variant="contained"
        class="small"
        ?disabled=${!this.inputValue.trim() && this.attachments.length === 0}
        @click=${this.sendMessage}
      ></igc-icon-button>
    </div>`;
  }

  private renderAttachmentsArea() {
    return html` <div>
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
    </div>`;
  }

  protected override render() {
    return html`
      <div class="input-container ${this.dragClass}">
        ${this.renderFileUploadArea()}

        <div class="input-wrapper">
          <igc-textarea
            class="text-input"
            placeholder="Type a message..."
            rows="1"
            .value=${this.inputValue}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          ></igc-textarea>
        </div>

        ${this.renderActionsArea()}
      </div>
      ${this.renderAttachmentsArea()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-input': IgcChatInputComponent;
  }
}
