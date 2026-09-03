import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
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
  type VirtualScrollItemContext,
  type VirtualScrollItemTemplate,
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
  IgcBadgeComponent,
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
      type: { name: 'enum', value: ['vertical', 'horizontal'] },
      description: 'Scroll orientation of the virtual scroll.',
      options: ['vertical', 'horizontal'],
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
        'Estimated item size in pixels, used before an item is measured in the DOM.\nAfter the first render of an item, the engine replaces the estimate with the measured size.',
      control: 'number',
      table: { defaultValue: { summary: '50' } },
    },
  },
  args: { orientation: 'vertical', overScan: 2, estimatedItemSize: 50 },
};

export default metadata;

interface IgcVirtualScrollArgs {
  /** Scroll orientation of the virtual scroll. */
  orientation: 'vertical' | 'horizontal';
  /**
   * Number of extra items to render beyond the visible area of the viewport.
   * Higher values reduce blank flashes during fast scrolling but can lower performance.
   */
  overScan: number;
  /**
   * Estimated item size in pixels, used before an item is measured in the DOM.
   * After the first render of an item, the engine replaces the estimate with the measured size.
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

function generatePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => {
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

export const Vertical: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Vertical virtual scroll rendering 10,000 items. Only items within the visible viewport are rendered in the DOM.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
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

    return html`
      <igc-list>
        <igc-list-header><h2>Employees (${people.length})</h2></igc-list-header>
        <igc-virtual-scroll
          orientation=${args.orientation}
          over-scan=${args.overScan}
          estimated-item-size=${args.estimatedItemSize}
          .data=${people}
          .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
          style="height: 480px;"
        ></igc-virtual-scroll>
      </igc-list>
    `;
  },
};

export const Horizontal: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story: 'Horizontal virtual scroll rendering 10,000 cards side by side.',
      },
    },
    actions: { handles: [] },
  },
  args: {
    orientation: 'horizontal',
    estimatedItemSize: 200,
  },
  render: (args) => {
    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
      <igc-card
        style="width: 190px; height: 100%; box-sizing: border-box; margin-inline: 4px;"
      >
        <igc-card-header>
          <igc-avatar
            slot="thumbnail"
            initials=${initials(ctx.value.name)}
            shape="circle"
          ></igc-avatar>
          <h3 slot="title">${ctx.value.name}</h3>
          <h5 slot="subtitle">#${ctx.value.id}</h5>
        </igc-card-header>
        <igc-card-content>
          <igc-chip variant=${deptVariant(ctx.value.department)}
            >${ctx.value.department}</igc-chip
          >
        </igc-card-content>
      </igc-card>
    `;

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

export const HorizontalVariableWidth: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Horizontal virtual scroll with variable-width cards. Every third card is wider and includes the email address. The engine measures each rendered item and adjusts its width estimate automatically.',
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
      const isWide = ctx.index % 3 === 0;
      const width = isWide ? 280 : 190;

      return html`
        <igc-card
          style="width: ${width}px; height: 100%; box-sizing: border-box; margin-inline: 4px;"
        >
          <igc-card-header>
            <igc-avatar
              slot="thumbnail"
              initials=${initials(ctx.value.name)}
              shape="circle"
            ></igc-avatar>
            <h3 slot="title">${ctx.value.name}</h3>
            <h5 slot="subtitle">
              ${isWide ? ctx.value.email : `#${ctx.value.id}`}
            </h5>
          </igc-card-header>
          <igc-card-content>
            <igc-chip variant=${deptVariant(ctx.value.department)}
              >${ctx.value.department}</igc-chip
            >
          </igc-card-content>
        </igc-card>
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

export const VariableHeight: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates adaptive item measurement: every third item includes an additional bio line, making it taller. The engine measures each rendered item and updates its size estimate automatically.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const longBios = [
      'Leads a cross-functional team across three time zones.',
      'Specializes in scalable microservices architecture.',
      'Passionate about accessible, pixel-perfect UI.',
      'Drives product strategy and stakeholder alignment.',
      'Champions data-driven decision making.',
    ];

    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => {
      const bio =
        ctx.index % 3 === 0 ? longBios[ctx.index % longBios.length] : nothing;

      return html`
        <igc-list-item
          style="min-height: ${bio !== nothing ? '120px' : '60px'}"
        >
          <igc-avatar
            slot="start"
            initials=${initials(ctx.value.name)}
            shape="circle"
          ></igc-avatar>
          <span slot="title">${ctx.value.name}</span>
          <span slot="subtitle">${ctx.value.department} ${bio}</span>
          <igc-chip slot="end" variant=${deptVariant(ctx.value.department)}
            >${ctx.value.department}</igc-chip
          >
        </igc-list-item>
      `;
    };

    return html`
      <igc-list>
        <igc-list-header><h2>Employees (${people.length})</h2></igc-list-header>
        <igc-virtual-scroll
          orientation=${args.orientation}
          over-scan=${args.overScan}
          estimated-item-size=${args.estimatedItemSize}
          .data=${people}
          .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
          style="height: 480px;"
        ></igc-virtual-scroll>
      </igc-list>
    `;
  },
};

export const RemoteData: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `igcDataRequest` event for infinite-scroll / remote data loading. New pages are appended as the user scrolls near the end.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const PAGE_SIZE = 50;
    let loading = false;
    let items: Person[] = generatePeople(PAGE_SIZE);

    const vs = () =>
      document.querySelector<IgcVirtualScrollComponent>('#remote-vs');

    const loadMore = () => {
      if (loading) return;
      loading = true;

      // Simulate network delay
      setTimeout(
        () => {
          const next = generatePeople(PAGE_SIZE).map((p) => ({
            ...p,
            id: items.length + p.id,
            name: `${p.name} (page ${Math.floor(items.length / PAGE_SIZE) + 1})`,
          }));
          items = [...items, ...next];
          const el = vs();
          if (el) {
            el.data = items;
          }
          loading = false;
        },
        Math.random() * 1000 + 500
      );
    };

    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
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
      ${
        ctx.isLast
          ? html`<igc-linear-progress
              indeterminate
              variant="warning"
            ></igc-linear-progress>`
          : nothing
      }
    `;

    return html`
      <igc-list>
        <igc-list-header><h2>Employees</h2></igc-list-header>
        <igc-virtual-scroll
          id="remote-vs"
          orientation=${args.orientation}
          over-scan=${args.overScan}
          estimated-item-size=${args.estimatedItemSize}
          .data=${items}
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
          'Demonstrates the `scrollToIndex()` API for jumping programmatically to any item, with control over alignment (`block`) and scroll `behavior`. Items far outside the rendered window only have an *estimated* size, so the engine measures the items around the landing spot and corrects the offset over a few passes until it settles precisely - try jumping to a far-away index and watch the target item flash once it lands exactly.',
      },
    },
    actions: { handles: [] },
  },
  render: (args) => {
    const getVs = () =>
      document.querySelector<IgcVirtualScrollComponent<Person>>(
        '#scroll-to-index-vs'
      );

    const readAlign = (): ScrollLogicalPosition =>
      (document.querySelector<IgcRadioGroupComponent>('#sti-align')
        ?.value as ScrollLogicalPosition) ?? 'start';

    const readIndexField = (): number => {
      const raw =
        document.querySelector<IgcInputComponent>('#sti-index')?.value ?? '0';
      const value = Number(raw);
      return Number.isFinite(value) ? value : 0;
    };

    const writeIndexField = (index: number): void => {
      const field = document.querySelector<IgcInputComponent>('#sti-index');
      if (field) field.value = String(index);
    };

    const flashItem = (index: number): void => {
      const el = getVs()?.querySelector<HTMLElement>(
        `[data-vs-index="${index}"]`
      );
      if (!el) return;

      // Restart the animation even if the same item was just flashed.
      el.classList.remove('igc-vs-flash');
      void el.offsetWidth;
      el.classList.add('igc-vs-flash');
    };

    const goToIndex = async (index: number): Promise<void> => {
      const clamped = Math.max(0, Math.min(index, people.length - 1));
      writeIndexField(clamped);

      await getVs()?.scrollToIndex(clamped, { block: readAlign() });
      flashItem(clamped);
    };

    const itemTemplate = (ctx: VirtualScrollItemContext<Person>) => html`
      <igc-list-item>
        <igc-avatar
          slot="start"
          initials=${initials(ctx.value.name)}
          shape="circle"
        ></igc-avatar>
        <span slot="title">#${ctx.value.id} ${ctx.value.name}</span>
        <span slot="subtitle">${ctx.value.email}</span>
        <igc-chip slot="end" variant=${deptVariant(ctx.value.department)}
          >${ctx.value.department}</igc-chip
        >
      </igc-list-item>
    `;

    return html`
      <style>
        [data-vs-index].igc-vs-flash {
          outline: 3px solid var(--ig-warning-500, #f9a825);
          outline-offset: -3px;
          animation: igc-vs-flash-fade 1.2s ease-out forwards;
        }
        @keyframes igc-vs-flash-fade {
          from {
            outline-color: var(--ig-warning-500, #f9a825);
          }
          to {
            outline-color: transparent;
          }
        }
        .sti-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          margin-block-end: 1rem;
        }
        .sti-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      </style>
      <div class="sti-toolbar">
        <igc-input
          id="sti-index"
          type="number"
          label="Index"
          min="0"
          max=${people.length - 1}
          value="0"
          style="width: 8rem;"
        ></igc-input>
        <igc-radio-group
          name="alignment"
          id="sti-align"
          alignment="horizontal"
          value="start"
        >
          <igc-radio value="start">Start</igc-radio>
          <igc-radio value="center">Center</igc-radio>
          <igc-radio value="end">End</igc-radio>
        </igc-radio-group>
        <div class="sti-actions">
          <igc-button @click=${() => goToIndex(readIndexField())}
            >Go</igc-button
          >
          <igc-button variant="outlined" @click=${() => goToIndex(0)}
            >First</igc-button
          >
          <igc-button
            variant="outlined"
            @click=${() => goToIndex(Math.floor(people.length / 2))}
            >Middle</igc-button
          >
          <igc-button
            variant="outlined"
            @click=${() => goToIndex(people.length - 1)}
            >Last</igc-button
          >
          <igc-button
            variant="outlined"
            @click=${() => goToIndex(Math.floor(Math.random() * people.length))}
            >Random</igc-button
          >
        </div>
      </div>
      <igc-list>
        <igc-list-header><h2>Employees (${people.length})</h2></igc-list-header>
        <igc-virtual-scroll
          id="scroll-to-index-vs"
          orientation=${args.orientation}
          over-scan=${args.overScan}
          estimated-item-size=${args.estimatedItemSize}
          .data=${people}
          .itemTemplate=${itemTemplate as VirtualScrollItemTemplate<unknown>}
          style="height: 480px;"
        ></igc-virtual-scroll>
      </igc-list>
    `;
  },
};
