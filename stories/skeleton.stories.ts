import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcCircularProgressComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcNavbarComponent,
  IgcRatingComponent,
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSkeletonComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  IgcToggleButtonComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html, nothing, svg } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addDays, formatDate, today } from './story-dates.js';
import { type MaterialIconName, registerMaterialIcons } from './story-icons.js';
import {
  delay,
  disableStoryControls,
  dollars,
  plural,
  renderInto,
  storyStyles,
  wholeDollars,
} from './story.js';

defineComponents(
  IgcSkeletonComponent,
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcButtonGroupComponent,
  IgcCardComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcCircularProgressComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcNavbarComponent,
  IgcRatingComponent,
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  IgcToggleButtonComponent
);

registerMaterialIcons(
  'assessment',
  'dashboard',
  'description',
  'done-all',
  'favorite-border',
  'inbox',
  'label',
  'local-shipping',
  'menu',
  'notifications',
  'people',
  'refresh',
  'search',
  'settings',
  'shopping-cart'
);

// region default
const metadata: Meta<IgcSkeletonComponent> = {
  title: 'Skeleton',
  component: 'igc-skeleton',
  parameters: {
    docs: {
      description: {
        component:
          'A skeleton component that overlays placeholder shapes on top of projected\ncontent while it is in a loading state, then smoothly reveals the content\nonce loading is complete.',
      },
    },
  },
  argTypes: {
    loading: {
      type: 'boolean',
      description:
        'Whether the skeleton is in a loading state.\n\nWhile loading, shapes cover the hidden, inert content, which fades in when\nloading ends.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    animation: {
      type: {
        name: 'enum',
        value: ['pulse', 'breathe', 'shimmer', 'wave', 'glow'],
      },
      description:
        'Defines the animation style for the skeleton when in a loading state.\n\n- `pulse`: A pulsing animation that fades the shapes in and out.\n- `breathe`: A subtle breathing animation that fades and slightly scales the shapes.\n- `shimmer`: A horizontal highlight sweep across each shape.\n- `wave`: A staggered vertical bounce across shapes.\n- `glow`: A pulsing box-shadow glow on each shape.',
      options: ['pulse', 'breathe', 'shimmer', 'wave', 'glow'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'breathe' } },
    },
  },
  args: { loading: false, animation: 'breathe' },
};

export default metadata;

interface IgcSkeletonArgs {
  /**
   * Whether the skeleton is in a loading state.
   *
   * While loading, shapes cover the hidden, inert content, which fades in when
   * loading ends.
   */
  loading: boolean;
  /**
   * Defines the animation style for the skeleton when in a loading state.
   *
   * - `pulse`: A pulsing animation that fades the shapes in and out.
   * - `breathe`: A subtle breathing animation that fades and slightly scales the shapes.
   * - `shimmer`: A horizontal highlight sweep across each shape.
   * - `wave`: A staggered vertical bounce across shapes.
   * - `glow`: A pulsing box-shadow glow on each shape.
   */
  animation: 'pulse' | 'breathe' | 'shimmer' | 'wave' | 'glow';
}
type Story = StoryObj<IgcSkeletonArgs>;

// endregion
//#region Demo helpers

const AVATARS = 'https://www.infragistics.com/angular-demos/assets/images';
const CITY_IMAGE =
  'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?auto=format&fit=crop&w=640&q=80';

const demoStyles = html`
  ${storyStyles}
  <style>
    .sk-surface {
      display: block;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
      background: var(--ig-surface-500);
    }

    .sk-toolbar {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-block-end: 1rem;
    }

    .sk-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .sk-stack {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .sk-title {
      font-weight: 600;
    }

    .sk-text {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  </style>
`;

/** Resolves when each image is decoded or failed, so that it shows at once. */
function decodeImages(urls: string[]): Promise<unknown> {
  return Promise.all(
    urls.map((url) => {
      const image = new Image();
      image.src = url;
      return image.decode().catch(() => {});
    })
  );
}

const integers = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const dayMonth: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

type User = { name: string; role: string; avatar?: string };

const team: User[] = [
  { name: 'John Smith', role: 'Software Engineer', avatar: 'men/1.jpg' },
  { name: 'Lisa Wagner', role: 'Product Manager', avatar: 'women/1.jpg' },
  { name: 'Abraham Lee', role: 'Team Lead', avatar: 'men/2.jpg' },
  { name: 'Kate Manson', role: 'UX Designer', avatar: 'women/2.jpg' },
];

/** Placeholder rows with the shape of the real data, for the skeleton to measure. */
function placeholderUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    name: 'Loading name',
    role: 'Loading job title',
  }));
}

function avatarSrc(user: User): string | undefined {
  return user.avatar ? `${AVATARS}/${user.avatar}` : undefined;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('');
}

function profile(user: User = team[0]) {
  return html`
    <div class="sk-surface sk-stack" style="gap: 1rem;">
      <div class="sk-row">
        <igc-avatar
          shape="circle"
          src=${ifDefined(avatarSrc(user))}
          alt=${user.name}
        ></igc-avatar>
        <div class="sk-stack">
          <span class="sk-title">${user.name}</span>
          <span class="muted">${user.role}</span>
        </div>
      </div>
      <p class="sk-text">
        Passionate about building scalable systems and developer tooling.
      </p>
      <div class="sk-row" style="gap: 0.5rem; flex-wrap: wrap;">
        <igc-chip>TypeScript</igc-chip>
        <igc-chip>Lit</igc-chip>
      </div>
    </div>
  `;
}

//#endregion

export const Default: Story = {
  args: { loading: true },
  render: ({ loading, animation }) => html`
    ${demoStyles}
    <igc-skeleton
      ?loading=${loading}
      animation=${animation}
      style="width: 320px;"
    >
      ${profile()}
    </igc-skeleton>
  `,
};

//#region Dashboard

type Period = 7 | 30 | 90;
type ResponseTime = 'fast' | 'slow' | 'never';

type Kpi = { value: string; change: number; series: number[] };
type Revenue = {
  current: number[];
  previous: number[];
  total: number;
  change: number;
};
type OrderStatus = 'Paid' | 'Shipped' | 'Pending' | 'Refunded';
type RecentOrder = {
  id: number;
  customer: User;
  date: Date;
  items: number;
  status: OrderStatus;
  total: number;
};
type ActivityEntry = {
  who: string;
  action: string;
  target: string;
  detail: string;
  time: string;
};
type TopProduct = {
  name: string;
  category: string;
  image?: string;
  rating: number;
  sold: number;
  stock: number;
};
type Goal = { title: string; value: number; progress: string };
type SupportQueue = {
  open: number;
  channels: [string, number][];
  firstResponse: string;
  slaMet: number;
  agents: User[];
};
type SavedReport = { title: string; icon: MaterialIconName };

type DashboardData = {
  user: User;
  reports: SavedReport[];
  revenueKpi: Kpi;
  ordersKpi: Kpi;
  visitorsKpi: Kpi;
  conversionKpi: Kpi;
  weekdays: number[];
  revenue: Revenue;
  goals: Goal[];
  orders: RecentOrder[];
  activity: ActivityEntry[];
  support: SupportQueue;
  products: TopProduct[];
};

type DashboardPart = keyof DashboardData;

type PartState<T> = { value?: T; loading: boolean; request: number };

/** The time in milliseconds after which each part arrives, at the fast response time. */
const LATENCY: Record<DashboardPart, number> = {
  user: 300,
  reports: 600,
  revenueKpi: 700,
  ordersKpi: 900,
  visitorsKpi: 1100,
  conversionKpi: 1300,
  weekdays: 1600,
  revenue: 1900,
  goals: 2200,
  orders: 2500,
  activity: 2800,
  support: 3100,
  products: 3400,
};

const DASHBOARD_PARTS = Object.keys(LATENCY) as DashboardPart[];

/** The parts that depend on the period, which a new period loads again. */
const PERIOD_PARTS: DashboardPart[] = [
  'revenueKpi',
  'ordersKpi',
  'visitorsKpi',
  'conversionKpi',
  'weekdays',
  'revenue',
  'products',
];

const PERIODS: Period[] = [7, 30, 90];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const NAV_ITEMS: { label: string; icon: MaterialIconName }[] = [
  { label: 'Overview', icon: 'dashboard' },
  { label: 'Orders', icon: 'shopping-cart' },
  { label: 'Products', icon: 'label' },
  { label: 'Customers', icon: 'people' },
  { label: 'Reports', icon: 'assessment' },
  { label: 'Settings', icon: 'settings' },
];

type KpiPart = 'revenueKpi' | 'ordersKpi' | 'visitorsKpi' | 'conversionKpi';

const KPI_TILES: { part: KpiPart; label: string; icon: MaterialIconName }[] = [
  { part: 'revenueKpi', label: 'Revenue', icon: 'assessment' },
  { part: 'ordersKpi', label: 'Orders', icon: 'shopping-cart' },
  { part: 'visitorsKpi', label: 'Visitors', icon: 'people' },
  { part: 'conversionKpi', label: 'Conversion rate', icon: 'done-all' },
];

const customers: User[] = [
  ...team,
  { name: 'Maria Ivanova', role: 'Support agent', avatar: 'women/3.jpg' },
  { name: 'Daniel Okafor', role: 'Support agent', avatar: 'men/3.jpg' },
  { name: 'Sofia Rossi', role: 'Support agent', avatar: 'women/4.jpg' },
  { name: 'Tom Becker', role: 'Support agent', avatar: 'men/4.jpg' },
];

const ORDER_STATUSES: OrderStatus[] = [
  'Paid',
  'Paid',
  'Shipped',
  'Shipped',
  'Pending',
  'Refunded',
];

const catalog = [
  { name: 'Aria wireless headphones', category: 'Audio', perDay: 9.2 },
  { name: 'Nova smart lamp', category: 'Home', perDay: 7.1 },
  { name: 'Pulse fitness band', category: 'Wearables', perDay: 6.4 },
  { name: 'Echo mini speaker', category: 'Audio', perDay: 5 },
  { name: 'Terra water bottle', category: 'Outdoor', perDay: 4.6 },
].map((product, i) => ({
  ...product,
  image: `https://picsum.photos/seed/igc-skeleton-${i}/96/96`,
  rating: [4.6, 4.3, 4.1, 4.4, 4.8][i],
  stock: [148, 36, 12, 87, 190][i],
}));

const activity: ActivityEntry[] = [
  {
    who: 'Lisa Wagner',
    action: 'refunded',
    target: 'order #10471',
    detail: ' for $320.00, because the parcel arrived damaged.',
    time: '4 min ago',
  },
  {
    who: 'Abraham Lee',
    action: 'added',
    target: 'Pulse fitness band',
    detail: ' to the Summer picks collection.',
    time: '26 min ago',
  },
  {
    who: 'Kate Manson',
    action: 'replied to',
    target: 'ticket #2291',
    detail: '.',
    time: '1 h ago',
  },
  {
    who: 'John Smith',
    action: 'changed the price of',
    target: 'Nova smart lamp',
    detail: ' from $89.00 to $79.00.',
    time: '2 h ago',
  },
  {
    who: 'Maria Ivanova',
    action: 'shipped',
    target: '14 orders',
    detail: ' with the afternoon pickup.',
    time: '3 h ago',
  },
];

/** A random number generator with a seed, so that a period always shows the same numbers. */
function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** `count` daily values that wander around `base`. */
function dailyValues(seed: number, count: number, base: number): number[] {
  const random = seededRandom(seed);
  let value = base;

  return Array.from({ length: count }, () => {
    value += (random() - 0.48) * base * 0.25;
    value = Math.min(Math.max(value, base * 0.5), base * 1.6);
    return value;
  });
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function percentChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}

function formatChange(change: number): string {
  return `${change < 0 ? '−' : '+'}${Math.abs(change).toFixed(1)}%`;
}

/** The daily numbers of the store for `period` and for the period before. */
function storeMetrics(period: Period) {
  return {
    revenue: dailyValues(period, period, 1600),
    previousRevenue: dailyValues(period + 100, period, 1500),
    orders: dailyValues(period + 200, period, 42),
    previousOrders: dailyValues(period + 300, period, 40),
    visitors: dailyValues(period + 400, period, 1150),
    previousVisitors: dailyValues(period + 500, period, 1180),
  };
}

function countKpi(current: number[], previous: number[]): Kpi {
  return {
    value: integers.format(sum(current)),
    change: percentChange(sum(current), sum(previous)),
    series: current,
  };
}

/** Each part of the dashboard, as the server would compute it. */
const dashboardSources: {
  [K in DashboardPart]: (
    period: Period
  ) => DashboardData[K] | Promise<DashboardData[K]>;
} = {
  user: () => ({
    name: 'Lisa Wagner',
    role: 'Store manager',
    avatar: 'women/1.jpg',
  }),
  reports: () => [
    { title: 'Weekly sales', icon: 'assessment' },
    { title: 'Abandoned carts', icon: 'shopping-cart' },
    { title: 'Returning customers', icon: 'people' },
  ],
  revenueKpi: (period) => {
    const { revenue, previousRevenue } = storeMetrics(period);
    return {
      value: wholeDollars.format(sum(revenue)),
      change: percentChange(sum(revenue), sum(previousRevenue)),
      series: revenue,
    };
  },
  ordersKpi: (period) => {
    const { orders, previousOrders } = storeMetrics(period);
    return countKpi(orders, previousOrders);
  },
  visitorsKpi: (period) => {
    const { visitors, previousVisitors } = storeMetrics(period);
    return countKpi(visitors, previousVisitors);
  },
  conversionKpi: (period) => {
    const { orders, previousOrders, visitors, previousVisitors } =
      storeMetrics(period);
    const rate = (sum(orders) / sum(visitors)) * 100;
    const previousRate = (sum(previousOrders) / sum(previousVisitors)) * 100;

    return {
      value: `${rate.toFixed(1)}%`,
      change: percentChange(rate, previousRate),
      series: orders.map((count, i) => count / visitors[i]),
    };
  },
  weekdays: (period) => {
    const random = seededRandom(period + 600);
    // Weekends are busier.
    return WEEKDAYS.map((_, i) => 0.7 + random() * 0.5 + (i >= 4 ? 0.35 : 0));
  },
  revenue: (period) => {
    const { revenue, previousRevenue } = storeMetrics(period);
    return {
      current: revenue,
      previous: previousRevenue,
      total: sum(revenue),
      change: percentChange(sum(revenue), sum(previousRevenue)),
    };
  },
  goals: () => [
    { title: 'Monthly revenue', value: 74, progress: '$37,100 of $50,000' },
    { title: 'New customers', value: 58, progress: '290 of 500' },
    { title: 'Five-star reviews', value: 91, progress: '182 of 200' },
  ],
  orders: () => {
    const random = seededRandom(700);
    return Array.from({ length: 12 }, (_, i) => ({
      id: 10480 - i,
      customer: customers[(i * 5) % customers.length],
      date: addDays(today, -Math.floor(i / 3)),
      items: 1 + Math.floor(random() * 4),
      status: ORDER_STATUSES[Math.floor(random() * ORDER_STATUSES.length)],
      total: 20 + random() * 580,
    }));
  },
  activity: () => activity,
  support: () => ({
    open: 23,
    channels: [
      ['Email', 12],
      ['Chat', 8],
      ['Phone', 3],
    ],
    firstResponse: '14 min',
    slaMet: 92,
    agents: customers.slice(4),
  }),
  products: async (period) => {
    const random = seededRandom(period + 800);
    const products = catalog.map(({ perDay, ...product }) => ({
      ...product,
      sold: Math.round(perDay * period * (0.9 + random() * 0.2)),
    }));

    // The panel shows its products when their images can show too.
    await decodeImages(products.map(({ image }) => image));
    return products;
  },
};

/** Data with the shape of the real data, for the skeleton to measure before the first response. */
const dashboardPlaceholders: DashboardData = {
  user: { name: 'Loading name', role: 'Loading role' },
  reports: [
    'Loading report',
    'Loading a report name',
    'Loading report name',
  ].map((title) => ({ title, icon: 'description' as const })),
  revenueKpi: { value: '$00,000', change: 0, series: [] },
  ordersKpi: { value: '0,000', change: 0, series: [] },
  visitorsKpi: { value: '00,000', change: 0, series: [] },
  conversionKpi: { value: '0.0%', change: 0, series: [] },
  weekdays: [0.6, 0.75, 0.7, 0.85, 1, 0.9, 0.55],
  revenue: { current: [], previous: [], total: 0, change: 0 },
  goals: Array.from({ length: 3 }, () => ({
    title: 'Loading goal',
    value: 0,
    progress: '$00,000 of $00,000',
  })),
  orders: Array.from({ length: 8 }, () => ({
    id: 10000,
    customer: { name: 'Loading customer', role: '' },
    date: today,
    items: 0,
    status: 'Pending' as const,
    total: 100,
  })),
  activity: Array.from({ length: 4 }, () => ({
    who: 'Loading name',
    action: 'loading',
    target: 'the item',
    detail: ' and the rest of the loading entry.',
    time: '00 min ago',
  })),
  support: {
    open: 0,
    channels: [
      ['Email', 0],
      ['Chat', 0],
      ['Phone', 0],
    ],
    firstResponse: '00 min',
    slaMet: 0,
    agents: placeholderUsers(4),
  },
  products: catalog.map(({ category }) => ({
    name: 'Loading product name',
    category,
    rating: 0,
    sold: 100,
    stock: 0,
  })),
};

const CHART = {
  width: 640,
  height: 220,
  left: 48,
  right: 8,
  top: 10,
  bottom: 28,
};

const compactDollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
});

function changeBadge(change: number) {
  return html`
    <span class="db-change ${change < 0 ? 'db-down' : 'db-up'}">
      ${formatChange(change)}
    </span>
  `;
}

function sparkline(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / (max - min || 1)) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return html`
    <svg
      class="db-spark"
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points=${points} vector-effect="non-scaling-stroke"></polyline>
    </svg>
  `;
}

function revenueChart({ current, previous }: Revenue, period: Period) {
  const { width, height, left, right, top, bottom } = CHART;
  const step =
    Math.ceil((Math.max(...current, ...previous, 1) * 1.1) / 4 / 500) * 500;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);

  const x = (i: number, count: number) =>
    left + (i / Math.max(count - 1, 1)) * (width - left - right);
  const y = (value: number) =>
    top + (1 - value / (step * 4)) * (height - top - bottom);
  const path = (values: number[]) =>
    values
      .map(
        (value, i) =>
          `${i ? 'L' : 'M'}${x(i, values.length).toFixed(1)} ${y(value).toFixed(1)}`
      )
      .join(' ');

  return html`
    <svg
      class="db-chart"
      viewBox="0 0 640 220"
      role="img"
      aria-label="Revenue per day in the last ${period} days, and in the ${period} days before"
    >
      ${ticks.map(
        (tick) => svg`
          <line class="db-grid-line" x1=${left} x2=${width - right} y1=${y(tick)} y2=${y(tick)}></line>
          <text class="db-axis" x=${left - 8} y=${y(tick) + 4} text-anchor="end">
            ${compactDollars.format(tick)}
          </text>
        `
      )}
      ${
        current.length
          ? svg`
            <path
              class="db-area"
              d="${path(current)} L${x(current.length - 1, current.length)} ${y(0)} L${left} ${y(0)} Z"
            ></path>
            <path class="db-previous" d=${path(previous)}></path>
            <path class="db-current" d=${path(current)}></path>
          `
          : nothing
      }
      <text class="db-axis" x=${left} y=${height - 6}>
        ${formatDate(addDays(today, 1 - period), dayMonth)}
      </text>
      <text
        class="db-axis"
        x=${width - right}
        y=${height - 6}
        text-anchor="end"
      >
        Today
      </text>
    </svg>
  `;
}

function revenueBody(revenue: Revenue, period: Period) {
  return html`
    <div class="db-body">
      ${revenueChart(revenue, period)}
      <ul class="db-legend">
        <li><span class="db-swatch"></span>Last ${period} days</li>
        <li>
          <span class="db-swatch db-previous"></span>The ${period} days before
        </li>
      </ul>
      <p class="db-summary">
        <strong>
          ${revenue.total ? wholeDollars.format(revenue.total) : '$00,000'}
        </strong>
        in revenue, ${changeBadge(revenue.change)} on the ${period} days before.
      </p>
    </div>
  `;
}

function weekdaysBody(weights: number[]) {
  const total = sum(weights);
  const max = Math.max(...weights);
  const busiest = weights.indexOf(max);
  const shares = weights.map((weight) => Math.round((weight / total) * 100));
  const label = WEEKDAY_NAMES.map((day, i) => `${day} ${shares[i]}%`).join(
    ', '
  );

  return html`
    <div class="db-body">
      <div class="db-bars" role="img" aria-label="Share of orders: ${label}">
        ${weights.map(
          (weight, i) => html`
            <div class="db-bar-column">
              <div
                class="db-bar ${i === busiest ? 'db-peak' : ''}"
                style=${styleMap({ height: `${Math.round((weight / max) * 112)}px` })}
              ></div>
              <span class="db-bar-label">${WEEKDAYS[i]}</span>
            </div>
          `
        )}
      </div>
      <p class="db-summary">
        Busiest day: <strong>${WEEKDAY_NAMES[busiest]}</strong>, with
        ${shares[busiest]}% of the orders.
      </p>
    </div>
  `;
}

function goalsBody(goals: Goal[]) {
  return html`
    <ul class="db-goals">
      ${goals.map(
        (goal, i) => html`
          <li>
            <igc-circular-progress
              .value=${goal.value}
              aria-labelledby="db-goal-${i}"
            ></igc-circular-progress>
            <div class="db-text">
              <span id="db-goal-${i}" class="db-strong">${goal.title}</span>
              <span class="muted">${goal.progress}</span>
            </div>
          </li>
        `
      )}
    </ul>
  `;
}

function ordersBody(orders: RecentOrder[]) {
  return html`
    <div class="db-scroll" tabindex="0" role="region" aria-label="Order table">
      <table class="db-table" aria-labelledby="db-orders-title">
        <thead>
          <tr>
            <th><span>Order</span></th>
            <th><span>Customer</span></th>
            <th><span>Date</span></th>
            <th class="db-number">Items</th>
            <th><span>Status</span></th>
            <th class="db-number"><span>Total</span></th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(
            (order) => html`
              <tr>
                <td><a href="#">#${order.id}</a></td>
                <td>
                  <div class="db-customer">
                    <img
                      class="db-face"
                      src=${ifDefined(avatarSrc(order.customer))}
                      alt=""
                    />
                    <span>${order.customer.name}</span>
                  </div>
                </td>
                <td><span>${formatDate(order.date, dayMonth)}</span></td>
                <td class="db-number">${order.items}</td>
                <td>
                  <span
                    class="db-status"
                    data-status=${order.status.toLowerCase()}
                  >
                    ${order.status}
                  </span>
                </td>
                <td class="db-number">
                  <span>${dollars.format(order.total)}</span>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
    </div>
  `;
}

function activityBody(entries: ActivityEntry[]) {
  return html`
    <ol class="db-feed">
      ${entries.map(
        (entry) => html`
          <li>
            <igc-avatar
              shape="circle"
              initials=${initialsOf(entry.who)}
              aria-hidden="true"
            ></igc-avatar>
            <div class="db-text">
              <p>
                <strong>${entry.who}</strong> ${entry.action}
                <a href="#">${entry.target}</a>${entry.detail}
              </p>
              <span class="muted">${entry.time}</span>
            </div>
          </li>
        `
      )}
    </ol>
  `;
}

function productsBody(products: TopProduct[]) {
  return html`
    <ul class="db-products">
      ${products.map(
        (product) => html`
          <li>
            <img class="db-thumb" src=${ifDefined(product.image)} alt="" />
            <div class="db-text">
              <span class="db-strong">${product.name}</span>
              <span class="muted">${product.category}</span>
            </div>
            <div class="db-text db-end">
              <igc-rating
                readonly
                step="0.1"
                .value=${product.rating}
                aria-label="Rating of ${product.name}"
              ></igc-rating>
              <span class="muted">${integers.format(product.sold)} sold</span>
            </div>
            <meter
              min="0"
              max="200"
              low="40"
              high="120"
              optimum="200"
              .value=${product.stock}
              aria-label="Stock of ${product.name}"
            ></meter>
          </li>
        `
      )}
    </ul>
  `;
}

function supportBody(support: SupportQueue) {
  return html`
    <div class="db-body db-support">
      <div class="db-figures">
        <span class="db-value">${support.open}</span>
        <span class="muted">open tickets</span>
      </div>
      <ul class="db-channels">
        ${support.channels.map(
          ([channel, count]) => html`
            <li>${channel} <igc-badge>${count}</igc-badge></li>
          `
        )}
      </ul>
      <p>
        First response in <strong>${support.firstResponse}</strong> on average.
      </p>
      <div class="db-sla">
        <span id="db-sla-label">Tickets inside the SLA</span>
        <igc-linear-progress
          .value=${support.slaMet}
          aria-labelledby="db-sla-label"
        ></igc-linear-progress>
      </div>
      <div class="db-agents">
        <div class="db-faces">
          ${support.agents.map(
            (agent) => html`
              <igc-avatar
                shape="circle"
                src=${ifDefined(avatarSrc(agent))}
                alt=${agent.name}
              ></igc-avatar>
            `
          )}
        </div>
        <span class="muted"
          >${plural(support.agents.length, 'agent')} on shift</span
        >
      </div>
      <igc-button>
        <igc-icon slot="prefix" name="inbox"></igc-icon>
        Open the inbox
      </igc-button>
    </div>
  `;
}

const dashboardStyles = html`
  <style>
    .db-demo {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.5rem;
      align-items: center;
      margin-block-end: 1rem;
      padding: 0.75rem 1rem;
      border: 1px dashed var(--ig-gray-400);
      border-radius: 8px;
    }

    .db-demo-group {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .db-app {
      display: grid;
      grid-template-columns: 13rem minmax(0, 1fr);
      grid-template-rows: auto 1fr;
      border: 1px solid var(--ig-gray-300);
      border-radius: 12px;
      overflow: hidden;
      color: var(--ig-gray-900);
    }

    .db-app a {
      color: inherit;
    }

    .db-header {
      grid-column: 1 / -1;
      border-block-end: 1px solid var(--ig-gray-200);
    }

    .db-brand {
      font-size: 1.125rem;
      font-weight: 600;
    }

    .db-header-end {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .db-search {
      width: 16rem;
      --ig-size: var(--ig-size-small);
    }

    .db-user {
      width: fit-content;
    }

    .db-user-content {
      display: flex;
      gap: 0.625rem;
      align-items: center;
    }

    /* The navbar has its own background, so the role keeps the text color of the navbar. */
    .db-user .muted {
      color: inherit;
      font-size: 0.75rem;
    }

    .db-user igc-avatar,
    .db-feed igc-avatar,
    .db-faces igc-avatar {
      --ig-size: var(--ig-size-small);
    }

    .db-nav {
      padding: 1rem 0.75rem;
      border-inline-end: 1px solid var(--ig-gray-200);
      background: var(--ig-surface-500);
    }

    .db-nav ul {
      display: grid;
      gap: 0.125rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .db-nav a {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
    }

    .db-nav a:hover {
      background: var(--ig-gray-100);
    }

    .db-nav a[aria-current='page'] {
      background: color-mix(in srgb, var(--ig-primary-500) 14%, transparent);
      font-weight: 600;
    }

    .db-nav igc-icon {
      --ig-icon-size: 1.25rem;
    }

    .db-nav h3 {
      margin: 1.5rem 0.75rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ig-gray-700);
    }

    .db-main {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 0;
      padding: 1.25rem 1.5rem 1.5rem;
    }

    .db-progress {
      position: absolute;
      inset: 0 0 auto;
      transition: opacity 0.3s;
    }

    .db-progress.db-done {
      opacity: 0;
    }

    .db-page-header {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
      justify-content: space-between;
    }

    .db-page-header h2 {
      margin: 0;
      font-size: 1.5rem;
    }

    .db-page-header p {
      margin: 0.25rem 0 0;
    }

    .db-page-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .db-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      gap: 1rem;
    }

    .db-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      grid-auto-flow: dense;
      gap: 1rem;
      align-items: start;
    }

    .db-span-3 {
      grid-column: span 3;
    }

    .db-span-4 {
      grid-column: span 4;
    }

    .db-span-5 {
      grid-column: span 5;
    }

    .db-span-6 {
      grid-column: span 6;
    }

    .db-span-8 {
      grid-column: span 8;
    }

    .db-tall {
      grid-row: span 2;
    }

    .db-panel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-width: 0;
      padding: 1rem;
      border: 1px solid var(--ig-gray-200);
      border-radius: 10px;
      background: var(--ig-surface-500);
    }

    .db-panel-header {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: space-between;
      margin-block: -0.375rem;
    }

    .db-panel-header igc-icon-button {
      --ig-size: var(--ig-size-small);
    }

    .db-panel h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .db-note {
      display: none;
      margin: 0;
      padding: 0.5rem 0.75rem;
      border-inline-start: 3px solid var(--ig-primary-500);
      border-radius: 4px;
      background: color-mix(in srgb, var(--ig-primary-500) 8%, transparent);
      font-size: 0.8125rem;
      line-height: 1.4;
    }

    .db-inspect .db-note {
      display: block;
    }

    /* The story control that shows the content under the shapes. */
    .db-inspect igc-skeleton[loading]::part(content) {
      opacity: 0.6;
    }

    .db-inspect igc-skeleton::part(overlay) {
      opacity: 0;
    }

    .db-inspect igc-skeleton::part(shape) {
      background: color-mix(in srgb, var(--ig-primary-500) 16%, transparent);
      outline: 1px solid var(--ig-primary-500);
      outline-offset: -1px;
      box-shadow: none;
      animation: none;
    }

    .db-kpi-label {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      color: var(--ig-gray-700);
    }

    .db-kpi-label h3 {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .db-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .db-kpi .db-body {
      gap: 0.25rem;
    }

    .db-figures {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: baseline;
    }

    .db-value {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }

    .db-change {
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .db-up {
      background: color-mix(in srgb, var(--ig-success-500) 20%, transparent);
      color: color-mix(in srgb, var(--ig-success-500) 40%, var(--ig-gray-900));
    }

    .db-down {
      background: color-mix(in srgb, var(--ig-error-500) 18%, transparent);
      color: color-mix(in srgb, var(--ig-error-500) 40%, var(--ig-gray-900));
    }

    .db-spark {
      width: 100%;
      height: 2.5rem;
      margin-block-start: 0.5rem;
      fill: none;
      stroke: var(--ig-primary-500);
      stroke-width: 2;
      stroke-linejoin: round;
    }

    .db-chart {
      display: block;
      width: 100%;
      height: auto;
    }

    .db-grid-line {
      stroke: var(--ig-gray-200);
    }

    .db-axis {
      fill: var(--ig-gray-700);
      font-size: 12px;
    }

    .db-area {
      fill: color-mix(in srgb, var(--ig-primary-500) 14%, transparent);
    }

    .db-current,
    .db-previous {
      fill: none;
      stroke-linejoin: round;
    }

    .db-current {
      stroke: var(--ig-primary-500);
      stroke-width: 2.5;
    }

    .db-chart .db-previous {
      stroke: var(--ig-gray-500);
      stroke-width: 1.5;
      stroke-dasharray: 4 4;
    }

    .db-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 0.875rem;
    }

    .db-legend li {
      display: flex;
      gap: 0.375rem;
      align-items: center;
    }

    .db-swatch {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: 3px;
      background: var(--ig-primary-500);
    }

    .db-swatch.db-previous {
      background: var(--ig-gray-500);
    }

    .db-summary {
      margin: 0;
      font-size: 0.875rem;
    }

    .db-bars {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.5rem;
      align-items: end;
      align-self: stretch;
      height: 9rem;
    }

    .db-bar-column {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      align-items: center;
    }

    .db-bar {
      width: 100%;
      max-width: 1.75rem;
      border-radius: 4px 4px 0 0;
      background: var(--ig-primary-500);
    }

    .db-bar.db-peak {
      background: color-mix(
        in srgb,
        var(--ig-primary-500) 60%,
        var(--ig-gray-900)
      );
    }

    .db-bar-label {
      font-size: 0.75rem;
      color: var(--ig-gray-700);
    }

    .db-goals,
    .db-feed,
    .db-products,
    .db-channels {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .db-goals {
      display: grid;
      gap: 1rem;
    }

    .db-goals li,
    .db-feed li {
      display: flex;
      gap: 0.875rem;
      align-items: center;
    }

    /* A round source gives a round shape. */
    .db-goals igc-circular-progress {
      border-radius: 50%;
    }

    .db-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      align-items: flex-start;
      min-width: 0;
      font-size: 0.875rem;
    }

    .db-text.db-end {
      align-items: flex-end;
    }

    .db-strong {
      font-weight: 600;
    }

    .db-scroll {
      max-height: 19rem;
      overflow: auto;
    }

    .db-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .db-table th,
    .db-table td {
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--ig-gray-200);
      text-align: start;
      white-space: nowrap;
    }

    .db-table th {
      font-weight: 600;
      color: var(--ig-gray-700);
    }

    .db-table .db-number {
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .db-customer {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .db-face {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      object-fit: cover;
    }

    .db-status {
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: var(--ig-gray-200);
    }

    .db-status[data-status='paid'] {
      background: color-mix(in srgb, var(--ig-success-500) 22%, transparent);
    }

    .db-status[data-status='shipped'] {
      background: color-mix(in srgb, var(--ig-info-500) 22%, transparent);
    }

    .db-status[data-status='pending'] {
      background: color-mix(in srgb, var(--ig-warn-500) 28%, transparent);
    }

    .db-feed {
      display: grid;
      gap: 1rem;
    }

    .db-feed li {
      align-items: flex-start;
    }

    .db-feed p {
      margin: 0;
      line-height: 1.45;
    }

    .db-feed a {
      font-weight: 600;
    }

    .db-products {
      display: grid;
      gap: 0.75rem;
    }

    .db-products li {
      display: grid;
      grid-template-columns: 3rem minmax(0, 1fr) auto 4.5rem;
      gap: 0.75rem;
      align-items: center;
    }

    .db-thumb {
      width: 3rem;
      height: 3rem;
      border-radius: 8px;
      object-fit: cover;
    }

    .db-products igc-rating {
      --ig-size: var(--ig-size-small);
    }

    .db-products meter {
      width: 100%;
    }

    .db-support p {
      margin: 0;
      font-size: 0.875rem;
    }

    .db-channels {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .db-sla {
      display: grid;
      gap: 0.25rem;
      align-self: stretch;
      justify-items: start;
      font-size: 0.875rem;
    }

    .db-sla igc-linear-progress {
      justify-self: stretch;
    }

    .db-agents {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      font-size: 0.875rem;
    }

    .db-faces {
      display: flex;
    }

    .db-faces igc-avatar {
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--ig-surface-500);
    }

    .db-faces igc-avatar + igc-avatar {
      margin-inline-start: -0.5rem;
    }

    @media (max-width: 80rem) {
      .db-span-3,
      .db-span-4,
      .db-span-5 {
        grid-column: span 6;
      }

      .db-span-6,
      .db-span-8 {
        grid-column: span 12;
      }

      .db-tall {
        grid-row: auto;
      }
    }

    @media (max-width: 56rem) {
      .db-app {
        grid-template-columns: minmax(0, 1fr);
      }

      .db-nav,
      .db-search {
        display: none;
      }

      .db-grid > * {
        grid-column: span 12;
      }
    }
  </style>
`;

export const Dashboard: Story = {
  args: { animation: 'shimmer' },
  argTypes: {
    ...disableStoryControls(metadata),
    animation: metadata.argTypes!.animation,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The analytics dashboard of an online store, which loads in parts. Each panel has its own skeleton and its own request, so the panels show one by one: the user menu in the header first, the product list last, because it also waits until its images decode. The page title, the navigation and the panel titles are static, so they stay visible. A new period loads again only the panels that depend on the period, and the refresh button of a panel loads again only that panel. During a reload, a panel keeps its old data under the skeleton, so the shapes have the layout of the real data. The progress bar at the top and the status message under the title follow all the requests, because the skeleton announces nothing. The story controls above the dashboard set the response time (Never keeps the panels in the loading state) and show the content under the shapes, with a note in each panel about how the skeleton sizes its elements. The animation control applies to each skeleton.',
      },
    },
  },
  render: ({ animation }) => {
    let period: Period = 30;
    let responseTime: ResponseTime = 'fast';
    let inspect = false;
    let updatedAt: Date | undefined;

    const parts = Object.fromEntries(
      DASHBOARD_PARTS.map((part) => [part, { loading: true, request: 0 }])
    ) as { [K in DashboardPart]: PartState<DashboardData[K]> };

    async function load<K extends DashboardPart>(part: K): Promise<void> {
      const state = parts[part];
      const request = ++state.request;
      state.loading = true;
      story.update();

      if (responseTime === 'never') {
        return;
      }

      await delay(LATENCY[part] * (responseTime === 'slow' ? 3 : 1));
      const value = (await dashboardSources[part](period)) as DashboardData[K];

      // A newer request for the same part replaced this one.
      if (request === state.request) {
        state.value = value;
        state.loading = false;

        if (DASHBOARD_PARTS.every((name) => !parts[name].loading)) {
          updatedAt = new Date();
        }
        story.update();
      }
    }

    function loadAll(names = DASHBOARD_PARTS): void {
      for (const name of names) {
        load(name);
      }
    }

    /** The data of `part`, the old data during a reload, or the placeholder before the first response. */
    function valueOf<K extends DashboardPart>(part: K): DashboardData[K] {
      return parts[part].value ?? dashboardPlaceholders[part];
    }

    function selectPeriod(event: CustomEvent<string | undefined>): void {
      period = Number(event.detail) as Period;
      loadAll(PERIOD_PARTS);
    }

    function selectResponseTime(event: CustomEvent<string | undefined>): void {
      responseTime = event.detail as ResponseTime;
      loadAll();
    }

    function toggleInspect(event: Event): void {
      inspect = (event.target as IgcSwitchComponent).checked;
      story.update();
    }

    /** The links of the story go nowhere. */
    function stayOnPage(event: Event): void {
      if ((event.target as Element).closest('a[href="#"]')) {
        event.preventDefault();
      }
    }

    const skeleton = (part: DashboardPart, content: unknown) => html`
      <igc-skeleton ?loading=${parts[part].loading} animation=${animation}>
        ${content}
      </igc-skeleton>
    `;

    const panel = (
      part: DashboardPart,
      layout: string,
      title: string,
      note: string,
      content: unknown
    ) => html`
      <section class="db-panel ${layout}" aria-labelledby="db-${part}-title">
        <div class="db-panel-header">
          <h3 id="db-${part}-title">${title}</h3>
          <igc-icon-button
            variant="flat"
            name="refresh"
            aria-label="Refresh ${title}"
            @click=${() => load(part)}
          ></igc-icon-button>
        </div>
        <p class="db-note">${note}</p>
        ${skeleton(part, content)}
      </section>
    `;

    const kpiTile = ({ part, label, icon }: (typeof KPI_TILES)[number]) => {
      const kpi = valueOf(part);

      return html`
        <section class="db-panel db-kpi" aria-labelledby="db-${part}-title">
          <div class="db-kpi-label">
            <igc-icon name=${icon}></igc-icon>
            <h3 id="db-${part}-title">${label}</h3>
          </div>
          ${skeleton(
            part,
            html`
              <div class="db-body">
                <div class="db-figures">
                  <span class="db-value">${kpi.value}</span>
                  ${changeBadge(kpi.change)}
                </div>
                <span class="muted">vs. the ${period} days before</span>
                ${sparkline(kpi.series)}
              </div>
            `
          )}
        </section>
      `;
    };

    const header = () => {
      const user = valueOf('user');

      return html`
        <igc-navbar class="db-header">
          <igc-icon-button
            slot="start"
            variant="flat"
            name="menu"
            aria-label="Menu"
          ></igc-icon-button>
          <span class="db-brand">Northwind Store</span>
          <div slot="end" class="db-header-end">
            <igc-input
              class="db-search"
              type="search"
              placeholder="Search orders and products"
              aria-label="Search orders and products"
            >
              <igc-icon slot="prefix" name="search"></igc-icon>
            </igc-input>
            <igc-icon-button
              variant="flat"
              name="notifications"
              aria-label="Notifications"
            ></igc-icon-button>
            <igc-skeleton
              class="db-user"
              ?loading=${parts.user.loading}
              animation=${animation}
            >
              <div class="db-user-content">
                <igc-avatar
                  shape="circle"
                  src=${ifDefined(avatarSrc(user))}
                  alt=${user.name}
                ></igc-avatar>
                <div class="db-text">
                  <span class="db-strong">${user.name}</span>
                  <span class="muted">${user.role}</span>
                </div>
              </div>
            </igc-skeleton>
          </div>
        </igc-navbar>
      `;
    };

    const navigation = () => html`
      <nav class="db-nav" aria-label="Store">
        <ul>
          ${NAV_ITEMS.map(
            ({ label, icon }, i) => html`
              <li>
                <a
                  href="#"
                  aria-current=${ifDefined(i === 0 ? 'page' : undefined)}
                >
                  <igc-icon name=${icon}></igc-icon>${label}
                </a>
              </li>
            `
          )}
        </ul>
        <h3 id="db-reports-title">Saved reports</h3>
        ${skeleton(
          'reports',
          html`
            <ul aria-labelledby="db-reports-title">
              ${valueOf('reports').map(
                ({ title, icon }) => html`
                  <li>
                    <a href="#"><igc-icon name=${icon}></igc-icon>${title}</a>
                  </li>
                `
              )}
            </ul>
          `
        )}
      </nav>
    `;

    const story = renderInto(() => {
      const ready = DASHBOARD_PARTS.filter((part) => !parts[part].loading);
      const done = ready.length === DASHBOARD_PARTS.length;

      return html`
        <div class="db-demo" role="group" aria-label="Story controls">
          <div class="db-demo-group">
            <span id="db-response-label">Response time</span>
            <igc-button-group
              selection="single-required"
              aria-labelledby="db-response-label"
              @igcSelect=${selectResponseTime}
            >
              <igc-toggle-button value="fast" selected>Fast</igc-toggle-button>
              <igc-toggle-button value="slow">Slow</igc-toggle-button>
              <igc-toggle-button value="never">Never</igc-toggle-button>
            </igc-button-group>
          </div>
          <igc-switch ?checked=${inspect} @igcChange=${toggleInspect}>
            Show the content under the shapes
          </igc-switch>
        </div>

        <div class="db-app ${inspect ? 'db-inspect' : ''}" @click=${stayOnPage}>
          ${header()} ${navigation()}
          <main class="db-main">
            <igc-linear-progress
              class="db-progress ${done ? 'db-done' : ''}"
              .value=${ready.length}
              .max=${DASHBOARD_PARTS.length}
              hide-label
              aria-label="Dashboard loading progress"
            ></igc-linear-progress>

            <div class="db-page-header">
              <div>
                <h2>Overview</h2>
                <p class="muted" role="status">
                  ${
                    done && updatedAt
                      ? `Updated at ${updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                      : 'Loading the latest data…'
                  }
                </p>
              </div>
              <div class="db-page-actions">
                <igc-button-group
                  selection="single-required"
                  aria-label="Period"
                  @igcSelect=${selectPeriod}
                >
                  ${PERIODS.map(
                    (days) => html`
                      <igc-toggle-button
                        value=${String(days)}
                        ?selected=${days === period}
                      >
                        ${days} days
                      </igc-toggle-button>
                    `
                  )}
                </igc-button-group>
                <igc-button variant="outlined" @click=${() => loadAll()}>
                  <igc-icon slot="prefix" name="refresh"></igc-icon>
                  Refresh
                </igc-button>
              </div>
            </div>

            <p class="db-note">
              Each value is an inline span and each change is a pill with only
              text, so their shapes have the size of the text. The column does
              not stretch its items, so the line under the value is as wide as
              its text too. Each sparkline is one inline SVG, so it gets one
              shape.
            </p>
            <div class="db-kpis">${KPI_TILES.map(kpiTile)}</div>

            <div class="db-grid">
              ${panel(
                'revenue',
                'db-span-6',
                'Revenue per day',
                'The chart is one inline SVG, so it gets one shape. Each legend swatch is an empty element that keeps its radius, and each run of text next to an element gets its own shape.',
                revenueBody(valueOf('revenue'), period)
              )}
              ${panel(
                'weekdays',
                'db-span-3',
                'Orders by weekday',
                'Each bar is an empty element with a height from the data, so it gets its own shape. Before the first response, the placeholder heights draw the outline of the chart.',
                weekdaysBody(valueOf('weekdays'))
              )}
              ${panel(
                'goals',
                'db-span-3',
                'Goals',
                'Each ring is a custom element with no light DOM, so it gets one shape. The story sets a 50% radius on its host, so the shape is round.',
                goalsBody(valueOf('goals'))
              )}
              ${panel(
                'orders',
                'db-span-8',
                'Recent orders',
                'The table scrolls, so the shapes are clipped to it and follow its scroll. Scroll it while it loads. The Items cells have only text, so each shape fills its cell. The other cells put the text in inline elements, and the status pills keep their radius.',
                ordersBody(valueOf('orders'))
              )}
              ${panel(
                'activity',
                'db-span-4 db-tall',
                'Activity',
                'Each entry mixes text and inline elements. Each run of text and each inline element gets one shape for each line that it covers.',
                activityBody(valueOf('activity'))
              )}
              ${panel(
                'products',
                'db-span-5',
                `Top products, last ${period} days`,
                'The panel waits for its data and for its images. The thumbnails keep their radius, the rating is one shape, and the native meter is a leaf.',
                productsBody(valueOf('products'))
              )}
              ${panel(
                'support',
                'db-span-3',
                'Support',
                'A badge with only text is a leaf. The button has an icon and text, so the icon and the text get shapes, but the box of the button does not.',
                supportBody(valueOf('support'))
              )}
            </div>
          </main>
        </div>
      `;
    });

    loadAll();

    return html`
      ${storyStyles} ${dashboardStyles}
      <div ${story.mount}></div>
    `;
  },
};

//#endregion
//#region Product page

type ProductColor = { name: string; value: string };

type ProductDetails = {
  brand: string;
  name: string;
  rating: number;
  reviews: number;
  price: number;
  listPrice: number;
  intro: string;
  delivery: Date;
};

type Review = {
  author: User;
  rating: number;
  date: Date;
  title: string;
  text: string;
};

const PRODUCT_COLORS: ProductColor[] = [
  { name: 'Midnight', value: '#1f2937' },
  { name: 'Sand', value: '#d8c8a8' },
  { name: 'Sage', value: '#8fa98f' },
];

const SPECIFICATIONS = [
  ['Battery', 'Up to 30 hours'],
  ['Charging', 'USB-C, 10 minutes for 5 hours'],
  ['Weight', '254 g'],
  ['Connection', 'Bluetooth 5.3, 3.5 mm cable'],
];

const product: ProductDetails = {
  brand: 'Aria Audio',
  name: 'Aria Studio wireless headphones with active noise cancelling',
  rating: 4.6,
  reviews: 1284,
  price: 249,
  listPrice: 299,
  intro:
    'Studio sound for the commute and the office. Active noise cancelling adapts to the room, and the soft memory foam stays comfortable for a full day.',
  delivery: addDays(today, 3),
};

const productPlaceholder: ProductDetails = {
  brand: 'Loading brand',
  name: 'Loading the name of the product, which often wraps to two lines',
  rating: 0,
  reviews: 1000,
  price: 100,
  listPrice: 100,
  intro:
    'Loading the introduction of the product, which is a few sentences long and wraps to several lines in the column.',
  delivery: today,
};

const reviews: Review[] = [
  {
    author: team[3],
    rating: 5,
    date: addDays(today, -2),
    title: 'Quiet on the train',
    text: 'The noise cancelling blocks the train and the office chatter. The battery lasts my whole week of commuting.',
  },
  {
    author: team[0],
    rating: 4,
    date: addDays(today, -9),
    title: 'Great sound, tight fit',
    text: 'Clear and balanced sound. The headband is tight for the first few days.',
  },
  {
    author: team[1],
    rating: 5,
    date: addDays(today, -15),
    title: 'Worth the price',
    text: 'I use them for calls all day. People say that my voice is clear, even in a busy cafe.',
  },
];

function productPhotos(color: ProductColor): string[] {
  return [1, 2, 3, 4].map(
    (i) =>
      `https://picsum.photos/seed/igc-headphones-${color.name.toLowerCase()}-${i}/640/480`
  );
}

const productStyles = html`
  <style>
    .pp-crumbs {
      margin-block-end: 1rem;
      font-size: 0.875rem;
    }

    .pp-crumbs a,
    .pp-details a {
      color: inherit;
    }

    .pp-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
      gap: 2rem;
      max-width: 64rem;
    }

    .pp-gallery-content {
      display: grid;
      gap: 0.75rem;
    }

    .pp-photo {
      width: 100%;
      aspect-ratio: 4 / 3;
      border-radius: 12px;
      object-fit: cover;
    }

    .pp-thumbs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    /* The thumbnail button is a rounded clip, so the shape of its image takes its radius. */
    .pp-thumb {
      padding: 0;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      background: none;
      cursor: pointer;
    }

    .pp-thumb[aria-pressed='true'] {
      border-color: var(--ig-primary-500);
    }

    .pp-thumb img {
      display: block;
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }

    .pp-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .pp-details > * {
      margin: 0;
    }

    .pp-title {
      font-size: 1.625rem;
      line-height: 1.25;
    }

    .pp-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }

    .pp-price {
      font-size: 1.75rem;
      font-weight: 600;
    }

    .pp-save {
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--ig-error-500) 18%, transparent);
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .pp-intro {
      line-height: 1.5;
    }

    .pp-swatches {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.5rem;
    }

    .pp-swatch {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--ig-surface-500);
      border-radius: 50%;
      box-shadow: 0 0 0 1px var(--ig-gray-400);
      cursor: pointer;
    }

    .pp-swatch[aria-pressed='true'] {
      box-shadow: 0 0 0 2px var(--ig-primary-500);
    }

    .pp-buy {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 7rem;
      gap: 1rem;
      align-self: stretch;
    }

    .pp-delivery {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .pp-details details {
      align-self: stretch;
      padding-block: 0.75rem;
      border-block-start: 1px solid var(--ig-gray-300);
    }

    .pp-details summary {
      font-weight: 600;
      cursor: pointer;
    }

    .pp-specs {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.5rem 1.5rem;
      margin: 0.75rem 0 0;
    }

    .pp-specs dd {
      margin: 0;
    }

    .pp-reviews {
      max-width: 64rem;
      margin-block-start: 2.5rem;
    }

    .pp-review-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
      gap: 1rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .pp-review {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .pp-review p {
      margin: 0;
      line-height: 1.5;
    }

    .pp-review igc-rating {
      --ig-size: var(--ig-size-small);
    }

    @media (max-width: 48rem) {
      .pp-layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  </style>
`;

export const ProductPage: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A product page with parts that load separately. The details arrive first. The photos stay in the loading state until they decode, and the reviews further down the page arrive last. Pick another color to load its photos: only the gallery shows the skeleton again. The details show how the skeleton sizes different elements. The title text is in a span, so each line of it gets a shape, but the introduction is a paragraph with only text, so one shape covers all of its lines. The color swatches are empty buttons that keep their round radius. The select, the input and the icon button are custom elements with no light DOM, so each gets one shape. A closed `<details>` element gets a shape only over its summary. Each thumbnail is an image in a button that clips it with a radius, so the shape of the image takes the radius of the button.',
      },
    },
  },
  render: () => {
    let details: ProductDetails | undefined;
    let productReviews: Review[] | undefined;
    let color = PRODUCT_COLORS[0];
    let photo = 0;
    let photosReady = false;
    let photoRequest = 0;
    let pageRequest = 0;

    async function loadPhotos(): Promise<void> {
      const request = ++photoRequest;
      photosReady = false;
      story.update();

      await decodeImages(productPhotos(color));

      if (request === photoRequest) {
        photosReady = true;
        story.update();
      }
    }

    async function loadPage(): Promise<void> {
      const request = ++pageRequest;
      details = undefined;
      productReviews = undefined;
      color = PRODUCT_COLORS[0];
      photo = 0;
      loadPhotos();

      await delay(900);
      if (request !== pageRequest) return;
      details = product;
      story.update();

      await delay(1300);
      if (request !== pageRequest) return;
      productReviews = reviews;
      story.update();
    }

    function pickColor(next: ProductColor): void {
      if (next !== color) {
        color = next;
        photo = 0;
        loadPhotos();
      }
    }

    function showPhoto(index: number): void {
      photo = index;
      story.update();
    }

    const story = renderInto(() => {
      const data = details ?? productPlaceholder;
      const photos = productPhotos(color);
      const saving = Math.round((1 - data.price / data.listPrice) * 100);
      // Placeholder cards with the shape of the real reviews.
      const shownReviews: (Review | undefined)[] =
        productReviews ?? reviews.map(() => undefined);

      return html`
        <div class="sk-toolbar">
          <igc-button ?disabled=${!productReviews} @click=${loadPage}>
            Reload the page
          </igc-button>
        </div>

        <nav class="pp-crumbs" aria-label="Breadcrumb">
          <a href="#">Home</a> / <a href="#">Audio</a> /
          <span aria-current="page">Headphones</span>
        </nav>

        <div class="pp-layout">
          <igc-skeleton ?loading=${!photosReady}>
            <div class="pp-gallery-content">
              <img
                class="pp-photo"
                src=${photos[photo]}
                alt="${product.name} in ${color.name}, photo ${photo + 1} of ${photos.length}"
              />
              <div class="pp-thumbs">
                ${photos.map(
                  (src, i) => html`
                    <button
                      type="button"
                      class="pp-thumb"
                      aria-label="Photo ${i + 1}"
                      aria-pressed=${i === photo ? 'true' : 'false'}
                      @click=${() => showPhoto(i)}
                    >
                      <img src=${src} alt="" />
                    </button>
                  `
                )}
              </div>
            </div>
          </igc-skeleton>

          <igc-skeleton ?loading=${!details}>
            <div class="pp-details">
              <a href="#">${data.brand}</a>
              <h2 class="pp-title"><span>${data.name}</span></h2>
              <div class="pp-row">
                <igc-rating
                  readonly
                  step="0.1"
                  .value=${data.rating}
                  aria-label="Average rating"
                ></igc-rating>
                <a href="#pp-reviews-title">
                  ${integers.format(data.reviews)} reviews
                </a>
              </div>
              <div class="pp-row">
                <span class="pp-price">${dollars.format(data.price)}</span>
                <span class="muted">
                  List price <s>${dollars.format(data.listPrice)}</s>
                </span>
                <span class="pp-save">Save ${saving}%</span>
              </div>
              <p class="pp-intro">${data.intro}</p>
              <div role="group" aria-labelledby="pp-color-label">
                <span id="pp-color-label">
                  Color: <strong>${color.name}</strong>
                </span>
                <div class="pp-swatches">
                  ${PRODUCT_COLORS.map(
                    (option) => html`
                      <button
                        type="button"
                        class="pp-swatch"
                        style=${styleMap({ background: option.value })}
                        aria-label=${option.name}
                        aria-pressed=${option === color ? 'true' : 'false'}
                        @click=${() => pickColor(option)}
                      ></button>
                    `
                  )}
                </div>
              </div>
              <div class="pp-buy">
                <igc-select label="Warranty" value="none">
                  <igc-select-item value="none"
                    >No extra warranty</igc-select-item
                  >
                  <igc-select-item value="1y">1 year, $19.00</igc-select-item>
                  <igc-select-item value="2y">2 years, $29.00</igc-select-item>
                </igc-select>
                <igc-input
                  type="number"
                  label="Quantity"
                  value="1"
                  min="1"
                  max="5"
                ></igc-input>
              </div>
              <div class="pp-row">
                <igc-button>Add to cart</igc-button>
                <igc-icon-button
                  variant="outlined"
                  name="favorite-border"
                  aria-label="Save to the wish list"
                ></igc-icon-button>
              </div>
              <p class="pp-delivery">
                <igc-icon name="local-shipping"></igc-icon>
                Free delivery by
                <strong>${formatDate(data.delivery)}</strong>
              </p>
              <details>
                <summary>Specifications</summary>
                <dl class="pp-specs">
                  ${SPECIFICATIONS.map(
                    ([term, value]) =>
                      html`<dt>${term}</dt>
                        <dd>${value}</dd>`
                  )}
                </dl>
              </details>
              <details>
                <summary>Shipping and returns</summary>
                <p>Free delivery and free returns for 30 days.</p>
              </details>
            </div>
          </igc-skeleton>
        </div>

        <section class="pp-reviews" aria-labelledby="pp-reviews-title">
          <h3 id="pp-reviews-title">Customer reviews</h3>
          <igc-skeleton ?loading=${!productReviews}>
            <ul class="pp-review-list">
              ${shownReviews.map(
                (review) => html`
                  <li class="sk-surface pp-review">
                    <div class="sk-row" style="gap: 0.75rem;">
                      <igc-avatar
                        shape="circle"
                        src=${ifDefined(review && avatarSrc(review.author))}
                        aria-hidden="true"
                      ></igc-avatar>
                      <div class="sk-stack" style="gap: 0;">
                        <span class="sk-title">
                          ${review?.author.name ?? 'Loading name'}
                        </span>
                        <span class="muted">
                          ${formatDate(review?.date ?? today)}
                        </span>
                      </div>
                    </div>
                    <igc-rating
                      readonly
                      .value=${review?.rating ?? 0}
                      aria-label="Rating"
                    ></igc-rating>
                    <strong>${review?.title ?? 'Loading title'}</strong>
                    <p>
                      <span>
                        ${
                          review?.text ??
                          'Loading the text of the review, which is one or two sentences long.'
                        }
                      </span>
                    </p>
                  </li>
                `
              )}
            </ul>
          </igc-skeleton>
        </section>
      `;
    });

    loadPage();

    return html`
      ${demoStyles} ${productStyles}
      <div ${story.mount}></div>
    `;
  },
};

//#endregion

export const UserList: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A list that loads its data. While the request runs, the list renders placeholder rows with the shape of the real data, and the skeleton covers them. A status message announces the result to screen reader users, because the skeleton itself announces nothing.',
      },
    },
  },
  render: () => {
    let users: User[] | undefined;
    let request = 0;

    async function load(): Promise<void> {
      const current = ++request;
      users = undefined;
      story.update();

      await delay(1500);

      // Ignore a response that a newer reload replaced.
      if (current === request) {
        users = team;
        story.update();
      }
    }

    const story = renderInto(
      () => html`
        <div class="sk-toolbar">
          <igc-button ?disabled=${!users} @click=${load}>Reload</igc-button>
          <span class="muted" role="status">
            ${users ? `${users.length} team members loaded` : 'Loading…'}
          </span>
        </div>
        <igc-skeleton ?loading=${!users} style="width: 360px;">
          <igc-list class="sk-surface" style="padding: 0;">
            <igc-list-header>Team</igc-list-header>
            ${(users ?? placeholderUsers(team.length)).map(
              (user) => html`
                <igc-list-item>
                  <igc-avatar
                    slot="start"
                    shape="circle"
                    src=${ifDefined(avatarSrc(user))}
                    alt=${user.name}
                  ></igc-avatar>
                  <span slot="title">${user.name}</span>
                  <span slot="subtitle">${user.role}</span>
                </igc-list-item>
              `
            )}
          </igc-list>
        </igc-skeleton>
      `
    );

    load();

    return html`
      ${demoStyles}
      <div ${story.mount}></div>
    `;
  },
};

type Settings = {
  name: string;
  email: string;
  bio: string;
  notifications: boolean;
};

export const SettingsForm: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A form that loads saved values. While loading, the form is inert: try to tab into it or click a field before the values arrive. Each form control is a custom element with no light DOM, so it gets one shape over its whole box, with its label.',
      },
    },
  },
  render: () => {
    let settings: Settings | undefined;

    async function load(): Promise<void> {
      settings = undefined;
      story.update();

      await delay(1500);
      settings = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        bio: 'Software engineer based in Berlin.',
        notifications: true,
      };
      story.update();
    }

    const story = renderInto(
      () => html`
        <div class="sk-toolbar">
          <igc-button ?disabled=${!settings} @click=${load}>Reload</igc-button>
        </div>
        <igc-skeleton ?loading=${!settings} style="width: 360px;">
          <form class="sk-surface sk-stack" style="gap: 1rem;">
            <igc-input
              label="Display name"
              .value=${settings?.name ?? ''}
            ></igc-input>
            <igc-input
              label="Email"
              type="email"
              .value=${settings?.email ?? ''}
            ></igc-input>
            <igc-textarea
              label="Bio"
              rows="2"
              .value=${settings?.bio ?? ''}
            ></igc-textarea>
            <igc-switch .checked=${settings?.notifications ?? false}>
              Email notifications
            </igc-switch>
            <igc-checkbox>Show my profile publicly</igc-checkbox>
            <igc-button type="button">Save</igc-button>
          </form>
        </igc-skeleton>
      `
    );

    load();

    return html`
      ${demoStyles}
      <div ${story.mount}></div>
    `;
  },
};

export const ImageLoading: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A card that stays in the loading state until its image loads. The image box has a fixed size, so the layout does not move when the image arrives.',
      },
    },
  },
  render: () => {
    let loading = true;
    let version = 0;

    function reload(): void {
      loading = true;
      version += 1;
      story.update();
    }

    function reveal(): void {
      loading = false;
      story.update();
    }

    const story = renderInto(
      () => html`
        <div class="sk-toolbar">
          <igc-button ?disabled=${loading} @click=${reload}>Reload</igc-button>
        </div>
        <igc-skeleton ?loading=${loading} style="max-width: 344px;">
          <igc-card>
            <igc-card-media style="height: 194px;">
              <img
                src="${CITY_IMAGE}&sig=${version}"
                alt="New York City"
                style="width: 100%; height: 100%; object-fit: cover;"
                @load=${reveal}
                @error=${reveal}
              />
            </igc-card-media>
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                shape="rounded"
                src=${ifDefined(avatarSrc(team[0]))}
                alt=${team[0].name}
              ></igc-avatar>
              <h3 slot="title">New York</h3>
              <p slot="subtitle">City that never sleeps</p>
            </igc-card-header>
            <igc-card-content>
              <p class="sk-text">
                New York City comprises 5 boroughs sitting where the Hudson
                River meets the Atlantic Ocean.
              </p>
            </igc-card-content>
            <igc-card-actions>
              <igc-button slot="start" variant="flat">Like</igc-button>
              <igc-button slot="start" variant="flat">Learn more</igc-button>
            </igc-card-actions>
          </igc-card>
        </igc-skeleton>
      `
    );

    return html`
      ${demoStyles}
      <div ${story.mount}></div>
    `;
  },
};

type Post = { author: User; time: string; text: string; tag: string };

const posts: Post[] = [
  {
    author: team[1],
    time: '2h ago',
    text: 'We shipped the new onboarding flow today. Early numbers show a clear drop in support tickets.',
    tag: '#release',
  },
  {
    author: team[2],
    time: '5h ago',
    text: 'Reminder: the planning session moves to Thursday.',
    tag: '#team',
  },
  {
    author: team[3],
    time: '1d ago',
    text: 'New design tokens are ready for review. They cover spacing, radius and elevation, and replace the old variables.',
    tag: '#design',
  },
];

const placeholderPost: Post = {
  author: { name: 'Loading author', role: '' },
  time: '0h ago',
  text: 'Loading the text of the post, which usually wraps to a second line.',
  tag: '#loading',
};

export const LoadMore: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A feed that loads more posts on demand. Each batch has its own skeleton, so the loaded posts stay interactive while the next batch loads. Wrapped text gets one shape for each line.',
      },
    },
  },
  render: () => {
    const batches: (Post[] | undefined)[] = [];

    async function loadMore(): Promise<void> {
      const index = batches.push(undefined) - 1;
      story.update();

      await delay(1500);
      batches[index] = posts;
      story.update();
    }

    const renderPost = (post: Post) => html`
      <article class="sk-surface sk-stack" style="gap: 0.75rem;">
        <div class="sk-row">
          <igc-avatar
            shape="circle"
            src=${ifDefined(avatarSrc(post.author))}
            alt=${post.author.name}
          ></igc-avatar>
          <div class="sk-stack">
            <span class="sk-title">${post.author.name}</span>
            <span class="muted">${post.time}</span>
          </div>
        </div>
        <p class="sk-text">${post.text} <a href="#">${post.tag}</a></p>
      </article>
    `;

    const story = renderInto(
      () => html`
        <div class="sk-stack" style="gap: 1rem; max-width: 480px;">
          ${batches.map(
            (batch) => html`
              <igc-skeleton ?loading=${!batch}>
                <div class="sk-stack" style="gap: 1rem;">
                  ${(batch ?? posts.map(() => placeholderPost)).map(renderPost)}
                </div>
              </igc-skeleton>
            `
          )}
          <igc-button
            variant="outlined"
            ?disabled=${batches.includes(undefined)}
            @click=${loadMore}
          >
            Load more
          </igc-button>
        </div>
      `
    );

    loadMore();

    return html`
      ${demoStyles}
      <div ${story.mount}></div>
    `;
  },
};

export const Animations: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The five animation variants side by side. All of them stop when the user prefers reduced motion.',
      },
    },
  },
  render: () => {
    const animations = ['breathe', 'pulse', 'shimmer', 'wave', 'glow'] as const;

    return html`
      ${demoStyles}
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
        ${animations.map(
          (animation) => html`
            <div class="sk-stack" style="align-items: center;">
              <igc-skeleton
                loading
                animation=${animation}
                style="width: 240px;"
              >
                ${profile()}
              </igc-skeleton>
              <code>${animation}</code>
            </div>
          `
        )}
      </div>
    `;
  },
};

export const Styling: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The `--ig-skeleton-*` properties set the colors, and `--border-radius` sets the radius of the shapes whose source has none. The `shape` part accepts any other style.',
      },
    },
  },
  render: () => html`
    ${demoStyles}
    <style>
      .sk-brand {
        --ig-skeleton-overlay-color: var(--ig-primary-50);
        --ig-skeleton-shape-color: var(--ig-primary-200);
        --ig-skeleton-highlight-color: var(--ig-primary-100);
      }

      .sk-radius {
        --border-radius: 12px;
      }

      .sk-flat::part(shape) {
        border-radius: 0;
      }
    </style>
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
      ${[
        ['Default', ''],
        ['Brand colors', 'sk-brand'],
        ['Custom radius', 'sk-radius'],
        ['::part(shape)', 'sk-flat'],
      ].map(
        ([label, className]) => html`
          <div class="sk-stack" style="align-items: center;">
            <igc-skeleton
              loading
              animation="shimmer"
              class=${className}
              style="width: 240px;"
            >
              ${profile()}
            </igc-skeleton>
            <code>${label}</code>
          </div>
        `
      )}
    </div>
  `,
};
