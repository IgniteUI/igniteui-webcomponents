import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Calendar',
  component: 'igc-calendar',
  argTypes: {
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

interface ArgTypes {
  weekDayFormat: 'long' | 'short' | 'narrow';
  monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
}

const Template: Story<ArgTypes, Context> = (
  {
    showWeekNumbers,
    hideOutsideDays,
    weekStart,
    locale,
    viewDate = new Date(),
    weekDayFormat = 'short',
    monthFormat = 'short',
    selection = 'single',
    activeView = 'days',
    size = 'large',
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const formatOptions = { weekday: weekDayFormat, month: monthFormat };

  return html`
    <igc-calendar
      style="width: 400px;"
      .showWeekNumbers=${showWeekNumbers}
      .hideOutsideDays=${hideOutsideDays}
      .weekStart=${weekStart}
      .locale=${locale}
      .viewDate=${new Date(viewDate)}
      .selection=${selection}
      .activeView=${activeView}
      .formatOptions=${formatOptions}
      .size=${size}
      dir=${ifDefined(direction)}
    >
    </igc-calendar>
  `;
};

export const Basic = Template.bind({});
