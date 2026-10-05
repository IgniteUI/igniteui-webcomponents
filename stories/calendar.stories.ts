import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { guard } from 'lit/directives/guard.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcButtonComponent,
  IgcCalendarComponent,
  IgcSelectComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  addDays,
  addWorkingDays,
  dateArg,
  daysBetween,
  daysOf,
  formatDate,
  isWeekend,
  longDate,
  today,
} from './story-dates.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(IgcButtonComponent, IgcCalendarComponent, IgcSelectComponent);

// region default
const metadata: Meta<IgcCalendarComponent> = {
  title: 'Calendar',
  component: 'igc-calendar',
  parameters: {
    docs: {
      description: {
        component:
          'Represents a calendar that lets users\nto select a date value in a variety of different ways.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    hideOutsideDays: {
      type: 'boolean',
      description:
        'Whether to hide the dates that do not belong to the current active month.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideHeader: {
      type: 'boolean',
      description:
        'Whether to render the calendar header part.\nWhen the calendar selection is set to `multiple` the header is always hidden.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    headerOrientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description: 'The orientation of the calendar header.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    orientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description:
        'The orientation of the calendar months when more than one month\nis being shown.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in the days view.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
    },
    activeView: {
      type: { name: 'enum', value: ['days', 'months', 'years'] },
      description: 'The current active view of the component.',
      options: ['days', 'months', 'years'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'days' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale for the resource strings. Falls back to the global locale.',
      control: 'text',
    },
    value: {
      type: 'date',
      description:
        'The current value of the calendar.\nUsed when selection is set to single',
      control: 'date',
    },
    activeDate: {
      type: 'date',
      description:
        'Get/Set the date which is shown in view and is highlighted. By default it is the current date.',
      control: 'date',
    },
    selection: {
      type: { name: 'enum', value: ['multiple', 'single', 'range'] },
      description: 'Sets the type of selection in the component.',
      options: ['multiple', 'single', 'range'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'single' } },
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Whether to show the week numbers.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    weekStart: {
      type: {
        name: 'enum',
        value: [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ],
      },
      description: 'Gets/Sets the first day of the week.',
      options: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ],
      control: { type: 'select' },
    },
  },
  args: {
    hideOutsideDays: false,
    hideHeader: false,
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    visibleMonths: 1,
    activeView: 'days',
    selection: 'single',
    showWeekNumbers: false,
  },
};

export default metadata;

interface IgcCalendarArgs {
  /** Whether to hide the dates that do not belong to the current active month. */
  hideOutsideDays: boolean;
  /**
   * Whether to render the calendar header part.
   * When the calendar selection is set to `multiple` the header is always hidden.
   */
  hideHeader: boolean;
  /** The orientation of the calendar header. */
  headerOrientation: 'horizontal' | 'vertical';
  /**
   * The orientation of the calendar months when more than one month
   * is being shown.
   */
  orientation: 'horizontal' | 'vertical';
  /** The number of months displayed in the days view. */
  visibleMonths: number;
  /** The current active view of the component. */
  activeView: 'days' | 'months' | 'years';
  /** The locale for the resource strings. Falls back to the global locale. */
  locale: string;
  /**
   * The current value of the calendar.
   * Used when selection is set to single
   */
  value: Date;
  /** Get/Set the date which is shown in view and is highlighted. By default it is the current date. */
  activeDate: Date;
  /** Sets the type of selection in the component. */
  selection: 'multiple' | 'single' | 'range';
  /** Whether to show the week numbers. */
  showWeekNumbers: boolean;
  /** Gets/Sets the first day of the week. */
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
}
type Story = StoryObj<IgcCalendarArgs>;

// endregion

Object.assign(metadata.argTypes!, {
  weekDayFormat: {
    type: '"long" | "short" | "narrow"',
    description: 'The `weekday` option of `formatOptions`.',
    options: ['long', 'short', 'narrow'],
    control: {
      type: 'inline-radio',
    },
  },
  monthFormat: {
    type: '"numeric" | "2-digit" | "long" | "short" | "narrow"',
    description: 'The `month` option of `formatOptions`.',
    options: ['numeric', '2-digit', 'long', 'short', 'narrow'],
    control: {
      type: 'inline-radio',
    },
  },
  title: {
    type: 'string',
    description: 'The content of the `title` slot.',
    control: 'text',
  },
  values: {
    type: 'string',
    description:
      'The `values` attribute: ISO dates separated by commas, for the `multiple` and `range` selection.',
    control: 'text',
  },
});

Object.assign(metadata.args!, {
  weekDayFormat: 'narrow',
  monthFormat: 'long',
});

/** The knobs added above are not attributes, so they are not in the generated args. */
type CalendarStory = StoryObj<
  IgcCalendarArgs & {
    weekDayFormat: 'long' | 'short' | 'narrow';
    monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    title: string;
    values: string;
  }
>;

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

/** ISO dates separated by commas, as local dates. Unparsable items are dropped. */
function parseDates(text = ''): Date[] {
  return text
    .split(',')
    .map((value) => new Date(`${value.trim()}T00:00`))
    .filter((date) => !Number.isNaN(date.getTime()));
}

/** `count(2, 'night')` is "2 nights". */
function count(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

const styles = html`
  ${storyStyles}
  <style>
    .cal-layout {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .cal-panel {
      display: grid;
      gap: 0.75rem;
      align-content: start;
      width: 18rem;
      padding: 1rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .cal-panel :is(h3, p, ul, dl) {
      margin: 0;
    }

    .cal-panel h3 {
      font-size: 1.125rem;
    }

    .cal-lines {
      display: grid;
      gap: 0.25rem;
      padding: 0;
      list-style: none;
    }

    .cal-lines li {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }

    .cal-lines .cal-total {
      padding-block-start: 0.5rem;
      border-block-start: 1px solid var(--ig-gray-300);
      font-weight: 600;
    }

    .cal-facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .cal-facts dt {
      color: var(--ig-gray-700);
      font-size: 0.875rem;
    }

    .cal-facts dd {
      margin: 0;
      font-weight: 600;
    }

    .cal-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .cal-error {
      color: var(--ig-error-700);
    }
  </style>
`;

export const Default: CalendarStory = {
  parameters: {
    docs: {
      description: {
        story:
          'A calendar for one date. Use the controls panel to change the selection mode, the number of months, the header and the week numbers. Without `weekStart`, the week starts on the first day of the week of the locale. The `weekDayFormat` and `monthFormat` controls set `formatOptions`, and the `title` control fills the `title` slot. The `values` control takes ISO dates separated by commas, for the `multiple` and `range` selection. A change of `selection` clears the selected dates. The story binds the date properties with the `guard` directive, so a change of another control keeps the dates that the user selected.',
      },
    },
  },
  render: (args) => html`
    <igc-calendar
      ?hide-header=${args.hideHeader}
      ?show-week-numbers=${args.showWeekNumbers}
      ?hide-outside-days=${args.hideOutsideDays}
      header-orientation=${ifDefined(args.headerOrientation)}
      orientation=${ifDefined(args.orientation)}
      week-start=${ifDefined(args.weekStart)}
      locale=${ifDefined(args.locale)}
      selection=${ifDefined(args.selection)}
      active-view=${ifDefined(args.activeView)}
      .activeDate=${guard(
        [args.activeDate, args.value],
        () => new Date(args.activeDate ?? args.value ?? today)
      )}
      .value=${dateArg(args.value)}
      .values=${guard([args.values], () => parseDates(args.values))}
      visible-months=${ifDefined(args.visibleMonths)}
      .formatOptions=${guard([args.monthFormat, args.weekDayFormat], () => ({
        month: args.monthFormat,
        weekday: args.weekDayFormat,
      }))}
    >
      ${args.title ? html`<span slot="title">${args.title}</span>` : nothing}
    </igc-calendar>
  `,
};

export const Booking: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The booking form of a holiday apartment. `selection="range"` with `visible-months="2"` shows two months, so a stay can cross the end of a month. The first selected date is the check-in, and the last is the check-out. `disabledDates` disables the past days and the days when the apartment is occupied. The descriptors of the occupied days have the `label` "Occupied", so the accessible name of such a day tells why it is disabled. The calendar removes the disabled days from a range, so the `igcChange` handler compares the number of selected days with the length of the range. When a stay crosses an occupied day, the handler clears `values` and tells the user why. The `title` and `header-date` slots show the check-in and the check-out in the header. The nights of Friday and Saturday cost more, and the summary shows the price of each kind of night.',
      },
    },
  },
  render: () => {
    const rates = { weeknight: 120, weekend: 165, cleaning: 40 };
    const occupied = [
      [addDays(today, 6), addDays(today, 9)],
      [addDays(today, 17), addDays(today, 20)],
      [addDays(today, 27), addDays(today, 28)],
    ];
    const disabledDates: DateRangeDescriptor[] = [
      { type: DateRangeType.Before, dateRange: [today] },
      ...occupied.map((dateRange) => ({
        type: DateRangeType.Between,
        dateRange,
        label: 'Occupied',
      })),
    ];

    /** The state of a selection without occupied days, also of an empty one. */
    const available = (dates: Date[]) => ({
      dates,
      message:
        dates.length === 1
          ? 'Select the check-out date.'
          : dates.length
            ? 'The dates are available.'
            : 'Select the check-in date.',
      error: false,
    });

    const state = available([]);
    let calendar: IgcCalendarComponent | undefined;
    let header: HTMLElement | undefined;
    let summary: HTMLElement | undefined;

    const currency = (amount: number) =>
      amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });

    const nightLine = (nights: number, word: string, rate: number) =>
      nights
        ? html`<li>
            <span>${count(nights, word)} × ${currency(rate)}</span>
            <span>${currency(nights * rate)}</span>
          </li>`
        : nothing;

    const update = () => {
      if (!(header && summary)) {
        return;
      }

      const { dates, message, error } = state;
      const checkIn = dates.at(0);
      const checkOut = dates.length > 1 ? dates.at(-1) : undefined;
      const nights = dates.slice(0, -1);
      const weekend = nights.filter((night) =>
        [5, 6].includes(night.getDay())
      ).length;
      const weeknights = nights.length - weekend;
      const total =
        weeknights * rates.weeknight +
        weekend * rates.weekend +
        (nights.length ? rates.cleaning : 0);

      header.textContent = `${checkIn ? formatDate(checkIn) : 'Check-in'} → ${
        checkOut ? formatDate(checkOut) : 'Check-out'
      }`;

      render(
        html`
          <h3>Lakeside apartment</h3>
          <dl class="cal-facts">
            <div>
              <dt>Check-in</dt>
              <dd>${checkIn ? formatDate(checkIn) : '-'}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>${checkOut ? formatDate(checkOut) : '-'}</dd>
            </div>
          </dl>
          <ul class="cal-lines">
            ${nightLine(weeknights, 'weeknight', rates.weeknight)}
            ${nightLine(weekend, 'weekend night', rates.weekend)}
            ${
              nights.length
                ? html`<li>
                      <span>Cleaning fee</span>
                      <span>${currency(rates.cleaning)}</span>
                    </li>
                    <li class="cal-total">
                      <span>Total for ${count(nights.length, 'night')}</span>
                      <span>${currency(total)}</span>
                    </li>`
                : html`<li class="muted">
                    ${currency(rates.weeknight)} a weeknight,
                    ${currency(rates.weekend)} on Friday and Saturday
                  </li>`
            }
          </ul>
          <div class="cal-actions">
            <igc-button ?disabled=${!checkOut} @click=${reserve}>
              Reserve
            </igc-button>
            <igc-button
              variant="flat"
              ?disabled=${!dates.length}
              @click=${clear}
            >
              Clear dates
            </igc-button>
          </div>
          <p role="status" class=${error ? 'cal-error' : 'muted'}>${message}</p>
        `,
        summary
      );
    };

    const change = ({ detail }: CustomEvent<Date | Date[]>) => {
      const dates = detail as Date[];
      const span = dates.length ? daysBetween(dates[0], dates.at(-1)!) + 1 : 0;

      if (dates.length > 1 && dates.length !== span) {
        calendar!.values = [];
        Object.assign(state, {
          dates: [],
          message: `The apartment is occupied on some days from ${formatDate(
            dates[0]
          )} to ${formatDate(dates.at(-1)!)}. Select other dates.`,
          error: true,
        });
      } else {
        Object.assign(state, available(dates));
      }

      update();
    };

    const clear = () => {
      calendar!.values = [];
      Object.assign(state, available([]));
      update();
    };

    const reserve = () => {
      state.message = `We reserved the apartment from ${formatDate(
        state.dates[0]
      )} to ${formatDate(state.dates.at(-1)!)}. We sent the details to your email.`;
      update();
    };

    return html`
      ${styles}
      <div class="cal-layout">
        <igc-calendar
          selection="range"
          visible-months="2"
          .disabledDates=${disabledDates}
          @igcChange=${change}
          ${ref((element) => {
            calendar = element as IgcCalendarComponent | undefined;
          })}
        >
          <span slot="title">Your stay</span>
          <span
            slot="header-date"
            ${ref((element) => {
              header = element as HTMLElement | undefined;
              update();
            })}
          ></span>
        </igc-calendar>
        <section
          class="cal-panel"
          aria-label="Booking summary"
          ${ref((element) => {
            summary = element as HTMLElement | undefined;
            update();
          })}
        ></section>
      </div>
    `;
  },
};

export const Delivery: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The delivery step of a checkout. The courier delivers from two business days after the order, for three weeks, and not on weekends. `disabledDates` combines the `Before`, `After`, `Weekends` and `Specific` descriptors. The `Specific` descriptor disables the days when the courier is fully booked. `specialDates` marks the days with free delivery, Tuesday and Thursday. The special state is only visual, so the descriptors have a `label`: the accessible name of a date ends with "Free delivery" or "Fully booked". The `title` slot replaces the default header title, and `value` selects the first possible date.',
      },
    },
  },
  render: () => {
    const fee = 4.99;
    const earliest = addWorkingDays(today, 2);
    const latest = addDays(today, 21);
    const fullyBooked = [
      addWorkingDays(earliest, 1),
      addWorkingDays(earliest, 7),
    ];
    const isBooked = (date: Date) =>
      fullyBooked.some((day) => daysBetween(day, date) === 0);
    const freeDays = daysOf(earliest, latest).filter(
      (date) => [2, 4].includes(date.getDay()) && !isBooked(date)
    );
    const isFree = (date: Date) =>
      freeDays.some((day) => daysBetween(day, date) === 0);

    const disabledDates: DateRangeDescriptor[] = [
      { type: DateRangeType.Before, dateRange: [earliest] },
      { type: DateRangeType.After, dateRange: [latest] },
      { type: DateRangeType.Weekends },
      {
        type: DateRangeType.Specific,
        dateRange: fullyBooked,
        label: 'Fully booked',
      },
    ];
    const specialDates: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Specific,
        dateRange: freeDays,
        label: 'Free delivery',
      },
    ];

    let selected = earliest;
    let confirmed = false;

    const summary = renderInto(
      () => html`
        <h3>Delivery</h3>
        <p>
          Arrives
          <strong> ${formatDate(selected, longDate)} </strong>
          between 8:00 and 18:00.
        </p>
        <ul class="cal-lines">
          <li>
            <span>Delivery fee</span>
            <span>${isFree(selected) ? 'Free' : `$${fee}`}</span>
          </li>
        </ul>
        <p class="muted">
          Delivery is free on Tuesday and Thursday. The courier is fully booked
          on ${fullyBooked.map((date) => formatDate(date)).join(' and ')}.
        </p>
        <div class="cal-actions">
          <igc-button
            @click=${() => {
              confirmed = true;
              summary.update();
            }}
          >
            Continue to payment
          </igc-button>
        </div>
        <p role="status" class="muted">
          ${confirmed ? 'We saved the delivery date.' : ''}
        </p>
      `
    );

    const change = ({ detail }: CustomEvent<Date | Date[]>) => {
      selected = detail as Date;
      confirmed = false;
      summary.update();
    };

    return html`
      ${styles}
      <div class="cal-layout">
        <igc-calendar
          .value=${earliest}
          .disabledDates=${disabledDates}
          .specialDates=${specialDates}
          @igcChange=${change}
        >
          <span slot="title">Delivery date</span>
        </igc-calendar>
        <section
          class="cal-panel"
          aria-label="Delivery summary"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

export const TimeOff: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A request for time off. `selection="multiple"` lets the user select days that are not next to each other, and the header is always hidden in this mode. The weekends and the past days are disabled. `specialDates` marks the days when a teammate is off, with one descriptor for each teammate. The special state is only visual, so the `label` of each descriptor names the teammate, and the accessible name of a date tells who is off. `show-week-numbers` shows the ISO week numbers, which many teams use to plan. The `igcChange` handler groups the selected days into periods, and compares their number with the remaining days of the allowance.',
      },
    },
  },
  render: () => {
    const allowance = 12;
    const teammates = [
      {
        name: 'Priya',
        dates: [6, 7, 8, 9, 10].map((days) => addWorkingDays(today, days)),
      },
      {
        name: 'Marco',
        dates: [11, 12, 16].map((days) => addWorkingDays(today, days)),
      },
    ];
    const disabledDates: DateRangeDescriptor[] = [
      { type: DateRangeType.Before, dateRange: [addDays(today, 1)] },
      { type: DateRangeType.Weekends },
    ];
    const specialDates: DateRangeDescriptor[] = teammates.map(
      ({ name, dates }) => ({
        type: DateRangeType.Specific,
        dateRange: dates,
        label: `${name} is off`,
      })
    );

    let days: Date[] = [];
    let sent = false;

    /** Consecutive working days, also across a weekend, are one period. */
    const toPeriods = (dates: Date[]) => {
      const periods: Date[][] = [];

      for (const date of dates) {
        const period = periods.at(-1);
        const last = period?.at(-1);
        const gap = last ? daysBetween(last, date) : 0;
        const onlyWeekend =
          last &&
          Array.from({ length: gap - 1 }, (_, i) => addDays(last, i + 1)).every(
            isWeekend
          );

        if (period && onlyWeekend) {
          period.push(date);
        } else {
          periods.push([date]);
        }
      }

      return periods;
    };

    const summary = renderInto(() => {
      const periods = toPeriods(days);
      const remaining = allowance - days.length;
      const overlaps = teammates
        .map(({ name, dates }) => ({
          name,
          dates: dates.filter((date) =>
            days.some((day) => daysBetween(day, date) === 0)
          ),
        }))
        .filter(({ dates }) => dates.length);

      return html`
        <h3>Time off request</h3>
        <dl class="cal-facts">
          <div>
            <dt>Requested</dt>
            <dd>${count(days.length, 'day')}</dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd class=${remaining < 0 ? 'cal-error' : ''}>
              ${remaining} of ${allowance}
            </dd>
          </div>
        </dl>
        ${
          periods.length
            ? html`<ul class="cal-lines">
                ${periods.map(
                  (period) => html`<li>
                    <span>
                      ${
                        period.length > 1
                          ? `${formatDate(period[0])} - ${formatDate(period.at(-1)!)}`
                          : formatDate(period[0])
                      }
                    </span>
                    <span>${count(period.length, 'day')}</span>
                  </li>`
                )}
              </ul>`
            : html`<p class="muted">Select the days that you want off.</p>`
        }
        ${overlaps.map(
          ({ name, dates }) => html`<p class="muted">
            ${name} is also off on
            ${dates.map((date) => formatDate(date)).join(', ')}.
          </p>`
        )}
        <div class="cal-actions">
          <igc-button
            ?disabled=${!days.length || remaining < 0}
            @click=${() => {
              sent = true;
              summary.update();
            }}
          >
            Send request
          </igc-button>
        </div>
        <p role="status" class=${remaining < 0 ? 'cal-error' : 'muted'}>
          ${
            remaining < 0
              ? `You have ${allowance} days. Remove ${count(-remaining, 'day')}.`
              : sent
                ? 'We sent the request to your manager.'
                : ''
          }
        </p>
      `;
    });

    const change = ({ detail }: CustomEvent<Date | Date[]>) => {
      days = detail as Date[];
      sent = false;
      summary.update();
    };

    return html`
      ${styles}
      <div class="cal-layout">
        <igc-calendar
          selection="multiple"
          visible-months="2"
          show-week-numbers
          .disabledDates=${disabledDates}
          .specialDates=${specialDates}
          @igcChange=${change}
        ></igc-calendar>
        <section
          class="cal-panel"
          aria-label="Request summary"
          ${summary.mount}
        ></section>
      </div>
    `;
  },
};

export const Agenda: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A team calendar with an agenda. `specialDates` marks the days with events, and the `--ig-calendar-date-special-border-color` variable gives their ring the success color of the palette, so they look different from the current date. The text keeps the color of the theme, which has a sufficient contrast in the light and the dark variants. `header-orientation="vertical"` puts the header at the side, and `hide-outside-days` hides the days of the adjacent months. When the user selects a date, the list next to the calendar shows its events. The special state is only visual, so the `label` of each descriptor gives the number of events, and the accessible name of a date tells it too.',
      },
    },
  },
  render: () => {
    const schedule = [
      [-3, '15:00', 'Sprint retrospective'],
      [0, '09:30', 'Daily stand-up'],
      [0, '14:00', 'Design review: checkout'],
      [2, '10:00', 'Sprint planning'],
      [5, '11:00', 'Release 4.2'],
      [5, '16:00', 'Release party'],
      [9, '12:30', 'Team lunch'],
      [14, '13:00', 'Customer interview'],
      [19, '10:00', 'Quarterly review'],
    ] as const;
    const events = new Map<string, { time: string; title: string }[]>();

    for (const [offset, time, title] of schedule) {
      const key = dateKey(addDays(today, offset));
      events.set(key, [...(events.get(key) ?? []), { time, title }]);
    }

    const specialDates: DateRangeDescriptor[] = Array.from(
      new Set(schedule.map(([offset]) => offset)),
      (offset) => {
        const date = addDays(today, offset);

        return {
          type: DateRangeType.Specific,
          dateRange: [date],
          label: count(events.get(dateKey(date))!.length, 'event'),
        };
      }
    );

    let selected = today;

    const list = renderInto(() => {
      const items = events.get(dateKey(selected)) ?? [];

      return html`
        <h3>${formatDate(selected, longDate)}</h3>
        ${
          items.length
            ? html`<ul class="cal-lines">
                ${items.map(
                  ({ time, title }) => html`<li>
                    <span>${title}</span>
                    <span class="muted">${time}</span>
                  </li>`
                )}
              </ul>`
            : html`<p class="muted">No events.</p>`
        }
      `;
    });

    const change = ({ detail }: CustomEvent<Date | Date[]>) => {
      selected = detail as Date;
      list.update();
    };

    return html`
      ${styles}
      <style>
        .cal-agenda {
          --ig-calendar-date-special-border-color: var(--ig-success-500);
        }
      </style>
      <div class="cal-layout">
        <igc-calendar
          class="cal-agenda"
          header-orientation="vertical"
          hide-outside-days
          .value=${today}
          .specialDates=${specialDates}
          @igcChange=${change}
        >
          <span slot="title">Team events</span>
        </igc-calendar>
        <section
          class="cal-panel"
          aria-label="Events of the selected day"
          aria-live="polite"
          ${list.mount}
        ></section>
      </div>
    `;
  },
};

const locales = [
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' },
  { value: 'de-DE', label: 'Deutsch (Deutschland)' },
  { value: 'fr-FR', label: 'Français (France)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'bg-BG', label: 'Български (България)' },
  { value: 'ja-JP', label: '日本語 (日本)' },
];

export const Localization: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The region settings of a user profile. The `locale` property sets the names of the months and the weekdays, the format of the header date and the first day of the week. Without `weekStart`, the week starts on the first day of the locale: Sunday for en-US and ja-JP, and Monday for the other locales here. Storybook registers the resource strings for German, French, Spanish, Japanese and Bulgarian, so the labels of the navigation buttons change too. The "Weekday names" select sets the `weekday` option of `formatOptions`.',
      },
    },
  },
  render: () => {
    let calendar: IgcCalendarComponent | undefined;

    const setLocale = ({ detail }: CustomEvent<{ value: string }>) => {
      calendar!.locale = detail.value;
    };

    const setWeekday = ({ detail }: CustomEvent<{ value: string }>) => {
      calendar!.formatOptions = {
        ...calendar!.formatOptions,
        weekday: detail.value as Intl.DateTimeFormatOptions['weekday'],
      };
    };

    return html`
      ${styles}
      <div class="cal-layout">
        <div class="cal-panel">
          <h3>Region</h3>
          <igc-select
            label="Language and region"
            value="en-US"
            @igcChange=${setLocale}
          >
            ${locales.map(
              ({ value, label }) =>
                html`<igc-select-item value=${value}>${label}</igc-select-item>`
            )}
          </igc-select>
          <igc-select
            label="Weekday names"
            value="narrow"
            @igcChange=${setWeekday}
          >
            <igc-select-item value="narrow">Narrow</igc-select-item>
            <igc-select-item value="short">Short</igc-select-item>
            <igc-select-item value="long">Long</igc-select-item>
          </igc-select>
        </div>
        <igc-calendar
          locale="en-US"
          show-week-numbers
          .value=${today}
          ${ref((element) => {
            calendar = element as IgcCalendarComponent | undefined;
          })}
        ></igc-calendar>
      </div>
    `;
  },
};
