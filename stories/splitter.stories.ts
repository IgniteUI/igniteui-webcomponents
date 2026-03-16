import {
  IgcButtonComponent,
  IgcSplitterComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { disableStoryControls } from './story.js';
import { html } from 'lit';

defineComponents(IgcSplitterComponent, IgcButtonComponent);

const metadata: Meta<IgcSplitterComponent> = {
  title: 'Splitter',
  component: 'igc-splitter',
  parameters: {
    docs: {
      description: {
        component:
          'The `igc-splitter` divides the view into two resizable and collapsible panels separated by a draggable bar. ' +
          'Use the `start` and `end` slots to project content into each panel. ' +
          'Panels can be resized by dragging, using keyboard shortcuts, or collapsed programmatically via `toggle()`.',
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
      description:
        'The axis along which the panels are split. `horizontal` places start/end side‑by‑side; `vertical` stacks them.',
      table: { defaultValue: { summary: 'horizontal' } },
    },
    disableCollapse: {
      type: 'boolean',
      description:
        'When `true`, the collapse/expand buttons are hidden and panes cannot be collapsed.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideCollapseButtons: {
      type: 'boolean',
      description:
        'When `true`, hides the collapse/expand buttons without disabling the collapse behavior.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideDragHandle: {
      type: 'boolean',
      description:
        'When `true`, hides the drag handle icon on the splitter bar.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableResize: {
      type: 'boolean',
      description:
        'When `true`, prevents resizing by dragging or keyboard shortcuts.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    startSize: {
      control: { type: 'text' },
      description:
        'Initial size of the start panel. Accepts CSS length values (`200px`, `50%`) or `auto`.',
    },
    endSize: {
      control: { type: 'text' },
      description:
        'Initial size of the end panel. Accepts CSS length values (`200px`, `50%`) or `auto`.',
    },
    startMinSize: {
      control: { type: 'text' },
      description: 'Minimum size of the start panel (`100px`, `20%`).',
    },
    startMaxSize: {
      control: { type: 'text' },
      description: 'Maximum size of the start panel (`500px`, `80%`).',
    },
    endMinSize: {
      control: { type: 'text' },
      description: 'Minimum size of the end panel (`100px`, `20%`).',
    },
    endMaxSize: {
      control: { type: 'text' },
      description: 'Maximum size of the end panel (`500px`, `80%`).',
    },
  },
  args: {
    orientation: 'horizontal',
    disableCollapse: false,
    hideCollapseButtons: false,
    hideDragHandle: false,
    disableResize: false,
  },
};

export default metadata;

interface IgcSplitterArgs {
  orientation: 'horizontal' | 'vertical';
  disableCollapse: boolean;
  hideCollapseButtons: boolean;
  hideDragHandle: boolean;
  disableResize: boolean;
  startSize?: string;
  endSize?: string;
  startMinSize?: string;
  startMaxSize?: string;
  endMinSize?: string;
  endMaxSize?: string;
}

type Story = StoryObj<IgcSplitterArgs>;

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque scelerisque elementum ante, et tincidunt eros ultrices sit amet. Mauris non consectetur nunc. In hac habitasse platea dictumst.';

const LOREM_LONG =
  'Maecenas sit amet ipsum non ipsum scelerisque varius. Maecenas scelerisque nisl scelerisque nulla ultricies eleifend. Aliquam sit amet velit mauris. Duis at nulla vitae risus condimentum semper. Nam ornare arcu vitae euismod pharetra.';

export const Default: Story = {
  render: ({
    orientation,
    disableCollapse,
    hideCollapseButtons,
    hideDragHandle,
    disableResize,
    startSize,
    endSize,
    startMinSize,
    startMaxSize,
    endMinSize,
    endMaxSize,
  }) => html`
    <style>
      .demo-pane {
        padding: 1rem;
        box-sizing: border-box;
      }
    </style>

    <igc-splitter
      style="height: 400px;"
      .orientation=${orientation}
      .disableCollapse=${disableCollapse}
      .hideCollapseButtons=${hideCollapseButtons}
      .hideDragHandle=${hideDragHandle}
      .disableResize=${disableResize}
      .startSize=${startSize ?? 'auto'}
      .endSize=${endSize ?? 'auto'}
      .startMinSize=${startMinSize}
      .startMaxSize=${startMaxSize}
      .endMinSize=${endMinSize}
      .endMaxSize=${endMaxSize}
    >
      <div slot="start" class="demo-pane">${LOREM}</div>
      <div slot="end" class="demo-pane">${LOREM_LONG}</div>
    </igc-splitter>
  `,
};

export const Vertical: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A splitter with `orientation="vertical"` stacks the start panel on top and the end panel below.',
      },
    },
  },
  render: () => html`
    <style>
      .demo-pane {
        padding: 1rem;
        box-sizing: border-box;
      }
    </style>

    <igc-splitter orientation="vertical" style="height: 500px;">
      <div slot="start" class="demo-pane">
        <strong>Top panel</strong>
        <p>${LOREM}</p>
      </div>
      <div slot="end" class="demo-pane">
        <strong>Bottom panel</strong>
        <p>${LOREM_LONG}</p>
      </div>
    </igc-splitter>
  `,
};

export const WithConstraints: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates `startMinSize`, `startMaxSize`, `endMinSize`, and `endMaxSize`. ' +
          'Use the buttons below to apply pixel‑ or percentage‑based constraints at runtime.',
      },
    },
  },
  render: () => {
    function applyPxConstraints() {
      const splitter = document.querySelector<IgcSplitterComponent>(
        '#constrained-splitter'
      );
      if (!splitter) return;
      splitter.startMinSize = '50px';
      splitter.startMaxSize = '200px';
      splitter.endMinSize = '100px';
      splitter.endMaxSize = '300px';
    }

    function applyPercentConstraints() {
      const splitter = document.querySelector<IgcSplitterComponent>(
        '#constrained-splitter'
      );
      if (!splitter) return;
      splitter.startMinSize = '10%';
      splitter.startMaxSize = '80%';
      splitter.endMinSize = '20%';
      splitter.endMaxSize = '90%';
      splitter.startSize = '30%';
      splitter.endSize = '70%';
    }

    function clearConstraints() {
      const splitter = document.querySelector<IgcSplitterComponent>(
        '#constrained-splitter'
      );
      if (!splitter) return;
      splitter.startMinSize = undefined;
      splitter.startMaxSize = undefined;
      splitter.endMinSize = undefined;
      splitter.endMaxSize = undefined;
      splitter.startSize = 'auto';
      splitter.endSize = 'auto';
    }

    return html`
      <style>
        .demo-pane {
          padding: 1rem;
          box-sizing: border-box;
        }
        .constraint-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
      </style>

      <igc-splitter id="constrained-splitter" style="height: 400px;">
        <div slot="start" class="demo-pane">
          <strong>Start panel</strong>
          <p>${LOREM}</p>
        </div>
        <div slot="end" class="demo-pane">
          <strong>End panel</strong>
          <p>${LOREM_LONG}</p>
        </div>
      </igc-splitter>

      <div class="constraint-actions">
        <igc-button variant="outlined" @click=${applyPxConstraints}>
          Apply px constraints
        </igc-button>
        <igc-button variant="outlined" @click=${applyPercentConstraints}>
          Apply % constraints
        </igc-button>
        <igc-button variant="outlined" @click=${clearConstraints}>
          Clear constraints
        </igc-button>
      </div>
    `;
  },
};

export const ProgrammaticCollapse: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `toggle(position)` API for programmatically collapsing and expanding panels.',
      },
    },
  },
  render: () => {
    function toggle(position: 'start' | 'end') {
      document
        .querySelector<IgcSplitterComponent>('#toggle-splitter')
        ?.toggle(position);
    }

    return html`
      <style>
        .demo-pane {
          padding: 1rem;
          box-sizing: border-box;
        }
        .toggle-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
      </style>

      <igc-splitter id="toggle-splitter" style="height: 400px;">
        <div slot="start" class="demo-pane">
          <strong>Start panel</strong>
          <p>${LOREM}</p>
        </div>
        <div slot="end" class="demo-pane">
          <strong>End panel</strong>
          <p>${LOREM_LONG}</p>
        </div>
      </igc-splitter>

      <div class="toggle-actions">
        <igc-button variant="outlined" @click=${() => toggle('start')}>
          Toggle start panel
        </igc-button>
        <igc-button variant="outlined" @click=${() => toggle('end')}>
          Toggle end panel
        </igc-button>
      </div>
    `;
  },
};

export const NestedSplitters: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Nested splitters can be used to create complex multi-pane layouts. ' +
          'Each inner splitter fills its parent panel and can have its own orientation.',
      },
    },
  },
  render: () => html`
    <style>
      .demo-pane {
        padding: 1rem;
        box-sizing: border-box;
        height: 100%;
      }
    </style>

    <igc-splitter orientation="horizontal" style="height: 600px;">
      <igc-splitter slot="start" orientation="vertical" style="height: 100%;">
        <div slot="start" class="demo-pane">
          <strong>Top left</strong>
          <p>${LOREM}</p>
        </div>
        <div slot="end" class="demo-pane">
          <strong>Bottom left</strong>
          <p>${LOREM}</p>
        </div>
      </igc-splitter>

      <igc-splitter slot="end" orientation="vertical" style="height: 100%;">
        <div slot="start" class="demo-pane">
          <strong>Top right</strong>
          <p>${LOREM_LONG}</p>
        </div>
        <div slot="end" class="demo-pane">
          <strong>Bottom right</strong>
          <p>${LOREM_LONG}</p>
        </div>
      </igc-splitter>
    </igc-splitter>
  `,
};
