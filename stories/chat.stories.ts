import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcChatComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcListComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import type {
  ChatMessageRenderContext,
  ChatRenderers,
  IgcChatDraftMessage,
  IgcChatMessage,
  IgcChatMessageAttachment,
  IgcChatMessageReaction,
  IgcChatOptions,
  IgcDropdownItemComponent,
} from 'igniteui-webcomponents';
import { createMarkdownRenderer } from 'igniteui-webcomponents/extras';
import { registerMaterialIcons } from './story-icons.js';
import { delay, plural, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcChatComponent,
  IgcDropdownComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcListComponent
);
registerMaterialIcons(
  'bookmark',
  'chat',
  'close',
  'done',
  'done-all',
  'emoticon',
  'flash-on',
  'info',
  'minus',
  'plus',
  'stop'
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
  argTypes: {
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings and the locale-aware formatting.\nFalls back to the global locale.',
      control: 'text',
    },
  },
};

export default metadata;

interface IgcChatArgs {
  /**
   * The locale for the resource strings and the locale-aware formatting.
   * Falls back to the global locale.
   */
  locale: string;
}
type Story = StoryObj<IgcChatArgs>;

// endregion

const markdown = await createMarkdownRenderer({
  languages: ['typescript', 'html', 'shellscript'],
});

const renderedMarkdown = new WeakMap<IgcChatMessage, Promise<unknown>>();

/**
 * Converts a message from Markdown once per message object. Without the
 * cache, each `isTyping` change converts every message again.
 */
function markdownOf(message: IgcChatMessage): Promise<unknown> {
  let result = renderedMarkdown.get(message);

  if (!result) {
    result = markdown(message);
    renderedMarkdown.set(message, result);
  }

  return result;
}

interface Person {
  name: string;
  photo: string;
}

const photo = (folder: 'men' | 'women', id: number) =>
  `https://www.infragistics.com/angular-demos/assets/images/${folder}/${id}.jpg`;

const firstNameOf = (name: string) => name.split(' ')[0];

/** The styles that the chat stories share, with `.sr-only` and `.muted`. */
const chatStoryStyles = html`
  ${storyStyles}
  <style>
    .chat-page {
      height: calc(100vh - 2rem);
    }

    .chat-title {
      display: grid;
    }

    .chat-subtitle {
      font-size: 0.875rem;
      font-weight: normal;
    }
  </style>
`;

const timeOfDay = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const dayAndTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/**
 * The chat stamps a message that the user sends with `Date.now()` as a
 * string, and the stories use ISO strings, so both forms are read here.
 */
function sentAt({ timestamp = '' }: IgcChatMessage): Date {
  return new Date(/^\d+$/.test(timestamp) ? Number(timestamp) : timestamp);
}

function formatSentAt(message: IgcChatMessage): string {
  const date = sentAt(message);

  return date.toDateString() === new Date().toDateString()
    ? timeOfDay.format(date)
    : dayAndTime.format(date);
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

function createMessage(
  sender: string,
  text: string,
  details?: Partial<IgcChatMessage>
): IgcChatMessage {
  return {
    id: crypto.randomUUID(),
    sender,
    text,
    timestamp: new Date().toISOString(),
    ...details,
  };
}

/**
 * Gives a new object to each message that `changed` selects. The chat renders
 * a message again only when it gets a new message object.
 */
function refreshMessages(
  chat: IgcChatComponent,
  changed: (message: IgcChatMessage) => boolean,
  changes?: Partial<IgcChatMessage>
): void {
  chat.messages = chat.messages.map((message) =>
    changed(message) ? { ...message, ...changes } : message
  );
}

function appendMessage(chat: IgcChatComponent, message: IgcChatMessage): void {
  chat.messages = [...chat.messages, message];
}

/** Shows the typing indicator for `ms` milliseconds, then adds `message`. */
async function typeAndSend(
  chat: IgcChatComponent,
  message: IgcChatMessage,
  ms: number
): Promise<void> {
  chat.options = { ...chat.options, isTyping: true };
  await delay(ms);
  chat.options = { ...chat.options, isTyping: false };
  appendMessage(chat, message);
}

/** Whether `message` starts a run of messages of one sender, at most five minutes apart. */
function startsRun(messages: IgcChatMessage[], message: IgcChatMessage) {
  const previous = messages[messages.indexOf(message) - 1];

  return (
    previous?.sender !== message.sender ||
    sentAt(message).getTime() - sentAt(previous).getTime() > 5 * 60_000
  );
}

/**
 * A `messageHeader` renderer: the avatar, name and time of the sender on the
 * first message of a run. Inline styles, because it renders into the shadow
 * root of the message.
 */
function personHeader(people: Record<string, Person>) {
  return ({ message, instance }: ChatMessageRenderContext) => {
    const person = people[message.sender];

    if (!person || !startsRun(instance.messages, message)) {
      return nothing;
    }

    return html`
      <span style="display: flex; align-items: center; gap: 0.5rem">
        <igc-avatar
          shape="circle"
          src=${person.photo}
          aria-hidden="true"
          style="--ig-avatar-size: 2rem"
        ></igc-avatar>
        <strong>${person.name}</strong>
        <time
          datetime=${sentAt(message).toISOString()}
          style="color: var(--ig-gray-700); font-size: 0.75rem"
          >${formatSentAt(message)}</time
        >
      </span>
    `;
  };
}

/** The time under a message of the current user, with an optional status. */
function sentTime(message: IgcChatMessage, status?: unknown) {
  return html`
    <span
      style="display: flex; align-items: center; justify-content: end; gap: 0.25rem; font-size: 0.75rem"
    >
      <time datetime=${sentAt(message).toISOString()}
        >${formatSentAt(message)}</time
      >
      ${status}
    </span>
  `;
}

/**
 * An image attachment with an SVG picture, so that the stories load no image
 * files.
 */
function picture(
  name: string,
  width: number,
  height: number,
  content: string
): IgcChatMessageAttachment {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="sans-serif">${content}</svg>`;

  return {
    id: crypto.randomUUID(),
    name,
    type: 'image/svg+xml',
    url: URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })),
  };
}

// #region Default

interface Topic {
  keywords: string[];
  /** The answer, and the other answer that Regenerate streams. */
  answers: [string, string];
  followUps: string[];
}

const firstQuestions = [
  'How do I install the library?',
  'How do I switch to a dark theme?',
  'How do I validate a form field?',
];

const installTopic: Topic = {
  keywords: ['install', 'npm', 'start', 'set up', 'setup'],
  answers: [
    `Install the package, import a theme and register the components that you use:

\`\`\`bash
npm install igniteui-webcomponents
\`\`\`

\`\`\`ts
import 'igniteui-webcomponents/themes/light/bootstrap.css';
import { defineComponents, IgcButtonComponent } from 'igniteui-webcomponents';

defineComponents(IgcButtonComponent);
\`\`\`

\`defineComponents\` also registers the components that a component uses inside, so list only the tags of your markup.`,
    `There are three steps:

1. Add the package: \`npm install igniteui-webcomponents\`.
2. Import one theme file, for example \`igniteui-webcomponents/themes/light/fluent.css\`.
3. Register the components with \`defineComponents()\`, or all of them with \`defineAllComponents()\` while you build a prototype.

> In production, register only the components that you use. The others then stay out of your bundle.`,
  ],
  followUps: [
    'How do I switch to a dark theme?',
    'How do I validate a form field?',
  ],
};

const themeTopic: Topic = {
  keywords: ['theme', 'dark', 'style', 'css', 'color'],
  answers: [
    `Each theme has a light and a dark file. Import the dark file in place of the light one:

\`\`\`ts
// import 'igniteui-webcomponents/themes/light/bootstrap.css';
import 'igniteui-webcomponents/themes/dark/bootstrap.css';
\`\`\`

The themes are **Bootstrap**, **Material**, **Fluent** and **Indigo**. Load one theme file at a time.`,
    `To use another theme in one part of the page, put that part in \`igc-theme-provider\`:

\`\`\`html
<igc-theme-provider theme="material" variant="dark">
  <igc-card>…</igc-card>
</igc-theme-provider>
\`\`\`

The provider changes the styles of the components. The colors are CSS variables of the theme file: to change them in the provider too, set them on the provider with the \`palette()\` mixin of \`igniteui-theming\`.`,
  ],
  followUps: [
    'How do I install the library?',
    'How do I validate a form field?',
  ],
};

const validationTopic: Topic = {
  keywords: ['valid', 'form', 'field', 'input', 'email'],
  answers: [
    `\`igc-input\` validates like a native input. Set the constraints as attributes, and put a message for each constraint in its slot:

\`\`\`html
<form>
  <igc-input name="email" type="email" label="Email" required>
    <p slot="value-missing">Enter your email address.</p>
    <p slot="type-mismatch">Enter an address like name@example.com.</p>
  </igc-input>
  <igc-button type="submit">Subscribe</igc-button>
</form>
\`\`\`

- The input takes part in the form, so \`FormData\` has its value.
- A submit stops while a field is invalid.
- A message shows after the user changes the field or submits the form.`,
    `Use the attributes of a native input: \`required\`, \`type="email"\`, \`minlength\`, \`maxlength\` and \`pattern\`. Each constraint has a slot for its message, for example \`value-missing\` and \`pattern-mismatch\`.

To check a form before the next step of a wizard, call \`reportValidity()\`. It shows the messages and returns \`false\` when a field is invalid:

\`\`\`ts
next.addEventListener('click', () => {
  if (form.reportValidity()) {
    showNextStep();
  }
});
\`\`\``,
  ],
  followUps: [
    'How do I show an error from the server?',
    'How do I switch to a dark theme?',
  ],
};

const serverErrorTopic: Topic = {
  keywords: ['server', 'custom', 'error', 'taken'],
  answers: [
    `Call \`setCustomValidity()\` with the error of the server, and clear it with an empty string when the user changes the value:

\`\`\`ts
const email = form.querySelector('igc-input')!;

email.addEventListener('igcInput', () => email.setCustomValidity(''));

const response = await fetch('/api/subscribe', { method: 'POST', body: new FormData(form) });

if (response.status === 409) {
  email.setCustomValidity('This address is already subscribed.');
  email.reportValidity();
}
\`\`\`

Put the text that the field shows in its \`custom-error\` slot:

\`\`\`html
<p slot="custom-error">This address is already subscribed.</p>
\`\`\``,
    `A custom error has three steps:

| When | Call |
| --- | --- |
| The server rejects the value | \`input.setCustomValidity('Already subscribed')\` |
| The error must show now | \`input.reportValidity()\` |
| The user changes the value | \`input.setCustomValidity('')\` |

The \`custom-error\` slot holds the text that the field shows.`,
  ],
  followUps: [
    'How do I validate a form field?',
    'How do I install the library?',
  ],
};

// The more specific topics come first.
const topics = [serverErrorTopic, validationTopic, themeTopic, installTopic];

const fallbackAnswer =
  'I can answer questions about the **installation**, the **themes** and the **forms**. Pick a question below, or ask in your own words.';

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The assistant of a documentation site. The `messageContent` renderer converts the answers from Markdown with `createMarkdownRenderer()` from `igniteui-webcomponents/extras`, which also highlights the code. An answer streams in chunks: for each chunk, the story gives the chat a new message object, because the chat renders a message again only for a new object. While an answer streams, `isTyping` keeps the typing indicator and hides the actions of the last message, and the `sendButton` renderer shows a stop button. A question that you send while an answer streams cancels `igcMessageCreated`, so the question stays in the input. Regenerate sends `igcMessageReact` with the `regenerate` reaction, and the story streams the other answer into the same message. After each answer, `suggestions` shows related questions. New chat clears `messages`, so the `empty-state` slot and the first questions show, and `focusInput()` moves the focus to the input.',
      },
    },
  },
  render: () => {
    const chat = createRef<IgcChatComponent>();
    /** The answer that streams now. */
    let streaming: { stopped: boolean } | undefined;
    /** The index of the answer that each message shows, for Regenerate. */
    const answerIndex = new Map<string, number>();

    const renderers: ChatRenderers = {
      messageContent: ({ message }) =>
        message.sender === 'assistant' ? markdownOf(message) : message.text,
    };

    const streamingRenderers: ChatRenderers = {
      ...renderers,
      sendButton: () => html`
        <igc-icon-button
          variant="contained"
          name="stop"
          aria-label="Stop the answer"
          @click=${() => {
            if (streaming) {
              streaming.stopped = true;
            }
          }}
        ></igc-icon-button>
      `,
    };

    const options: IgcChatOptions = {
      currentUserId: 'you',
      headerText: 'Docs assistant',
      inputPlaceholder: 'Ask about the components',
      disableInputAttachments: true,
      renderers,
    };

    async function answer(question: string, id: string, index: number) {
      const host = chat.value!;
      const lower = question.toLowerCase();
      const topic = topics.find(({ keywords }) =>
        keywords.some((keyword) => lower.includes(keyword))
      );
      // Each chunk ends after a whitespace character, so the line breaks stay.
      const chunks = (topic?.answers[index % 2] ?? fallbackAnswer).split(
        /(?<=\s)/
      );
      const run = { stopped: false };

      streaming = run;
      answerIndex.set(id, index);
      host.options = {
        ...host.options,
        isTyping: true,
        suggestions: [],
        renderers: streamingRenderers,
      };

      await delay(600);

      // Regenerate streams into the message that it answers again.
      if (
        streaming === run &&
        !run.stopped &&
        !host.messages.some((message) => message.id === id)
      ) {
        appendMessage(host, createMessage('assistant', '', { id }));
      }

      // New chat ends the stream too.
      for (let count = 3; streaming === run && !run.stopped; count += 3) {
        refreshMessages(host, (message) => message.id === id, {
          text: chunks.slice(0, count).join(''),
          reactions: [],
        });

        if (count >= chunks.length) {
          break;
        }
        await delay(40);
      }

      if (streaming === run) {
        streaming = undefined;
        host.options = {
          ...host.options,
          isTyping: false,
          suggestions: run.stopped ? [] : (topic?.followUps ?? firstQuestions),
          renderers,
        };
      }
    }

    const ask = (event: CustomEvent<IgcChatMessage>) => {
      // One answer at a time. A cancelled question stays in the input.
      if (streaming) {
        event.preventDefault();
        return;
      }

      answer(event.detail.text, crypto.randomUUID(), 0);
    };

    const regenerate = ({
      detail: { message, reaction },
    }: CustomEvent<IgcChatMessageReaction>) => {
      if (reaction !== 'regenerate' || streaming) {
        return;
      }

      const { messages } = chat.value!;
      const question = messages
        .slice(
          0,
          messages.findIndex(({ id }) => id === message.id)
        )
        .findLast(({ sender }) => sender === 'you');

      answer(
        question?.text ?? '',
        message.id,
        (answerIndex.get(message.id) ?? 0) + 1
      );
    };

    const startOver = () => {
      streaming = undefined;
      chat.value!.messages = [];
      chat.value!.options = { ...options, suggestions: firstQuestions };
      chat.value!.focusInput();
    };

    return html`
      ${chatStoryStyles}
      <style>
        .assistant-welcome {
          display: grid;
          place-content: center;
          gap: 0.5rem;
          height: 100%;
          text-align: center;
        }

        .assistant-welcome :is(h2, p) {
          margin: 0;
        }
      </style>
      <igc-chat
        ${ref(chat)}
        class="chat-page"
        .messages=${[
          createMessage('you', 'How do I validate an email field in a form?', {
            timestamp: minutesAgo(3),
          }),
          createMessage('assistant', validationTopic.answers[0], {
            timestamp: minutesAgo(3),
          }),
        ]}
        .options=${{ ...options, suggestions: validationTopic.followUps }}
        @igcMessageCreated=${ask}
        @igcMessageReact=${regenerate}
      >
        <igc-icon-button
          slot="actions"
          variant="flat"
          name="plus"
          aria-label="New chat"
          @click=${startOver}
        ></igc-icon-button>
        <div slot="empty-state" class="assistant-welcome">
          <h2>How can I help?</h2>
          <p class="muted">
            Ask about the installation, the themes or the forms. Answers can
            contain mistakes, so check the documentation too.
          </p>
        </div>
      </igc-chat>
    `;
  },
};

// #endregion

// #region SupportWidget

const supportAgent: Person = { name: 'Sofia', photo: photo('women', 12) };

/** 13 to 19 digits, with optional spaces or dashes between them. */
const cardNumber = /\b(?:\d[ -]?){12,18}\d\b/;

const maxFileSize = 5 * 1024 * 1024;

const barcode = Array.from(
  { length: 44 },
  (_, i) =>
    `<rect x="${40 + i * 7}" y="150" width="${i % 3 ? 2 : 4}" height="56"/>`
).join('');

const returnLabel = picture(
  'return-label-NW-48213.svg',
  400,
  240,
  `<rect width="400" height="240" fill="#fff"/>
  <rect x="6" y="6" width="388" height="228" fill="none" stroke="#000" stroke-width="4"/>
  <text x="24" y="50" font-size="24" font-weight="700">RETURN · PREPAID</text>
  <text x="24" y="84" font-size="16">Northwind Outfitters, Returns</text>
  <text x="24" y="108" font-size="16">Order NW-48213</text>
  <g fill="#000">${barcode}</g>`
);

type AgentWaitsFor = 'photo' | 'address' | undefined;

function agentReply(
  message: IgcChatMessage,
  waitsFor: AgentWaitsFor
): {
  text: string;
  attachments?: IgcChatMessageAttachment[];
  waitsFor: AgentWaitsFor;
} {
  const text = message.text.toLowerCase();

  if (waitsFor === 'photo' && message.attachments?.length) {
    return {
      text: 'Thank you, I can see the damage. Here is your prepaid return label. Print it and drop the parcel at any post office within 14 days. The refund starts when the parcel arrives.',
      attachments: [returnLabel],
      waitsFor: undefined,
    };
  }
  if (waitsFor === 'address') {
    return {
      text: 'Done! The parcel goes to the new address, and you get an email with the change.',
      waitsFor: undefined,
    };
  }
  if (/return|damage|broken|torn/.test(text)) {
    return {
      text: "I'm sorry to hear that. What is wrong with the item? A photo helps me most: attach one with the paper clip button.",
      waitsFor: 'photo',
    };
  }
  if (text.includes('address')) {
    return {
      text: 'Sure, I can change it until the parcel ships. What is the new address?',
      waitsFor: 'address',
    };
  }
  if (/order|where|track/.test(text)) {
    return {
      text: 'Your order **NW-48213** left our warehouse yesterday and arrives on Thursday. You can [track the parcel](https://example.com/track/NW-48213) on the site of the carrier.',
      waitsFor,
    };
  }
  return {
    text: 'Thanks! Let me check that for you. Is there anything else I can help you with?',
    waitsFor,
  };
}

export const SupportWidget: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The support chat of an online shop, in a floating widget. The launcher opens and closes the panel with the invoker command `toggle-popover`. While the panel is closed, a badge on the launcher counts the new messages. The header slots show the agent (`prefix`, `title`) and a minimize button (`actions`). The quick replies show below the input (`suggestionsPosition: 'below-input'`) under a custom `suggestions-header`, and go away after the first message. The `messageHeader` renderer shows the name of the agent at the start of a run of messages. The `messageActions` renderer replaces the copy and like actions: each message of the customer shows its time and a tick, and two ticks after the agent reads it. `acceptedFiles` limits the files from the picker and from a drop to photos and PDF files, and an `igcAttachmentAdded` handler cancels a file that is larger than 5 MB. An `igcMessageCreated` handler cancels a message with a card number, so the message stays in the input. A notice in the conversation tells why. Ask to return an item and attach a photo: the agent sends a return label. Click an attachment to open it.",
      },
    },
  },
  render: () => {
    const chat = createRef<IgcChatComponent>();
    /** The IDs of the messages of the customer that the agent read. */
    const seen = new Set<string>();
    let open = true;
    let unread = 0;
    let waitsFor: AgentWaitsFor;
    // The agent answers the messages one after another.
    let replies = Promise.resolve();

    const notice = (text: string) =>
      appendMessage(chat.value!, createMessage('system', text));

    const options: IgcChatOptions = {
      currentUserId: 'you',
      inputPlaceholder: 'Write a message',
      acceptedFiles: 'image/*,.pdf',
      suggestions: [
        'Where is my order?',
        'I want to return an item',
        'Change my delivery address',
      ],
      suggestionsPosition: 'below-input',
      renderers: {
        messageHeader: personHeader({ agent: supportAgent }),
        messageContent: ({ message }) => {
          switch (message.sender) {
            case 'agent':
              return markdownOf(message);
            case 'system':
              return html`
                <span
                  style="display: flex; gap: 0.5rem; color: var(--ig-gray-700); font-size: 0.875rem"
                >
                  <igc-icon
                    name="info"
                    style="--ig-icon-size: 1.25rem; flex: none"
                  ></igc-icon>
                  ${message.text}
                </span>
              `;
            default:
              return message.text;
          }
        },
        messageActions: ({ message }) => {
          if (message.sender !== 'you') {
            return nothing;
          }

          const read = seen.has(message.id);

          return sentTime(
            message,
            html`
              <igc-icon
                name=${read ? 'done-all' : 'done'}
                aria-label=${read ? 'Seen' : 'Delivered'}
                style="--ig-icon-size: 1rem"
              ></igc-icon>
            `
          );
        },
      },
    };

    async function reply(message: IgcChatMessage) {
      const host = chat.value!;

      await delay(800);

      const read = host.messages
        .filter(({ id, sender }) => sender === 'you' && !seen.has(id))
        .map(({ id }) => id);

      for (const id of read) {
        seen.add(id);
      }
      refreshMessages(host, ({ id }) => read.includes(id));

      await delay(500);

      const answer = agentReply(message, waitsFor);

      waitsFor = answer.waitsFor;
      await typeAndSend(
        host,
        createMessage('agent', answer.text, {
          attachments: answer.attachments,
        }),
        1500
      );

      if (!open) {
        unread += 1;
        launcher.update();
      }
    }

    const send = (event: CustomEvent<IgcChatMessage>) => {
      const message = event.detail;

      if (cardNumber.test(message.text)) {
        event.preventDefault();
        notice(
          'For your safety, do not send card numbers in the chat. Remove the number, and send the message again.'
        );
        return;
      }

      // The quick replies only start the conversation.
      chat.value!.options = { ...chat.value!.options, suggestions: [] };
      replies = replies.then(() => reply(message));
    };

    const checkFiles = (event: CustomEvent<IgcChatMessageAttachment[]>) => {
      const tooLarge = event.detail.find(
        ({ file }) => file && file.size > maxFileSize
      );

      if (tooLarge) {
        event.preventDefault();
        notice(
          `${tooLarge.name} was not attached. Attach a file of up to 5 MB.`
        );
      }
    };

    const openAttachment = ({
      detail,
    }: CustomEvent<IgcChatMessageAttachment>) => {
      if (detail.url) {
        window.open(detail.url, '_blank', 'noopener');
      }
    };

    const launcher = renderInto(() => {
      const label = open
        ? 'Close the support chat'
        : unread
          ? `Chat with support (${plural(unread, 'new message')})`
          : 'Chat with support';

      return html`
        <igc-icon-button
          variant="contained"
          name=${open ? 'close' : 'chat'}
          aria-label=${label}
          command="toggle-popover"
          commandfor="support-panel"
        ></igc-icon-button>
        ${unread ? html`<igc-badge aria-hidden="true">${unread}</igc-badge>` : nothing}
      `;
    });

    // Storybook connects the story again after the first render, and a
    // popover closes when it leaves the document.
    const showPanel = ref((element) => {
      if (element) {
        requestAnimationFrame(() => {
          if (
            open &&
            element.isConnected &&
            !element.matches(':popover-open')
          ) {
            (element as HTMLElement).showPopover();
          }
        });
      }
    });

    const toggled = (event: ToggleEvent) => {
      // Storybook removed the panel; the user did not close it.
      if (!(event.target as HTMLElement).isConnected) {
        return;
      }

      open = event.newState === 'open';
      if (open) {
        unread = 0;
      }
      launcher.update();
    };

    return html`
      ${chatStoryStyles}
      <style>
        .support-order {
          max-width: 32rem;
        }

        .support-order :is(h2, p) {
          margin-block: 0 0.5rem;
        }

        .support-order ul {
          margin: 1rem 0 0;
          padding: 0;
          list-style: none;
        }

        .support-order li {
          display: flex;
          justify-content: space-between;
          padding-block: 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .support-launcher {
          position: fixed;
          inset-block-end: 1.5rem;
          inset-inline-end: 1.5rem;
        }

        .support-launcher igc-badge {
          position: absolute;
          inset-block-start: -0.25rem;
          inset-inline-end: -0.25rem;
        }

        #support-panel {
          inset: auto;
          inset-block-end: 5.5rem;
          inset-inline-end: 1.5rem;
          width: min(24rem, calc(100vw - 2rem));
          height: min(38rem, calc(100vh - 7rem));
          margin: 0;
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--ig-gray-300);
          border-radius: 1rem;
          color: var(--ig-gray-900);
          background: var(--ig-surface-500);
          box-shadow: var(--ig-elevation-16);
        }
      </style>
      <section class="support-order" aria-labelledby="support-order-title">
        <h2 id="support-order-title">Order NW-48213</h2>
        <p class="muted">Placed on Monday · Arrives on Thursday</p>
        <ul>
          <li><span>Trail jacket, green, size M</span><span>$129.00</span></li>
          <li><span>Merino socks, 2 pairs</span><span>$24.00</span></li>
        </ul>
      </section>
      <div class="support-launcher" ${launcher.mount}></div>
      <section
        id="support-panel"
        popover="manual"
        aria-label="Support chat"
        ${showPanel}
        @toggle=${toggled}
      >
        <igc-chat
          ${ref(chat)}
          .messages=${[
            createMessage(
              'agent',
              "Hi, I'm Sofia from Northwind Outfitters. How can I help you today?",
              { timestamp: minutesAgo(1) }
            ),
          ]}
          .options=${options}
          @igcMessageCreated=${send}
          @igcAttachmentAdded=${checkFiles}
          @igcAttachmentClick=${openAttachment}
        >
          <igc-avatar
            slot="prefix"
            shape="circle"
            src=${supportAgent.photo}
            aria-hidden="true"
          ></igc-avatar>
          <span slot="title" class="chat-title">
            Sofia from Northwind
            <span class="chat-subtitle muted"
              >Usually replies in a few minutes</span
            >
          </span>
          <igc-icon-button
            slot="actions"
            variant="flat"
            name="minus"
            aria-label="Minimize the chat"
            command="hide-popover"
            commandfor="support-panel"
          ></igc-icon-button>
          <span slot="suggestions-header">Common questions</span>
        </igc-chat>
      </section>
    `;
  },
};

// #endregion

// #region TeamChannel

const teammates: Record<string, Person> = {
  mia: { name: 'Mia Chen', photo: photo('women', 2) },
  leo: { name: 'Leo Novak', photo: photo('men', 5) },
  ana: { name: 'Ana Silva', photo: photo('women', 8) },
};

const mentionAnswers: Record<string, string> = {
  mia: 'Sure, I will take a look after the stand-up.',
  leo: 'Got it. I will get back to you before lunch.',
  ana: 'Thanks! I will schedule it for Thursday morning.',
};

const reactionEmojis = ['👍', '🎉', '❤️', '😄', '👀', '🚀'];

const darkThemeCards = picture(
  'dark-theme-cards.svg',
  480,
  270,
  `<rect width="480" height="270" fill="#121212"/>
  ${[24, 172, 320]
    .map(
      (x) =>
        `<rect x="${x}" y="40" width="136" height="190" rx="12" fill="#1e1e1e" stroke="#333"/>
        <rect x="${x + 16}" y="56" width="104" height="64" rx="6" fill="#3f51b5"/>
        <rect x="${x + 16}" y="136" width="88" height="10" rx="5" fill="#e0e0e0"/>
        <rect x="${x + 16}" y="156" width="64" height="8" rx="4" fill="#9e9e9e"/>
        <rect x="${x + 16}" y="194" width="56" height="20" rx="10" fill="#ff4081"/>`
    )
    .join('')}`
);

// Page styles do not apply in the shadow root of a message.
const reactionStyles = html`
  <style>
    .reactions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
    }

    .reaction {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 1rem;
      color: inherit;
      background: none;
      font: inherit;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .reaction[aria-pressed='true'] {
      border-color: var(--ig-primary-500);
      background: color-mix(in srgb, var(--ig-primary-500) 15%, transparent);
    }

    .reaction:focus-visible {
      outline: 2px solid var(--ig-primary-500);
      outline-offset: 1px;
    }
  </style>
`;

/** A `messageContent` renderer that marks the mentions, such as @Mia. */
function withMentions({ message }: ChatMessageRenderContext) {
  return message.text
    .split(/(@\w+)/)
    .map((part, i) =>
      i % 2
        ? html`<strong
            style="padding-inline: 0.125rem; border-radius: 0.25rem; background: color-mix(in srgb, var(--ig-primary-500) 15%, transparent)"
            >${part}</strong
          >`
        : part
    );
}

export const TeamChannel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The channel of a product team. The `messageHeader` renderer shows the avatar, the name and the time only when the sender changes or after five minutes, so the messages of one person stay together. The `messageContent` renderer marks the mentions. The `messageActions` renderer shows the emoji reactions and their counts in place of the copy and like actions. Click a reaction to add or remove yours, or add a new one from the dropdown. A renderer runs again only for a new message object, so a reaction gives its message a new object. Send a message, and Leo reacts to it. Mention @Mia, @Leo or @Ana, and that person types and answers. The `typing-indicator` slot shows who types.',
      },
    },
  },
  render: () => {
    const chat = createRef<IgcChatComponent>();
    const typing = createRef<HTMLElement>();
    /** The people that reacted with each emoji, by message ID. */
    const reactions = new Map<string, Map<string, Set<string>>>([
      ['notes', new Map([['🎉', new Set(['leo', 'ana'])]])],
      [
        'screens',
        new Map([
          ['❤️', new Set(['mia', 'leo'])],
          ['👀', new Set(['me'])],
        ]),
      ],
      ['ship', new Map([['🚀', new Set(['mia', 'leo', 'ana'])]])],
    ]);

    const react = (id: string, emoji: string, person: string, on: boolean) => {
      const byEmoji = reactions.get(id) ?? new Map<string, Set<string>>();
      const people = byEmoji.get(emoji) ?? new Set<string>();

      if (on) {
        people.add(person);
      } else {
        people.delete(person);
      }
      reactions.set(id, byEmoji.set(emoji, people));
      refreshMessages(chat.value!, (message) => message.id === id);
    };

    const reactionBar = ({ message }: ChatMessageRenderContext) => {
      const counts = [...(reactions.get(message.id) ?? [])].filter(
        ([, people]) => people.size > 0
      );

      return html`
        ${reactionStyles}
        <div class="reactions">
          ${counts.map(
            ([emoji, people]) => html`
              <button
                type="button"
                class="reaction"
                aria-pressed=${people.has('me') ? 'true' : 'false'}
                aria-label=${`${emoji} ${plural(people.size, 'reaction')}`}
                @click=${() =>
                  react(message.id, emoji, 'me', !people.has('me'))}
              >
                ${emoji} ${people.size}
              </button>
            `
          )}
          <igc-dropdown
            placement="top-start"
            @igcChange=${({
              detail,
              currentTarget,
            }: CustomEvent<IgcDropdownItemComponent>) => {
              (currentTarget as IgcDropdownComponent).clearSelection();
              react(message.id, detail.value, 'me', true);
            }}
          >
            <igc-icon-button
              slot="target"
              variant="flat"
              name="emoticon"
              aria-label="Add a reaction"
            ></igc-icon-button>
            ${reactionEmojis.map(
              (emoji) =>
                html`<igc-dropdown-item value=${emoji}
                  >${emoji}</igc-dropdown-item
                >`
            )}
          </igc-dropdown>
        </div>
      `;
    };

    async function respond(id: string, mentioned?: string) {
      const host = chat.value!;

      await delay(1200);
      react(id, '👍', 'leo', true);

      if (!mentioned) {
        return;
      }

      typing.value!.textContent = `${teammates[mentioned].name} is typing…`;
      await typeAndSend(
        host,
        createMessage(mentioned, mentionAnswers[mentioned]),
        1800
      );
    }

    const send = ({ detail }: CustomEvent<IgcChatMessage>) => {
      const mentioned = Object.keys(teammates).find((key) =>
        new RegExp(`@${firstNameOf(teammates[key].name)}\\b`, 'i').test(
          detail.text
        )
      );

      respond(detail.id, mentioned);
    };

    const options: IgcChatOptions = {
      currentUserId: 'me',
      inputPlaceholder: 'Message #release-7-5',
      renderers: {
        messageHeader: personHeader(teammates),
        messageContent: withMentions,
        messageActions: reactionBar,
      },
    };

    return html`
      ${chatStoryStyles}
      <igc-chat
        ${ref(chat)}
        class="chat-page"
        .messages=${[
          createMessage(
            'mia',
            'Morning! The release notes for 7.5 are ready for review.',
            { id: 'notes', timestamp: minutesAgo(48) }
          ),
          createMessage(
            'mia',
            '@Leo can you check the migration section? The combo template change needs a code sample.',
            { timestamp: minutesAgo(47) }
          ),
          createMessage('leo', 'On it. I will add the sample before lunch.', {
            timestamp: minutesAgo(40),
          }),
          createMessage(
            'ana',
            'Here are the dark theme screenshots for the blog post.',
            {
              id: 'screens',
              timestamp: minutesAgo(22),
              attachments: [darkThemeCards],
            }
          ),
          createMessage('me', "Great work, everyone. Let's ship on Thursday.", {
            id: 'ship',
            timestamp: minutesAgo(15),
          }),
          createMessage(
            'leo',
            'Thursday works for me. @Ana can you schedule the post?',
            { timestamp: minutesAgo(9) }
          ),
        ]}
        .options=${options}
        @igcMessageCreated=${send}
      >
        <span slot="title" class="chat-title">
          # release-7-5
          <span class="chat-subtitle muted"
            >Ship 7.5 on Thursday · 4 members</span
          >
        </span>
        <em
          slot="typing-indicator"
          class="chat-subtitle muted"
          ${ref(typing)}
        ></em>
      </igc-chat>
    `;
  },
};

// #endregion

// #region AgentDesk

interface Customer extends Person {
  id: string;
}

interface Conversation {
  customer: Customer;
  subject: string;
  /** The open conversation shares this array with the chat. */
  messages: IgcChatMessage[];
  /** The unsent reply while the conversation is not open. */
  draft: IgcChatDraftMessage;
  unread: number;
  pinned: string;
  /** The next answers of the customer. */
  answers: string[];
  typing: boolean;
}

const savedReplies = [
  {
    label: 'Greeting',
    text: 'Hi {name}, thanks for reaching out! Let me check that for you.',
  },
  {
    label: 'Replacement',
    text: 'I have sent you a replacement in the same size. It ships today, and the tracking link comes by email.',
  },
  {
    label: 'Return label',
    text: 'I have emailed you a prepaid return label. Drop the parcel at any post office within 14 days.',
  },
  {
    label: 'Closing',
    text: 'Is there anything else I can help you with, {name}?',
  },
];

const sleevePhoto = picture(
  'torn-sleeve.svg',
  360,
  240,
  `<rect width="360" height="240" fill="#d7ccc8"/>
  <path d="M60 30 L300 70 L280 210 L40 170 Z" fill="#2e7d32"/>
  <path d="M150 60 L170 110 L150 150 L175 200" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 6"/>`
);

function deskConversations(): Conversation[] {
  const from = (
    sender: string,
    minutes: number,
    text: string,
    details?: Partial<IgcChatMessage>
  ) =>
    createMessage(sender, text, { timestamp: minutesAgo(minutes), ...details });
  const conversation = (
    details: Pick<
      Conversation,
      'customer' | 'subject' | 'messages' | 'pinned' | 'answers'
    > &
      Partial<Conversation>
  ): Conversation => ({
    draft: { text: '' },
    unread: 0,
    typing: false,
    ...details,
  });
  const twoDays = 2 * 24 * 60;

  return [
    conversation({
      customer: { id: 'emma', name: 'Emma Wilson', photo: photo('women', 25) },
      subject: 'Torn sleeve on a trail jacket',
      pinned: 'emma-order',
      messages: [
        from(
          'emma',
          52,
          'Hi! I ordered a trail jacket last week, order NW-48213.',
          {
            id: 'emma-order',
          }
        ),
        from(
          'agent',
          51,
          'Hi Emma, thanks for reaching out! Let me check that for you.'
        ),
        from(
          'agent',
          50,
          'The parcel arrived yesterday at 4:12 PM. Is everything all right with it?'
        ),
        from(
          'emma',
          47,
          'The jacket has a torn sleeve. The seam opened along the cuff.'
        ),
        from('emma', 46, 'I only tried it on once.'),
        from(
          'agent',
          44,
          "I'm sorry about that! Can you send me a photo of the sleeve?"
        ),
        from('emma', 40, 'Here you go.', { attachments: [sleevePhoto] }),
        from(
          'agent',
          38,
          'Thank you. That is a production fault, so the return is free.'
        ),
        from(
          'emma',
          31,
          'Great. Can I get a replacement instead of a refund? Size M again.'
        ),
      ],
      answers: [
        'Perfect, thank you so much!',
        'No, that is all. Have a nice day!',
      ],
    }),
    conversation({
      customer: { id: 'raj', name: 'Raj Patel', photo: photo('men', 22) },
      subject: 'New delivery address',
      pinned: 'raj-address',
      messages: [
        from('raj', 12, 'Hello! I moved last week.'),
        from(
          'raj',
          11,
          'Can you send order NW-48377 to my new address? 22 Baker Street, Springfield.',
          {
            id: 'raj-address',
          }
        ),
      ],
      answers: ['Great, thanks a lot!'],
      unread: 2,
    }),
    conversation({
      customer: { id: 'lucia', name: 'Lucía Gómez', photo: photo('women', 31) },
      subject: 'Refund for returned boots',
      pinned: 'lucia-refund',
      messages: [
        from(
          'lucia',
          twoDays,
          'When do I get the refund for the boots that I returned?',
          {
            id: 'lucia-refund',
          }
        ),
        from(
          'agent',
          twoDays - 2,
          'Refunds reach your account 3 to 5 business days after the parcel arrives. Yours arrived yesterday.'
        ),
        from('lucia', twoDays - 5, 'Thank you!'),
      ],
      answers: ['Got it, thanks!'],
    }),
  ];
}

export const AgentDesk: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The inbox of a support agent, where one `igc-chat` shows the open conversation. When you open another conversation, the story keeps `draftMessage` of the conversation that closes and sets the draft of the one that opens. So an unsent reply waits for you, and the list shows it as a draft. The saved replies in the `inputActionsStart` renderer add text to `draftMessage`, so you can edit a reply before you send it, and `focusInput()` moves the focus to the input. The pinned message bar calls `scrollToMessage()`. Reply to a customer and open another conversation: the answer of the customer arrives in the background and shows as a count of new messages.',
      },
    },
  },
  render: () => {
    const chat = createRef<IgcChatComponent>();
    const conversations = deskConversations();
    let active = conversations[0];

    const insertReply = (event: CustomEvent<IgcDropdownItemComponent>) => {
      const host = chat.value!;
      const reply = event.detail.value.replaceAll(
        '{name}',
        firstNameOf(active.customer.name)
      );
      const { text, attachments } = host.draftMessage;

      (event.currentTarget as IgcDropdownComponent).clearSelection();
      host.draftMessage = {
        text: text.trim() ? `${text.trimEnd()} ${reply}` : reply,
        attachments,
      };
      host.focusInput();
    };

    const renderers: ChatRenderers = {
      messageHeader: personHeader(
        Object.fromEntries(
          conversations.map(({ customer }) => [customer.id, customer])
        )
      ),
      messageActions: ({ message }) =>
        message.sender === 'agent' ? sentTime(message) : nothing,
      inputActionsStart: () => html`
        <igc-dropdown placement="top-start" @igcChange=${insertReply}>
          <igc-icon-button
            slot="target"
            variant="flat"
            name="flash-on"
            aria-label="Insert a saved reply"
          ></igc-icon-button>
          <igc-dropdown-header>Saved replies</igc-dropdown-header>
          ${savedReplies.map(
            ({ label, text }) =>
              html`<igc-dropdown-item value=${text}
                >${label}</igc-dropdown-item
              >`
          )}
        </igc-dropdown>
      `,
    };

    const optionsFor = (conversation: Conversation): IgcChatOptions => ({
      currentUserId: 'agent',
      inputPlaceholder: `Reply to ${firstNameOf(conversation.customer.name)}`,
      isTyping: conversation.typing,
      renderers,
    });

    const refresh = () => {
      queue.update();
      conversationHeader.update();
    };

    const openConversation = (conversation: Conversation) => {
      const host = chat.value!;

      if (conversation === active) {
        return;
      }

      active.draft = host.draftMessage;
      active = conversation;
      conversation.unread = 0;
      host.messages = conversation.messages;
      host.draftMessage = conversation.draft;
      host.options = optionsFor(conversation);
      refresh();
    };

    async function customerAnswers(conversation: Conversation, text: string) {
      await delay(1500);
      conversation.typing = true;
      chat.value!.options = optionsFor(active);
      refresh();

      await delay(2500);
      conversation.typing = false;

      conversation.messages = [
        ...conversation.messages,
        createMessage(conversation.customer.id, text),
      ];

      if (conversation === active) {
        chat.value!.messages = conversation.messages;
      } else {
        conversation.unread += 1;
      }
      chat.value!.options = optionsFor(active);
      refresh();
    }

    const send = () => {
      const answer = active.answers.shift();

      if (answer) {
        customerAnswers(active, answer);
      }
      // The chat adds the message after the event.
      queueMicrotask(refresh);
    };

    const queue = renderInto(
      () => html`
        <igc-list aria-label="Conversations">
          ${conversations.map((conversation) => {
            const { customer, subject, unread, typing } = conversation;
            const current = conversation === active;
            const draft = current ? '' : conversation.draft.text.trim();

            return html`
              <igc-list-item ?selected=${current}>
                <igc-avatar
                  slot="start"
                  shape="circle"
                  src=${customer.photo}
                  aria-hidden="true"
                ></igc-avatar>
                <button
                  slot="title"
                  class="desk-open"
                  aria-current=${ifDefined(current ? 'true' : undefined)}
                  @click=${() => openConversation(conversation)}
                >
                  ${customer.name}${
                    unread
                      ? html`<span class="sr-only"
                          >(${plural(unread, 'new message')})</span
                        >`
                      : nothing
                  }
                </button>
                <span slot="subtitle">${subject}</span>
                <span class="desk-preview muted">
                  ${
                    typing
                      ? 'Typing…'
                      : draft
                        ? `Draft: ${draft}`
                        : conversation.messages.at(-1)?.text
                  }
                </span>
                ${
                  unread
                    ? html`<igc-badge slot="end" aria-hidden="true"
                        >${unread}</igc-badge
                      >`
                    : nothing
                }
              </igc-list-item>
            `;
          })}
        </igc-list>
      `
    );

    const conversationHeader = renderInto(() => {
      const { customer, subject } = active;
      const pinned = active.messages.find(({ id }) => id === active.pinned);

      return html`
        <h2 id="desk-title" class="desk-title chat-title">
          ${customer.name}
          <span class="chat-subtitle muted">${subject}</span>
        </h2>
        ${
          pinned
            ? html`
                <button
                  type="button"
                  class="desk-pinned"
                  @click=${() => chat.value?.scrollToMessage(pinned.id)}
                >
                  <igc-icon name="bookmark"></igc-icon>
                  <span class="desk-pinned-text">
                    <strong>Pinned:</strong> ${pinned.text}
                  </span>
                </button>
              `
            : nothing
        }
      `;
    });

    return html`
      ${chatStoryStyles}
      <style>
        .desk {
          display: grid;
          grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
          overflow: hidden;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .desk-queue {
          overflow: auto;
          border-inline-end: 1px solid var(--ig-gray-300);
        }

        .desk-queue igc-list-item {
          border-inline-start: 3px solid transparent;
        }

        .desk-queue igc-list-item[selected] {
          border-inline-start-color: var(--ig-primary-500);
        }

        .desk-queue igc-list-item::part(content) {
          min-width: 0;
        }

        .desk-queue igc-list-item:has(.desk-open:focus-visible) {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: -2px;
        }

        .desk-open,
        .desk-pinned {
          padding: 0;
          border: 0;
          color: inherit;
          background: none;
          font: inherit;
          text-align: start;
          cursor: pointer;
        }

        .desk-open:focus-visible {
          outline: none;
        }

        /* The button covers the whole row. The item host has position: relative. */
        .desk-open::after {
          content: '';
          position: absolute;
          inset: 0;
        }

        .desk-preview {
          display: block;
          overflow: hidden;
          font-size: 0.875rem;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .desk-conversation {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 0;
        }

        .desk-conversation igc-chat {
          flex: 1 1 0;
          min-height: 0;
          height: auto;
        }

        .desk-title {
          margin: 0;
          padding: 0.75rem 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
          font-size: 1.125rem;
        }

        .desk-pinned {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
          font-size: 0.875rem;
        }

        .desk-pinned igc-icon {
          --ig-icon-size: 1.25rem;

          flex: none;
        }

        .desk-pinned-text {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        @media (max-width: 40rem) {
          .desk {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: auto minmax(0, 1fr);
          }

          .desk-queue {
            max-height: 12rem;
            border-inline-end: 0;
            border-block-end: 1px solid var(--ig-gray-300);
          }
        }
      </style>
      <div class="desk chat-page">
        <div class="desk-queue" ${queue.mount}></div>
        <section class="desk-conversation" aria-labelledby="desk-title">
          <div ${conversationHeader.mount}></div>
          <igc-chat
            ${ref(chat)}
            .messages=${active.messages}
            .options=${optionsFor(active)}
            @igcMessageCreated=${send}
          ></igc-chat>
        </section>
      </div>
    `;
  },
};

// #endregion
