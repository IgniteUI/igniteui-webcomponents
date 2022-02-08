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

const toggleIndeterminate = () => {
  const bar = document.querySelector(
    'igc-linear-bar'
  ) as IgcLinearProgressComponent;
  bar.indeterminate = !bar.indeterminate;
  if (!bar.indeterminate) {
    bar.textVisibility = true;
    Promise.resolve().then(() => {
      bar.value = 60;
    });
  }
};

let text = 0;

const interval = setInterval(() => {
  const bar = document.getElementById(
    'igx-linear-bar-1'
  ) as IgcLinearProgressComponent;
  if (bar) {
    text = text + 1;
    bar.text = Math.round(bar.value).toString() + '%';
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
    max="120"
    value="110"
    textVisibility
    textAlign="end"
  ></igc-linear-bar>
  <igc-button @click=${toggleIndeterminate}>Toggle Indeterminate</igc-button>
`;

export const Basic = Template.bind({});
