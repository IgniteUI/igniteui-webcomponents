import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcTextareaComponent,
  IgcToastComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcTextareaComponent,
  IgcToastComponent
);
registerMaterialIcons('check-circle', 'copy', 'warning');

// region default
const metadata: Meta<IgcToastComponent> = {
  title: 'Toast',
  component: 'igc-toast',
  parameters: {
    docs: {
      description: {
        component:
          'A toast component is used to show a brief, non-interactive notification.\n\nThe component integrates with the\n[Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API):\nan Ignite button or a native `<button>` with `command="--show"` / `"--hide"` /\n`"--toggle"` and `commandfor` pointing to this element will call the\ncorresponding method declaratively without any JavaScript.',
      },
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    displayTime: {
      type: 'number',
      description:
        'Sets the time in milliseconds that the component stays visible.\nThe time stops while the pointer or the keyboard focus is in the\ncomponent, and starts again when both leave.',
      control: 'number',
      table: { defaultValue: { summary: '4000' } },
    },
    keepOpen: {
      type: 'boolean',
      description: 'Keeps the component open after the `displayTime` is over.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    position: {
      type: { name: 'enum', value: ['bottom', 'middle', 'top'] },
      description:
        'Sets the position of the component in the viewport or in the container.',
      options: ['bottom', 'middle', 'top'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'bottom' } },
    },
    positioning: {
      type: { name: 'enum', value: ['viewport', 'container'] },
      description:
        'Sets the positioning strategy of the component.\n\n`viewport` - positions against the viewport, ignoring every ancestor.\n`container` - positions inside the bounding box of the closest visible\nancestor, at the place that `position` sets.',
      options: ['viewport', 'container'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'viewport' } },
    },
  },
  args: {
    open: false,
    displayTime: 4000,
    keepOpen: false,
    position: 'bottom',
    positioning: 'viewport',
  },
};

export default metadata;

interface IgcToastArgs {
  /** Sets the open state of the component. */
  open: boolean;
  /**
   * Sets the time in milliseconds that the component stays visible.
   * The time stops while the pointer or the keyboard focus is in the
   * component, and starts again when both leave.
   */
  displayTime: number;
  /** Keeps the component open after the `displayTime` is over. */
  keepOpen: boolean;
  /** Sets the position of the component in the viewport or in the container. */
  position: 'bottom' | 'middle' | 'top';
  /**
   * Sets the positioning strategy of the component.
   *
   * `viewport` - positions against the viewport, ignoring every ancestor.
   * `container` - positions inside the bounding box of the closest visible
   * ancestor, at the place that `position` sets.
   */
  positioning: 'viewport' | 'container';
}
type Story = StoryObj<IgcToastArgs>;

// endregion

const styles = html`
  ${storyStyles}
  <style>
    .ts-panel {
      display: grid;
      gap: 1rem;
      max-width: 32rem;
      padding: 1rem 1.5rem 1.5rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ts-panel :is(h3, p) {
      margin: 0;
    }

    /* The icon and the text of a toast are flex items of the toast. */
    igc-toast {
      gap: 0.5rem;
    }
  </style>
`;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A confirmation after a save. "Save changes" opens the toast with the invoker command `--show` and `commandfor`, without JavaScript. The toast closes itself after `displayTime`, unless `keepOpen` is set. It has the `status` role and is polite, so a screen reader reads the message, and the focus stays on the button. Use the controls panel to change the time, the position and the positioning strategy.',
      },
    },
  },
  render: (args) => html`
    <igc-toast
      id="ts-saved"
      ?open=${args.open}
      ?keep-open=${args.keepOpen}
      .displayTime=${args.displayTime}
      .position=${args.position}
      .positioning=${args.positioning}
    >
      Changes saved
    </igc-toast>
    <igc-button command="--show" commandfor="ts-saved">Save changes</igc-button>
  `,
};

const meetingDetails = [
  {
    label: 'Meeting link',
    name: 'meeting link',
    value: 'https://meet.example.com/kdv-qpzm-tra',
  },
  { label: 'Meeting ID', name: 'meeting ID', value: '843 2210 9187' },
  { label: 'Passcode', name: 'passcode', value: '572913' },
];

export const ShareMeeting: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The join details of a meeting, each with a copy button. A toast confirms the copy, or tells the user to copy the text by hand when the browser blocks the clipboard. A second copy replaces the text of the open toast, and `show()` on an open toast starts its display time again. The toast is a polite live region, so a screen reader reads the new text. The icon in the toast has no name, so assistive technologies ignore it.',
      },
    },
  },
  render: () => {
    const state = { message: '', failed: false };
    const toast = createRef<IgcToastComponent>();

    const copy = async (label: string, name: string, value: string) => {
      let failed = false;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        failed = true;
      }

      state.failed = failed;
      state.message = failed
        ? `Could not copy the ${name}. Select it and copy it.`
        : `${label} copied`;
      story.update();
      toast.value?.show();
    };

    const story = renderInto(
      () => html`
        <section class="ts-panel" aria-labelledby="ts-share-title">
          <div>
            <h3 id="ts-share-title">Design review</h3>
            <p class="muted">Thursday, 10:00 to 10:45</p>
          </div>
          <dl class="ts-details">
            ${meetingDetails.map(
              ({ label, name, value }) => html`
                <div>
                  <dt>${label}</dt>
                  <dd>
                    <span>${value}</span>
                    <igc-icon-button
                      variant="flat"
                      name="copy"
                      aria-label="Copy the ${name}"
                      @click=${() => copy(label, name, value)}
                    ></igc-icon-button>
                  </dd>
                </div>
              `
            )}
          </dl>
          <igc-toast ${ref(toast)} display-time="2500">
            <igc-icon
              name=${state.failed ? 'warning' : 'check-circle'}
            ></igc-icon>
            ${state.message}
          </igc-toast>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        .ts-details {
          display: grid;
          gap: 0.75rem;
          margin: 0;
        }

        .ts-details dt {
          font-weight: 600;
        }

        .ts-details dd {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin: 0;
          overflow-wrap: anywhere;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};

const noteText =
  'Venue: the lake house, two nights.\nBudget: 180 per person, travel included.\nTo do: book the bus, ask about dietary needs, plan one workshop.';

export const Autosave: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A note editor that saves a draft one second after the user stops typing. The toast confirms each save inside the editor, because `positioning="container"` positions it in the closest visible ancestor, here the editor panel, and not in the viewport. The short `display-time` keeps it out of the way of the text.',
      },
    },
  },
  render: () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let toast: IgcToastComponent | undefined;
    const toastRef = ref((element) => {
      toast = element as IgcToastComponent | undefined;
      if (!toast) {
        clearTimeout(timer);
      }
    });

    const scheduleSave = () => {
      clearTimeout(timer);
      timer = setTimeout(() => toast?.show(), 1000);
    };

    return html`
      ${styles}
      <section class="ts-panel" aria-labelledby="ts-editor-title">
        <h3 id="ts-editor-title">Edit note</h3>
        <igc-input
          label="Title"
          value="Team offsite"
          @igcInput=${scheduleSave}
        ></igc-input>
        <igc-textarea
          label="Note"
          rows="6"
          value=${noteText}
          @igcInput=${scheduleSave}
        ></igc-textarea>
        <igc-toast ${toastRef} positioning="container" display-time="1500">
          <igc-icon name="check-circle"></igc-icon>
          Draft saved
        </igc-toast>
      </section>
    `;
  },
};

const article = {
  title: 'The night train is back',
  byline: 'By Lena Brandt, 4 min read',
  paragraphs: [
    'Ten years ago the last sleeper left the main station at midnight. This spring a new operator brings it back, with three routes to the coast and to the mountains.',
    'The cars are new, but the idea is old: you board after dinner, sleep in a bed, and wake up in another country. A seat costs about the same as a budget flight, and a private cabin about the same as a hotel room.',
    'The operator expects most travelers on weekends. On weekdays it sells the empty cabins to companies, as a quiet place to work on the way to a meeting.',
  ],
  related: [
    'Ten stations worth the stop',
    'What to pack for a sleeper',
    'The new timetable at a glance',
  ],
};

export const ReadingMode: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'An article with a reading mode that hides the sidebar and enlarges the text. When the mode starts, a toast at the top of the viewport (`position="top"`) tells the user that the Escape key leaves it. The hint is brief and does not take the focus, so the user can start to read at once. Leaving the mode calls `hide()`, so the hint does not stay after the mode ends.',
      },
    },
  },
  render: () => {
    const state = { reading: false };
    let toast: IgcToastComponent | undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (state.reading && event.key === 'Escape') {
        setReading(false);
      }
    };

    // The listener lives as long as the story is connected.
    const toastRef = ref((element) => {
      toast = element as IgcToastComponent | undefined;
      if (toast) {
        document.addEventListener('keydown', onKeyDown);
      } else {
        document.removeEventListener('keydown', onKeyDown);
      }
    });

    const setReading = (reading: boolean) => {
      state.reading = reading;
      story.update();

      if (reading) {
        toast?.show();
      } else {
        toast?.hide();
      }
    };

    const story = renderInto(
      () => html`
        <div class="ts-reader ${state.reading ? 'ts-reading' : ''}">
          <div class="ts-toolbar">
            <igc-button
              variant="outlined"
              @click=${() => setReading(!state.reading)}
            >
              ${state.reading ? 'Leave reading mode' : 'Reading mode'}
            </igc-button>
          </div>
          <article aria-labelledby="ts-article-title">
            <h3 id="ts-article-title">${article.title}</h3>
            <p class="muted">${article.byline}</p>
            ${article.paragraphs.map((text) => html`<p>${text}</p>`)}
          </article>
          <aside ?hidden=${state.reading} aria-labelledby="ts-related-title">
            <h4 id="ts-related-title">Related</h4>
            <ul>
              ${article.related.map((title) => html`<li>${title}</li>`)}
            </ul>
          </aside>
        </div>
      `
    );

    return html`
      ${styles}
      <style>
        .ts-reader {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 14rem;
          gap: 1rem 2rem;
          max-width: 56rem;
        }

        .ts-toolbar {
          grid-column: 1 / -1;
        }

        .ts-reader :is(h3, h4, p, ul) {
          margin-block: 0 0.75rem;
        }

        .ts-reader article {
          line-height: 1.6;
        }

        .ts-reader aside {
          padding-inline-start: 1rem;
          border-inline-start: 1px solid var(--ig-gray-300);
        }

        .ts-reader.ts-reading {
          grid-template-columns: minmax(0, 38rem);
          justify-content: center;
        }

        .ts-reading article {
          font-size: 1.25rem;
          line-height: 1.7;
        }

        @media (max-width: 40rem) {
          .ts-reader {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      </style>
      <div ${story.mount}></div>
      <igc-toast ${toastRef} position="top" display-time="3000">
        Press Escape to leave reading mode
      </igc-toast>
    `;
  },
};
