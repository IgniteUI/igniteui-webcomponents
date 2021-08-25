import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Calendar',
  component: 'igc-calendar',
  argTypes: {
    hasHeader: {
      type: 'boolean',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: true,
        },
      },
    },
    headerOrientation: {
      type: '"vertical" | "horizontal"',
      options: ['vertical', 'horizontal'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'horizontal',
        },
      },
    },
    activeView: {
      type: '"days" | "months" | "years"',
      options: ['days', 'months', 'years'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'days',
        },
      },
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'large',
        },
      },
    },
    selection: {
      type: '"single" | "multi" | "range"',
      options: ['single', 'multi', 'range'],
      control: {
        type: 'inline-radio',
      },
      table: {
        defaultValue: {
          summary: 'single',
        },
      },
    },
    showWeekNumbers: {
      type: 'boolean',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
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
      table: {
        defaultValue: {
          summary: 'sunday',
        },
      },
    },
    viewDate: {
      type: 'Date',
      control: 'date',
      table: {
        defaultValue: {},
      },
    },
    locale: {
      type: 'string',
      control: 'text',
      table: {
        defaultValue: {
          summary: 'en',
        },
      },
    },
    hideOutsideDays: {
      type: 'boolean',
      control: 'boolean',
      table: {
        defaultValue: {
          summary: false,
        },
      },
    },
  },
};
export default metadata;
interface ArgTypes {
  hasHeader: boolean;
  headerOrientation: 'vertical' | 'horizontal';
  activeView: 'days' | 'months' | 'years';
  size: 'small' | 'medium' | 'large';
  selection: 'single' | 'multi' | 'range';
  showWeekNumbers: boolean;
  weekStart:
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';
  viewDate: Date;
  locale: string;
  hideOutsideDays: boolean;
}
// endregion

(metadata.argTypes as any).weekDayFormat = {
  type: '"long" | "short" | "narrow"',
  options: ['long', 'short', 'narrow'],
  control: {
    type: 'inline-radio',
  },
  table: {
    defaultValue: {
      summary: 'short',
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
      summary: 'short',
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
    viewDate = new Date(),
    weekDayFormat,
    monthFormat,
    selection,
    activeView,
    size,
    hasHeader = true,
    headerOrientation,
    title,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: monthFormat ?? 'short',
    weekday: weekDayFormat ?? 'short',
    year: 'numeric',
  };

  return html`
    <igc-calendar
      style="width: 500px;"
      ?has-header=${hasHeader}
      ?show-week-numbers=${showWeekNumbers}
      ?hide-outside-days=${hideOutsideDays}
      header-orientation=${ifDefined(headerOrientation)}
      week-start=${ifDefined(weekStart)}
      locale=${ifDefined(locale)}
      .viewDate=${new Date(viewDate)}
      selection=${ifDefined(selection)}
      active-view=${ifDefined(activeView)}
      .formatOptions=${formatOptions}
      size=${ifDefined(size)}
      dir=${ifDefined(direction)}
    >
      ${title ? html`<span slot="title">${title}</span>` : ''}
    </igc-calendar>
  `;
};

export const Basic = Template.bind({});
