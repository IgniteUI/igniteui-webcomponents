import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, render } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';

import {
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  IgcRippleComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { registerExtendedIcons, registerMaterialIcons } from './story-icons.js';
import { disableStoryControls, renderInto, storyStyles } from './story.js';

defineComponents(
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcLinearProgressComponent,
  IgcRippleComponent
);

const icons = registerExtendedIcons();

registerMaterialIcons(
  'delete',
  'description',
  'download',
  'forward-30',
  'pause',
  'play-arrow',
  'replay-10',
  'skip-next',
  'skip-previous',
  'volume-off',
  'volume-up'
);

// region default
const metadata: Meta<IgcIconButtonComponent> = {
  title: 'IconButton',
  component: 'igc-icon-button',
  parameters: {
    docs: {
      description: {
        component:
          'A button that displays a single icon, designed for compact, icon-only\ninteractions such as toolbar actions, floating action buttons, or inline\ncontrols.\n\nThe icon is sourced from the icon registry via the `name` and `collection`\nattributes. Like the normal button, it can render as an anchor element when\n`href` is set and is fully form-associated.',
      },
    },
  },
  argTypes: {
    name: {
      type: 'string',
      description: 'The name of the icon to display.',
      control: 'text',
    },
    collection: {
      type: 'string',
      description: 'The collection the icon belongs to.',
      control: 'text',
    },
    mirrored: {
      type: 'boolean',
      description:
        'Determines whether the icon should be mirrored in right-to-left contexts.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      type: { name: 'enum', value: ['contained', 'flat', 'outlined'] },
      description:
        'The variant of the button which determines its visual appearance.\n- `contained` – filled background; highest visual emphasis (default).\n- `outlined` – transparent background with a visible border.\n- `flat` – no background or border; lowest visual emphasis.',
      options: ['contained', 'flat', 'outlined'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'contained' } },
    },
    type: {
      type: { name: 'enum', value: ['button', 'reset', 'submit'] },
      description:
        "The type of the button, which determines its behavior and semantics.\n- `'button'` – no default action; useful for custom JavaScript handlers.\n- `'submit'` – submits the associated form when clicked.\n- `'reset'` – resets the associated form fields to their initial values.\n\nIgnored when the button is rendered as a link (i.e. `href` is set).",
      options: ['button', 'reset', 'submit'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'button' } },
    },
    href: {
      type: 'string',
      description:
        'The URL the button points to. When set, the component renders as an\n`<a>` element instead of a `<button>`, enabling navigation on click.\nUse together with `target`, `download`, and `rel` for full anchor semantics.\nA disabled link renders a disabled `<button>` with the link role, because an\nanchor has no disabled state.',
      control: 'text',
    },
    download: {
      type: 'string',
      description:
        'Prompts the browser to download the linked resource rather than navigating\nto it. The optional value is used as the suggested file name.\nOnly effective when `href` is set.',
      control: 'text',
    },
    target: {
      type: { name: 'enum', value: ['_blank', '_parent', '_self', '_top'] },
      description:
        "Where to open the linked document. Only effective when `href` is set.\n- `'_self'` – current browsing context (default browser behavior).\n- `'_blank'` – new tab or window.\n- `'_parent'` – parent browsing context; falls back to `_self` if none.\n- `'_top'` – top-level browsing context; falls back to `_self` if none.",
      options: ['_blank', '_parent', '_self', '_top'],
      control: { type: 'select' },
    },
    rel: {
      type: 'string',
      description:
        'The relationship between the current document and the linked URL.\nAccepts a space-separated list of link types (e.g. `\'noopener noreferrer\'`).\nOnly effective when `href` is set. When `target="_blank"` is used,\nsetting `rel="noopener noreferrer"` is strongly recommended for security.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'When set, the button will be disabled and non-interactive.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    command: {
      type: 'string',
      description:
        "The command to invoke on the target element specified by `commandfor`.\nPart of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.\nCustom commands must start with two dashes (e.g. `'--my-command'`).",
      control: 'text',
    },
    commandfor: {
      type: 'string',
      description:
        'The ID of the target element for the invoker command.\nPart of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).',
      control: 'text',
    },
  },
  args: {
    mirrored: false,
    variant: 'contained',
    type: 'button',
    disabled: false,
  },
};

export default metadata;

interface IgcIconButtonArgs {
  /** The name of the icon to display. */
  name: string;
  /** The collection the icon belongs to. */
  collection: string;
  /** Determines whether the icon should be mirrored in right-to-left contexts. */
  mirrored: boolean;
  /**
   * The variant of the button which determines its visual appearance.
   * - `contained` – filled background; highest visual emphasis (default).
   * - `outlined` – transparent background with a visible border.
   * - `flat` – no background or border; lowest visual emphasis.
   */
  variant: 'contained' | 'flat' | 'outlined';
  /**
   * The type of the button, which determines its behavior and semantics.
   * - `'button'` – no default action; useful for custom JavaScript handlers.
   * - `'submit'` – submits the associated form when clicked.
   * - `'reset'` – resets the associated form fields to their initial values.
   *
   * Ignored when the button is rendered as a link (i.e. `href` is set).
   */
  type: 'button' | 'reset' | 'submit';
  /**
   * The URL the button points to. When set, the component renders as an
   * `<a>` element instead of a `<button>`, enabling navigation on click.
   * Use together with `target`, `download`, and `rel` for full anchor semantics.
   * A disabled link renders a disabled `<button>` with the link role, because an
   * anchor has no disabled state.
   */
  href: string;
  /**
   * Prompts the browser to download the linked resource rather than navigating
   * to it. The optional value is used as the suggested file name.
   * Only effective when `href` is set.
   */
  download: string;
  /**
   * Where to open the linked document. Only effective when `href` is set.
   * - `'_self'` – current browsing context (default browser behavior).
   * - `'_blank'` – new tab or window.
   * - `'_parent'` – parent browsing context; falls back to `_self` if none.
   * - `'_top'` – top-level browsing context; falls back to `_self` if none.
   */
  target: '_blank' | '_parent' | '_self' | '_top';
  /**
   * The relationship between the current document and the linked URL.
   * Accepts a space-separated list of link types (e.g. `'noopener noreferrer'`).
   * Only effective when `href` is set. When `target="_blank"` is used,
   * setting `rel="noopener noreferrer"` is strongly recommended for security.
   */
  rel: string;
  /** When set, the button will be disabled and non-interactive. */
  disabled: boolean;
  /**
   * The command to invoke on the target element specified by `commandfor`.
   * Part of the [Invoker Commands](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API) API.
   * Custom commands must start with two dashes (e.g. `'--my-command'`).
   */
  command: string;
  /**
   * The ID of the target element for the invoker command.
   * Part of the [Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API).
   */
  commandfor: string;
}
type Story = StoryObj<IgcIconButtonArgs>;

// endregion

Object.assign(metadata.argTypes!.name!, {
  control: 'select',
  options: icons,
});

const styles = html`
  ${storyStyles}
  <style>
    .ib-panel {
      display: grid;
      gap: 1rem;
      width: min(100%, 32rem);
      padding: 1rem 1.25rem;
      border: 1px solid var(--ig-gray-300);
      border-radius: 8px;
    }

    .ib-panel :is(h3, p) {
      margin: 0;
    }

    .ib-panel h3 {
      font-size: 1.125rem;
    }

    .ib-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .ib-controls {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 0.5rem;
    }

    .ib-controls > :last-child {
      justify-self: end;
    }
  </style>
`;

export const Default: Story = {
  args: { name: 'add-filter' },
  parameters: {
    docs: {
      description: {
        story:
          'An icon button for a toolbar action. The button shows only an icon, so it needs an `aria-label` that names the action. Here the label is the name of the icon. Use the `name` control to change the icon, `variant` to change the emphasis, and `mirrored` to flip the icon. Set `href` to render the button as a link. The `igc-ripple` in the default slot adds the ripple effect on click.',
      },
    },
  },
  render: ({
    name,
    collection,
    mirrored,
    href,
    download,
    target,
    rel,
    variant,
    disabled,
  }) => html`
    <igc-icon-button
      aria-label=${(name ?? 'add-filter').replaceAll('-', ' ')}
      .name=${name ?? 'add-filter'}
      .collection=${collection ?? 'default'}
      .mirrored=${mirrored}
      href=${ifDefined(href || undefined)}
      target=${ifDefined(target)}
      rel=${ifDefined(rel || undefined)}
      download=${ifDefined(download || undefined)}
      variant=${ifDefined(variant)}
      .disabled=${disabled}
    >
      <igc-ripple></igc-ripple>
    </igc-icon-button>
  `,
};

const episodes = [
  { title: 'Designing for screen readers', duration: 2712 },
  { title: 'Color, contrast and dark mode', duration: 2245 },
  { title: 'Forms that forgive mistakes', duration: 3001 },
];

const speeds = [1, 1.25, 1.5, 2];

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export const Player: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The controls of a podcast player. Each button shows only an icon, so each has an `aria-label`. The play button uses the `contained` variant and a larger `--ig-size`, because it is the main action. The other buttons are `flat`. The play button and the mute button change their icon and their `aria-label` together, for example from Play to Pause, so that the name tells what the next click does. The speed button shows text in the default slot, with visually hidden text that completes its name. The previous and next buttons are `disabled` at the first and the last episode. A disabled button cannot keep the focus, so the story then moves the focus to the play button.',
      },
    },
  },
  render: () => {
    let index = 1;
    let position = 754;
    let playing = false;
    let muted = false;
    let speed = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    let host: HTMLElement | undefined;

    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };

    const tick = () => {
      position = Math.min(position + speeds[speed]!, episodes[index]!.duration);

      if (position === episodes[index]!.duration) {
        playing = false;
        stop();
      }

      update();
    };

    const togglePlay = () => {
      playing = !playing;
      stop();

      if (playing) {
        timer = setInterval(tick, 1000);
      }

      update();
    };

    const seek = (seconds: number) => {
      position = Math.max(
        0,
        Math.min(position + seconds, episodes[index]!.duration)
      );
      update();
    };

    const go = (step: 1 | -1) => {
      index += step;
      position = 0;
      update();

      if (index === 0 || index === episodes.length - 1) {
        host!.querySelector<IgcIconButtonComponent>('[data-play]')!.focus();
      }
    };

    const update = () => {
      if (!host) {
        playing = false;
        stop();
        return;
      }

      const episode = episodes[index]!;

      render(
        html`
          <section class="ib-panel" aria-labelledby="ib-episode">
            <div>
              <p class="muted">
                Inclusive by Design, episode ${index + 1} of ${episodes.length}
              </p>
              <h3 id="ib-episode">${episode.title}</h3>
            </div>
            <div>
              <igc-linear-progress
                aria-label="Played"
                hide-label
                value=${position}
                max=${episode.duration}
              ></igc-linear-progress>
              <div class="ib-row muted" style="justify-content: space-between">
                <span>${formatTime(position)}</span>
                <span>${formatTime(episode.duration)}</span>
              </div>
            </div>
            <div class="ib-controls">
              <igc-icon-button
                variant="flat"
                @click=${() => {
                  speed = (speed + 1) % speeds.length;
                  update();
                }}
              >
                <span class="sr-only">Playback speed</span>
                ${speeds[speed]}×
              </igc-icon-button>
              <div class="ib-row" role="group" aria-label="Playback">
                <igc-icon-button
                  variant="flat"
                  name="skip-previous"
                  aria-label="Previous episode"
                  ?disabled=${index === 0}
                  @click=${() => go(-1)}
                ></igc-icon-button>
                <igc-icon-button
                  variant="flat"
                  name="replay-10"
                  aria-label="Back 10 seconds"
                  @click=${() => seek(-10)}
                ></igc-icon-button>
                <igc-icon-button
                  data-play
                  style="--ig-size: var(--ig-size-large)"
                  name=${playing ? 'pause' : 'play-arrow'}
                  aria-label=${playing ? 'Pause' : 'Play'}
                  @click=${togglePlay}
                ></igc-icon-button>
                <igc-icon-button
                  variant="flat"
                  name="forward-30"
                  aria-label="Forward 30 seconds"
                  @click=${() => seek(30)}
                ></igc-icon-button>
                <igc-icon-button
                  variant="flat"
                  name="skip-next"
                  aria-label="Next episode"
                  ?disabled=${index === episodes.length - 1}
                  @click=${() => go(1)}
                ></igc-icon-button>
              </div>
              <igc-icon-button
                variant="flat"
                name=${muted ? 'volume-off' : 'volume-up'}
                aria-label=${muted ? 'Unmute' : 'Mute'}
                @click=${() => {
                  muted = !muted;
                  update();
                }}
              ></igc-icon-button>
            </div>
          </section>
        `,
        host
      );
    };

    const mount = (element?: Element) => {
      host = element as HTMLElement | undefined;
      update();
    };

    return html`${styles}
      <div ${ref(mount)}></div>`;
  },
};

type Attachment = { name: string; type: string; content: string };

const attachments: Attachment[] = [
  {
    name: 'meeting-notes.md',
    type: 'text/markdown',
    content:
      '# Planning meeting\n\n- Review the roadmap\n- Choose the owners\n',
  },
  {
    name: 'budget-2027.csv',
    type: 'text/csv',
    content: 'item,amount\nTravel,1200\nSoftware,800\nTraining,650\n',
  },
  {
    name: 'agenda.txt',
    type: 'text/plain',
    content: '09:00 Welcome\n09:15 Roadmap\n10:30 Break\n10:45 Owners\n',
  },
];

export const Attachments: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The attachments of a task. Each row has a download button and a delete button. The `aria-label` of each button names the file, so that a screen reader user who moves from button to button knows which file each one acts on. The download button sets `href` and `download`, so it renders a link and keeps the link role. Delete removes the row, and the focus moves to the delete button of the next file, or of the previous file after the last one. With no files left, the focus moves to the heading. Undo puts the file back and focuses its delete button.',
      },
    },
  },
  render: () => {
    const files = attachments.map((file) => ({ ...file }));
    let deleted: { file: Attachment; index: number } | undefined;

    const focusDelete = async (index: number) => {
      const buttons =
        story.host!.querySelectorAll<IgcIconButtonComponent>('[data-delete]');
      const button = buttons[Math.min(index, buttons.length - 1)];

      if (button) {
        await button.updateComplete;
        button.focus();
      } else {
        story.host!.querySelector<HTMLElement>('h3')!.focus();
      }
    };

    const remove = (index: number) => {
      deleted = { file: files.splice(index, 1)[0]!, index };
      story.update();
      focusDelete(index);
    };

    const undo = () => {
      const { file, index } = deleted!;

      files.splice(index, 0, file);
      deleted = undefined;
      story.update();
      focusDelete(index);
    };

    const story = renderInto(
      () => html`
        <section class="ib-panel">
          <h3 tabindex="-1">Attachments</h3>
          ${
            files.length
              ? html`
                  <ul class="ib-files">
                    ${repeat(
                      files,
                      (file) => file.name,
                      (file, index) => html`
                        <li>
                          <igc-icon name="description"></igc-icon>
                          <div>
                            <span>${file.name}</span>
                            <span class="muted">
                              ${new Blob([file.content]).size} bytes
                            </span>
                          </div>
                          <igc-icon-button
                            variant="flat"
                            name="download"
                            aria-label="Download ${file.name}"
                            href="data:${file.type};charset=utf-8,${encodeURIComponent(
                              file.content
                            )}"
                            download=${file.name}
                          ></igc-icon-button>
                          <igc-icon-button
                            data-delete
                            variant="flat"
                            name="delete"
                            aria-label="Delete ${file.name}"
                            @click=${() => remove(index)}
                          ></igc-icon-button>
                        </li>
                      `
                    )}
                  </ul>
                `
              : html`<p class="muted">No attachments.</p>`
          }
          <div class="ib-row">
            <p class="muted" role="status">
              ${deleted ? `${deleted.file.name} is deleted.` : ''}
            </p>
            ${
              deleted
                ? html`<igc-button variant="flat" @click=${undo}>
                    Undo
                  </igc-button>`
                : nothing
            }
          </div>
        </section>
      `
    );

    return html`
      ${styles}
      <style>
        .ib-files {
          display: grid;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .ib-files li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-block: 0.5rem;
          border-block-end: 1px solid var(--ig-gray-300);
        }

        .ib-files li div {
          display: grid;
          flex: 1;
        }
      </style>
      <div ${story.mount}></div>
    `;
  },
};
