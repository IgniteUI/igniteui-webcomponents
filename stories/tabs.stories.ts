import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { range } from 'lit/directives/range.js';
import { map } from 'lit/directives/map.js';
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

const tabs = Array.from(
  map(
    range(18),
    (i) =>
      html`<igc-tab panel=${i} ?disabled=${i === 2}> Item ${i + 1}</igc-tab>
        <igc-tab-panel id=${i}> Content ${i + 1} </igc-tab-panel>`
  )
);

const Template: Story<ArgTypes, Context> = (
  { activation, alignment }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-tabs
    dir="${ifDefined(direction)}"
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${tabs}
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
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
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
    <igc-tab-panel id="first">Content 1</igc-tab-panel>
    <igc-tab-panel id="second">Content 2</igc-tab-panel>
  </igc-tabs>
`;

export const Basic = Template.bind({});
