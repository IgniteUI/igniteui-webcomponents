import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcSnackbarComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import {
  disableStoryControls,
  focusAfterUpdate,
  plural,
  prefersReducedMotion,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcSnackbarComponent
);
registerMaterialIcons('arrow-down', 'delete');

// region default
const metadata: Meta<IgcSnackbarComponent> = {
  title: 'Snackbar',
  component: 'igc-snackbar',
  parameters: {
    docs: {
      description: {
        component:
          'A snackbar component is used to provide feedback about an operation\nby showing a brief message at the bottom of the screen.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /\n`"--toggle"` and `commandfor` pointing to this element will call the\ncorresponding method declaratively without any JavaScript.',
      },
    },
    actions: { handles: ['igcAction'] },
  },
  argTypes: {
    actionText: {
      type: 'string',
      description: 'The text of the action button.',
      control: 'text',
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    displayTime: {
      type: 'number',
      description:
        'Sets the time in milliseconds that the component stays visible.\nThe time stops while the pointer or the keyboard focus is in the\ncomponent, and starts again when both leave.',
      control: 'number',
      table: { defaultValue: { summary: '4000' } },
    },
    keepOpen: {
      type: 'boolean',
      description: 'Keeps the component open after the `displayTime` is over.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    position: {
      type: { name: 'enum', value: ['bottom', 'middle', 'top'] },
      description:
        'Sets the position of the component in the viewport or in the container.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
    positioning: {
      type: { name: 'enum', value: ['viewport', 'container'] },
      description:
        'Sets the positioning strategy of the component.\n\n`viewport` - positions against the viewport, ignoring every ancestor.\n`container` - positions inside the bounding box of the closest visible\nancestor, at the place that `position` sets.',
      options: ['viewport', 'container'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'viewport' } },
    },
  },
  args: {
    open: false,
    displayTime: 4000,
    keepOpen: false,
    position: 'bottom',
    positioning: 'viewport',
  },
};

export default metadata;

interface IgcSnackbarArgs {
  /** The text of the action button. */
  actionText: string;
  /** Sets the open state of the component. */
  open: boolean;
  /**
   * Sets the time in milliseconds that the component stays visible.
   * The time stops while the pointer or the keyboard focus is in the
   * component, and starts again when both leave.
   */
  displayTime: number;
  /** Keeps the component open after the `displayTime` is over. */
  keepOpen: boolean;
  /** Sets the position of the component in the viewport or in the container. */
  position: 'bottom' | 'middle' | 'top';
  /**
   * Sets the positioning strategy of the component.
   *
   * `viewport` - positions against the viewport, ignoring every ancestor.
   * `container` - positions inside the bounding box of the closest visible
   * ancestor, at the place that `position` sets.
   */
  positioning: 'viewport' | 'container';
}
type Story = StoryObj<IgcSnackbarArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .sb-panel {
      display: grid;
      gap: 1rem;
      max-width: 32rem;
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .sb-panel :is(h3, p) {
      margin: 0;
    }
  </style>
`;

export const Default: Story = {
  args: {
    actionText: 'Undo',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A confirmation that the user can act on. "Archive conversation" opens the snackbar with the invoker command `--show` and `commandfor`, without JavaScript. `actionText` renders the action button, and a click on it sends `igcAction`. Here the handler only closes the snackbar. The snackbar has the `status` role and is polite, so a screen reader reads the message, and the focus stays on the button. Use the controls panel to change the action text, the time, the position and the positioning strategy.',
      },
    },
  },
  render: (args) => html`
    <igc-snackbar
      id="sb-archived"
      ?open=${args.open}
      ?keep-open=${args.keepOpen}
      .displayTime=${args.displayTime}
      .actionText=${args.actionText}
      .position=${args.position}
      .positioning=${args.positioning}
      @igcAction=${({ target }: CustomEvent) =>
        (target as IgcSnackbarComponent).hide()}
    >
      Conversation archived
    </igc-snackbar>
    <igc-button command="--show" commandfor="sb-archived">
      Archive conversation
    </igc-button>
  `,
};

const tasks = [
  { id: 1, title: 'Book the flights to Lisbon' },
  { id: 2, title: 'Renew the passport' },
  { id: 3, title: 'Send the budget to Maya' },
  { id: 4, title: 'Pick up the dry cleaning' },
  { id: 5, title: 'Plan the team offsite' },
];

type Task = (typeof tasks)[number];

export const UndoDelete: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A task list where a delete is not final at once. A delete removes the task, moves the focus to the next delete button, and shows a snackbar with Undo for eight seconds. Undo puts the task back in its place and focuses its delete button. The snackbar follows the list in the DOM, so Tab reaches Undo after the last task. While the pointer or the keyboard focus is in the snackbar, its timer waits, and it starts again when they leave. A snackbar shows one message at a time: a new delete calls `hide()` on the open snackbar first, and the earlier delete becomes final.',
      },
    },
  },
  render: () => {
    const state = {
      tasks: [...tasks],
      deleted: undefined as { task: Task; index: number } | undefined,
      message: '',
    };
    const snackbar = createRef<IgcSnackbarComponent>();
    let removals = 0;

    const focusRow = async (index: number) => {
      const buttons =
        story.host?.querySelectorAll<IgcIconButtonComponent>('igc-icon-button');
      const button = buttons?.[Math.min(index, buttons.length - 1)];

      if (button) {
        await focusAfterUpdate(button);
      } else {
        story.host?.querySelector<HTMLElement>('.sb-empty')?.focus();
      }
    };

    const remove = async (task: Task) => {
      const index = state.tasks.indexOf(task);
      state.tasks.splice(index, 1);
      story.update();
      focusRow(index);

      const removal = ++removals;
      await snackbar.value?.hide();
      // A newer delete during the fade-out shows its own message.
      if (removal !== removals) {
        return;
      }

      state.deleted = { task, index };
      state.message = `"${task.title}" deleted`;
      story.update();
      snackbar.value?.show();
    };

    const undo = () => {
      const { deleted } = state;
      if (!deleted) {
        return;
      }

      state.deleted = undefined;
      state.tasks.splice(
        Math.min(deleted.index, state.tasks.length),
        0,
        deleted.task
      );
      story.update();
      focusRow(state.tasks.indexOf(deleted.task));
      snackbar.value?.hide();
    };

    const story = renderInto(
      () => html`
        <section class="sb-panel" aria-labelledby="sb-tasks-title">
          <h3 id="sb-tasks-title">Today</h3>
          ${
            state.tasks.length
              ? html`
                  <ul class="sb-tasks">
                    ${repeat(
                      state.tasks,
                      (task) => task.id,
                      (task) => html`
                        <li>
                          <span>${task.title}</span>
                          <igc-icon-button
                            variant="flat"
                            name="delete"
                            aria-label="Delete ${task.title}"
                            @click=${() => remove(task)}
                          ></igc-icon-button>
                        </li>
                      `
                    )}
                  </ul>
                `
              : html`<p class="sb-empty muted" tabindex="-1">No tasks left.</p>`
          }
          <igc-snackbar
            ${ref(snackbar)}
            action-text="Undo"
            display-time="8000"
            @igcAction=${undo}
          >
            ${state.message}
          </igc-snackbar>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        .sb-tasks {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .sb-tasks li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-block: 0.25rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const chatHistory = [
  {
    author: 'Mia Chen',
    time: '9:02',
    text: 'Morning! The new icons are in the shared folder.',
  },
  {
    author: 'Leo Novak',
    time: '9:05',
    text: 'Thanks, they look great at small sizes.',
  },
  {
    author: 'Ana Silva',
    time: '9:11',
    text: 'Do we still need the outlined set?',
  },
  { author: 'Mia Chen', time: '9:12', text: 'Yes, for the empty states.' },
  {
    author: 'Leo Novak',
    time: '9:20',
    text: 'I moved the design review to Thursday at 10.',
  },
  { author: 'Ana Silva', time: '9:24', text: 'Works for me.' },
  {
    author: 'Mia Chen',
    time: '9:31',
    text: 'Can someone check the cards in the dark theme?',
  },
  {
    author: 'Leo Novak',
    time: '9:33',
    text: 'On it. The borders are too faint.',
  },
  {
    author: 'Ana Silva',
    time: '9:40',
    text: 'The new spacing tokens are merged.',
  },
  { author: 'Mia Chen', time: '9:42', text: 'Nice, I will update the specs.' },
];

const incomingMessages = [
  {
    author: 'Leo Novak',
    text: 'Fixed the card borders. The preview is up.',
  },
  {
    author: 'Ana Silva',
    text: 'Who owns the onboarding screens this sprint?',
  },
  { author: 'Mia Chen', text: 'I do. Drafts by Friday.' },
  { author: 'Leo Novak', text: 'Lunch at 12:30?' },
];

/** The time of the n-th new message: one minute after the last one. */
function messageTime(n: number) {
  const minutes = 9 * 60 + 42 + n;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

export const NewMessages: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A team chat. When a message arrives while the user reads older messages, the chat does not scroll. Instead, a snackbar in the chat counts the new messages. `positioning="container"` positions the snackbar in the chat panel, and `keep-open` keeps it open until the user reaches the latest message. The snackbar follows the message list in the DOM, so Tab reaches its action after the list. The `action` slot holds an `igc-button` with an icon, and a click in the slot sends `igcAction`. "Jump to latest" scrolls to the end and closes the snackbar. When the focus was on the button, it moves to the message list. Scroll up in the chat, then select "Simulate a new message".',
      },
    },
  },
  render: () => {
    const state = { messages: [...chatHistory], unread: 0 };
    let log: HTMLElement | undefined;
    const snackbar = createRef<IgcSnackbarComponent>();

    const logRef = ref((element) => {
      log = element as HTMLElement | undefined;
      // Open the chat at the latest message, after Lit renders the messages.
      requestAnimationFrame(() => log?.scrollTo({ top: log.scrollHeight }));
    });

    const atEnd = (list: HTMLElement) =>
      list.scrollHeight - list.scrollTop - list.clientHeight < 8;

    // No render here, so the snackbar keeps its count while it fades out.
    const markRead = () => {
      state.unread = 0;
      snackbar.value?.hide();
    };

    const receive = () => {
      if (!log) {
        return;
      }

      const follow = atEnd(log);
      const received = state.messages.length - chatHistory.length;
      const next = incomingMessages[received % incomingMessages.length];
      state.messages.push({ ...next, time: messageTime(received + 1) });

      if (follow) {
        story.update();
        log.scrollTo({ top: log.scrollHeight });
      } else {
        state.unread += 1;
        story.update();
        snackbar.value?.show();
      }
    };

    const jumpToLatest = () => {
      if (!log) {
        return;
      }

      const hadFocus = snackbar.value?.matches(':focus-within');
      log.scrollTo({
        top: log.scrollHeight,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
      markRead();

      if (hadFocus) {
        log.focus({ preventScroll: true });
      }
    };

    const onScroll = () => {
      if (state.unread && log && atEnd(log)) {
        markRead();
      }
    };

    const story = renderInto(
      () => html`
        <igc-button variant="outlined" @click=${receive}>
          Simulate a new message
        </igc-button>
        <section class="sb-chat" aria-labelledby="sb-chat-title">
          <h3 id="sb-chat-title">#design-team</h3>
          <ol
            ${logRef}
            class="sb-log"
            tabindex="0"
            aria-label="Messages"
            @scroll=${onScroll}
          >
            ${state.messages.map(
              ({ author, time, text }) => html`
                <li>
                  <p>
                    <strong>${author}</strong>
                    <span class="muted">${time}</span>
                  </p>
                  <p>${text}</p>
                </li>
              `
            )}
          </ol>
          <igc-snackbar
            ${ref(snackbar)}
            positioning="container"
            keep-open
            @igcAction=${jumpToLatest}
          >
            ${plural(state.unread, 'new message')}
            <igc-button slot="action" variant="flat">
              <igc-icon slot="prefix" name="arrow-down"></igc-icon>
              Jump to latest
            </igc-button>
          </igc-snackbar>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        .sb-chat-story {
          display: grid;
          justify-items: start;
          gap: 1rem;
          max-width: 32rem;
        }

        .sb-chat {
          display: flex;
          flex-direction: column;
          justify-self: stretch;
          height: 22rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .sb-chat h3 {
          margin: 0;
          padding: 0.75rem 1rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .sb-log {
          display: grid;
          align-content: start;
          gap: 0.75rem;
          flex: 1;
          margin: 0;
          padding: 0.75rem 1rem;
          overflow: auto;
          list-style: none;
        }

        .sb-log p {
          margin: 0;
        }
      </style>
      <div class="sb-chat-story" ${story.mount}></div>
    `;
  },
};
