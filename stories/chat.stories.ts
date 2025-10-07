import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import {
  IgcAvatarComponent,
  IgcChatComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { createMarkdownRenderer } from 'igniteui-webcomponents/extras';
import type {
  ChatRenderContext,
  IgcChatOptions,
  IgcChatMessage,
  IgcChatMessageAttachment,
  ChatMessageRenderContext,
} from 'igniteui-webcomponents';

defineComponents(IgcChatComponent, IgcAvatarComponent);

// region default
const metadata: Meta<IgcChatComponent> = {
  title: 'Chat',
  component: 'igc-chat',
  parameters: {
    docs: {
      description: {
        component:
          'A chat UI component for displaying messages, attachments, and input interaction.',
      },
    },
    actions: {
      handles: [
        'igcMessageCreated',
        'igcMessageReact',
        'igcAttachmentClick',
        'igcAttachmentAdded',
        'igcAttachmentRemoved',
        'igcAttachmentDrag',
        'igcAttachmentDrop',
        'igcTypingChange',
        'igcInputFocus',
        'igcInputBlur',
        'igcInputChange',
      ],
    },
  },
};

export default metadata;

type Story = StoryObj;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

registerIcon(
  'alarm',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_alarm_24px.svg'
);
let messages: IgcChatMessage[] = [];
const initialMessages: any[] = [
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
        url: 'https://www.infragistics.com/angular-demos-lob/assets/images/card/media/yosemite.jpg',
        type: 'image',
      },
    ],
  },
  {
    id: 'message-3', // Example message with markdown
    text: `Here is some sample typescript code:

\`\`\`ts
import 'igniteui-webcomponents/themes/light/bootstrap.css';
\`\`\`

And some sample html:

\`\`\`html
<igc-avatar initials="AZ"></igc-avatar>
<igc-badge></igc-badge>
\`\`\``,
    sender: 'bot',
    attachments: [],
    timestamp: new Date(),
  },
];

const _messageAuthorTemplate = ({ message }: ChatMessageRenderContext) => {
  return message.sender !== 'user'
    ? html`
        <div style="display: flex; align-items: center; gap: 8px;">
          <igc-avatar
            shape="circle"
            src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            style="position: relative;"
          >
          </igc-avatar>
          <span style="color: #c00000; font-weight: bold;">AI Assistant</span>
        </div>
      `
    : nothing;
};
const _messageActionsTemplate = ({ message }: ChatMessageRenderContext) => {
  return message.sender !== 'user' && message.text.trim()
    ? html`
        <div>
          <igc-icon-button
            name="alarm"
            variant="flat"
            @click=${() => alert(`Message reacted: ${message.text}`)}
          ></igc-icon-button>
        </div>
      `
    : nothing;
};
const _markdownRenderer = await createMarkdownRenderer();

const chat_options: IgcChatOptions = {
  disableAutoScroll: false,
  disableInputAttachments: false,
  suggestions: ['Hello', 'Hi', 'How are you?'],
  inputPlaceholder: 'Type your message here...',
  headerText: 'Chat',
  renderers: {
    messageContent: async ({ message }) => _markdownRenderer(message),
  },
};

function handleCustomSendClick(chat: IgcChatComponent) {
  const now = Date.now.toString();
  const newMessage: IgcChatMessage = {
    id: now,
    text: chat.draftMessage.text,
    sender: 'user',
    attachments: chat.draftMessage.attachments || [],
    timestamp: now,
  };
  chat.messages = [...chat.messages, newMessage];
  chat.draftMessage = { text: '', attachments: [] };
}

async function handleMessageSend(event: CustomEvent<IgcChatMessage>) {
  const chat = event.target as IgcChatComponent;
  const message = event.detail;

  chat.options = { ...chat.options, suggestions: [], isTyping: true };

  const attachments: IgcChatMessageAttachment[] =
    message.text.includes('picture') ||
    message.text.includes('image') ||
    message.text.includes('file')
      ? [
          {
            id: 'random_img',
            name: 'random.png',
            url: 'https://picsum.photos/378/395',
            type: 'image',
          },
        ]
      : [];

  await new Promise((resolve) => setTimeout(resolve, 1000));

  chat.options = { ...chat.options, isTyping: false };

  const responseText = generateAIResponse(message.text).split(' ');

  const aiResponse = {
    id: Date.now().toString(),
    sender: 'bot',
    text: '',
    attachments,
  };

  chat.messages = [...chat.messages, aiResponse];

  for (const part of responseText) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const updated = [...chat.messages];
    const currentMessage = updated[updated.length - 1];
    const updatedMessage = {
      ...aiResponse,
      text: `${currentMessage.text} ${part}`,
    };
    updated[updated.length - 1] = updatedMessage;
    chat.messages = updated;
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
  if (lowerMessage.includes('feature')) {
    return "As a demo AI, I can simulate conversations, display markdown formatting like **bold** and `code`, and adapt to light and dark themes. I'm built with Lit as a web component that can be integrated into any application.";
  }
  if (lowerMessage.includes('weather')) {
    return "I'm sorry, I don't have access to real-time weather data. This is just a demonstration of a chat interface.";
  }
  if (lowerMessage.includes('thank')) {
    return "You're welcome! Let me know if you need anything else.";
  }
  if (lowerMessage.includes('code')) {
    return `Here's an example of code formatting:
  \`\`\`javascript
  function greet(name) {
    return \`Hello, \${name}!\`;
  }
  console.log(greet('world'));
  \`\`\``;
  }
  if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
    return "Here's an image!";
  }
  if (lowerMessage.includes('list')) {
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

  return 'How can I help? Possible commands: hello, help, feature, weather, thank, code, image, list, heading.';
}

export const Basic: Story = {
  render: () => {
    messages = initialMessages;
    return html`
      <igc-chat
        style="--igc-chat-height: calc(100vh - 32px);"
        .messages=${messages}
        .options=${chat_options}
        @igcMessageCreated=${handleMessageSend}
      >
      </igc-chat>
    `;
  },
};

let options: IgcChatOptions;
export const Chat_Templates: Story = {
  play: async () => {
    const chat = document.querySelector('igc-chat');
    if (chat) {
      const _actionsStartTemplate = () => html`
        <igc-icon-button variant="flat">🎤</igc-icon-button>
      `;
      const _actionsEndTemplate = (ctx: ChatRenderContext) => html`
        <div>
          <igc-button @click=${() => handleCustomSendClick(ctx.instance)}
            >Ask</igc-button
          >
          <igc-icon-button variant="flat" name="more_horiz"></igc-icon-button>
        </div>
      `;

      options = {
        headerText: 'Chat',
        inputPlaceholder: 'Type your message here...',
        suggestions: ['Hello', 'Hi', 'Generate an image!'],
        renderers: {
          messageHeader: _messageAuthorTemplate,
          messageContent: ({ message }) => _markdownRenderer(message),
          messageActions: _messageActionsTemplate,
          attachmentHeader: () => nothing,
          inputActionsStart: _actionsStartTemplate,
          inputActionsEnd: _actionsEndTemplate,
          sendButton: () => nothing,
          typingIndicator: () => html`<span>Generating response</span>`,
          suggestionPrefix: () => '✨',
        },
      };
      chat.options = { ...options };
    }
  },
  render: () => {
    messages = [];
    return html`
      <igc-chat
        style="--igc-chat-height: calc(100vh - 32px);"
        .messages=${messages}
        .options=${options}
        @igcMessageCreated=${handleMessageSend}
      >
        <igc-icon-button
          variant="flat"
          slot="prefix"
          name="home"
        ></igc-icon-button>
        <igc-button slot="actions" variant="outlined">New Chat</igc-button>
        <igc-icon-button
          slot="actions"
          variant="flat"
          name="search"
        ></igc-icon-button>
        <div slot="suggestions-header">Get Inspired</div>
      </igc-chat>
    `;
  },
};
