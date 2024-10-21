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
    docs: {
      description: {
        component:
          '`IgcTabsComponent` provides a wizard-like workflow by dividing content into logical tabs.',
      },
    },
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

const removableTabs = Array.from(range(10)).map(
  (i) => html`
    <igc-tab>
      <div slot="label">
        Item ${i + 1}
        <igc-icon-button
          @click=${remove}
          slot="suffix"
          collection="internal"
          name="chip_cancel"
        ></igc-icon-button>
      </div>
      <h2>C${i + 1}</h2>
    </igc-tab>
  `
);

const tabs = Array.from(
  map(range(18), (i) => {
    if (i === 2) {
      return html`<igc-tab
        ><div slot="label">
          Looooooooooooooooooooooooooooooooooooooooooooooong header
        </div>
        <input style="box-sizing: border-box;" />Lorem ipsum dolor sit amet
        consectetur adipisicing elit. Consequuntur accusantium mollitia dolorem
        illo expedita aperiam impedit molestias quas in doloremque?
      </igc-tab>`;
    }
    if (i === 10) {
      return html`<igc-tab
        ><div slot="label">Lorem ipsum dolor sit amet, cons</div>
        <p>Content 4</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolores
          explicabo iste asperiores corrupti veniam assumenda officia, adipisci
          laudantium aliquam dolorum excepturi incidunt culpa, delectus. Cumque
          iure itaque, aperiam dolore non.
        </p></igc-tab
      >`;
    }
    return html`<igc-tab ?disabled=${i === 2}
      ><div slot="label">Item ${i + 1}</div>
      Content ${i + 1}</igc-tab
    >`;
  })
);

const Template = ({ activation, alignment }: IgcTabsArgs) => html`
  <div style="display: flex; flex-direction: column; gap: 24px">
    <igc-tabs alignment="${ifDefined(alignment)}">
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        <div slot="label">Test</div>
        Content 1
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        <div slot="label">Test</div>
        Content 2
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        <div slot="label">Test</div>
        Content 3
      </igc-tab>
    </igc-tabs>

    <igc-tabs alignment="${ifDefined(alignment)}">
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        Content 1
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        Content 2
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        Content 3
      </igc-tab>
    </igc-tabs>

    <igc-tabs
      alignment="${ifDefined(alignment)}"
      activation="${ifDefined(activation)}"
    >
      ${tabs}
    </igc-tabs>

    <igc-tabs alignment="${ifDefined(alignment)}">
      <igc-tab>
        <igc-icon name="home" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        Content 1
        <igc-icon name="home" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        Content 2
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="favorite" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        Content 3
        <igc-icon name="favorite" slot="suffix"></igc-icon>
      </igc-tab>
    </igc-tabs>
    <igc-tabs alignment="${ifDefined(alignment)}">
      <igc-tab>
        <div slot="label">
          <div
            style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;"
          >
            <igc-icon slot="prefix" name="home"></igc-icon>
            <input style="box-sizing: border-box; width: 100%" />
            <strong>Custom layout</strong>
            <small>
              The icon, the text, and the input are not direct children of the
              tab, this is a templated content that has its own styles:
            </small>
            <pre>
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 16px;
            </pre
            >
          </div>
        </div>
        Content 1
      </igc-tab>
      <igc-tab>
        <igc-icon slot="prefix" name="favorite"></igc-icon>
        <div slot="label">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </div>
        <igc-icon slot="suffix" name="favorite"></igc-icon>
        Content 2
      </igc-tab>
      <igc-tab disabled>
        <div slot="label">
          <div
            style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;"
          >
            <igc-icon name="favorite"></igc-icon>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </igc-tab>
    </igc-tabs>
  </div>
`;

export const Strip: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${Array.from(range(1, 11)).map(
        (i) => html` <igc-tab label=${i}></igc-tab> `
      )}
    </igc-tabs>
  `,
};

export const Removable: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${removableTabs}
    </igc-tabs>
  `,
};

export const Basic: Story = Template.bind({});
