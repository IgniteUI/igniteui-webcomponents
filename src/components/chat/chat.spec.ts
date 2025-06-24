import { aTimeout, elementUpdated, expect, fixture } from '@open-wc/testing';
import { html } from 'lit';
import { type SinonFakeTimers, useFakeTimers } from 'sinon';
import { defineComponents } from '../common/definitions/defineComponents.js';
import { simulateClick, simulateFocus } from '../common/utils.spec.js';
import IgcChatComponent from './chat.js';

describe('Chat', () => {
  before(() => {
    defineComponents(IgcChatComponent);
  });

  const createChatComponent = () => html`<igc-chat></igc-chat>`;
  const messageActionsTemplate = (msg: any) => {
    return msg.sender !== 'user' && msg.text.trim()
      ? html`<div style="float: right">
          <igc-button name="regenerate" variant="flat">...</igc-button>
        </div> `
      : html``;
  };

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
        messageContainer?.querySelector('igc-chat-message')
      ).shadowDom.to.equal(
        `<div class="message-container ">
                    <div class="bubble">
                        <div>
                            <p>Hello! How can I help you today?</p>
                        </div>
                    </div>
                </div>`
      );
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
  });

  describe('Interactions', () => {
    describe('Click', () => {
      it('should update messages properly on send button click', async () => {
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
          expect(chat.messages.length).to.equal(1);
          expect(chat.messages[0].text).to.equal('Hello!');
          expect(chat.messages[0].sender).to.equal('user');
        }
      });
      it('should remove attachement on chip remove button click', () => {});
    });

    describe('Drag &Drop', () => {
      it('should be able to drop files base on the types listed in `acceptedFiles`', () => {});
    });

    describe('Keyboard', () => {
      it('should update messages properly on `Enter` keypress when the textarea is focused', async () => {
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
          expect(chat.messages.length).to.equal(1);
          expect(chat.messages[0].text).to.equal('Hello!');
          expect(chat.messages[0].sender).to.equal('user');
        }
      });
    });
  });

  describe('Events', () => {
    it('emits igcMessageCreated', async () => {});
    it('emits igcAttachmentClick', async () => {});
    it('emits igcAttachmentChange', async () => {});
    it('emits igcTypingChange', async () => {});
    it('emits igcInputFocus', async () => {});
    it('emits igcInputBlur', async () => {});
    it('emits igcInputChange', async () => {});
  });
});
