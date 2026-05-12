import { ContextConsumer, consume } from '@lit/context';
import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { chatContext, chatUserInputContext } from '../common/context.js';
import { addAdoptedStylesController } from '../common/controllers/adopt-styles.js';
import { enterKey, tabKey } from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { bindIf, hasFiles, isEmpty, trimmedHtml } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/input.base.css.js';
import { all } from './themes/input.js';
import { styles as shared } from './themes/shared/input/input.common.css.js';
import type {
  ChatInputRenderContext,
  ChatRenderContext,
  ChatTemplateRenderer,
  IgcChatMessageAttachment,
} from './types.js';
import {
  type ChatAcceptedFileTypes,
  getChatAcceptedFiles,
  getIconName,
} from './utils.js';

type DefaultInputRenderers = {
  input: ChatTemplateRenderer<ChatInputRenderContext>;
  inputActions: ChatTemplateRenderer<ChatRenderContext>;
  inputActionsEnd: ChatTemplateRenderer<ChatRenderContext>;
  inputActionsStart: ChatTemplateRenderer<ChatRenderContext>;
  inputAttachments: ChatTemplateRenderer<ChatInputRenderContext>;
  fileUploadButton: ChatTemplateRenderer<ChatRenderContext>;
  sendButton: ChatTemplateRenderer<ChatRenderContext>;
};

/* blazorSuppress */
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
 * @csspart actions-container - Container for file upload/send buttons
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

  private readonly _defaults: Readonly<DefaultInputRenderers> = Object.freeze({
    fileUploadButton: () => this._renderFileUploadButton(),
    input: () => this._renderTextArea(),
    inputActions: () => this._renderActionsArea(),
    inputActionsEnd: () => nothing,
    inputActionsStart: () => nothing,
    inputAttachments: (ctx) => this._renderAttachmentsArea(ctx.attachments),
    sendButton: () => this._renderSendButton(),
  });

  private _userIsTyping = false;
  private _userLastTypeTime = Date.now();
  private _typingTimeout = 0;

  private readonly _adoptedStyles = addAdoptedStylesController(this);

  private readonly _stateChanged = () => {
    this._shouldAdoptRootStyles = Boolean(this._state.options?.adoptRootStyles);
  };

  private readonly _stateConsumer = new ContextConsumer(this, {
    context: chatContext,
    callback: this._stateChanged,
    subscribe: true,
  });

  @consume({ context: chatUserInputContext, subscribe: true })
  private readonly _userInputState!: ChatState;

  @query(IgcTextareaComponent.tagName)
  private readonly _textInputElement?: IgcTextareaComponent;

  @query('#input_attachments')
  protected readonly _fileInput?: HTMLInputElement;

  @state()
  private _parts = { 'input-container': true, dragging: false };

  @state()
  private _shouldAdoptRootStyles = false;

  private get _state(): ChatState {
    return this._stateConsumer.value!;
  }

  private get _acceptedTypes(): ChatAcceptedFileTypes | null {
    return this._state.acceptedFileTypes;
  }

  constructor() {
    super();
    addThemingController(this, all, { themeChange: this._adoptPageStyles });
  }

  protected override update(props: PropertyValues): void {
    if (props.has('_shouldAdoptRootStyles')) {
      this._adoptedStyles.shouldAdoptStyles(this._shouldAdoptRootStyles);
    }
    super.update(props);
  }

  /** @internal */
  public focusInput(): void {
    this._textInputElement?.focus();
  }

  private _adoptPageStyles(): void {
    this._adoptedStyles.invalidateCache(this.ownerDocument);
    this._adoptedStyles.shouldAdoptStyles(this._shouldAdoptRootStyles);
  }

  private _getRenderer<U extends keyof DefaultInputRenderers>(
    name: U
  ): DefaultInputRenderers[U] {
    return this._state.options?.renderers
      ? ((this._state.options.renderers[name] ??
          this._defaults[name]) as DefaultInputRenderers[U])
      : this._defaults[name];
  }

  private async _sendMessage(): Promise<void> {
    if (
      !this._userInputState.hasInputValue &&
      !this._userInputState.hasInputAttachments
    ) {
      return;
    }

    this._userInputState.addMessageWithEvent({
      text: this._userInputState.inputValue,
      attachments: this._userInputState.inputAttachments,
    });

    this.style.height = 'auto';

    await this._userInputState.host.updateComplete;
    this.focusInput();
  }

  private _setTypingStateAndEmit(state: boolean): void {
    this._userIsTyping = state;
    this._userInputState.emitUserTypingState(state);
  }

  private _handleAttachmentRemoved(attachment: IgcChatMessageAttachment): void {
    const current = this._userInputState.inputAttachments;

    if (this._state.emitAttachmentRemoved(attachment)) {
      this._state.inputAttachments = current.toSpliced(
        current.indexOf(attachment),
        1
      );
    }
  }

  private _handleKeydown(event: KeyboardEvent): void {
    this._userLastTypeTime = Date.now();
    const isEnterKey = event.key.toLowerCase() === enterKey.toLowerCase();
    const isTab = event.key.toLocaleLowerCase() === tabKey.toLowerCase();

    if (isTab && !this._userIsTyping) {
      return;
    }

    if (isEnterKey && !event.shiftKey) {
      event.preventDefault();
      this._sendMessage();

      if (this._userIsTyping) {
        clearTimeout(this._typingTimeout);
        this._setTypingStateAndEmit(false);
      }

      return;
    }

    clearTimeout(this._typingTimeout);
    const delay = this._state.stopTypingDelay;

    if (!this._userIsTyping) {
      this._setTypingStateAndEmit(true);
    }

    this._typingTimeout = setTimeout(() => {
      if (this._userIsTyping && this._userLastTypeTime + delay <= Date.now()) {
        this._setTypingStateAndEmit(false);
      }
    }, delay);
  }

  private _handleFileInputClick(): void {
    this._fileInput?.showPicker();
  }

  private _handleFocusState(event: FocusEvent): void {
    this._state.emitEvent(
      event.type === 'focus' ? 'igcInputFocus' : 'igcInputBlur'
    );
  }

  private _handleDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const validFiles = getChatAcceptedFiles(event, this._acceptedTypes);
    this._parts = { 'input-container': true, dragging: !isEmpty(validFiles) };
    this._state.emitEvent('igcAttachmentDrag');
  }

  private _handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private _handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if we're actually leaving the container
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      this._parts = { 'input-container': true, dragging: false };
    }
  }

  private _handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this._parts = { 'input-container': true, dragging: false };

    const validFiles = getChatAcceptedFiles(event, this._acceptedTypes);
    this._state.emitEvent('igcAttachmentDrop');
    this._state.attachFilesWithEvent(validFiles);
    this.requestUpdate();
  }

  private _handleInput({ detail }: CustomEvent<string>): void {
    this._state.inputValue = detail;
    this._state.emitEvent('igcInputChange', { detail: { value: detail } });
  }

  private _handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (hasFiles(input)) {
      this._state.attachFilesWithEvent(Array.from(input.files!));
    }
  }

  /**
   * Default attachments area template used when no custom template is provided.
   * Renders the list of input attachments as chips.
   * @returns TemplateResult containing the attachments area
   */
  private _renderAttachmentsArea(attachments: IgcChatMessageAttachment[]) {
    return html`${attachments?.map(
      (attachment) => html`
        <div part="attachment-wrapper" role="listitem">
          <igc-chip
            removable
            @igcRemove=${() => this._handleAttachmentRemoved(attachment)}
          >
            <igc-icon
              part="attachment-icon"
              slot="prefix"
              name=${getIconName(attachment.file?.type ?? attachment.type)}
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
        aria-label="Chat text input"
        placeholder=${ifDefined(this._state.options?.inputPlaceholder)}
        resize="auto"
        rows="1"
        .value=${this._userInputState?.inputValue}
        @igcInput=${this._handleInput}
        @keydown=${this._handleKeydown}
        @focus=${this._handleFocusState}
        @blur=${this._handleFocusState}
      ></igc-textarea>
    `;
  }

  private _renderFileUploadButton() {
    const accepted = this._state.options?.acceptedFiles;
    const attachmentsDisabled = this._state.options?.disableInputAttachments;

    return html`${cache(
      attachmentsDisabled
        ? nothing
        : html`
            <label for="input_attachments" part="file-upload">
              <igc-icon-button
                aria-label="Attach files"
                variant="flat"
                name="attach_file"
                @click=${this._handleFileInputClick}
              ></igc-icon-button>
              <input
                type="file"
                id="input_attachments"
                tabindex="-1"
                name="input_attachments"
                aria-label="Upload button"
                multiple
                accept=${bindIf(accepted, accepted)}
                @change=${this._handleFileUpload}
              />
            </label>
          `
    )}`;
  }

  private _renderSendButton() {
    const enabled =
      this._state.hasInputValue || this._state.hasInputAttachments;

    return html`
      <igc-icon-button
        aria-label="Send message"
        name="send_message"
        variant="contained"
        part="send-button"
        ?disabled=${!enabled}
        @click=${this._sendMessage}
      ></igc-icon-button>
    `;
  }

  private _renderActionsArea() {
    const ctx: ChatRenderContext = { instance: this._state.host };

    return trimmedHtml`
      <div part="file-upload-container">
        ${this._getRenderer('fileUploadButton')(ctx)}
      </div>
      <div part="input-actions-start">
        ${this._getRenderer('inputActionsStart')(ctx)}
      </div>
      <div part="send-button-container">${this._getRenderer('sendButton')(ctx)}</div>
      <div part="input-actions-end">
        ${this._getRenderer('inputActionsEnd')(ctx)}
      </div>
    `;
  }

  protected override render() {
    const ctx: ChatRenderContext = { instance: this._state.host };

    const inputCtx: ChatInputRenderContext = {
      ...ctx,
      attachments: this._state.inputAttachments,
      value: this._state.inputValue,
    };

    return html`
      <div
        part=${partMap(this._parts)}
        @dragenter=${this._handleDragEnter}
        @dragover=${this._handleDragOver}
        @dragleave=${this._handleDragLeave}
        @drop=${this._handleDrop}
      >
        ${this._state.hasInputAttachments
          ? html`
              <div part="attachments" role="list" aria-label="Attachments">
                ${until(this._getRenderer('inputAttachments')(inputCtx))}
              </div>
            `
          : nothing}

        <div part="input-wrapper">
          ${until(this._getRenderer('input')(inputCtx))}
        </div>

        <div part="actions-container">
          ${until(this._getRenderer('inputActions')(ctx))}
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
