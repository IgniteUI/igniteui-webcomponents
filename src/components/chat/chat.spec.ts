import { html, nothing } from 'lit';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { configureTheme } from '../../theming/config.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';
import { enterKey, tabKey } from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { elementUpdated, fixture } from '../common/helpers.spec.js';
import { first, last } from '../common/util.js';
import {
  expectCalledWith,
  getEvents,
  isFocused,
  simulateBlur,
  simulateClick,
  simulateFocus,
  simulateInput,
  simulateKeyboard,
} from '../common/utils.spec.js';
import { simulateFileUpload } from '../file-input/file-input.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcListItemComponent from '../list/list-item.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import IgcChatComponent from './chat.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageComponent from './chat-message.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import type {
  ChatMessageRenderContext,
  IgcChatMessage,
  IgcChatMessageAttachment,
  IgcChatOptions,
} from './types.js';

describe('Chat', () => {
  beforeAll(() => {
    defineComponents(IgcChatComponent, IgcInputComponent);
  });

  const textInputTemplate = (text: string) => html`
    <igc-input placeholder="Type text here..." .value=${text}></igc-input>
  `;

  const textAreaActionsTemplate = () => html`
    <div class="custom-actions">
      <igc-button>Upload</igc-button>
      <igc-button>Send</igc-button>
    </div>
  `;

  const textAreaAttachmentsTemplate = (
    attachments: IgcChatMessageAttachment[]
  ) => {
    return html`
      <div>
        ${attachments.map(
          (attachment) => html`
            <a
              href=${attachment.file
                ? URL.createObjectURL(attachment.file)
                : (attachment.url ?? '')}
              target="_blank"
            >
              ${attachment.name}
            </a>
          `
        )}
      </div>
    `;
  };

  const messages: IgcChatMessage[] = [
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
    },
    {
      id: '2',
      text: 'Hello!',
      sender: 'user',
      attachments: [
        {
          id: 'img1',
          name: 'img1.png',
          url: 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
          type: 'image',
        },
      ],
    },
    {
      id: '3',
      text: 'Thank you!',
      sender: 'bot',
      attachments: [
        {
          id: 'file1',
          name: 'file1.other',
          url: 'http://some-link-to/file1.other',
          type: 'file',
        },
      ],
    },
    {
      id: '4',
      text: 'Thank you too!',
      sender: 'user',
    },
  ];

  const draftMessage = {
    text: 'Draft message',
    attachments: [
      {
        id: 'img1',
        name: 'img1.png',
        url: 'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
        type: 'image',
      },
    ],
  };

  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
    new File(['image data'], 'image.png', { type: 'image/png' }),
  ];

  let chat: IgcChatComponent;

  beforeEach(async () => {
    chat = await fixture<IgcChatComponent>(html`<igc-chat></igc-chat>`);
  });

  describe('Initialization', () => {
    it('is correctly initialized with its default component state', () => {
      expect(chat.messages).to.be.empty;
      expect(chat.options).to.be.undefined;
      expect(chat.draftMessage).to.eql({ text: '', attachments: [] });
    });

    it('empty chat is rendered correctly', () => {
      const { emptyState, input } = getChatDOM(chat);

      expect(emptyState).not.to.be.null;
      expect(input.fileInput).not.to.be.null;
      expect(input.textarea).not.to.be.null;
      expect(input.sendButton).not.to.be.null;
    });

    it('should render initially set messages correctly', async () => {
      chat.messages = messages;
      await elementUpdated(chat);

      const { messageList, messages: renderedMessages } = getChatDOM(chat);

      expect(chat.messages).lengthOf(messages.length);
      expect(messageList).not.to.be.null;
      expect(renderedMessages).lengthOf(messages.length);

      const [firstMessage, lastMessage] = [
        first(renderedMessages),
        last(renderedMessages),
      ];

      // Response messages have the default reactions.
      expect(getChatMessageDOM(firstMessage).defaultActionButtons).lengthOf(4);

      // Current user messages does not have default reactions
      expect(getChatMessageDOM(lastMessage).defaultActionButtons).to.be.empty;
    });

    it('should render messages from the current user correctly', async () => {
      chat.messages = [
        first(messages),
        last(messages),
        { id: '2', text: 'Hello!', sender: 'me' },
      ];
      chat.options = { currentUserId: 'me' };
      await elementUpdated(chat);

      const renderedMessages = getChatDOM(chat).messages;
      const currentUserMessage = last(renderedMessages);

      for (const each of renderedMessages) {
        expect(
          getChatMessageDOM(each).container.part.contains('sent')
        ).to.equal(each === currentUserMessage);
      }
    });

    it('should render the message in `draftMessage` correctly', async () => {
      chat.draftMessage = draftMessage;
      await elementUpdated(chat);

      const { input } = getChatDOM(chat);

      expect(input.textarea.value).to.equal(draftMessage.text);
      expect(input.chips).lengthOf(draftMessage.attachments.length);
    });

    it('should apply `headerText` correctly', async () => {
      chat.options = { headerText: 'Chat' };
      await elementUpdated(chat);

      const { header } = getChatDOM(chat);
      expect(header.innerText).to.equal(chat.options.headerText);
    });

    it('should apply `inputPlaceholder` correctly', async () => {
      chat.options = { inputPlaceholder: 'Type message here...' };
      await elementUpdated(chat);

      const { input } = getChatDOM(chat);

      expect(input.textarea.placeholder).to.equal(
        chat.options.inputPlaceholder
      );
    });

    it('should enable/disable the send button properly', async () => {
      const { textarea, sendButton, fileInput } = getChatDOM(chat).input;

      expect(sendButton.disabled).to.be.true;

      // When there is a text in the text area, the send button should be enabled
      let value = 'Hello!';
      textarea.value = value;
      textarea.emitEvent('igcInput', { detail: value });
      await elementUpdated(chat);

      expect(sendButton.disabled).to.be.false;

      // When there is no text in the text area, the send button should be disabled
      value = '';
      textarea.value = value;
      textarea.emitEvent('igcInput', { detail: value });
      await elementUpdated(chat);

      expect(sendButton.disabled).to.be.true;

      // When there are attachments, the send button should be enabled regardless of the text area content
      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(sendButton.disabled).to.be.false;
    });

    it('should not render attachment button if `disableInputAttachments` is true', async () => {
      chat.options = { disableInputAttachments: true };
      await elementUpdated(chat);

      const { input } = getChatDOM(chat);
      expect(input.fileInput).to.be.null;
    });

    it('should update the file-input accepted prop based on the `acceptedFiles`', async () => {
      chat.options = { acceptedFiles: 'image/*' };
      await elementUpdated(chat);

      const { input } = getChatDOM(chat);

      expect(input.fileInput.accept).to.equal(chat.options.acceptedFiles);

      chat.options = {};
      await elementUpdated(chat);

      expect(input.fileInput.accept).to.be.empty;
    });

    it('should render attachments chips correctly', async () => {
      const { input } = getChatDOM(chat);
      const fileNames = new Set(files.map((file) => file.name));

      simulateFileUpload(input.fileInput, files);
      await elementUpdated(chat);

      expect(input.chips).length(files.length);
      expect(input.chips.every((chip) => fileNames.has(chip.innerText))).to.be
        .true;
    });

    it('should not render container if suggestions are not provided', () => {
      expect(getChatDOM(chat).suggestionsContainer).to.be.null;
    });

    it('should render suggestions if provided', async () => {
      chat.options = { suggestions: ['Suggestion 1', 'Suggestion 2'] };
      await elementUpdated(chat);

      const { suggestionsContainer } = getChatDOM(chat);

      expect(suggestionsContainer).not.to.be.null;
      expect(suggestionsContainer.querySelector('igc-list')).not.to.be.null;
    });

    it('should render suggestions below empty state by default', async () => {
      chat.options = { suggestions: ['Suggestion 1', 'Suggestion 2'] };
      await elementUpdated(chat);

      const { emptyState, suggestionsContainer } = getChatDOM(chat);
      expect(suggestionsContainer.previousElementSibling).to.eql(emptyState);
    });

    it('should render suggestions below messages by default', async () => {
      chat.options = { suggestions: ['Suggestion 1', 'Suggestion 2'] };
      chat.messages.push({ id: '5', text: 'New message', sender: 'user' });
      await elementUpdated(chat);

      const { messageList, suggestionsContainer } = getChatDOM(chat);

      expect(
        suggestionsContainer.getBoundingClientRect().top
      ).to.be.greaterThanOrEqual(messageList.getBoundingClientRect().bottom);
    });

    it("should render suggestions below input area when position is 'below-input'", async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        suggestionsPosition: 'below-input',
      };
      await elementUpdated(chat);

      const { input, suggestionsContainer } = getChatDOM(chat);
      expect(
        suggestionsContainer.getBoundingClientRect().top
      ).greaterThanOrEqual(input.self.getBoundingClientRect().bottom);
    });

    it('should render typing indicator if `isTyping` is true', async () => {
      chat.options = { isTyping: true };
      await elementUpdated(chat);

      expect(getChatDOM(chat).typingIndicator).not.to.be.null;

      chat.options = { isTyping: false };
      await elementUpdated(chat);

      expect(getChatDOM(chat).typingIndicator).to.be.null;
    });
  });

  describe('Slots', () => {
    const getSlottedElements = (slotName: string) => {
      const prefixSlot = chat.shadowRoot?.querySelector(
        `slot[name="${slotName}"`
      ) as HTMLSlotElement;
      return prefixSlot?.assignedElements();
    };
    const suggestions = ['Login screen', 'Registration Form'];

    beforeEach(async () => {
      chat = await fixture<IgcChatComponent>(html`
        <igc-chat>
          <div slot="prefix">
            <igc-button variant="flat">⋯</igc-button>
          </div>
          <h4 slot="title">Title</h4>
          <div slot="actions">
            <igc-button variant="flat">?</igc-button>
          </div>
          <span slot="empty-state">What do you want to build?</span>
          <h3 slot="suggestions-header">Get inspired</h3>
          <div slot="suggestions">
            ${suggestions.map((suggestion, index) => {
              return html`
                <div slot="suggestion">
                  <span>${index}. ${suggestion}</span>
                  <igc-icon name="good-response"></igc-icon>
                </div>
              `;
            })}
          </div>
          <h3 slot="suggestions-actions">Add more ...</h3>
        </igc-chat>
      `);

      chat.options = { ...chat.options, suggestions };
      await elementUpdated(chat);
    });

    it('should slot header prefix', () => {
      const slottedElements = getSlottedElements('prefix');
      expect(slottedElements.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(
        `<div slot="prefix">
            <igc-button type="button" variant="flat">⋯</igc-button>
          </div>`
      );
    });
    it('should slot header title', () => {
      const slottedElements = getSlottedElements('title');
      expect(slottedElements.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(`<h4 slot="title">Title</h4>`);
    });
    it('should slot header action buttons area', () => {
      const slottedElements = getSlottedElements('actions');
      expect(slottedElements.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(
        `<div slot="actions">
            <igc-button type="button" variant="flat">?</igc-button>
          </div>`
      );
    });
    it('should slot message list area when there are no messages', () => {
      const slottedElements = getSlottedElements('empty-state');
      expect(slottedElements.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(
        `<span slot="empty-state">What do you want to build?</span>`
      );
    });
    it('should slot suggestions header', async () => {
      const slottedElements = getSlottedElements('suggestions-header');
      expect(slottedElements?.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(
        `<h3 slot="suggestions-header">Get inspired</h3>`
      );
    });
    it('should slot suggestions area', async () => {
      const slottedElements = getSlottedElements('suggestions');
      expect(slottedElements?.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(`<div slot="suggestions">
      <div slot="suggestion">
        <span>
          0. Login screen
        </span>
        <igc-icon
          name="good-response"
        >
        </igc-icon>
      </div>
      <div slot="suggestion">
        <span>
          1. Registration Form
        </span>
        <igc-icon
          name="good-response"
        >
        </igc-icon>
      </div>
      </div>`);
    });
    it('should slot suggestions actions area', async () => {
      const slottedElements = getSlottedElements('suggestions-actions');
      expect(slottedElements?.length).to.equal(1);
      expect(slottedElements[0]).dom.to.equal(
        `<h3 slot="suggestions-actions">Add more ...</h3>`
      );
    });
  });

  describe('Templates', () => {
    beforeEach(async () => {
      chat.messages = [messages[1], messages[2]];
    });

    it('should render attachment template', async () => {
      chat.options = {
        renderers: {
          attachment: ({ attachment }) => html`
            <igc-chip class="custom-attachment">
              <span>${attachment.name}</span>
            </igc-chip>
          `,
        },
      };
      await elementUpdated(chat);

      const { messages } = getChatDOM(chat);
      const attachments = messages.flatMap(
        (message) => getChatMessageDOM(message).attachments
      );

      for (const attachment of attachments) {
        expect(
          getChatAttachmentDOM(attachment).container.querySelector(
            'igc-chip.custom-attachment'
          )
        ).not.to.be.null;
      }
    });

    it('should render attachmentHeader template, attachmentContent template', async () => {
      chat.options = {
        renderers: {
          attachmentHeader: ({ attachment }) =>
            html`<h5>Custom ${attachment.name}</h5>`,
          attachmentContent: ({ attachment }) => html`
            <p>This is a template rendered as content of ${attachment.name}</p>
          `,
        },
      };
      await elementUpdated(chat);

      const { messages } = getChatDOM(chat);
      const attachments = messages.flatMap(
        (message) => getChatMessageDOM(message).attachments
      );

      for (const attachment of attachments) {
        const { header, content } = getChatAttachmentDOM(attachment);
        expect(header.querySelector('h5')?.innerText).matches(/^Custom/);
        expect(content.querySelector('p')?.innerText).matches(
          /^This is a template/
        );
      }
    });

    it('should render message template', async () => {
      chat.options = {
        renderers: {
          message: ({ message }) => html`
            <div>
              <h5>${message.sender === 'user' ? 'You' : 'Bot'}</h5>
              <p>${message.text}</p>
            </div>
          `,
        },
      };
      await elementUpdated(chat);

      for (const message of getChatDOM(chat).messages) {
        expect(
          getChatMessageDOM(message).container.querySelector('h5')?.innerText
        ).to.equal(message.message.sender === 'user' ? 'You' : 'Bot');
      }
    });

    it('should render messageContent template', async () => {
      chat.options = {
        renderers: {
          messageContent: ({ message }) => html`${message.text.toUpperCase()}`,
        },
      };
      await elementUpdated(chat);

      for (const [index, message] of getChatDOM(chat).messages.entries()) {
        expect(getChatMessageDOM(message).content.innerText).to.equal(
          chat.messages[index].text.toUpperCase()
        );
      }
    });

    it('should render messageActionsTemplate', async () => {
      chat.options = {
        renderers: {
          messageActions: ({ message }) =>
            message.sender !== 'user'
              ? html`<button>Custom action</button>`
              : nothing,
        },
      };
      await elementUpdated(chat);

      for (const message of getChatDOM(chat).messages) {
        expect(getChatMessageDOM(message).actions.innerText).to.equal(
          message.message.sender === 'user' ? '' : 'Custom action'
        );
      }
    });

    it('should render custom typingIndicator', async () => {
      chat.messages = [messages[0]];
      chat.options = {
        isTyping: true,
        renderers: {
          typingIndicator: () => html`<span>loading...</span>`,
        },
      };
      await elementUpdated(chat);

      expect(getChatDOM(chat).typingIndicator.innerText).to.equal('loading...');
    });

    it('should render text area templates', async () => {
      chat.draftMessage = draftMessage;
      chat.options = {
        renderers: {
          input: (ctx) => textInputTemplate(ctx.value),
          inputActions: () => textAreaActionsTemplate(),
          inputAttachments: (ctx) =>
            textAreaAttachmentsTemplate(ctx.attachments),
        },
      };
      await elementUpdated(chat);

      const { self: inputArea, sendButton, fileInput } = getChatDOM(chat).input;

      expect(inputArea.renderRoot.querySelector('igc-input')?.value).to.equal(
        draftMessage.text
      );
      expect(inputArea.renderRoot.querySelector('a')?.href).to.equal(
        draftMessage.attachments[0].url
      );

      expect(sendButton).to.be.null;
      expect(fileInput).to.be.null;
      var customActions =
        inputArea.renderRoot.querySelector('div.custom-actions');
      expect(customActions).not.to.be.null;
    });

    it('should render messageHeader template', async () => {
      chat.options = {
        renderers: {
          messageHeader: ({ message }) =>
            html`${message.sender !== 'user' ? 'AI Assistant' : ''}`,
        },
      };
      await elementUpdated(chat);

      for (const message of getChatDOM(chat).messages) {
        expect(getChatMessageDOM(message).header.innerText).to.equal(
          message.message.sender === 'user' ? '' : 'AI Assistant'
        );
      }
    });
  });

  describe('Interactions', () => {
    describe('Click', () => {
      it('should update messages properly on send button click', async () => {
        const spy = vi.spyOn(chat, 'emitEvent');
        const { textarea, sendButton } = getChatDOM(chat).input!;
        textarea.setAttribute('value', 'Hello!');
        textarea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);

        simulateClick(sendButton);
        await elementUpdated(chat);

        expect(spy).toHaveBeenCalledWith(
          'igcMessageCreated',
          expect.anything()
        );
        const eventArgs = spy.mock.calls[1]?.[1]?.detail as IgcChatMessage;
        const args = { ...eventArgs, text: 'Hello!', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Hello!');
        expect(chat.messages[0].sender).to.equal('user');
        // The focus should be on the input area after send button is clicked
        expect(isFocused(textarea)).to.be.true;
      });

      it('should update messages properly on suggestion chip click', async () => {
        const spy = vi.spyOn(chat, 'emitEvent');
        chat.options = {
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        };
        await elementUpdated(chat);

        const suggestionItems = getChatDOM(
          chat
        ).suggestionsContainer.querySelectorAll(IgcListItemComponent.tagName);

        expect(suggestionItems.length).to.equal(2);
        simulateClick(suggestionItems[0]);
        await elementUpdated(chat);

        expect(spy).toHaveBeenCalledWith(
          'igcMessageCreated',
          expect.anything()
        );
        const eventArgs = spy.mock.calls[0]?.[1]?.detail;
        const args =
          eventArgs && typeof eventArgs === 'object'
            ? { ...eventArgs, text: 'Suggestion 1', sender: 'user' }
            : { text: 'Suggestion 1', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Suggestion 1');
        expect(chat.messages[0].sender).to.equal('user');

        // The focus should be on the input area after suggestion click
        expect(isFocused(getChatDOM(chat).input.textarea)).to.be.true;
      });

      it('should remove attachment on chip remove button click', async () => {
        const spy = vi.spyOn(chat, 'emitEvent');
        const fileInput = getChatDOM(chat).input.fileInput;
        simulateFileUpload(fileInput, files);
        await elementUpdated(chat);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(
          'igcAttachmentAdded',
          expect.anything()
        );

        const attachments = getChatDOM(chat).input.chips;
        expect(attachments.length).to.equal(2);
        const removeFileButton = attachments[1]?.renderRoot.querySelector(
          'igc-icon'
        ) as HTMLElement;
        simulateClick(removeFileButton);
        await elementUpdated(chat);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(
          'igcAttachmentRemoved',
          expect.anything()
        );
        const detail = spy.mock.calls[1]?.[1]?.detail;
        expect((detail as IgcChatMessageAttachment).name).to.equal(
          files[1].name
        );
      });

      it('should disable send button on removing all attachments', async () => {
        const inputArea = getChatDOM(chat).input!;
        const { fileInput, sendButton } = inputArea;

        simulateFileUpload(fileInput, files);
        await elementUpdated(chat);

        const attachments = inputArea.chips;
        simulateClick(attachments[1].renderRoot.querySelector('igc-icon')!);
        simulateClick(attachments[0].renderRoot.querySelector('igc-icon')!);
        await elementUpdated(inputArea.self);

        expect(sendButton.disabled).to.be.true;
      });

      it('should update like button state on click', async () => {
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        const firstMessage = getChatDOM(chat).messages[0];
        // click on like (inactive) icon
        const likeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[1];
        simulateClick(likeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_active');
        // click on like (active) icon
        simulateClick(likeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_inactive');

        // click on like (inactive) icon
        simulateClick(likeIcon);
        await elementUpdated(chat);
        expect(likeIcon.name).to.equal('thumb_up_active');
      });

      it('should toggle like/dislike state on click', async () => {
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        const firstMessage = getChatDOM(chat).messages[0];
        // click on like (inactive) icon
        const likeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[1];
        simulateClick(likeIcon);
        await elementUpdated(chat);

        const dislikeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[2];
        expect(dislikeIcon.name).to.equal('thumb_down_inactive');
        // click on dislike (active) icon
        simulateClick(dislikeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_inactive');
        expect(dislikeIcon.name).to.equal('thumb_down_active');

        // click on like (inactive) icon
        simulateClick(likeIcon);
        await elementUpdated(chat);
        expect(likeIcon.name).to.equal('thumb_up_active');
      });

      it('should handle the copy action properly', async () => {
        const clipboardWriteText = vi
          .spyOn(navigator.clipboard, 'writeText')
          .mockResolvedValue();
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        expect(clipboardWriteText).not.toHaveBeenCalled();
        const firstMessage =
          chat.shadowRoot?.querySelectorAll('igc-chat-message')[0];
        // click on copy icon
        const copyIcon = firstMessage?.shadowRoot?.querySelector(
          'igc-icon-button[name="copy_content"]'
        ) as HTMLElement;
        simulateClick(copyIcon);
        await elementUpdated(chat);
        expect(clipboardWriteText).toHaveBeenCalled();
      });
    });

    describe('Drag & Drop', () => {
      beforeEach(async () => {
        const options = {
          acceptedFiles: '.txt',
        };
        chat = await fixture<IgcChatComponent>(
          html`<igc-chat .options=${options}> </igc-chat>`
        );
      });

      it('should be able to drag & drop files based on the types listed in `acceptedFiles`', async () => {
        const spy = vi.spyOn(chat, 'emitEvent');
        const inputArea = getChatDOM(chat).input.self!;
        const dropZone = inputArea?.renderRoot.querySelector(
          `div[part='input-container']`
        );

        expect(dropZone).not.to.be.null;
        if (dropZone) {
          const mockDataTransfer = new DataTransfer();
          files.forEach((file) => {
            mockDataTransfer.items.add(file);
          });

          const dragEnterEvent = new DragEvent('dragenter', {
            bubbles: true,
            cancelable: true,
          });

          Object.defineProperty(dragEnterEvent, 'dataTransfer', {
            value: mockDataTransfer,
          });

          dropZone?.dispatchEvent(dragEnterEvent);
          await elementUpdated(chat);

          expectCalledWith(spy, 'igcAttachmentDrag');

          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(dropEvent, 'dataTransfer', {
            value: mockDataTransfer,
          });

          dropZone.dispatchEvent(dropEvent);
          await elementUpdated(chat);

          expectCalledWith(spy, 'igcAttachmentDrop');
          const attachments = getChatDOM(chat).input.chips;
          expect(attachments?.length).to.equal(1);
          expect(attachments?.[0]?.textContent?.trim()).to.equal('test.txt');
          expect(spy).toHaveBeenCalledWith(
            'igcAttachmentAdded',
            expect.anything()
          );
        }
      });
    });

    describe('Keyboard', () => {
      it('should update messages properly on `Enter` keypress when the textarea is focused', async () => {
        const spy = vi.spyOn(chat, 'emitEvent');
        const textArea = getChatDOM(chat).input.textarea;

        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        simulateFocus(textArea);
        simulateKeyboard(textArea, enterKey);
        await elementUpdated(chat);

        expect(spy).toHaveBeenCalledWith(
          'igcMessageCreated',
          expect.anything()
        );
        const eventArgs = spy.mock.calls[2]?.[1]?.detail;
        const args =
          eventArgs && typeof eventArgs === 'object'
            ? { ...eventArgs, text: 'Hello!', sender: 'user' }
            : { text: 'Hello!', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Hello!');
        expect(chat.messages[0].sender).to.equal('user');

        // The focus should be on the input area after message is sent
        expect(isFocused(textArea)).to.be.true;
      });
    });
  });

  describe('Events', () => {
    it('emits igcAttachmentClick', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');
      chat.messages = [messages[1]];
      await elementUpdated(chat);

      const messageElement = getChatDOM(chat).messages[0];
      const attachment = getChatMessageDOM(messageElement).attachments[0];
      const attachmentHeader = getChatAttachmentDOM(attachment).header;

      simulateClick(attachmentHeader);
      expect(spy).toHaveBeenCalledWith('igcAttachmentClick', {
        detail: { ...messages[1].attachments?.at(0) },
      });
    });

    it('emits igcTypingChange', async () => {
      vi.useFakeTimers({ now: 0, toFake: ['Date', 'setTimeout'] });

      const spy = vi.spyOn(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;

      chat.options = { stopTypingDelay: 2500 };
      simulateKeyboard(textArea, 'a', 15);
      await elementUpdated(chat);

      expect(spy).toHaveBeenCalledWith('igcTypingChange', expect.anything());
      expect(last<any>(first(getEvents(spy, 'igcTypingChange'))).detail).to.be
        .true;

      vi.setSystemTime(2501);
      await vi.runAllTimersAsync();

      expect(spy).toHaveBeenCalledWith('igcTypingChange', expect.anything());
      expect(last<any>(last(getEvents(spy, 'igcTypingChange'))).detail).to.be
        .false;

      vi.useRealTimers();
    });

    it('emits igcTypingChange after sending a message', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;
      const internalInput = textArea.renderRoot.querySelector('textarea')!;

      chat.options = { stopTypingDelay: 2500 };

      // Simulate typing some text and the event sequence following after sending a message

      // Fires igcTypingChange
      simulateKeyboard(textArea, 'a', 15);
      await elementUpdated(textArea);

      // Fires igcInputChange
      simulateInput(internalInput, { value: 'a'.repeat(15) });
      await elementUpdated(textArea);

      // Fires igcMessageCreated -> igcTypingChange -> igcInputFocus since sending a message refocuses
      // the textarea
      simulateKeyboard(textArea, enterKey);
      await elementUpdated(chat);

      const expectedEventSequence = [
        'igcTypingChange',
        'igcInputChange',
        'igcMessageCreated',
        'igcTypingChange',
        'igcInputFocus',
      ];

      for (const [idx, event] of expectedEventSequence.entries()) {
        expect(spy.mock.calls[idx][0]).to.equal(event);
      }
    });

    it('should not emit igcTypingChange on Tab key', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;
      const internalInput = textArea.renderRoot.querySelector('textarea')!;

      chat.options = { stopTypingDelay: 2500 };

      simulateKeyboard(internalInput, tabKey);
      await elementUpdated(chat);

      expect(spy.mock.calls).to.be.empty;
    });

    it('emits igcInputFocus', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');

      simulateFocus(getChatDOM(chat).input.textarea);
      expectCalledWith(spy, 'igcInputFocus');
    });

    it('emits igcInputBlur', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');

      simulateBlur(getChatDOM(chat).input.textarea);
      expectCalledWith(spy, 'igcInputBlur');
    });

    it('emits igcInputChange', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea!;

      textArea.setAttribute('value', 'Hello!');
      textArea.dispatchEvent(new CustomEvent('igcInput', { detail: 'Hello!' }));
      await elementUpdated(chat);
      expect(spy).toHaveBeenCalledWith('igcInputChange', {
        detail: { value: 'Hello!' },
      });
    });

    it('emits igcMessageReact', async () => {
      const spy = vi.spyOn(chat, 'emitEvent');
      chat.messages = [messages[0]];
      await elementUpdated(chat);

      const messageElement = getChatDOM(chat).messages[0];
      const likeIcon =
        getChatMessageDOM(messageElement).defaultActionButtons[1];

      simulateClick(likeIcon);
      expect(spy).toHaveBeenCalledWith('igcMessageReact', {
        detail: { message: messages[0], reaction: 'thumb_up_active' },
      });
    });

    it('can cancel `igcMessageCreated` event', async () => {
      const inputArea = getChatDOM(chat).input;
      const { sendButton, textarea } = inputArea;

      chat.addEventListener('igcMessageCreated', (event) => {
        event.preventDefault();
      });

      textarea.setAttribute('value', 'Hello!');
      textarea.dispatchEvent(new CustomEvent('igcInput', { detail: 'Hello!' }));
      await elementUpdated(chat);
      simulateClick(sendButton);
      await elementUpdated(chat);

      expect(chat.messages.length).to.equal(0);
    });

    it('can cancel `igcAttachmentChange` event', async () => {
      const inputArea = getChatDOM(chat).input!;
      const fileInput = inputArea.fileInput;

      chat.addEventListener('igcAttachmentAdded', (event) => {
        event.preventDefault();
      });

      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(inputArea?.chips.length).to.equal(0);
    });
  });

  describe('adoptRootStyles behavior', () => {
    let chat: IgcChatComponent;

    const renderer = ({ message }: ChatMessageRenderContext) =>
      html`<div class="custom-background">${message.text}</div>`;

    async function createAdoptedStylesChat(options: IgcChatOptions) {
      chat = await fixture(html`
        <igc-chat
          .messages=${[{ id: 'id', sender: 'bot', text: 'Hello' }]}
          .options=${{ renderers: { messageContent: renderer }, ...options }}
        ></igc-chat>
      `);
    }

    function verifyCustomStyles(state: boolean) {
      const { messages } = getChatDOM(chat);
      const { backgroundColor } = getComputedStyle(
        getChatMessageDOM(first(messages)).content.querySelector(
          '.custom-background'
        )!
      );

      expect(backgroundColor === 'rgb(255, 0, 0)').to.equal(state);
    }

    beforeEach(async () => {
      const styles = document.createElement('style');
      styles.setAttribute('id', 'adopt-styles-test');
      styles.innerHTML = `
        .custom-background {
          background-color: rgb(255, 0, 0);
        }
      `;
      document.head.append(styles);
    });

    afterEach(() => {
      document.head.querySelector('#adopt-styles-test')?.remove();
    });

    it('correctly applies `adoptRootStyles` when set', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);
      verifyCustomStyles(true);
    });

    it('skips `adoptRootStyles` when not set', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: false });
      await elementUpdated(chat);
      verifyCustomStyles(false);
    });

    it('correctly reapplies `adoptRootStyles` when set and the theme is changed', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);
      verifyCustomStyles(true);

      // Change the theme
      configureTheme('material');

      await elementUpdated(chat);
      verifyCustomStyles(true);

      configureTheme('bootstrap');
      await elementUpdated(chat);
      verifyCustomStyles(true);
    });
  });
});

/** Returns an object containing the shadow DOM structure of a chat component. */
function getChatDOM(chat: IgcChatComponent) {
  const root = chat.renderRoot!;
  const inputArea = root.querySelector(IgcChatInputComponent.tagName)!;

  return {
    /** The igc-chat-input component */
    input: {
      /** The igc-chat-input component itself */
      get self() {
        return inputArea;
      },
      /** The default textarea input of the chat. */
      get textarea() {
        return inputArea.renderRoot.querySelector(
          IgcTextareaComponent.tagName
        )!;
      },
      /** The default file input of the chat. */
      get fileInput() {
        return inputArea.renderRoot.querySelector('input')!;
      },
      /** The default send button of the chat. */
      get sendButton() {
        return inputArea.renderRoot.querySelector<IgcIconButtonComponent>(
          '[name="send_message"]'
        )!;
      },
      /** The default igc-chip components representing attachments */
      get chips() {
        return Array.from(
          inputArea.renderRoot.querySelectorAll(IgcChipComponent.tagName)
        );
      },
    },
    /** The chat header container */
    get header() {
      return root.querySelector<HTMLElement>('[part="header"]')!;
    },
    /** The chat message container */
    get messageList() {
      return root.querySelector<HTMLElement>('[part="message-list"]')!;
    },
    /** Rendered chat messages */
    get messages() {
      return Array.from(root.querySelectorAll(IgcChatMessageComponent.tagName));
    },
    /** The typing indicator container of the chat */
    get typingIndicator() {
      return root.querySelector<HTMLElement>('[part="typing-indicator"]')!;
    },
    /** The chat container when no messages are present */
    get emptyState() {
      return root.querySelector<HTMLElement>('[part="empty-state"]')!;
    },
    /** The container of the chat suggestions */
    get suggestionsContainer() {
      return root.querySelector<HTMLElement>('[part="suggestions-container"]')!;
    },
  };
}

/** Returns an object containing the shadow DOM structure of a chat message component. */
function getChatMessageDOM(message: IgcChatMessageComponent) {
  const root = message.renderRoot;

  return {
    /** The encompassing container of the chat message component */
    get container() {
      return root.querySelector<HTMLElement>('[part~="message-container"]')!;
    },
    /** Header container of the chat message holding the `messageHeader` renderer output. */
    get header() {
      return root.querySelector<HTMLElement>('[part="message-header"]')!;
    },
    /** Content container of the chat message holding the `messageContent` renderer output. */
    get content() {
      return root.querySelector<HTMLElement>('[part="plain-text"]')!;
    },
    /** Chat message attachments container */
    get attachmentsContainer() {
      return root.querySelector<HTMLElement>('[part="message-attachments"]')!;
    },
    /** The attachments components of the message */
    get attachments() {
      return Array.from(
        root.querySelectorAll(IgcMessageAttachmentsComponent.tagName)
      );
    },
    /** Actions container of the chat message holding the `messageActions` renderer output. */
    get actions() {
      return root.querySelector<HTMLElement>('[part="message-actions"]')!;
    },
    /** The default reaction buttons of a chat message */
    get defaultActionButtons() {
      return Array.from(
        root.querySelectorAll<IgcIconButtonComponent>(
          '[part="message-actions"] igc-icon-button'
        )
      )!;
    },
  };
}

function getChatAttachmentDOM(attachment: IgcMessageAttachmentsComponent) {
  const root = attachment.renderRoot;

  return {
    get header() {
      return root.querySelector<HTMLElement>('[part="details"]')!;
    },
    get content() {
      return root.querySelector<HTMLElement>('[part~="attachment-content"]')!;
    },
    get container() {
      return root.querySelector<HTMLElement>('[part="attachments-container"]')!;
    },
  };
}
