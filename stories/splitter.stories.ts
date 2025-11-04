import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import {
  IgcSplitterPaneComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import IgcSplitterComponent from '../src/components/splitter/splitter.js';

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

export const Default: Story = {
  render: ({ orientation }) => html`
    <style>
      .pane-content {
        padding: 12px;
      }
    </style>
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
  `,
};
