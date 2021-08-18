import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

const metadata = {
  title: 'Calendar',
  component: 'igc-calendar',
  argTypes: {
    selection: {
      type: '"single" | "multi" | "range"',
      defaultValue: 'single',
      control: {
        type: 'inline-radio',
        options: ['single', 'multi', 'range'],
      },
    },
    showWeekNumbers: {
      type: 'boolean',
      defaultValue: false,
      control: 'boolean',
    },
    weekStart: {
      type: '"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"',
      defaultValue: 'sunday',
      control: {
        type: 'select',
        options: [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ],
      },
    },
    viewDate: {
      type: 'Date',
      control: 'date',
    },
    locale: {
      type: 'string',
      defaultValue: 'en',
      control: 'text',
    },
    hideOutsideDays: {
      type: 'boolean',
      defaultValue: false,
      control: 'boolean',
    },
    activeView: {
      type: '"days" | "months" | "years"',
      options: ['days', 'months', 'years'],
      control: { type: 'inline-radio' },
    },
  },
};
export default metadata;
interface ArgTypes {
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
  activeView: 'days' | 'months' | 'years';
}

const Template: Story<ArgTypes, Context> = (
  {
    showWeekNumbers,
    hideOutsideDays,
    weekStart,
    locale,
    viewDate = new Date(),
    // weekDayFormat = 'short',
    selection = 'single',
    activeView = 'days',
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  // const formatOptions = { weekday: weekDayFormat };

  return html`
    <igc-calendar
      style="width: 500px;"
      .showWeekNumbers=${showWeekNumbers}
      .hideOutsideDays=${hideOutsideDays}
      .weekStart=${weekStart}
      .locale=${locale}
      .viewDate=${new Date(viewDate)}
      .selection=${selection}
      .activeView=${activeView}
      dir=${ifDefined(direction)}
    >
    </igc-calendar>
  `;
};

export const Basic = Template.bind({});
