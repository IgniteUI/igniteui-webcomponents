import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Days View',
  component: 'igc-days-view',
  argTypes: {
    weekDayFormat: {
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
  weekDayFormat: 'long' | 'short' | 'narrow';
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

const Template: Story<ArgTypes, Context> = (
  {
    showWeekNumbers,
    hideOutsideDays,
    weekStart,
    locale,
    viewDate = new Date(),
    weekDayFormat,
    selection,
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-days-view
      ?show-week-numbers=${showWeekNumbers}
      ?hide-outside-days=${hideOutsideDays}
      week-start=${ifDefined(weekStart)}
      locale=${ifDefined(locale)}
      .viewDate=${new Date(viewDate)}
      selection=${ifDefined(selection)}
      week-day-format=${ifDefined(weekDayFormat)}
      dir=${ifDefined(direction)}
    >
    </igc-days-view>
  `;
};

export const Basic = Template.bind({});
