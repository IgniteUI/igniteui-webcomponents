import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

// region default
const metadata = {
  title: 'Months View',
  component: 'igc-months-view',
  argTypes: {
    value: {
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
    monthFormat: {
      type: '"long" | "short" | "narrow" | "numeric" | "2-digit"',
      options: ['long', 'short', 'narrow', 'numeric', '2-digit'],
      control: {
        type: 'select',
      },
      table: {
        defaultValue: {
          summary: 'long',
        },
      },
    },
  },
};
export default metadata;
interface ArgTypes {
  value: Date;
  locale: string;
  monthFormat: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { locale, monthFormat }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-months-view
      locale=${ifDefined(locale)}
      monthFormat=${ifDefined(monthFormat)}
      dir=${ifDefined(direction)}
    >
    </igc-months-view>
  `;
};

export const Basic = Template.bind({});
