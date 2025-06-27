import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { query, state } from 'lit/decorators.js';
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

  @query('textarea')
  private textInputElement!: HTMLTextAreaElement;

  @watch('acceptedFiles', { waitUntilFirstUpdate: true })
  protected acceptedFilesChange(): void {
    this.updateAcceptedTypesCache();
  }

  @state()
  private inputValue = '';

  @state()
  private attachments: IgcMessageAttachment[] = [];

  @state()
  private dragClass = '';

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
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
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
    this.attachments = [...this.attachments, ...newAttachments];
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
    this.attachments = this.attachments.filter((_, i) => i !== index);
  }

  protected override render() {
    return html`
      <div class="input-container ${this.dragClass}">
        ${this._chat?.options?.disableAttachments
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
            ?disabled=${!this.inputValue.trim() &&
            this.attachments.length === 0}
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
