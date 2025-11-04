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
  render: () => html`
    <igc-splitter>
      <igc-splitter-pane>Pane 1</igc-splitter-pane>
      <igc-splitter-pane>Pane 2</igc-splitter-pane>
      <igc-splitter-pane>Pane 3</igc-splitter-pane>
    </igc-splitter>
  `,
};
