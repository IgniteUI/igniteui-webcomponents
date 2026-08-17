import {
  IgcButtonComponent,
  IgcSplitterComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import type { IgcSplitterLayoutChangedEventArgs } from 'igniteui-webcomponents';
import type { Meta, StoryObj } from '@storybook/web-components-vite';

import { disableStoryControls } from './story.js';
import { html } from 'lit';

defineComponents(IgcSplitterComponent, IgcButtonComponent);

// region default
const metadata: Meta<IgcSplitterComponent> = {
  title: 'Splitter',
  component: 'igc-splitter',
  parameters: {
    docs: {
      description: {
        component:
          'A splitter component that provides a resizable split-pane layout, dividing the view\ninto two panels — *start* and *end* — separated by a draggable bar.\n\nPanels can be resized by dragging the bar, using keyboard shortcuts, or collapsed/expanded\nusing the built-in collapse buttons or the programmatic `toggle()` API.\nNested splitters are supported for more complex layouts.',
      },
    },
    actions: {
      handles: [
        'igcResizeStart',
        'igcResizing',
        'igcResizeEnd',
        'igcLayoutChanged',
      ],
    },
  },
  argTypes: {
    orientation: {
      type: { name: 'enum', value: ['horizontal', 'vertical'] },
      description:
        'The orientation of the splitter, which determines the direction of resizing and collapsing.\n\nChanging the orientation after the initial render clears the pane sizes and\ntheir min/max constraints, along with the corresponding attributes - a size\nauthored for one axis rarely makes sense on the other.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'horizontal' } },
    },
    disableCollapse: {
      type: 'boolean',
      description:
        'Whether collapsing either pane is disabled. When `true`, this also hides\nthe expand/collapse buttons on the splitter bar.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    disableResize: {
      type: 'boolean',
      description:
        'Whether resizing the panes by dragging the splitter bar or using keyboard\nshortcuts is disabled. When `true`, this also hides the drag handle on the\nsplitter bar.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideCollapseButtons: {
      type: 'boolean',
      description:
        'Whether the expand/collapse buttons on the splitter bar are hidden.\n\nNote that the buttons will also be hidden if `disable-collapse` is true or\nif a pane is currently collapsed.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    hideDragHandle: {
      type: 'boolean',
      description:
        'Whether the drag handle on the splitter bar is hidden.\n\nNote that the drag handle will also be hidden if `disable-resize` is true.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    startMinSize: {
      type: 'string',
      description:
        'The minimum size of the start pane.\n\nAccepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 removes the constraint.',
      control: 'text',
    },
    endMinSize: {
      type: 'string',
      description:
        'The minimum size of the end pane.\n\nAccepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 removes the constraint.',
      control: 'text',
    },
    startMaxSize: {
      type: 'string',
      description:
        'The maximum size of the start pane.\n\nAccepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 removes the constraint.',
      control: 'text',
    },
    endMaxSize: {
      type: 'string',
      description:
        'The maximum size of the end pane.\n\nAccepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 removes the constraint.',
      control: 'text',
    },
    startSize: {
      type: 'string',
      description:
        'The size of the start pane.\n\nAccepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 falls back to automatic sizing.',
      control: 'text',
    },
    endSize: {
      type: 'string',
      description:
        'The size of the end pane.\n\nAccepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a\nunitless `0`. Setting `auto`, any other unitless or unparsable value, a\nnegative value, or a percentage above 100 falls back to automatic sizing.',
      control: 'text',
    },
    startCollapsed: {
      type: 'boolean',
      description:
        'Whether the start pane is currently collapsed. Set this property to\ncollapse or expand the pane programmatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    endCollapsed: {
      type: 'boolean',
      description:
        'Whether the end pane is currently collapsed. Set this property to\ncollapse or expand the pane programmatically.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    orientation: 'horizontal',
    disableCollapse: false,
    disableResize: false,
    hideCollapseButtons: false,
    hideDragHandle: false,
    startCollapsed: false,
    endCollapsed: false,
  },
};

export default metadata;

interface IgcSplitterArgs {
  /**
   * The orientation of the splitter, which determines the direction of resizing and collapsing.
   *
   * Changing the orientation after the initial render clears the pane sizes and
   * their min/max constraints, along with the corresponding attributes - a size
   * authored for one axis rarely makes sense on the other.
   */
  orientation: 'horizontal' | 'vertical';
  /**
   * Whether collapsing either pane is disabled. When `true`, this also hides
   * the expand/collapse buttons on the splitter bar.
   */
  disableCollapse: boolean;
  /**
   * Whether resizing the panes by dragging the splitter bar or using keyboard
   * shortcuts is disabled. When `true`, this also hides the drag handle on the
   * splitter bar.
   */
  disableResize: boolean;
  /**
   * Whether the expand/collapse buttons on the splitter bar are hidden.
   *
   * Note that the buttons will also be hidden if `disable-collapse` is true or
   * if a pane is currently collapsed.
   */
  hideCollapseButtons: boolean;
  /**
   * Whether the drag handle on the splitter bar is hidden.
   *
   * Note that the drag handle will also be hidden if `disable-resize` is true.
   */
  hideDragHandle: boolean;
  /**
   * The minimum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   */
  startMinSize: string;
  /**
   * The minimum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `100px` or `20%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   */
  endMinSize: string;
  /**
   * The maximum size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   */
  startMaxSize: string;
  /**
   * The maximum size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `500px` or `80%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 removes the constraint.
   */
  endMaxSize: string;
  /**
   * The size of the start pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 falls back to automatic sizing.
   */
  startSize: string;
  /**
   * The size of the end pane.
   *
   * Accepts a CSS length with an explicit unit, e.g. `200px` or `50%`, or a
   * unitless `0`. Setting `auto`, any other unitless or unparsable value, a
   * negative value, or a percentage above 100 falls back to automatic sizing.
   */
  endSize: string;
  /**
   * Whether the start pane is currently collapsed. Set this property to
   * collapse or expand the pane programmatically.
   */
  startCollapsed: boolean;
  /**
   * Whether the end pane is currently collapsed. Set this property to
   * collapse or expand the pane programmatically.
   */
  endCollapsed: boolean;
}
type Story = StoryObj<IgcSplitterArgs>;

// endregion

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque scelerisque elementum ante, et tincidunt eros ultrices sit amet. Mauris non consectetur nunc. In hac habitasse platea dictumst.';

const LOREM_LONG =
  'Maecenas sit amet ipsum non ipsum scelerisque varius. Maecenas scelerisque nisl scelerisque nulla ultricies eleifend. Aliquam sit amet velit mauris. Duis at nulla vitae risus condimentum semper. Nam ornare arcu vitae euismod pharetra.';

export const Default: Story = {
  render: ({
    orientation,
    startCollapsed,
    endCollapsed,
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
      .startCollapsed=${startCollapsed}
      .endCollapsed=${endCollapsed}
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
    actions: {
      handles: [],
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
    actions: {
      handles: [],
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
    actions: {
      handles: [],
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

const PERSISTED_LAYOUT_KEY = 'igc-splitter-demo-layout';

export const PersistedLayout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates reading/writing the `startSize` and `startCollapsed`/`endCollapsed` properties and listening for ' +
          'the single `igcLayoutChanged` event to persist the pane size and collapsed state (e.g. in `localStorage`) ' +
          'and restore them on load.',
      },
    },
    actions: {
      handles: [],
    },
  },
  render: () => {
    const saved = localStorage.getItem(PERSISTED_LAYOUT_KEY);
    const layout = saved ? JSON.parse(saved) : null;

    const startSize = layout?.startSize ?? '50%';
    const startCollapsed = layout?.startCollapsed ?? false;
    const endCollapsed = layout?.endCollapsed ?? false;

    function persist(event: CustomEvent<IgcSplitterLayoutChangedEventArgs>) {
      localStorage.setItem(PERSISTED_LAYOUT_KEY, JSON.stringify(event.detail));
    }

    return html`
      <style>
        .demo-pane {
          padding: 1rem;
          box-sizing: border-box;
        }
      </style>

      <igc-splitter
        style="height: 400px;"
        .startSize=${startSize}
        .startCollapsed=${startCollapsed}
        .endCollapsed=${endCollapsed}
        @igcLayoutChanged=${persist}
      >
        <div slot="start" class="demo-pane">
          <strong>Start panel</strong>
          <p>${LOREM}</p>
        </div>
        <div slot="end" class="demo-pane">
          <strong>End panel</strong>
          <p>${LOREM_LONG}</p>
        </div>
      </igc-splitter>
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
    actions: {
      handles: [],
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
