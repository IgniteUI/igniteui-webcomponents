import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';

import {
  IgcTabsComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';

defineComponents(IgcTabsComponent);

// region default
const metadata: Meta<IgcTabsComponent> = {
  title: 'Tabs',
  component: 'igc-tabs',
  parameters: {
    docs: { description: { component: 'Represents tabs component' } },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    alignment: {
      type: '"start" | "end" | "center" | "justify"',
      description: 'Sets the alignment for the tab headers',
      options: ['start', 'end', 'center', 'justify'],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'start' } },
    },
    activation: {
      type: '"auto" | "manual"',
      description:
        'Determines the tab activation. When set to auto,\nthe tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys\nand the corresponding panel is displayed.\nWhen set to manual, the tab is only focused. The selection happens after pressing Space or Enter.',
      options: ['auto', 'manual'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'auto' } },
    },
  },
  args: { alignment: 'start', activation: 'auto' },
};

export default metadata;

interface IgcTabsArgs {
  /** Sets the alignment for the tab headers */
  alignment: 'start' | 'end' | 'center' | 'justify';
  /**
   * Determines the tab activation. When set to auto,
   * the tab is instantly selected while navigating with the Left/Right Arrows, Home or End keys
   * and the corresponding panel is displayed.
   * When set to manual, the tab is only focused. The selection happens after pressing Space or Enter.
   */
  activation: 'auto' | 'manual';
}
type Story = StoryObj<IgcTabsArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

registerIcon(
  'search',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg'
);

registerIcon(
  'favorite',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg'
);

const remove = (e: MouseEvent) => {
  (e.target as HTMLElement).closest('igc-tab')?.remove();
};

const removableTabs = Array.from(
  map(
    range(10),
    (i) =>
      html`<igc-tab panel=${i}>
          Item ${i + 1}
          <igc-icon-button
            @click=${remove}
            slot="suffix"
            collection="internal"
            name="chip_cancel"
          ></igc-icon-button>
        </igc-tab>
        <igc-tab-panel id=${i}><h1>Content for ${i + 1}</h1></igc-tab-panel>`
  )
);

const tabs = Array.from(
  map(
    range(18),
    (i) =>
      html`<igc-tab panel=${i} ?disabled=${i === 2}> Item ${i + 1} </igc-tab>
        <igc-tab-panel id=${i}> Content ${i + 1}</igc-tab-panel>`
  )
);

const Template = ({ activation, alignment }: IgcTabsArgs) => html`
  <igc-tabs
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${tabs}
  </igc-tabs>

  <igc-tabs alignment="${ifDefined(alignment)}">
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

  <igc-tabs alignment="${ifDefined(alignment)}">
    <igc-tab panel="first">
      <igc-icon name="home"></igc-icon>
      <input />
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

const TabStrip = ({ activation, alignment }: IgcTabsArgs) => html`
  <igc-tabs
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${Array.from(range(1, 11)).map((i) => html` <igc-tab>${i}</igc-tab> `)}
  </igc-tabs>
`;

const RemovableTabs = ({ activation, alignment }: IgcTabsArgs) => html`
  <igc-tabs
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${removableTabs}
  </igc-tabs>
`;

export const Basic: Story = Template.bind({});
export const Removable: Story = RemovableTabs.bind({});
export const Strip: Story = TabStrip.bind({});
