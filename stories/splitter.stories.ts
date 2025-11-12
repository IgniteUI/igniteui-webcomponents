import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { defineComponents } from 'igniteui-webcomponents';
import IgcSplitterComponent from '../src/components/splitter/splitter.js';
import IgcSplitterPaneComponent from '../src/components/splitter/splitter-pane.js';
import { disableStoryControls } from './story.js';

defineComponents(IgcSplitterComponent, IgcSplitterPaneComponent);

type SplitterStoryArgs = IgcSplitterComponent & {
  /* Pane 1 properties */
  pane1Size?: string;
  pane1MinSize?: string;
  pane1MaxSize?: string;
  pane1Collapsed?: boolean;
  pane1Resizable?: boolean;

  /* Pane 2 properties */
  pane2Size?: string;
  pane2MinSize?: string;
  pane2MaxSize?: string;
  pane2Collapsed?: boolean;
  pane2Resizable?: boolean;

  /* Pane 3 properties */
  pane3Size?: string;
  pane3MinSize?: string;
  pane3MaxSize?: string;
  pane3Collapsed?: boolean;
  pane3Resizable?: boolean;
};

const metadata: Meta<SplitterStoryArgs> = {
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
    pane1Size: {
      control: 'text',
      description: 'Size of the first pane (e.g., "auto", "100px", "30%")',
      table: { category: 'Pane 1' },
    },
    pane1MinSize: {
      control: 'text',
      description: 'Minimum size of the first pane',
      table: { category: 'Pane 1' },
    },
    pane1MaxSize: {
      control: 'text',
      description: 'Maximum size of the first pane',
      table: { category: 'Pane 1' },
    },
    pane1Collapsed: {
      control: 'boolean',
      description: 'Collapsed state of the first pane',
      table: { category: 'Pane 1' },
    },
    pane1Resizable: {
      control: 'boolean',
      description: 'Whether the first pane is resizable',
      table: { category: 'Pane 1' },
    },
    pane2Size: {
      control: 'text',
      description: 'Size of the second pane (e.g., "auto", "100px", "30%")',
      table: { category: 'Pane 2' },
    },
    pane2MinSize: {
      control: 'text',
      description: 'Minimum size of the second pane',
      table: { category: 'Pane 2' },
    },
    pane2MaxSize: {
      control: 'text',
      description: 'Maximum size of the second pane',
      table: { category: 'Pane 2' },
    },
    pane2Collapsed: {
      control: 'boolean',
      description: 'Collapsed state of the second pane',
      table: { category: 'Pane 2' },
    },
    pane2Resizable: {
      control: 'boolean',
      description: 'Whether the second pane is resizable',
      table: { category: 'Pane 2' },
    },
    pane3Size: {
      control: 'text',
      description: 'Size of the third pane (e.g., "auto", "100px", "30%")',
      table: { category: 'Pane 3' },
    },
    pane3MinSize: {
      control: 'text',
      description: 'Minimum size of the third pane',
      table: { category: 'Pane 3' },
    },
    pane3MaxSize: {
      control: 'text',
      description: 'Maximum size of the third pane',
      table: { category: 'Pane 3' },
    },
    pane3Collapsed: {
      control: 'boolean',
      description: 'Collapsed state of the third pane',
      table: { category: 'Pane 3' },
    },
    pane3Resizable: {
      control: 'boolean',
      description: 'Whether the third pane is resizable',
      table: { category: 'Pane 3' },
    },
  },
  args: {
    orientation: 'horizontal',
    nonCollapsible: false,
    pane1Size: 'auto',
    pane1Resizable: true,
    pane1Collapsed: false,
    pane2Size: 'auto',
    pane2Resizable: true,
    pane2Collapsed: false,
    pane3Size: 'auto',
    pane3Resizable: true,
    pane3Collapsed: false,
  },
};

export default metadata;
type Story = StoryObj<SplitterStoryArgs>;

function changePaneMinMaxSizes() {
  const splitter = document.querySelector('igc-splitter');
  const panes = splitter?.panes;
  if (!panes) {
    return;
  }
  panes[0].minSize = '50px';
  panes[0].maxSize = '200px';
  panes[1].minSize = '100px';
  panes[1].maxSize = '300px';
  panes[2].minSize = '150px';
  panes[2].maxSize = '450px';
}

export const Default: Story = {
  render: ({
    orientation,
    nonCollapsible,
    pane1Size,
    pane1MinSize,
    pane1MaxSize,
    pane1Collapsed,
    pane1Resizable,
    pane2Size,
    pane2MinSize,
    pane2MaxSize,
    pane2Collapsed,
    pane2Resizable,
    pane3Size,
    pane3MinSize,
    pane3MaxSize,
    pane3Collapsed,
    pane3Resizable,
  }) => html`
    <style>
      .pane-content {
        padding: 12px;
      }

      .splitters {
        height: 400px;
      }
    </style>

    <div class="splitters">
      <igc-splitter
        .orientation=${orientation}
        .nonCollapsible=${nonCollapsible}
      >
        <igc-splitter-pane
          .size=${pane1Size || 'auto'}
          .minSize=${pane1MinSize}
          .maxSize=${pane1MaxSize}
          ?collapsed=${pane1Collapsed}
          ?resizable=${pane1Resizable}
        >
          <div class="pane-content">Pane 1</div>
        </igc-splitter-pane>
        <igc-splitter-pane
          .size=${pane2Size || 'auto'}
          .minSize=${pane2MinSize}
          .maxSize=${pane2MaxSize}
          ?collapsed=${pane2Collapsed}
          ?resizable=${pane2Resizable}
        >
          <div class="pane-content">Pane 2</div>
        </igc-splitter-pane>
        <igc-splitter-pane
          .size=${pane3Size || 'auto'}
          .minSize=${pane3MinSize}
          .maxSize=${pane3MaxSize}
          ?collapsed=${pane3Collapsed}
          ?resizable=${pane3Resizable}
        >
          <div class="pane-content">Pane 3</div>
        </igc-splitter-pane>
      </igc-splitter>
    </div>
    <igc-button
      style="margin-top: 16px;"
      variant="outlined"
      @click=${changePaneMinMaxSizes}
      >Change All Panes Min/Max Sizes</igc-button
    >
  `,
};

export const NestedSplitters: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      .pane-content {
        padding: 12px;
      }
    </style>

    <igc-splitter orientation="horizontal" style="height: 600px;">
      <igc-splitter-pane>
        <igc-splitter orientation="vertical" class="nested-splitter">
          <igc-splitter-pane>
            <div class="pane-content">Top Left Pane</div>
          </igc-splitter-pane>

          <igc-splitter-pane>
            <div class="pane-content">Bottom Left Pane</div>
          </igc-splitter-pane>
        </igc-splitter>
      </igc-splitter-pane>

      <igc-splitter-pane>
        <igc-splitter orientation="vertical" class="nested-splitter">
          <igc-splitter-pane>
            <div class="pane-content">Top Right Pane</div>
          </igc-splitter-pane>

          <igc-splitter-pane>
            <div class="pane-content">Bottom Right Pane</div>
          </igc-splitter-pane>
        </igc-splitter>
      </igc-splitter-pane>
    </igc-splitter>
  `,
};
