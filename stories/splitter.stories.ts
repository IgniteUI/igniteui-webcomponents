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

function changePaneMinMaxSizes() {
  const splitter = document.querySelector('igc-splitter');
  if (!splitter) {
    return;
  }
  splitter.startMinSize = '50px';
  splitter.startMaxSize = '200px';
  splitter.endMinSize = '100px';
  splitter.endMaxSize = '300px';
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
        <div slot="start" class="pane-content">Pane 1</div>
        <div slot="end" class="pane-content">Pane 2</div>
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
