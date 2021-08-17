import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

const metadata = {
  title: 'Days View',
  component: 'igc-days-view',
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
}

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  // eslint-disable-next-line no-empty-pattern
  {
    showWeekNumbers,
    hideOutsideDays,
    weekStart,
    locale,
    viewDate = new Date(),
    // weekDayFormat = 'short',
    selection = 'single',
  }: ArgTypes,
  { globals: { direction } }: Context
) => {
  // const formatOptions = { weekday: weekDayFormat };

  return html`
    <igc-days-view
      .showWeekNumbers=${showWeekNumbers}
      .hideOutsideDays=${hideOutsideDays}
      .weekStart=${weekStart}
      .locale=${locale}
      .viewDate=${new Date(viewDate)}
      .selection=${selection}
      dir=${ifDefined(direction)}
    >
    </igc-days-view>
  `;
};

export const Basic = Template.bind({});
