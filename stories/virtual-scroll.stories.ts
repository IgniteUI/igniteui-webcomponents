import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcVirtualScrollComponent,
  type VirtualScrollDataRequest,
  type VirtualScrollItemContext,
  type VirtualScrollItemTemplate,
  type VirtualScrollKeyFunction,
  type VirtualScrollState,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcVirtualScrollComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcAvatarComponent,
  IgcChipComponent,
  IgcCardComponent,
  IgcLinearProgressComponent,
  IgcButtonComponent,
  IgcInputComponent,
  IgcCheckboxComponent,
  IgcRadioGroupComponent,
  IgcRadioComponent
);

// region default
const metadata: Meta<IgcVirtualScrollComponent> = {
  title: 'VirtualScroll',
  component: 'igc-virtual-scroll',
  parameters: {
    docs: {
      description: {
        component:
          'A virtual scroll component for large lists. Only the items visible in the\nviewport are rendered.',
      },
    },
    actions: { handles: ['igcStateChange', 'igcDataRequest'] },
  },
  argTypes: {
    orientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'Scroll orientation of the virtual scroll.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    overScan: {
      type: 'number',
      description:
        'Number of extra items to render beyond the visible area of the viewport.\nHigher values reduce blank flashes during fast scrolling but can lower performance.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    estimatedItemSize: {
      type: 'number',
      description:
        'Estimated item size in pixels, used before an item is measured in the DOM.\nAfter the first render of an item, the engine replaces the estimate with the measured size.\nThe average measured size also replaces the estimate of the items that are not measured\nyet, so the scrollbar follows the real content.',
      control: 'number',
      table: { defaultValue: { summary: '50' } },
    },
  },
  args: { orientation: 'vertical', overScan: 2, estimatedItemSize: 50 },
};

export default metadata;

interface IgcVirtualScrollArgs {
  /** Scroll orientation of the virtual scroll. */
  orientation: 'horizontal' | 'vertical';
  /**
   * Number of extra items to render beyond the visible area of the viewport.
   * Higher values reduce blank flashes during fast scrolling but can lower performance.
   */
  overScan: number;
  /**
   * Estimated item size in pixels, used before an item is measured in the DOM.
   * After the first render of an item, the engine replaces the estimate with the measured size.
   * The average measured size also replaces the estimate of the items that are not measured
   * yet, so the scrollbar follows the real content.
   */
  estimatedItemSize: number;
}
type Story = StoryObj<IgcVirtualScrollArgs>;

// endregion

interface Person {
  id: number;
  name: string;
  email: string;
  department: string;
}

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Legal',
  'Operations',
];

const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Carol',
  'David',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Noah',
  'Olivia',
  'Paul',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Wilson',
  'Moore',
  'Taylor',
  'Anderson',
  'Thomas',
  'Jackson',
];

const CHIP_VARIANTS = [
  'primary',
  'info',
  'success',
  'warning',
  'danger',
] as const;

type ChipVariant = (typeof CHIP_VARIANTS)[number];

function deptVariant(dept: string): ChipVariant {
  return CHIP_VARIANTS[DEPARTMENTS.indexOf(dept) % CHIP_VARIANTS.length];
}

function initials(name: string): string {
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name[0];
}

/** Makes `count` people, with the ids and names that follow `start`. */
function generatePeople(count: number, start = 0): Person[] {
  return Array.from({ length: count }, (_, offset) => {
    const i = start + offset;
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last =
      LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i > FIRST_NAMES.length * LAST_NAMES.length ? i : ''}@example.com`,
      department: dept,
    };
  });
}

const people = generatePeople(10_000);

const personTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
  <igc-list-item>
    <igc-avatar
      slot="start"
      initials=${initials(ctx.value.name)}
      shape="circle"
    ></igc-avatar>
    <span slot="title">${ctx.value.name}</span>
    <span slot="subtitle">${ctx.value.email}</span>
    <igc-chip slot="end" variant=${deptVariant(ctx.value.department)}
      >${ctx.value.department}</igc-chip
    >
  </igc-list-item>
`;

/** Returns the story root of the event target. */
function storyRoot(event: Event, selector: string): HTMLElement {
  return (event.currentTarget as HTMLElement).closest<HTMLElement>(selector)!;
}

export const Default: Story = {
  argTypes: {
    orientation: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        story:
          'An employee directory of 10,000 people. The component renders only the items in the viewport and `over-scan` extra items on each side, and reuses their elements while the user scrolls. The line above the list shows the rendered window from `igcStateChange`. Use the controls panel to change `overScan` and `estimatedItemSize`.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const showState = (event: CustomEvent<VirtualScrollState>) => {
      const { startIndex, endIndex, totalSize } = event.detail;
      storyRoot(event, '.vs-directory').querySelector('p')!.textContent =
        `Rendered items ${startIndex + 1} to ${endIndex + 1} (${endIndex - startIndex + 1} elements) of ${people.length}. Content size: ${Math.round(totalSize).toLocaleString()} px.`;
    };

    return html`
      <div class="vs-directory">
        <p>Scroll the list to see the rendered window.</p>
        <igc-list>
          <igc-list-header
            ><h2>Employees (${people.length})</h2></igc-list-header
          >
          <igc-virtual-scroll
            over-scan=${args.overScan}
            estimated-item-size=${args.estimatedItemSize}
            .data=${people}
            .itemTemplate=${personTemplate as VirtualScrollItemTemplate<unknown>}
            @igcStateChange=${showState}
            style="height: 480px;"
          ></igc-virtual-scroll>
        </igc-list>
      </div>
    `;
  },
};

export const Horizontal: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A horizontal strip of 10,000 team cards, for example a "People you work with" row on a dashboard. `orientation="horizontal"` scrolls on the inline axis, so a wheel scrolls it with <kbd>Shift</kbd>. The cards take the width of their content, and every third card also shows the email. The component measures each rendered card, so the cards can have different widths with no configuration.',
      },
    },
    actions: { handles: [] },
  },
  args: {
    orientation: 'horizontal',
    estimatedItemSize: 200,
  },
  render: (args) => {
    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => {
      const showEmail = ctx.index % 3 === 0;

      // Padding, not a margin, separates the cards: margins are not measured.
      return html`
        <div style="height: 100%; box-sizing: border-box; padding-inline: 4px;">
          <igc-card
            style="width: max-content; min-width: 190px; height: 100%; box-sizing: border-box;"
          >
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                initials=${initials(ctx.value.name)}
                shape="circle"
              ></igc-avatar>
              <h3 slot="title">${ctx.value.name}</h3>
              <span slot="subtitle">
                ${showEmail ? ctx.value.email : `#${ctx.value.id}`}
              </span>
            </igc-card-header>
            <igc-card-content>
              <igc-chip variant=${deptVariant(ctx.value.department)}
                >${ctx.value.department}</igc-chip
              >
            </igc-card-content>
          </igc-card>
        </div>
      `;
    };

    return html`
      <igc-virtual-scroll
        orientation=${args.orientation}
        over-scan=${args.overScan}
        estimated-item-size=${args.estimatedItemSize}
        .data=${people}
        .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
        style="height: 220px;"
      ></igc-virtual-scroll>
    `;
  },
};

interface Message {
  id: number;
  author: string;
  own: boolean;
  time: string;
  text: string;
}

const SENTENCES = [
  'Can you review the pull request before the stand-up?',
  'The build is green again.',
  'I moved the release to Thursday, because QA needs one more day for the regression pass.',
  'Sounds good.',
  'The customer reported that the export button does nothing in Safari. I can reproduce it with the latest version, and the console shows no errors.',
  'Thanks!',
  'Let us pair on it after lunch.',
  'I updated the design file with the new empty states and the error messages.',
];

function generateMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) => {
    const own = i % 3 === 1;
    const length = 1 + ((i * 7) % 3);
    const minutes = i % (24 * 60);

    return {
      id: i + 1,
      author: own ? 'You' : FIRST_NAMES[i % FIRST_NAMES.length],
      own,
      time: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
      text: Array.from(
        { length },
        (_, s) => SENTENCES[(i + s * 3) % SENTENCES.length]
      ).join(' '),
    };
  });
}

export const VariableHeight: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A message thread of 5,000 messages with text of different lengths. The component measures the border box of each rendered item, so the items can have any height. The template uses padding, not margins, for the space between messages, because margins are not measured and add up to drift. The thread opens at the newest message: after the first render, `scrollToIndex()` scrolls to the last index with `block: "end"`. The items have no focusable content, so `tabindex="0"` on the host lets a keyboard user focus the thread and scroll it with the arrow keys.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const messages = generateMessages(5_000);

    const itemTemplate = (ctx: VirtualScrollItemContext<Message>) => html`
      <div class="vs-message ${ctx.value.own ? 'own' : ''}">
        <div class="bubble">
          <div class="meta">
            <strong>${ctx.value.author}</strong>
            <time>${ctx.value.time}</time>
          </div>
          <p>${ctx.value.text}</p>
        </div>
      </div>
    `;

    const openAtEnd = async (element?: Element) => {
      if (element instanceof IgcVirtualScrollComponent) {
        await element.updateComplete;
        await element.scrollToIndex(messages.length - 1, { block: 'end' });
      }
    };

    return html`
      <style>
        .vs-thread {
          max-width: 40rem;
          height: 480px;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .vs-message {
          display: flex;
          padding: 0.375rem 0.75rem;
        }

        .vs-message.own {
          justify-content: flex-end;
        }

        .vs-message .bubble {
          max-width: 75%;
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          background: var(--ig-gray-100);
          color: var(--ig-gray-900);
        }

        .vs-message.own .bubble {
          background: var(--ig-primary-500);
          color: var(--ig-primary-500-contrast);
        }

        .vs-message .meta {
          display: flex;
          gap: 0.5rem;
          font-size: 0.75rem;
        }

        .vs-message p {
          margin: 0.25rem 0 0;
        }
      </style>

      <igc-virtual-scroll
        class="vs-thread"
        tabindex="0"
        aria-label="Message thread"
        over-scan=${args.overScan}
        estimated-item-size="72"
        .data=${messages}
        .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
        ${ref(openAtEnd)}
      ></igc-virtual-scroll>
    `;
  },
};

export const RemoteData: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Infinite scrolling from a server. When the rendered window comes within five items of the end of `data`, the component emits `igcDataRequest` with the first missing index and a count. The handler loads the page and assigns a new array, because the component compares `data` by reference. This demo stops at 500 people and simulates the network delay.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const PAGE_SIZE = 50;
    const TOTAL = 500;
    let loading = false;

    const fetchPage = (start: number, count: number): Promise<Person[]> =>
      new Promise((resolve) =>
        setTimeout(
          () => resolve(generatePeople(Math.min(count, TOTAL - start), start)),
          500 + Math.random() * 1000
        )
      );

    const loadMore = async (event: CustomEvent<VirtualScrollDataRequest>) => {
      const scroll = event.currentTarget as IgcVirtualScrollComponent<Person>;
      const header = storyRoot(event, 'igc-list').querySelector('h2')!;
      const { startIndex } = event.detail;

      if (loading || startIndex >= TOTAL) {
        return;
      }

      loading = true;
      const page = await fetchPage(
        startIndex,
        Math.max(event.detail.count, PAGE_SIZE)
      );
      scroll.data = [...scroll.data, ...page];
      header.textContent = `Employees (${scroll.data.length} of ${TOTAL} loaded)`;
      loading = false;
    };

    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
      ${personTemplate(ctx)}
      ${
        ctx.isLast
          ? ctx.count < TOTAL
            ? html`<igc-linear-progress
                indeterminate
                aria-label="Loading more people"
              ></igc-linear-progress>`
            : html`<p style="text-align: center">You reached the end.</p>`
          : nothing
      }
    `;

    return html`
      <igc-list>
        <igc-list-header
          ><h2>Employees (${PAGE_SIZE} of ${TOTAL} loaded)</h2></igc-list-header
        >
        <igc-virtual-scroll
          over-scan=${args.overScan}
          estimated-item-size=${args.estimatedItemSize}
          .data=${generatePeople(PAGE_SIZE)}
          .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
          @igcDataRequest=${loadMore}
          style="height: 480px;"
        ></igc-virtual-scroll>
      </igc-list>
    `;
  },
};

export const ScrollToIndex: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A contact directory of 5,824 people, sorted by last name, with a letter bar. A letter calls `scrollToIndex()` with the first index of that letter. The index field jumps to any item. `block` sets the alignment: `nearest` scrolls the smallest distance, and does not scroll when the item is already in view. `behavior: "smooth"` animates the scroll. The items far from the rendered window have only an estimated size, so the component measures the items at the landing point and corrects the offset until it is stable. The returned promise resolves on the final offset, and then the target item flashes.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const letters = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    const directory: Person[] = LAST_NAMES.toSorted()
      .flatMap((last) =>
        FIRST_NAMES.flatMap((first) =>
          letters.map((middle) => ({ first, middle, last }))
        )
      )
      .map(({ first, middle, last }, i) => ({
        id: i + 1,
        name: `${last}, ${first} ${middle}.`,
        email: `${first}.${middle}.${last}@example.com`.toLowerCase(),
        department: '',
      }));
    const firstIndex = new Map<string, number>();

    directory.forEach((person, index) => {
      if (!firstIndex.has(person.name[0])) {
        firstIndex.set(person.name[0], index);
      }
    });

    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
      <igc-list-item>
        <igc-avatar
          slot="start"
          initials=${initials(ctx.value.name)}
          shape="circle"
        ></igc-avatar>
        <span slot="title">${ctx.value.name}</span>
        <span slot="subtitle">#${ctx.index} · ${ctx.value.email}</span>
      </igc-list-item>
    `;

    const goToIndex = async (event: Event, index: number): Promise<void> => {
      const root = storyRoot(event, '.vs-jump');
      const scroll =
        root.querySelector<IgcVirtualScrollComponent<Person>>(
          'igc-virtual-scroll'
        )!;
      const target = Math.max(0, Math.min(index, directory.length - 1));

      root.querySelector('igc-input')!.value = String(target);

      await scroll.scrollToIndex(target, {
        block: root.querySelector('igc-radio-group')!
          .value as ScrollLogicalPosition,
        behavior: root.querySelector('igc-checkbox')!.checked
          ? 'smooth'
          : 'instant',
      });

      const item = scroll.querySelector<HTMLElement>(
        `[data-vs-index="${target}"]`
      );

      // Restart the animation when the same item flashes again.
      item?.classList.remove('vs-flash');
      void item?.offsetWidth;
      item?.classList.add('vs-flash');
    };

    const goToField = (event: Event) =>
      goToIndex(
        event,
        Number(storyRoot(event, '.vs-jump').querySelector('igc-input')!.value)
      );

    return html`
      <style>
        .vs-jump [data-vs-index].vs-flash {
          outline: 3px solid var(--ig-warning-500);
          outline-offset: -3px;
          animation: vs-flash-fade 1.2s ease-out forwards;
        }

        @keyframes vs-flash-fade {
          to {
            outline-color: transparent;
          }
        }

        .vs-jump .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          margin-block-end: 1rem;
        }

        .vs-jump nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
          margin-block-end: 1rem;
        }

        .vs-jump nav igc-button {
          min-width: 2.25rem;
        }
      </style>

      <div class="vs-jump">
        <div class="toolbar">
          <igc-input
            type="number"
            label="Index"
            min="0"
            max=${directory.length - 1}
            value="0"
            style="width: 8rem;"
            @igcChange=${goToField}
          ></igc-input>
          <igc-button @click=${goToField}>Go</igc-button>
          <igc-radio-group
            name="block"
            alignment="horizontal"
            value="start"
            aria-label="Alignment"
          >
            <igc-radio value="start">Start</igc-radio>
            <igc-radio value="center">Center</igc-radio>
            <igc-radio value="end">End</igc-radio>
            <igc-radio value="nearest">Nearest</igc-radio>
          </igc-radio-group>
          <igc-checkbox>Smooth scroll</igc-checkbox>
        </div>

        <nav aria-label="Jump to a letter">
          ${letters.map(
            (letter) => html`
              <igc-button
                variant="flat"
                ?disabled=${!firstIndex.has(letter)}
                @click=${(event: Event) =>
                  goToIndex(event, firstIndex.get(letter)!)}
                >${letter}</igc-button
              >
            `
          )}
        </nav>

        <igc-list>
          <igc-list-header
            ><h2>Contacts (${directory.length})</h2></igc-list-header
          >
          <igc-virtual-scroll
            over-scan=${args.overScan}
            estimated-item-size=${args.estimatedItemSize}
            tabindex="0"
            aria-label="Contacts"
            .data=${directory}
            .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
            style="height: 480px;"
          ></igc-virtual-scroll>
        </igc-list>
      </div>
    `;
  },
};

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  done: boolean;
}

const TASK_VERBS = ['Review', 'Fix', 'Write', 'Update', 'Test', 'Plan'];
const TASK_TOPICS = [
  'the login form',
  'the release notes',
  'the onboarding flow',
  'the API docs',
  'the billing page',
  'the dark theme',
  'the search results',
];
const PRIORITIES = ['High', 'Medium', 'Low'] as const;
const PRIORITY_VARIANTS = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
} as const;

const taskKey = ((task: Task) => task.id) as VirtualScrollKeyFunction<unknown>;

export const KeyedItems: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A task list of 10,000 tasks that the user can sort, filter and complete. The component reuses item elements, so the template binds all item state: `checked` uses `live()`, because the user changes it, and the change handler writes the new state back to the task, because an element that shows the task later reads it from there. `keyFunction` returns the task id, so a task that a sort or a filter moves inside the rendered window keeps its element, together with element state such as focus. Without it, each index keeps its element and shows the new task at that index.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const tasks: Task[] = Array.from({ length: 10_000 }, (_, i) => ({
      id: i + 1,
      title: `${TASK_VERBS[i % TASK_VERBS.length]} ${TASK_TOPICS[i % TASK_TOPICS.length]}`,
      priority: PRIORITIES[(i * 7) % PRIORITIES.length],
      done: i % 5 === 0,
    }));

    const compare: Record<string, (a: Task, b: Task) => number> = {
      id: (a, b) => a.id - b.id,
      title: (a, b) => a.title.localeCompare(b.title) || a.id - b.id,
      priority: (a, b) =>
        PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) ||
        a.id - b.id,
    };

    const refresh = (event: Event) => {
      const root = storyRoot(event, '.vs-tasks');
      const scroll =
        root.querySelector<IgcVirtualScrollComponent<Task>>(
          'igc-virtual-scroll'
        )!;
      const sort = root.querySelector('igc-radio-group')!.value;
      const hideDone = root.querySelector<IgcCheckboxComponent>(
        '.toolbar igc-checkbox'
      )!.checked;

      scroll.data = tasks
        .filter((task) => !(hideDone && task.done))
        .sort(compare[sort]);

      root.querySelector('output')!.value =
        `${tasks.filter((task) => !task.done).length} open tasks, ${scroll.data.length} shown`;
    };

    const toggleTask = (task: Task) => (event: Event) => {
      task.done = (event.currentTarget as IgcCheckboxComponent).checked;
      refresh(event);
    };

    const itemTemplate = (ctx: VirtualScrollItemContext<Task>) => html`
      <igc-list-item>
        <igc-checkbox
          slot="start"
          .checked=${live(ctx.value.done)}
          @igcChange=${toggleTask(ctx.value)}
          >${ctx.value.title}</igc-checkbox
        >
        <span slot="subtitle">Task ${ctx.value.id}</span>
        <igc-chip slot="end" variant=${PRIORITY_VARIANTS[ctx.value.priority]}
          >${ctx.value.priority}</igc-chip
        >
      </igc-list-item>
    `;

    return html`
      <div class="vs-tasks">
        <div
          class="toolbar"
          style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-block-end: 1rem;"
        >
          <igc-radio-group
            name="sort"
            alignment="horizontal"
            value="id"
            aria-label="Sort by"
            @igcChange=${refresh}
          >
            <igc-radio value="id">Task number</igc-radio>
            <igc-radio value="title">Title</igc-radio>
            <igc-radio value="priority">Priority</igc-radio>
          </igc-radio-group>
          <igc-checkbox @igcChange=${refresh}>Hide completed</igc-checkbox>
          <output
            >${tasks.filter((task) => !task.done).length} open tasks</output
          >
        </div>

        <igc-list>
          <igc-list-header><h2>Tasks</h2></igc-list-header>
          <igc-virtual-scroll
            over-scan=${args.overScan}
            estimated-item-size=${args.estimatedItemSize}
            .data=${tasks}
            .keyFunction=${taskKey}
            .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
            style="height: 480px;"
          ></igc-virtual-scroll>
        </igc-list>
      </div>
    `;
  },
};
