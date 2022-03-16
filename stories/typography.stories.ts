import { html } from 'lit';
import { Story } from './story.js';

export default { title: 'Typogrpahy' };

const Template: Story<{}, {}> = () => html`
  <div class="igc-typography">
    <h1>Heading 1</h1>
  </div>
`;

export const Basic = Template.bind({});
