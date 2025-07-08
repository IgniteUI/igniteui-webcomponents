import { aTimeout, elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import {
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

  const createChatComponent = () => html`<igc-chat></igc-chat>`;

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

  const composingIndicatorTemplate = html`<span>loading...</span>`;

  const attachmentTemplate = (attachments: any[]) => {
    return html`${attachments.map((attachment) => {
      return html`<igc-chip><span>${attachment.name}</span></igc-chip>`;
    })}`;
  };

  const attachmentHeaderTemplate = (attachments: any[]) => {
    return html`${attachments.map((attachment) => {
      return html`<h5>Custom ${attachment.name}</h5>`;
    })}`;
  };

  const attachmentActionsTemplate = (attachments: any[]) => {
    return html`${attachments.map(() => {
      return html`<igc-button>?</igc-button>`;
    })}`;
  };

  const attachmentContentTemplate = (attachments: any[]) => {
    return html`${attachments.map((attachment) => {
      return html`<p>
        This is a template rendered as content of ${attachment.name}
      </p>`;
    })}`;
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

  const files = [
    new File(['test content'], 'test.txt', { type: 'text/plain' }),
    new File(['image data'], 'image.png', { type: 'image/png' }),
  ];

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
    });

    it('is rendered correctly', () => {
      expect(chat).dom.to.equal(
        `<igc-chat>                   
        </igc-chat>`
      );

      expect(chat).shadowDom.to.equal(
        ` <div class="chat-container">
                    <div class="header" part="header">
                        <div class="info">
                            <slot name="prefix" part="prefix">
                            </slot>
                            <slot name="title" part="title">
                            </slot>
                        </div>
                        <slot class="actions" name="actions">
                            <igc-button type="button" variant="flat">
                            ⋯
                            </igc-button>
                        </slot>
                    </div>
                    <igc-chat-message-list>
                    </igc-chat-message-list>
                    <div class="suggestions-container">
                        <slot name="suggestions" part="suggestions">
                        </slot>
                    </div>
                    <igc-chat-input>
                    </igc-chat-input>
                </div>`
      );

      const messageList = chat.shadowRoot?.querySelector(
        'igc-chat-message-list'
      );

      expect(messageList).shadowDom.to.equal(
        `<div class="message-container">
                </div>
                <div class="message-list">
                </div>`
      );

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');

      expect(inputArea).shadowDom.to.equal(
        `<div class="input-container">
                    <igc-file-input multiple="">
                        <igc-icon
                        collection="material"
                        name="attachment"
                        slot="file-selector-text"
                        >
                        </igc-icon>
                    </igc-file-input>
                    <div class="input-wrapper">
                        <igc-textarea
                        class="text-input"
                        placeholder="Type a message..."
                        rows="1"
                        >
                        </igc-textarea>
                    </div>
                    <div class="buttons-container">
                        <igc-icon-button
                        class="small"
                        collection="material"
                        disabled=""
                        name="send-message"
                        type="button"
                            variant="contained"
                        >
                        </igc-icon-button>
                        </div>
                    </div>
                    <div>
                    </div>`
      );
    });

    it('should render initially set messages correctly', async () => {
      chat = await fixture<IgcChatComponent>(
        html`<igc-chat .messages=${messages}> </igc-chat>`
      );

      const messageContainer = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list');

      expect(chat.messages.length).to.equal(4);
      expect(messageContainer).dom.to.equal(
        `<div class="message-list">
                    <igc-chat-message>
                    </igc-chat-message>
                    <igc-chat-message>
                    </igc-chat-message>
                    <igc-chat-message>
                    </igc-chat-message>
                    <igc-chat-message>
                    </igc-chat-message>
                </div>`
      );

      expect(
        messageContainer?.querySelectorAll('igc-chat-message')[0]
      ).shadowDom.to.equal(
        `<div class="message-container ">
                    <div class="bubble">
                        <div>
                            <p>Hello! How can I help you today?</p>
                        </div>
                    </div>
                </div>`
      );

      expect(
        messageContainer?.querySelectorAll('igc-chat-message')[3]
      ).shadowDom.to.equal(
        `<div class="message-container sent">
                    <div class="bubble">
                        <div>
                            <p>Thank you too!</p>
                        </div>
                    </div>
                </div>`
      );
    });

    it('should sanitize message content', async () => {
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

      const messageContainer = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list');

      expect(chat.messages.length).to.equal(1);

      expect(
        messageContainer?.querySelectorAll('igc-chat-message')[0]
      ).shadowDom.to.equal(
        `<div class="message-container ">
                    <div class="bubble">
                        <div>
                            <p>Hello!</p>
                        </div>
                    </div>
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

      const messageContainer = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list');

      expect(chat.messages.length).to.equal(3);

      messageContainer
        ?.querySelectorAll('igc-chat-message')
        .forEach((messageElement, index) => {
          if (index !== 2) {
            expect(
              messageElement.shadowRoot
                ?.querySelector('.message-container')
                ?.classList.contains('sent')
            ).to.be.false;
          } else {
            expect(
              messageElement.shadowRoot
                ?.querySelector('.message-container')
                ?.classList.contains('sent')
            ).to.be.true;
          }
        });
    });

    it('should apply `headerText` correctly', async () => {
      chat.options = {
        headerText: 'Chat',
      };
      await elementUpdated(chat);

      const headerArea = chat.shadowRoot?.querySelector('.header');

      expect(headerArea).dom.to.equal(
        `<div class="header" part="header"> 
                    <div class="info">
                        <slot name="prefix" part="prefix">
                        </slot>
                        <slot name="title" part="title">
                            Chat
                        </slot>
                    </div>
                    <slot class="actions" name="actions">
                        <igc-button type="button" variant="flat">
                        ⋯
                        </igc-button>
                    </slot>
                </div>`
      );
    });

    // it('should scroll to bottom by default', async () => {
    //   chat.messages = [messages[0], messages[1], messages[2]];
    //   await elementUpdated(chat);
    //   await clock.tickAsync(500);

    //   const messagesContainer = chat.shadowRoot?.querySelector(
    //     'igc-chat-message-list'
    //   );
    //   let scrollPosition = messagesContainer
    //     ? messagesContainer.scrollHeight - messagesContainer.scrollTop
    //     : 0;
    //   expect(scrollPosition).to.equal(messagesContainer?.clientHeight);

    //   chat.messages = [...chat.messages, messages[3]];
    //   await chat.updateComplete;
    //   await clock.tickAsync(500);

    //   scrollPosition = messagesContainer
    //     ? messagesContainer.scrollHeight - messagesContainer.scrollTop
    //     : 0;

    //   expect(chat.messages.length).to.equal(4);
    //   expect(messagesContainer?.scrollTop).not.to.equal(0);
    //   expect(scrollPosition).to.equal(messagesContainer?.clientHeight);
    // });

    // it('should not scroll to bottom if `disableAutoScroll` is true', async () => {
    //   chat.messages = [messages[0], messages[1], messages[2]];
    //   chat.options = {
    //     disableAutoScroll: true,
    //   };
    //   await elementUpdated(chat);
    //   await clock.tickAsync(500);

    //   const messagesContainer = chat.shadowRoot?.querySelector(
    //     'igc-chat-message-list'
    //   );
    //   const scrollPosition = messagesContainer
    //     ? messagesContainer.scrollHeight - messagesContainer.scrollTop
    //     : 0;
    //   expect(scrollPosition).to.equal(messagesContainer?.clientHeight);

    //   messagesContainer?.scrollTo(0, 0);
    //   chat.messages = [...chat.messages, messages[3]];
    //   await chat.updateComplete;
    //   await clock.tickAsync(500);

    //   expect(chat.messages.length).to.equal(4);
    //   expect(messagesContainer?.scrollTop).to.equal(0);
    // });

    it('should not render attachment button if `disableAttachments` is true', async () => {
      chat.options = {
        disableAttachments: true,
      };
      await elementUpdated(chat);

      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');

      expect(inputArea).shadowDom.to.equal(
        `<div class="input-container">
                    <div class="input-wrapper">
                        <igc-textarea
                        class="text-input"
                        placeholder="Type a message..."
                        rows="1"
                        >
                        </igc-textarea>
                    </div>
                    <div class="buttons-container">
                        <igc-icon-button
                        class="small"
                        collection="material"
                        disabled=""
                        name="send-message"
                        type="button"
                            variant="contained"
                        >
                        </igc-icon-button>
                        </div>
                    </div>
                    <div>
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
      const fileInput = inputArea?.shadowRoot
        ?.querySelector('igc-file-input')
        ?.shadowRoot?.querySelector('input') as HTMLInputElement;
      simulateFileUpload(fileInput, files);
      await elementUpdated(chat);

      expect(eventSpy).calledWith('igcAttachmentChange');
      const eventArgs = eventSpy.getCall(0).args[1]?.detail;
      const args = Array.isArray(eventArgs)
        ? eventArgs.map((file: File, index) => ({ ...file, ...files[index] }))
        : [];
      expect(eventArgs).to.deep.equal(args);

      expect(inputArea).shadowDom.to.equal(
        `<div class="input-container">
            <igc-file-input multiple="">
              <igc-icon
                collection="material"
                name="attachment"
                slot="file-selector-text"
              >
              </igc-icon>
            </igc-file-input>
            <div class="input-wrapper">
              <igc-textarea
                class="text-input"
                placeholder="Type a message..."
                rows="1"
              >
              </igc-textarea>
            </div>
            <div class="buttons-container">
              <igc-icon-button
                class="small"
                collection="material"
                name="send-message"
                type="button"
                variant="contained"
              >
              </igc-icon-button>
            </div>
            </div>
            <div>
            <div class="attachment-wrapper">
              <igc-chip removable="">
                <span class="attachment-name">
                  test.txt
                </span>
              </igc-chip>
            </div>
            <div class="attachment-wrapper">
              <igc-chip removable="">
                <span class="attachment-name">
                  image.png
                </span>
              </igc-chip>
            </div>
        </div>`
      );
    });

    it('should render attachments correctly', async () => {
      chat.messages = [messages[1], messages[2]];
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const messsageContainer =
          messageElement.shadowRoot?.querySelector('.bubble');
        expect(messsageContainer).dom.to.equal(
          `<div class="bubble">
                            <div>
                                <p>${(messsageContainer as HTMLElement)?.innerText}</p>
                            </div>
                            <igc-message-attachments>
                            </igc-message-attachments>
                    </div>`
        );

        const attachments = messsageContainer?.querySelector(
          'igc-message-attachments'
        );
        // Check if image attachments are rendered correctly
        if (index === 0) {
          expect(attachments).shadowDom.to.equal(
            `<div class="attachments-container">
                            <igc-expansion-panel indicator-position="none" open="">
                                <div class="attachment" slot="title">
                                <div class="details">
                                    <slot name="attachment-icon">
                                    <igc-icon
                                        class="medium"
                                        collection="material"
                                        name="image"
                                    >
                                    </igc-icon>
                                    </slot>
                                    <slot name="attachment-name">
                                    <span class="file-name">
                                        img1.png
                                    </span>
                                    </slot>
                                </div>
                                <div class="actions">
                                    <slot name="attachment-actions">
                                    <igc-icon-button
                                        class="small"
                                        collection="material"
                                        name="preview"
                                        type="button"
                                        variant="flat"
                                    >
                                    </igc-icon-button>
                                    <igc-icon-button
                                        class="small"
                                        collection="material"
                                        name="more"
                                        type="button"
                                        variant="flat"
                                    >
                                    </igc-icon-button>
                                    </slot>
                                </div>
                                </div>
                                <slot name="attachment-content">
                                <img
                                    alt="img1.png"
                                    class="image-attachment"
                                    src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
                                >
                                </slot>
                            </igc-expansion-panel>
                            </div>`
          );
        }
        // Check if non-image attachments are rendered correctly
        if (index === 1) {
          expect(attachments).shadowDom.to.equal(
            `<div class="attachments-container">
                            <igc-expansion-panel indicator-position="none">
                                <div class="attachment" slot="title">
                                <div class="details">
                                    <slot name="attachment-icon">
                                    <igc-icon
                                        class="medium"
                                        collection="material"
                                        name="file"
                                    >
                                    </igc-icon>
                                    </slot>
                                    <slot name="attachment-name">
                                    <span class="file-name">
                                        img2.png
                                    </span>
                                    </slot>
                                </div>
                                <div class="actions">
                                    <slot name="attachment-actions">
                                    <igc-icon-button
                                        class="small"
                                        collection="material"
                                        name="more"
                                        type="button"
                                        variant="flat"
                                    >
                                    </igc-icon-button>
                                    </slot>
                                </div>
                                </div>
                                <slot name="attachment-content">
                                </slot>
                            </igc-expansion-panel>
                        </div>`
          );
        }
      });
    });

    it('should render suggestions', async () => {
      chat.options = {
        suggestions: ['Suggestion 1', 'Suggestion 2'],
      };
      await elementUpdated(chat);

      const suggestionsContainer = chat.shadowRoot?.querySelector(
        '.suggestions-container'
      );

      expect(suggestionsContainer).dom.to.equal(
        `<div class="suggestions-container">
                    <slot name="suggestions" part="suggestions">
                        <slot name="suggestion" part="suggestion">
                            <igc-chip>
                                <span>
                                Suggestion 1
                                </span>
                            </igc-chip>
                            </slot>
                            <slot name="suggestion" part="suggestion">
                            <igc-chip>
                                <span>
                                Suggestion 2
                                </span>
                            </igc-chip>
                        </slot>
                    </slot>
                </div>`
      );
    });

    it('should render composing indicator if `isComposing` is true', async () => {
      chat.messages = [messages[0]];
      chat.options = {
        isComposing: true,
      };
      await elementUpdated(chat);

      const messageContainer = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list');

      expect(chat.messages.length).to.equal(1);
      expect(messageContainer).dom.to.equal(
        `<div class="message-list">
                <igc-chat-message>
                </igc-chat-message>
                <div class="typing-indicator">
                    <div class="typing-dot">
                    </div>
                    <div class="typing-dot">
                    </div>
                    <div class="typing-dot">
                    </div>
                </div>
            </div>`
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
    it('should slot suggestions area', () => {});
  });

  describe('Templates', () => {
    beforeEach(async () => {
      chat.messages = [messages[1], messages[2]];
    });

    it('should render attachmentTemplate', async () => {
      chat.options = {
        templates: {
          attachmentTemplate: attachmentTemplate,
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);

      const messageElements = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const messsageContainer =
          messageElement.shadowRoot?.querySelector('.bubble');
        const attachments = messsageContainer?.querySelector(
          'igc-message-attachments'
        );
        expect(attachments).shadowDom.to.equal(
          `<div class="attachments-container">
                        <igc-chip>
                            <span>
                            ${chat.messages[index].attachments?.[0].name || ''}
                            </span>
                        </igc-chip>
                    </div>`
        );
      });
    });

    it('should render attachmentHeaderTemplate, attachmentActionsTemplate, attachmentContentTemplate', async () => {
      chat.options = {
        templates: {
          attachmentHeaderTemplate: attachmentHeaderTemplate,
          attachmentActionsTemplate: attachmentActionsTemplate,
          attachmentContentTemplate: attachmentContentTemplate,
        },
      };
      await elementUpdated(chat);
      await clock.tickAsync(500);

      const messageElements = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelectorAll('igc-chat-message');

      messageElements?.forEach((messageElement, index) => {
        const messsageContainer =
          messageElement.shadowRoot?.querySelector('.bubble');
        const attachments = messsageContainer?.querySelector(
          'igc-message-attachments'
        );

        const details = attachments?.shadowRoot?.querySelector('.details');
        expect(details).dom.to.equal(
          `<div class="details">
                        <h5>Custom ${chat.messages[index].attachments?.[0].name}</h5>
                    </div>`
        );

        const actions = attachments?.shadowRoot?.querySelector('.actions');
        expect(actions).dom.to.equal(
          `<div class="actions">
                        <igc-button type="button" variant="contained">?</igc-button>
                    </div>`
        );

        const content = attachments?.shadowRoot?.querySelector('p');
        expect(content).dom.to.equal(
          `<p>This is a template rendered as content of ${chat.messages[index].attachments?.[0].name}</p>`
        );
      });
    });

    it('should render messageTemplate', async () => {
      chat.options = {
        templates: {
          messageTemplate: messageTemplate,
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const messsageContainer =
          messageElement.shadowRoot?.querySelector('.bubble');
        expect(messsageContainer).dom.to.equal(
          `<div class="bubble">
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
        templates: {
          messageActionsTemplate: messageActionsTemplate,
        },
      };
      await elementUpdated(chat);
      await aTimeout(500);
      const messageElements = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelectorAll('igc-chat-message');
      messageElements?.forEach((messageElement, index) => {
        const messsageContainer =
          messageElement.shadowRoot?.querySelector('.bubble');
        if (index === 0) {
          expect(messsageContainer).dom.to.equal(
            `<div class="bubble">
                            <div>
                                <p>${(messsageContainer?.querySelector('p') as HTMLElement)?.innerText}</p>
                            </div>
                            <igc-message-attachments>
                            </igc-message-attachments>
                        </div>`
          );
        } else {
          expect(messsageContainer).dom.to.equal(
            `<div class="bubble">
                            <div>
                                <p>${(messsageContainer?.querySelector('p') as HTMLElement)?.innerText}</p>
                            </div>
                            <igc-message-attachments>
                            </igc-message-attachments>
                            <div style="float: right">
                                <igc-button name="regenerate" type="button" variant="flat">...</igc-button>
                            </div>
                        </div>`
          );
        }
      });
    });

    it('should render composingIndicatorTemplate', async () => {
      chat.messages = [messages[0]];
      chat.options = {
        isComposing: true,
        templates: {
          composingIndicatorTemplate: composingIndicatorTemplate,
        },
      };
      await elementUpdated(chat);
      const messageContainer = chat.shadowRoot
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list');

      expect(chat.messages.length).to.equal(1);
      expect(messageContainer).dom.to.equal(
        `<div class="message-list">
                <igc-chat-message>
                </igc-chat-message>
                <span>loading...</span>
            </div>`
      );
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

        if (sendButton && textArea) {
          textArea.setAttribute('value', 'Hello!');
          textArea.dispatchEvent(new Event('input'));
          await elementUpdated(chat);
          simulateClick(sendButton);
          await elementUpdated(chat);
          await clock.tickAsync(500);

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
        }
      });

      it('should update messages properly on suggestion chip click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        chat.options = {
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        };
        await elementUpdated(chat);

        const suggestionChips = chat.shadowRoot
          ?.querySelector('.suggestions-container')
          ?.querySelectorAll('igc-chip');

        expect(suggestionChips?.length).to.equal(2);
        if (suggestionChips) {
          simulateClick(suggestionChips[0]);
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
        }
      });

      it('should remove attachment on chip remove button click', async () => {
        const eventSpy = spy(chat, 'emitEvent');
        const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
        const fileInput = inputArea?.shadowRoot
          ?.querySelector('igc-file-input')
          ?.shadowRoot?.querySelector('input') as HTMLInputElement;
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
        const dropZone =
          inputArea?.shadowRoot?.querySelector('.input-container');

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

        if (sendButton && textArea) {
          textArea.setAttribute('value', 'Hello!');
          textArea.dispatchEvent(new Event('input'));
          await elementUpdated(chat);
          simulateFocus(textArea);
          textArea?.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Enter',
              bubbles: true,
              cancelable: true,
            })
          );
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
        }
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
        ?.querySelector('igc-chat-message-list')
        ?.shadowRoot?.querySelector('.message-list')
        ?.querySelector('igc-chat-message');

      const attachmentHeader = messageElement?.shadowRoot
        ?.querySelector('igc-message-attachments')
        ?.shadowRoot?.querySelector('igc-expansion-panel')
        ?.shadowRoot?.querySelector(`div[part='header']`) as HTMLElement;

      simulateClick(attachmentHeader);
      expect(eventSpy).calledWith('igcAttachmentClick', {
        detail: { ...messages[1].attachments[0] },
      });
    });

    it('emits igcTypingChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

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

      if (textArea) {
        simulateFocus(textArea);
        expect(eventSpy).calledWith('igcInputFocus');
      }
    });

    it('emits igcInputBlur', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      if (textArea) {
        simulateBlur(textArea);
        expect(eventSpy).calledWith('igcInputBlur');
      }
    });

    it('emits igcInputChange', async () => {
      const eventSpy = spy(chat, 'emitEvent');
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      if (textArea) {
        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(new Event('input'));
        await elementUpdated(chat);
        expect(eventSpy).calledWith('igcInputChange', {
          detail: { value: 'Hello!' },
        });
      }
    });

    it('can cancel `igcMessageCreated` event', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const sendButton = inputArea?.shadowRoot?.querySelector(
        'igc-icon-button[name="send-message"]'
      );
      const textArea = inputArea?.shadowRoot?.querySelector('igc-textarea');

      chat.addEventListener('igcMessageCreated', (event) => {
        event.preventDefault();
      });

      if (sendButton && textArea) {
        textArea.setAttribute('value', 'Hello!');
        textArea.dispatchEvent(new Event('input'));
        await elementUpdated(chat);
        simulateClick(sendButton);
        await elementUpdated(chat);
        await clock.tickAsync(500);

        expect(chat.messages.length).to.equal(0);
      }
    });

    it('can cancel `igcAttachmentChange` event', async () => {
      const inputArea = chat.shadowRoot?.querySelector('igc-chat-input');
      const fileInput = inputArea?.shadowRoot
        ?.querySelector('igc-file-input')
        ?.shadowRoot?.querySelector('input') as HTMLInputElement;

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
