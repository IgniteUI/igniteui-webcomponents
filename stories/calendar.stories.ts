import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  type DateRangeDescriptor,
  DateRangeType,
  IgcCalendarComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(IgcCalendarComponent);

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
        'Gets/Sets the locale used for getting language, affecting resource strings.',
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
      type: { name: 'enum', value: ['single', 'multiple', 'range'] },
      description: 'Sets the type of selection in the component.',
      options: ['single', 'multiple', 'range'],
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
      table: { defaultValue: { summary: 'sunday' } },
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
    weekStart: 'sunday',
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
  /** Gets/Sets the locale used for getting language, affecting resource strings. */
  locale: string;
  /**
   * The current value of the calendar.
   * Used when selection is set to single
   */
  value: Date;
  /** Get/Set the date which is shown in view and is highlighted. By default it is the current date. */
  activeDate: Date;
  /** Sets the type of selection in the component. */
  selection: 'single' | 'multiple' | 'range';
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

// Add additional configuration options
Object.assign(metadata.argTypes!, {
  weekDayFormat: {
    type: '"long" | "short" | "narrow"',
    options: ['long', 'short', 'narrow'],
    control: {
      type: 'inline-radio',
    },
  },
  monthFormat: {
    type: '"numeric" | "2-digit" | "long" | "short" | "narrow"',
    options: ['numeric', '2-digit', 'long', 'short', 'narrow'],
    control: {
      type: 'inline-radio',
    },
  },
  title: {
    type: 'string',
    control: 'text',
  },
  values: {
    type: 'string',
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

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

export const Basic: CalendarStory = {
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
      .activeDate=${args.activeDate ? new Date(args.activeDate) : new Date()}
      .value=${args.value ? new Date(args.value as Date) : undefined}
      values=${ifDefined(args.values)}
      visible-months=${ifDefined(args.visibleMonths)}
    >
    </igc-calendar>
  `,
};

export const RangeSelection: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const start = new Date(currentYear, currentMonth, 5);
    const end = new Date(currentYear, currentMonth, 18);
    return html`
      <igc-calendar
        selection="range"
        .values=${[start, end]}
        .activeDate=${new Date(currentYear, currentMonth, 1)}
      ></igc-calendar>
    `;
  },
};

export const MultipleSelection: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const values = [
      new Date(currentYear, currentMonth, 3),
      new Date(currentYear, currentMonth, 8),
      new Date(currentYear, currentMonth, 15),
      new Date(currentYear, currentMonth, 22),
    ];
    return html`
      <igc-calendar
        selection="multiple"
        .values=${values}
        .activeDate=${new Date(currentYear, currentMonth, 1)}
      ></igc-calendar>
    `;
  },
};

export const MultipleMonths: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const start = new Date(currentYear, currentMonth, 20);
    const end = new Date(currentYear, currentMonth + 1, 10);
    return html`
      <igc-calendar
        selection="range"
        visible-months="2"
        .values=${[start, end]}
        .activeDate=${new Date(currentYear, currentMonth, 1)}
      ></igc-calendar>
    `;
  },
};

export const DisabledDates: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const disabledDates: DateRangeDescriptor[] = [
      { type: DateRangeType.Weekends },
      {
        type: DateRangeType.Before,
        dateRange: [new Date(currentYear, currentMonth, 5)],
      },
    ];
    return html`
      <igc-calendar
        .disabledDates=${disabledDates}
        .activeDate=${new Date(currentYear, currentMonth, 1)}
      ></igc-calendar>
    `;
  },
};

export const SpecialDates: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const specialDates: DateRangeDescriptor[] = [
      {
        type: DateRangeType.Specific,
        dateRange: [
          new Date(currentYear, currentMonth, 10),
          new Date(currentYear, currentMonth, 15),
          new Date(currentYear, currentMonth, 20),
        ],
      },
      {
        type: DateRangeType.Between,
        dateRange: [
          new Date(currentYear, currentMonth, 22),
          new Date(currentYear, currentMonth, 25),
        ],
      },
    ];
    return html`
      <igc-calendar
        show-week-numbers
        .specialDates=${specialDates}
        .activeDate=${new Date(currentYear, currentMonth, 1)}
      ></igc-calendar>
    `;
  },
};
