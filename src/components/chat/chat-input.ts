import { consume } from '@lit/context';
import { html, LitElement, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
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
import { bindIf, hasFiles, isEmpty } from '../common/util.js';
import IgcIconComponent from '../icon/icon.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import type { ChatState } from './chat-state.js';
import { styles } from './themes/input.base.css.js';
import { all } from './themes/input.js';
import { styles as shared } from './themes/shared/input/input.common.css.js';
import type { ChatTemplateRenderer, IgcMessageAttachment } from './types.js';
import { getChatAcceptedFiles, getIconName } from './utils.js';

type DefaultInputRenderers = {
  input: ChatTemplateRenderer<string>;
  inputActions: ChatTemplateRenderer<void>;
  inputAttachments: ChatTemplateRenderer<IgcMessageAttachment[]>;
  fileUploadButton: ChatTemplateRenderer<void>;
  sendButton: ChatTemplateRenderer<void>;
};
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

  private readonly _defaults: Readonly<DefaultInputRenderers> = Object.freeze({
    input: () => this._renderTextArea(),
    inputActions: () => this.renderActionsArea(),
    inputAttachments: (ctx) => this.renderAttachmentsArea(ctx.param),
    fileUploadButton: () => this._renderFileUploadButton(),
    sendButton: () => this._renderSendButton(),
  });

  constructor() {
    super();
    addThemingController(this, all);
  }

  protected override firstUpdated() {
    this._state.updateAcceptedTypesCache();
    this._state.textArea = this._textInputElement;
  }

  private _getRenderer(
    name: keyof DefaultInputRenderers
  ): ChatTemplateRenderer<any> {
    return this._state.options?.renderers
      ? (this._state.options.renderers[name] ?? this._defaults[name])
      : this._defaults[name];
  }

  private _handleKeydown(event: KeyboardEvent): void {
    const isSend = event.key === enterKey && !event.shiftKey;

    if (isSend) {
      event.preventDefault();
      this._state.sendMessage();
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
    this._state.attachFiles(validFiles);
    this.requestUpdate();
  }

  /**
   * Handles input text changes.
   * Updates internal inputValue and emits 'igcInputChange' event.
   * @param e Input event from the text area
   */
  private _handleInput({ detail }: CustomEvent<string>): void {
    if (detail === this._state.inputValue) return;

    this._state.inputValue = detail;
    this._state.emitEvent('igcInputChange', { detail: { value: detail } });
  }

  private _handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (hasFiles(input)) {
      this._state.attachFiles(Array.from(input.files!));
    }
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
            @igcRemove=${() => this._state.removeAttachment(index)}
          >
            <igc-icon
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

  /**
   * Default file upload button template used when no custom template is provided.
   * Renders a file input for attaching files.
   * @returns TemplateResult containing the file upload button
   */
  private _renderFileUploadButton() {
    const accepted = this._state.options?.acceptedFiles;
    const attachmentsDisabled = this._state.options?.disableInputAttachments;

    return html`${cache(
      attachmentsDisabled
        ? nothing
        : html`
            <label for="input_attachments" part="upload-button">
              <igc-icon-button
                variant="flat"
                name="attach_file"
                @click=${this._handleFileInputClick}
              ></igc-icon-button>
              <input
                type="file"
                id="input_attachments"
                name="input_attachments"
                multiple
                accept=${bindIf(accepted, accepted)}
                @change=${this._handleFileUpload}
              />
            </label>
          `
    )}`;
  }

  /**
   * Default send button template used when no custom template is provided.
   * Renders a send button that submits the current input value and attachments.
   * @returns TemplateResult containing the send button
   */
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
        @click=${this._state.sendMessage}
      ></igc-icon-button>
    `;
  }

  private renderActionsArea() {
    return html` ${this._getRenderer('fileUploadButton')({
      param: undefined,
      defaults: this._defaults,
      options: this._state.options,
    })}
    ${this._getRenderer('sendButton')({
      param: undefined,
      defaults: this._defaults,
      options: this._state.options,
    })}`;
  }

  protected override render() {
    const partialCtx = {
      defaults: this._defaults,
      options: this._state.options,
    };

    return html`
      <div
        part=${partMap(this._parts)}
        @dragenter=${this._handleDragEnter}
        @dragover=${this._handleDragOver}
        @dragleave=${this._handleDragLeave}
        @drop=${this._handleDrop}
      >
        ${this._state.inputAttachments &&
        this._state.inputAttachments.length > 0
          ? html` <div part="attachments" role="list" aria-label="Attachments">
              ${until(
                this._getRenderer('inputAttachments')({
                  ...partialCtx,
                  param: this._state.inputAttachments,
                })
              )}
            </div>`
          : nothing}
        <div part="input-wrapper">
          ${until(
            this._getRenderer('input')({
              ...partialCtx,
              param: this._state.inputValue,
            })
          )}
        </div>
        <div part="buttons-container">
          ${until(
            this._getRenderer('inputActions')({
              ...partialCtx,
              param: undefined,
            })
          )}
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
