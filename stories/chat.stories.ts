import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcChatComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import type {
  AttachmentTemplate,
  IgcMessageAttachment,
  MessageActionsTemplate,
} from '../src/components/chat/types.js';

defineComponents(IgcChatComponent);

// region default
const metadata: Meta<IgcChatComponent> = {
  title: 'Chat',
  component: 'igc-chat',
  parameters: { docs: { description: { component: '' } } },
  argTypes: {
    hideAvatar: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideUserName: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableAutoScroll: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableAttachments: {
      type: 'boolean',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    headerText: {
      type: 'string',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    attachmentTemplate: {
      type: 'AttachmentTemplate',
      control: 'AttachmentTemplate',
    },
    attachmentHeaderTemplate: {
      type: 'AttachmentTemplate',
      control: 'AttachmentTemplate',
    },
    attachmentActionsTemplate: {
      type: 'AttachmentTemplate',
      control: 'AttachmentTemplate',
    },
    attachmentContentTemplate: {
      type: 'AttachmentTemplate',
      control: 'AttachmentTemplate',
    },
    messageActionsTemplate: {
      type: 'MessageActionsTemplate',
      control: 'MessageActionsTemplate',
    },
  },
  args: {
    hideAvatar: false,
    hideUserName: false,
    disableAutoScroll: false,
    disableAttachments: false,
    headerText: '',
  },
};

export default metadata;

interface IgcChatArgs {
  hideAvatar: boolean;
  hideUserName: boolean;
  disableAutoScroll: boolean;
  disableAttachments: boolean;
  headerText: string;
  attachmentTemplate: AttachmentTemplate;
  attachmentHeaderTemplate: AttachmentTemplate;
  attachmentActionsTemplate: AttachmentTemplate;
  attachmentContentTemplate: AttachmentTemplate;
  messageActionsTemplate: MessageActionsTemplate;
}
type Story = StoryObj<IgcChatArgs>;

// endregion

const thumbUpIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>';
const thumbDownIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>';
const regenerateIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>';

registerIconFromText('thumb_up', thumbUpIcon, 'material');
registerIconFromText('thumb_down', thumbDownIcon, 'material');
registerIconFromText('regenerate', regenerateIcon, 'material');

let messages: any[] = [
  {
    id: '1',
    text: "Hello! I'm an AI assistant created with Lit. How can I help you today?",
    sender: 'bot',
    timestamp: new Date(),
  },
];

let isResponseSent = false;

function handleMessageSend(e: CustomEvent) {
  const newMessage = e.detail;
  messages.push(newMessage);
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }

  const attachments: IgcMessageAttachment[] =
    newMessage.text.includes('picture') ||
    newMessage.text.includes('image') ||
    newMessage.text.includes('file')
      ? [
          {
            id: 'random_img',
            type: newMessage.text.includes('file') ? 'file' : 'image',
            url: 'https://picsum.photos/378/395',
            name: 'random.png',
          },
        ]
      : [];

  // create empty response
  const emptyResponse = {
    id: Date.now().toString(),
    text: '',
    sender: 'bot',
    timestamp: new Date(),
    attachments: attachments,
  };
  chat.messages = [...messages, emptyResponse];

  isResponseSent = false;
  setTimeout(() => {
    const responseParts = generateAIResponse(e.detail.text).split(' ');
    showResponse(chat, responseParts).then(() => {
      messages = chat.messages;
      isResponseSent = true;
      // TODO: add attachments (if any) to the response message
    });
  }, 1000);
}

async function showResponse(chat: any, responseParts: any) {
  for (let i = 0; i < responseParts.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const lastMessageIndex = chat.messages.length - 1;
    chat.messages[lastMessageIndex] = {
      ...chat.messages[lastMessageIndex],
      text: `${chat.messages[lastMessageIndex].text} ${responseParts[i]}`,
    };

    chat.messages = [...chat.messages];
  }
}

function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Hello there! How can I assist you today?';
  }
  if (lowerMessage.includes('help')) {
    return "I'm here to help! What would you like to know about?";
  }
  if (lowerMessage.includes('feature') || lowerMessage.includes('can you')) {
    return "As a demo AI, I can simulate conversations, display markdown formatting like **bold** and `code`, and adapt to light and dark themes. I'm built with Lit as a web component that can be integrated into any application.";
  }
  if (lowerMessage.includes('weather')) {
    return "I'm sorry, I don't have access to real-time weather data. This is just a demonstration of a chat interface.";
  }
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Let me know if you need anything else.";
  }
  if (lowerMessage.includes('code') || lowerMessage.includes('example')) {
    return "Here's an example of code formatting:\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('world'));\n```";
  }
  if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
    return "Here's an image!";
  }
  if (lowerMessage.includes('list') || lowerMessage.includes('items')) {
    return "Here's an example of a list:\n\n- First item\n- Second item\n- Third item with **bold text**";
  }
  if (lowerMessage.includes('heading') || lowerMessage.includes('headings')) {
    return `Here's how you can use different headings in Markdown:

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`;
  }

  return 'Thanks for your message. This is a demonstration of a chat interface built with Lit components. Feel free to ask about features or try different types of messages!';
}

export const Basic: Story = {
  render: (args) => html`
    <igc-chat
      .messages=${messages}
      .headerText=${args.headerText}
      .disableAutoScroll=${args.disableAutoScroll}
      .disableAttachments=${args.disableAttachments}
      .hideAvatar=${args.hideAvatar}
      .hideUserName=${args.hideUserName}
      @igcMessageSend=${handleMessageSend}
      .messageActionsTemplate=${(msg) =>
        msg.sender === 'bot' && msg.text.trim()
          ? isResponseSent
            ? html`
                <div>
                  <igc-icon-button
                    name="thumb_up"
                    collection="material"
                    variant="flat"
                    @click=${() => alert(`Liked·message:·${msg.text}`)}
                  ></igc-icon-button>
                  <igc-icon-button
                    name="thumb_down"
                    variant="flat"
                    collection="material"
                    @click=${() => alert(`Disliked·message:·${msg.text}`)}
                  ></igc-icon-button>
                  <igc-icon-button
                    name="regenerate"
                    variant="flat"
                    collection="material"
                    @click=${() =>
                      alert(`Response·should·be·re-generated:·${msg.text}`)}
                  ></igc-icon-button>
                </div>
              `
            : ''
          : ''}
    >
    </igc-chat>
  `,
};
