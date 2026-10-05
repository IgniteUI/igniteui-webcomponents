import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDateTimeInputComponent,
  IgcInputComponent,
  IgcSelectComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { dateArg, formatDate, isWeekend, longDate } from './story-dates.js';
import {
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcCheckboxComponent,
  IgcDateTimeInputComponent,
  IgcInputComponent,
  IgcSelectComponent,
  IgcSwitchComponent
);

// region default
const metadata: Meta<IgcDateTimeInputComponent> = {
  title: 'DateTimeInput',
  component: 'igc-date-time-input',
  parameters: {
    docs: {
      description: {
        component:
          'A date time input is an input field that lets you set and edit the date and time in a chosen input element\nusing customizable display and input formats.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    readOnly: {
      type: 'boolean',
      description: 'Makes the control a readonly field.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    mask: {
      type: 'string',
      description: 'The mask pattern of the component.',
      control: 'text',
    },
    prompt: {
      type: 'string',
      description:
        'The prompt symbol for the unfilled parts of the mask pattern.',
      control: 'text',
      table: { defaultValue: { summary: '_' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    name: {
      type: 'string',
      description: 'The name of the control, submitted with the form data.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    outlined: {
      type: 'boolean',
      description: 'Whether the control will have outlined appearance.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder text of the control.',
      control: 'text',
    },
    label: {
      type: 'string',
      description: 'The label for the control.',
      control: 'text',
    },
    inputFormat: {
      type: 'string',
      description: 'The date format to apply on the input.',
      control: 'text',
    },
    min: {
      type: 'date',
      description: 'The minimum value required for the input to remain valid.',
      control: 'date',
    },
    max: {
      type: 'date',
      description: 'The maximum value required for the input to remain valid.',
      control: 'date',
    },
    displayFormat: {
      type: 'string',
      description:
        'Format to display the value in when not editing.\nDefaults to the locale format if not set.',
      control: 'text',
    },
    spinLoop: {
      type: 'boolean',
      description: 'Sets whether to loop over the currently spun segment.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    locale: {
      type: 'string',
      description:
        "The locale used to format the display value and to resolve the\ncomponent's resource strings. Falls back to the global locale when not set.",
      control: 'text',
    },
  },
  args: {
    readOnly: false,
    prompt: '_',
    required: false,
    disabled: false,
    invalid: false,
    outlined: false,
    spinLoop: true,
  },
};

export default metadata;

interface IgcDateTimeInputArgs {
  /** Makes the control a readonly field. */
  readOnly: boolean;
  /** The mask pattern of the component. */
  mask: string;
  /** The prompt symbol for the unfilled parts of the mask pattern. */
  prompt: string;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name of the control, submitted with the form data. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** Whether the control will have outlined appearance. */
  outlined: boolean;
  /** The placeholder text of the control. */
  placeholder: string;
  /** The label for the control. */
  label: string;
  /** The date format to apply on the input. */
  inputFormat: string;
  /** The minimum value required for the input to remain valid. */
  min: Date;
  /** The maximum value required for the input to remain valid. */
  max: Date;
  /**
   * Format to display the value in when not editing.
   * Defaults to the locale format if not set.
   */
  displayFormat: string;
  /** Sets whether to loop over the currently spun segment. */
  spinLoop: boolean;
  /**
   * The locale used to format the display value and to resolve the
   * component's resource strings. Falls back to the global locale when not set.
   */
  locale: string;
}
type Story = StoryObj<IgcDateTimeInputArgs>;

// endregion

/**
 * `value` comes from a generic base component, and the analyzer records its type as
 * the bare type parameter `T`, so it is left out of the generated args.
 */
type DateTimeInputStory = StoryObj<IgcDateTimeInputArgs & { value: Date }>;

const MINUTE = 60 * 1000;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MINUTE);
}

function nextQuarterHour(date: Date): Date {
  const result = new Date(date);
  result.setSeconds(0, 0);
  result.setMinutes(Math.ceil(result.getMinutes() / 15) * 15);
  return result;
}

function atTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(new Date().setHours(hours, minutes, 0, 0));
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** `90` as "1 h 30 min". */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return [hours ? `${hours} h` : '', rest ? `${rest} min` : '']
    .filter(Boolean)
    .join(' ');
}

const styles = html`
  ${storyStyles}
  <style>
    .dti-layout {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .dti-panel {
      display: grid;
      gap: 1rem;
      align-content: start;
      width: min(100%, 24rem);
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .dti-panel :is(h3, p, table) {
      margin: 0;
    }

    .dti-panel h3 {
      font-size: 1.125rem;
    }

    .dti-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .dti-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
  </style>
`;

export const Default: DateTimeInputStory = {
  parameters: {
    docs: {
      description: {
        story:
          'The time of an appointment. The user types in the mask, or moves the caret to a part and presses Arrow Up or Arrow Down. The mouse wheel also changes the part under the caret, and Ctrl + ; sets the current date and time. `inputFormat` sets the mask, here with a 12-hour time. Without `inputFormat`, the mask follows the locale and has only date parts. Without `displayFormat`, the input shows the value in the input format when it does not have the focus. The input commits the value on blur, and then emits `igcChange`. Use the controls panel to change the formats, the constraints and the state. The story binds the date properties with the `guard` directive, so a change of another control keeps the value that the user typed.',
      },
    },
  },
  args: {
    label: 'Appointment',
    inputFormat: 'MM/dd/yyyy hh:mm tt',
    value: atTime('10:30'),
  },
  render: (args) => html`
    <igc-date-time-input
      style="max-width: 20rem"
      label=${ifDefined(args.label)}
      name=${ifDefined(args.name)}
      placeholder=${ifDefined(args.placeholder)}
      input-format=${ifDefined(args.inputFormat)}
      display-format=${ifDefined(args.displayFormat)}
      prompt=${args.prompt}
      .locale=${args.locale}
      .value=${dateArg(args.value)}
      .min=${dateArg(args.min)}
      .max=${dateArg(args.max)}
      ?spin-loop=${args.spinLoop}
      ?readonly=${args.readOnly}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      <span slot="helper-text">We send a reminder one day before.</span>
    </igc-date-time-input>
  `,
};

export const Meeting: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The start of a meeting in a scheduler. `input-format="yyyy-MM-dd HH:mm"` gives a 24-hour mask that has the same order in all locales, and `display-format` shows the month name when the input does not have the focus. `spinDelta` changes the minutes by 15 for each press of Arrow Up or Arrow Down. With `spinLoop`, which is the default, a part goes from its last value back to its first value: the minutes go from 45 to 00, and the hour stays the same. `min` is the next quarter of an hour. The summary follows `igcInput`, which the input emits for each edit, with the value as an ISO string, or `null` while the mask is not complete. `igcChange` comes on blur with the committed `Date`: its handler calls `setCustomValidity()` when the meeting is not in the working hours, and the `custom-error` slot shows why.',
      },
    },
  },
  render: () => {
    const earliest = nextQuarterHour(new Date());
    const workingHoursError =
      'Choose a time from 9:00 to 18:00 on a working day.';

    let input: IgcDateTimeInputComponent | undefined;
    let start: Date | null = null;
    let duration = 30;
    let sent = false;

    const inWorkingHours = (date: Date) => {
      const end = addMinutes(date, duration);
      return (
        !isWeekend(date) &&
        minutesOfDay(date) >= 9 * 60 &&
        minutesOfDay(end) <= 18 * 60 &&
        end.getDate() === date.getDate()
      );
    };

    const validate = () => {
      const value = input?.value;
      input?.setCustomValidity(
        value && !inWorkingHours(value) ? workingHoursError : ''
      );
    };

    const summary = renderInto(() => {
      const end = start ? addMinutes(start, duration) : null;

      return html`
        <h3>Design review</h3>
        <p>
          ${
            start && end
              ? html`${formatDate(start, longDate)}, ${formatTime(start)} to
                ${formatTime(end)} (${formatDuration(duration)})`
              : 'Type the date and the time of the meeting.'
          }
        </p>
        <igc-select
          label="Duration"
          value=${String(duration)}
          @igcChange=${({ detail }: CustomEvent<{ value: string }>) => {
            duration = Number(detail.value);
            sent = false;
            validate();
            summary.update();
          }}
        >
          ${[15, 30, 45, 60, 90].map(
            (minutes) =>
              html`<igc-select-item value=${String(minutes)}
                >${formatDuration(minutes)}</igc-select-item
              >`
          )}
        </igc-select>
        <div class="dti-row">
          <igc-button
            ?disabled=${!(start && input?.validity.valid)}
            @click=${() => {
              sent = true;
              summary.update();
            }}
          >
            Send the invitation
          </igc-button>
        </div>
        <p role="status" class="muted">
          ${sent ? 'We sent the invitation to 4 people.' : ''}
        </p>
      `;
    });

    const typing = ({ detail }: CustomEvent<string | null>) => {
      start = detail ? new Date(detail) : null;
      sent = false;
      summary.update();
    };

    const change = ({ detail }: CustomEvent<Date | null>) => {
      start = detail;
      validate();
      summary.update();
    };

    return html`
      ${styles}
      <div class="dti-layout">
        <igc-date-time-input
          style="width: min(100%, 20rem)"
          label="Starts"
          input-format="yyyy-MM-dd HH:mm"
          display-format="MMM d, yyyy, HH:mm"
          .spinDelta=${{ minutes: 15 }}
          .min=${earliest}
          @igcInput=${typing}
          @igcChange=${change}
          ${ref((element) => {
            input = element as IgcDateTimeInputComponent | undefined;
          })}
        >
          <span slot="helper-text">
            Arrow Up and Arrow Down change the minutes by 15.
          </span>
          <span slot="range-underflow">
            The meeting cannot start in the past.
          </span>
          <span slot="custom-error">${workingHoursError}</span>
        </igc-date-time-input>
        <section
          class="dti-panel"
          aria-label="Meeting summary"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

const week = [
  { day: 'Monday', opens: '09:00', closes: '18:00' },
  { day: 'Tuesday', opens: '09:00', closes: '18:00' },
  { day: 'Wednesday', opens: '09:00', closes: '18:00' },
  { day: 'Thursday', opens: '09:00', closes: '20:00' },
  { day: 'Friday', opens: '09:00', closes: '18:00' },
  { day: 'Saturday', opens: '10:00', closes: '14:00' },
  { day: 'Sunday', opens: '', closes: '' },
];

export const OpeningHours: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The opening hours of a shop. Each input has `input-format="HH:mm"`, so it edits only the time of its `Date` value. In HTML, the `value` attribute can also take a time without a date, for example "09:00", and the input adds the current date. `spinDelta` changes the minutes by 30. The `min` of the closing time is 30 minutes after the opening time, and an input with only time parts compares only the time, so the `range-underflow` slot shows when the shop closes too early. The column headers name the inputs visually, so each input has an `aria-label` with the day, for example "Monday, opens". The switch of a day disables its inputs. The `igcChange` handlers update the `min` and the hours in a week.',
      },
    },
  },
  render: () => {
    const rows = week.map((day) => ({ ...day, open: Boolean(day.opens) }));
    const inputs = new Map<string, IgcDateTimeInputComponent>();
    let total: HTMLElement | undefined;

    const update = () => {
      let minutes = 0;

      for (const row of rows) {
        const opens = inputs.get(`${row.day}-opens`);
        const closes = inputs.get(`${row.day}-closes`);

        if (!(opens && closes)) {
          continue;
        }

        closes.min = opens.value ? addMinutes(opens.value, 30) : null;

        if (row.open && opens.value && closes.value) {
          minutes += Math.max(
            minutesOfDay(closes.value) - minutesOfDay(opens.value),
            0
          );
        }
      }

      if (total) {
        total.textContent = `Open ${formatDuration(minutes)} a week.`;
      }
    };

    const register =
      (key: string) =>
      (element?: Element): void => {
        if (element) {
          inputs.set(key, element as IgcDateTimeInputComponent);
          update();
        }
      };

    const toggle = (row: (typeof rows)[number], event: CustomEvent) => {
      row.open = (event.target as IgcSwitchComponent).checked;

      for (const part of ['opens', 'closes']) {
        const input = inputs.get(`${row.day}-${part}`);
        if (input) {
          input.disabled = !row.open;
        }
      }

      update();
    };

    return html`
      ${styles}
      <style>
        .dti-hours {
          border-collapse: collapse;
        }

        .dti-hours :is(th, td) {
          padding: 0.25rem 0.5rem;
          text-align: start;
          vertical-align: top;
        }

        .dti-hours igc-date-time-input {
          width: 7rem;
        }
      </style>
      <section
        class="dti-panel"
        style="width: fit-content"
        aria-labelledby="dti-hours-title"
      >
        <h3 id="dti-hours-title">Opening hours</h3>
        <table class="dti-hours">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Opens</th>
              <th scope="col">Closes</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(
              (row) => html`
                <tr>
                  <th scope="row">
                    <igc-switch
                      ?checked=${row.open}
                      @igcChange=${(event: CustomEvent) => toggle(row, event)}
                      >${row.day}</igc-switch
                    >
                  </th>
                  <td>
                    <igc-date-time-input
                      aria-label="${row.day}, opens"
                      input-format="HH:mm"
                      .value=${atTime(row.opens || '09:00')}
                      .spinDelta=${{ minutes: 30 }}
                      ?disabled=${!row.open}
                      @igcChange=${update}
                      ${ref(register(`${row.day}-opens`))}
                    ></igc-date-time-input>
                  </td>
                  <td>
                    <igc-date-time-input
                      aria-label="${row.day}, closes"
                      input-format="HH:mm"
                      .value=${atTime(row.closes || '17:00')}
                      .spinDelta=${{ minutes: 30 }}
                      ?disabled=${!row.open}
                      @igcChange=${update}
                      ${ref(register(`${row.day}-closes`))}
                    >
                      <span slot="range-underflow">Closes too early.</span>
                    </igc-date-time-input>
                  </td>
                </tr>
              `
            )}
          </tbody>
        </table>
        <p
          role="status"
          ${ref((element) => {
            total = element as HTMLElement | undefined;
            update();
          })}
        ></p>
      </section>
    `;
  },
};

/** The whole months from `start` to `end`, both months included, as "2 years 3 months". */
function formatMonths(start: Date, end: Date): string {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth() +
    1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const plural = (count: number, unit: string) =>
    `${count} ${unit}${count === 1 ? '' : 's'}`;

  return [years ? plural(years, 'year') : '', rest ? plural(rest, 'month') : '']
    .filter(Boolean)
    .join(' ');
}

export const WorkHistory: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A job in the work history of a profile. A month and a year are enough, so `input-format="MM/yyyy"` has no day part, and the input commits the first day of the month. `display-format="MMMM yyyy"` shows the name of the month when the input does not have the focus. `max` is today, so a job cannot start in the future. The `min` of the end month is the start month, and the `range-underflow` slot shows when the job ends before it starts. "I work here now" clears the end month and disables its input. The `igcChange` handlers update the duration.',
      },
    },
  },
  render: () => {
    const today = new Date();
    let from: IgcDateTimeInputComponent | undefined;
    let to: IgcDateTimeInputComponent | undefined;
    let current = false;
    let duration: HTMLElement | undefined;

    const update = () => {
      if (!(from && to && duration)) {
        return;
      }

      to.min = from.value;
      const end = current ? today : to.value;

      duration.textContent =
        from.value && end && from.value <= end
          ? `${formatMonths(from.value, end)}${current ? ' so far' : ''}`
          : '';
    };

    const toggle = (event: CustomEvent) => {
      current = (event.target as IgcCheckboxComponent).checked;
      to!.disabled = current;

      if (current) {
        to!.value = null;
      }

      update();
    };

    return html`
      ${styles}
      <section class="dti-panel" aria-labelledby="dti-job-title">
        <h3 id="dti-job-title">Work experience</h3>
        <igc-input label="Job title" value="Frontend developer"></igc-input>
        <igc-input label="Company" value="Northwind Traders"></igc-input>
        <div class="dti-pair">
          <igc-date-time-input
            label="From"
            input-format="MM/yyyy"
            display-format="MMMM yyyy"
            .value=${new Date(2021, 2, 1)}
            .max=${today}
            @igcChange=${update}
            ${ref((element) => {
              from = element as IgcDateTimeInputComponent | undefined;
              update();
            })}
          >
            <span slot="range-overflow">
              The job cannot start in the future.
            </span>
          </igc-date-time-input>
          <igc-date-time-input
            label="To"
            input-format="MM/yyyy"
            display-format="MMMM yyyy"
            .value=${new Date(2024, 5, 1)}
            .max=${today}
            @igcChange=${update}
            ${ref((element) => {
              to = element as IgcDateTimeInputComponent | undefined;
              update();
            })}
          >
            <span slot="range-underflow">
              The job cannot end before it starts.
            </span>
            <span slot="range-overflow">
              The job cannot end in the future.
            </span>
          </igc-date-time-input>
        </div>
        <igc-checkbox @igcChange=${toggle}>I work here now</igc-checkbox>
        <p
          class="muted"
          role="status"
          ${ref((element) => {
            duration = element as HTMLElement | undefined;
            update();
          })}
        ></p>
      </section>
    `;
  },
};

const locales = [
  { locale: 'en-US', label: 'New York (en-US)' },
  { locale: 'de-DE', label: 'Berlin (de-DE)' },
  { locale: 'fr-FR', label: 'Paris (fr-FR)' },
  { locale: 'ja-JP', label: 'Tokyo (ja-JP)' },
];

export const Locales: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The same release date, as the teams of four offices see it. Each input has only the `locale` property, so the mask and the display format come from the locale: the order of the parts and the separators. The helper text shows the `inputFormat` that the input got from its locale. Give the focus to an input to see the mask. The mask of a locale has only date parts. To edit a time, set `inputFormat`. The value is the same `Date` in all inputs, and the time zones are not modelled.',
      },
    },
  },
  render: () => {
    const value = new Date(new Date().getFullYear() + 1, 0, 15);

    return html`
      ${styles}
      <section class="dti-panel" aria-labelledby="dti-release-title">
        <h3 id="dti-release-title">Release date</h3>
        ${locales.map(
          ({ locale, label }) => html`
            <igc-date-time-input
              .label=${label}
              .locale=${locale}
              .value=${value}
              ${ref((element) => {
                const input = element as IgcDateTimeInputComponent | undefined;
                input?.updateComplete.then(() => {
                  input.querySelector('[slot="helper-text"]')!.textContent =
                    `Mask: ${input.inputFormat}`;
                });
              })}
            >
              <span slot="helper-text"></span>
            </igc-date-time-input>
          `
        )}
      </section>
    `;
  },
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The report of a service outage. The start of the outage is `required`, and its `max` is the current time, so the `range-overflow` slot shows when the start is in the future. The `min` of the end is the start, which the `igcChange` handler sets. The end is not required, because the outage can still go on. "Reported at" is `readonly`: the form submits its value, but the user cannot change it. The form does not submit while a control is invalid. Submit shows the form data, where each value is an ISO string in UTC. Reset restores the default values. `defaultValue` sets the default value of "Reported at" from code; in HTML, the `value` attribute does this.',
      },
    },
  },
  render: () => {
    const now = new Date();
    now.setSeconds(0, 0);
    let ended: IgcDateTimeInputComponent | undefined;

    const setMin = ({ detail }: CustomEvent<Date | null>) => {
      if (ended) {
        ended.min = detail;
      }
    };

    return html`
      ${styles}
      <form
        class="dti-panel"
        @submit=${formSubmitHandler}
        @reset=${() => {
          if (ended) {
            ended.min = null;
          }
        }}
      >
        <h3>Report an outage</h3>
        <igc-input name="service" label="Service" required>
          <span slot="value-missing">Enter the name of the service.</span>
        </igc-input>
        <igc-date-time-input
          name="started"
          label="Started at"
          required
          input-format="yyyy-MM-dd HH:mm"
          display-format="MMM d, yyyy, HH:mm"
          .max=${now}
          @igcChange=${setMin}
        >
          <span slot="helper-text">For example, 2026-03-17 14:05.</span>
          <span slot="value-missing">Enter when the outage started.</span>
          <span slot="range-overflow">The start cannot be in the future.</span>
        </igc-date-time-input>
        <igc-date-time-input
          name="ended"
          label="Ended at"
          input-format="yyyy-MM-dd HH:mm"
          display-format="MMM d, yyyy, HH:mm"
          ${ref((element) => {
            ended = element as IgcDateTimeInputComponent | undefined;
          })}
        >
          <span slot="helper-text">Leave it empty if the outage goes on.</span>
          <span slot="range-underflow">
            The outage cannot end before it starts.
          </span>
        </igc-date-time-input>
        <igc-date-time-input
          name="reported"
          label="Reported at"
          readonly
          input-format="yyyy-MM-dd HH:mm"
          display-format="MMM d, yyyy, HH:mm"
          .defaultValue=${now}
        ></igc-date-time-input>
        <div class="dti-row">
          <igc-button type="submit">Send the report</igc-button>
          <igc-button type="reset" variant="outlined">Reset</igc-button>
        </div>
      </form>
    `;
  },
};
