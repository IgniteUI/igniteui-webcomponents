import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { GoogleGenAI, Modality } from '@google/genai';
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
  IgcMessage,
  IgcMessageAttachment,
  ChatMessageRenderContext,
} from '../src/components/chat/types.js';

const googleGenAIKey = import.meta.env.VITE_GOOGLE_GEN_AI_KEY;
const ai = new GoogleGenAI({
  apiKey: googleGenAIKey,
});

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
        'igcAttachmentChange',
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
let messages: IgcMessage[] = [];
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

const userMessages: any[] = [];

let isResponseSent: boolean;

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
  return message.sender !== 'user' && message.text.trim() && isResponseSent
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

const ai_chat_options: IgcChatOptions = {
  headerText: 'Chat',
  inputPlaceholder: 'Type your message here...',
  suggestions: [
    'Hello',
    'What is triskaidekaphobia?',
    'Show me very short sample typescript code',
  ],
  renderers: {
    messageContent: async ({ message }) => _markdownRenderer(message),
  },
};

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
  const newMessage: IgcMessage = {
    id: now,
    text: chat.draftMessage.text,
    sender: 'user',
    attachments: chat.draftMessage.attachments || [],
    timestamp: now,
  };
  chat.messages = [...chat.messages, newMessage];
  chat.draftMessage = { text: '', attachments: [] };
}

function handleMessageSend(event: CustomEvent<IgcMessage>): void {
  const chat = event.target as IgcChatComponent;
  const message = event.detail;

  chat.options = { ...chat.options, suggestions: [], isTyping: true };

  const attachments: IgcMessageAttachment[] =
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

  isResponseSent = false;
  setTimeout(async () => {
    chat.addMessage({ sender: 'bot', attachments });

    await showResponse(chat, generateAIResponse(message.text).split(' '));

    messages = chat.messages;
    isResponseSent = true;
    chat.options = { ...chat.options, suggestions: [], isTyping: false };
    // TODO: add attachments (if any) to the response message
  }, 1000);
}

async function showResponse(chat: IgcChatComponent, responseParts: string[]) {
  const lastMessage = chat.messages[chat.messages.length - 1];

  for (const part of responseParts) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
    chat.updateMessage(
      lastMessage,
      { text: `${lastMessage.text} ${part}` },
      true
    );
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

function fileToGenerativePart(buffer: ArrayBuffer, mimeType: string) {
  const bytes = new Uint8Array(buffer);

  if ('toBase64' in bytes) {
    return {
      inlineData: {
        data: (bytes as any).toBase64() as string,
        mimeType,
      },
    };
  }

  // Fallback for browsers which don't support `toBase64`

  let binary = '';
  const length = bytes.byteLength;

  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64String = btoa(binary);

  return {
    inlineData: {
      data: base64String,
      mimeType,
    },
  };
}

async function handleAIMessageSend(event: CustomEvent<IgcMessage>) {
  const chat = event.target as IgcChatComponent;
  const newMessage: IgcMessage = event.detail;

  chat.options = { ...ai_chat_options, suggestions: [], isTyping: true };
  setTimeout(async () => {
    const now = Date.now().toString();
    let response: any;
    let responseText = '';
    const attachments: IgcMessageAttachment[] = [];
    const botResponse: IgcMessage = {
      id: now,
      text: responseText,
      sender: 'bot',
      timestamp: now,
    };

    userMessages.push({
      role: 'user',
      parts: [{ text: newMessage.text }],
    });

    if (newMessage.attachments && newMessage.attachments.length > 0) {
      for (const attachment of newMessage.attachments) {
        if (attachment.file) {
          const filePart = fileToGenerativePart(
            await attachment.file.arrayBuffer(),
            attachment.file.type
          );
          userMessages.push({ role: 'user', parts: [filePart] });
        }
      }
    }

    if (newMessage.text.includes('image')) {
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: userMessages,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      for (const part of response?.candidates?.[0]?.content?.parts || []) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
          responseText = part.text;
        } else if (part.inlineData) {
          const _imageData = part.inlineData.data;
          const byteCharacters = atob(_imageData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const type = part.inlineData.type || 'image/png';
          const blob = new Blob([byteArray], { type: type });
          const file = new File([blob], 'generated_image.png', {
            type: type,
          });
          const attachment: IgcMessageAttachment = {
            id: Date.now().toString(),
            name: 'generated_image.png',
            type: 'image',
            url: URL.createObjectURL(file),
            file: file,
          };
          attachments.push(attachment);
        }
      }

      botResponse.text = responseText;
      botResponse.attachments = attachments;
      chat.options = { ...ai_chat_options, isTyping: false };
      chat.messages = [...chat.messages, botResponse];
    } else {
      chat.messages = [...chat.messages, botResponse];
      response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: userMessages,
        config: {
          responseModalities: [Modality.TEXT],
        },
      });

      const lastMessageIndex = chat.messages.length - 1;
      for await (const chunk of response) {
        chat.messages[lastMessageIndex] = {
          ...chat.messages[lastMessageIndex],
          text: `${chat.messages[lastMessageIndex].text}${chunk.text}`,
        };
        chat.messages = [...chat.messages];
      }
      chat.options = { ...ai_chat_options, suggestions: [], isTyping: false };

      const messagesForSuggestions = [
        ...chat.messages,
        `Based on all my previous prompts give me 3 strings that would act like a suggestions for my next prompt. Don't repeat my previous prompts, I want just the suggestions in the format "suggestion1: ***...***, suggestion2: ***...***, suggestion3: ***...***`,
      ];
      const responseWithSuggestions = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: messagesForSuggestions,
        config: {
          responseModalities: [Modality.TEXT],
        },
      });
      response = responseWithSuggestions?.candidates?.[0]?.content?.parts;
      if (response && response.length === 1) {
        const responseText = response[0]?.text ?? '';
        const regex: RegExp = /\*\*\*(.*?)\*\*\*/g; // suggestions between  *** and ***
        const matches: IterableIterator<RegExpMatchArray> =
          responseText.matchAll(regex);

        const suggestionsFromResponse: string[] = Array.from(
          matches,
          (match: RegExpMatchArray) => match[1]
        );

        chat.options = {
          ...ai_chat_options,
          suggestions: suggestionsFromResponse,
        };
      }
    }
  }, 2000);
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

export const AI: Story = {
  render: () => html`
    <igc-chat
      style="--igc-chat-height: calc(100vh - 32px);"
      .options=${ai_chat_options}
      @igcMessageCreated=${handleAIMessageSend}
    >
    </igc-chat>
  `,
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
