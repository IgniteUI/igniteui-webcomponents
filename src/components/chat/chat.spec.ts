import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  nextFrame,
} from '@open-wc/testing';
import { html, nothing } from 'lit';
import { type SinonFakeTimers, spy, stub, useFakeTimers } from 'sinon';
import type IgcIconButtonComponent from '../button/icon-button.js';
import {
  arrowDown,
  arrowUp,
  endKey,
  enterKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
  isFocused,
  simulateBlur,
  simulateClick,
  simulateFocus,
  simulateKeyboard,
} from '../common/utils.spec.js';
import { simulateFileUpload } from '../file-input/file-input.spec.js';
import IgcInputComponent from '../input/input.js';
import IgcChatComponent from './chat.js';
import type { IgcMessage, IgcMessageAttachment } from './types.js';

describe('Chat', () => {
  before(() => {
    defineComponents(IgcChatComponent, IgcInputComponent);
  });

  const DIFF_OPTIONS = {
    ignoreAttributes: ['exportparts'],
  };

  const createChatComponent = () => html`<igc-chat></igc-chat>`;

  const messageHeaderTemplate = (msg: any) => {
    return msg.sender !== 'user' ? html`<span>AI Assistant</span>` : html``;
  };

  const messageTemplate = (msg: any) => {
    return html`
      <div>
        <h5>${msg.sender === 'user' ? 'You' : 'Bot'}:</h5>
        <p>${msg.text}</p>
      </div>
    `;
  };

  const messageActionsTemplate = (msg: IgcMessage) => {
    return msg.sender !== 'user' && msg.text.trim()
      ? html`
          <div style="float: right">
            <igc-button name="regenerate" variant="flat">...</igc-button>
          </div>
        `
      : nothing;
  };

  const typingIndicatorTemplate = html`<span>loading...</span>`;

  const attachmentTemplate = (attachment: any) => {
    return html`<igc-chip><span>${attachment.name}</span></igc-chip>`;
  };

  const attachmentHeaderTemplate = (attachment: any) => {
    return html`<h5>Custom ${attachment.name}</h5>`;
  };

  const attachmentContentTemplate = (attachment: any) => {
    return html`
      <p>This is a template rendered as content of ${attachment.name}</p>
    `;
  };

  const textInputTemplate = (text: string) => html`
    <igc-input placeholder="Type text here..." .value=${text}></igc-input>
  `;

  const textAreaActionsTemplate = () => html`
    <div>
      <igc-button>Upload</igc-button>
      <igc-button>Send</igc-button>
    </div>
  `;

  const textAreaAttachmentsTemplate = (attachments: IgcMessageAttachment[]) => {
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

  const messages: IgcMessage[] = [
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

  const messageActions = (likeButtonState = 'inactive') => `<div>
                          <igc-icon-button
                            id="copy_content-button"
                            name="copy_content"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            id="thumb_up_${likeButtonState}-button"
                            name="thumb_up_${likeButtonState}"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            id="thumb_down_inactive-button"
                            name="thumb_down_inactive"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            id="regenerate-button"
                            name="regenerate"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                        </div>`;

  let chat: IgcChatComponent;
  let clock: SinonFakeTimers;

  beforeEach(async () => {
    chat = await fixture<IgcChatComponent>(createChatComponent());
    clock = useFakeTimers({ toFake: ['setInterval'] });
  });

  afterEach(() => {
    clock.restore();
  });

  describe('Initialization', () => {
    it('is correctly initialized with its default component state', () => {
      expect(chat.messages.length).to.equal(0);
      expect(chat.options).to.be.undefined;
      expect(chat.draftMessage).to.deep.equal({ text: '', attachments: [] });
    });

    it('empty chat is rendered correctly', () => {
      expect(chat).dom.to.equal(
        `<igc-chat>
        </igc-chat>`
      );

      expect(chat).shadowDom.to.equal(
        ` <div part="chat-container">
                    <div hidden="" part="header">
                      <slot hidden="" name="prefix" part="prefix"></slot>
                      <slot name="title" part="title"></slot>
                      <slot part="actions" name="actions"></slot>
                    </div>
                    <div part="chat-wrapper">
                      <div part="empty-state">
                        <slot name="empty-state">
                        </slot>
                      </div>
                    </div>
                    <igc-chat-input>
                    </igc-chat-input>
                </div>`,
        DIFF_OPTIONS
      );

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');

      expect(inputArea).shadowDom.to.equal(
        `<div part="input-container">
                    <div part="input-wrapper">
                        <igc-textarea
                        aria-label="Chat text input"
                        part="text-input"
                        resize="auto"
                        rows="1"
                        >
                        </igc-textarea>
                    </div>
                    <div part="buttons-container">
                        <label for="input_attachments" part="upload-button">
                          <igc-icon-button
                            variant="flat"
                            aria-label="Attach files"
                            name="attach_file"
                            type="button"
                            ></igc-icon-button>
                          <input
                            type="file"
                            aria-label="Upload button"
                            id="input_attachments"
                            name="input_attachments"
                            multiple=""
                          ></input>
                        </label>
                        <igc-icon-button
                          aria-label="Send message"
                          part="send-button"
                          disabled=""
                          name="send_message"
                          type="button"
                          variant="contained"
                        >
                        </igc-icon-button>
                        </div>
                    </div>`
      );
    });

    it('should render initially set messages correctly', async () => {
      chat = await fixture<IgcChatComponent>(
        html`<igc-chat .messages=${messages}> </igc-chat>`
      );

      await aTimeout(500);
      const messageContainer = chat.shadowRoot?.querySelector(
        `div[part='message-list']`
      );

      expect(messageContainer).dom.to.equal(
        `<div part="message-list" tabindex="0">
                   <igc-chat-message id="message-1" part="message-item">
                    </igc-chat-message>
                    <igc-chat-message id="message-2" part="message-item">
                    </igc-chat-message>
                    <igc-chat-message id="message-3" part="message-item">
                    </igc-chat-message>
                    <igc-chat-message id="message-4" part="message-item">
                    </igc-chat-message>
                  </div>`,
        DIFF_OPTIONS
      );

      expect(chat.messages.length).to.equal(4);

      const firstMessage =
        messageContainer?.querySelectorAll('igc-chat-message')[0];
      expect(firstMessage).shadowDom.to.equal(
        `<div part="message-container">
            <pre part="plain-text">
              Hello! How can I help you today?
            </pre>
            ${firstMessage?.message?.sender !== 'user' ? messageActions() : ''}
        </div>`
      );

      expect(
        messageContainer?.querySelectorAll('igc-chat-message')[3]
      ).shadowDom.to.equal(
        `<div part="message-container sent">
          <pre part="plain-text">
            Thank you too!
          </pre>
        </div>`
      );
    });

    xit('should sanitize message content', async () => {
      const rawMessages = [
        {
          id: '1',
          text: '<script>alert("XSS")</script> Hello!',
          sender: 'bot',
        },
      ];
      chat = await fixture<IgcChatComponent>(
        html`<igc-chat .messages=${rawMessages}> </igc-chat>`
      );
      await aTimeout(500);

      const messageContainer = chat.shadowRoot?.querySelector(
        `div[part='message-list']`
      );

      expect(chat.messages.length).to.equal(1);

      const firstMessage =
        messageContainer?.querySelectorAll('igc-chat-message')[0];
      expect(firstMessage).shadowDom.to.equal(
        `<div part="message-container ">
          <pre part="plain-text">
            Hello!
          </pre>
          ${firstMessage?.message?.sender !== 'user' ? messageActions() : ''}
        </div>`
      );
    });

    it('should render messages from the current user correctly', async () => {
      const initialMessages = [
        messages[0],
        messages[3],
        {
          id: '2',
          text: 'Hello!',
          sender: 'me',
          timestamp: new Date(Date.now() - 3200000),
        },
      ];

      const options = {
        currentUserId: 'me',
      };

      chat = await fixture<IgcChatComponent>(
        html`<igc-chat .messages=${initialMessages} .options=${options}>
        </igc-chat>`
      );

      const messageContainer = chat.shadowRoot?.querySelector(
        `div[part='message-list']`
      );
      expect(messageContainer).not.to.be.null;

      messageContainer
        ?.querySelectorAll('igc-chat-message')
        ?.forEach((messageElement, index) => {
          if (index !== 2) {
            expect(
              messageElement.shadowRoot?.querySelector(
                `div[part='message-container']`
              )
            ).not.to.be.null;
          } else {
            expect(
              messageElement.shadowRoot?.querySelector(
                `div[part='message-container sent']`
              )
            ).not.to.be.null;
          }
        });
    });

    it('should render the message in `draftMessage` correctly', async () => {
      chat = await fixture<IgcChatComponent>(
        html`<igc-chat .draftMessage=${draftMessage}></igc-chat>`
      );

      const textArea = chat.shadowRoot
        ?.querySelector('igc-chat-input')
        ?.shadowRoot?.querySelector('igc-textarea');
      const attachments = chat.shadowRoot
        ?.querySelector('igc-chat-input')
        ?.shadowRoot?.querySelectorAll('igc-chip');

      expect(textArea?.value).to.equal(draftMessage.text);
      expect(attachments?.length).to.equal(draftMessage.attachments.length);
    });

    it('should apply `headerText` correctly', async () => {
      chat.options = {
        headerText: 'Chat',
      };
      await elementUpdated(chat);

      const headerArea = chat.shadowRoot?.querySelector(`div[part='header']`);

      expect(headerArea).dom.to.equal(
        `<div part="header">
                      <slot hidden="" name="prefix" part="prefix">
                      </slot>
                      <slot name="title" part="title">
                          Chat
                      </slot>
                    <slot part="actions" name="actions">
                    </slot>
                </div>`
      );
    });

    it('should apply `inputPlaceholder` correctly', async () => {
      chat.options = {
        inputPlaceholder: 'Type message here...',
      };
      await elementUpdated(chat);

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      expect(textArea?.placeholder).to.equal('Type message here...');
    });

    it('should enable/disable the send button properly', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const sendButton = inputArea?.shadowRoot?.querySelector(
        'igc-icon-button[name="send_message"]'
      ) as HTMLButtonElement;

      expect(sendButton?.disabled).to.be.true;
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      // When there is a text in the text area, the send button should be enabled
      let value = 'Hello!';
      textArea?.setAttribute('value', value);
      textArea?.dispatchEvent(new CustomEvent('igcInput', { detail: value }));
      await elementUpdated(chat);

      expect(sendButton?.disabled).to.be.false;

      // When there is no text in the text area, the send button should be disabled
      value = '';
      textArea?.setAttribute('value', value);
      textArea?.dispatchEvent(new CustomEvent('igcInput', { detail: value }));
      await elementUpdated(chat);

      expect(sendButton?.disabled).to.be.true;

      // When there are attachments, the send button should be enabled regardless of the text area content
      const fileInput = inputArea?.shadowRoot?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(sendButton?.disabled).to.be.false;
    });

    it('should not render attachment button if `disableInputAttachments` is true', async () => {
      chat.options = {
        disableInputAttachments: true,
      };
      await elementUpdated(chat);

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');

      expect(inputArea).shadowDom.to.equal(
        `<div part="input-container">
                    <div part="input-wrapper">
                        <igc-textarea
                        aria-label="Chat text input"
                        part="text-input"
                        resize="auto"
                        rows="1"
                        >
                        </igc-textarea>
                    </div>
                    <div part="buttons-container">
                        <igc-icon-button
                          aria-label="Send message"
                          part="send-button"
                          disabled=""
                          name="send_message"
                          type="button"
                          variant="contained"
                        >
                        </igc-icon-button>
                        </div>
                    </div>`
      );
    });

    it('should update the file-input accepted prop based on the `acceptedFiles`', async () => {
      chat.options = {
        acceptedFiles: 'image/*',
      };
      await elementUpdated(chat);
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const element = inputArea?.shadowRoot?.querySelector('input');
      expect(element).not.to.be.null;
      if (element) {
        expect(element.accept).to.equal('image/*');

        chat.options = {
          acceptedFiles: '',
        };
        await elementUpdated(chat);

        expect(element.accept).to.be.empty;
      }
    });

    it('should render attachments chips correctly', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const fileInput = inputArea?.shadowRoot?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(eventSpy).calledWith('igcAttachmentChange');
      const eventArgs = eventSpy.getCall(0).args[1]?.detail;
      const args = Array.isArray(eventArgs)
        ? eventArgs.map((file: File, index) => ({ ...file, ...files[index] }))
        : [];
      expect(eventArgs).to.deep.equal(args);

      expect(inputArea).shadowDom.to.equal(
        `<div part="input-container">
            <div aria-label="Attachments" part="attachments" role="list">
              <div part="attachment-wrapper" role="listitem">
                <igc-chip removable="">
                  <igc-icon
                    name="attach_document"
                    slot="prefix"
                  >
                  </igc-icon>
                  <span part="attachment-name">
                    test.txt
                  </span>
                </igc-chip>
              </div>
              <div part="attachment-wrapper" role="listitem">
                <igc-chip removable="">
                  <igc-icon
                    name="attach_image"
                    slot="prefix"
                  >
                  </igc-icon>
                  <span part="attachment-name">
                    image.png
                  </span>
                </igc-chip>
              </div>
            </div>
            <div part="input-wrapper">
              <igc-textarea
                aria-label="Chat text input"
                part="text-input"
                resize="auto"
                rows="1"
              >
              </igc-textarea>
            </div>
            <div part="buttons-container">
              <label for="input_attachments" part="upload-button">
                <igc-icon-button
                  variant="flat"
                  aria-label="Attach files"
                  name="attach_file"
                  type="button"
                ></igc-icon-button>
                <input
                  type="file"
                  aria-label="Upload button"
                  id="input_attachments"
                  name="input_attachments"
                  multiple=""
                ></input>
              </label>
              <igc-icon-button
                aria-label="Send message"
                part="send-button"
                name="send_message"
                type="button"
                variant="contained"
              >
              </igc-icon-button>
            </div>
            </div>`
      );
    });

    it('should render attachments correctly', async () => {
      chat.messages = [messages[1], messages[2]];
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector(`div[part='message-list']`)
        ?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.null;

      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messageContainer).not.to.be.null;
        expect(messageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
                              <pre part="plain-text">
                                ${(messageContainer as HTMLElement)?.innerText}
                              </pre>
                            <igc-message-attachments>
                            </igc-message-attachments>
                            ${chat.messages[index].sender !== 'user' ? messageActions() : ''}
                    </div>`
        );

        const attachments = messageContainer?.querySelector(
          'igc-message-attachments'
        );
        // Check if image attachments are rendered correctly
        if (index === 0) {
          expect(attachments).shadowDom.to.equal(
            `<div part="attachments-container">
                <div part="attachment sent">
                  <div part="attachment-content sent">
                    <img
                        alt="img1.png"
                        part="image-attachment"
                        src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
                    >
                  </div>
                  <div part="attachment-header sent" role="button">
                      <div part="details">
                          <span part="file-name">
                              img1.png
                          </span>
                      </div>
                  </div>
                </div>
              </div>`
          );
        }
        // Check if non-image attachments are rendered correctly
        if (index === 1) {
          expect(attachments).shadowDom.to.equal(
            `<div part="attachments-container">
                <div part="attachment">
                  <div part="attachment-header" role="button">
                      <div part="details">
                          <igc-icon
                            name="document_thumbnail"
                            part="attachment-icon"
                          >
                          </igc-icon>
                          <span part="file-name">
                              file1.other
                          </span>
                      </div>
                  </div>
                  <div part="attachment-content">
                    <igc-icon
                      name="file_generic"
                      part="file-attachment"
                    >
                    </igc-icon>
                  </div>
                </div>
              </div>`
          );
        }
      });
    });

    it('should not render container if suggestions are not provided', async () => {
      const suggestionsContainer = chat.shadowRoot?.querySelector(
        `[part='suggestions-container']`
      );

      expect(suggestionsContainer).to.be.null;
    });

    it('should render suggestions if provided', async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      await elementUpdated(chat);

      const suggestionsContainer = chat.shadowRoot?.querySelector(
        `[part='suggestions-container']`
      );

      expect(suggestionsContainer).dom.to.equal(
        `<div part="suggestions-container">
        <igc-list>
          <igc-list-header part="suggestions-header">
            <span>
              Suggestions
            </span>
            <slot name="suggestions-header">
            </slot>
          </igc-list-header>
          <slot
            name="suggestions"
            part="suggestions"
          >
            <slot
              name="suggestion"
              part="suggestion"
            >
              <igc-list-item>
                <span slot="start">
                  <igc-icon
                    name="auto_suggest"
                  >
                  </igc-icon>
                </span>
                <span slot="title">
                  Suggestion 1
                </span>
              </igc-list-item>
            </slot>
            <slot
              name="suggestion"
              part="suggestion"
            >
              <igc-list-item>
                <span slot="start">
                  <igc-icon
                    name="auto_suggest"
                  >
                  </igc-icon>
                </span>
                <span slot="title">
                  Suggestion 2
                </span>
              </igc-list-item>
            </slot>
          </slot>
          <slot
            name="suggestions-actions"
            part="suggestions-actions"
          >
          </slot>
        </igc-list>
      </div>`
      );
    });

    it('should render suggestions below empty state by default', async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      await elementUpdated(chat);
      const suggestionsContainer = chat.shadowRoot?.querySelector(
        `[part='suggestions-container']`
      );

      expect(suggestionsContainer?.previousElementSibling?.part[0]).to.equal(
        'empty-state'
      );
    });

    it('should render suggestions below messages by default', async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      chat.messages.push({
        id: '5',
        text: 'New message',
        sender: 'user',
      });
      await elementUpdated(chat);

      const suggestionsContainer = chat.shadowRoot?.querySelector(
        `[part='suggestions-container']`
      )!;

      const messageList = chat.shadowRoot?.querySelector(
        'div[part="message-list"]'
      )!;

      const diff =
        suggestionsContainer.getBoundingClientRect().top -
        messageList.getBoundingClientRect().bottom;
      expect(diff).to.greaterThanOrEqual(0);
    });

    it("should render suggestions below input area when position is 'below-input'", async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        suggestionsPosition: 'below-input',
      };
      await elementUpdated(chat);

      const suggestionsContainer = chat.shadowRoot?.querySelector(
        `[part='suggestions-container']`
      )!;

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input')!;
      const diff =
        suggestionsContainer.getBoundingClientRect().top -
        inputArea.getBoundingClientRect().bottom;
      expect(diff).to.greaterThanOrEqual(0);
    });

    it('should render typing indicator if `isTyping` is true', async () => {
      // chat.messages = [messages[0]];
      chat.options = {
        isTyping: true,
      };
      await elementUpdated(chat);

      const typingIndicator = chat.shadowRoot
        ?.querySelector(`div[part='message-list']`)
        ?.querySelector(`div[part='typing-indicator']`);

      expect(typingIndicator).dom.to.equal(
        `<div part="typing-indicator">
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                </div>
            </div>`
      );
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
      chat = await fixture<IgcChatComponent>(
        html`<igc-chat>
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
        </igc-chat>`
      );

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
          attachment: (ctx) => attachmentTemplate(ctx.attachment),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector(`div[part='message-list']`)
        ?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.null;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messageContainer).not.to.be.null;
        const attachments = messageContainer?.querySelector(
          'igc-message-attachments'
        );
        expect(attachments).shadowDom.to.equal(
          `<div part="attachments-container">
                        <igc-chip>
                            <span>
                            ${chat.messages[index].attachments?.[0].name || ''}
                            </span>
                        </igc-chip>
                    </div>`
        );
      });
    });

    it('should render attachmentHeader template, attachmentContent template', async () => {
      chat.options = {
        renderers: {
          attachmentHeader: (ctx) => attachmentHeaderTemplate(ctx.attachment),
          attachmentContent: (ctx) => attachmentContentTemplate(ctx.attachment),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements =
        chat?.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.null;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const attachments = messageElement.shadowRoot?.querySelector(
          'igc-message-attachments'
        );

        const details =
          attachments?.shadowRoot?.querySelector(`div[part='details']`);
        expect(details).dom.to.equal(
          `<div part="details">
              <h5>Custom ${chat.messages[index].attachments?.[0].name}</h5>
            </div>`
        );

        const content = attachments?.shadowRoot?.querySelector(
          `div[part='attachment-content${isCurrentUser ? ' sent' : ''}']`
        );
        expect(content).dom.to.equal(
          `<div part="attachment-content${isCurrentUser ? ' sent' : ''}">
              <p>This is a template rendered as content of ${chat.messages[index].attachments?.[0].name}</p>
            </div>`
        );
      });
    });

    it('should render message template', async () => {
      chat.options = {
        renderers: {
          message: (ctx) => messageTemplate(ctx.message),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements =
        chat.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.null;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messageContainer).not.to.be.null;
        expect(messageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
                <div>
                    <h5>${chat.messages[index].sender === 'user' ? 'You' : 'Bot'}: </h5>
                    <p>${(messageContainer?.querySelector('p') as HTMLElement)?.innerText}</p>
                </div>
            </div>`
        );
      });
    });

    it('should render messageContent template', async () => {
      chat.options = {
        renderers: {
          messageContent: (ctx) => html`${ctx.message.text.toUpperCase()}`,
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements =
        chat.shadowRoot?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );

        expect(messageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
              ${chat.messages[index].text.toUpperCase()}
              <igc-message-attachments>
              </igc-message-attachments>
              ${isCurrentUser ? '' : messageActions()}
            </div>`
        );
      });
    });

    it('should render messageActionsTemplate', async () => {
      chat.options = {
        renderers: {
          messageActions: (ctx) => messageActionsTemplate(ctx.message),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements =
        chat.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.null;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );

        expect(messageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
                            <pre part="plain-text">
                              ${chat.messages[index].text}
                            </pre>
                          <igc-message-attachments>
                          </igc-message-attachments>
                      ${
                        !isCurrentUser
                          ? `<div style="float: right">
                            <igc-button name="regenerate" type="button" variant="flat">...</igc-button>
                          </div>`
                          : ''
                      }
            </div>`
        );
      });
    });

    it('should render custom typingIndicator', async () => {
      chat.messages = [messages[0]];
      chat.options = {
        isTyping: true,
        renderers: {
          typingIndicator: () => typingIndicatorTemplate,
        },
      };
      await elementUpdated(chat);
      const messageContainer = chat?.shadowRoot?.querySelector(
        `div[part='message-list']`
      );

      expect(chat.messages.length).to.equal(1);
      expect(messageContainer).dom.to.equal(
        `<div
        part="message-list"
        tabindex="0"
      >
                <igc-chat-message id="message-1" part="message-item">
                </igc-chat-message>
                <span>loading...</span>
            </div>`,
        DIFF_OPTIONS
      );
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
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');

      expect(inputArea).shadowDom.to.equal(
        `<div part="input-container">
          <div aria-label="Attachments" part="attachments" role="list">
              <div>
                <a href=${draftMessage.attachments[0].url} target="_blank">
                  ${draftMessage.attachments[0].name}
                </a>
              </div>
            </div>
            <div part="input-wrapper">
                <igc-input type="text" placeholder="Type text here...">
            </div>
            <div part="buttons-container">
              <div>
                <igc-button type="button" variant="contained">Upload</igc-button>
                <igc-button type="button" variant="contained">Send</igc-button>
              </div>
            </div>
          </div>
          `
      );

      expect(inputArea?.shadowRoot?.querySelector('igc-input')?.value).to.equal(
        draftMessage.text
      );
    });

    it('should render messageHeader template', async () => {
      chat.options = {
        renderers: {
          messageHeader: (ctx) => messageHeaderTemplate(ctx.message),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector('div[part="message-list"]')
        ?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );

        expect(messageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
              ${!isCurrentUser ? '<span>AI Assistant</span>' : ''}
              <pre part="plain-text">
                ${chat.messages[index].text}
              </pre>
              <igc-message-attachments>
              </igc-message-attachments>
              ${!isCurrentUser ? messageActions() : ''}
            </div>`
        );
      });
    });
  });

  describe('Interactions', () => {
    describe('Click', () => {
      it('should update messages properly on send button click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const sendButton = inputArea?.shadowRoot?.querySelector(
          'igc-icon-button[name="send_message"]'
        )!;
        const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;
        expect(sendButton).not.to.be.null;
        expect(textArea).not.to.be.null;

        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        simulateClick(sendButton);
        await elementUpdated(chat);
        await aTimeout(500);

        expect(eventSpy).calledWith('igcMessageCreated');
        const eventArgs = eventSpy.getCall(1).args[1]?.detail;
        const args =
          eventArgs && typeof eventArgs === 'object'
            ? { ...eventArgs, text: 'Hello!', sender: 'user' }
            : { text: 'Hello!', sender: 'user' };
        expect(eventArgs).to.deep.equal(args);
        expect(chat.messages.length).to.equal(1);
        expect(chat.messages[0].text).to.equal('Hello!');
        expect(chat.messages[0].sender).to.equal('user');
        // The focus should be on the input area after send button is clicked
        expect(isFocused(textArea)).to.be.true;
      });

      it('should update messages properly on suggestion chip click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        chat.options = {
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        };
        await elementUpdated(chat);

        const suggestionItems = chat.shadowRoot
          ?.querySelector('igc-list')
          ?.querySelectorAll('igc-list-item')!;

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
        // The focus should be on the input area after suggestion click
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const textArea = inputArea?.shadowRoot?.querySelector(
          'igc-textarea'
        ) as HTMLElement;
        expect(isFocused(textArea)).to.be.true;
      });

      it('should remove attachment on chip remove button click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const fileInput = inputArea?.shadowRoot?.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        simulateFileUpload(fileInput, files);
        await elementUpdated(chat);
        await aTimeout(500);

        expect(
          inputArea?.shadowRoot?.querySelectorAll('igc-chip').length
        ).to.equal(2);
        const removeFileButton = inputArea?.shadowRoot
          ?.querySelectorAll('igc-chip')[0]
          ?.shadowRoot?.querySelector('igc-icon') as HTMLElement;
        simulateClick(removeFileButton);
        await elementUpdated(chat);

        expect(eventSpy).calledTwice;
        expect(eventSpy.alwaysCalledWith('igcAttachmentChange')).to.be.true;
        const eventArgs = eventSpy.getCall(1).args[1]?.detail;
        const argsArr = Array.isArray(eventArgs) ? [...eventArgs] : [];
        expect(argsArr.length).to.equal(1);
        expect(argsArr[0].name).to.equal(files[1].name);
      });

      it('should disable send button on removing all attachments', async () => {
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const fileInput = inputArea?.shadowRoot?.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        simulateFileUpload(fileInput, files);
        await elementUpdated(chat);
        await elementUpdated(inputArea!);

        const attachments =
          inputArea?.shadowRoot?.querySelectorAll('igc-chip')!;
        simulateClick(attachments[1].shadowRoot?.querySelector('igc-icon')!);
        simulateClick(attachments[0].shadowRoot?.querySelector('igc-icon')!);
        await elementUpdated(inputArea!);

        const sendButton = inputArea?.shadowRoot?.querySelector(
          'igc-icon-button[name="send_message"]'
        )! as IgcIconButtonComponent;

        expect(sendButton.disabled).to.be.true;
      });

      it('should update like button state on click', async () => {
        chat.messages = [messages[0]];
        await elementUpdated(chat);
        await aTimeout(500);

        const messageContainer = chat.shadowRoot?.querySelector(
          'div[part="message-list"]'
        ) as HTMLElement;
        let firstMessage =
          messageContainer?.querySelectorAll('igc-chat-message')[0];
        expect(firstMessage).shadowDom.to.equal(
          `<div part="message-container">
                <pre part="plain-text">
                  Hello! How can I help you today?
                </pre>
                ${firstMessage?.message?.sender !== 'user' ? messageActions() : ''}
            </div>`
        );

        // click on like (inactive) icon
        let likeIcon = firstMessage?.shadowRoot?.querySelector(
          'igc-icon-button[name="thumb_up_inactive"]'
        ) as HTMLElement;
        simulateClick(likeIcon);
        await elementUpdated(chat);

        firstMessage =
          messageContainer?.querySelectorAll('igc-chat-message')[0];
        expect(firstMessage).shadowDom.to.equal(
          `<div part="message-container">
              <pre part="plain-text">
                Hello! How can I help you today?
              </pre>
              ${firstMessage?.message?.sender !== 'user' ? messageActions('active') : ''}
          </div>`
        );

        // click on like (active) icon
        likeIcon = firstMessage?.shadowRoot?.querySelector(
          'igc-icon-button[name="thumb_up_active"]'
        ) as HTMLElement;
        simulateClick(likeIcon);
        await elementUpdated(chat);

        firstMessage =
          messageContainer?.querySelectorAll('igc-chat-message')[0];
        expect(firstMessage).shadowDom.to.equal(
          `<div part="message-container">
              <pre part="plain-text">
                Hello! How can I help you today?
              </pre>
              ${firstMessage?.message?.sender !== 'user' ? messageActions() : ''}
          </div>`
        );
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
        // click on copy icon
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
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input')!;
        const dropZone = inputArea?.shadowRoot?.querySelector(
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

          expect(eventSpy.callCount).to.equal(1);
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
          const attachments =
            inputArea?.shadowRoot?.querySelectorAll('igc-chip');
          expect(attachments?.length).to.equal(1);
          expect(attachments?.[0]?.textContent?.trim()).to.equal('test.txt');
          expect(eventSpy).calledWith('igcAttachmentDrop');
          expect(eventSpy).calledWith('igcAttachmentChange');
        }
      });
    });

    describe('Keyboard', () => {
      it('should update messages properly on `Enter` keypress when the textarea is focused', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        simulateFocus(textArea);
        simulateKeyboard(textArea, enterKey);
        await elementUpdated(chat);
        await clock.tickAsync(500);

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

        // The focus should be on the input area after message is sent
        expect(isFocused(textArea)).to.be.true;
      });

      xit('should activate the recent message when the message list is focused', async () => {
        chat.messages = messages;
        await elementUpdated(chat);
        await aTimeout(500);

        const messageContainer = chat.shadowRoot?.querySelector(
          'div[part="message-list"]'
        ) as HTMLElement;
        messageContainer.focus();
        await elementUpdated(chat);

        const messageElements =
          messageContainer?.querySelectorAll('igc-chat-message');
        messageElements?.forEach((message, index) => {
          if (index === messages.length - 1) {
            expect(message.part.length).to.equal(2);
            expect(message.part[0]).to.equal('message-item');
            expect(message.part[1]).to.equal('active');
          } else {
            expect(message.part.length).to.equal(1);
            expect(message.part[0]).to.equal('message-item');
          }
        });
      });

      xit('should activate the next/previous message on `ArrowDown`/`ArrowUp`', async () => {
        chat.messages = messages;
        await elementUpdated(chat);
        await aTimeout(500);

        const messageContainer = chat.shadowRoot
          ?.querySelector('div[part="message-list"]')
          ?.querySelector(`div[part='message-container']`) as HTMLElement;
        messageContainer.focus();
        await elementUpdated(chat);
        await nextFrame();
        await nextFrame();

        // Activates the previous message on `ArrowUp`
        simulateKeyboard(messageContainer, arrowUp);
        await elementUpdated(chat);
        expect(messageContainer.getAttribute('aria-activedescendant')).to.equal(
          'message-3'
        );

        // Activates the next message on `ArrowDown`
        simulateKeyboard(messageContainer, arrowDown);
        await elementUpdated(chat);
        expect(messageContainer.getAttribute('aria-activedescendant')).to.equal(
          'message-4'
        );
      });

      xit('should activate the first/last message on `Home`/`End`', async () => {
        chat.messages = messages;
        await elementUpdated(chat);
        await aTimeout(500);

        const messageContainer = chat.shadowRoot
          ?.querySelector('div[part="message-list"]')
          ?.querySelector(`div[part='message-container']`) as HTMLElement;
        messageContainer.focus();
        await elementUpdated(chat);
        await nextFrame();
        await nextFrame();

        // Activates the first message on `Home`
        simulateKeyboard(messageContainer, homeKey);
        await elementUpdated(chat);
        expect(messageContainer.getAttribute('aria-activedescendant')).to.equal(
          'message-1'
        );

        // Activates the last message on `End`
        simulateKeyboard(messageContainer, endKey);
        await elementUpdated(chat);
        expect(messageContainer.getAttribute('aria-activedescendant')).to.equal(
          'message-4'
        );
      });
    });
  });

  describe('Events', () => {
    it('emits igcAttachmentClick', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[1]];
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElement = chat.shadowRoot
        ?.querySelector(`div[part='message-list'`)
        ?.querySelector('igc-chat-message');

      const attachmentHeader = messageElement?.shadowRoot
        ?.querySelector('igc-message-attachments')
        ?.shadowRoot?.querySelector(
          `div[part='attachment-header sent']`
        ) as HTMLElement;

      simulateClick(attachmentHeader);
      expect(eventSpy).calledWith('igcAttachmentClick', {
        detail: { ...messages[1].attachments?.at(0) },
      });
    });

    it('emits igcTypingChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

      simulateFocus(textArea);
      simulateKeyboard(textArea, 'a');
      expect(eventSpy).calledWith('igcTypingChange', {
        detail: { isTyping: true },
      });

      aTimeout(3000).then(() => {
        expect(eventSpy).calledWith('igcTypingChange', {
          detail: { isTyping: false },
        });
      });
    });

    it('emits igcInputFocus', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

      simulateFocus(textArea);
      expect(eventSpy).calledWith('igcInputFocus');
    });

    it('emits igcInputBlur', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

      simulateBlur(textArea);
      expect(eventSpy).calledWith('igcInputBlur');
    });

    it('emits igcInputChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

      textArea.setAttribute('value', 'Hello!');
      textArea.dispatchEvent(new CustomEvent('igcInput', { detail: 'Hello!' }));
      await elementUpdated(chat);
      expect(eventSpy).calledWith('igcInputChange', {
        detail: { value: 'Hello!' },
      });
    });

    it('emits igcMessageReact', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[0]];
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElement = chat.shadowRoot
        ?.querySelector(`div[part='message-list'`)
        ?.querySelector('igc-chat-message');

      const likeIcon = messageElement?.shadowRoot?.querySelector(
        'igc-icon-button[name="thumb_up_inactive"]'
      ) as HTMLElement;

      simulateClick(likeIcon);
      expect(eventSpy).calledWith('igcMessageReact', {
        detail: { message: messages[0], reaction: 'thumb_up_active' },
      });
    });

    it('can cancel `igcMessageCreated` event', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const sendButton = inputArea?.shadowRoot?.querySelector(
        'igc-icon-button[name="send_message"]'
      )!;
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea')!;

      chat.addEventListener('igcMessageCreated', (event) => {
        event.preventDefault();
      });

      textArea.setAttribute('value', 'Hello!');
      textArea.dispatchEvent(new CustomEvent('igcInput', { detail: 'Hello!' }));
      await elementUpdated(chat);
      simulateClick(sendButton);
      await elementUpdated(chat);
      await clock.tickAsync(500);

      expect(chat.messages.length).to.equal(0);
    });

    it('can cancel `igcAttachmentChange` event', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const fileInput = inputArea?.shadowRoot?.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      chat.addEventListener('igcAttachmentChange', (event) => {
        event.preventDefault();
      });

      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);
      aTimeout(500);

      expect(
        inputArea?.shadowRoot?.querySelectorAll('igc-chip').length
      ).to.equal(0);
    });
  });
});
