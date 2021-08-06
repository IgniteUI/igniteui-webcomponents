import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import '../igniteui-webcomponents.js';
import { Story } from './story';

export default {
  title: 'Navigation Bar',
  component: 'igc-navbar',
  argTypes: {
    content: {
      control: {
        type: 'text',
      },
      defaultValue: 'Title',
    },
  },
};

interface ArgTypes {
  content: string;
}

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<ArgTypes, Context> = (
  { content = 'Title' }: ArgTypes,
  { globals: { direction } }: Context
) => {
  return html`
    <div>
      <igc-navbar dir=${ifDefined(direction)}>
        <button slot="start">IG</button>
        <h1>${content}</h1>
        <button slot="end">More</button>
      </igc-navbar>
    </div>
  `;
};

export const Basic = Template.bind({});
