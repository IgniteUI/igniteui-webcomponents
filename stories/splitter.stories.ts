import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { defineComponents } from 'igniteui-webcomponents';
import IgcSplitterComponent from '../src/components/splitter/splitter.js';
import { disableStoryControls } from './story.js';

defineComponents(IgcSplitterComponent);

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
    actions: {
      handles: ['igcResizeStart', 'igcResizing', 'igcResizeEnd'],
    },
  },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      description: 'Orientation of the splitter.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    nonCollapsible: {
      type: 'boolean',
      description: 'Disables pane collapsing.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    nonResizable: {
      type: 'boolean',
      description: 'Disables pane resizing.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    startCollapsed: {
      type: 'boolean',
      description: 'Collapses the start pane.',
      table: { defaultValue: { summary: 'false' } },
    },
    endCollapsed: {
      type: 'boolean',
      description: 'Collapses the end pane.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    startSize: {
      control: { type: 'text' },
      description: 'Size of the start pane (e.g., "200px", "50%", "auto").',
    },
    endSize: {
      control: { type: 'text' },
      description: 'Size of the end pane (e.g., "200px", "50%", "auto").',
    },
    startMinSize: {
      control: { type: 'text' },
      description: 'Minimum size of the start pane.',
    },
    startMaxSize: {
      control: { type: 'text' },
      description: 'Maximum size of the start pane.',
    },
    endMinSize: {
      control: { type: 'text' },
      description: 'Minimum size of the end pane.',
    },
    endMaxSize: {
      control: { type: 'text' },
      description: 'Maximum size of the end pane.',
    },
  },
  args: {
    orientation: 'horizontal',
    nonCollapsible: false,
    nonResizable: false,
    startCollapsed: false,
    endCollapsed: false,
  },
};

export default metadata;

interface IgcSplitterArgs {
  orientation: 'horizontal' | 'vertical';
  nonCollapsible: boolean;
  nonResizable: boolean;
  startCollapsed: boolean;
  endCollapsed: boolean;
  startSize?: string;
  endSize?: string;
  startMinSize?: string;
  startMaxSize?: string;
  endMinSize?: string;
  endMaxSize?: string;
}

type Story = StoryObj<IgcSplitterArgs>;

function changePaneMinMaxSizesPx() {
  const splitter = document.querySelector('igc-splitter');
  if (!splitter) {
    return;
  }
  splitter.startMinSize = '50px';
  splitter.startMaxSize = '200px';
  splitter.endMinSize = '100px';
  splitter.endMaxSize = '300px';
}

function changePaneMinMaxSizesPercent() {
  const splitter = document.querySelector('igc-splitter');
  if (!splitter) {
    return;
  }
  splitter.startMinSize = '10%';
  splitter.startMaxSize = '80%';
  splitter.endMinSize = '20%';
  splitter.endMaxSize = '90%';
  splitter.startSize = '30%';
  splitter.endSize = '70%';
}

export const Default: Story = {
  render: ({
    orientation,
    nonCollapsible,
    nonResizable,
    startCollapsed,
    endCollapsed,
    startSize,
    endSize,
    startMinSize,
    startMaxSize,
    endMinSize,
    endMaxSize,
  }) => html`
    <style>
      .pane-content {
        padding: 12px;
      }

      .splitters {
        height: 400px;
        /*width: 1000px;*/ /* useful for testing % values */
      }
    </style>

    <div class="splitters">
      <igc-splitter
        .orientation=${orientation}
        .nonCollapsible=${nonCollapsible}
        .nonResizable=${nonResizable}
        .startCollapsed=${startCollapsed}
        .endCollapsed=${endCollapsed}
        .startSize=${startSize || 'auto'}
        .endSize=${endSize || 'auto'}
        .startMinSize=${startMinSize}
        .startMaxSize=${startMaxSize}
        .endMinSize=${endMinSize}
        .endMaxSize=${endMaxSize}
      >
        <div slot="start" class="pane-content">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
          scelerisque elementum ante, et tincidunt eros ultrices sit amet.
          Mauris non consectetur nunc. In hac habitasse platea dictumst.
          Pellentesque ornare et tellus sit amet varius. Nulla in augue rhoncus,
          finibus mauris semper, tincidunt sem. Cras vitae semper neque, eget
          tempus massa. Maecenas gravida turpis quis interdum bibendum. Nam quis
          ultricies est. Fusce ante erat, iaculis quis iaculis ut, iaculis sed
          nunc. Cras iaculis condimentum lacus nec tempus. Nam ex massa, mattis
          vitae iaculis in, suscipit ut nibh.
        </div>
        <div slot="end" class="pane-content">
          Maecenas sit amet ipsum non ipsum scelerisque varius. Maecenas
          scelerisque nisl scelerisque nulla ultricies eleifend. Aliquam sit
          amet velit mauris. Duis at nulla vitae risus condimentum semper. Nam
          ornare arcu vitae euismod pharetra. Morbi facilisis tincidunt lorem at
          consequat. Aliquam varius quam non eros suscipit, ac tincidunt sapien
          porttitor. Sed sed lorem quam. Praesent blandit aliquam arcu a
          vestibulum. Mauris porta faucibus ex in vehicula. Pellentesque ut
          risus quis felis molestie facilisis eget et est. Proin interdum urna
          vitae porttitor suscipit. Curabitur lobortis aliquet dolor sit amet
          varius. Proin a semper velit, non molestie libero. Suspendisse
          potenti. Aliquam vestibulum dui id lacus suscipit, eget posuere justo
          venenatis. Vestibulum id velit ac dui posuere pretium.
        </div>
      </igc-splitter>
    </div>
    <igc-button
      style="margin-top: 16px;"
      variant="outlined"
      @click=${changePaneMinMaxSizesPx}
      >Change All Panes Min/Max Sizes (px)</igc-button
    >
    <igc-button
      style="margin-top: 16px;"
      variant="outlined"
      @click=${changePaneMinMaxSizesPercent}
      >Change All Panes Min/Max Sizes (%)</igc-button
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
      <div slot="start">
        <igc-splitter orientation="vertical" class="nested-splitter">
          <div slot="start">Top Left Pane</div>

          <div slot="end">Bottom Left Pane</div>
        </igc-splitter>
      </div>

      <div slot="end">
        <igc-splitter orientation="vertical" class="nested-splitter">
          <div slot="start">Top Right Pane</div>
          <div slot="end">Bottom Right Pane</div>
        </igc-splitter>
      </div>
    </igc-splitter>
  `,
};
