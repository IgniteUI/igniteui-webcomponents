import { consume } from '@lit/context';
import { html, isServer, LitElement, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { cache } from 'lit/directives/cache.js';
import { guard } from 'lit/directives/guard.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { until } from 'lit/directives/until.js';
import { chatUserInputContext } from '#internals/context.js';
import { enterKey, isKey, tabKey } from '#internals/controllers/keys.js';
import { registerComponent } from '#internals/definitions/register.js';
import { HydrationMixin } from '#internals/mixins/hydration.js';
import { partMap } from '#internals/part-map.js';
import { createTimer } from '#internals/timing.js';
import { isEmpty } from '#internals/utils/arrays.js';
import { hasFiles, isPointInsideElement } from '#internals/utils/dom.js';
import { bindIf, trimmedHtml } from '#internals/utils/lit.js';
import { formatString } from '#internals/utils/strings.js';
import { all } from '#themes/chat/themes/input.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import IgcIconComponent from '../icon/icon.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { addChatStateConsumer } from './state-consumer.js';
import { styles } from './themes/input.base.css.js';
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
  sendButton: ChatTemplateRenderer<ChatRenderContext>;
};

/* blazorSuppress */
/**
 * A web component that provides the input area for the chat interface.
 *
 * It supports:
 * - Text input with automatic resizing
 * - Sending messages on Enter key (with Shift+Enter for newlines)
 * - File attachments via file picker or drag-and-drop
 * - Customizable templates for send button, attachments, and text input
 *
 * Its events are dispatched on the parent chat.
 *
 * @element igc-chat-input
 *
 * @csspart input-container - Container for the input section
 * @csspart input-wrapper - Wrapper around the text input
 * @csspart text-input - The underlying textarea component.
 * @csspart actions-container - Container for file upload/send buttons
 * @csspart send-button - The send icon button
 * @csspart attachments - Container for rendering attachments
 * @csspart attachment-wrapper - Wrapper for individual attachment
 * @csspart attachment-name - Display name of an attachment
 */
export default class IgcChatInputComponent extends HydrationMixin(LitElement) {
  public static readonly tagName = 'igc-chat-input';
  public static override styles = [componentBase, styles, shared];

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

  private readonly _typingTimer = createTimer(() => {
    if (!this._userIsTyping) {
      return;
    }

    // The delay can grow after the timer starts, so defer the stop.
    const remaining =
      this._userLastTypeTime + this._state.stopTypingDelay - Date.now();

    if (remaining > 0) {
      this._typingTimer.start(remaining);
    } else {
      this._setTypingStateAndEmit(false);
    }
  });

  private readonly _chat = addChatStateConsumer(this);

  @consume({ context: chatUserInputContext, subscribe: true })
  private readonly _userInputState!: ChatState;

  @query(IgcTextareaComponent.tagName)
  private readonly _textInputElement?: IgcTextareaComponent;

  @query('#input_attachments')
  protected readonly _fileInput?: HTMLInputElement;

  @state()
  private _dragging = false;

  private get _state(): ChatState {
    return this._chat.state!;
  }

  constructor() {
    super();
    addThemingController(this, all, {
      themeChange: () => this._chat.refreshStyles(),
    });
  }

  /** @internal */
  public async focusInput(options?: FocusOptions): Promise<void> {
    // A hydrating input adds the text area only in its second render.
    while (
      !this._textInputElement &&
      (this.isUpdatePending || this._hydrating)
    ) {
      await this.updateComplete;
    }

    const textarea = this._textInputElement;

    if (textarea && !textarea.hasUpdated) {
      await textarea.updateComplete;
    }

    textarea?.focus(options);
  }

  private _getRenderer<U extends keyof DefaultInputRenderers>(
    name: U
  ): DefaultInputRenderers[U] {
    return (this._state.options?.renderers?.[name] ??
      this._defaults[name]) as DefaultInputRenderers[U];
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
    this._userInputState.emitEvent('igcTypingChange', { detail: state });
  }

  private _handleKeydown(event: KeyboardEvent): void {
    this._userLastTypeTime = Date.now();

    if (isKey(event, tabKey) && !this._userIsTyping) {
      return;
    }

    if (isKey(event, enterKey) && !event.shiftKey) {
      event.preventDefault();
      this._sendMessage();

      if (this._userIsTyping) {
        this._typingTimer.stop();
        this._setTypingStateAndEmit(false);
      }

      return;
    }

    if (!this._userIsTyping) {
      this._setTypingStateAndEmit(true);
    }

    this._typingTimer.start(this._state.stopTypingDelay);
  }

  private _handleFileInputClick(): void {
    this._fileInput?.showPicker();
  }

  private _handleFocusState(event: FocusEvent): void {
    this._state.emitEvent(
      event.type === 'focus' ? 'igcInputFocus' : 'igcInputBlur'
    );
  }

  private _handleDrag(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const accepted = this._state.acceptedFileTypes;

    switch (event.type) {
      case 'dragenter':
        this._dragging = !isEmpty(getChatAcceptedFiles(event, accepted));
        this._state.emitEvent('igcAttachmentDrag');
        break;
      case 'dragleave': {
        // Reset only when the pointer leaves the container.
        const container = event.currentTarget as HTMLElement;

        if (!isPointInsideElement(container, event.clientX, event.clientY)) {
          this._dragging = false;
        }
        break;
      }
      case 'drop': {
        this._dragging = false;
        this._state.emitEvent('igcAttachmentDrop');
        this._state.attachFilesWithEvent(
          Array.from(event.dataTransfer?.files ?? [])
        );
        break;
      }
    }
  }

  private _handleInput({ detail }: CustomEvent<string>): void {
    this._state.inputValue = detail;
    this._state.emitEvent('igcInputChange', { detail });
  }

  private _handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (hasFiles(input)) {
      this._state.attachFilesWithEvent(Array.from(input.files!));
    }
  }

  private _renderAttachmentsArea(attachments: IgcChatMessageAttachment[]) {
    const { chat_remove_attachment } = this._state.resourceStrings;

    return html`${attachments?.map(
      (attachment) => html`
        <div part="attachment-wrapper" role="listitem">
          <igc-chip
            removable
            .resourceStrings=${guard(
              [attachment.name, chat_remove_attachment],
              () => ({
                chip_remove: formatString(
                  chat_remove_attachment!,
                  attachment.name
                ),
              })
            )}
            @igcRemove=${() =>
              this._state.removeAttachmentWithEvent(attachment)}
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

  private _renderTextArea() {
    return html`
      <igc-textarea
        part="text-input"
        aria-label=${this._state.resourceStrings.chat_input_label!}
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
    const { chat_attach_files, chat_file_input_label } =
      this._state.resourceStrings;

    return html`${cache(
      attachmentsDisabled
        ? nothing
        : html`
            <label for="input_attachments" part="file-upload">
              <igc-icon-button
                aria-label=${chat_attach_files!}
                variant="flat"
                name="attach_file"
                @click=${this._handleFileInputClick}
              ></igc-icon-button>
              <input
                type="file"
                id="input_attachments"
                tabindex="-1"
                name="input_attachments"
                aria-label=${chat_file_input_label!}
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
        aria-label=${this._state.resourceStrings.chat_send_message!}
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
    // No chat provides the state outside a chat or during SSR. A hydrating
    // host matches that empty server render.
    if (isServer || this._hydrating || !this._chat.state) {
      return nothing;
    }

    const ctx: ChatRenderContext = { instance: this._state.host };

    const inputCtx: ChatInputRenderContext = {
      ...ctx,
      attachments: this._state.inputAttachments,
      value: this._state.inputValue,
    };

    return html`
      <div
        part=${partMap({ 'input-container': true, dragging: this._dragging })}
        @dragenter=${this._handleDrag}
        @dragover=${this._handleDrag}
        @dragleave=${this._handleDrag}
        @drop=${this._handleDrag}
      >
        ${
          this._state.hasInputAttachments
            ? html`
                <div
                  part="attachments"
                  role="list"
                  aria-label=${
                    this._state.resourceStrings.chat_attachments_list_label!
                  }
                >
                  ${until(this._getRenderer('inputAttachments')(inputCtx))}
                </div>
              `
            : nothing
        }

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
