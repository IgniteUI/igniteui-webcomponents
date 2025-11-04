import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { defineComponents } from 'igniteui-webcomponents';
import IgcSplitterComponent from '../src/components/splitter/splitter.js';
import IgcSplitterPaneComponent from '../src/components/splitter/splitter-pane.js';

defineComponents(IgcSplitterComponent, IgcSplitterPaneComponent);

const metadata: Meta<IgcSplitterComponent> = {
  title: 'Splitter',
  component: 'igc-splitter',
  parameters: {
    docs: {
      description: {
        component:
          'The Splitter lays out panes with draggable bars rendered between each pair of panes.',
      },
    },
  },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      description: 'Orientation of the splitter.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
  },
  args: {
    orientation: 'horizontal',
  },
};

export default metadata;
type Story = StoryObj;

function changePaneMinMaxSizes() {
  const panes = document.querySelectorAll('igc-splitter-pane');
  panes[0].minSize = '100px';
  panes[0].maxSize = '300px';
  panes[1].minSize = '50px';
  panes[1].maxSize = '200px';
  panes[2].minSize = '150px';
  panes[2].maxSize = '400px';
}

function changePaneSize() {
  const panes = document.querySelectorAll('igc-splitter-pane');
  panes[1].size = '100px';
}

export const Default: Story = {
  render: ({ orientation }) => html`
    <style>
      .pane-content {
        padding: 12px;
      }

      .splitters {
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
    </style>
    <button @click=${changePaneMinMaxSizes}>Change Pane Min/Max Sizes</button>
    <button @click=${changePaneSize}>Change Pane Size</button>
    <button
      @click=${() => {
        const panes = document.querySelectorAll('igc-splitter-pane');
        panes[0].toggle();
      }}
    >
      Toggle Collapse First Pane
    </button>

    <div class="splitters">
      <igc-splitter .orientation=${orientation} style="height: 40vh">
        <igc-splitter-pane>
          <div class="pane-content">Pane 1</div>
        </igc-splitter-pane>
        <igc-splitter-pane>
          <div class="pane-content">Pane 2</div>
        </igc-splitter-pane>
        <igc-splitter-pane>
          <div class="pane-content">Pane 3</div>
        </igc-splitter-pane>
      </igc-splitter>

      <igc-splitter orientation="vertical">
        <igc-splitter-pane size="200px">
          <div class="pane-content">Pane 1</div>
        </igc-splitter-pane>
        <igc-splitter-pane collapsed>
          <div class="pane-content">Pane 2</div>
        </igc-splitter-pane>
        <igc-splitter-pane size="30%">
          <div class="pane-content">Pane 3</div>
        </igc-splitter-pane>
      </igc-splitter>
    </div>
  `,
};
