import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Context, Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';

const metadata = {
  title: 'Years View',
  component: 'igc-years-view',
};
export default metadata;

const Template: Story<null, Context> = (
  _args: null,
  { globals: { direction } }: Context
) => {
  return html` <igc-years-view dir=${ifDefined(direction)}> </igc-years-view> `;
};

export const Basic = Template.bind({});
