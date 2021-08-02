import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story';

export default {
  title: 'Navigation Bar',
  component: 'igc-navbar',
};

interface Context {
  globals: { theme: string; direction: 'ltr' | 'rtl' | 'auto' };
}

const Template: Story<{}, Context> = () => {
  return html`
    <igc-navbar>
      <button slot="start">Home</button>
      <h1>This is the title</h1>
      <button slot="end">More</button>
    </igc-navbar>
  `;
};

export const Basic = Template.bind({});
