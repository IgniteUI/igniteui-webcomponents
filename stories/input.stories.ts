import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story, Context } from './story.js';

export default {
  title: 'Input',
  component: 'igc-input',
};

const Template: Story<null, Context> = () => html` <igc-input></igc-input> `;
export const Outlined = Template.bind({});
