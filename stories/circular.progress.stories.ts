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

const toggleIndeterminate = () => {
  const bar = document.querySelector(
    'igc-circular-bar'
  ) as IgcCircularProgressComponent;
  bar.indeterminate = !bar.indeterminate;
  if (!bar.indeterminate) {
    bar.textVisibility = true;
    Promise.resolve().then(() => {
      bar.value = 60;
    });
  }
};

const interval = setInterval(() => {
  const bar = document.querySelector(
    'igc-circular-bar'
  ) as IgcCircularProgressComponent;
  if (bar) {
    text = text + 1;
    bar.text = Math.round(bar.value).toString() + '%';
    console.log(text);
  }
}, 1);

setTimeout(() => {
  clearInterval(interval);
}, 4000);

// endregion

const Template: Story<null, Context> = () => html`
  <igc-circular-bar
    textVisibility
    max="120"
    value="110"
    animated
  ></igc-circular-bar>
  <igc-button @click=${toggleIndeterminate}>Toggle Indeterminate</igc-button>
`;

export const Basic = Template.bind({});
