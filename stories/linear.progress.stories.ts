import { html } from 'lit';
import IgcLinearProgressComponent from '../src/components/progress/linear.progress.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Linear Progress',
  component: 'igc-linear-bar',
  argTypes: {},
};
export default metadata;

let text = 0;

const interval = setInterval(() => {
  const bar = document.getElementById(
    'igx-linear-bar-1'
  ) as IgcLinearProgressComponent;
  if (bar) {
    text = text + 1;
    bar.text = text.toString();
    console.log(text);
  }
}, 10);

setTimeout(() => {
  clearInterval(interval);
}, 4000);

// endregion

const Template: Story<null, Context> = () => html`
  <igc-linear-bar
    type="error"
    value="100"
    textVisibility
    textAlign="end"
  ></igc-linear-bar>
`;

export const Basic = Template.bind({});
