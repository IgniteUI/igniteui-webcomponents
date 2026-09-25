import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcSkeletonComponent,
  IgcSwitchComponent,
  IgcTextareaComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { html, render, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcSkeletonComponent,
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcInputComponent,
  IgcListComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcSwitchComponent,
  IgcTextareaComponent
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
      margin-block: 1rem;
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

    .sk-muted {
      color: var(--ig-gray-700);
      font-size: 0.875rem;
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

/** Resolves with `value` after `delay` milliseconds, like a network request. */
function simulateFetch<T>(value: T, delay = 1500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
}

/**
 * Renders a stateful demo. `setup` runs once, keeps the demo state in its
 * closure, and returns the view. Call `update` after a state change.
 */
function interactive(
  setup: (update: () => void) => () => TemplateResult
): TemplateResult {
  let container: HTMLElement | undefined;
  let view: (() => TemplateResult) | undefined;

  const update = (): void => {
    if (container && view) {
      render(view(), container);
    }
  };

  view = setup(update);

  return html`<div
    ${ref((element) => {
      container = element as HTMLElement | undefined;
      update();
    })}
  ></div>`;
}

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
          <span class="sk-muted">${user.role}</span>
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

export const Animations: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const animations = ['breathe', 'pulse', 'shimmer', 'wave', 'glow'] as const;

    return html`
      ${demoStyles}
      <p>
        The five animation variants side by side. All of them stop when the user
        prefers reduced motion.
      </p>
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

export const UserList: Story = {
  argTypes: disableStoryControls(metadata),
  render: () =>
    interactive((update) => {
      let users: User[] | undefined;
      let request = 0;

      async function load(): Promise<void> {
        const current = ++request;
        users = undefined;
        update();

        const result = await simulateFetch(team);

        // Ignore a response that a newer reload superseded.
        if (current === request) {
          users = result;
          update();
        }
      }

      load();

      return () => html`
        ${demoStyles}
        <p>
          A list that loads its data. While the request runs, the list renders
          placeholder rows with the shape of the real data, and the skeleton
          covers them. A status message announces the result to screen reader
          users, because the skeleton itself announces nothing.
        </p>
        <div class="sk-toolbar">
          <igc-button ?disabled=${!users} @click=${load}>Reload</igc-button>
          <span class="sk-muted" role="status">
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
      `;
    }),
};

type Metric = { label: string; value: string; trend: string };

const metrics: Metric[] = [
  { label: 'Revenue', value: '$48,210', trend: '+12% this month' },
  { label: 'Orders', value: '1,284', trend: '+4% this month' },
  { label: 'Visitors', value: '32,907', trend: '-2% this month' },
  { label: 'Conversion', value: '3.9%', trend: '+0.3 pts this month' },
];

export const Dashboard: Story = {
  argTypes: disableStoryControls(metadata),
  render: () =>
    interactive((update) => {
      let values: (Metric | undefined)[] = [];
      let request = 0;

      function refresh(): void {
        const current = ++request;
        values = metrics.map(() => undefined);
        update();

        // Each tile has its own request, so each tile reveals on its own.
        metrics.forEach(async (metric, i) => {
          const result = await simulateFetch(metric, 600 * (i + 1));

          if (current === request) {
            values[i] = result;
            update();
          }
        });
      }

      refresh();

      return () => html`
        ${demoStyles}
        <p>
          Independent loading regions. The tile labels are static, so only the
          values are inside a skeleton, and each tile reveals when its own
          request completes.
        </p>
        <div class="sk-toolbar">
          <igc-button
            ?disabled=${values.some((value) => !value)}
            @click=${refresh}
          >
            Refresh
          </igc-button>
        </div>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; max-width: 800px;"
        >
          ${metrics.map(
            ({ label }, i) => html`
              <div class="sk-surface sk-stack">
                <span class="sk-muted">${label}</span>
                <igc-skeleton ?loading=${!values[i]} animation="shimmer">
                  <div class="sk-stack">
                    <span style="font-size: 1.75rem; font-weight: 600;">
                      ${values[i]?.value ?? '00,000'}
                    </span>
                    <span class="sk-muted">
                      ${values[i]?.trend ?? 'Loading trend'}
                    </span>
                  </div>
                </igc-skeleton>
              </div>
            `
          )}
        </div>
      `;
    }),
};

type Order = { id: string; customer: string; date: string; total: string };

const orders: Order[] = [
  { id: '#10241', customer: 'Lisa Wagner', date: 'Sep 21', total: '$320.00' },
  { id: '#10242', customer: 'John Smith', date: 'Sep 22', total: '$89.50' },
  { id: '#10243', customer: 'Kate Manson', date: 'Sep 22', total: '$1,240.00' },
  { id: '#10244', customer: 'Abraham Lee', date: 'Sep 23', total: '$56.20' },
  { id: '#10245', customer: 'Maria Ivanova', date: 'Sep 24', total: '$410.75' },
];

const placeholderOrder: Order = {
  id: '#00000',
  customer: 'Loading customer',
  date: 'Sep 00',
  total: '$000.00',
};

export const DataTable: Story = {
  argTypes: disableStoryControls(metadata),
  render: () =>
    interactive((update) => {
      let rows: Order[] | undefined;

      async function load(): Promise<void> {
        rows = undefined;
        update();
        rows = await simulateFetch(orders);
        update();
      }

      load();

      const cell = 'padding: 0.5rem 1rem; text-align: start;';

      return () => html`
        ${demoStyles}
        <p>
          A table of orders. A cell with only text is a leaf, so its shape
          covers the whole cell. Wrap the text in a <code>&lt;span&gt;</code>
          to get a shape the size of the text, as the cells below do.
        </p>
        <div class="sk-toolbar">
          <igc-button ?disabled=${!rows} @click=${load}>Reload</igc-button>
        </div>
        <igc-skeleton ?loading=${!rows} animation="pulse">
          <table class="sk-surface" style="border-collapse: collapse;">
            <thead>
              <tr>
                ${['Order', 'Customer', 'Date', 'Total'].map(
                  (label) => html`<th style=${cell}><span>${label}</span></th>`
                )}
              </tr>
            </thead>
            <tbody>
              ${(rows ?? orders.map(() => placeholderOrder)).map(
                (order) => html`
                  <tr style="border-top: 1px solid var(--ig-gray-300);">
                    <td style=${cell}><span>${order.id}</span></td>
                    <td style=${cell}><span>${order.customer}</span></td>
                    <td style=${cell}><span>${order.date}</span></td>
                    <td style=${cell}><span>${order.total}</span></td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </igc-skeleton>
      `;
    }),
};

type Settings = {
  name: string;
  email: string;
  bio: string;
  notifications: boolean;
};

export const SettingsForm: Story = {
  argTypes: disableStoryControls(metadata),
  render: () =>
    interactive((update) => {
      let settings: Settings | undefined;

      async function load(): Promise<void> {
        settings = undefined;
        update();
        settings = await simulateFetch({
          name: 'John Smith',
          email: 'john.smith@example.com',
          bio: 'Software engineer based in Berlin.',
          notifications: true,
        });
        update();
      }

      load();

      return () => html`
        ${demoStyles}
        <p>
          A form that loads saved values. While loading, the form is inert: try
          to tab into it or click a field before the values arrive.
        </p>
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
      `;
    }),
};

export const ImageLoading: Story = {
  argTypes: disableStoryControls(metadata),
  render: () =>
    interactive((update) => {
      let loading = true;
      let version = 0;

      function reload(): void {
        loading = true;
        version += 1;
        update();
      }

      function reveal(): void {
        loading = false;
        update();
      }

      return () => html`
        ${demoStyles}
        <p>
          A card that stays in the loading state until its image loads. The
          image box has a fixed size, so the layout does not move when the image
          arrives.
        </p>
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
              <h5 slot="subtitle">City that never sleeps</h5>
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
      `;
    }),
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
  render: () =>
    interactive((update) => {
      const batches: (Post[] | undefined)[] = [];

      async function loadMore(): Promise<void> {
        const index = batches.push(undefined) - 1;
        update();
        batches[index] = await simulateFetch(posts);
        update();
      }

      loadMore();

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
              <span class="sk-muted">${post.time}</span>
            </div>
          </div>
          <p class="sk-text">${post.text} <a href="#">${post.tag}</a></p>
        </article>
      `;

      return () => html`
        ${demoStyles}
        <p>
          A feed that loads more posts on demand. Each batch has its own
          skeleton, so the loaded posts stay interactive while the next batch
          loads. Wrapped text gets one shape for each line.
        </p>
        <div class="sk-stack" style="gap: 1rem; max-width: 480px;">
          ${batches.map(
            (batch) => html`
              <igc-skeleton ?loading=${!batch} style="width: 100%;">
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
      `;
    }),
};

export const Styling: Story = {
  argTypes: disableStoryControls(metadata),
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
    <p>
      The <code>--ig-skeleton-*</code> properties set the colors, and
      <code>--border-radius</code> sets the radius of the shapes whose source
      has none. The <code>shape</code> part accepts any other style.
    </p>
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
