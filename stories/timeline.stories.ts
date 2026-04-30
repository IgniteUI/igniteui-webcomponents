import type { Meta, StoryObj } from '@storybook/web-components-vite';
import {
  defineComponents,
  IgcBadgeComponent,
  IgcTimelineComponent,
} from 'igniteui-webcomponents';
import { html } from 'lit';

defineComponents(IgcTimelineComponent, IgcBadgeComponent);

// region default
const metadata: Meta<IgcTimelineComponent> = {
  title: 'Timeline',
  component: 'igc-timeline',
  parameters: {
    docs: {
      description: {
        component:
          'A container component that arranges `igc-timeline-item` elements along a\nvertical or horizontal axis connected by a visual line.',
      },
    },
  },
  argTypes: {
    orientation: {
      type: '"vertical" | "horizontal"',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
  },
  args: { orientation: 'vertical' },
};

export default metadata;

interface IgcTimelineArgs {
  orientation: 'vertical' | 'horizontal';
}
type Story = StoryObj<IgcTimelineArgs>;

// endregion

const indicatorStyle = (bg: string, border: string) =>
  `--indicator-background: ${bg}; --indicator-border-color: ${border}; --indicator-shadow: 0 0 0 4px color-mix(in oklab, ${border} 15%, transparent);`;

export const Basic: Story = {
  render: (args) => html`
    <igc-timeline orientation=${args.orientation}>
      <igc-timeline-item>Item 1</igc-timeline-item>
      <igc-timeline-item>Item 2</igc-timeline-item>
      <igc-timeline-item>Item 3</igc-timeline-item>
      <igc-timeline-item>Item 4</igc-timeline-item>
      <igc-timeline-item>Item 5</igc-timeline-item>
      <igc-timeline-item>Item 6</igc-timeline-item>
    </igc-timeline>
  `,
};

export const DailySchedule: Story = {
  render: (args) => html`
    <style>
      .tl-title {
        font-weight: 600;
        font-size: 1rem;
        margin: 0 0 0.15rem;
      }
      .tl-desc {
        font-size: 0.84rem;
        opacity: 0.6;
        margin: 0;
      }
      .tl-time {
        font-size: 0.78rem;
        font-weight: 600;
        opacity: 0.45;
        white-space: nowrap;
      }
      .tl-icon {
        font-size: 1.2rem;
        line-height: 1;
      }
    </style>
    <igc-timeline orientation=${args.orientation}>
      <igc-timeline-item style=${indicatorStyle('#546e7a', '#37474f')}>
        <span slot="opposite" class="tl-time">8:00 am</span>
        <span slot="indicator" class="tl-icon">☕</span>
        <div>
          <p class="tl-title">Morning routine</p>
          <p class="tl-desc">Coffee, quick news scan, and today's task list</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#1e88e5', '#1565c0')}>
        <span slot="opposite" class="tl-time">9:15 am</span>
        <span slot="indicator" class="tl-icon">🗣️</span>
        <div>
          <p class="tl-title">Stand-up</p>
          <p class="tl-desc">
            15 min sync — blockers, PRs to review, deploys scheduled
          </p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#00897b', '#00695c')}>
        <span slot="opposite" class="tl-time">9:30 am</span>
        <span slot="indicator" class="tl-icon">🔨</span>
        <div>
          <p class="tl-title">Deep work block</p>
          <p class="tl-desc">
            Notifications off — feature branch, tests, commits
          </p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#f57c00', '#e65100')}>
        <span slot="opposite" class="tl-time">12:30 pm</span>
        <span slot="indicator" class="tl-icon">🍱</span>
        <div>
          <p class="tl-title">Lunch</p>
          <p class="tl-desc">Away from the screen — actually touch grass</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#5e35b1', '#4527a0')}>
        <span slot="opposite" class="tl-time">1:30 pm</span>
        <span slot="indicator" class="tl-icon">👀</span>
        <div>
          <p class="tl-title">Code reviews</p>
          <p class="tl-desc">Two PRs in the queue — leave thorough comments</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#00897b', '#00695c')}>
        <span slot="opposite" class="tl-time">2:30 pm</span>
        <span slot="indicator" class="tl-icon">🔨</span>
        <div>
          <p class="tl-title">Afternoon focus</p>
          <p class="tl-desc">Address review feedback, open a draft PR</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#c62828', '#b71c1c')}>
        <span slot="opposite" class="tl-time">4:30 pm</span>
        <span slot="indicator" class="tl-icon">🚨</span>
        <div>
          <p class="tl-title">Production incident</p>
          <p class="tl-desc">
            Memory spike in staging — hotfix branch, post-mortem drafted
          </p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item style=${indicatorStyle('#546e7a', '#37474f')}>
        <span slot="opposite" class="tl-time">6:00 pm</span>
        <span slot="indicator" class="tl-icon">📓</span>
        <div>
          <p class="tl-title">Wrap-up</p>
          <p class="tl-desc">Update tickets, push WIP commits, close laptop</p>
        </div>
      </igc-timeline-item>
    </igc-timeline>
  `,
};

export const ProjectMilestones: Story = {
  render: (args) => html`
    <style>
      .ms-label {
        font-weight: 600;
        margin-block-end: 0.2rem;
      }
      .ms-sub {
        font-size: 0.82rem;
        opacity: 0.6;
      }
      .ms-date {
        font-size: 0.78rem;
        opacity: 0.5;
        white-space: nowrap;
        font-style: italic;
      }
    </style>
    <igc-timeline orientation=${args.orientation}>
      <igc-timeline-item
        style="--indicator-background: #43a047; --indicator-border-color: #2e7d32; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #43a047 18%, transparent);"
      >
        <span slot="indicator">✓</span>
        <span slot="opposite" class="ms-date">Jan 2024</span>
        <div>
          <p class="ms-label">Project Kickoff</p>
          <p class="ms-sub">Requirements gathered and team assembled</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        style="--indicator-background: #1e88e5; --indicator-border-color: #1565c0; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #1e88e5 18%, transparent);"
      >
        <span slot="indicator">⚙</span>
        <span slot="opposite" class="ms-date">Mar 2024</span>
        <div>
          <p class="ms-label">Development Phase</p>
          <p class="ms-sub">Core features implemented and reviewed</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        style="--indicator-background: #f57c00; --indicator-border-color: #e65100; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #f57c00 18%, transparent);"
      >
        <span slot="indicator">🧪</span>
        <span slot="opposite" class="ms-date">May 2024</span>
        <div>
          <p class="ms-label">Testing & QA</p>
          <p class="ms-sub">All test suites passing, accessibility audited</p>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        style="--indicator-background: #8e24aa; --indicator-border-color: #6a1b9a; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #8e24aa 18%, transparent);"
      >
        <span slot="indicator">🚀</span>
        <span slot="opposite" class="ms-date">Jun 2024</span>
        <div>
          <p class="ms-label">Release v1.0</p>
          <p class="ms-sub">Published to npm and announced publicly</p>
        </div>
      </igc-timeline-item>
    </igc-timeline>
  `,
};

export const Changelog: Story = {
  args: { orientation: 'vertical' },
  render: (args) => html`
    <style>
      .cl-version {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        white-space: nowrap;
        opacity: 0.5;
      }
      .cl-heading {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-block-end: 0.5rem;
      }
      .cl-release {
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0;
      }
      .cl-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.15em 0.5em;
        border-radius: 999px;
        background: color-mix(in oklab, currentColor 12%, transparent);
        border: 1px solid color-mix(in oklab, currentColor 25%, transparent);
      }
      .cl-list {
        margin: 0;
        padding-inline-start: 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .cl-list li {
        font-size: 0.875rem;
        opacity: 0.75;
        line-height: 1.5;
      }
    </style>
    <igc-timeline orientation=${args.orientation}>
      <igc-timeline-item
        position="end"
        style="--indicator-background: #43a047; --indicator-border-color: #2e7d32; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #43a047 15%, transparent);"
      >
        <span slot="indicator">🚀</span>
        <span slot="opposite" class="cl-version">Mar 2026</span>
        <div>
          <div class="cl-heading">
            <h3 class="cl-release">v3.0.0</h3>
            <igc-badge variant="danger">breaking</igc-badge>
          </div>
          <ul class="cl-list">
            <li>
              <strong>Breaking:</strong> Dropped support for legacy theming
              tokens
            </li>
            <li>
              <strong>New:</strong> Timeline component with vertical &amp;
              horizontal orientation
            </li>
            <li><strong>New:</strong> Tile Manager layout component</li>
            <li>
              <strong>Fix:</strong> Calendar year/month view keyboard navigation
            </li>
          </ul>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        position="end"
        style="--indicator-background: #1e88e5; --indicator-border-color: #1565c0; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #1e88e5 15%, transparent);"
      >
        <span slot="indicator">✨</span>
        <span slot="opposite" class="cl-version">Jan 2026</span>
        <div>
          <div class="cl-heading">
            <h3 class="cl-release">v2.4.0</h3>
            <igc-badge variant="success">new</igc-badge>
          </div>
          <ul class="cl-list">
            <li>
              <strong>New:</strong> Chat component with message grouping support
            </li>
            <li><strong>New:</strong> File Input drag-and-drop zone</li>
            <li>
              <strong>Improvement:</strong> Combo virtual scrolling performance
            </li>
            <li><strong>Fix:</strong> Date Range Picker RTL alignment</li>
          </ul>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        position="end"
        style="--indicator-background: #f57c00; --indicator-border-color: #e65100; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #f57c00 15%, transparent);"
      >
        <span slot="indicator">🔧</span>
        <span slot="opposite" class="cl-version">Oct 2025</span>
        <div>
          <div class="cl-heading">
            <h3 class="cl-release">v2.3.1</h3>
            <igc-badge variant="info">fix</igc-badge>
          </div>
          <ul class="cl-list">
            <li>
              <strong>Fix:</strong> Stepper linear mode skipping optional steps
            </li>
            <li>
              <strong>Fix:</strong> Tree component selection propagation
              edge-case
            </li>
            <li>
              <strong>Fix:</strong> Slider thumb overlapping track on min value
            </li>
          </ul>
        </div>
      </igc-timeline-item>

      <igc-timeline-item
        position="end"
        style="--indicator-background: #8e24aa; --indicator-border-color: #6a1b9a; --indicator-shadow: 0 0 0 5px color-mix(in oklab, #8e24aa 15%, transparent);"
      >
        <span slot="indicator">⚡</span>
        <span slot="opposite" class="cl-version">Jul 2025</span>
        <div>
          <div class="cl-heading">
            <h3 class="cl-release">v2.3.0</h3>
            <igc-badge variant="success">new</igc-badge>
          </div>
          <ul class="cl-list">
            <li>
              <strong>New:</strong> Tooltip component with smart positioning
            </li>
            <li>
              <strong>New:</strong> <code>size</code> CSS custom property on all
              form components
            </li>
            <li>
              <strong>Deprecation:</strong> <code>igc-icon-button</code>
              <code>variant</code> — use <code>appearance</code> instead
            </li>
            <li>
              <strong>Fix:</strong> Select popup clipping inside overflow
              containers
            </li>
          </ul>
        </div>
      </igc-timeline-item>
    </igc-timeline>
  `,
};
