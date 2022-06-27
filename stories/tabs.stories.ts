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
      description: 'Returns the currently selected tab.',
      control: 'text',
    },
    alignment: {
      type: '"start" | "end" | "center" | "justify"',
      description: 'Sets the alignment for the tab headers',
      options: ['start', 'end', 'center', 'justify'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'start',
    },
    activation: {
      type: '"auto" | "manual"',
      description:
        'Determines the tab activation. When set to auto,\nthe tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys\nand the corresponding panel is displayed.\nWhen set to manual, the tab is only focused. The selection happens after pressing Space or Enter.',
      options: ['auto', 'manual'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
    },
  },
};
export default metadata;
interface ArgTypes {
  selected: string;
  alignment: 'start' | 'end' | 'center' | 'justify';
  activation: 'auto' | 'manual';
}
// endregion

const Template: Story<ArgTypes, Context> = (
  { activation, alignment }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-tabs
    dir="${ifDefined(direction)}"
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    <igc-tab panel="first">Item 1</igc-tab>
    <igc-tab panel="second">Item 2</igc-tab>
    <igc-tab panel="third" disabled>Item 3</igc-tab>
    <igc-tab panel="forth">Item 4</igc-tab>
    <igc-tab panel="fifth">Item 5</igc-tab>
    <igc-tab panel="sixth">Item 6</igc-tab>
    <igc-tab panel="seventh">Item 7</igc-tab>
    <igc-tab panel="eighth">Item 8</igc-tab>
    <igc-tab panel="ninth">Item 9</igc-tab>
    <igc-tab panel="10">Item 10</igc-tab>
    <igc-tab panel="11">Item 11</igc-tab>
    <igc-tab panel="12">Item 12</igc-tab>
    <igc-tab panel="13">Item 13</igc-tab>
    <igc-tab panel="14">Item 14</igc-tab>
    <igc-tab panel="15">Item 15</igc-tab>
    <igc-tab panel="16">Item 16</igc-tab>
    <igc-tab panel="17">Item 17</igc-tab>
    <igc-tab panel="18">Item 18</igc-tab>
    <igc-tab-panel slot="panel" id="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" id="second">Content 2</igc-tab-panel>
    <igc-tab-panel slot="panel" id="third">Content 3</igc-tab-panel>
    <igc-tab-panel slot="panel" id="forth">Content 4</igc-tab-panel>
    <igc-tab-panel slot="panel" id="fifth">Content 5</igc-tab-panel>
    <igc-tab-panel slot="panel" id="sixth">Content 6</igc-tab-panel>
    <igc-tab-panel slot="panel" id="seventh">Content 7</igc-tab-panel>
    <igc-tab-panel slot="panel" id="eighth">Content 8</igc-tab-panel>
    <igc-tab-panel slot="panel" id="ninth">Content 9</igc-tab-panel>
    <igc-tab-panel slot="panel" id="10">Content 10</igc-tab-panel>
    <igc-tab-panel slot="panel" id="11">Content 11</igc-tab-panel>
    <igc-tab-panel slot="panel" id="12">Content 12</igc-tab-panel>
    <igc-tab-panel slot="panel" id="13">Content 13</igc-tab-panel>
    <igc-tab-panel slot="panel" id="14">Content 14</igc-tab-panel>
    <igc-tab-panel slot="panel" id="15">Content 15</igc-tab-panel>
    <igc-tab-panel slot="panel" id="16">Content 16</igc-tab-panel>
    <igc-tab-panel slot="panel" id="17">Content 17</igc-tab-panel>
    <igc-tab-panel slot="panel" id="18">Content 18</igc-tab-panel>
  </igc-tabs>

  <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
    </igc-tab>
    <igc-tab-panel slot="panel" id="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" id="second">Content 2</igc-tab-panel>
  </igc-tabs>

  <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="second">
      <igc-icon name="search"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab panel="third" disabled>
      <igc-icon name="favorite"></igc-icon>
      <span
        >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.</span
      >
    </igc-tab>
    <igc-tab-panel slot="panel" id="first">Content 1</igc-tab-panel>
    <igc-tab-panel slot="panel" id="second">Content 2</igc-tab-panel>
  </igc-tabs>
`;

export const Basic = Template.bind({});
