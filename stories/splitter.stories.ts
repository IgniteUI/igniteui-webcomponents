import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcInputComponent,
  IgcSplitterComponent,
  type IgcSplitterLayoutChangedEventArgs,
  type IgcSplitterResizeEventArgs,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  readStored,
  renderInto,
  storyStyles,
  writeStored,
} from './story.js';

defineComponents(IgcButtonComponent, IgcInputComponent, IgcSplitterComponent);

// region default
const metadata: Meta<IgcSplitterComponent> = {
  title: 'Splitter',
  component: 'igc-splitter',
  parameters: {
    docs: {
      description: {
        component:
          'A splitter component that provides a resizable split-pane layout, dividing the view\ninto two panels - *start* and *end* - separated by a draggable bar.\n\nPanels can be resized by dragging the bar, using keyboard shortcuts, or collapsed/expanded\nusing the built-in collapse buttons or the programmatic `toggle()` API.\nNested splitters are supported for more complex layouts.',
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

// A drag sends `igcResizing` on each move, and the actions panel slows the page down.
metadata.parameters = { ...metadata.parameters, actions: { disable: true } };

const styles = html`
  ${storyStyles}
  <style>
    .sp-frame {
      height: 26rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    /* Each pane scrolls its own content, which can then take the focus. */
    .sp-scroll {
      flex: 1;
      min-width: 0;
      overflow: auto;
      padding: 1rem;
    }

    .sp-scroll :is(h3, h4, p, ul, ol) {
      margin-block: 0 0.75rem;
    }

    .sp-scroll a {
      color: inherit;
    }

    .sp-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-block-end: 0.75rem;
    }
  </style>
`;

const inbox = [
  {
    from: 'Maya Robinson',
    subject: 'Trip photos are up',
    time: '9:41 AM',
  },
  {
    from: 'Travel desk',
    subject: 'Your flight to Oslo',
    time: '8:15 AM',
  },
  {
    from: 'Jonas Keller',
    subject: 'Lunch on Thursday?',
    time: 'Yesterday',
  },
  {
    from: 'Build service',
    subject: 'Nightly build passed',
    time: 'Monday',
  },
];

export const Default: Story = {
  args: {
    startSize: '35%',
    startMinSize: '12rem',
    endMinSize: '16rem',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A mail client with the inbox in the start pane and the open message in the end pane. Drag the bar to resize the panes, or focus it with Tab and use the arrow keys, which move it by 10 pixels. Home and End move it to the minimum and the maximum size of the start pane. The buttons on the bar and Ctrl + an arrow key collapse and expand the panes. The host `aria-labelledby` points at the inbox heading, so screen readers read the bar as "Inbox" with the size of the inbox in percent, as the window splitter pattern suggests. Each pane scrolls its own content, so the content has a name and a tab stop. Use the controls panel to change the orientation, the sizes and the constraints.',
      },
    },
  },
  render: (args) => html`
    ${styles}
    <igc-splitter
      class="sp-frame"
      aria-labelledby="sp-inbox-title"
      .orientation=${args.orientation}
      .startCollapsed=${args.startCollapsed}
      .endCollapsed=${args.endCollapsed}
      .disableCollapse=${args.disableCollapse}
      .hideCollapseButtons=${args.hideCollapseButtons}
      .hideDragHandle=${args.hideDragHandle}
      .disableResize=${args.disableResize}
      .startSize=${args.startSize}
      .endSize=${args.endSize}
      .startMinSize=${args.startMinSize}
      .startMaxSize=${args.startMaxSize}
      .endMinSize=${args.endMinSize}
      .endMaxSize=${args.endMaxSize}
    >
      <section
        slot="start"
        class="sp-scroll"
        tabindex="0"
        aria-labelledby="sp-inbox-title"
      >
        <h3 id="sp-inbox-title">Inbox</h3>
        <ul class="sp-mails">
          ${inbox.map(
            ({ from, subject, time }) => html`
              <li>
                <strong>${from}</strong>
                <span class="muted">${time}</span>
                <span>${subject}</span>
              </li>
            `
          )}
        </ul>
      </section>
      <article
        slot="end"
        class="sp-scroll"
        tabindex="0"
        aria-labelledby="sp-message-title"
      >
        <h3 id="sp-message-title">Trip photos are up</h3>
        <p class="muted">From Maya Robinson, 9:41 AM</p>
        <p>
          I uploaded the photos from Lisbon to the shared album. There are about
          two hundred, so I sorted them by day and marked my favorites.
        </p>
        <p>
          Pick the ones you like before Friday. I will order the prints on the
          weekend, and the album goes to the printer on Monday.
        </p>
      </article>
    </igc-splitter>
    <style>
      .sp-mails {
        display: grid;
        gap: 0.75rem;
        padding: 0;
        list-style: none;
      }

      .sp-mails li {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.125rem 0.5rem;
      }

      .sp-mails li > span:last-child {
        grid-column: 1 / -1;
      }
    </style>
  `,
};

const sourceFiles = ['index.html', 'main.ts', 'router.ts', 'styles.css'];

const editorCode = `import { createRouter } from './router.js';

const router = createRouter({
  '/': () => import('./pages/home.js'),
  '/orders': () => import('./pages/orders.js'),
});

router.start();`;

const terminalOutput = `$ npm run build
> vite build
✓ 42 modules transformed.
dist/index.html   0.46 kB
dist/main.js     18.92 kB
✓ built in 812ms`;

export const CodeEditor: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The layout of a code editor: a file list on the start side, and a nested vertical splitter with the editor above the terminal. The file list keeps a size between 10rem and 24rem. Each bar takes the name of its start pane, the outer one through `aria-labelledby` and the inner one through `aria-label`, so the two bars do not share a name. The toolbar buttons call `toggle()`, which sends no `igcLayoutChanged` event, so the buttons update their own text. A collapse from the bar sends `igcLayoutChanged`. The events of the inner splitter bubble through the outer one, so the handler checks the target of the event.',
      },
    },
  },
  render: () => {
    const outer = createRef<IgcSplitterComponent>();
    const inner = createRef<IgcSplitterComponent>();

    const toggle =
      (splitter: typeof outer, position: 'start' | 'end') => () => {
        splitter.value?.toggle(position);
        story.update();
      };

    const relayout = ({ target, currentTarget }: Event) => {
      if (target === currentTarget) {
        story.update();
      }
    };

    const story = renderInto(
      () => html`
        <div class="sp-ide">
          <div class="sp-actions">
            <igc-button variant="outlined" @click=${toggle(outer, 'start')}>
              ${outer.value?.startCollapsed ? 'Show files' : 'Hide files'}
            </igc-button>
            <igc-button variant="outlined" @click=${toggle(inner, 'end')}>
              ${inner.value?.endCollapsed ? 'Show terminal' : 'Hide terminal'}
            </igc-button>
          </div>
          <igc-splitter
            ${ref(outer)}
            id="sp-ide"
            class="sp-frame"
            aria-labelledby="sp-files-title"
            start-size="14rem"
            start-min-size="10rem"
            start-max-size="24rem"
            @igcLayoutChanged=${relayout}
          >
            <nav
              slot="start"
              class="sp-scroll"
              aria-labelledby="sp-files-title"
            >
              <h4 id="sp-files-title">Files</h4>
              <ul class="sp-files">
                ${sourceFiles.map(
                  (file) => html`
                    <li>
                      <a
                        href="#"
                        aria-current=${file === 'main.ts' ? 'page' : 'false'}
                        @click=${(event: Event) => event.preventDefault()}
                        >${file}</a
                      >
                    </li>
                  `
                )}
              </ul>
            </nav>
            <igc-splitter
              ${ref(inner)}
              id="sp-ide-main"
              slot="end"
              orientation="vertical"
              aria-label="Editor"
              end-size="35%"
              end-min-size="4rem"
              @igcLayoutChanged=${relayout}
            >
              <pre
                slot="start"
                class="sp-scroll sp-code"
                tabindex="0"
                aria-label="Editor, main.ts"
                .textContent=${editorCode}
              ></pre>
              <pre
                slot="end"
                class="sp-scroll sp-code"
                tabindex="0"
                aria-label="Terminal"
                .textContent=${terminalOutput}
              ></pre>
            </igc-splitter>
          </igc-splitter>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .sp-ide .sp-frame {
          height: 28rem;
        }

        .sp-files {
          display: grid;
          gap: 0.25rem;
          padding: 0;
          list-style: none;
        }

        .sp-files [aria-current='page'] {
          font-weight: 600;
        }

        .sp-code {
          margin: 0;
          font-size: 0.875rem;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

/** The breakpoints of the previewed page, by the smallest width. */
const breakpoints = [
  { name: 'Desktop', min: 1024 },
  { name: 'Tablet', min: 600 },
  { name: 'Mobile', min: 0 },
];

const deviceOf = (width: number) =>
  breakpoints.find(({ min }) => width >= min)!.name;

export const ResponsivePreview: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The editor of a page builder with the settings in the start pane and a preview in the end pane. The preview follows the settings. Drag the bar to try the page at other widths. A `ResizeObserver` gives the badge the width of the preview and its breakpoint, also when the window resizes. `igcResizeStart` and `igcResizeEnd` mark a resize by the user: the badge is highlighted during the resize, and the status text changes only at the end, from the `endPanelSize` of the event, so that screen readers do not read every step. `igcResizing` sends the sizes on each move as well. The preview keeps at least 320px, and collapse is off.',
      },
    },
  },
  render: () => {
    const state = {
      headline: 'Summer sale',
      action: 'Shop now',
      width: 0,
      resizing: false,
      status: '',
    };

    let observer: ResizeObserver | undefined;

    const observe = (preview?: Element) => {
      observer?.disconnect();
      observer = undefined;

      if (preview) {
        observer = new ResizeObserver(([entry]) => {
          state.width = Math.round(entry.borderBoxSize[0].inlineSize);
          story.update();
        });
        observer.observe(preview);
      }
    };

    const edit =
      (key: 'headline' | 'action') =>
      ({ detail }: CustomEvent<string>) => {
        state[key] = detail;
        story.update();
      };

    const story = renderInto(
      () => html`
        <igc-splitter
          class="sp-frame"
          aria-labelledby="sp-settings-title"
          start-size="16rem"
          start-min-size="12rem"
          end-min-size="320px"
          disable-collapse
          @igcResizeStart=${() => {
            state.resizing = true;
            story.update();
          }}
          @igcResizeEnd=${({
            detail,
          }: CustomEvent<IgcSplitterResizeEventArgs>) => {
            const width = Math.round(detail.endPanelSize);
            state.resizing = false;
            state.status = `The preview is ${width}px wide, the ${deviceOf(width).toLowerCase()} layout.`;
            story.update();
          }}
        >
          <section
            slot="start"
            class="sp-scroll sp-settings"
            aria-labelledby="sp-settings-title"
          >
            <h4 id="sp-settings-title">Page settings</h4>
            <igc-input
              label="Headline"
              value=${state.headline}
              @igcInput=${edit('headline')}
            ></igc-input>
            <igc-input
              label="Button text"
              value=${state.action}
              @igcInput=${edit('action')}
            ></igc-input>
          </section>
          <section
            slot="end"
            class="sp-scroll sp-preview"
            tabindex="0"
            aria-labelledby="sp-preview-title"
            ${ref(observe)}
          >
            <div class="sp-preview-bar">
              <h4 id="sp-preview-title">Preview</h4>
              <span class="sp-badge" ?data-resizing=${state.resizing}>
                ${state.width}px, ${deviceOf(state.width)}
              </span>
            </div>
            <p role="status" class="muted">${state.status}</p>
            <div class="sp-page">
              <h3>${state.headline}</h3>
              <ul class="sp-cards">
                ${['Sandals', 'Sun hats', 'Beach towels', 'Sunglasses'].map(
                  (product) => html`<li>${product}</li>`
                )}
              </ul>
              <span class="sp-cta">${state.action}</span>
            </div>
          </section>
        </igc-splitter>
      `
    );

    return html`
      ${styles}
      <style>
        .sp-settings {
          display: grid;
          align-content: start;
          gap: 1rem;
        }

        .sp-settings h4,
        .sp-preview-bar h4,
        .sp-page h3 {
          margin: 0;
        }

        .sp-preview-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .sp-badge {
          padding: 0.125rem 0.5rem;
          border: 1px solid var(--ig-gray-400);
          border-radius: 1rem;
          font-variant-numeric: tabular-nums;
        }

        .sp-badge[data-resizing] {
          border-color: var(--ig-primary-500);
          box-shadow: 0 0 0 1px var(--ig-primary-500);
        }

        .sp-page {
          display: grid;
          justify-items: start;
          gap: 1rem;
          padding: 1rem;
          border: 1px dashed var(--ig-gray-400);
          border-radius: 8px;
        }

        /* The cards take more columns as the preview gets wider. */
        .sp-cards {
          justify-self: stretch;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
          gap: 0.5rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .sp-cards li {
          padding: 1.5rem 1rem;
          border-radius: 8px;
          background: var(--ig-gray-100);
        }

        .sp-cta {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          background: var(--ig-primary-500);
          color: var(--ig-primary-500-contrast);
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const DOCS_LAYOUT_KEY = 'igc-splitter-docs-layout';

function readLayout(): Partial<IgcSplitterLayoutChangedEventArgs> {
  try {
    return JSON.parse(readStored(DOCS_LAYOUT_KEY) ?? '{}');
  } catch {
    return {};
  }
}

const docsSections = [
  'Installation',
  'Theming',
  'Forms',
  'Localization',
  'Accessibility',
];

export const DocsLayout: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A documentation page with the table of contents in the start pane. `igcLayoutChanged` sends the sizes and the collapsed states after each resize, collapse or expand by the user, and the page saves them in `localStorage`. Resize the table of contents or collapse it, then reload the story: the layout stays. Reset layout removes the saved layout and sets the properties back.',
      },
    },
  },
  render: () => {
    const saved = readLayout();
    const state = { status: saved.startSize ? 'Saved layout restored.' : '' };

    const story = renderInto(
      () => html`
        <div class="sp-actions">
          <igc-button
            variant="outlined"
            @click=${() => {
              const splitter = story.host!.querySelector(
                IgcSplitterComponent.tagName
              )!;
              writeStored(DOCS_LAYOUT_KEY, null);
              splitter.startSize = '14rem';
              splitter.endSize = 'auto';
              splitter.startCollapsed = false;
              splitter.endCollapsed = false;
              state.status = 'Layout reset.';
              story.update();
            }}
            >Reset layout</igc-button
          >
          <p role="status" class="muted">${state.status}</p>
        </div>
        <igc-splitter
          class="sp-frame"
          aria-labelledby="sp-toc-title"
          start-min-size="10rem"
          start-max-size="50%"
          .startSize=${saved.startSize ?? '14rem'}
          .endSize=${saved.endSize ?? 'auto'}
          .startCollapsed=${saved.startCollapsed ?? false}
          .endCollapsed=${saved.endCollapsed ?? false}
          @igcLayoutChanged=${({
            detail,
          }: CustomEvent<IgcSplitterLayoutChangedEventArgs>) => {
            writeStored(DOCS_LAYOUT_KEY, JSON.stringify(detail));
            state.status = 'Layout saved.';
            story.update();
          }}
        >
          <nav slot="start" class="sp-scroll" aria-labelledby="sp-toc-title">
            <h4 id="sp-toc-title">Contents</h4>
            <ol>
              ${docsSections.map(
                (section) => html`
                  <li>
                    <a
                      href="#"
                      aria-current=${section === 'Forms' ? 'page' : 'false'}
                      @click=${(event: Event) => event.preventDefault()}
                      >${section}</a
                    >
                  </li>
                `
              )}
            </ol>
          </nav>
          <article
            slot="end"
            class="sp-scroll"
            tabindex="0"
            aria-labelledby="sp-doc-title"
          >
            <h3 id="sp-doc-title">Forms</h3>
            <p>
              The form controls of the library are form-associated custom
              elements. A form submits their values, resets them, and checks
              their validity the same way as for native controls.
            </p>
            <p>
              A failed submit moves the focus to the first invalid control, and
              each control shows its own validation messages under the field.
            </p>
          </article>
        </igc-splitter>
      `
    );

    return html`
      ${styles}
      <style>
        .sp-actions p {
          align-self: center;
          margin: 0;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};
