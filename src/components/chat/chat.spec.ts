import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  nextFrame,
} from '@open-wc/testing';
import { html } from 'lit';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
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
import IgcChatComponent from './chat.js';

describe('Chat', () => {
  before(() => {
    defineComponents(IgcChatComponent);
  });

  const DIFF_OPTIONS = {
    ignoreAttributes: ['exportparts'],
  };

  const createChatComponent = () => html`<igc-chat></igc-chat>`;

  const messageHeaderTemplate = (msg: any) => {
    return msg.sender !== 'user' ? html`<span>AI Assistant</span>` : html``;
  };

  const messageTemplate = (msg: any) => {
    return html`<div>
      <h5>${msg.sender === 'user' ? 'You' : 'Bot'}:</h5>
      <p>${msg.text}</p>
    </div> `;
  };

  const messageActionsTemplate = (msg: any) => {
    return msg.sender !== 'user' && msg.text.trim()
      ? html`<div style="float: right">
          <igc-button name="regenerate" variant="flat">...</igc-button>
        </div> `
      : html``;
  };

  const typingIndicatorTemplate = html`<span>loading...</span>`;

  const attachmentTemplate = (attachment: any) => {
    return html`<igc-chip><span>${attachment.name}</span></igc-chip>`;
  };

  const attachmentHeaderTemplate = (attachment: any) => {
    return html`<h5>Custom ${attachment.name}</h5>`;
  };

  const attachmentContentTemplate = (attachment: any) => {
    return html`<p>
      This is a template rendered as content of ${attachment.name}
    </p>`;
  };

  const textInputTemplate = (text: string) =>
    html`<igc-input
      placeholder="Type text here..."
      .value=${text}
    ></igc-input>`;

  const textAreaActionsTemplate = html`<div>
    <igc-button>Upload</igc-button>
    <igc-button>Send</igc-button>
  </div>`;

  const textAreaAttachmentsTemplate = (attachments: any[]) => {
    return html`<div>
      ${attachments.map(
        (attachment) =>
          html`<a
            href=${attachment.file
              ? URL.createObjectURL(attachment.file)
              : attachment.url}
            target="_blank"
            >${attachment.name}</a
          >`
      )}
    </div>`;
  };

  const messages: any[] = [
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: 'Hello!',
      sender: 'user',
      timestamp: new Date(Date.now() - 3500000),
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
      timestamp: new Date(Date.now() - 3400000),
      attachments: [
        {
          id: 'img2',
          name: 'img2.png',
          url: 'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
          type: 'file',
        },
      ],
    },
    {
      id: '4',
      text: 'Thank you too!',
      sender: 'user',
      timestamp: new Date(Date.now() - 3300000),
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

  const messageActions = `<div>
                          <igc-icon-button
                            collection="material"
                            id="copy-response-button"
                            name="copy-response"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            collection="material"
                            id="good-response-button"
                            name="good-response"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            collection="material"
                            id="bad-response-button"
                            name="bad-response"
                            type="button"
                            variant="flat"
                          >
                          </igc-icon-button>
                          <igc-icon-button
                            collection="material"
                            id="redo-button"
                            name="redo"
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

    it('is rendered correctly', () => {
      expect(chat).dom.to.equal(
        `<igc-chat>
        </igc-chat>`
      );

      expect(chat).shadowDom.to.equal(
        ` <div part="chat-container">
                    <div hidden="" part="header">
                      <slot name="prefix" part="prefix"></slot>
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
                            name="attachment"
                            type="button"
                            collection="material"
                          ></igc-icon-button>
                          <input
                            type="file"
                            id="input_attachments"
                            name="input_attachments"
                            multiple=""
                          ></input>
                        </label>
                        <igc-icon-button
                          aria-label="Send message"
                          part="send-button"
                          collection="material"
                          disabled=""
                          name="send-message"
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
        `<div part="message-list" aria-label="Message list" role="group" tabindex="0">
                   <igc-chat-message id="message-1" part="message-item" role="option">
                    </igc-chat-message>
                    <igc-chat-message id="message-2" part="message-item" role="option">
                    </igc-chat-message>
                    <igc-chat-message id="message-3" part="message-item" role="option">
                    </igc-chat-message>
                    <igc-chat-message id="message-4" part="message-item" role="option">
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
            ${firstMessage?.message?.sender !== 'user' ? messageActions : ''}
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
          timestamp: new Date(Date.now() - 3600000),
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
          ${firstMessage?.message?.sender !== 'user' ? messageActions : ''}
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

      await aTimeout(500);

      const messageContainer = chat.shadowRoot?.querySelector(
        `div[part='message-list']`
      );

      expect(messageContainer).not.to.be.undefined;
      expect(chat.messages.length).to.equal(3);

      messageContainer
        ?.querySelectorAll('igc-chat-message')
        .forEach((messageElement, index) => {
          if (index !== 2) {
            expect(
              messageElement.shadowRoot?.querySelector(
                `div[part='message-container ']`
              )
            ).not.to.be.undefined;
          } else {
            expect(
              messageElement.shadowRoot?.querySelector(
                `div[part='message-container sent']`
              )
            ).not.to.be.undefined;
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
      const attachmentsArea = chat.shadowRoot
        ?.querySelector('igc-chat-input')
        ?.shadowRoot?.querySelectorAll('igc-chip');

      expect(textArea?.value).to.equal(draftMessage.text);
      expect(attachmentsArea?.length).to.equal(draftMessage.attachments.length);
    });

    it('should apply `headerText` correctly', async () => {
      chat.options = {
        headerText: 'Chat',
      };
      await elementUpdated(chat);

      const headerArea = chat.shadowRoot?.querySelector(`div[part='header']`);

      expect(headerArea).dom.to.equal(
        `<div hidden="" part="header">
                      <slot name="prefix" part="prefix">
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
        'igc-icon-button[name="send-message"]'
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
                          collection="material"
                          disabled=""
                          name="send-message"
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
      const element = inputArea?.shadowRoot?.querySelector('igc-file-input');
      expect(element).not.to.be.undefined;
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
                    collection="material"
                    name="file-document"
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
                    collection="material"
                    name="file-image"
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
                  name="attachment"
                  type="button"
                  collection="material"
                ></igc-icon-button>
                <input
                  type="file"
                  id="input_attachments"
                  name="input_attachments"
                  multiple=""
                ></input>
              </label>
              <igc-icon-button
                aria-label="Send message"
                part="send-button"
                collection="material"
                name="send-message"
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
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        expect(messsageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
                              <pre part="plain-text">
                                ${(messsageContainer as HTMLElement)?.innerText}
                              </pre>
                            <igc-message-attachments>
                            </igc-message-attachments>
                            ${chat.messages[index].sender !== 'user' ? messageActions : ''}
                    </div>`
        );

        const attachments = messsageContainer?.querySelector(
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
                            collection="material"
                            name="file"
                            part="attachment-icon"
                          >
                          </igc-icon>
                          <span part="file-name">
                              img2.png
                          </span>
                      </div>
                  </div>
                  <div part="attachment-content">
                    <img
                      alt="img2.png"
                      part="file-attachment"
                      src="http://localhost:8000/src/components/chat/assets/file.png"
                    >
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
        <igc-list
          aria-label="Suggestions"
          role="list"
        >
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
              role="listitem"
            >
              <igc-list-item>
                <span slot="start">
                  <igc-icon
                    collection="material"
                    name="star-icon"
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
              role="listitem"
            >
              <igc-list-item>
                <span slot="start">
                  <igc-icon
                    collection="material"
                    name="star-icon"
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
        timestamp: new Date(),
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
      chat.messages = [messages[0]];
      chat.options = {
        isTyping: true,
      };
      await elementUpdated(chat);

      const messageContainer = chat.shadowRoot?.querySelector(
        `div[part='message-list']`
      );

      expect(chat.messages.length).to.equal(1);
      expect(messageContainer).dom.to.equal(
        `<div part="message-list" aria-label="Message list" role="group" tabindex="0">
                <igc-chat-message id="message-1" part="message-item" role="option">
                </igc-chat-message>
                <div part="typing-indicator">
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                    <div part="typing-dot">
                    </div>
                </div>
            </div>`,
        DIFF_OPTIONS
      );
    });
  });

  describe('Slots', () => {
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
        </igc-chat>`
      );
    });

    it('should slot header prefix', () => {});
    it('should slot header title', () => {});
    it('should slot header action buttons area', () => {});
    it('should slot message list area when there are no messages', () => {});
    it('should slot suggestions area', () => {});
  });

  describe('Templates', () => {
    beforeEach(async () => {
      chat.messages = [messages[1], messages[2]];
    });

    it('should render attachmentTemplate', async () => {
      chat.options = {
        renderers: {
          attachment: (ctx) => attachmentTemplate(ctx.param),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector(`div[part='message-list']`)
        ?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        const attachments = messsageContainer?.querySelector(
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

    it('should render attachmentHeaderTemplate, attachmentContentTemplate', async () => {
      chat.options = {
        renderers: {
          attachmentHeader: (ctx) => attachmentHeaderTemplate(ctx.param),
          attachmentContent: (ctx) => attachmentContentTemplate(ctx.param),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements =
        chat?.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        const attachments = messsageContainer?.querySelector(
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

    it('should render messageTemplate', async () => {
      chat.options = {
        renderers: {
          message: (ctx) => messageTemplate(ctx.param),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements =
        chat.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        expect(messsageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
                <div>
                    <h5>${chat.messages[index].sender === 'user' ? 'You' : 'Bot'}: </h5>
                    <p>${(messsageContainer?.querySelector('p') as HTMLElement)?.innerText}</p>
                </div>
            </div>`
        );
      });
    });

    it('should render messageActionsTemplate', async () => {
      chat.options = {
        renderers: {
          messageActions: (ctx) => messageActionsTemplate(ctx.param),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements =
        chat.shadowRoot?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        expect(messsageContainer).dom.to.equal(
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
        aria-label="Message list"
        role="group"
        tabindex="0"
      >
                <igc-chat-message id="message-1" part="message-item" role="option">
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
          input: (ctx) => textInputTemplate(ctx.param),
          inputActions: () => textAreaActionsTemplate,
          inputAttachments: (ctx) => textAreaAttachmentsTemplate(ctx.param),
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
                <igc-input placeholder="Type text here...">
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

    it('should render messageHeaderTemplate', async () => {
      chat.options = {
        renderers: {
          messageHeader: (ctx) => messageHeaderTemplate(ctx.param),
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector('div[part="message-list"]')
        ?.querySelectorAll('igc-chat-message');
      expect(messageElements).not.to.be.undefined;
      messageElements?.forEach((messageElement, index) => {
        const isCurrentUser = chat.messages[index].sender === 'user';
        const messsageContainer = messageElement.shadowRoot?.querySelector(
          `div[part='message-container${isCurrentUser ? ' sent' : ''}']`
        );
        expect(messsageContainer).not.to.be.undefined;
        expect(messsageContainer).dom.to.equal(
          `<div part="message-container${isCurrentUser ? ' sent' : ''}">
              ${!isCurrentUser ? '<span>AI Assistant</span>' : ''}
              <pre part="plain-text">
                ${chat.messages[index].text}
              </pre>
              <igc-message-attachments>
              </igc-message-attachments>
              ${!isCurrentUser ? messageActions : ''}
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
          'igc-icon-button[name="send-message"]'
        );
        const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');
        expect(sendButton).not.to.be.undefined;
        expect(textArea).not.to.be.undefined;

        if (sendButton && textArea) {
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
        }
      });

      it('should update messages properly on suggestion chip click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        chat.options = {
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        };
        await elementUpdated(chat);

        const suggestionItems = chat.shadowRoot
          ?.querySelector('igc-list')
          ?.querySelectorAll('igc-list-item');

        expect(suggestionItems?.length).to.equal(2);
        if (suggestionItems) {
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
        }
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

        expect(dropZone).not.to.be.undefined;
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
        const sendButton = inputArea?.shadowRoot?.querySelector(
          'igc-icon-button[name="send-message"]'
        );
        const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

        expect(sendButton).not.to.be.undefined;
        expect(textArea).not.to.be.undefined;

        if (sendButton && textArea) {
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
        }
      });

      it('should activates the recent message when the message list is focused', async () => {
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

      xit('should activates the next/previous message on `ArrowDown`/`ArrowUp`', async () => {
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

      xit('should activates the first/last message on `Home`/`End`', async () => {
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
        detail: { ...messages[1].attachments[0] },
      });
    });

    it('emits igcTypingChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      expect(textArea).not.to.be.undefined;
      if (textArea) {
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
      }
    });

    it('emits igcInputFocus', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');
      expect(textArea).not.to.be.undefined;

      if (textArea) {
        simulateFocus(textArea);
        expect(eventSpy).calledWith('igcInputFocus');
      }
    });

    it('emits igcInputBlur', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');
      expect(textArea).not.to.be.undefined;

      if (textArea) {
        simulateBlur(textArea);
        expect(eventSpy).calledWith('igcInputBlur');
      }
    });

    it('emits igcInputChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      expect(textArea).not.to.be.undefined;
      if (textArea) {
        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        expect(eventSpy).calledWith('igcInputChange', {
          detail: { value: 'Hello!' },
        });
      }
    });

    it('emits igcMessageReact', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      chat.messages = [messages[0]];
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElement = chat.shadowRoot
        ?.querySelector(`div[part='message-list'`)
        ?.querySelector('igc-chat-message');

      const goodResponseIcon = messageElement?.shadowRoot?.querySelector(
        'igc-icon-button[name="good-response"]'
      ) as HTMLElement;

      simulateClick(goodResponseIcon);
      expect(eventSpy).calledWith('igcMessageReact', {
        detail: { message: messages[0], reaction: 'good-response' },
      });
    });

    it('can cancel `igcMessageCreated` event', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const sendButton = inputArea?.shadowRoot?.querySelector(
        'igc-icon-button[name="send-message"]'
      );
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');
      expect(sendButton).not.to.be.undefined;
      expect(textArea).not.to.be.undefined;

      chat.addEventListener('igcMessageCreated', (event) => {
        event.preventDefault();
      });

      if (sendButton && textArea) {
        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(
          new CustomEvent('igcInput', { detail: 'Hello!' })
        );
        await elementUpdated(chat);
        simulateClick(sendButton);
        await elementUpdated(chat);
        await clock.tickAsync(500);

        expect(chat.messages.length).to.equal(0);
      }
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
