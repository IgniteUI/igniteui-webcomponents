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
  },
};
export default metadata;
interface ArgTypes {
  alignment: 'start' | 'end' | 'center' | 'justify';
  activation: 'auto' | 'manual';
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
        <div slot="label">
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
  map(range(18), (i) => {
    if (i === 9) {
      return html`<igc-tab
        ><div slot="label">
          Lorem ipsum dolor sit amet, consec tetur adipi scing elitt dolorem
          illo expedita aperiam impedit molestias
        </div>
        <input />Lorem ipsum dolor sit amet consectetur adipisicing elit.
        Consequuntur accusantium mollitia dolorem illo expedita aperiam impedit
        molestias quas in doloremque?
      </igc-tab>`;
    } else if (i === 10) {
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
    } else {
      return html`<igc-tab ?disabled=${i === 2}
        ><div slot="label">Item ${i + 1}</div>
        Content ${i + 1}</igc-tab
      >`;
    }
  })
);

const Template: Story<ArgTypes, Context> = (
  { activation, alignment }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div style="display: flex; flex-direction: column; gap: 24px">
    <igc-tabs
      dir="${ifDefined(direction)}"
      alignment="${ifDefined(alignment)}"
      activation="${ifDefined(activation)}"
    >
      ${tabs}
    </igc-tabs>

    <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
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

    <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
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

    <igc-tabs dir="${ifDefined(direction)}" alignment="${ifDefined(alignment)}">
      <igc-tab>
        <div slot="label">
          <div
            style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;"
          >
            <igc-icon name="home"></igc-icon>
            <input />
            <strong>Custom layout</strong>
            <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </span>
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
      (i) => html` <igc-tab><div slot="label">${i}</div></igc-tab> `
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
