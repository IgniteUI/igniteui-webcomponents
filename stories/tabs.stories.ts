import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
import { Context, Story } from './story.js';

// region default
const metadata = {
  title: 'Tabs',
  component: 'igc-tabs',
  argTypes: {
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
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  alignment: 'start' | 'end' | 'center' | 'justify';
  activation: 'auto' | 'manual';
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: ['igcChange'],
  },
};

const remove = (e: MouseEvent) => {
  (e.target as HTMLElement).closest('igc-tab')?.remove();
};

const removableTabs = Array.from(
  map(
    range(10),
    (i) =>
      html`<igc-tab>
        <div slot="title">
          Item ${i + 1}
          <igc-icon-button
            @click=${remove}
            size="small"
            slot="suffix"
            collection="internal"
            name="chip_cancel"
          ></igc-icon-button>
        </div>
        <h1>Content for ${i + 1}</h1>
      </igc-tab>`
  )
);

const tabs = Array.from(
  map(
    range(18),
    (i) =>
      html`<igc-tab ?disabled=${i === 2}
        ><div slot="title">Item ${i + 1}</div>
        <p>Content ${i + 1}</p></igc-tab
      >`
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
    <igc-tab>
      <igc-icon name="home" slot="title"></igc-icon>
      Content 1
    </igc-tab>
    <igc-tab>
      <igc-icon name="search" slot="title"></igc-icon>
      Content 2
    </igc-tab>
    <igc-tab disabled>
      <igc-icon name="favorite" slot="title"></igc-icon>
      Content 3
    </igc-tab>
  </igc-tabs>

  <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
    <igc-tab>
      <div slot="title">
        <igc-icon name="home"></igc-icon>
        <input />
        <span
          >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.</span
        >
      </div>
      Content 1
    </igc-tab>
    <igc-tab>
      <div slot="title">
        <igc-icon name="search"></igc-icon>
        <span
          >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.</span
        >
      </div>
      Content 2
    </igc-tab>
    <igc-tab disabled>
      <div slot="title">
        <igc-icon name="favorite"></igc-icon>
        <span
          >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.</span
        >
      </div>
    </igc-tab>
  </igc-tabs>
`;

const TabStrip: Story<ArgTypes, Context> = (
  { activation, alignment }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-tabs
    dir="${ifDefined(direction)}"
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${Array.from(range(1, 11)).map(
      (i) => html` <igc-tab><div slot="title">${i}</div></igc-tab> `
    )}
  </igc-tabs>
`;

const RemovableTabs: Story<ArgTypes, Context> = (
  { activation, alignment }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <igc-tabs
    dir="${ifDefined(direction)}"
    alignment="${ifDefined(alignment)}"
    activation="${ifDefined(activation)}"
  >
    ${removableTabs}
  </igc-tabs>
`;

export const Basic = Template.bind({});
export const Removable = RemovableTabs.bind({});
export const Strip = TabStrip.bind({});
