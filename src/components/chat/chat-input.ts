import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { until } from 'lit/directives/until.js';
import { addThemingController } from '../../theming/theming-controller.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { chatContext, chatUserInputContext } from '../common/context.js';
import { enterKey } from '../common/controllers/key-bindings.js';
import { registerComponent } from '../common/definitions/register.js';
import { partMap } from '../common/part-map.js';
import { bindIf, hasFiles, isEmpty, trimmedHtml } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { BackendSttClient } from './extras/stt-client-backend.js';
import type { ISttClient } from './extras/stt-client-base.js';
import { WebSpeechSttClient } from './extras/stt-client-webspeech.js';
import { styles } from './themes/input.base.css.js';
import { all } from './themes/input.js';
import { styles as shared } from './themes/shared/input/input.common.css.js';
import type {
  ChatInputRenderContext,
  ChatRenderContext,
  ChatTemplateRenderer,
  IgcChatMessageAttachment,
} from './types.js';
import { getChatAcceptedFiles, getIconName } from './utils.js';

type DefaultInputRenderers = {
  input: ChatTemplateRenderer<ChatInputRenderContext>;
  inputActions: ChatTemplateRenderer<ChatRenderContext>;
  inputActionsEnd: ChatTemplateRenderer<ChatRenderContext>;
  inputActionsStart: ChatTemplateRenderer<ChatRenderContext>;
  inputAttachments: ChatTemplateRenderer<ChatInputRenderContext>;
  fileUploadButton: ChatTemplateRenderer<ChatRenderContext>;
  speechToTextButton: ChatTemplateRenderer<ChatRenderContext>;
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
    speechToTextButton: () => this._renderSpeechToTextButton(),
    input: () => this._renderTextArea(),
    inputActions: () => this._renderActionsArea(),
    inputActionsEnd: () => nothing,
    inputActionsStart: () => nothing,
    inputAttachments: (ctx) => this._renderAttachmentsArea(ctx.attachments),
    sendButton: () => this._renderSendButton(),
  });

  @consume({ context: chatContext, subscribe: true })
  private readonly _state!: ChatState;

  @consume({ context: chatUserInputContext, subscribe: true })
  private readonly _userInputState!: ChatState;

  @query(IgcTextareaComponent.tagName)
  private readonly _textInputElement!: IgcTextareaComponent;

  @query('#input_attachments')
  protected readonly _fileInput!: HTMLInputElement;

  @state()
  private _parts = { 'input-container': true, dragging: false };

  private get _acceptedTypes() {
    return this._state.acceptedFileTypes;
  }

  private _sttClient?: ISttClient;

  @property({ type: Boolean })
  isRecording = false;

  @property({ type: Boolean })
  isStopInProgress = false;

  onPulseSignal = () => {
    const el = this.renderRoot.querySelector<HTMLLabelElement>(
      'label[part="speech-to-text"]'
    )?.firstElementChild;
    if (!el) return;

    el.classList.add('pulsate');
    el.addEventListener('animationend', () => el.classList.remove('pulsate'), {
      once: true,
    });
  };

  onStartCountdown = (ms: number | null) => {
    if (ms) {
      const circle = this.renderRoot.querySelector<SVGCircleElement>(
        'svg.countdown-ring .ring-progress'
      );
      if (!circle) return;

      circle.style.transition = 'none';
      circle.style.strokeDashoffset = '100';
      void circle.getBoundingClientRect(); // reflow

      circle.style.transition = `stroke-dashoffset ${ms}ms linear`;
      circle.style.strokeDashoffset = '0';
    } else {
      const circle = this.renderRoot.querySelector<SVGCircleElement>(
        'svg.countdown-ring .ring-progress'
      );
      if (circle) {
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = '100';
      }
    }
  };

  onStopInProgress = () => {
    this.isStopInProgress = true;
  };

  onTranscript = (text: string) => {
    this._state.inputValue = text;
  };

  onFinishedTranscribing = (finished: string) => {
    this.isStopInProgress = false;
    this.isRecording = false;
    if (finished === 'auto') {
      this._sendMessage();
    }
  };

  async _toggleMic() {
    if (!this.isRecording) {
      if (this._state.options?.speechToText?.serviceProvider === 'webspeech') {
        this._sttClient = new WebSpeechSttClient(
          this.onPulseSignal,
          this.onStartCountdown,
          this.onTranscript,
          this.onStopInProgress,
          this.onFinishedTranscribing
        );
      } else if (
        this._state.options?.speechToText?.serviceProvider === 'backend' &&
        this._state.options?.speechToText?.serviceUri
      ) {
        this._sttClient = new BackendSttClient(
          this._state.options?.speechToText?.serviceUri!,
          this.onPulseSignal,
          this.onStartCountdown,
          this.onTranscript,
          this.onStopInProgress,
          this.onFinishedTranscribing
        );
      } else {
        // console.error('No STT service configured');
      }

      if (!this._sttClient) {
        return;
      }

      await this._sttClient.start(this._state.options?.speechToText?.lang);
      this.isRecording = true;
      this.isStopInProgress = false;
    } else {
      this._sttClient?.stop();
    }
  }

  constructor() {
    super();
    addThemingController(this, all);
  }

  /** @internal */
  public focusInput(): void {
    this._textInputElement.focus();
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
    const isSendRequest =
      event.key.toLowerCase() === enterKey.toLowerCase() && !event.shiftKey;

    if (isSendRequest) {
      event.preventDefault();
      this._sendMessage();
    } else {
      // TODO:
      this._state.handleKeyDown(event);
    }
  }

  private _handleFileInputClick(): void {
    this._fileInput.showPicker();
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
        placeholder=${ifDefined(
          this.isRecording
            ? this._state.options?.speakPlaceholder
            : this._state.options?.inputPlaceholder
        )}
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

  private _renderSpeechToTextButton() {
    const sttEnabled = this._state.options?.speechToText?.enable;

    return html`${cache(
      sttEnabled
        ? html` <div class="stop-btn-wrapper">
            <label part="speech-to-text">
              <igc-icon-button
                aria-label="Speech to text"
                variant="flat"
                @click=${this._toggleMic}
                ?disabled=${this.isStopInProgress}
              >
                ${this.isRecording ? '🛑' : '🎤'}
              </igc-icon-button>
            </label>
            ${this.isRecording && !this.isStopInProgress
              ? html`
                  <svg class="countdown-ring" viewBox="0 0 36 36">
                    <circle class="ring-bg" cx="18" cy="18" r="14"></circle>
                    <circle
                      class="ring-progress"
                      cx="18"
                      cy="18"
                      r="14"
                    ></circle>
                  </svg>
                `
              : nothing}
          </div>`
        : nothing
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
      <div part="speech-to-text-container">
        ${this._getRenderer('speechToTextButton')(ctx)}
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
