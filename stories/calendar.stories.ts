import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { DateRangeDescriptor } from '../src/components/calendar/common/calendar.model.js';

// region default
const metadata = {
  title: 'Calendar',
  component: 'igc-calendar',
  argTypes: {
    hideOutsideDays: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    hasHeader: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
    },
    headerOrientation: {
      type: '"vertical" | "horizontal"',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'horizontal',
    },
    orientation: {
      type: '"vertical" | "horizontal"',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'horizontal',
    },
    visibleMonths: {
      type: 'number',
      control: 'number',
      defaultValue: '1',
    },
    activeView: {
      type: '"days" | "months" | "years"',
      options: ['days', 'months', 'years'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'days',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
    selection: {
      type: '"single" | "multi" | "range"',
      options: ['single', 'multi', 'range'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'single',
    },
    showWeekNumbers: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    weekStart: {
      type: '"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',
      options: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ],
      control: {
        type: 'select',
      },
      defaultValue: 'sunday',
    },
    activeDate: {
      type: 'Date',
      control: 'date',
    },
    locale: {
      type: 'string',
      control: 'text',
      defaultValue: 'en',
    },
  },
};
export default metadata;
interface ArgTypes {
  hideOutsideDays: boolean;
  hasHeader: boolean;
  headerOrientation: 'vertical' | 'horizontal';
  orientation: 'vertical' | 'horizontal';
  visibleMonths: number;
  activeView: 'days' | 'months' | 'years';
  size: 'small' | 'medium' | 'large';
  selection: 'single' | 'multiple' | 'range';
  showWeekNumbers: boolean;
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  activeDate: Date;
  locale: string;
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange'],
  },
};

(metadata.argTypes as any).weekDayFormat = {
  type: '"long" | "short" | "narrow"',
  options: ['long', 'short', 'narrow'],
  control: {
    type: 'inline-radio',
  },
  table: {
    defaultValue: {
      summary: 'narrow',
    },
  },
};

(metadata.argTypes as any).monthFormat = {
  type: '"numeric" | "2-digit" | "long" | "short" | "narrow"',
  options: ['numeric', '2-digit', 'long', 'short', 'narrow'],
  control: {
    type: 'inline-radio',
  },
  table: {
    defaultValue: {
      summary: 'long',
    },
  },
};

(metadata.argTypes as any).title = {
  type: 'string',
  control: 'text',
};

interface ArgTypes {
  weekDayFormat: 'long' | 'short' | 'narrow';
  monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  title: string;
}

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
    hasHeader = true,
    headerOrientation,
    orientation,
    title,
    visibleMonths,
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
      ?has-header=${hasHeader}
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
      size=${ifDefined(size)}
      visible-months=${ifDefined(visibleMonths)}
      dir=${ifDefined(direction)}
      @igcChange=${(ev: Event) => {
        console.log(ev);
        console.log(document.querySelector('igc-calendar')?.value);
      }}
    >
      ${title ? html`<span slot="title">${title}</span>` : ''}
    </igc-calendar>
  `;
};

export const Basic = Template.bind({});
