import { consume } from '@lit/context';
import { html, LitElement, nothing, type TemplateResult } from 'lit';
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
import type { ChatState } from './chat-state.js';
import { styles } from './themes/input.base.css.js';
import { attachmentIcon, sendButtonIcon } from './types.js';

/**
 * A web component that provides the input area for the `igc-chat` interface.
 *
 * It supports:
 * - Text input with automatic resizing
 * - Sending messages on Enter key (with Shift+Enter for newlines)
 * - File attachments via file picker or drag-and-drop
 * - Customizable templates for send button, attachments, and text input
 * - Emits various chat-related events (typing, input focus/blur, attachment drop, etc.)
 *
 * @element igc-chat-input
 *
 * @slot - Default unnamed slot for rendering inside the component
 * @fires igcTypingChange - Fired when the user starts/stops typing
 * @fires igcInputFocus - Fired when the input area receives focus
 * @fires igcInputBlur - Fired when the input area loses focus
 * @fires igcAttachmentDrag - Fired when dragging a file over the input
 * @fires igcAttachmentDrop - Fired when a file is dropped into the input
 * @fires igcChange - Fired when file input changes (delegated from `<igc-file-input>`)
 *
 * @csspart input-container - Container for the input section
 * @csspart input-wrapper - Wrapper around the text input
 * @csspart text-input - The `<igc-textarea>` component
 * @csspart buttons-container - Container for file upload/send buttons
 * @csspart send-button - The send icon button
 * @csspart attachments - Container for rendering attachments
 * @csspart attachment-wrapper - Wrapper for individual attachment
 * @csspart attachment-name - Display name of an attachment
 */
export default class IgcChatInputComponent extends LitElement {
  public static readonly tagName = 'igc-chat-input';

  public static override styles = styles;

  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

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
    this._chatState?.updateAcceptedTypesCache();
  }

  @state()
  private inputValue = '';

  @state()
  private dragClass = '';

  constructor() {
    super();
    registerIconFromText('attachment', attachmentIcon, 'material');
    registerIconFromText('send-message', sendButtonIcon, 'material');
  }

  public get defaultAttachmentsArea(): TemplateResult {
    return html`${this._chatState?.inputAttachments?.map(
      (attachment, index) => html`
        <div part="attachment-wrapper" role="listitem">
          <igc-chip removable @igcRemove=${() => this.removeAttachment(index)}>
            <span part="attachment-name">${attachment.name}</span>
          </igc-chip>
        </div>
      `
    )} `;
  }

  public get defaultTextArea(): TemplateResult {
    return html` <igc-textarea
      part="text-input"
      placeholder="Type a message..."
      resize="auto"
      rows="1"
      .value=${this.inputValue}
      @input=${this.handleInput}
      @keydown=${this.handleKeyDown}
      @focus=${this.handleFocus}
      @blur=${this.handleBlur}
    ></igc-textarea>`;
  }

  public get defaultFileUploadButton(): TemplateResult {
    return html`
      <igc-file-input
        multiple
        .accept=${this._chatState?.options?.acceptedFiles}
        @igcChange=${this.handleFileUpload}
      >
        <igc-icon
          slot="file-selector-text"
          name="attachment"
          collection="material"
        ></igc-icon>
      </igc-file-input>
    `;
  }

  public get defaultSendButton(): TemplateResult {
    return html` <igc-icon-button
      aria-label="Send message"
      name="send-message"
      collection="material"
      variant="contained"
      part="send-button"
      ?disabled=${!this.inputValue.trim() &&
      this._chatState?.inputAttachments.length === 0}
      @click=${this.sendMessage}
    ></igc-icon-button>`;
  }

  protected *renderDefaultFileUploadTemplate() {
    yield html`${this._chatState?.options?.disableAttachments
      ? nothing
      : this.defaultFileUploadButton}`;
  }

  protected override firstUpdated() {
    this.setupDragAndDrop();
    if (this._chatState) {
      this._chatState.updateAcceptedTypesCache();
      this._chatState.textArea = this.textInputElement;
    }
  }

  protected override updated() {
    this.inputValue = this._chatState?.inputValue || '';
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.inputValue = target.value;
    this._chatState?.handleInputChange(this.inputValue);
    this.adjustTextareaHeight();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    } else {
      this._chatState?.emitEvent('igcTypingChange', {
        detail: { isTyping: true },
      });

      // wait 3 seconds and dispatch a stop-typing event
      setTimeout(() => {
        this._chatState?.emitEvent('igcTypingChange', {
          detail: { isTyping: false },
        });
      }, 3000);
    }
  }

  private handleFocus() {
    this._chatState?.emitEvent('igcInputFocus');
  }

  private handleBlur() {
    this._chatState?.emitEvent('igcInputBlur');
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
      this._chatState?.isFileTypeAccepted(item.getAsFile() as File, item.type)
    );

    this.dragClass = hasValidFiles ? 'dragging' : '';

    this._chatState?.emitEvent('igcAttachmentDrag');
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

    const validFiles = files.filter((file) =>
      this._chatState?.isFileTypeAccepted(file)
    );

    this._chatState?.emitEvent('igcAttachmentDrop');

    this._chatState?.attachFiles(validFiles);
    this.requestUpdate();
  }

  private adjustTextareaHeight() {
    const textarea = this.textInputElement;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }

  private sendMessage() {
    if (
      !this.inputValue.trim() &&
      this._chatState?.inputAttachments.length === 0
    )
      return;

    this._chatState?.addMessage({
      text: this.inputValue,
      attachments: this._chatState?.inputAttachments,
    });
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
    this._chatState?.attachFiles(files);
    this.requestUpdate();
  }

  private removeAttachment(index: number) {
    this._chatState?.removeAttachment(index);
    this.requestUpdate();
  }

  private renderActionsArea() {
    return html`<div part="buttons-container">
      ${this._chatState?.options?.templates?.textAreaActionsTemplate
        ? this._chatState?.options?.templates?.textAreaActionsTemplate
        : html`
            ${this.renderDefaultFileUploadTemplate()} ${this.defaultSendButton}
          `}
    </div>`;
  }

  private renderAttachmentsArea() {
    return html`<div part="attachments" role="list" aria-label="Attachments">
      ${this._chatState?.options?.templates?.textAreaAttachmentsTemplate
        ? this._chatState.options.templates.textAreaAttachmentsTemplate(
            this._chatState?.inputAttachments
          )
        : this.defaultAttachmentsArea}
    </div>`;
  }

  protected override render() {
    return html`
      <div part="input-container" class="${this.dragClass}">
        ${this.renderAttachmentsArea()}

        <div part="input-wrapper">
          ${this._chatState?.options?.templates?.textInputTemplate
            ? this._chatState.options.templates.textInputTemplate(
                this._chatState?.inputValue
              )
            : this.defaultTextArea}
        </div>
        ${this.renderActionsArea()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-input': IgcChatInputComponent;
  }
}
