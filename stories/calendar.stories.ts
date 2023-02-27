import { html } from 'lit';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { DateRangeDescriptor } from '../src/components/calendar/common/calendar.model.js';
import { defineComponents, IgcCalendarComponent } from '../src/index.js';

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
  },
  argTypes: {
    hideOutsideDays: {
      type: 'boolean',
      description:
        'Controls the visibility of the dates that do not belong to the current month.',
      control: 'boolean',
      defaultValue: false,
    },
    hideHeader: {
      type: 'boolean',
      description:
        'Determines whether the calendar hides its header. Even if set to false, the header is not displayed for `multiple` selection.',
      control: 'boolean',
      defaultValue: false,
    },
    headerOrientation: {
      type: '"vertical" | "horizontal"',
      description: 'The orientation of the header.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      defaultValue: 'horizontal',
    },
    orientation: {
      type: '"vertical" | "horizontal"',
      description:
        'The orientation of the multiple months displayed in days view.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      defaultValue: 'horizontal',
    },
    visibleMonths: {
      type: 'number',
      description: 'The number of months displayed in days view.',
      control: 'number',
      defaultValue: '1',
    },
    activeView: {
      type: '"days" | "months" | "years"',
      description: 'The active view.',
      options: ['days', 'months', 'years'],
      control: { type: 'inline-radio' },
      defaultValue: 'days',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'large',
    },
    value: {
      type: 'Date | undefined',
      description:
        'Тhe current value of the calendar.\nUsed when selection is set to single.',
      control: 'date',
    },
    selection: {
      type: '"single" | "multiple" | "range"',
      description: 'Sets the type of date selection.',
      options: ['single', 'multiple', 'range'],
      control: { type: 'inline-radio' },
      defaultValue: 'single',
    },
    showWeekNumbers: {
      type: 'boolean',
      description: 'Show/hide the week numbers.',
      control: 'boolean',
      defaultValue: false,
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
      defaultValue: 'sunday',
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
      defaultValue: 'en',
    },
  },
  args: {
    hideOutsideDays: false,
    hideHeader: false,
    headerOrientation: 'horizontal',
    orientation: 'horizontal',
    visibleMonths: '1',
    activeView: 'days',
    size: 'large',
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
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
  /**
   * Тhe current value of the calendar.
   * Used when selection is set to single.
   */
  value: Date | undefined;
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

// (metadata as any).parameters = {
//   actions: {
//     handles: ['igcChange'],
//   },
// };

// (metadata.argTypes as any).weekDayFormat = {
//   type: '"long" | "short" | "narrow"',
//   options: ['long', 'short', 'narrow'],
//   control: {
//     type: 'inline-radio',
//   },
//   table: {
//     defaultValue: {
//       summary: 'narrow',
//     },
//   },
// };

// (metadata.argTypes as any).monthFormat = {
//   type: '"numeric" | "2-digit" | "long" | "short" | "narrow"',
//   options: ['numeric', '2-digit', 'long', 'short', 'narrow'],
//   control: {
//     type: 'inline-radio',
//   },
//   table: {
//     defaultValue: {
//       summary: 'long',
//     },
//   },
// };

// (metadata.argTypes as any).title = {
//   type: 'string',
//   control: 'text',
// };

// (metadata.argTypes as any).values = {
//   type: 'string',
//   control: 'text',
// };

// interface ArgTypes {
//   weekDayFormat: 'long' | 'short' | 'narrow';
//   monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
//   title: string;
//   values: string;
// }

const Template: Story<ArgTypes, Context> = (
  {
    showWeekNumbers,
    hideOutsideDays,
    weekStart,
    locale,
    weekDayFormat,
    monthFormat,
    selection,
    activeView,
    size,
    hideHeader = false,
    headerOrientation,
    orientation,
    title,
    visibleMonths,
    value,
    values,
    activeDate,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    month: monthFormat ?? 'long',
    weekday: weekDayFormat ?? 'narrow',
  };

  const disabledDates: DateRangeDescriptor[] = [
    // {
    //   type: DateRangeType.Before,
    //   dateRange: [new Date()],
    // },
  ];

  const specialDates: DateRangeDescriptor[] = [
    // {
    //   type: DateRangeType.Specific,
    //   dateRange: [new Date(2021, 8, 22)],
    // },
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
      size=${ifDefined(size)}
      visible-months=${ifDefined(visibleMonths)}
      dir=${ifDefined(direction)}
      @igcChange=${(ev: Event) => {
        console.log(ev);
      }}
    >
      ${title ? html`<span slot="title">${title}</span>` : ''}
    </igc-calendar>
  `;
};

export const Basic = Template.bind({});
