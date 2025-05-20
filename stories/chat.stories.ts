import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcChatComponent, defineComponents } from 'igniteui-webcomponents';
import type { IgcMessageAttachment } from '../src/components/chat/types.js';

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
}
type Story = StoryObj<IgcChatArgs>;

// endregion

let messages: any[] = [
  {
    id: '1',
    text: "Hello! I'm an AI assistant created with Lit. How can I help you today?",
    isResponse: true,
    timestamp: new Date(),
  },
];

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
    isResponse: true,
    timestamp: new Date(),
    attachments: attachments,
  };
  chat.messages = [...messages, emptyResponse];

  setTimeout(() => {
    const responseParts = generateAIResponse(e.detail.text).split(' ');
    showResponse(chat, responseParts).then(() => {
      messages = chat.messages;
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
    >
    </igc-chat>
  `,
};
