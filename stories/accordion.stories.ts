import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcAccordionComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
  registerIconFromText,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAccordionComponent,
  IgcButtonComponent,
  IgcIconComponent,
  IgcInputComponent
);

registerIconFromText(
  'chevron-down',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`
);

registerIconFromText(
  'chevron-up',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`
);

// region default
const metadata: Meta<IgcAccordionComponent> = {
  title: 'Accordion',
  component: 'igc-accordion',
  parameters: {
    docs: {
      description: {
        component:
          'The Accordion is a container-based component that can house multiple expansion panels\nand offers keyboard navigation.',
      },
    },
  },
  argTypes: {
    singleExpand: {
      type: 'boolean',
      description: 'Allows only one panel to be expanded at a time.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: { singleExpand: false },
};

export default metadata;

interface IgcAccordionArgs {
  /** Allows only one panel to be expanded at a time. */
  singleExpand: boolean;
}
type Story = StoryObj<IgcAccordionArgs>;

// endregion

const loremShort =
  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi adipisci, ratione ut praesentium qui similique molestiae voluptate at excepturi.';

const loremLong =
  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum quia placeat natus illo voluptatum, praesentium similique excepturi corporis sequi at earum labore provident asperiores dolorem fugit explicabo ipsa distinctio doloremque?';

export const Default: Story = {
  render: (args) => html`
    <igc-accordion ?single-expand=${args.singleExpand}>
      ${Array.from(range(1, 4)).map(
        (i) =>
          html`<igc-expansion-panel>
            <span slot="title">Panel ${i}</span>
            <span slot="subtitle">Subtitle ${i}</span>
            <p>${loremShort}</p>
          </igc-expansion-panel>`
      )}
    </igc-accordion>
  `,
};

export const SingleExpand: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Only one panel can be open at a time. Opening another panel closes the
      current one.
    </p>
    <igc-accordion single-expand>
      <igc-expansion-panel open>
        <span slot="title">Getting Started</span>
        <span slot="subtitle">Installation and setup</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Configuration</span>
        <span slot="subtitle">Customize your instance</span>
        <p>${loremLong}</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Advanced Usage</span>
        <span slot="subtitle">Tips and tricks</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">FAQ</span>
        <span slot="subtitle">Frequently asked questions</span>
        <p>${loremLong}</p>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

export const DisabledPanels: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Disabled panels are skipped during keyboard navigation and cannot be
      toggled.
    </p>
    <igc-accordion>
      <igc-expansion-panel open>
        <span slot="title">Active Panel</span>
        <span slot="subtitle">This panel is interactive</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel disabled>
        <span slot="title">Disabled Panel</span>
        <span slot="subtitle">This panel cannot be toggled</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Another Active Panel</span>
        <span slot="subtitle">This panel is interactive</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel disabled open>
        <span slot="title">Disabled &amp; Open Panel</span>
        <span slot="subtitle">Visible but cannot be closed by the user</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

export const IndicatorPosition: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <h4 style="margin-bottom: .5rem">Indicator at start (default)</h4>
    <igc-accordion>
      <igc-expansion-panel indicator-position="start">
        <span slot="title">Start Position</span>
        <span slot="subtitle"
          >The expand indicator is placed before the title</span
        >
        <p>${loremShort}</p>
      </igc-expansion-panel>
    </igc-accordion>

    <h4 style="margin: 1rem 0 .5rem">Indicator at end</h4>
    <igc-accordion>
      <igc-expansion-panel indicator-position="end">
        <span slot="title">End Position</span>
        <span slot="subtitle"
          >The expand indicator is placed after the title</span
        >
        <p>${loremShort}</p>
      </igc-expansion-panel>
    </igc-accordion>

    <h4 style="margin: 1rem 0 .5rem">Indicator hidden (none)</h4>
    <igc-accordion>
      <igc-expansion-panel indicator-position="none">
        <span slot="title">No Indicator</span>
        <span slot="subtitle">The expand/collapse indicator is hidden</span>
        <p>${loremShort}</p>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

export const CustomIndicator: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <p>
      Use the <code>indicator</code> and <code>indicator-expanded</code> slots
      for custom icons.
    </p>
    <igc-accordion>
      <igc-expansion-panel>
        <span slot="title">Custom chevron icons</span>
        <span slot="subtitle"
          >Using the indicator and indicator-expanded slots</span
        >
        <igc-icon
          slot="indicator"
          name="chevron-down"
          collection="default"
        ></igc-icon>
        <igc-icon
          slot="indicator-expanded"
          name="chevron-up"
          collection="default"
        ></igc-icon>
        <p>${loremShort}</p>
      </igc-expansion-panel>
      <igc-expansion-panel>
        <span slot="title">Custom emoji indicators</span>
        <span slot="subtitle">Any content can be used as an indicator</span>
        <span slot="indicator" style="font-size: 1.2rem">➕</span>
        <span slot="indicator-expanded" style="font-size: 1.2rem">➖</span>
        <p>${loremLong}</p>
      </igc-expansion-panel>
      <igc-expansion-panel indicator-position="end">
        <span slot="title">Indicator at end with custom icon</span>
        <span slot="subtitle"
          >Combining indicator-position="end" with a custom slot</span
        >
        <igc-icon
          slot="indicator"
          name="chevron-down"
          collection="default"
        ></igc-icon>
        <igc-icon
          slot="indicator-expanded"
          name="chevron-up"
          collection="default"
        ></igc-icon>
        <p>${loremShort}</p>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};

export const ProgrammaticControl: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    const showAll = () => {
      document
        .querySelector<IgcAccordionComponent>('#ctrl-accordion')
        ?.showAll();
    };

    const hideAll = () => {
      document
        .querySelector<IgcAccordionComponent>('#ctrl-accordion')
        ?.hideAll();
    };

    return html`
      <div style="display: flex; gap: .5rem; margin-bottom: 1rem">
        <igc-button @click=${showAll}>Expand All</igc-button>
        <igc-button @click=${hideAll}>Collapse All</igc-button>
      </div>
      <igc-accordion id="ctrl-accordion">
        ${Array.from(range(1, 5)).map(
          (i) =>
            html`<igc-expansion-panel>
              <span slot="title">Section ${i}</span>
              <span slot="subtitle">Programmatically controlled</span>
              <p>${loremShort}</p>
            </igc-expansion-panel>`
        )}
      </igc-accordion>
    `;
  },
};

export const NestedAccordions: Story = {
  render: (args) => html`
    <igc-accordion ?single-expand=${args.singleExpand}>
      ${Array.from(range(1, 3)).map(
        (i) =>
          html`<igc-expansion-panel>
            <span slot="title">Top-level Panel ${i}</span>
            <span slot="subtitle">Click to expand</span>
            <p>${loremShort}</p>
          </igc-expansion-panel>`
      )}
      <igc-expansion-panel>
        <span slot="title">Panel with nested accordion</span>
        <span slot="subtitle">Contains its own independent accordion</span>
        <igc-accordion>
          <igc-expansion-panel>
            <span slot="title">Nested Panel 1</span>
            <span slot="subtitle">Inner accordion item</span>
            <p>${loremShort}</p>
          </igc-expansion-panel>
          <igc-expansion-panel>
            <span slot="title">Nested Panel 2</span>
            <span slot="subtitle">Inner accordion item with input</span>
            <igc-input
              placeholder="Your feedback"
              style="margin-bottom: .5rem"
            ></igc-input>
            <p>${loremLong}</p>
          </igc-expansion-panel>
        </igc-accordion>
      </igc-expansion-panel>
    </igc-accordion>
  `,
};
