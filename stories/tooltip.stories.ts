import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { range } from 'lit/directives/range.js';
import { createRef, ref } from 'lit/directives/ref.js';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  type IgcCheckboxChangeEventArgs,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTooltipComponent,
  type PopoverPlacement,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { disableStoryControls } from './story.js';

defineComponents(
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconButtonComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcSwitchComponent,
  IgcTooltipComponent
);
// region default
const metadata: Meta<IgcTooltipComponent> = {
  title: 'Tooltip',
  component: 'igc-tooltip',
  parameters: {
    docs: {
      description: {
        component:
          'Provides a way to display supplementary information related to an element when a user interacts with it (e.g., hover, focus).\nIt offers features such as placement customization, delays, sticky mode, and animations.',
      },
    },
    actions: {
      handles: ['igcOpening', 'igcOpened', 'igcClosing', 'igcClosed'],
    },
  },
  argTypes: {
    open: {
      type: 'boolean',
      description: 'Whether the tooltip is showing.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    withArrow: {
      type: 'boolean',
      description: 'Whether to render an arrow indicator for the tooltip.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    offset: {
      type: 'number',
      description: 'The offset of the tooltip from the anchor in pixels.',
      control: 'number',
      table: { defaultValue: { summary: '6' } },
    },
    placement: {
      type: {
        name: 'enum',
        value: [
          'top',
          'top-start',
          'top-end',
          'bottom',
          'bottom-start',
          'bottom-end',
          'right',
          'right-start',
          'right-end',
          'left',
          'left-start',
          'left-end',
        ],
      },
      description: 'Where to place the tooltip relative to its anchor element.',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'right',
        'right-start',
        'right-end',
        'left',
        'left-start',
        'left-end',
      ],
      control: { type: 'select' },
      table: { defaultValue: { summary: 'bottom' } },
    },
    scrollStrategy: {
      type: { name: 'enum', value: ['scroll', 'hide', 'close'] },
      description:
        'Sets the behavior of the tooltip when the parent container scrolls.\n\nIf the value is `hide`, the tooltip hides while the anchor is fully out\nof view. `hide` is the default value.\n\nIf the value is `scroll`, the tooltip stays visible and anchored.\n\nIf the value is `close`, the tooltip closes on each scroll. The tooltip\nalso closes if you set the `sticky` property. The Escape key behaves the\nsame way.',
      options: ['scroll', 'hide', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'hide' } },
    },
    anchor: {
      type: { name: 'other', value: 'Element | string' },
      description:
        'An element instance or an IDREF to use as the anchor for the tooltip.',
    },
    showTriggers: {
      type: 'string',
      description:
        'Which event triggers will show the tooltip.\nExpects a comma separated string of different event triggers.',
      control: 'text',
      table: { defaultValue: { summary: 'pointerenter,focusin' } },
    },
    hideTriggers: {
      type: 'string',
      description:
        'Which event triggers will hide the tooltip.\nExpects a comma separated string of different event triggers.',
      control: 'text',
      table: { defaultValue: { summary: 'pointerleave,click,focusout' } },
    },
    showDelay: {
      type: 'number',
      description:
        'Specifies the number of milliseconds that should pass before showing the tooltip.',
      control: 'number',
      table: { defaultValue: { summary: '200' } },
    },
    hideDelay: {
      type: 'number',
      description:
        'Specifies the number of milliseconds that should pass before hiding the tooltip.',
      control: 'number',
      table: { defaultValue: { summary: '300' } },
    },
    message: {
      type: 'string',
      description: 'Specifies plain text as the tooltip content.',
      control: 'text',
      table: { defaultValue: { summary: '' } },
    },
    sticky: {
      type: 'boolean',
      description:
        'Specifies if the tooltip remains visible until the user closes it via the close button or Esc key.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  args: {
    open: false,
    withArrow: false,
    offset: 6,
    placement: 'bottom',
    scrollStrategy: 'hide',
    showTriggers: 'pointerenter,focusin',
    hideTriggers: 'pointerleave,click,focusout',
    showDelay: 200,
    hideDelay: 300,
    message: '',
    sticky: false,
  },
};

export default metadata;

interface IgcTooltipArgs {
  /** Whether the tooltip is showing. */
  open: boolean;
  /** Whether to render an arrow indicator for the tooltip. */
  withArrow: boolean;
  /** The offset of the tooltip from the anchor in pixels. */
  offset: number;
  /** Where to place the tooltip relative to its anchor element. */
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end';
  /**
   * Sets the behavior of the tooltip when the parent container scrolls.
   *
   * If the value is `hide`, the tooltip hides while the anchor is fully out
   * of view. `hide` is the default value.
   *
   * If the value is `scroll`, the tooltip stays visible and anchored.
   *
   * If the value is `close`, the tooltip closes on each scroll. The tooltip
   * also closes if you set the `sticky` property. The Escape key behaves the
   * same way.
   */
  scrollStrategy: 'scroll' | 'hide' | 'close';
  /** An element instance or an IDREF to use as the anchor for the tooltip. */
  anchor: Element | string;
  /**
   * Which event triggers will show the tooltip.
   * Expects a comma separated string of different event triggers.
   */
  showTriggers: string;
  /**
   * Which event triggers will hide the tooltip.
   * Expects a comma separated string of different event triggers.
   */
  hideTriggers: string;
  /** Specifies the number of milliseconds that should pass before showing the tooltip. */
  showDelay: number;
  /** Specifies the number of milliseconds that should pass before hiding the tooltip. */
  hideDelay: number;
  /** Specifies plain text as the tooltip content. */
  message: string;
  /** Specifies if the tooltip remains visible until the user closes it via the close button or Esc key. */
  sticky: boolean;
}
type Story = StoryObj<IgcTooltipArgs>;

// endregion

const materialIcons = 'https://unpkg.com/material-design-icons@3.0.1';

for (const [name, path] of [
  ['bold', 'editor/svg/production/ic_format_bold_24px.svg'],
  ['copy', 'content/svg/production/ic_content_copy_24px.svg'],
  ['error', 'alert/svg/production/ic_error_outline_24px.svg'],
  ['help', 'action/svg/production/ic_help_outline_24px.svg'],
  ['image', 'editor/svg/production/ic_insert_photo_24px.svg'],
  ['info', 'action/svg/production/ic_info_outline_24px.svg'],
  ['italic', 'editor/svg/production/ic_format_italic_24px.svg'],
  ['link', 'editor/svg/production/ic_insert_link_24px.svg'],
  ['list', 'editor/svg/production/ic_format_list_bulleted_24px.svg'],
  ['mail', 'communication/svg/production/ic_email_24px.svg'],
  ['quote', 'editor/svg/production/ic_format_quote_24px.svg'],
  ['redo', 'content/svg/production/ic_redo_24px.svg'],
  ['trending_up', 'action/svg/production/ic_trending_up_24px.svg'],
  ['underline', 'editor/svg/production/ic_format_underlined_24px.svg'],
  ['undo', 'content/svg/production/ic_undo_24px.svg'],
]) {
  registerIcon(name, `${materialIcons}/${path}`);
}

/** Shared styling for the application-like story scenarios. */
const scenarioStyles = html`
  <style>
    .scenario {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 46rem;
    }

    .scenario p {
      margin: 0;
    }

    /* Keeps the anchor clear of the frame edges, so a placement is not
       flipped just because there is no room on that side. */
    .inset {
      margin: 6rem 0 0 6rem;
    }

    .log {
      margin: 0;
      min-height: 1.25rem;
      font-family: monospace;
      color: var(--ig-primary-500, #09f);
    }

    /* The default slot takes over from the message property, so the projected
       wrapper is what caps the width of a rich tooltip. */
    .tip {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 18rem;
    }

    .tip p,
    .tip ul {
      margin: 0;
    }

    .tip ul {
      padding-inline-start: 1rem;
    }

    .tip kbd {
      padding: 0 0.25rem;
      border: 1px solid currentColor;
      border-radius: 3px;
      font-family: monospace;
      opacity: 0.75;
    }

    .shortcut {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }

    .toolbar .separator {
      width: 1px;
      align-self: stretch;
      margin: 0.25rem;
      background: var(--ig-gray-200, #e0e0e0);
    }

    .editor {
      min-height: 6rem;
      padding: 0.75rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }

    .app-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      background: var(--ig-gray-100, #f5f5f5);
    }

    .field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .field igc-input {
      flex: 1;
    }

    .field .error::part(base),
    .field .error::part(icon) {
      color: var(--ig-error-500, #d32f2f);
    }

    .scenario table {
      border-collapse: collapse;
      width: 100%;
      table-layout: fixed;
    }

    .scenario th,
    .scenario td {
      border-bottom: 1px solid var(--ig-gray-200, #e0e0e0);
      padding: 0.25rem 0.75rem;
      text-align: start;
    }

    .truncate {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .thread {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comment {
      display: flex;
      gap: 0.75rem;
    }

    .comment > div {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .comment small {
      opacity: 0.7;
    }

    .mention {
      color: var(--ig-primary-500, #09f);
      font-weight: 600;
      cursor: pointer;
    }

    .card::part(base) {
      max-width: 20rem;
    }

    .user {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.25rem 0.75rem;
      align-items: center;
    }

    .user igc-avatar {
      grid-row: span 2;
    }

    .user-actions {
      grid-column: span 2;
      display: flex;
      gap: 0.5rem;
    }

    .cards {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .cards igc-card {
      max-width: 20rem;
    }

    .cards igc-card-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      justify-content: space-between;
      height: 100%;
    }

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--ig-gray-200, #e0e0e0);
      border-radius: 4px;
    }
  </style>
`;

export const Default: Story = {
  args: {
    message: 'Publishes the draft and notifies the reviewers.',
    withArrow: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The component wired to the controls panel. The tooltip finds its anchor by IDREF and, with the default triggers, opens on `pointerenter` or `focusin` and closes on `pointerleave`, `click` or `focusout` - so pointer and keyboard users get the same hint. The anchor is pointed at the tooltip through `aria-describedby`, which is what a screen reader announces. Text set through `message` renders into the `simple-text` part and is width-capped; projecting anything into the default slot replaces it.',
      },
    },
  },
  render: (args) => html`
    ${scenarioStyles}
    <div class="scenario inset">
      <div><igc-button id="default-anchor">Publish</igc-button></div>
    </div>

    <igc-tooltip
      anchor="default-anchor"
      .open=${args.open}
      .withArrow=${args.withArrow}
      .sticky=${args.sticky}
      .offset=${args.offset}
      .placement=${args.placement}
      .showDelay=${args.showDelay}
      .hideDelay=${args.hideDelay}
      .showTriggers=${args.showTriggers}
      .hideTriggers=${args.hideTriggers}
      .message=${args.message}
    ></igc-tooltip>
  `,
};

const placements: PopoverPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
];

export const Placements: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'All twelve placements at once - every tooltip below is bound to the same anchor. `placement` picks the side and the alignment along it, `offset` sets the gap to the anchor, and `with-arrow` renders the arrow, which is nudged towards the aligned edge on the `-start` and `-end` variants. The placement is a preference, not a guarantee: the tooltip flips to the opposite side to stay in the viewport, so scroll the card to an edge to see it move.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <style>
      #placement-anchor {
        display: grid;
        place-content: center;
        margin: 25dvh 25dvw;
        width: 50dvw;
        height: 40dvh;
        border-radius: 4px;
        background-color: var(--ig-primary-500, #09f);
        color: var(--ig-primary-500-contrast, #fff);
        box-shadow: var(--ig-elevation-2);
      }
    </style>

    <div id="placement-anchor">
      <h2>Hover for every placement</h2>
    </div>

    ${placements.map(
      (placement) => html`
        <igc-tooltip
          anchor="placement-anchor"
          .placement=${placement}
          show-delay="0"
          hide-delay="0"
          with-arrow
        >
          ${placement}
        </igc-tooltip>
      `
    )}
  `,
};

type ToolbarAction = {
  icon: string;
  label: string;
  shortcut?: string;
  separated?: boolean;
};

const toolbarActions: ToolbarAction[] = [
  { icon: 'undo', label: 'Undo', shortcut: 'Ctrl + Z' },
  { icon: 'redo', label: 'Redo', shortcut: 'Ctrl + Y' },
  { icon: 'bold', label: 'Bold', shortcut: 'Ctrl + B', separated: true },
  { icon: 'italic', label: 'Italic', shortcut: 'Ctrl + I' },
  { icon: 'underline', label: 'Underline', shortcut: 'Ctrl + U' },
  { icon: 'list', label: 'Bulleted list', separated: true },
  { icon: 'quote', label: 'Block quote' },
  { icon: 'link', label: 'Insert link', shortcut: 'Ctrl + K' },
  { icon: 'image', label: 'Insert image' },
];

export const EditorToolbar: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The textbook case for tooltips: a toolbar of icon-only buttons where the tooltip carries the name of the action and its shortcut. `show-delay` is what keeps a sweep across the row from flashing nine tooltips - only the button the pointer settles on opens one - and `hide-delay="0"` closes it the moment the pointer leaves. Tab through the toolbar to see the same hints on keyboard focus, which the default `focusin`/`focusout` triggers handle.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="scenario">
      <div class="toolbar">
        ${toolbarActions.map(
          ({ icon, label, shortcut, separated }) => html`
            ${separated ? html`<div class="separator"></div>` : nothing}

            <igc-icon-button
              id="toolbar-${icon}"
              variant="flat"
              name=${icon}
              aria-label=${label}
            ></igc-icon-button>

            <igc-tooltip
              anchor="toolbar-${icon}"
              placement="top"
              show-delay="500"
              hide-delay="0"
              with-arrow
            >
              <div class="shortcut">
                ${label}${shortcut ? html`<kbd>${shortcut}</kbd>` : nothing}
              </div>
            </igc-tooltip>
          `
        )}
      </div>

      <div
        class="editor"
        contenteditable="true"
        role="textbox"
        aria-label="Post body"
      >
        Draft your post here.
      </div>
    </div>
  `,
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const passwordRules = [
  'At least 12 characters',
  'An uppercase and a lowercase letter',
  'A number',
  'A symbol such as ! or #',
];

export const FormFieldHelp: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Two jobs a form gives a tooltip. The password field carries a help icon whose tooltip is projected markup - a heading and a list - rather than a `message` string. The email field validates on `igcChange` and calls `show()` to surface the error without waiting for a hover, then `hide()` once the value is valid; both methods bypass the delays and stay silent, so they will not fire `igcOpening`/`igcClosing`.',
      },
    },
  },
  render: () => {
    const emailTooltip = createRef<IgcTooltipComponent>();
    const emailStatus = createRef<IgcIconButtonComponent>();

    function validateEmail({ detail }: CustomEvent<string>) {
      const valid = !detail || emailPattern.test(detail);
      const tooltip = emailTooltip.value;
      const status = emailStatus.value;

      if (!tooltip || !status) return;

      status.name = valid ? 'info' : 'error';
      status.classList.toggle('error', !valid);
      tooltip.message = valid
        ? 'Receipts and password resets are sent here.'
        : `"${detail}" is missing an @ or a domain.`;

      valid ? tooltip.hide() : tooltip.show();
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <h4>Create your account</h4>

        <div class="field">
          <igc-input
            label="Work email"
            type="email"
            value="alex.rivera@contoso"
            @igcChange=${validateEmail}
          ></igc-input>

          <igc-icon-button
            ${ref(emailStatus)}
            id="email-status"
            variant="flat"
            name="info"
            aria-label="About the email address"
          ></igc-icon-button>
        </div>

        <div class="field">
          <igc-input label="Password" type="password"></igc-input>

          <igc-icon-button
            id="password-help"
            variant="flat"
            name="help"
            aria-label="Password requirements"
          ></igc-icon-button>
        </div>
      </div>

      <igc-tooltip
        ${ref(emailTooltip)}
        anchor="email-status"
        placement="right"
        message="Receipts and password resets are sent here."
        with-arrow
      ></igc-tooltip>

      <igc-tooltip anchor="password-help" placement="right" with-arrow>
        <div class="tip">
          <strong>Your password needs</strong>
          <ul>
            ${passwordRules.map((rule) => html`<li>${rule}</li>`)}
          </ul>
        </div>
      </igc-tooltip>
    `;
  },
};

type Deployment = {
  service: string;
  message: string;
  author: string;
  status: string;
};

const deployments: Deployment[] = [
  {
    service: 'checkout-api',
    message:
      'Retry payment webhooks with an exponential backoff and move the exhausted ones to a dead letter queue',
    author: 'Alex Rivera',
    status: 'Succeeded',
  },
  {
    service: 'search-indexer',
    message:
      'Reindex the catalogue in batches of 5000 documents so a failed shard no longer restarts the whole run',
    author: 'Mira Kovacs',
    status: 'Running',
  },
  {
    service: 'billing-worker',
    message: 'Drop the unused invoice_pdf column',
    author: 'Tom Larsen',
    status: 'Succeeded',
  },
  {
    service: 'notifications',
    message:
      'Collapse the per-device fan-out into a single push job and cap the nightly digest at 200 items',
    author: 'Alex Rivera',
    status: 'Failed',
  },
];

export const TableCells: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A deployment log where the commit messages are clipped to the column width. One tooltip instance serves every row: `show(target)` moves it to the cell under the pointer as a transient anchor, which is what keeps a table of a thousand rows from creating a thousand tooltips. The cell is measured first, so only text that is actually cut off gets a tooltip - a hint that repeats what is already on screen is just noise.',
      },
    },
  },
  render: () => {
    const tooltip = createRef<IgcTooltipComponent>();
    let activeCell: HTMLElement | undefined;

    function onPointerOver(event: PointerEvent) {
      const cell = (event.target as HTMLElement).closest<HTMLElement>(
        '.truncate'
      );

      if (!tooltip.value || cell === activeCell) {
        return;
      }

      activeCell = cell ?? undefined;

      // Nothing is clipped, so the tooltip would only repeat the cell
      if (!cell || cell.scrollWidth <= cell.clientWidth) {
        tooltip.value.hide();
        return;
      }

      tooltip.value.message = cell.textContent?.trim() ?? '';
      tooltip.value.show(cell);
    }

    function onPointerLeave() {
      activeCell = undefined;
      tooltip.value?.hide();
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <p>Hover a commit message. The short one is left alone.</p>

        <table @pointerover=${onPointerOver} @pointerleave=${onPointerLeave}>
          <thead>
            <tr>
              <th style="width: 9rem">Service</th>
              <th>Commit</th>
              <th style="width: 7rem">Status</th>
            </tr>
          </thead>
          <tbody>
            ${deployments.map(
              ({ service, message, author, status }) => html`
                <tr>
                  <td>${service}</td>
                  <td class="truncate">${message}</td>
                  <td class="truncate">${status} - ${author}</td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>

      <igc-tooltip
        ${ref(tooltip)}
        placement="top"
        show-delay="0"
        with-arrow
      ></igc-tooltip>
    `;
  },
};

type Person = {
  id: string;
  initials: string;
  name: string;
  role: string;
  email: string;
};

const people: Person[] = [
  {
    id: 'mira',
    initials: 'MK',
    name: 'Mira Kovacs',
    role: 'Staff engineer - Search',
    email: 'mira.kovacs@contoso.com',
  },
  {
    id: 'tom',
    initials: 'TL',
    name: 'Tom Larsen',
    role: 'Product design',
    email: 'tom.larsen@contoso.com',
  },
];

function userCard({ id, initials, name, role, email }: Person) {
  return html`
    <igc-tooltip
      class="card"
      anchor="mention-${id}"
      placement="bottom-start"
      hide-delay="400"
      with-arrow
    >
      <div class="user">
        <igc-avatar initials=${initials} shape="circle"></igc-avatar>
        <strong>${name}</strong>
        <small>${role}</small>

        <div class="user-actions">
          <igc-button variant="outlined" href="mailto:${email}">
            <igc-icon slot="prefix" name="mail"></igc-icon>
            ${email}
          </igc-button>
        </div>
      </div>
    </igc-tooltip>
  `;
}

export const UserHoverCard: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The hover card behind an @mention. While it is open the tooltip listens for the pointer on itself, so a `hide-delay` long enough to cross the gap turns it into a surface the user can actually reach - the mail button inside stays clickable. Rich content replaces `message`, and the width is capped through `::part(base)` since the `simple-text` cap only applies to plain messages.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="scenario">
      <div class="thread">
        <div class="comment">
          <igc-avatar initials="AR" shape="circle"></igc-avatar>
          <div>
            <small>Alex Rivera - 2 hours ago</small>
            <p>
              The indexer rewrite is ready for review -
              <span class="mention" id="mention-mira" tabindex="0"
                >@mira.kovacs</span
              >
              wrote the batching.
            </p>
          </div>
        </div>

        <div class="comment">
          <igc-avatar initials="MK" shape="circle"></igc-avatar>
          <div>
            <small>Mira Kovacs - an hour ago</small>
            <p>
              Ship it.
              <span class="mention" id="mention-tom" tabindex="0"
                >@tom.larsen</span
              >
              still owes us the empty state copy.
            </p>
          </div>
        </div>
      </div>
    </div>

    ${people.map(userCard)}
  `,
};

export const StickyCoachMark: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'A coach mark pointing at a button that moved. `sticky` keeps the tooltip up until it is dismissed - hide triggers are ignored, the close button appears, and the role switches to `status` so the announcement is not tied to the anchor. Escape closes it as well. Its triggers are cleared so nothing but code reopens it, which is what a one-off announcement wants; the default close button is replaced through the `close-button` slot.',
      },
    },
  },
  render: () => {
    const tooltip = createRef<IgcTooltipComponent>();

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="app-bar">
          <strong>Reports</strong>
          <igc-icon-button
            id="insights"
            variant="flat"
            name="trending_up"
            aria-label="Insights"
          ></igc-icon-button>
        </div>

        <div>
          <igc-button variant="outlined" @click=${() => tooltip.value?.show()}>
            Replay the announcement
          </igc-button>
        </div>
      </div>

      <igc-tooltip
        ${ref(tooltip)}
        anchor="insights"
        placement="bottom-end"
        show-triggers=""
        hide-triggers=""
        open
        sticky
        with-arrow
      >
        <div class="tip">
          <strong>Insights moved up here</strong>
          <p>
            The trends that used to live at the bottom of the sidebar now open
            from this button.
          </p>
          <div>
            <igc-button variant="flat" @click=${() => tooltip.value?.hide()}>
              Got it
            </igc-button>
          </div>
        </div>

        <igc-icon-button
          slot="close-button"
          variant="flat"
          collection="internal"
          name="close"
          aria-label="Dismiss"
        ></igc-icon-button>
      </igc-tooltip>
    `;
  },
};

function copyKey(event: Event) {
  const key = (event.currentTarget as HTMLElement).dataset.key ?? '';
  navigator.clipboard?.writeText(key).catch(() => undefined);
}

export const Triggers: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Any DOM event can open or close a tooltip - `show-triggers` and `hide-triggers` take a comma separated list of event names, custom events included. Listing the same event in both sets turns the tooltip into a toggle, and clearing a set leaves that direction to `show()`/`hide()`.',
      },
    },
  },
  render: () => html`
    ${scenarioStyles}
    <div class="cards">
      <igc-card>
        <igc-card-header>
          <h4 slot="title">Confirming an action</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            <code>show-triggers="click"</code> turns the tooltip into the
            receipt for a click. Hover alone does nothing here; the confirmation
            clears when the pointer leaves.
          </p>

          <div>
            <igc-button
              id="triggers-copy"
              data-key="demo-9f2c-4b71-a0e3"
              @click=${copyKey}
            >
              <igc-icon slot="prefix" name="copy"></igc-icon>
              Copy API key
            </igc-button>
          </div>

          <igc-tooltip
            anchor="triggers-copy"
            placement="top"
            show-triggers="click"
            hide-triggers="pointerleave,focusout"
            show-delay="0"
            with-arrow
          >
            Copied to your clipboard
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">One event, both directions</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            The same trigger in both sets toggles the tooltip, which is how an
            info affordance behaves on touch - where there is no hover to leave.
          </p>

          <div>
            <igc-icon-button
              id="triggers-toggle"
              variant="flat"
              name="info"
              aria-label="About seat billing"
            ></igc-icon-button>
          </div>

          <igc-tooltip
            anchor="triggers-toggle"
            placement="right"
            show-triggers="click"
            hide-triggers="click"
            show-delay="0"
            with-arrow
          >
            <div class="tip">
              Seats are billed for the whole month, whenever they were added.
            </div>
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Component events</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            Triggers are not limited to native events. This tooltip opens on the
            input's <strong>igcChange</strong> - type a name and blur the field
            to commit it.
          </p>

          <igc-input id="triggers-custom" label="Display name"></igc-input>

          <igc-tooltip
            anchor="triggers-custom"
            placement="bottom-start"
            show-triggers="igcChange"
            hide-triggers="igcInput,pointerleave"
            show-delay="0"
            with-arrow
          >
            Saved to your profile
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Keyboard</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            A keyboard-driven hint: the tooltip opens on the first
            <strong>keydown</strong> in the field and stays until the field is
            left.
          </p>

          <igc-input id="triggers-keyboard" label="Search issues"></igc-input>

          <igc-tooltip
            anchor="triggers-keyboard"
            placement="bottom-start"
            show-triggers="keydown"
            hide-triggers="focusout"
            show-delay="0"
            with-arrow
          >
            <div class="shortcut">
              Press<kbd>Enter</kbd>to search, <kbd>Esc</kbd>to clear
            </div>
          </igc-tooltip>
        </igc-card-content>
      </igc-card>
    </div>
  `,
};

export const CancelingEvents: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The open and close transitions are announced before they run and can be called off: `igcOpening` and `igcClosing` are cancelable, `igcOpened` and `igcClosed` report the finished animation. Here a user preference cancels every opening, which suppresses the hints without unbinding a single tooltip. Note that `show()`, `hide()` and `toggle()` are silent by design - they neither emit nor can be canceled.',
      },
    },
  },
  render: () => {
    const log = createRef<HTMLElement>();
    let hintsEnabled = true;

    function report(message: string) {
      if (log.value) {
        log.value.textContent = message;
      }
    }

    function onOpening(event: Event) {
      if (!hintsEnabled) {
        event.preventDefault();
        report('igcOpening canceled - help tips are off');
      }
    }

    function togglePreference({
      detail,
    }: CustomEvent<IgcCheckboxChangeEventArgs>) {
      hintsEnabled = detail.checked;
      report(`Help tips are ${hintsEnabled ? 'on' : 'off'}`);
    }

    return html`
      ${scenarioStyles}
      <div class="scenario">
        <div class="settings-row">
          <div>
            <div><strong>Show help tips</strong></div>
            <small>Hover hints on the fields of this page.</small>
          </div>

          <igc-switch checked @igcChange=${togglePreference}></igc-switch>
        </div>

        <div class="field">
          <igc-input id="hint-anchor" label="Retention window"></igc-input>
        </div>

        <p class="log" ${ref(log)}>Help tips are on</p>
      </div>

      <igc-tooltip
        anchor="hint-anchor"
        placement="right"
        message="Events older than this are deleted every night."
        with-arrow
        @igcOpening=${onOpening}
        @igcOpened=${() => report('igcOpened')}
        @igcClosing=${() => report('igcClosing')}
        @igcClosed=${() => report('igcClosed')}
      ></igc-tooltip>
    `;
  },
};

export const InScrollingPanel: Story = {
  args: {
    message: 'Publishes the draft and notifies the reviewers.',
    sticky: true,
    withArrow: true,
    scrollStrategy: 'close',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A tooltip has its anchor inside a scrolling panel. With the default triggers the tooltip hides when the pointer leaves the anchor. This story sets `sticky`, so the tooltip stays open and you can compare the strategies. The `scroll-strategy` property sets what happens to the tooltip when the panel scrolls. If the value is `hide`, the tooltip hides while the anchor is out of view. `hide` is the default value. If the value is `scroll`, the tooltip follows the anchor. If the value is `close`, the tooltip closes on each scroll. It also closes a sticky tooltip. The Escape key behaves the same way.',
      },
    },
  },
  render: ({ message, sticky, withArrow, placement, scrollStrategy }) => html`
    <style>
      .panel {
        max-width: 46rem;
        height: 16rem;
        overflow: auto;
        padding: 1rem;
        border: 1px solid var(--ig-gray-200, #e0e0e0);
        border-radius: 4px;
      }
    </style>

    <div class="panel">
      <h4>Review queue</h4>
      <p>
        Show the tooltip, then scroll this panel to compare the scroll
        strategies.
      </p>

      <igc-button id="scrolling-panel-anchor">Publish</igc-button>
      <igc-tooltip
        anchor="scrolling-panel-anchor"
        .message=${message}
        .sticky=${sticky}
        .withArrow=${withArrow}
        .placement=${placement}
        .scrollStrategy=${scrollStrategy}
      ></igc-tooltip>

      <p>
        ${Array.from(range(1, 24)).map(
          () => html`Drafts wait for two approvals before publishing. `
        )}
      </p>
    </div>
  `,
};
