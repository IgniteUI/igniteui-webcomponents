import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardActionsComponent,
  IgcCardComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcChipComponent,
  IgcSkeletonComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';

defineComponents(
  IgcSkeletonComponent,
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcChipComponent
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
        'Indicates whether the skeleton is in a loading state.\n\nWhen `true`, the skeleton will display its content with a loading animation.\nWhen `false`, the skeleton will display its content without the animation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    animation: {
      type: '"pulse" | "breathe" | "shimmer" | "wave" | "glow"',
      description:
        "Defines the animation style for the skeleton when in a loading state.\n\n- `pulse`: A pulsing animation that fades the skeleton in and out.\n- `breathe`: A subtle breathing animation that smoothly transitions the skeleton's opacity.\n- `shimmer`: A horizontal highlight sweep across each shape.\n- `wave`: A staggered vertical bounce across shapes.\n- `glow`: A pulsing box-shadow glow on each shape.",
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
   * Indicates whether the skeleton is in a loading state.
   *
   * When `true`, the skeleton will display its content with a loading animation.
   * When `false`, the skeleton will display its content without the animation.
   */
  loading: boolean;
  /**
   * Defines the animation style for the skeleton when in a loading state.
   *
   * - `pulse`: A pulsing animation that fades the skeleton in and out.
   * - `breathe`: A subtle breathing animation that smoothly transitions the skeleton's opacity.
   * - `shimmer`: A horizontal highlight sweep across each shape.
   * - `wave`: A staggered vertical bounce across shapes.
   * - `glow`: A pulsing box-shadow glow on each shape.
   */
  animation: 'pulse' | 'breathe' | 'shimmer' | 'wave' | 'glow';
}
type Story = StoryObj<IgcSkeletonArgs>;

// endregion

export const Default: Story = {
  args: {
    loading: true,
  },
  render: ({ loading, animation }) => html`
    <igc-skeleton
      ?loading=${loading}
      animation=${animation}
      style="width: 280px;"
    >
      <div
        style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;"
      >
        <igc-avatar
          src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
          alt="John Smith"
          shape="circle"
        ></igc-avatar>
        <div style="display: flex; flex-direction: column; gap: 0.375rem;">
          <span style="font-weight: 600;">John Smith</span>
          <span style="font-size: 0.875rem; color: #666;"
            >Software Engineer</span
          >
        </div>
      </div>
    </igc-skeleton>
  `,
};

// A simple card-like layout using native elements and igc-avatar

export const ProfileCard: Story = {
  args: { loading: true, animation: 'breathe' },
  parameters: {
    docs: {
      description: {
        story:
          'A typical profile card layout composed of native elements and `igc-avatar`. Toggle `loading` to reveal the actual content.',
      },
    },
  },
  render: ({ loading, animation }) => html`
    <igc-skeleton
      ?loading=${loading}
      animation=${animation}
      style="width: 320px;"
    >
      <div
        style="display: flex; flex-direction: column; gap: 1rem; padding: 1.25rem; border: 1px solid #e0e0e0; border-radius: 8px;"
      >
        <div style="display: flex; align-items: center; gap: 1rem;">
          <igc-avatar
            src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
            alt="John Smith"
            shape="circle"
          ></igc-avatar>
          <div style="display: flex; flex-direction: column; gap: 0.375rem;">
            <span style="font-weight: 600; font-size: 1rem;">John Smith</span>
            <span style="font-size: 0.875rem; color: #666;">
              Senior Engineer
            </span>
          </div>
        </div>
        <p style="margin: 0; font-size: 0.875rem; line-height: 1.5;">
          Passionate about building scalable systems and developer tooling.
          Based in Berlin.
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <igc-chip>TypeScript</igc-chip>
          <igc-chip>Lit</igc-chip>
          <igc-chip>Web Components</igc-chip>
        </div>
      </div>
    </igc-skeleton>
  `,
};

// A media card using igc-card components

export const MediaCard: Story = {
  args: { loading: true, animation: 'breathe' },
  parameters: {
    docs: {
      description: {
        story:
          'An `igc-card` with media, header and actions wrapped by the skeleton. Use the **Controls** panel to toggle `loading` and switch `animation` variants.',
      },
    },
  },
  render: ({ loading, animation }) => html`
    <igc-skeleton
      ?loading=${loading}
      animation=${animation}
      style="max-width: 344px;"
    >
      <igc-card>
        <igc-card-media style="height: 194px;">
          <img
            src="https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80"
            alt="New York City"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </igc-card-media>
        <igc-card-header>
          <igc-avatar
            slot="thumbnail"
            shape="rounded"
            src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
          ></igc-avatar>
          <h3 slot="title">New York</h3>
          <h5 slot="subtitle">City that never sleeps</h5>
        </igc-card-header>
        <igc-card-content>
          <p style="margin: 0; font-size: 0.875rem; line-height: 1.5;">
            New York City comprises 5 boroughs sitting where the Hudson River
            meets the Atlantic Ocean.
          </p>
        </igc-card-content>
        <igc-card-actions>
          <igc-button slot="start" variant="flat">Like</igc-button>
          <igc-button slot="start" variant="flat">Learn More</igc-button>
        </igc-card-actions>
      </igc-card>
    </igc-skeleton>
  `,
};

// All animations side by side

export const Animations: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'All five animation variants rendered simultaneously so you can compare them at a glance.',
      },
    },
  },
  render: () => {
    const animations = ['breathe', 'pulse', 'shimmer', 'wave', 'glow'] as const;

    return html`
      <div
        style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;"
      >
        ${animations.map(
          (anim) => html`
            <div
              style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center;"
            >
              <igc-skeleton loading animation=${anim} style="width: 200px;">
                <div
                  style="display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px;"
                >
                  <div
                    style="display: flex; align-items: center; gap: 0.75rem;"
                  >
                    <igc-avatar
                      src="https://www.infragistics.com/angular-demos/assets/images/men/1.jpg"
                      alt="John Smith"
                      shape="circle"
                    ></igc-avatar>
                    <div
                      style="display: flex; flex-direction: column; gap: 0.25rem;"
                    >
                      <span style="font-weight: 600; font-size: 0.9rem;"
                        >John Smith</span
                      >
                      <span style="font-size: 0.8rem; color: #666;"
                        >Engineer</span
                      >
                    </div>
                  </div>
                  <p style="margin: 0; font-size: 0.8rem; line-height: 1.5;">
                    Building scalable systems and developer tooling.
                  </p>
                  <igc-chip>TypeScript</igc-chip>
                </div>
              </igc-skeleton>
              <code style="font-size: 0.8rem;">${anim}</code>
            </div>
          `
        )}
      </div>
    `;
  },
};

// Demonstrates ResizeObserver: an image loads after a delay causing the host to grow and remeasure

export const ResizeObserverDemo: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the **ResizeObserver** integration. The skeleton starts loading with an \`<img>\` that has no size
yet (no \`width\`/\`height\` attributes, no explicit CSS dimensions). After 2 seconds the image \`src\` is resolved
and the browser lays it out at its natural dimensions — the skeleton host grows and the \`ResizeObserver\`
fires, triggering a remeasure so the shape overlays move to the correct positions.
Click **Start** to reset and run the sequence again.`,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const startBtn = canvasElement.querySelector<HTMLElement>('igc-button');
    startBtn?.click();
  },
  render: () => {
    let skeleton: IgcSkeletonComponent | null = null;
    let img: HTMLImageElement | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const IMAGE_URL =
      'https://images.unsplash.com/photo-1518235506717-e1ed3306a89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80';

    function start() {
      clearTimeout(timeoutId);

      if (!skeleton || !img) return;

      // Reset state
      img.src = '';
      img.style.width = '';
      img.style.height = '';
      skeleton.loading = true;

      // Simulate delayed image resolution — host grows, ResizeObserver fires
      timeoutId = setTimeout(() => {
        img!.src = IMAGE_URL;
        img!.style.width = '300px';
        img!.style.height = '200px';
      }, 2000);
    }

    function stop() {
      clearTimeout(timeoutId);
      if (skeleton) skeleton.loading = false;
    }

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <div style="display: flex; gap: 0.5rem;">
          <igc-button
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest(
                'div'
              )!.parentElement!;
              skeleton = root.querySelector('igc-skeleton');
              img = root.querySelector('img');
              start();
            }}
          >
            Start
          </igc-button>
          <igc-button
            variant="outlined"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest(
                'div'
              )!.parentElement!;
              skeleton = root.querySelector('igc-skeleton');
              stop();
            }}
          >
            Stop
          </igc-button>
        </div>

        <p style="margin: 0; font-size: 0.875rem;">
          The image below has no dimensions until its
          <code>src</code> is resolved. Click <strong>Start</strong> — the
          skeleton activates immediately, then after 2 seconds the image loads
          and the skeleton remeasures to fit the new dimensions.
        </p>

        <igc-skeleton
          style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem;"
        >
          <img alt="Delayed image" />
        </igc-skeleton>
      </div>
    `;
  },
};

// Demonstrates MutationObserver: children are dynamically added while loading

export const MutationObserverDemo: Story = {
  argTypes: {
    loading: {},
    animation: {
      control: 'select',
      options: ['pulse', 'breathe', 'shimmer', 'wave', 'glow'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the **MutationObserver** integration. The skeleton starts loading with an empty list.
Clicking **Add item** appends a new list row to the DOM — the \`MutationObserver\` (configured with
\`childList: true, subtree: true\`) fires, the skeleton remeasures, and a new shape overlay appears
for the freshly added element. Click **Reset** to clear the list and start again.`,
      },
    },
  },
  render: (args) => {
    const items = [
      {
        name: 'John Smith',
        role: 'Software Engineer',
        avatar:
          'https://www.infragistics.com/angular-demos/assets/images/men/1.jpg',
      },
      {
        name: 'Lisa Wagner',
        role: 'Product Manager',
        avatar:
          'https://www.infragistics.com/angular-demos/assets/images/women/1.jpg',
      },
      {
        name: 'Abraham Lee',
        role: 'Team Lead',
        avatar:
          'https://www.infragistics.com/angular-demos/assets/images/men/2.jpg',
      },
      {
        name: 'Kate Manson',
        role: 'UX Designer',
        avatar:
          'https://www.infragistics.com/angular-demos/assets/images/women/2.jpg',
      },
    ];

    let index = 0;

    function addItem(e: Event) {
      const root = (e.target as HTMLElement).closest('div')!.parentElement!;
      const list = root.querySelector<HTMLUListElement>('#mutation-list');
      const skeleton = root.querySelector<IgcSkeletonComponent>('igc-skeleton');

      if (!list || !skeleton) return;

      if (!skeleton.loading) skeleton.loading = true;

      const item = items[index++ % items.length];
      const li = document.createElement('li');
      li.style.cssText =
        'display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; list-style: none;';

      li.innerHTML = `
        <igc-avatar
          src="${item.avatar}"
          alt="${item.name}"
          shape="circle"
        ></igc-avatar>
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <span style="font-weight: 600; font-size: 0.9rem;">${item.name}</span>
          <span style="font-size: 0.8rem; color: #666;">${item.role}</span>
        </div>
      `;

      list.appendChild(li);
    }

    function reset(e: Event) {
      const root = (e.target as HTMLElement).closest('div')!.parentElement!;
      const list = root.querySelector<HTMLUListElement>('#mutation-list');
      const skeleton = root.querySelector<IgcSkeletonComponent>('igc-skeleton');

      if (list) list.innerHTML = '';
      if (skeleton) skeleton.loading = true;
      index = 0;
    }

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <div style="display: flex; gap: 0.5rem;">
          <igc-button @click=${addItem}>Add item</igc-button>
          <igc-button
            variant="outlined"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest(
                'div'
              )!.parentElement!;
              const skeleton =
                root.querySelector<IgcSkeletonComponent>('igc-skeleton');
              if (skeleton) skeleton.loading = false;
            }}
          >
            Reveal
          </igc-button>
          <igc-button variant="outlined" @click=${reset}>Reset</igc-button>
        </div>

        <igc-skeleton
          loading
          animation=${ifDefined(args.animation)}
          style="width: 320px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem;"
        >
          <div style="display: flex; flex-direction: column; gap: 0.25rem;">
            <span style="font-weight: 600; margin-bottom: 0.5rem;"
              >Team members</span
            >
            <ul id="mutation-list" style="margin: 0; padding: 0;"></ul>
          </div>
        </igc-skeleton>
      </div>
    `;
  },
};
