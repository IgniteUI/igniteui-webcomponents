import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';

import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcCardComponent,
  IgcChipComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
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
  IgcLinearProgressComponent
);

// region default
const metadata: Meta<IgcVirtualScrollComponent> = {
  title: 'VirtualScroll',
  component: 'igc-virtual-scroll',
  parameters: {
    docs: {
      description: {
        component:
          'A virtual scroll component that efficiently renders large lists by only\nrendering the items currently visible in the viewport.',
      },
    },
    actions: { handles: ['igcStateChange', 'igcDataRequest'] },
  },
  argTypes: {
    orientation: {
      type: '"vertical" | "horizontal"',
      description: 'Scroll orientation of the virtual scroll.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    overScan: {
      type: 'number',
      description:
        'Number of extra items to render beyond the visible area of the viewport.\nHigher values reduce blank flashes during fast scrolling but may impact performance.',
      control: 'number',
      table: { defaultValue: { summary: '2' } },
    },
    estimatedItemSize: {
      type: 'number',
      description:
        'Estimated item size in pixels used before an item is measured in the DOM.\nThe engine replaces this with the actual measured size after the first render of each item.',
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
   * Higher values reduce blank flashes during fast scrolling but may impact performance.
   */
  overScan: number;
  /**
   * Estimated item size in pixels used before an item is measured in the DOM.
   * The engine replaces this with the actual measured size after the first render of each item.
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
