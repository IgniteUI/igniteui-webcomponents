import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { chatContext } from '../common/context.js';
import { addKeybindings } from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import { isEmpty } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/input.base.css.js';
import { all } from './themes/input.js';
import { styles as shared } from './themes/shared/input/input.common.css.js';
import {
  attachmentIcon,
  type ChatRenderers,
  fileDocumentIcon,
  fileImageIcon,
  type IgcMessageAttachment,
  sendButtonIcon,
  starIcon,
} from './types.js';
import { getChatAcceptedFiles, getIconName } from './utils.js';

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

  public static override styles = [styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(
      IgcChatInputComponent,
      IgcTextareaComponent,
      IgcIconButtonComponent,
      IgcChipComponent,
      IgcIconComponent
    );
  }

  @consume({ context: chatContext, subscribe: true })
  private readonly _chatState!: ChatState;

  private get _acceptedTypes() {
    return this._chatState.acceptedFileTypes;
  }

  @query(IgcTextareaComponent.tagName)
  private readonly _textInputElement!: IgcTextareaComponent;

  @query('#input_attachments')
  protected readonly _inputAttachmentsButton!: IgcIconButtonComponent;

  private readonly _attachmentsButtonInputRef = createRef<HTMLInputElement>();

  @watch('acceptedFiles', { waitUntilFirstUpdate: true })
  protected acceptedFilesChange(): void {
    this._chatState.updateAcceptedTypesCache();
  }

  @state()
  private containerPart = 'input-container';

  private _defaults: Partial<ChatRenderers>;
  private _cachedRenderers?: {
    custom: Partial<ChatRenderers>;
    merged: Partial<ChatRenderers>;
  };

  private get _renderers() {
    if (!this._chatState?.options?.renderers) {
      return this._defaults;
    }

    const custom = this._chatState.options.renderers;
    if (this._cachedRenderers?.custom === custom) {
      return this._cachedRenderers.merged;
    }

    const merged = {
      ...this._defaults,
      ...custom,
    };

    this._cachedRenderers = { custom, merged };
    return merged;
  }

  constructor() {
    super();
    addThemingController(this, all);
    this._defaults = {
      input: () => this._renderTextArea(),
      inputActions: () => this.renderActionsArea(),
      inputAttachments: (ctx) => this.renderAttachmentsArea(ctx.param),
      fileUploadButton: () => this.renderFileUploadButton(),
      sendButton: () => this._renderSendButton(),
    };
    registerIconFromText('attachment', attachmentIcon, 'material');
    registerIconFromText('send-message', sendButtonIcon, 'material');
    registerIconFromText('file-document', fileDocumentIcon, 'material');
    registerIconFromText('file-image', fileImageIcon, 'material');
    registerIconFromText('star-icon', starIcon, 'material');
  }

  protected override firstUpdated() {
    this.setupDragAndDrop();
    this._chatState.updateAcceptedTypesCache();
    this._chatState.textArea = this._textInputElement;

    // Use keybindings controller to capture all key events
    // Custom skip function that never skips - this captures ALL key events
    const keybindings = addKeybindings(this, {
      skip: () => false, // Never skip any key events
      ref: this._chatState.textAreaRef,
    });

    // Override the controller's handleEvent to capture all keys
    // This is a more direct approach that doesn't require listing specific keys
    keybindings.handleEvent = (event: KeyboardEvent) => {
      // Call our handler for every key event
      this._chatState.handleKeyDown(event);
    };
  }

  private setupDragAndDrop() {
    const container = this.shadowRoot?.querySelector(
      `div[part='input-container']`
    ) as HTMLElement;
    if (container) {
      container.addEventListener('dragenter', this.handleDragEnter.bind(this));
      container.addEventListener('dragover', this.handleDragOver.bind(this));
      container.addEventListener('dragleave', this.handleDragLeave.bind(this));
      container.addEventListener('drop', this.handleDrop.bind(this));
    }
  }

  private _handleFocusState(event: FocusEvent): void {
    this._chatState.emitEvent(
      event.type === 'focus' ? 'igcInputFocus' : 'igcInputBlur'
    );
  }

  private handleDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const validFiles = getChatAcceptedFiles(event, this._acceptedTypes);
    this.containerPart = `input-container ${!isEmpty(validFiles) ? ' dragging' : ''}`;
    this._chatState.emitEvent('igcAttachmentDrag');
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
      this.containerPart = 'input-container';
    }
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.containerPart = 'input-container';

    const validFiles = getChatAcceptedFiles(e, this._acceptedTypes);
    this._chatState.emitEvent('igcAttachmentDrop');
    this._chatState.attachFiles(validFiles);
    this.requestUpdate();
  }

  /**
   * Handles input text changes.
   * Updates internal inputValue and emits 'igcInputChange' event.
   * @param e Input event from the text area
   */
  private _handleInput({ detail }: CustomEvent<string>): void {
    if (detail === this._chatState?.inputValue) return;

    this._chatState.inputValue = detail;
    this._chatState?.emitEvent('igcInputChange', { detail: { value: detail } });
  }

  private _handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this._chatState.attachFiles(Array.from(input.files));
  }
  /**
   * Default attachments area template used when no custom template is provided.
   * Renders the list of input attachments as chips.
   * @returns TemplateResult containing the attachments area
   */
  private renderAttachmentsArea(attachments: IgcMessageAttachment[]) {
    return html`${attachments?.map(
      (attachment, index) => html`
        <div part="attachment-wrapper" role="listitem">
          <igc-chip
            removable
            @igcRemove=${() => this._chatState?.removeAttachment(index)}
          >
            <igc-icon
              slot="prefix"
              name=${getIconName(attachment.file?.type ?? attachment.type)}
              collection="material"
            ></igc-icon>
            <span part="attachment-name">${attachment.name}</span>
          </igc-chip>
        </div>
      `
    )} `;
  }

  /**
   * Default text area template used when no custom template is provided.
   * Renders a text area for user input.
   * @returns TemplateResult containing the text area
   */
  private _renderTextArea() {
    return html`
      <igc-textarea
        part="text-input"
        placeholder=${ifDefined(this._chatState?.options?.inputPlaceholder)}
        resize="auto"
        rows="1"
        .value=${this._chatState?.inputValue}
        @igcInput=${this._handleInput}
        @focus=${this._handleFocusState}
        @blur=${this._handleFocusState}
      ></igc-textarea>
    `;
  }

  /**
   * Default file upload button template used when no custom template is provided.
   * Renders a file input for attaching files.
   * @returns TemplateResult containing the file upload button
   */
  private renderFileUploadButton() {
    if (this._chatState?.options?.disableInputAttachments) return nothing;
    return html`
        <label for="input_attachments" part="upload-button">
          <igc-icon-button
            variant="flat"
            name="attachment"
            collection="material"
            @click=${() => this._attachmentsButtonInputRef?.value?.click()}
          ></igc-icon-button>
          <input
            type="file"
            id="input_attachments"
            name="input_attachments"
            ${ref(this._attachmentsButtonInputRef)}
            multiple
            accept=${ifDefined(this._chatState?.options?.acceptedFiles === '' ? undefined : this._chatState?.options?.acceptedFiles)}
            @change=${this._handleFileUpload}>
          </input>
        </label>
      `;
  }

  /**
   * Default send button template used when no custom template is provided.
   * Renders a send button that submits the current input value and attachments.
   * @returns TemplateResult containing the send button
   */
  private _renderSendButton() {
    return html`
      <igc-icon-button
        aria-label="Send message"
        name="send-message"
        collection="material"
        variant="contained"
        part="send-button"
        ?disabled=${!this._chatState?.inputValue.trim() &&
        this._chatState?.inputAttachments.length === 0}
        @click=${this._chatState?.sendMessage}
      ></igc-icon-button>
    `;
  }

  private renderActionsArea() {
    if (!this._renderers) return nothing;

    return html` ${this._renderers.fileUploadButton?.({
      param: undefined,
      defaults: this._defaults,
      options: this._chatState.options,
    })}
    ${this._renderers.sendButton?.({
      param: undefined,
      defaults: this._defaults,
      options: this._chatState.options,
    })}`;
  }

  protected override render() {
    if (!this._renderers) return nothing;

    return html`
      <div part="${this.containerPart}">
        ${this._chatState.inputAttachments &&
        this._chatState.inputAttachments.length > 0
          ? html` <div part="attachments" role="list" aria-label="Attachments">
              ${this._renderers.inputAttachments?.({
                param: this._chatState.inputAttachments,
                defaults: this._defaults,
                options: this._chatState.options,
              })}
            </div>`
          : nothing}
        <div part="input-wrapper">
          ${this._renderers.input?.({
            param: this._chatState.inputValue,
            defaults: this._defaults,
            options: this._chatState.options,
          })}
        </div>
        <div part="buttons-container">
          ${this._renderers.inputActions?.({
            param: undefined,
            defaults: this._defaults,
            options: this._chatState.options,
          })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-chat-input': IgcChatInputComponent;
  }
}
