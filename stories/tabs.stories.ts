import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcTabComponent,
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
          '`IgcTabsComponent` provides a wizard-like workflow by dividing content into logical tabs.\n\nThe tabs component allows the user to navigate between multiple tabs.\nIt supports keyboard navigation and provides API methods to control the selected tab.',
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

const icons = [
  {
    name: 'home',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg',
  },
  {
    name: 'search',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_search_24px.svg',
  },
  {
    name: 'favorite',
    url: 'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_favorite_24px.svg',
  },
];
await Promise.all(icons.map(async (each) => registerIcon(each.name, each.url)));

function remove({ target }: PointerEvent) {
  (target as Element).closest(IgcTabComponent.tagName)!.remove();
}

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

const lorem =
  'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ducimus aliquid voluptatibus molestias laboriosam, illo totam eaque amet iusto officiis accusamus in deleniti beatae harum culpa laudantium accusantium natus nisi eligendi.';

const manyTabs = Array.from(range(30)).map((idx) => {
  switch (idx) {
    case 2:
      return html`
        <igc-tab>
          <div slot="label">
            I am a very long tab header that will try to take as much space as
            possible.
          </div>
          <h2>Content 3</h2>
          <div>${lorem.repeat(5)}</div>
        </igc-tab>
      `;
    case 10:
      return html`
        <igc-tab>
          <div slot="label">Another long tab header</div>
          <h2>Content 11</h2>
          ${lorem.repeat(5)}
        </igc-tab>
      `;
    default:
      return html`
        <igc-tab ?disabled=${idx === 3}>
          <div slot="label">Item ${idx + 1}</div>
          <h2>Content ${idx + 1}</h2>
          ${lorem.repeat(3)}
        </igc-tab>
      `;
  }
});

export const Basic: Story = {
  render: (args) => html`
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${Array.from(range(3)).map(
        (idx) => html`
          <igc-tab>
            <div slot="label">Tab ${idx + 1}</div>
            <h2>Content for tab ${idx + 1}</h2>
            <p>${lorem.repeat(2)}</p>
            <igc-button>Read more</igc-button>
          </igc-tab>
        `
      )}
    </igc-tabs>
  `,
};

export const Variants: Story = {
  render: (args) => html`
    <h2>Tab headers with icon only</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        <h3>Content 1</h3>
        ${lorem.repeat(8)}
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        <h3>Content 2</h3>
        ${lorem.repeat(4)}
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        <h3>Content 3</h3>
        ${lorem.repeat(6)}
      </igc-tab>
    </igc-tabs>

    <h2>Tab headers with icon and text</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 1</h3>
        ${lorem.repeat(4)}
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 2</h3>
        ${lorem.repeat(6)}
      </igc-tab>
      <igc-tab disabled>
        <igc-icon name="favorite" slot="label"></igc-icon>
        <div slot="label">Test</div>
        <h3>Content 3</h3>
        ${lorem.repeat(8)}
      </igc-tab>
    </igc-tabs>

    <h2>Tab headers with icons into prefix and suffix slots and text</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab>
        <igc-icon name="home" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 1</h3>
        ${lorem.repeat(5)}
        <igc-icon name="home" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="search" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 2</h3>
        ${lorem.repeat(3)}
        <igc-icon name="search" slot="suffix"></igc-icon>
      </igc-tab>
      <igc-tab>
        <igc-icon name="favorite" slot="prefix"></igc-icon>
        <span slot="label">Label with suffix/prefix</span>
        <h3>Content 3</h3>
        ${lorem.repeat(6)}
        <igc-icon name="favorite" slot="suffix"></igc-icon>
      </igc-tab>
    </igc-tabs>

    <h2>Having too many tabs will show up the scroll buttons</h2>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      ${manyTabs}
    </igc-tabs>
  `,
};

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

export const NestedTabs: Story = {
  render: (args) => html`
    <style>
      .nested {
        padding-inline-start: 1rem;
        padding-block-start: 1rem;
      }
    </style>
    <igc-tabs .alignment=${args.alignment} .activation=${args.activation}>
      <igc-tab label="1">
        Panel 1
        <igc-tabs
          class="nested"
          .alignment=${args.alignment}
          .activation=${args.activation}
        >
          <igc-tab label="1.1">Panel 1.1</igc-tab>
          <igc-tab label="1.2" selected>
            Panel 1.2
            <igc-tabs
              class="nested"
              .alignment=${args.alignment}
              .activation=${args.activation}
            >
              <igc-tab label="1.2.1">Panel 1.2.1</igc-tab>
              <igc-tab label="1.2.2">Panel 1.2.2</igc-tab>
            </igc-tabs>
          </igc-tab>
        </igc-tabs>
      </igc-tab>
      <igc-tab label="2">Panel 2</igc-tab>
    </igc-tabs>
  `,
};
