import { html } from 'lit';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Tabs',
  component: 'igc-tabs',
  argTypes: {
    selected: {
      type: 'string',
      control: 'text',
      defaultValue: '',
    },
    alignment: {
      type: '"start" | "end" | "center" | "justify"',
      options: ['start', 'end', 'center', 'justify'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'start',
    },
    activation: {
      type: '"focus" | "select"',
      options: ['focus', 'select'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'select',
    },
  },
};
export default metadata;
interface ArgTypes {
  selected: string;
  alignment: 'start' | 'end' | 'center' | 'justify';
  activation: 'focus' | 'select';
}
// endregion

const Template: Story<ArgTypes, Context> = ({
  selected = 'first',
  alignment = 'end',
}: ArgTypes) => html`
  <igc-tabs selected=${selected} alignment=${alignment}>
    <igc-tab panel="first">Item 1</igc-tab>
    <igc-tab panel="second">Item 2</igc-tab>
    <igc-tab panel="third" disabled>Item 3</igc-tab>    
    <igc-tab-panel slot="panel" name="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" name="second">Content 2</igc-tab-panel>
    <igc-tab-panel slot="panel" name="third">Content 3</igc-tab-panel>    
  </igc-tabs>
`;

export const Basic = Template.bind({});
