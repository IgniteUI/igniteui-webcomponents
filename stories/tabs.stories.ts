import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
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

const Template: Story<ArgTypes, Context> = (
  { alignment, selected }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-tabs
    dir="${ifDefined(direction)}"
    selected=${selected}
    alignment="${ifDefined(alignment)}"
  >
    <igc-tab panel="first"> Item 1 </igc-tab>
    <igc-tab panel="second">Item 2</igc-tab>
    <igc-tab panel="third" disabled>Item 3</igc-tab>
    <igc-tab panel="forth">Item 4</igc-tab>
    <igc-tab panel="fifth">Item 5</igc-tab>
    <igc-tab panel="sixth">Item 6</igc-tab>
    <igc-tab panel="seventh">Item 7</igc-tab>
    <igc-tab panel="eighth">Item 8</igc-tab>
    <igc-tab panel="ninth">Item 9</igc-tab>
    <igc-tab-panel slot="panel" name="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" name="second">Content 2</igc-tab-panel>
    <igc-tab-panel slot="panel" name="third">Content 3</igc-tab-panel>
    <igc-tab-panel slot="panel" name="forth">Content 4</igc-tab-panel>
    <igc-tab-panel slot="panel" name="fifth">Content 5</igc-tab-panel>
    <igc-tab-panel slot="panel" name="sixth">Content 6</igc-tab-panel>
    <igc-tab-panel slot="panel" name="seventh">Content 7</igc-tab-panel>
    <igc-tab-panel slot="panel" name="eighth">Content 8</igc-tab-panel>
    <igc-tab-panel slot="panel" name="ninth">Content 9</igc-tab-panel>
  </igc-tabs>

  <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
    <igc-tab panel="first" selected>
      <igc-icon name="home"></igc-icon>
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
    </igc-tab>
    <igc-tab-panel slot="panel" name="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" name="second">Content 2</igc-tab-panel>
  </igc-tabs>

  <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
    <igc-tab panel="first" selected>
      <igc-icon name="home"></igc-icon>
      Item 1
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
      Item 2
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
      Item 3
    </igc-tab>
    <igc-tab-panel slot="panel" name="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" name="second">Content 2</igc-tab-panel>
  </igc-tabs>
`;

export const Basic = Template.bind({});
