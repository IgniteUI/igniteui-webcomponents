import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { GoogleGenAI, Modality } from '@google/genai';
import {
  IgcChatComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { MarkdownMessageRenderer } from 'igniteui-webcomponents/extras';
import type {
  IgcChatOptions,
  IgcMessage,
  IgcMessageAttachment,
} from '../src/components/chat/types.js';

const googleGenAIKey = import.meta.env.VITE_GOOGLE_GEN_AI_KEY;
const ai = new GoogleGenAI({
  apiKey: googleGenAIKey,
});

defineComponents(IgcChatComponent);

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
let messages: any[] = [];
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

// const draftMessage = { text: 'Hi' };

const userMessages: any[] = [];

let isResponseSent: boolean;

const _messageAuthorTemplate = (msg: any, ctx: any) => {
  return msg.sender !== 'user'
    ? html`
        <div>
          <igc-avatar
            shape="circle"
            src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            style="position: relative;"
          >
          </igc-avatar>
          <span
            style="color: #c00000; font-weight: bold; position: absolute; margin: 8px"
            >AI Assistant</span
          >
        </div>
      `
    : ctx.defaults.messageHeader(ctx);
};
const _messageActionsTemplate = (msg: any) => {
  return msg.sender !== 'user' && msg.text.trim()
    ? isResponseSent !== false
      ? html`
          <div>
            <igc-icon-button
              name="alarm"
              variant="flat"
              @click=${() => alert(`Message reacted: ${msg.text}`)}
            ></igc-icon-button>
          </div>
        `
      : html``
    : html``;
};

// const _typingIndicatorTemplate = html`<span>LOADING...</span>`;
// const _textInputTemplate = (text: string) =>
//   html`<igc-input placeholder="Type text here..." .value=${text}></igc-input>`;
// const _textAreaActionsTemplate = () =>
//   html`<igc-button @click=${handleCustomSendClick}>Send</igc-button>`;
const _textAreaAttachmentsTemplate = (attachments: IgcMessageAttachment[]) => {
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
const _customRenderer = {
  render: (m: IgcMessage) => {
    return html`<span>${m.text.toUpperCase()}</span>`;
  },
};
const _markdownRenderer = new MarkdownMessageRenderer();

const ai_chat_options = {
  headerText: 'Chat',
  inputPlaceholder: 'Type your message here...',
  suggestions: [
    'Hello',
    'What is triskaidekaphobia?',
    'Show me very short sample typescript code',
  ],
  renderers: {
    messageContent: (ctx) => _markdownRenderer.render(ctx.param),
  },
};

const chat_options: IgcChatOptions = {
  disableAutoScroll: false,
  disableInputAttachments: false,
  suggestions: ['Hello', 'Hi', 'How are you?'],
  inputPlaceholder: 'Type your message here...',
  headerText: 'Chat',
  renderers: {
    messageContent: async (ctx) => _markdownRenderer.render(ctx.param),
  },
};

function handleCustomSendClick() {
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }
  const newMessage: IgcMessage = {
    id: Date.now().toString(),
    text: chat.draftMessage.text,
    sender: 'user',
    attachments: chat.draftMessage.attachments || [],
    timestamp: new Date(),
  };
  chat.messages = [...chat.messages, newMessage];
  chat.draftMessage = { text: '', attachments: [] };
}

function handleMessageSend(e: CustomEvent) {
  const newMessage = e.detail;
  messages.push(newMessage);
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }
  chat.options = { ...chat.options, suggestions: [], isTyping: true };

  const attachments: IgcMessageAttachment[] =
    newMessage.text.includes('picture') ||
    newMessage.text.includes('image') ||
    newMessage.text.includes('file')
      ? [
          {
            id: 'random_img',
            name: 'random.png',
            url: 'https://picsum.photos/378/395',
            type: 'image',
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
      chat.options = { ...chat.options, suggestions: [], isTyping: false };
      // TODO: add attachments (if any) to the response message
    });
  }, 1000);
}

async function showResponse(chat: any, responseParts: any) {
  for (let i = 0; i < responseParts.length; i++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));

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

function fileToGenerativePart(buffer, mimeType) {
  // Convert ArrayBuffer to base64 string in the browser
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
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

async function handleAIMessageSend(e: CustomEvent) {
  const newMessage: IgcMessage = e.detail;
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }

  chat.options = { ...ai_chat_options, suggestions: [], isTyping: true };
  setTimeout(async () => {
    let response: any;
    let responseText = '';
    const attachments: IgcMessageAttachment[] = [];
    const botResponse: IgcMessage = {
      id: Date.now().toString(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
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

function handleMessageReacted(_e: CustomEvent) {
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }

  // console.log(e.detail.reaction)
}

export const Basic: Story = {
  render: () => {
    messages = initialMessages;
    return html`
      <igc-chat
        style="--igc-chat-height: calc(100vh - 32px);"
        .messages=${messages}
        .options=${chat_options}
        @igcMessageReact=${handleMessageReacted}
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

let options: any;
export const Chat_Templates: Story = {
  play: async () => {
    const chat = document.querySelector('igc-chat');
    if (chat) {
      const _actionsTemplate = (ctx) => html`
        ${ctx.defaults.fileUploadButton(ctx)}
        <igc-icon-button variant="flat">🎤</igc-icon-button>
        <div style="margin-inline-start: auto;">
          <igc-button @click=${handleCustomSendClick}>Ask</igc-button>
          <igc-icon-button variant="flat">...</igc-icon-button>
        </div>
      `;

      options = {
        headerText: 'Chat',
        inputPlaceholder: 'Type your message here...',
        suggestions: ['Hello', 'Hi', 'Generate an image!'],
        renderers: {
          messageHeader: (ctx) => _messageAuthorTemplate(ctx.param, ctx),
          messageContent: (ctx) => _markdownRenderer.render(ctx.param),
          // messageContent: (ctx) => html`${ctx.param.text.toUpperCase()}`,
          messageActions: (ctx) => _messageActionsTemplate(ctx.param),
          attachmentHeader: () => nothing,
          inputActions: (ctx) => _actionsTemplate(ctx),
          inputAttachments: (ctx) =>
            html`<span>Attachments:</span>${ctx.defaults.inputAttachments(ctx)}`,
          typingIndicator: (ctx) =>
            html`<span
              >Generating response ${ctx.defaults.typingIndicator(ctx)}</span
            >`,
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
