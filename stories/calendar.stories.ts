import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  DateRangeDescriptor,
  DateRangeType,
} from '../src/components/calendar/common/calendar.model.js';
import { IgcCalendarComponent, defineComponents } from '../src/index.js';

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
        'Controls the visibility of the dates that do not belong to the current month.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    hideHeader: {
      type: 'boolean',
      description:
        'Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    headerOrientation: {
      type: '"vertical" | "horizontal"',
      description: 'The orientation of the header.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    orientation: {
      type: '"vertical" | "horizontal"',
      description:
        'The orientation of the multiple months displayed in days view.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in days view.',
      control: 'number',
      table: { defaultValue: { summary: 1 } },
    },
    activeView: {
      type: '"days" | "months" | "years"',
      description: 'The active view.',
      options: ['days', 'months', 'years'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'days' } },
    },
    value: {
      type: 'Date',
      description:
        'The current value of the calendar.\nUsed when selection is set to single.',
      control: 'date',
    },
    selection: {
      type: '"single" | "multiple" | "range"',
      description: 'Sets the type of date selection.',
      options: ['single', 'multiple', 'range'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'single' } },
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Show/hide the week numbers.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    weekStart: {
      type: '"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',
      description: 'Sets the start day of the week.',
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
    activeDate: {
      type: 'Date',
      description:
        'Sets the date which is shown in view and is highlighted. By default it is the current date.',
      control: 'date',
    },
    locale: {
      type: 'string',
      description:
        'Sets the locale used for formatting and displaying the dates in the calendar.',
      control: 'text',
      table: { defaultValue: { summary: 'en' } },
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
    locale: 'en',
  },
};

export default metadata;

interface IgcCalendarArgs {
  /** Controls the visibility of the dates that do not belong to the current month. */
  hideOutsideDays: boolean;
  /** Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection. */
  hideHeader: boolean;
  /** The orientation of the header. */
  headerOrientation: 'vertical' | 'horizontal';
  /** The orientation of the multiple months displayed in days view. */
  orientation: 'vertical' | 'horizontal';
  /** The number of months displayed in days view. */
  visibleMonths: number;
  /** The active view. */
  activeView: 'days' | 'months' | 'years';
  /**
   * The current value of the calendar.
   * Used when selection is set to single.
   */
  value: Date;
  /** Sets the type of date selection. */
  selection: 'single' | 'multiple' | 'range';
  /** Show/hide the week numbers. */
  showWeekNumbers: boolean;
  /** Sets the start day of the week. */
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  /** Sets the date which is shown in view and is highlighted. By default it is the current date. */
  activeDate: Date;
  /** Sets the locale used for formatting and displaying the dates in the calendar. */
  locale: string;
}
type Story = StoryObj<IgcCalendarArgs>;

// endregion

// Enhance the calendar args with extra properties
interface IgcCalendarArgs {
  weekDayFormat: '"long" | "short" | "narrow"';
  monthFormat: '"numeric" | "2-digit" | "long" | "short" | "narrow"';
  title: string;
  values: string;
}

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

const Template = ({
  showWeekNumbers,
  hideOutsideDays,
  weekStart,
  locale,
  weekDayFormat,
  monthFormat,
  selection,
  activeView,
  hideHeader = false,
  headerOrientation,
  orientation,
  title,
  visibleMonths,
  value,
  values,
  activeDate,
}: IgcCalendarArgs) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: monthFormat,
    weekday: weekDayFormat,
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const disabledDates: DateRangeDescriptor[] = [
    {
      type: DateRangeType.Specific,
      dateRange: [new Date(currentYear, currentMonth, 7)],
    },
  ];

  const specialDates: DateRangeDescriptor[] = [
    {
      type: DateRangeType.Specific,
      dateRange: [new Date(currentYear, currentMonth, 22)],
    },
    {
      type: DateRangeType.Specific,
      dateRange: [new Date(currentYear, currentMonth, 23)],
    },
  ];

  return html`
    <igc-calendar
      ?hide-header=${hideHeader}
      ?show-week-numbers=${showWeekNumbers}
      ?hide-outside-days=${hideOutsideDays}
      header-orientation=${ifDefined(headerOrientation)}
      orientation=${ifDefined(orientation)}
      week-start=${ifDefined(weekStart)}
      locale=${ifDefined(locale)}
      selection=${ifDefined(selection)}
      active-view=${ifDefined(activeView)}
      .formatOptions=${formatOptions}
      .disabledDates=${disabledDates}
      .specialDates=${specialDates}
      .activeDate=${activeDate ? new Date(activeDate) : new Date()}
      .value=${value ? new Date(value as Date) : undefined}
      values=${ifDefined(values)}
      visible-months=${ifDefined(visibleMonths)}
      @igcChange=${(ev: Event) => {
        console.log(ev);
      }}
    >
      ${title ? html`<span slot="title">${title}</span>` : ''}
    </igc-calendar>
  `;
};

export const Basic: Story = Template.bind({});
