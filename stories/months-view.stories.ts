import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

const metadata = {
  title: 'Months View',
  component: 'igc-months-view',
  argTypes: {
    monthFormat: {
      type: '"numeric" | "2-digit" | "long" | "short" | "narrow"',
      defaultValue: 'short',
      control: {
        type: 'select',
        options: ['numeric', '2-digit', 'long', 'short', 'narrow'],
      },
    },
    locale: {
      type: 'string',
      defaultValue: 'en',
      control: 'text',
    },
  },
};
export default metadata;
interface ArgTypes {
  monthFormat: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  locale: string;
}

const Template: Story<ArgTypes, Context> = (
  { locale, monthFormat = 'short' }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <igc-months-view
      .locale=${locale}
      .monthFormat=${monthFormat}
      dir=${ifDefined(direction)}
    >
    </igc-months-view>
  `;
};

export const Basic = Template.bind({});
