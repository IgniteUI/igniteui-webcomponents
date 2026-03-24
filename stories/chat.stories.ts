import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcChatComponent,
  IgcIconButtonComponent,
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

defineComponents(
  IgcChatComponent,
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcIconButtonComponent
);

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
  'thumb_up',
  'https://unpkg.com/material-design-icons@3.0.1/social/svg/production/ic_thumb_up_24px.svg'
);

const _markdownRenderer = await createMarkdownRenderer();

// #region Support chat scenario

const supportMessages: IgcChatMessage[] = [
  {
    id: '1',
    sender: 'agent',
    timestamp: new Date(Date.now() - 600_000).toISOString(),
    text: 'Hi there! 👋 Welcome to the **IgniteUI Web Components** support chat. Ask me anything about installation, available components, theming, or API usage!',
  },
  {
    id: '2',
    sender: 'user',
    timestamp: new Date(Date.now() - 540_000).toISOString(),
    text: 'How do I install the library?',
  },
  {
    id: '3',
    sender: 'agent',
    timestamp: new Date(Date.now() - 480_000).toISOString(),
    text: `Installing **IgniteUI Web Components** takes just a few seconds.

**1. Install via npm**
\`\`\`bash
npm install igniteui-webcomponents
\`\`\`

**2. Import a theme** (pick one)
\`\`\`ts
import 'igniteui-webcomponents/themes/light/bootstrap.css';
// or: fluent.css | indigo.css | material.css
\`\`\`

**3. Register and use components**
\`\`\`ts
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);
\`\`\`

\`\`\`html
<igc-button variant="contained">Click me</igc-button>
\`\`\`

That's it! Let me know what you'd like to build.`,
  },
  {
    id: '4',
    sender: 'user',
    timestamp: new Date(Date.now() - 300_000).toISOString(),
    text: 'Great, what components are available?',
  },
  {
    id: '5',
    sender: 'agent',
    timestamp: new Date(Date.now() - 240_000).toISOString(),
    text: `The library ships **50+ components** across several categories:

| Category | Components |
|---|---|
| **Inputs** | Button, Checkbox, Switch, Radio, Input, Textarea, Select, Combo, Date Picker, Rating |
| **Layout** | Card, Accordion, Expansion Panel, Splitter, Tile Manager |
| **Navigation** | Navbar, Nav Drawer, Tabs, Stepper |
| **Grids** | Tree, List |
| **Notifications** | Badge, Banner, Snackbar, Toast, Dialog |
| **Data Display** | Avatar, Chip, Divider, Icon, Linear/Circular Progress |
| **Scheduling** | Calendar, Date Range Picker |
| **Overlays** | Dropdown, Tooltip |

You can register only the components you need — no extra bundle cost for unused ones. 🚀`,
  },
];

async function handleMessageSend(event: CustomEvent<IgcChatMessage>) {
  const chat = event.target as IgcChatComponent;
  const message = event.detail;
  const lower = message.text.toLowerCase();

  chat.options = { ...chat.options, suggestions: [], isTyping: true };

  const attachments: IgcChatMessageAttachment[] =
    lower.includes('picture') ||
    lower.includes('image') ||
    lower.includes('screenshot')
      ? [
          {
            id: `img-${Date.now()}`,
            name: 'result.png',
            url: 'https://picsum.photos/400/280',
            type: 'image',
          },
        ]
      : [];

  await new Promise((resolve) => setTimeout(resolve, 1000));
  chat.options = { ...chat.options, isTyping: false };

  const responseWords = generateAgentResponse(lower).split(' ');
  const aiResponse: IgcChatMessage = {
    id: Date.now().toString(),
    sender: 'agent',
    text: '',
    attachments,
  };

  chat.messages = [...chat.messages, aiResponse];

  for (const word of responseWords) {
    await new Promise((resolve) => setTimeout(resolve, 35));
    const updated = [...chat.messages];
    const last = updated[updated.length - 1];
    updated[updated.length - 1] = {
      ...last,
      text: `${last.text} ${word}`.trimStart(),
    };
    chat.messages = updated;
  }
}

function generateAgentResponse(lower: string): string {
  if (
    lower.includes('hello') ||
    lower.includes('hi') ||
    lower.includes('hey')
  ) {
    return "Hello! Great to hear from you. What can I help you with today? Try asking about installation, theming, available components, or a specific component's API.";
  }
  if (
    lower.includes('install') ||
    lower.includes('npm') ||
    lower.includes('yarn') ||
    lower.includes('package')
  ) {
    return `Install the library with your preferred package manager:

\`\`\`bash
npm install igniteui-webcomponents
# or
yarn add igniteui-webcomponents
# or
pnpm add igniteui-webcomponents
\`\`\`

Then import a theme and register components:

\`\`\`ts
// 1. Pick a theme
import 'igniteui-webcomponents/themes/light/bootstrap.css';

// 2. Register only what you use
import { defineComponents, IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';
defineComponents(IgcButtonComponent, IgcInputComponent);
\`\`\`

> **Tip:** each component auto-registers its own dependencies, so you only need to list top-level components.`;
  }
  if (
    lower.includes('theme') ||
    lower.includes('css') ||
    lower.includes('style') ||
    lower.includes('dark') ||
    lower.includes('light')
  ) {
    return `The library ships **four themes** in both light and dark variants:

\`\`\`ts
// Light variants
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents/themes/light/fluent.css';
import 'igniteui-webcomponents/themes/light/indigo.css';
import 'igniteui-webcomponents/themes/light/material.css';

// Dark variants
import 'igniteui-webcomponents/themes/dark/bootstrap.css';
import 'igniteui-webcomponents/themes/dark/fluent.css';
// ...
\`\`\`

You can also scope a theme to a subtree using the \`<igc-theme-provider>\` component:

\`\`\`html
<igc-theme-provider theme="fluent-dark">
  <!-- everything inside uses Fluent dark -->
</igc-theme-provider>
\`\`\``;
  }
  if (
    lower.includes('component') ||
    lower.includes('available') ||
    lower.includes('list') ||
    lower.includes('what')
  ) {
    return `Here's a quick overview of the **50+ components** available:

- **Inputs:** \`igc-button\`, \`igc-checkbox\`, \`igc-switch\`, \`igc-radio\`, \`igc-input\`, \`igc-textarea\`, \`igc-select\`, \`igc-combo\`, \`igc-date-picker\`, \`igc-rating\`
- **Layout:** \`igc-card\`, \`igc-accordion\`, \`igc-expansion-panel\`, \`igc-splitter\`, \`igc-tile-manager\`
- **Navigation:** \`igc-navbar\`, \`igc-nav-drawer\`, \`igc-tabs\`, \`igc-stepper\`
- **Notifications:** \`igc-badge\`, \`igc-banner\`, \`igc-snackbar\`, \`igc-toast\`, \`igc-dialog\`
- **Data Display:** \`igc-avatar\`, \`igc-chip\`, \`igc-divider\`, \`igc-icon\`, \`igc-linear-progress\`, \`igc-circular-progress\`
- **Scheduling:** \`igc-calendar\`, \`igc-date-range-picker\`
- **Overlays:** \`igc-dropdown\`, \`igc-tooltip\`

Ask me about any specific component for a usage example!`;
  }
  if (lower.includes('button')) {
    return `\`igc-button\` supports four visual variants:

\`\`\`html
<igc-button variant="contained">Contained</igc-button>
<igc-button variant="outlined">Outlined</igc-button>
<igc-button variant="flat">Flat</igc-button>
<igc-button variant="fab"><igc-icon name="add"></igc-icon></igc-button>
\`\`\`

Disabling it:
\`\`\`html
<igc-button disabled>Can't click me</igc-button>
\`\`\``;
  }
  if (
    lower.includes('input') ||
    lower.includes('form') ||
    lower.includes('field')
  ) {
    return `\`igc-input\` participates in standard HTML forms and supports full validation:

\`\`\`html
<igc-input
  name="email"
  type="email"
  label="Email address"
  placeholder="you@example.com"
  required
></igc-input>
\`\`\`

Reading the value in JavaScript:
\`\`\`ts
const input = document.querySelector('igc-input');
console.log(input.value); // current value
input.reportValidity();    // trigger validation
\`\`\``;
  }
  if (
    lower.includes('typescript') ||
    lower.includes('type') ||
    lower.includes('import')
  ) {
    return `All components are fully typed. Import component types directly:

\`\`\`ts
import type { IgcButtonComponent, IgcInputComponent } from 'igniteui-webcomponents';

const btn = document.querySelector<IgcButtonComponent>('igc-button')!;
btn.variant = 'outlined';

const input = document.querySelector<IgcInputComponent>('igc-input')!;
input.value = 'prefilled';
\`\`\`

Event types are also exported:
\`\`\`ts
import type { IgcInputEventMap } from 'igniteui-webcomponents';
\`\`\``;
  }
  if (
    lower.includes('register') ||
    lower.includes('define') ||
    lower.includes('setup') ||
    lower.includes('start')
  ) {
    return `The quickest way to get started:

\`\`\`ts
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import { defineComponents, IgcAllComponents } from 'igniteui-webcomponents';

// Register every component at once (useful for prototyping)
defineComponents(...IgcAllComponents);
\`\`\`

For production, register only what you use to keep bundle size small:

\`\`\`ts
import { defineComponents, IgcCardComponent, IgcChipComponent } from 'igniteui-webcomponents';
defineComponents(IgcCardComponent, IgcChipComponent);
\`\`\``;
  }
  if (lower.includes('event') || lower.includes('listen')) {
    return `All components fire **prefixed custom events** (\`igc*\`) you can listen to natively:

\`\`\`ts
const input = document.querySelector('igc-input')!;

// Native event listener
input.addEventListener('igcChange', (e: CustomEvent<string>) => {
  console.log('New value:', e.detail);
});
\`\`\`

In a Lit template:
\`\`\`ts
html\`<igc-input @igcChange=\${this.handleChange}></igc-input>\`
\`\`\``;
  }
  if (lower.includes('thank')) {
    return "You're very welcome! Feel free to come back anytime. Happy coding! 😊";
  }
  return 'I can help with: **installation**, **theming** (light/dark), **available components**, specific component APIs (**button**, **input**, etc.), **TypeScript** types, and **event** handling. What would you like to know?';
}

// #endregion

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A simulated IgniteUI Web Components support chat. The conversation starts with an installation walkthrough and a component overview table. Continue the conversation with questions like "How do I apply a dark theme?", "Show me how to use igc-input", "How do events work?", or "What TypeScript types are available?".',
      },
    },
  },
  render: () => html`
    <igc-chat
      style="--igc-chat-height: calc(100vh - 32px);"
      .messages=${[...supportMessages]}
      .options=${{
        headerText: 'IgniteUI Web Components Support',
        inputPlaceholder: 'Ask about installation, components, theming…',
        suggestions: [
          'How do I install the library?',
          'What themes are available?',
          'How do events work?',
        ],
        renderers: {
          messageContent: async ({ message }) => _markdownRenderer(message),
        },
      } satisfies IgcChatOptions}
      @igcMessageCreated=${handleMessageSend}
    ></igc-chat>
  `,
};

// #region Chat_Templates helpers

const _messageAuthorTemplate = ({ message }: ChatMessageRenderContext) => {
  return message.sender !== 'user'
    ? html`
        <div style="display: flex; align-items: center; gap: 8px;">
          <igc-avatar
            shape="circle"
            src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
          ></igc-avatar>
          <span style="font-weight: 600;">Support Agent</span>
        </div>
      `
    : nothing;
};

const _messageActionsTemplate = ({ message }: ChatMessageRenderContext) => {
  if (message.sender === 'user' || !message.text.trim()) return nothing;
  return html`
    <igc-icon-button
      variant="flat"
      name="thumb_up"
      aria-label="Mark as helpful"
      @click=${() => {
        /* mark as helpful */
      }}
    ></igc-icon-button>
  `;
};

function handleCustomSendClick(chat: IgcChatComponent) {
  const newMessage: IgcChatMessage = {
    id: Date.now().toString(),
    text: chat.draftMessage.text,
    sender: 'user',
    attachments: chat.draftMessage.attachments ?? [],
    timestamp: new Date().toISOString(),
  };
  chat.messages = [...chat.messages, newMessage];
  chat.draftMessage = { text: '', attachments: [] };
}

const templatesOptions: IgcChatOptions = {
  headerText: 'IgniteUI Web Components Support',
  inputPlaceholder: 'Ask me anything…',
  suggestions: [
    'How do I install the library?',
    'What themes are available?',
    'How do events work?',
  ],
  renderers: {
    messageHeader: _messageAuthorTemplate,
    messageContent: async ({ message }) => _markdownRenderer(message),
    messageActions: _messageActionsTemplate,
    attachmentHeader: () => nothing,
    inputActionsStart: () => html`
      <igc-icon-button variant="flat" aria-label="Voice input"
        >🎤</igc-icon-button
      >
    `,
    inputActionsEnd: (ctx: ChatRenderContext) => html`
      <igc-button @click=${() => handleCustomSendClick(ctx.instance)}
        >Send</igc-button
      >
    `,
    sendButton: () => nothing,
    suggestionPrefix: () => '💬',
  },
};

// #endregion

export const Chat_Templates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same library support chat with full renderer customization applied: custom message author header (avatar + name), a thumbs-up action on agent messages, a custom "Send" button replacing the default, a voice input button, and a custom suggestion prefix. Header and action slots are also projected via light DOM.',
      },
    },
  },
  render: () => html`
    <igc-chat
      style="--igc-chat-height: calc(100vh - 32px);"
      .messages=${[...supportMessages]}
      .options=${templatesOptions}
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
      <div slot="suggestions-header">Suggested Topics</div>
    </igc-chat>
  `,
};
