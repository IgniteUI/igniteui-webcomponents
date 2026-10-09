import { elementUpdated, expect, fixture, nextFrame } from '@open-wc/testing';
import { html, nothing } from 'lit';
import { restore, spy, stub, useFakeTimers } from 'sinon';
import { enterKey, tabKey } from '#internals/controllers/key-bindings.js';
import { defineComponents } from '#internals/definitions/defineComponents.js';
import {
  isFocused,
  suppressResizeObserverLoopError,
} from '#internals/testing/helpers.spec.js';
import {
  simulateBlur,
  simulateClick,
  simulateFileUpload,
  simulateFocus,
  simulateInput,
  simulateKeyboard,
  simulatePointerEnter,
} from '#internals/testing/simulate.spec.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { configureTheme } from '#theming/config.js';
import type IgcIconButtonComponent from '../button/icon-button.js';
import IgcChipComponent from '../chip/chip.js';

import IgcInputComponent from '../input/input.js';
import IgcListItemComponent from '../list/list-item.js';
import IgcTextareaComponent from '../textarea/textarea.js';
import IgcToastComponent from '../toast/toast.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import IgcChatInputComponent from './chat-input.js';
import IgcChatMessageComponent from './chat-message.js';
import IgcChatComponent from './chat.js';
import IgcMessageAttachmentsComponent from './message-attachments.js';
import type {
  ChatMessageRenderContext,
  IgcChatMessage,
  IgcChatMessageAttachment,
  IgcChatOptions,
} from './types.js';

describe('Chat', () => {
  before(() => {
    defineComponents(IgcChatComponent, IgcInputComponent);
    suppressResizeObserverLoopError();
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
              href=${
                attachment.file
                  ? URL.createObjectURL(attachment.file)
                  : (attachment.url ?? '')
              }
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
        firstOf(renderedMessages),
        lastOf(renderedMessages),
      ];

      // Response messages have the default reactions.
      expect(getChatMessageDOM(firstMessage).defaultActionButtons).lengthOf(4);

      // Current user messages have no default reactions.
      expect(getChatMessageDOM(lastMessage).defaultActionButtons).to.be.empty;
    });

    it('should render messages from the current user correctly', async () => {
      chat.messages = [
        firstOf(messages),
        lastOf(messages),
        { id: '2', text: 'Hello!', sender: 'me' },
      ];
      chat.options = { currentUserId: 'me' };
      await elementUpdated(chat);

      const renderedMessages = getChatDOM(chat).messages;
      const currentUserMessage = lastOf(renderedMessages);

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

      // Text enables the send button.
      let value = 'Hello!';
      textarea.value = value;
      textarea.emitEvent('igcInput', { detail: value });
      await elementUpdated(chat);

      expect(sendButton.disabled).to.be.false;

      // No text disables the send button.
      value = '';
      textarea.value = value;
      textarea.emitEvent('igcInput', { detail: value });
      await elementUpdated(chat);

      expect(sendButton.disabled).to.be.true;

      // Attachments enable the send button without text.
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
      const indicator = document.createElement('span');
      indicator.slot = 'typing-indicator';
      indicator.innerText = 'loading...';
      chat.appendChild(indicator);

      chat.messages = [messages[0]];
      chat.options = { isTyping: true };
      await elementUpdated(chat);

      const typingIndicator = getChatDOM(chat).typingIndicator;
      const assignedElements = typingIndicator
        ?.querySelector('slot')
        ?.assignedElements();

      expect(firstOf(assignedElements!).textContent).to.equal('loading...');
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
        const eventSpy = spy(chat, 'emitEvent');
        const { textarea, sendButton } = getChatDOM(chat).input!;
        textarea.setAttribute('value', 'Hello!');
        textarea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);

        simulateClick(sendButton);
        await elementUpdated(chat);

        expect(eventSpy).calledWith('igcMessageCreated');
        const eventArgs = eventSpy.getCall(1).args[1]?.detail as IgcChatMessage;
        const args = { ...eventArgs, text: 'Hello!', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Hello!');
        expect(chat.messages[0].sender).to.equal('user');
        expect(isFocused(textarea)).to.be.true;
      });

      it('should update messages properly on suggestion chip click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
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

        expect(eventSpy).calledWith('igcMessageCreated');
        const eventArgs = eventSpy.getCall(0).args[1]?.detail;
        const args =
          eventArgs && typeof eventArgs === 'object'
            ? { ...eventArgs, text: 'Suggestion 1', sender: 'user' }
            : { text: 'Suggestion 1', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Suggestion 1');
        expect(chat.messages[0].sender).to.equal('user');

        expect(isFocused(getChatDOM(chat).input.textarea)).to.be.true;
      });

      it('should remove attachment on chip remove button click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const fileInput = getChatDOM(chat).input.fileInput;
        simulateFileUpload(fileInput, files);
        await elementUpdated(chat);

        expect(eventSpy).calledOnce;
        expect(eventSpy.calledWith('igcAttachmentAdded')).to.be.true;

        const attachments = getChatDOM(chat).input.chips;
        expect(attachments.length).to.equal(2);
        const removeFileButton = attachments[1]?.renderRoot.querySelector(
          'igc-icon'
        ) as HTMLElement;
        simulateClick(removeFileButton);
        await elementUpdated(chat);

        expect(eventSpy).calledTwice;
        expect(eventSpy.calledWith('igcAttachmentRemoved')).to.be.true;
        const detail = eventSpy.getCall(1).args[1]?.detail;
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
        const likeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[1];
        simulateClick(likeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_active');
        simulateClick(likeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_inactive');

        simulateClick(likeIcon);
        await elementUpdated(chat);
        expect(likeIcon.name).to.equal('thumb_up_active');
      });

      it('should toggle like/dislike state on click', async () => {
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        const firstMessage = getChatDOM(chat).messages[0];
        const likeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[1];
        simulateClick(likeIcon);
        await elementUpdated(chat);

        const dislikeIcon =
          getChatMessageDOM(firstMessage).defaultActionButtons[2];
        expect(dislikeIcon.name).to.equal('thumb_down_inactive');
        simulateClick(dislikeIcon);
        await elementUpdated(chat);

        expect(likeIcon.name).to.equal('thumb_up_inactive');
        expect(dislikeIcon.name).to.equal('thumb_down_active');

        simulateClick(likeIcon);
        await elementUpdated(chat);
        expect(likeIcon.name).to.equal('thumb_up_active');
      });

      it('should handle the copy action properly', async () => {
        const clipboardWriteText = stub(
          navigator.clipboard,
          'writeText'
        ).resolves();
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        expect(clipboardWriteText.called).to.be.false;
        const firstMessage =
          chat.shadowRoot?.querySelectorAll('igc-chat-message')[0];
        const copyIcon = firstMessage?.shadowRoot?.querySelector(
          'igc-icon-button[name="copy_content"]'
        ) as HTMLElement;
        simulateClick(copyIcon);
        await elementUpdated(chat);
        expect(clipboardWriteText.called).to.be.true;
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
        const eventSpy = spy(chat, 'emitEvent');
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

          expect(eventSpy).calledOnce;
          expect(eventSpy).calledWith('igcAttachmentDrag');

          const dropEvent = new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(dropEvent, 'dataTransfer', {
            value: mockDataTransfer,
          });

          dropZone.dispatchEvent(dropEvent);
          await elementUpdated(chat);

          expect(eventSpy).calledWith('igcAttachmentDrop');
          const attachments = getChatDOM(chat).input.chips;
          expect(attachments?.length).to.equal(1);
          expect(attachments?.[0]?.textContent?.trim()).to.equal('test.txt');
          expect(eventSpy).calledWith('igcAttachmentDrop');
          expect(eventSpy).calledWith('igcAttachmentAdded');
        }
      });
    });

    describe('Keyboard', () => {
      it('should update messages properly on `Enter` keypress when the textarea is focused', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const textArea = getChatDOM(chat).input.textarea;

        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        simulateFocus(textArea);
        simulateKeyboard(textArea, enterKey);
        await elementUpdated(chat);

        expect(eventSpy).calledWith('igcMessageCreated');
        const eventArgs = eventSpy.getCall(2).args[1]?.detail;
        const args =
          eventArgs && typeof eventArgs === 'object'
            ? { ...eventArgs, text: 'Hello!', sender: 'user' }
            : { text: 'Hello!', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Hello!');
        expect(chat.messages[0].sender).to.equal('user');

        expect(isFocused(textArea)).to.be.true;
      });
    });
  });

  describe('Events', () => {
    it('emits igcAttachmentClick', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[1]];
      await elementUpdated(chat);

      const messageElement = getChatDOM(chat).messages[0];
      const attachment = getChatMessageDOM(messageElement).attachments[0];
      const attachmentHeader = getChatAttachmentDOM(attachment).header;

      simulateClick(attachmentHeader);
      expect(eventSpy).calledWith('igcAttachmentClick', {
        detail: { ...messages[1].attachments?.at(0) },
      });
    });

    it('emits igcTypingChange', async () => {
      const clock = useFakeTimers({ now: 0, toFake: ['Date', 'setTimeout'] });

      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;

      chat.options = { stopTypingDelay: 2500 };
      simulateKeyboard(textArea, 'a', 15);
      await elementUpdated(chat);

      expect(eventSpy).calledWith('igcTypingChange');
      expect(eventSpy.firstCall.args[1]?.detail).to.be.true;

      clock.setSystemTime(2501);
      await clock.runAllAsync();

      expect(eventSpy).calledWith('igcTypingChange');
      expect(eventSpy.lastCall.args[1]?.detail).to.be.false;

      clock.restore();
    });

    it('defers the typing stop when `stopTypingDelay` grows mid-timer', async () => {
      const clock = useFakeTimers({ now: 0, toFake: ['Date', 'setTimeout'] });

      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;
      const typingCalls = () =>
        eventSpy
          .getCalls()
          .filter((call) => call.args[0] === 'igcTypingChange');

      try {
        chat.options = { stopTypingDelay: 2500 };
        simulateKeyboard(textArea, 'a', 15);
        await elementUpdated(chat);

        expect(typingCalls()).lengthOf(1);

        chat.options = { stopTypingDelay: 5000 };
        await elementUpdated(chat);

        // The original deadline passes - the stop is deferred, not dropped.
        await clock.tickAsync(2600);
        expect(typingCalls()).lengthOf(1);

        await clock.tickAsync(2500);
        expect(typingCalls()).lengthOf(2);
        expect(typingCalls().at(-1)?.args[1]?.detail).to.be.false;
      } finally {
        clock.restore();
      }
    });

    it('emits igcTypingChange after sending a message', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;
      const internalInput = textArea.renderRoot.querySelector('textarea')!;

      chat.options = { stopTypingDelay: 2500 };

      // Fires igcTypingChange
      simulateKeyboard(textArea, 'a', 15);
      await elementUpdated(textArea);

      // Fires igcInputChange
      simulateInput(internalInput, { value: 'a'.repeat(15) });
      await elementUpdated(textArea);

      // Fires igcMessageCreated -> igcTypingChange -> igcInputFocus.
      // A send refocuses the textarea.
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
        expect(eventSpy.getCall(idx).firstArg).to.equal(event);
      }
    });

    it('should not emit igcTypingChange on Tab key', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;
      const internalInput = textArea.renderRoot.querySelector('textarea')!;

      chat.options = { stopTypingDelay: 2500 };

      simulateKeyboard(internalInput, tabKey);
      await elementUpdated(chat);

      expect(eventSpy.getCalls()).is.empty;
    });

    it('emits igcInputFocus', async () => {
      const eventSpy = spy(chat, 'emitEvent');

      simulateFocus(getChatDOM(chat).input.textarea);
      expect(eventSpy).calledWith('igcInputFocus');
    });

    it('emits igcInputBlur', async () => {
      const eventSpy = spy(chat, 'emitEvent');

      simulateBlur(getChatDOM(chat).input.textarea);
      expect(eventSpy).calledWith('igcInputBlur');
    });

    it('emits igcInputChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea!;

      textArea.setAttribute('value', 'Hello!');
      textArea.dispatchEvent(new CustomEvent('igcInput', { detail: 'Hello!' }));
      await elementUpdated(chat);
      expect(eventSpy).calledWith('igcInputChange', {
        detail: 'Hello!',
      });
    });

    it('emits igcMessageReact', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[0]];
      await elementUpdated(chat);

      const messageElement = getChatDOM(chat).messages[0];
      const likeIcon =
        getChatMessageDOM(messageElement).defaultActionButtons[1];

      simulateClick(likeIcon);
      expect(eventSpy).calledWith('igcMessageReact', {
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

  describe('Additional behavior', () => {
    const createDragEvent = (
      type: string,
      init: DragEventInit = {},
      dataTransfer?: DataTransfer
    ) => {
      const event = new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        ...init,
      });
      if (dataTransfer) {
        Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
      }
      return event;
    };

    const getDropZone = () =>
      getChatDOM(chat).input.self.renderRoot.querySelector<HTMLElement>(
        '[part~="input-container"]'
      )!;

    beforeEach(() => {
      // An earlier copy test leaves its clipboard stub in place.
      restore();
    });

    afterEach(() => {
      restore();
    });

    const getActionButton = (message: IgcChatMessageComponent, name: string) =>
      message.renderRoot.querySelector<IgcIconButtonComponent>(
        `igc-icon-button[name="${name}"]`
      )!;

    it('sets a `draftMessage` without attachments', async () => {
      chat.draftMessage = { text: 'Only text' };
      await elementUpdated(chat);

      expect(chat.draftMessage).to.deep.equal({
        text: 'Only text',
        attachments: [],
      });
      expect(getChatDOM(chat).input.textarea.value).to.equal('Only text');
    });

    it('applies custom `resourceStrings`', async () => {
      chat.options = { suggestions: ['Suggestion 1'] };
      chat.resourceStrings = { chat_suggestions_header: 'Try these' };
      await elementUpdated(chat);

      expect(chat.resourceStrings.chat_suggestions_header).to.equal(
        'Try these'
      );
      const header = getChatDOM(chat).suggestionsContainer.querySelector(
        '[part="suggestions-header"] span'
      )!;
      expect(header.textContent?.trim()).to.equal('Try these');
    });

    it('renders a custom `suggestionPrefix` renderer', async () => {
      chat.options = {
        suggestions: ['Suggestion 1'],
        renderers: {
          suggestionPrefix: () => html`<span class="custom-prefix">*</span>`,
        },
      };
      await elementUpdated(chat);

      const container = getChatDOM(chat).suggestionsContainer;
      expect(container.querySelector('.custom-prefix')).to.exist;
      expect(container.querySelector('igc-icon[name="auto_suggest"]')).to.be
        .null;
    });

    it('renders the default suggestion prefix when `renderers` does not override it', async () => {
      chat.options = {
        suggestions: ['Suggestion 1'],
        renderers: { messageHeader: () => html`...` },
      };
      await elementUpdated(chat);

      expect(
        getChatDOM(chat).suggestionsContainer.querySelector(
          'igc-icon[name="auto_suggest"]'
        )
      ).to.exist;
    });

    it('`scrollToMessage` scrolls the message into view', async () => {
      chat.style.height = '300px';
      chat.options = { disableAutoScroll: true };
      chat.messages = Array.from({ length: 30 }, (_, i) => ({
        id: `${i}`,
        text: `Message ${i}`,
        sender: 'bot',
      }));
      await elementUpdated(chat);
      await nextFrame();

      const list = chat.renderRoot.querySelector<HTMLElement>(
        '[part="message-area-container"]'
      )!;
      list.scrollTop = 0;
      await nextFrame();
      expect(list.scrollTop).to.equal(0);

      chat.scrollToMessage('29');
      await nextFrame();

      expect(list.scrollTop).to.be.greaterThan(0);
    });

    it('`scrollToMessage` does nothing without messages', () => {
      expect(() => chat.scrollToMessage('1')).not.to.throw();
      expect(getChatDOM(chat).messageList).to.be.null;
    });

    it('does not send a message on `Enter` when the input is empty', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const textArea = getChatDOM(chat).input.textarea;

      simulateKeyboard(textArea, enterKey);
      await elementUpdated(chat);

      expect(eventSpy).not.calledWith('igcMessageCreated');
      expect(chat.messages).to.be.empty;
    });

    it('opens the file picker on attach button click', async () => {
      const { self, fileInput } = getChatDOM(chat).input;
      const showPicker = stub(fileInput, 'showPicker');
      const attachButton = self.renderRoot.querySelector<HTMLElement>(
        'igc-icon-button[name="attach_file"]'
      )!;

      simulateClick(attachButton);
      expect(showPicker).calledOnce;
    });

    it('skips files already attached by name', async () => {
      const fileInput = getChatDOM(chat).input.fileInput;

      simulateFileUpload(fileInput, [files[0]]);
      await elementUpdated(chat);
      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(chat.draftMessage.attachments?.map(({ name }) => name)).to.eql([
        'test.txt',
        'image.png',
      ]);
      expect(getChatDOM(chat).input.chips).lengthOf(2);
    });

    it('accepts any dropped file when `acceptedFiles` is not set', async () => {
      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }

      getDropZone().dispatchEvent(createDragEvent('drop', {}, dataTransfer));
      await elementUpdated(chat);

      expect(getChatDOM(chat).input.chips).lengthOf(2);
    });

    it('does not mark the drop zone as dragging without data transfer', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const dropZone = getDropZone();

      dropZone.dispatchEvent(createDragEvent('dragenter'));
      await elementUpdated(getChatDOM(chat).input.self);

      expect(eventSpy).calledWith('igcAttachmentDrag');
      expect(dropZone.part.contains('dragging')).to.be.false;
    });

    it('keeps the dragging state until the pointer leaves the drop zone', async () => {
      const input = getChatDOM(chat).input.self;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);

      getDropZone().dispatchEvent(
        createDragEvent('dragenter', {}, dataTransfer)
      );
      await elementUpdated(input);
      expect(getDropZone().part.contains('dragging')).to.be.true;

      const dragOver = createDragEvent('dragover');
      getDropZone().dispatchEvent(dragOver);
      expect(dragOver.defaultPrevented).to.be.true;

      const { left, top, width, height } =
        getDropZone().getBoundingClientRect();

      getDropZone().dispatchEvent(
        createDragEvent('dragleave', {
          clientX: left + width / 2,
          clientY: top + height / 2,
        })
      );
      await elementUpdated(input);
      expect(getDropZone().part.contains('dragging')).to.be.true;

      getDropZone().dispatchEvent(
        createDragEvent('dragleave', {
          clientX: left + width + 50,
          clientY: top + height + 50,
        })
      );
      await elementUpdated(input);
      expect(getDropZone().part.contains('dragging')).to.be.false;
    });

    it('stops typing after the default `stopTypingDelay`', async () => {
      const clock = useFakeTimers({
        now: 0,
        toFake: ['Date', 'setTimeout', 'clearTimeout'],
      });
      const eventSpy = spy(chat, 'emitEvent');
      const typingCalls = () =>
        eventSpy
          .getCalls()
          .filter((call) => call.args[0] === 'igcTypingChange');

      try {
        simulateKeyboard(getChatDOM(chat).input.textarea, 'a');
        await elementUpdated(chat);
        expect(typingCalls()).lengthOf(1);

        await clock.tickAsync(2900);
        expect(typingCalls()).lengthOf(1);

        await clock.tickAsync(200);
        expect(typingCalls()).lengthOf(2);
        expect(typingCalls()[1].args[1]?.detail).to.be.false;
      } finally {
        clock.restore();
      }
    });

    it('shows the actions tooltip on action button hover and focus', async () => {
      chat.messages = [{ ...messages[0], reactions: [] }];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      const { chat_reaction_copy, chat_reaction_like } = chat.resourceStrings;

      simulatePointerEnter(getActionButton(message, 'copy_content'));
      await elementUpdated(chat);

      const tooltips = chat.renderRoot.querySelectorAll(
        IgcTooltipComponent.tagName
      );
      expect(tooltips).lengthOf(1);
      expect(tooltips[0].message).to.equal(chat_reaction_copy);
      expect(tooltips[0].open).to.be.true;

      simulateFocus(getActionButton(message, 'thumb_up_inactive'));
      await elementUpdated(chat);

      expect(
        chat.renderRoot.querySelectorAll(IgcTooltipComponent.tagName)
      ).lengthOf(1);
      expect(tooltips[0].message).to.equal(chat_reaction_like);
    });

    it('toggles an active dislike back to inactive', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [{ ...messages[0], reactions: [] }];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      simulateClick(getActionButton(message, 'thumb_down_inactive'));
      await elementUpdated(message);
      simulateClick(getActionButton(message, 'thumb_down_active'));
      await elementUpdated(message);

      expect(eventSpy.lastCall).calledWith('igcMessageReact', {
        detail: {
          message: chat.messages[0],
          reaction: 'thumb_down_inactive',
        },
      });
      expect(getActionButton(message, 'thumb_down_inactive')).to.exist;
    });

    it('emits a `regenerate` reaction', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [{ ...messages[0], reactions: [] }];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      simulateClick(getActionButton(message, 'regenerate'));

      expect(eventSpy).calledWith('igcMessageReact', {
        detail: { message: chat.messages[0], reaction: 'regenerate' },
      });
      expect(chat.messages[0].reactions).to.eql(['regenerate']);
    });

    it('emits an empty reaction for an unknown action button', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.options = {
        renderers: {
          messageActions: () =>
            html`<igc-icon-button name="share"></igc-icon-button>`,
        },
      };
      chat.messages = [{ ...messages[0], reactions: ['thumb_up_active'] }];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      simulateClick(getActionButton(message, 'share'));

      expect(eventSpy).calledWith('igcMessageReact', {
        detail: { message: chat.messages[0], reaction: '' },
      });
      expect(chat.messages[0].reactions).to.be.empty;
    });

    it('ignores clicks in the actions area outside of a button', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[0]];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      simulateClick(getChatMessageDOM(message).actions);

      expect(eventSpy).not.calledWith('igcMessageReact');
    });

    it('copies the message text with its attachments', async () => {
      const clipboardWriteText = stub(
        navigator.clipboard,
        'writeText'
      ).resolves();
      const {
        chat_attachment_label,
        chat_attachments_list_label,
        chat_message_copied,
      } = chat.resourceStrings;

      try {
        chat.messages = [
          {
            id: 'copy',
            text: 'See files',
            sender: 'bot',
            attachments: [
              { id: 'a', name: 'a.txt', url: 'http://some-link-to/a.txt' },
              { id: 'b', name: 'b.txt' },
              { id: 'c' } as IgcChatMessageAttachment,
            ],
          },
        ];
        await elementUpdated(chat);

        simulateClick(
          getActionButton(getChatDOM(chat).messages[0], 'copy_content')
        );
        await nextFrame();

        expect(clipboardWriteText).calledOnceWith(
          `See files\n\n${chat_attachments_list_label}:\na.txt: http://some-link-to/a.txt\nb.txt: \n${chat_attachment_label}: `
        );

        const toast = chat.renderRoot.querySelector(IgcToastComponent.tagName)!;
        expect(toast.textContent).to.equal(chat_message_copied);
        expect(toast.open).to.be.true;
      } finally {
        clipboardWriteText.restore();
      }
    });

    it('copies only the attachments of a message without text', async () => {
      const clipboardWriteText = stub(
        navigator.clipboard,
        'writeText'
      ).resolves();
      const { chat_attachments_list_label } = chat.resourceStrings;

      try {
        chat.messages = [
          {
            id: 'copy',
            text: '',
            sender: 'bot',
            attachments: [
              { id: 'a', name: 'a.txt', url: 'http://some-link-to/a.txt' },
            ],
          },
        ];
        await elementUpdated(chat);

        simulateClick(
          getActionButton(getChatDOM(chat).messages[0], 'copy_content')
        );
        await nextFrame();

        expect(clipboardWriteText).calledOnceWith(
          `${chat_attachments_list_label}:\na.txt: http://some-link-to/a.txt`
        );
      } finally {
        clipboardWriteText.restore();
      }
    });

    it('shows no toast and leaves no rejection when copying fails', async () => {
      const clipboardWriteText = stub(navigator.clipboard, 'writeText').rejects(
        new Error('denied')
      );
      const reasons: unknown[] = [];
      const onRejection = (event: PromiseRejectionEvent) => {
        event.preventDefault();
        reasons.push(event.reason);
      };
      window.addEventListener('unhandledrejection', onRejection);

      try {
        chat.messages = [messages[0]];
        await elementUpdated(chat);

        simulateClick(
          getActionButton(getChatDOM(chat).messages[0], 'copy_content')
        );
        await nextFrame();
        await nextFrame();

        expect(clipboardWriteText).calledOnce;
        expect(reasons).to.be.empty;
        expect(chat.renderRoot.querySelector(IgcToastComponent.tagName)).to.be
          .null;
      } finally {
        window.removeEventListener('unhandledrejection', onRejection);
        clipboardWriteText.restore();
      }
    });

    it('renders an image attachment from its file', async () => {
      const file = new File(['image data'], 'photo.png', { type: 'image/png' });
      chat.messages = [
        {
          id: 'file',
          text: 'Photo',
          sender: 'bot',
          attachments: [{ id: 'photo', name: 'photo.png', file }],
        },
      ];
      await elementUpdated(chat);

      const attachment = getChatMessageDOM(getChatDOM(chat).messages[0])
        .attachments[0];
      await elementUpdated(attachment);

      const image = attachment.renderRoot.querySelector('img')!;
      expect(image.src).to.match(/^blob:/);
    });

    it('renders an image attachment without a source', async () => {
      chat.messages = [
        {
          id: 'no-url',
          text: 'Photo',
          sender: 'bot',
          attachments: [{ id: 'photo', name: 'photo.png', type: 'image' }],
        },
      ];
      await elementUpdated(chat);

      const attachment = getChatMessageDOM(getChatDOM(chat).messages[0])
        .attachments[0];
      await elementUpdated(attachment);

      expect(
        attachment.renderRoot.querySelector('img')!.getAttribute('src')
      ).to.equal('');
    });

    it('renders the generic file icon for a name without an extension', async () => {
      chat.messages = [
        {
          id: 'readme',
          text: 'Readme',
          sender: 'bot',
          attachments: [{ id: 'readme', name: 'README', type: 'file' }],
        },
      ];
      await elementUpdated(chat);

      const attachment = getChatMessageDOM(getChatDOM(chat).messages[0])
        .attachments[0];
      await elementUpdated(attachment);

      const icon = attachment.renderRoot.querySelector(
        '[part="file-attachment-icon"]'
      )!;
      expect(icon.getAttribute('name')).to.equal('file_generic');
    });

    it('renders the generic file icon for an attachment without a name', async () => {
      chat.messages = [
        {
          id: 'nameless',
          text: 'File',
          sender: 'bot',
          attachments: [
            { id: 'nameless', type: 'file' } as IgcChatMessageAttachment,
          ],
        },
      ];
      await elementUpdated(chat);

      const attachment = getChatMessageDOM(getChatDOM(chat).messages[0])
        .attachments[0];
      await elementUpdated(attachment);

      const icon = attachment.renderRoot.querySelector(
        '[part="file-attachment-icon"]'
      )!;
      expect(icon.getAttribute('name')).to.equal('file_generic');
    });

    it('renders no message container without a message', async () => {
      chat.messages = [messages[0]];
      await elementUpdated(chat);

      const message = getChatDOM(chat).messages[0];
      expect(getChatMessageDOM(message).container).to.exist;

      message.message = undefined as unknown as IgcChatMessage;
      await elementUpdated(message);

      expect(getChatMessageDOM(message).container).to.be.null;
    });

    it('renders no attachments without a message', async () => {
      chat.messages = [messages[1]];
      await elementUpdated(chat);

      const attachment = getChatMessageDOM(getChatDOM(chat).messages[0])
        .attachments[0];
      await elementUpdated(attachment);
      expect(getChatAttachmentDOM(attachment).container).to.exist;

      attachment.message = undefined;
      await elementUpdated(attachment);

      expect(getChatAttachmentDOM(attachment).container).to.be.null;
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

    function getCustomStyles() {
      const { messages } = getChatDOM(chat);

      return getComputedStyle(
        getChatMessageDOM(firstOf(messages)).content.querySelector(
          '.custom-background'
        )!
      );
    }

    function getMessageStyleSheets() {
      const { messages } = getChatDOM(chat);
      return firstOf(messages).shadowRoot!.adoptedStyleSheets;
    }

    function verifyCustomStyles(state: boolean) {
      expect(getCustomStyles().backgroundColor === 'rgb(255, 0, 0)').to.equal(
        state
      );
    }

    const lateStyles = `
      .custom-background {
        color: rgb(0, 0, 255);
      }
    `;

    /** Mimics a custom renderer injecting global styles at a later point. */
    function appendLateStyles(cssText = lateStyles) {
      const styles = document.createElement('style');
      styles.setAttribute('id', 'adopt-styles-test-late');
      styles.innerHTML = cssText;
      document.head.append(styles);

      return styles;
    }

    beforeEach(async () => {
      const styles = document.createElement('style');
      styles.setAttribute('id', 'adopt-styles-test');
      styles.innerHTML = `
        .custom-background {
          background-color: rgb(255, 255, 0);
        }

        /* override */
        .custom-background {
          background-color: rgb(255, 0, 0);
        }
      `;
      document.head.append(styles);
    });

    afterEach(() => {
      document.head.querySelector('#adopt-styles-test')?.remove();
      document.head.querySelector('#adopt-styles-test-late')?.remove();
      document.head.querySelector('#adopt-styles-test-meta')?.remove();
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

      configureTheme('material');

      await elementUpdated(chat);
      verifyCustomStyles(true);

      configureTheme('bootstrap');
      await elementUpdated(chat);
      verifyCustomStyles(true);
    });

    it('correctly adopts styles when toggling from false to true', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: false });
      await elementUpdated(chat);
      verifyCustomStyles(false);

      chat.options = { ...chat.options, adoptRootStyles: true };
      await elementUpdated(chat);
      verifyCustomStyles(true);
    });

    it('correctly removes adopted styles when toggling from true to false', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);
      verifyCustomStyles(true);

      chat.options = { ...chat.options, adoptRootStyles: false };
      await elementUpdated(chat);
      verifyCustomStyles(false);
    });

    it('correctly handles multiple toggles of adoptRootStyles', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: false });
      await elementUpdated(chat);
      verifyCustomStyles(false);

      chat.options = { ...chat.options, adoptRootStyles: true };
      await elementUpdated(chat);
      verifyCustomStyles(true);

      chat.options = { ...chat.options, adoptRootStyles: false };
      await elementUpdated(chat);
      verifyCustomStyles(false);

      chat.options = { ...chat.options, adoptRootStyles: true };
      await elementUpdated(chat);
      verifyCustomStyles(true);
    });

    it('adopts stylesheets added to the document after the initial adoption', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);

      verifyCustomStyles(true);
      expect(getCustomStyles().color).to.not.equal('rgb(0, 0, 255)');

      appendLateStyles();
      await nextFrame();

      expect(getCustomStyles().color).to.equal('rgb(0, 0, 255)');
    });

    it('adopts a stylesheet which is appended empty and populated afterwards', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);

      const styles = appendLateStyles('');
      await nextFrame();

      expect(getCustomStyles().color).to.not.equal('rgb(0, 0, 255)');

      styles.textContent = lateStyles;
      await nextFrame();

      expect(getCustomStyles().color).to.equal('rgb(0, 0, 255)');
    });

    it('adopts a stylesheet populated through the CSSOM on the next synchronization', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);

      const styles = appendLateStyles('');
      await nextFrame();

      // Inserting a rule through the CSSOM mutates no DOM and keeps the same
      // stylesheet object, so it is only observable through a later change.
      styles.sheet!.insertRule('.custom-background { color: rgb(0, 0, 255); }');
      await nextFrame();

      document.head.append(
        Object.assign(document.createElement('meta'), {
          id: 'adopt-styles-test-meta',
        })
      );
      await nextFrame();

      expect(getCustomStyles().color).to.equal('rgb(0, 0, 255)');
    });

    it('removes adopted styles when their stylesheet is removed from the document', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);
      verifyCustomStyles(true);

      document.head.querySelector('#adopt-styles-test')!.remove();
      await nextFrame();

      verifyCustomStyles(false);
    });

    it('does not drop the component styles when adopting document styles', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: false });
      await elementUpdated(chat);

      const componentStyles = Array.from(getMessageStyleSheets());

      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);

      const adopted = getMessageStyleSheets();

      for (const sheet of componentStyles) {
        expect(adopted.includes(sheet), 'component stylesheet was dropped').to
          .be.true;
      }
      verifyCustomStyles(true);
    });

    it('re-adopts document styles when the host is reconnected', async () => {
      await createAdoptedStylesChat({ adoptRootStyles: true });
      await elementUpdated(chat);
      verifyCustomStyles(true);

      const parent = chat.parentElement!;

      chat.remove();
      await nextFrame();

      parent.append(chat);
      await elementUpdated(chat);

      verifyCustomStyles(true);
    });
  });
});

function getChatDOM(chat: IgcChatComponent) {
  const root = chat.renderRoot!;
  const inputArea = root.querySelector(IgcChatInputComponent.tagName)!;

  return {
    input: {
      get self() {
        return inputArea;
      },
      get textarea() {
        return inputArea.renderRoot.querySelector(
          IgcTextareaComponent.tagName
        )!;
      },
      get fileInput() {
        return inputArea.renderRoot.querySelector('input')!;
      },
      get sendButton() {
        return inputArea.renderRoot.querySelector<IgcIconButtonComponent>(
          '[name="send_message"]'
        )!;
      },
      get chips() {
        return Array.from(
          inputArea.renderRoot.querySelectorAll(IgcChipComponent.tagName)
        );
      },
    },
    get header() {
      return root.querySelector<HTMLElement>('[part="header"]')!;
    },
    get messageList() {
      return root.querySelector<HTMLElement>('[part="message-list"]')!;
    },
    get messages() {
      return Array.from(root.querySelectorAll(IgcChatMessageComponent.tagName));
    },
    get typingIndicator() {
      return root.querySelector<HTMLElement>('[part="typing-indicator"]')!;
    },
    get emptyState() {
      return root.querySelector<HTMLElement>('[part="empty-state"]')!;
    },
    get suggestionsContainer() {
      return root.querySelector<HTMLElement>('[part="suggestions-container"]')!;
    },
  };
}

function getChatMessageDOM(message: IgcChatMessageComponent) {
  const root = message.renderRoot;

  return {
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
    get attachmentsContainer() {
      return root.querySelector<HTMLElement>('[part="message-attachments"]')!;
    },
    get attachments() {
      return Array.from(
        root.querySelectorAll(IgcMessageAttachmentsComponent.tagName)
      );
    },
    /** Actions container of the chat message holding the `messageActions` renderer output. */
    get actions() {
      return root.querySelector<HTMLElement>('[part="message-actions"]')!;
    },
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
