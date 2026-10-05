import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcButtonComponent,
  IgcCircularProgressComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  delay,
  disableStoryControls,
  randomIntBetween,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(IgcButtonComponent, IgcCircularProgressComponent);

// region default
const metadata: Meta<IgcCircularProgressComponent> = {
  title: 'CircularProgress',
  component: 'igc-circular-progress',
  parameters: {
    docs: {
      description: {
        component:
          'A circular progress indicator used to express unspecified wait time or display\nthe length of a process.',
      },
    },
  },
  argTypes: {
    max: {
      type: 'number',
      description: 'Maximum value of the control.',
      control: 'number',
      table: { defaultValue: { summary: '100' } },
    },
    value: {
      type: 'number',
      description: 'The value of the control.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    variant: {
      type: {
        name: 'enum',
        value: ['primary', 'info', 'success', 'warning', 'danger'],
      },
      description: 'The variant of the control.',
      options: ['primary', 'info', 'success', 'warning', 'danger'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'primary' } },
    },
    animationDuration: {
      type: 'number',
      description: 'Animation duration in milliseconds.',
      control: 'number',
      table: { defaultValue: { summary: '500' } },
    },
    indeterminate: {
      type: 'boolean',
      description: 'The indeterminate state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideLabel: {
      type: 'boolean',
      description: 'Shows/hides the label of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelFormat: {
      type: 'string',
      description:
        'Format string for the default label of the control.\nPlaceholders:\n {0} - current value of the control.\n {1} - max value of the control.',
      control: 'text',
    },
  },
  args: {
    max: 100,
    value: 0,
    variant: 'primary',
    animationDuration: 500,
    indeterminate: false,
    hideLabel: false,
  },
};

export default metadata;

interface IgcCircularProgressArgs {
  /** Maximum value of the control. */
  max: number;
  /** The value of the control. */
  value: number;
  /** The variant of the control. */
  variant: 'primary' | 'info' | 'success' | 'warning' | 'danger';
  /** Animation duration in milliseconds. */
  animationDuration: number;
  /** The indeterminate state of the control. */
  indeterminate: boolean;
  /** Shows/hides the label of the control. */
  hideLabel: boolean;
  /**
   * Format string for the default label of the control.
   * Placeholders:
   *  {0} - current value of the control.
   *  {1} - max value of the control.
   */
  labelFormat: string;
}
type Story = StoryObj<IgcCircularProgressArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .cp-stack {
      display: grid;
      gap: 1rem;
      max-width: 40rem;
    }

    .cp-stack :is(h3, h4, p, ul) {
      margin: 0;
    }

    .cp-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cp-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }
  </style>
`;

export const Default: Story = {
  args: { value: 60 },
  parameters: {
    docs: {
      description: {
        story:
          'The sync of a photo library. The component has the `progressbar` role, but it has no name, so `aria-labelledby` points to the text next to it. The ring fills clockwise from the top, and the default label in the center shows the percentage. `label-format` replaces the label, with `{0}` for the value and `{1}` for `max`, and a screen reader reads the same text. `indeterminate` turns the ring into a spinner for an operation with no known end. Use the controls panel to change the state.',
      },
    },
  },
  render: ({
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelFormat,
  }: IgcCircularProgressArgs) => html`
    ${styles}
    <div class="cp-row">
      <igc-circular-progress
        aria-labelledby="cp-default-label"
        ?indeterminate=${indeterminate}
        ?hide-label=${hideLabel}
        value=${ifDefined(value)}
        max=${ifDefined(max)}
        animation-duration=${ifDefined(animationDuration)}
        variant=${ifDefined(variant)}
        label-format=${ifDefined(labelFormat)}
      ></igc-circular-progress>
      <span id="cp-default-label">Syncing your photos</span>
    </div>
  `,
};

const courses = [
  { id: 'ts', title: 'TypeScript fundamentals', done: 8, total: 12 },
  { id: 'forms', title: 'Accessible web forms', done: 3, total: 10 },
  { id: 'css', title: 'Modern CSS layout', done: 9, total: 9 },
  { id: 'git', title: 'Git for teams', done: 0, total: 6 },
];

export const Courses: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The dashboard of a learning platform. Each ring shows the lessons that are done, with the number of lessons as `max`. Content in the default slot replaces the label in the ring, and `label-format="{0} of {1} lessons"` still gives the text that a screen reader reads. Each ring has the course title as its name. "Continue" completes the next lesson, and the ring animates to the new value. A completed course uses the `success` variant and tells it in text too.',
      },
    },
  },
  render: () => {
    const state = courses.map((course) => ({ ...course }));
    let message = '';

    const complete = (course: (typeof state)[number]) => {
      if (course.done === course.total) {
        message = `You reviewed ${course.title}.`;
      } else {
        course.done += 1;
        message =
          course.done === course.total
            ? `You completed ${course.title}.`
            : `Lesson ${course.done} of ${course.title} is done.`;
      }
      story.update();
    };

    const story = renderInto(
      () => html`
        <ul class="cp-courses">
          ${state.map((course) => {
            const finished = course.done === course.total;

            return html`
              <li>
                <igc-circular-progress
                  aria-labelledby="cp-course-${course.id}"
                  .max=${course.total}
                  .value=${course.done}
                  .variant=${finished ? 'success' : 'primary'}
                  label-format="{0} of {1} lessons"
                >
                  <span>${course.done}/${course.total}</span>
                </igc-circular-progress>
                <div class="cp-course">
                  <h4 id="cp-course-${course.id}">${course.title}</h4>
                  <p class="muted">
                    ${
                      finished
                        ? 'Course complete'
                        : `Next: lesson ${course.done + 1}`
                    }
                  </p>
                </div>
                <igc-button variant="outlined" @click=${() => complete(course)}>
                  ${
                    finished ? 'Review' : course.done ? 'Continue' : 'Start'
                  }<span class="sr-only"> ${course.title}</span>
                </igc-button>
              </li>
            `;
          })}
        </ul>
        <p class="muted" role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <style>
        .cp-courses {
          display: grid;
          gap: 1rem;
          padding: 0;
          list-style: none;
        }

        .cp-courses li {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .cp-courses igc-circular-progress {
          --ig-circular-bar-diameter: 4rem;
          --stroke-thickness: 4px;
        }

        .cp-courses igc-circular-progress span {
          font-size: 0.875rem;
        }

        .cp-course {
          flex: 1;
        }
      </style>
      <section class="cp-stack cp-panel" aria-labelledby="cp-courses-title">
        <h3 id="cp-courses-title">My courses</h3>
        <div class="cp-stack" ${story.mount}></div>
      </section>
    `;
  },
};

export const Refresh: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A sales widget of a dashboard. "Refresh" loads new numbers, and the time of the request is not known, so an indeterminate spinner shows over the old numbers. The spinner has an `aria-label`, and the content has `aria-busy` while it waits. The status message tells when the numbers are new. The button stays enabled, so the focus stays on it, and a click during a refresh does nothing.',
      },
    },
  },
  render: () => {
    let loading = false;
    let sales = 12480;
    let orders = 86;
    let updated = new Date();
    let message = '';

    const time = (date: Date) =>
      date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });

    const refresh = async () => {
      if (loading) {
        return;
      }

      loading = true;
      message = 'Refreshing the sales…';
      story.update();

      await delay(1500);

      sales += randomIntBetween(0, 900);
      orders += randomIntBetween(0, 6);
      updated = new Date();
      loading = false;
      message = `The sales are up to date at ${time(updated)}.`;
      story.update();
    };

    const story = renderInto(
      () => html`
        <div class="cp-widget-body" aria-busy=${loading}>
          <dl>
            <div>
              <dt>Revenue</dt>
              <dd>$${sales.toLocaleString('en-US')}</dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd>${orders}</dd>
            </div>
          </dl>
          <p class="muted">Updated at ${time(updated)}</p>
          ${
            loading
              ? html`
                  <div class="cp-widget-overlay">
                    <igc-circular-progress
                      indeterminate
                      aria-label="Refreshing the sales"
                    ></igc-circular-progress>
                  </div>
                `
              : nothing
          }
        </div>
        <p class="sr-only" role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <style>
        .cp-widget {
          max-width: 22rem;
        }

        .cp-widget header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .cp-widget-body {
          position: relative;
          display: grid;
          gap: 0.5rem;
        }

        .cp-widget dl {
          display: flex;
          gap: 2rem;
          margin: 0;
        }

        .cp-widget dt {
          color: var(--ig-gray-700);
        }

        .cp-widget dd {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 600;
        }

        .cp-widget-overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          border-radius: 4px;
          background: color-mix(
            in srgb,
            var(--ig-surface-500) 75%,
            transparent
          );
        }
      </style>
      <section
        class="cp-stack cp-panel cp-widget"
        aria-labelledby="cp-widget-title"
      >
        <header>
          <h3 id="cp-widget-title">Sales this week</h3>
          <igc-button variant="outlined" @click=${refresh}>Refresh</igc-button>
        </header>
        <div ${story.mount}></div>
      </section>
    `;
  },
};

const goals = [
  {
    id: 'move',
    name: 'Move',
    value: 420,
    max: 600,
    unit: 'kcal',
    spoken: 'kilocalories',
    step: 45,
    colors: ['#e5004f', '#ff7a00'],
  },
  {
    id: 'exercise',
    name: 'Exercise',
    value: 18,
    max: 30,
    unit: 'min',
    spoken: 'minutes',
    step: 10,
    colors: ['#008a3e', '#7cc242'],
  },
  {
    id: 'stand',
    name: 'Stand',
    value: 9,
    max: 12,
    unit: 'h',
    spoken: 'hours',
    step: 1,
    colors: ['#0064d2', '#2bb8e8'],
  },
];

export const ActivityGoals: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The daily goals of a fitness app. Each ring has a gradient: every `igc-circular-gradient` in the `gradient` slot becomes a stop, with its `offset` and `color`. `--ig-circular-bar-diameter` and `--stroke-thickness` make the rings larger and thicker. The value and the unit in the center come from the default slot, and `label-format` gives the text that a screen reader reads, for example "420 of 600 kilocalories". The ring shows the short unit, and the screen reader text has the full unit. "Log a 10-minute walk" adds to each goal, and the value stops at `max`.',
      },
    },
  },
  render: () => {
    const state = goals.map((goal) => ({ ...goal }));
    let message = '';

    const walk = () => {
      for (const goal of state) {
        goal.value = Math.min(goal.max, goal.value + goal.step);
      }

      const reached = state.filter(({ value, max }) => value === max);
      message =
        reached.length === state.length
          ? 'You reached all your goals for today.'
          : `Walk logged. ${reached.length} of ${state.length} goals are reached.`;
      story.update();
    };

    const story = renderInto(
      () => html`
        <ul class="cp-goals">
          ${state.map(
            (goal) => html`
              <li>
                <igc-circular-progress
                  aria-labelledby="cp-goal-${goal.id}"
                  .max=${goal.max}
                  .value=${goal.value}
                  label-format="{0} of {1} ${goal.spoken}"
                  animation-duration="800"
                >
                  ${goal.colors.map(
                    (color, index) => html`
                      <igc-circular-gradient
                        slot="gradient"
                        offset=${index ? '100%' : '0%'}
                        color=${color}
                      ></igc-circular-gradient>
                    `
                  )}
                  <span class="cp-goal-value">
                    <strong>${goal.value}</strong>
                    <span>/${goal.max} ${goal.unit}</span>
                  </span>
                </igc-circular-progress>
                <span id="cp-goal-${goal.id}">${goal.name}</span>
              </li>
            `
          )}
        </ul>
        <div class="cp-row">
          <igc-button @click=${walk}>Log a 10-minute walk</igc-button>
          <p class="muted" role="status">${message}</p>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .cp-goals {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 0;
          list-style: none;
        }

        .cp-goals li {
          display: grid;
          justify-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .cp-goals igc-circular-progress {
          --ig-circular-bar-diameter: 8rem;
          --stroke-thickness: 10px;
        }

        .cp-goal-value {
          display: grid;
          justify-items: center;
          font-size: 0.875rem;
          font-weight: 400;
        }

        .cp-goal-value strong {
          font-size: 1.75rem;
        }
      </style>
      <section class="cp-stack cp-panel" aria-labelledby="cp-goals-title">
        <h3 id="cp-goals-title">Today</h3>
        <div class="cp-stack" ${story.mount}></div>
      </section>
    `;
  },
};
