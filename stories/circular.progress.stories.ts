import { html } from 'lit';
import IgcCircularProgressComponent from '../src/components/progress/circular.progress.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Circular Progress',
  component: 'igc-circular-bar',
  argTypes: {},
};
export default metadata;

let text = 0;

const interval = setInterval(() => {
  const bar = document.getElementById(
    'igx-circular-bar-1'
  ) as IgcCircularProgressComponent;
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
  <igc-circular-bar panimate textVisibility value="90"></igc-circular-bar>
`;

export const Basic = Template.bind({});
