import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { GoogleGenAI, Modality } from '@google/genai';
// import { createClient } from '@supabase/supabase-js';
import {
  IgcChatComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import type {
  IgcMessage,
  IgcMessageAttachment,
} from '../src/components/chat/types.js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = ''; // createClient(supabaseUrl, supabaseKey);

const ai = new GoogleGenAI({
  apiKey: 'googleGenAIKey',
});

defineComponents(IgcChatComponent);

// region default
const metadata: Meta<IgcChatComponent> = {
  title: 'Chat',
  component: 'igc-chat',
  parameters: { docs: { description: { component: '' } } },
};

export default metadata;

type Story = StoryObj;

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
];

const draftMessage = { text: 'Hi' };

const userMessages: any[] = [];

let isResponseSent: boolean;

const _messageActionsTemplate = (msg: any) => {
  return msg.sender !== 'user' && msg.text.trim()
    ? isResponseSent !== false
      ? html`
          <div style="float: right">
            <igc-icon-button
              name="thumb_up"
              collection="material"
              variant="flat"
              @click=${() => alert(`Liked message: ${msg.text}`)}
            ></igc-icon-button>
            <igc-icon-button
              name="thumb_down"
              variant="flat"
              collection="material"
              @click=${() => alert(`Disliked message: ${msg.text}`)}
            ></igc-icon-button>
            <igc-icon-button
              name="regenerate"
              variant="flat"
              collection="material"
              @click=${() =>
                alert(`Response should be re-generated: ${msg.text}`)}
            ></igc-icon-button>
          </div>
        `
      : html``
    : html``;
};

const _composingIndicatorTemplate = html`<span>LOADING...</span>`;
const _textInputTemplate = (text: string) =>
  html`<igc-input placeholder="Type text here..." .value=${text}></igc-input>`;
const _textAreaActionsTemplate = html`<igc-button
  @click=${handleCustomSendClick}
  >Send</igc-button
>`;
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
const _customRenderer = (text: string) =>
  html`<span>${text.toUpperCase()}</span>`;

const ai_chat_options = {
  headerText: 'Chat',
  inputPlaceholder: 'Type your message here...',
  suggestions: ['Hello', 'Hi', 'Generate an image of a pig!'],
  templates: {
    // messageActionsTemplate: messageActionsTemplate,
    //composingIndicatorTemplate: _composingIndicatorTemplate,
    // textInputTemplate: _textInputTemplate,
    // textAreaActionsTemplate: _textAreaActionsTemplate,
    // textAreaAttachmentsTemplate: _textAreaAttachmentsTemplate,
  },
  // markdownRenderer: _customRenderer
};

const chat_options = {
  disableAutoScroll: false,
  disableAttachments: false,
  suggestions: ['Hello', 'Hi', 'How are you?'],
  inputPlaceholder: 'Type your message here...',
  headerText: 'Chat',
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
      // TODO: add attachments (if any) to the response message
    });
  }, 1000);
}

// load messages and attachments from supabase
async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, text, sender, timestamp, attachments (id, name, type)')
    .order('timestamp', { ascending: true });

  if (error) {
    // console.log('Error fetching messages:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return messages;
  }

  const mappedData = data.map((message) => ({
    id: message.id,
    text: message.text,
    sender: message.sender,
    timestamp: new Date(message.timestamp),
    attachments: message.attachments.map((attachment: any) => ({
      id: attachment.id,
      name: attachment.name,
      type: attachment.type,
      url: supabase.storage.from('files').getPublicUrl(attachment.name).data
        .publicUrl,
    })),
  }));
  await processMappedData(mappedData);
  return mappedData;
}

async function processMappedData(data: any) {
  for (const message of data) {
    for (const attachment of message.attachments) {
      if (attachment.type.startsWith('image')) {
        const file = await fetchAttachment(attachment.name);
        if (file) {
          attachment.file = file;
        }
      } else {
        attachment.file = new File([], attachment.name, {
          type: attachment.type,
        });
      }
    }
  }
  return data;
}

async function fetchAttachment(name: string) {
  const { data, error } = await supabase.storage.from('files').download(name);

  if (error) {
    // console.log('Error fetching attachment:', error);
    return null;
  }

  const file = new File([data], name, {
    type: data.type,
  });

  return file;
}

async function handleMessageCreatedSupabase(e: CustomEvent) {
  const newMessage = e.detail;
  const chat = document.querySelector('igc-chat');
  if (!chat) {
    return;
  }

  saveMessageToSupabase(newMessage);

  const attachments: IgcMessageAttachment[] = [];
  // newMessage.text.includes('picture') ||
  // newMessage.text.includes('image') ||
  // newMessage.text.includes('file')
  //   ? [
  //       {
  //         id: 'random_img',
  //         // type: newMessage.text.includes('file') ? 'file' : 'image',
  //         url: 'https://picsum.photos/378/395',
  //         name: 'random.png',
  //       },
  //     ]
  //   : [];

  isResponseSent = false;
  setTimeout(() => {
    // create empty response
    const emptyResponse = {
      id: Date.now().toString(),
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      attachments: attachments,
    };
    chat.messages = [...chat.messages, emptyResponse];

    const responseParts = generateAIResponse(e.detail.text).split(' ');
    showResponse(chat, responseParts).then(() => {
      const lastMessageIndex = chat.messages.length - 1;
      const lastMessage = chat.messages[lastMessageIndex];
      lastMessage.attachments = attachments;
      saveMessageToSupabase(lastMessage);
      isResponseSent = true;
      // TODO: add attachments (if any) to the response message
    });
  }, 1000);
}

async function saveMessageToSupabase(message: any) {
  const { error } = await supabase
    .from('messages')
    .insert([
      {
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
      },
    ])
    .select();
  if (error) {
    // console.log('Error saving message:', error);
  }

  // save attachments to supabase storage
  if (message.attachments) {
    message.attachments.forEach(async (attachment: IgcMessageAttachment) => {
      if (!attachment.file) {
        return;
      }

      const { error } = await supabase.storage
        .from('files')
        .upload(attachment.file.name, attachment.file, {
          cacheControl: '3600',
          upsert: true,
        });
      if (error) {
        // console.log('Error saving attachment:', error);
      }

      // save attachment metadata to database
      const { error: attachmentError } = await supabase
        .from('attachments')
        .insert([
          {
            id: attachment.id,
            message_id: message.id,
            name: attachment.file.name,
            type: attachment.file.type,
          },
        ])
        .select();
      if (attachmentError) {
        // console.log('Error saving attachment to table "attachments":', attachmentError);
      }
    });
  }

  return message;
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

  chat.options = { ...ai_chat_options, suggestions: [], isComposing: true };
  setTimeout(async () => {
    chat.options = { ...ai_chat_options, suggestions: [], isComposing: false };
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
      chat.messages = [...chat.messages, botResponse];
    } else {
      chat.messages = [...chat.messages, botResponse];
      response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
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
      chat.options = { ...ai_chat_options, suggestions: ['Thank you!'] };
    }
  }, 2000);
}

export const Basic: Story = {
  render: () => html`
    <igc-chat
      .messages=${messages}
      .options=${chat_options}
      @igcMessageCreated=${handleMessageSend}
    >
    </igc-chat>
  `,
};

export const Supabase: Story = {
  play: async () => {
    fetchMessages().then((msgs) => {
      messages = msgs;
      const chat = document.querySelector('igc-chat');
      if (chat) {
        chat.messages = messages;
      }
    });
  },
  render: () => html`
    <igc-chat @igcMessageCreated=${handleMessageCreatedSupabase}> </igc-chat>
  `,
};

export const AI: Story = {
  render: () => html`
    <igc-chat
      .draftMessage=${draftMessage}
      .options=${ai_chat_options}
      @igcMessageCreated=${handleAIMessageSend}
    >
    </igc-chat>
  `,
};
