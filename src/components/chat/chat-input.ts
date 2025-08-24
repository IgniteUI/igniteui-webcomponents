import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { chatContext } from '../common/context.js';
import { addKeybindings } from '../common/controllers/key-bindings.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcIconComponent from '../icon/icon.js';
import { registerIconFromText } from '../icon/icon.registry.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/input.base.css.js';
import { all } from './themes/input.js';
import { styles as shared } from './themes/shared/input/input.common.css.js';
import {
  attachmentIcon,
  fileDocumentIcon,
  fileImageIcon,
  sendButtonIcon,
  starIcon,
} from './types.js';

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

  @consume({ context: chatContext, subscribe: true })
  private _chatState?: ChatState;

  /* blazorSuppress */
  public static register() {
    registerComponent(
      IgcChatInputComponent,
      IgcTextareaComponent,
      IgcIconButtonComponent,
      IgcChipComponent,
      IgcIconComponent
    );
  }

  @query(IgcTextareaComponent.tagName)
  private _textInputElement!: IgcTextareaComponent;

  @query('#input_attachments')
  protected _inputAttachmentsButton!: IgcIconButtonComponent;

  // private readonly _textAreaRef = createRef<IgcTextareaComponent>();

  @watch('acceptedFiles', { waitUntilFirstUpdate: true })
  protected acceptedFilesChange(): void {
    this._chatState?.updateAcceptedTypesCache();
  }

  @state()
  private containerPart = 'input-container';

  constructor() {
    super();
    addThemingController(this, all);
    registerIconFromText('attachment', attachmentIcon, 'material');
    registerIconFromText('send-message', sendButtonIcon, 'material');
    registerIconFromText('file-document', fileDocumentIcon, 'material');
    registerIconFromText('file-image', fileImageIcon, 'material');
    registerIconFromText('star-icon', starIcon, 'material');
  }

  protected override firstUpdated() {
    this.setupDragAndDrop();
    if (this._chatState) {
      this._chatState.updateAcceptedTypesCache();
      this._chatState.textArea = this._textInputElement;
    }

    // Use keybindings controller to capture all key events
    // Custom skip function that never skips - this captures ALL key events
    const keybindings = addKeybindings(this, {
      skip: () => false, // Never skip any key events
      ref: this._chatState?.textAreaRef,
    });

    // Override the controller's handleEvent to capture all keys
    // This is a more direct approach that doesn't require listing specific keys
    keybindings.handleEvent = (event: KeyboardEvent) => {
      // Call our handler for every key event
      this._chatState?.handleKeyDown(event);
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

  private handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer?.items || []).filter(
      (item) => item.kind === 'file'
    );
    const hasValidFiles = files.some((item) =>
      this._chatState?.isFileTypeAccepted(item.getAsFile() as File, item.type)
    );

    this.containerPart = `input-container ${hasValidFiles ? ' dragging' : ''}`;

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
      this.containerPart = 'input-container';
    }
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.containerPart = 'input-container';

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) =>
      this._chatState?.isFileTypeAccepted(file)
    );

    this._chatState?.emitEvent('igcAttachmentDrop');

    this._chatState?.attachFiles(validFiles);
    this.requestUpdate();
  }

  protected override render() {
    const templates = this._chatState?.mergedTemplates;
    return html`
      <div part="${this.containerPart}">
        ${this._chatState?.inputAttachments &&
        this._chatState?.inputAttachments.length > 0
          ? html` <div part="attachments" role="list" aria-label="Attachments">
              ${templates?.textAreaAttachmentsTemplate(
                this._chatState?.inputAttachments
              )}
            </div>`
          : nothing}
        <div part="input-wrapper">
          ${templates?.textInputTemplate(this._chatState?.inputValue ?? '')}
        </div>
        <div part="buttons-container">
          ${templates?.textAreaActionsTemplate()}
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
