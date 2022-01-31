import { html } from 'lit';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Circular Progress',
  component: 'igc-circular-bar',
  argTypes: {},
};
export default metadata;

// endregion

const Template: Story<null, Context> = () => html`
  <igc-circular-bar indeterminate></igc-circular-bar>
`;

export const Basic = Template.bind({});
