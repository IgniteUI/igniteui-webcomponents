import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcButtonComponent,
  IgcRangeSliderComponent,
  type IgcRangeSliderValueEventArgs,
  IgcSliderLabelComponent,
  IgcSwitchComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formSubmitHandler,
  renderInto,
  storyStyles,
  wholeDollars,
} from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcRangeSliderComponent,
  IgcSliderLabelComponent,
  IgcSwitchComponent
);

// region default
const metadata: Meta<IgcRangeSliderComponent> = {
  title: 'RangeSlider',
  component: 'igc-range-slider',
  parameters: {
    docs: {
      description: {
        component:
          'A range slider component used to select two numeric values within a range.',
      },
    },
    actions: { handles: ['igcInput', 'igcChange'] },
  },
  argTypes: {
    lower: {
      type: 'number',
      description: 'The current value of the lower thumb.',
      control: 'number',
    },
    upper: {
      type: 'number',
      description:
        'The current value of the upper thumb. Until it is set, and after the\nattribute is removed, it follows `upperBound`.',
      control: 'number',
    },
    thumbLabelLower: {
      type: 'string',
      description: 'The aria label for the lower thumb.',
      control: 'text',
    },
    thumbLabelUpper: {
      type: 'string',
      description: 'The aria label for the upper thumb.',
      control: 'text',
    },
    min: {
      type: 'number',
      description:
        'The minimum value of the slider scale. Defaults to 0.\n\nIf `min` is greater than `max`, the update keeps the previous `min`. The\nupdate checks the values after all of them are set, so the order of the\nattributes has no effect.\n\nIf `labels` are provided (projected), then `min` is always 0.\n\nIf `lowerBound` is less than `min`, the slider uses `min` as the lower bound.',
      control: 'number',
    },
    max: {
      type: 'number',
      description:
        'The maximum value of the slider scale. Defaults to 100.\n\nIf `max` is less than `min`, the update keeps the previous `max`. The\nupdate checks the values after all of them are set, so the order of the\nattributes has no effect.\n\nIf `labels` are provided (projected), then `max` is always the number of\nlabels minus one.\n\nIf `upperBound` is greater than `max`, the slider uses `max` as the upper bound.',
      control: 'number',
    },
    lowerBound: {
      type: 'number',
      description:
        'The lower bound of the slider value. If not set, the `min` value is applied.',
      control: 'number',
    },
    upperBound: {
      type: 'number',
      description:
        'The upper bound of the slider value. If not set, the `max` value is applied.',
      control: 'number',
    },
    disabled: {
      type: 'boolean',
      description: 'Disables the UI interactions of the slider.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    discreteTrack: {
      type: 'boolean',
      description:
        'Marks the slider track as discrete so it displays the steps.\nIf the `step` is 0, the slider will remain continuous even if `discreteTrack` is `true`.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideTooltip: {
      type: 'boolean',
      description: 'Hides the thumb tooltip.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    step: {
      type: 'number',
      description:
        'Specifies the granularity that the value must adhere to.\n\nIf set to 0 no stepping is implied and any value in the range is allowed.\nA negative step is not valid, so the previous step stays.\nIf `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.',
      control: 'number',
      table: { defaultValue: { summary: '1' } },
    },
    primaryTicks: {
      type: 'number',
      description:
        'The number of primary ticks. It defaults to 0 which means no primary ticks are displayed.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    secondaryTicks: {
      type: 'number',
      description:
        'The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed.',
      control: 'number',
      table: { defaultValue: { summary: '0' } },
    },
    tickOrientation: {
      type: { name: 'enum', value: ['start', 'end', 'mirror'] },
      description: 'Changes the orientation of the ticks.',
      options: ['start', 'end', 'mirror'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'end' } },
    },
    hidePrimaryLabels: {
      type: 'boolean',
      description: 'Hides the primary tick labels.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideSecondaryLabels: {
      type: 'boolean',
      description: 'Hides the secondary tick labels.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    locale: {
      type: 'string',
      description:
        'The locale used to format the thumb and tick label values in the slider.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
    },
    valueFormat: {
      type: 'string',
      description:
        'String format used for the thumb and tick label values in the slider.',
      control: 'text',
    },
    tickLabelRotation: {
      type: { name: 'enum', value: [0, 90, -90] },
      description:
        'The degrees for the rotation of the tick labels. Defaults to 0.',
      options: [0, 90, -90],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: '0' } },
    },
  },
  args: {
    disabled: false,
    discreteTrack: false,
    hideTooltip: false,
    step: 1,
    primaryTicks: 0,
    secondaryTicks: 0,
    tickOrientation: 'end',
    hidePrimaryLabels: false,
    hideSecondaryLabels: false,
    locale: 'en',
    tickLabelRotation: 0,
  },
};

export default metadata;

interface IgcRangeSliderArgs {
  /** The current value of the lower thumb. */
  lower: number;
  /**
   * The current value of the upper thumb. Until it is set, and after the
   * attribute is removed, it follows `upperBound`.
   */
  upper: number;
  /** The aria label for the lower thumb. */
  thumbLabelLower: string;
  /** The aria label for the upper thumb. */
  thumbLabelUpper: string;
  /**
   * The minimum value of the slider scale. Defaults to 0.
   *
   * If `min` is greater than `max`, the update keeps the previous `min`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `min` is always 0.
   *
   * If `lowerBound` is less than `min`, the slider uses `min` as the lower bound.
   */
  min: number;
  /**
   * The maximum value of the slider scale. Defaults to 100.
   *
   * If `max` is less than `min`, the update keeps the previous `max`. The
   * update checks the values after all of them are set, so the order of the
   * attributes has no effect.
   *
   * If `labels` are provided (projected), then `max` is always the number of
   * labels minus one.
   *
   * If `upperBound` is greater than `max`, the slider uses `max` as the upper bound.
   */
  max: number;
  /** The lower bound of the slider value. If not set, the `min` value is applied. */
  lowerBound: number;
  /** The upper bound of the slider value. If not set, the `max` value is applied. */
  upperBound: number;
  /** Disables the UI interactions of the slider. */
  disabled: boolean;
  /**
   * Marks the slider track as discrete so it displays the steps.
   * If the `step` is 0, the slider will remain continuous even if `discreteTrack` is `true`.
   */
  discreteTrack: boolean;
  /** Hides the thumb tooltip. */
  hideTooltip: boolean;
  /**
   * Specifies the granularity that the value must adhere to.
   *
   * If set to 0 no stepping is implied and any value in the range is allowed.
   * A negative step is not valid, so the previous step stays.
   * If `labels` are provided (projected) then the step is always assumed to be 1 since it is a discrete slider.
   */
  step: number;
  /** The number of primary ticks. It defaults to 0 which means no primary ticks are displayed. */
  primaryTicks: number;
  /** The number of secondary ticks. It defaults to 0 which means no secondary ticks are displayed. */
  secondaryTicks: number;
  /** Changes the orientation of the ticks. */
  tickOrientation: 'start' | 'end' | 'mirror';
  /** Hides the primary tick labels. */
  hidePrimaryLabels: boolean;
  /** Hides the secondary tick labels. */
  hideSecondaryLabels: boolean;
  /** The locale used to format the thumb and tick label values in the slider. */
  locale: string;
  /** String format used for the thumb and tick label values in the slider. */
  valueFormat: string;
  /** The degrees for the rotation of the tick labels. Defaults to 0. */
  tickLabelRotation: 0 | 90 | -90;
}
type Story = StoryObj<IgcRangeSliderArgs>;

// endregion

// A drag sends `igcInput` on each move, and the actions panel slows the page down.
metadata.parameters = { ...metadata.parameters, actions: { disable: true } };

const styles = html`
  ${storyStyles}
  <style>
    .rs-stack {
      display: grid;
      gap: 1.5rem;
      max-width: 44rem;
    }

    .rs-stack :is(h3, p, ul, table) {
      margin: 0;
    }

    .rs-panel {
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .rs-field {
      display: grid;
      gap: 0.25rem;
    }

    .rs-label {
      font-weight: 600;
    }

    /* The labels at the ends of the track reach past the box of the slider. */
    .rs-panel igc-range-slider[primary-ticks] {
      margin-inline: 1.5rem;
    }

    .rs-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
`;

const usd: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
};

export const Default: Story = {
  args: {
    thumbLabelLower: 'Minimum price',
    thumbLabelUpper: 'Maximum price',
    lower: 50,
    upper: 300,
    max: 500,
    step: 10,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The price filter of an online shop. `thumb-label-lower` and `thumb-label-upper` name the two thumbs, and the `aria-labelledby` of the host names the group of the thumbs. The thumbs cannot cross: when you drag one thumb past the other, the drag moves to the other thumb. Use the controls panel to change the values, the scale, the step, the bounds, the ticks and the format.',
      },
    },
  },
  render: (args) => html`
    <style>
      .rs-default {
        display: grid;
        gap: 0.5rem;
        max-width: 30rem;
        padding-block-start: 3rem;
      }
    </style>
    <div class="rs-default">
      <span id="rs-price-label">Price</span>
      <igc-range-slider
        aria-labelledby="rs-price-label"
        .thumbLabelLower=${args.thumbLabelLower}
        .thumbLabelUpper=${args.thumbLabelUpper}
        .lower=${args.lower}
        .upper=${args.upper}
        .valueFormatOptions=${usd}
        ?disabled=${args.disabled}
        ?discrete-track=${args.discreteTrack}
        ?hide-tooltip=${args.hideTooltip}
        ?hide-primary-labels=${args.hidePrimaryLabels}
        ?hide-secondary-labels=${args.hideSecondaryLabels}
        .step=${args.step}
        .min=${args.min}
        .max=${args.max}
        .locale=${args.locale}
        .lowerBound=${args.lowerBound}
        .upperBound=${args.upperBound}
        .primaryTicks=${args.primaryTicks}
        .secondaryTicks=${args.secondaryTicks}
        .tickOrientation=${args.tickOrientation}
        .tickLabelRotation=${args.tickLabelRotation}
        .valueFormat=${args.valueFormat}
      ></igc-range-slider>
    </div>
  `,
};

const headphones = [
  { name: 'Classic Wired', kind: 'On-ear, wired', price: 25 },
  { name: 'Kids Volume Safe', kind: 'On-ear, volume limit', price: 35 },
  { name: 'Sport Buds', kind: 'In-ear, water resistant', price: 59 },
  { name: 'Wireless Lite', kind: 'On-ear, Bluetooth', price: 79 },
  { name: 'Travel Foldable', kind: 'Over-ear, foldable', price: 89 },
  { name: 'Gaming Headset X', kind: 'Over-ear, microphone', price: 129 },
  { name: 'Studio Monitor 50', kind: 'Over-ear, wired', price: 149 },
  { name: 'Commuter ANC', kind: 'Over-ear, noise cancelling', price: 279 },
  { name: 'Open Back Pro', kind: 'Over-ear, open back', price: 399 },
  { name: 'Reference Planar', kind: 'Over-ear, planar magnetic', price: 499 },
];

export const ProductFilters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The headphones of an online shop with a price filter. The slider formats its values as US dollars with `valueFormatOptions`. The `igcInput` event comes on each move of a drag, and it updates the price range above the slider. The `igcChange` event comes when you release the thumb and on each key press, and it filters the list, so the list does not change on each move. The status line tells a screen reader how many products match.',
      },
    },
  },
  render: () => {
    let range = { lower: 50, upper: 300 };
    let shown = { ...range };

    const preview = ({ detail }: CustomEvent<IgcRangeSliderValueEventArgs>) => {
      shown = detail;
      update();
    };

    const filter = ({ detail }: CustomEvent<IgcRangeSliderValueEventArgs>) => {
      range = detail;
      shown = detail;
      update();
    };

    const priceRange = ({ lower, upper }: typeof range) =>
      `${wholeDollars.format(lower)} to ${wholeDollars.format(upper)}`;

    const { mount, update } = renderInto(() => {
      const matches = headphones.filter(
        ({ price }) => price >= range.lower && price <= range.upper
      );

      return html`
        <aside class="rs-field rs-filter">
          <span id="rs-filter-label" class="rs-label">Price</span>
          <span class="muted">${priceRange(shown)}</span>
          <igc-range-slider
            aria-labelledby="rs-filter-label"
            thumb-label-lower="Minimum price"
            thumb-label-upper="Maximum price"
            max="500"
            step="10"
            lower="50"
            upper="300"
            primary-ticks="3"
            .valueFormatOptions=${usd}
            @igcInput=${preview}
            @igcChange=${filter}
          ></igc-range-slider>
        </aside>
        <div class="rs-stack">
          <p role="status">
            ${matches.length} of ${headphones.length} headphones cost
            ${priceRange(range)}.
          </p>
          <ul class="rs-products">
            ${matches.map(
              ({ name, kind, price }) => html`
                <li>
                  <strong>${name}</strong>
                  <span class="muted">${kind}</span>
                  <span>${wholeDollars.format(price)}</span>
                </li>
              `
            )}
          </ul>
        </div>
      `;
    });

    return html`
      ${styles}
      <style>
        .rs-shop {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
          align-items: start;
          gap: 2rem;
          max-width: 56rem;
        }

        .rs-filter {
          padding-block-start: 0.5rem;
        }

        .rs-products {
          display: grid;
          gap: 0.5rem;
          padding: 0;
          list-style: none;
        }

        .rs-products li {
          display: grid;
          grid-template-columns: 1fr auto;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--ig-gray-300);
          border-radius: 8px;
        }

        .rs-products li span:last-child {
          grid-row: 1 / 3;
          grid-column: 2;
          align-self: center;
          font-weight: 600;
        }
      </style>
      <section
        class="rs-shop rs-panel"
        aria-label="Headphones"
        ${mount}
      ></section>
    `;
  },
};

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const twoDigits: Intl.NumberFormatOptions = { minimumIntegerDigits: 2 };
const time = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

export const OpeningHours: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The opening hours of a store in its settings form. Each day has a range slider from 0 to 24 with a step of one hour. `value-format="{0}:00"` and `valueFormatOptions` with `minimumIntegerDigits: 2` show the values as times, such as 09:00. The `aria-labelledby` of each slider points to the day, so the day names the group of the two thumbs. A closed day disables its slider. The range slider is not form associated, so a hidden input of each day holds the hours, and the `igcChange` event updates it. "Use the Monday hours" sets `lower` and `upper` from code. Save shows the form data.',
      },
    },
  },
  render: () => {
    const hours = days.map((day, index) => ({
      day,
      open: index < 6,
      from: index < 5 ? 9 : 10,
      to: index < 5 ? 18 : 14,
    }));

    const setHours =
      (index: number) =>
      ({ detail }: CustomEvent<IgcRangeSliderValueEventArgs>) => {
        hours[index].from = detail.lower;
        hours[index].to = detail.upper;
        update();
      };

    const toggle = (index: number) => (event: CustomEvent) => {
      hours[index].open = (event.target as IgcSwitchComponent).checked;
      update();
    };

    const useMonday = () => {
      const [monday, ...others] = hours;

      for (const day of others.filter(({ open }) => open)) {
        day.from = monday.from;
        day.to = monday.to;
      }
      update();
    };

    const { mount, update } = renderInto(() =>
      hours.map(
        ({ day, open, from, to }, index) => html`
          <div class="rs-day">
            <span id="rs-day-${index}" class="rs-label">${day}</span>
            <igc-switch .checked=${open} @igcChange=${toggle(index)}>
              Open<span class="sr-only">on ${day}</span>
            </igc-switch>
            <igc-range-slider
              aria-labelledby="rs-day-${index}"
              thumb-label-lower="Opens"
              thumb-label-upper="Closes"
              max="24"
              .lower=${from}
              .upper=${to}
              ?disabled=${!open}
              primary-ticks="5"
              secondary-ticks="5"
              hide-secondary-labels
              value-format="{0}:00"
              .valueFormatOptions=${twoDigits}
              @igcChange=${setHours(index)}
            ></igc-range-slider>
            <span class="muted">
              ${open ? `${time(from)} to ${time(to)}` : 'Closed'}
            </span>
            <input
              type="hidden"
              name=${day.toLowerCase()}
              .value=${open ? `${time(from)}-${time(to)}` : 'closed'}
            />
          </div>
        `
      )
    );

    return html`
      ${styles}
      <style>
        .rs-days {
          display: grid;
          gap: 1rem;
        }

        .rs-day {
          display: grid;
          grid-template-columns: 6rem auto 1fr 7rem;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 40rem) {
          .rs-day {
            grid-template-columns: 1fr auto;
          }

          .rs-day igc-range-slider {
            grid-column: 1 / -1;
          }
        }
      </style>
      <form
        class="rs-stack rs-panel"
        aria-labelledby="rs-hours-title"
        @submit=${formSubmitHandler}
      >
        <h3 id="rs-hours-title">Opening hours</h3>
        <div class="rs-days" ${mount}></div>
        <div class="rs-row">
          <igc-button type="submit">Save</igc-button>
          <igc-button variant="outlined" @click=${useMonday}>
            Use the Monday hours for all open days
          </igc-button>
        </div>
      </form>
    `;
  },
};

const levels = [
  'Debug',
  'Info',
  'Notice',
  'Warning',
  'Error',
  'Critical',
  'Alert',
  'Emergency',
];

const logEntries = [
  { time: '09:14:02', level: 1, message: 'Server started on port 8080' },
  { time: '09:14:05', level: 0, message: 'Loaded 42 routes' },
  { time: '09:15:11', level: 3, message: 'Slow query: 1.8 s on /api/orders' },
  { time: '09:16:40', level: 2, message: 'New device sign-in for maya.patel' },
  { time: '09:18:03', level: 4, message: 'Payment provider returned 502' },
  { time: '09:18:04', level: 1, message: 'Retry 1 of 3 for the payment' },
  { time: '09:18:09', level: 4, message: 'The payment retry failed' },
  { time: '09:20:30', level: 5, message: 'Disk usage on db-1 is 95%' },
  { time: '09:21:00', level: 3, message: 'Cache hit rate fell to 61%' },
  { time: '09:22:15', level: 6, message: 'Replication lag on db-2 is 120 s' },
  {
    time: '09:23:47',
    level: 7,
    message: 'db-1 is read-only: the disk is full',
  },
  { time: '09:24:10', level: 1, message: 'Maintenance mode is on' },
];

export const LogViewer: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A server log with a severity filter. The slider has an `igc-slider-label` for each severity level, so the values are the indexes of the labels, and the thumb labels, the tick labels and `aria-valuetext` show the names of the levels. With labels, `primary-ticks="1"` draws a tick with a label for each level. The table follows the `igcChange` event.',
      },
    },
  },
  render: () => {
    let range = { lower: 3, upper: 7 };

    const filter = ({ detail }: CustomEvent<IgcRangeSliderValueEventArgs>) => {
      range = detail;
      update();
    };

    const { mount, update } = renderInto(() => {
      const entries = logEntries.filter(
        ({ level }) => level >= range.lower && level <= range.upper
      );

      return html`
        <p class="muted" role="status">
          ${entries.length} of ${logEntries.length} entries, from
          ${levels[range.lower]} to ${levels[range.upper]}.
        </p>
        <table class="rs-log">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Level</th>
              <th scope="col">Message</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map(
              ({ time, level, message }) => html`
                <tr>
                  <td>${time}</td>
                  <td>${levels[level]}</td>
                  <td>${message}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      `;
    });

    return html`
      ${styles}
      <style>
        .rs-panel igc-range-slider.rs-severity {
          margin-inline: 2rem;
        }

        .rs-log {
          width: 100%;
          border-collapse: collapse;
          font-variant-numeric: tabular-nums;
        }

        .rs-log :is(th, td) {
          padding: 0.375rem 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
          text-align: start;
        }
      </style>
      <section class="rs-stack rs-panel" aria-labelledby="rs-log-title">
        <h3 id="rs-log-title">Server log</h3>
        <div class="rs-field">
          <span id="rs-severity" class="rs-label">Severity</span>
          <igc-range-slider
            class="rs-severity"
            aria-labelledby="rs-severity"
            thumb-label-lower="Lowest severity"
            thumb-label-upper="Highest severity"
            lower="3"
            upper="7"
            primary-ticks="1"
            discrete-track
            @igcChange=${filter}
          >
            ${levels.map(
              (level) => html`<igc-slider-label>${level}</igc-slider-label>`
            )}
          </igc-range-slider>
        </div>
        <div class="rs-stack" ${mount}></div>
      </section>
    `;
  },
};
