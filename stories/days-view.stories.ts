import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

export default {
  title: 'Calendar Days View',
  component: 'igc-days-view',
  argTypes: {
    showWeekNumber: {
      control: 'boolean',
      description: 'Determines whether to show week number.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    weekStart: {
      control: {
        type: 'inline-radio',
        options: [0, 1, 2, 3, 4, 5, 6],
        labels: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
      },
      defaultValue: 0,
    },
    locale: {
      control: {
        type: 'inline-radio',
        options: ['en', 'ja', 'fr', 'bg'],
      },
      defaultValue: 'en',
    },
    viewDate: {
      control: 'date',
    },
    weekDayFormat: {
      control: {
        type: 'inline-radio',
        options: ['long', 'short', 'narrow'],
      },
    },
    selection: {
      control: {
        type: 'inline-radio',
        options: ['single', 'multi', 'range'],
      },
    },
  },
};

interface ArgTypes {
  showWeekNumber: boolean;
  weekStart: number;
  locale: string;
  viewDate: Date;
  weekDayFormat: 'long' | 'short' | 'narrow';
  selection: 'single' | 'multi' | 'range';
}

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  // eslint-disable-next-line no-empty-pattern
  {
    showWeekNumber,
    weekStart,
    locale,
    viewDate = new Date(),
    weekDayFormat = 'short',
    selection = 'single',
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const formatOptions = { weekday: weekDayFormat };

  return html`
    <igc-days-view
      .showWeekNumber=${showWeekNumber}
      .weekStart=${weekStart}
      .locale=${locale}
      .viewDate=${new Date(viewDate)}
      .formatOptions=${formatOptions}
      .selection=${selection}
      dir=${ifDefined(direction)}
    >
    </igc-days-view>
  `;
};

export const Basic = Template.bind({});
