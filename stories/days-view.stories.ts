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
      description: 'Determines whether the show week number.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
    size: {
      control: {
        type: 'inline-radio',
        options: ['small', 'medium', 'large'],
      },
      defaultValue: 'large',
    },
    variant: {
      control: {
        type: 'inline-radio',
        options: ['flat', 'raised', 'outlined', 'fab'],
      },
      defaultValue: 'flat',
    },
    type: {
      control: {
        type: 'inline-radio',
        options: ['button', 'reset', 'submit'],
      },
      defaultValue: 'button',
    },
  },
};

interface ArgTypes {
  showWeekNumber: boolean;
  size: 'small' | 'medium' | 'large';
  variant: 'flat' | 'raised' | 'outlined' | 'fab';
  type: 'button' | 'reset' | 'submit';
}

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  // eslint-disable-next-line no-empty-pattern
  { showWeekNumber }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-days-view
      .showWeekNumber=${showWeekNumber}
      dir=${ifDefined(direction)}
    >
    </igc-days-view>
  `;
};

export const Basic = Template.bind({});
