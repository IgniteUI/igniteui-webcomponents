import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { keyed } from 'lit/directives/keyed.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  delay,
  disableStoryControls,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcLinearProgressComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent
);

// region default
const metadata: Meta<IgcLinearProgressComponent> = {
  title: 'LinearProgress',
  component: 'igc-linear-progress',
  parameters: {
    docs: {
      description: {
        component:
          'A linear progress indicator used to express unspecified wait time or display\nthe length of a process.',
      },
    },
  },
  argTypes: {
    striped: {
      type: 'boolean',
      description: 'Sets the striped look of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelAlign: {
      type: {
        name: 'enum',
        value: [
          'bottom',
          'top',
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ],
      },
      description: 'The position for the default label of the control.',
      options: [
        'bottom',
        'top',
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'top-start' } },
    },
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
    striped: false,
    labelAlign: 'top-start',
    max: 100,
    value: 0,
    variant: 'primary',
    animationDuration: 500,
    indeterminate: false,
    hideLabel: false,
  },
};

export default metadata;

interface IgcLinearProgressArgs {
  /** Sets the striped look of the control. */
  striped: boolean;
  /** The position for the default label of the control. */
  labelAlign:
    | 'bottom'
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end';
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
type Story = StoryObj<IgcLinearProgressArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .lp-stack {
      display: grid;
      gap: 1rem;
      max-width: 36rem;
    }

    .lp-stack :is(h3, h4, p, ul) {
      margin: 0;
    }

    .lp-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .lp-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  args: { value: 60 },
  parameters: {
    docs: {
      description: {
        story:
          'The upload of a file. The component has the `progressbar` role, but it has no name, so `aria-labelledby` points to the text above it. The component clamps `value` to the range from 0 to `max`, and the fill shows the ratio. The default label shows the percentage. `label-format` replaces the label, with `{0}` for the value and `{1}` for `max`, and a screen reader reads the same text. `indeterminate` shows an animation for an operation with no known end, and it removes the value. Use the controls panel to change the state.',
      },
    },
  },
  render: ({
    striped,
    variant,
    hideLabel,
    value,
    max,
    animationDuration,
    indeterminate,
    labelAlign,
    labelFormat,
  }) => html`
    ${styles}
    <div class="lp-stack">
      <span id="lp-default-label">Uploading quarterly-report.pdf</span>
      <igc-linear-progress
        aria-labelledby="lp-default-label"
        ?striped=${striped}
        ?indeterminate=${indeterminate}
        ?hide-label=${hideLabel}
        value=${ifDefined(value)}
        max=${ifDefined(max)}
        animation-duration=${ifDefined(animationDuration)}
        variant=${ifDefined(variant)}
        label-align=${labelAlign}
        label-format=${ifDefined(labelFormat)}
      ></igc-linear-progress>
    </div>
  `,
};

type UploadState = 'queued' | 'uploading' | 'done' | 'failed' | 'canceled';

const uploadStates: Record<
  UploadState,
  { label: string; variant: IgcLinearProgressComponent['variant'] }
> = {
  queued: { label: 'Waiting', variant: 'primary' },
  uploading: { label: '{0} of {1} MB', variant: 'primary' },
  done: { label: '{1} MB uploaded', variant: 'success' },
  failed: { label: 'Failed at {0} of {1} MB', variant: 'danger' },
  canceled: { label: 'Canceled at {0} of {1} MB', variant: 'warning' },
};

const uploads = [
  { id: 'guidelines', name: 'brand-guidelines.pdf', size: 2.4, speed: 0.3 },
  { id: 'photo', name: 'team-photo.jpg', size: 4.8, speed: 0.4 },
  { id: 'backup', name: 'site-backup.zip', size: 18.5, speed: 0.9, failAt: 9 },
  { id: 'interview', name: 'interview.mp3', size: 7.2, speed: 0.5 },
];

export const FileUpload: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An upload queue. Each file has a progress bar with the file name as its name. `max` is the size of the file in megabytes, so `label-format` shows "4.2 of 7.2 MB", and a screen reader reads the same text. The striped look marks the files that upload now. When an upload ends, the variant and the label change together, so the state does not depend on the color only. The upload of site-backup.zip fails at 9 MB, and "Retry" continues from there and moves the focus to the row of the file. A screen reader does not announce each change of a progress bar, so a status message tells when a file is done or fails.',
      },
    },
  },
  render: () => {
    const files = uploads.map((file) => ({
      ...file,
      loaded: 0,
      state: 'queued' as UploadState,
      failed: false,
    }));
    type Upload = (typeof files)[number];

    let root: HTMLElement | undefined;
    let timer: number | undefined;
    let message = '';

    const isActive = () => files.some(({ state }) => state === 'uploading');
    const isQueued = () => files.every(({ state }) => state === 'queued');

    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };

    const tick = () => {
      for (const file of files.filter(({ state }) => state === 'uploading')) {
        file.loaded = Math.min(
          file.size,
          Math.round((file.loaded + file.speed) * 10) / 10
        );

        if (file.failAt && !file.failed && file.loaded >= file.failAt) {
          file.failed = true;
          file.loaded = file.failAt;
          file.state = 'failed';
          message = `${file.name} failed, because the connection was lost.`;
        } else if (file.loaded === file.size) {
          file.state = 'done';
          const done = files.filter(({ state }) => state === 'done').length;
          message =
            done === files.length
              ? `All ${files.length} files are uploaded.`
              : `${file.name} is uploaded. ${done} of ${files.length} files are done.`;
        }
      }

      if (!isActive()) {
        stop();
      }
      update();
    };

    const start = () => {
      timer ??= window.setInterval(tick, 250);
    };

    const run = () => {
      if (isActive()) {
        for (const file of files.filter(({ state }) => state === 'uploading')) {
          file.state = 'canceled';
        }
        message = 'The upload is canceled.';
        stop();
      } else if (isQueued()) {
        for (const file of files) {
          file.state = 'uploading';
        }
        message = `Uploading ${files.length} files.`;
        start();
      } else {
        for (const file of files) {
          Object.assign(file, { loaded: 0, state: 'queued', failed: false });
        }
        message = '';
      }
      update();
    };

    const retry = (file: Upload) => {
      file.state = 'uploading';
      message = `Uploading ${file.name} again.`;
      start();
      update();
      root?.querySelector<HTMLElement>(`#lp-upload-${file.id}`)?.focus();
    };

    const update = () => {
      if (!root) {
        return;
      }

      const action = isActive()
        ? 'Cancel'
        : isQueued()
          ? `Upload ${files.length} files`
          : 'Start over';

      render(
        html`
          <ul class="lp-files">
            ${files.map(
              (file) => html`
                <li id="lp-upload-${file.id}" tabindex="-1">
                  <span id="lp-upload-${file.id}-name">${file.name}</span>
                  ${
                    file.state === 'failed' || file.state === 'canceled'
                      ? html`
                          <igc-button
                            variant="flat"
                            @click=${() => retry(file)}
                          >
                            Retry<span class="sr-only"> ${file.name}</span>
                          </igc-button>
                        `
                      : nothing
                  }
                  <igc-linear-progress
                    aria-labelledby="lp-upload-${file.id}-name"
                    .max=${file.size}
                    .value=${file.loaded}
                    .variant=${uploadStates[file.state].variant}
                    .labelFormat=${uploadStates[file.state].label}
                    ?striped=${file.state === 'uploading'}
                    label-align="bottom-start"
                    animation-duration="250"
                  ></igc-linear-progress>
                </li>
              `
            )}
          </ul>
          <div class="lp-row">
            <igc-button @click=${run}>${action}</igc-button>
          </div>
          <p class="muted" role="status">${message}</p>
        `,
        root
      );
    };

    return html`
      ${styles}
      <style>
        .lp-files {
          display: grid;
          gap: 1rem;
          padding: 0;
          list-style: none;
        }

        .lp-files li {
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: minmax(2.25rem, auto) auto;
          align-items: center;
          column-gap: 1rem;
        }

        .lp-files li:focus-visible {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: 4px;
        }

        .lp-files igc-linear-progress {
          grid-column: 1 / -1;
        }
      </style>
      <section class="lp-stack lp-panel" aria-labelledby="lp-upload-title">
        <h3 id="lp-upload-title">Upload to Shared files</h3>
        <div
          class="lp-stack"
          ${ref((element) => {
            root = element as HTMLElement | undefined;

            if (!root) {
              stop();
              return;
            }

            // Storybook can disconnect the story and connect it again, so an
            // upload in progress continues.
            if (isActive()) {
              start();
            }
            update();
          })}
        ></div>
      </section>
    `;
  },
};

const questions = [
  {
    id: 'frequency',
    text: 'How often do you use the app?',
    options: ['Every day', 'A few times a week', 'A few times a month'],
  },
  {
    id: 'feature',
    text: 'Which feature do you use most?',
    options: ['Reports', 'Dashboards', 'Exports', 'Sharing'],
  },
  {
    id: 'ease',
    text: 'How easy is it to find what you need?',
    options: ['Easy', 'Neither easy nor difficult', 'Difficult'],
  },
  {
    id: 'recommend',
    text: 'Would you recommend the app to a colleague?',
    options: ['Yes', 'Maybe', 'No'],
  },
];

export const Survey: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A product survey that shows one question at a time. `max` is the number of questions, and `value` is the number of questions before the current one, so the bar is full only after the last answer. `label-format` gives the label and the text that a screen reader reads, for example "Question 2 of 4", where `{1}` is `max`. `label-align="top-end"` puts the label above the end of the track. The progress bar has the survey title as its name. "Next" and "Back" move the focus to the new question, so a keyboard user does not lose the position. After the last question, the variant changes to `success`.',
      },
    },
  },
  render: () => {
    const answers = new Map<string, string>();
    let index = 0;

    const go = (to: number) => {
      index = to;
      story.update();
      story.host?.querySelector<HTMLElement>('h4')?.focus();
    };

    const story = renderInto(() => {
      const done = index === questions.length;
      const question = questions[index];

      return html`
        <igc-linear-progress
          aria-labelledby="lp-survey-title"
          .max=${questions.length}
          .value=${index}
          .labelFormat=${
            done ? 'Survey complete' : `Question ${index + 1} of {1}`
          }
          .variant=${done ? 'success' : 'primary'}
          label-align="top-end"
        ></igc-linear-progress>
        ${
          done
            ? html`
                <h4 tabindex="-1">Thank you for your feedback</h4>
                <p class="muted">
                  You answered ${answers.size} of ${questions.length} questions.
                </p>
                <div class="lp-row">
                  <igc-button
                    variant="outlined"
                    @click=${() => {
                      answers.clear();
                      go(0);
                    }}
                  >
                    Take the survey again
                  </igc-button>
                </div>
              `
            : keyed(
                question.id,
                html`
                  <h4 id="lp-survey-question" tabindex="-1">
                    ${question.text}
                  </h4>
                  <igc-radio-group
                    aria-labelledby="lp-survey-question"
                    @igcChange=${({ detail }: CustomEvent<{ value: string }>) =>
                      answers.set(question.id, detail.value)}
                  >
                    ${question.options.map(
                      (option) => html`
                        <igc-radio
                          value=${option}
                          ?checked=${answers.get(question.id) === option}
                        >
                          ${option}
                        </igc-radio>
                      `
                    )}
                  </igc-radio-group>
                  <div class="lp-row">
                    ${
                      index > 0
                        ? html`
                            <igc-button
                              variant="outlined"
                              @click=${() => go(index - 1)}
                            >
                              Back
                            </igc-button>
                          `
                        : nothing
                    }
                    <igc-button @click=${() => go(index + 1)}>
                      ${index === questions.length - 1 ? 'Submit' : 'Next'}
                    </igc-button>
                  </div>
                `
              )
        }
      `;
    });

    return html`
      ${styles}
      <style>
        .lp-survey h4:focus-visible {
          outline: 2px solid var(--ig-primary-500);
          outline-offset: 4px;
        }
      </style>
      <section
        class="lp-stack lp-panel lp-survey"
        aria-labelledby="lp-survey-title"
      >
        <h3 id="lp-survey-title">Product feedback</h3>
        <div class="lp-stack" ${story.mount}></div>
      </section>
    `;
  },
};

const orders = [
  { id: '10421', customer: 'Maya Patel', total: '$248.00', status: 'Shipped' },
  { id: '10422', customer: 'Daniel Okafor', total: '$59.90', status: 'Paid' },
  {
    id: '10423',
    customer: 'Sofia Díaz',
    total: '$1,120.00',
    status: 'Shipped',
  },
  { id: '10424', customer: 'Liam Chen', total: '$75.50', status: 'Refunded' },
  { id: '10425', customer: 'Maya Patel', total: '$32.00', status: 'Paid' },
  {
    id: '10426',
    customer: 'Noah Schmidt',
    total: '$410.25',
    status: 'Shipped',
  },
];

export const Search: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An order search. The server takes some time to answer, and the time is not known, so an indeterminate progress bar shows above the results while the search runs. The indeterminate state has no value and no label. The bar has an `aria-label`, and the results table has `aria-busy` while it waits. The status message tells the number of results when they come. `--ig-linear-bar-track-height` makes the track thin in all themes. A new search replaces a search that did not end.',
      },
    },
  },
  render: () => {
    let results = orders;
    let loading = false;
    let message = '';
    let request = 0;

    const search = async (event: SubmitEvent) => {
      event.preventDefault();

      const query = String(
        new FormData(event.target as HTMLFormElement).get('query') ?? ''
      )
        .trim()
        .toLowerCase();
      const current = ++request;

      loading = true;
      message = 'Searching the orders…';
      story.update();

      await delay(1200);

      if (current !== request) {
        return;
      }

      results = orders.filter(
        ({ id, customer }) =>
          id.includes(query) || customer.toLowerCase().includes(query)
      );
      loading = false;
      message =
        results.length === 1
          ? '1 order found.'
          : `${results.length} orders found.`;
      story.update();
    };

    const story = renderInto(
      () => html`
        <div class="lp-search-bar">
          ${
            loading
              ? html`
                  <igc-linear-progress
                    indeterminate
                    aria-label="Searching the orders"
                  ></igc-linear-progress>
                `
              : nothing
          }
        </div>
        <table aria-labelledby="lp-search-title" aria-busy=${loading}>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Total</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(
              ({ id, customer, total, status }) => html`
                <tr>
                  <td>#${id}</td>
                  <td>${customer}</td>
                  <td>${total}</td>
                  <td>${status}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
        <p class="muted" role="status">${message}</p>
      `
    );

    return html`
      ${styles}
      <style>
        .lp-orders form {
          display: flex;
          align-items: end;
          gap: 0.5rem;
        }

        .lp-orders igc-input {
          flex: 1;
        }

        .lp-search-bar {
          --ig-linear-bar-track-height: 4px;

          min-height: 4px;
        }

        .lp-orders table {
          border-collapse: collapse;
          width: 100%;
        }

        .lp-orders table[aria-busy='true'] {
          opacity: 0.6;
        }

        .lp-orders :is(th, td) {
          padding: 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
          text-align: start;
        }
      </style>
      <section
        class="lp-stack lp-panel lp-orders"
        aria-labelledby="lp-search-title"
      >
        <h3 id="lp-search-title">Orders</h3>
        <form role="search" @submit=${search}>
          <igc-input
            name="query"
            type="search"
            label="Order number or customer"
          ></igc-input>
          <igc-button type="submit">Search</igc-button>
        </form>
        <div class="lp-stack" ${story.mount}></div>
      </section>
    `;
  },
};
