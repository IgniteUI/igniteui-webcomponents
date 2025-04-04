import type { Meta, StoryObj } from '@storybook/web-components';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcTooltipComponent,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { html } from 'lit';

defineComponents(
  IgcButtonComponent,
  IgcInputComponent,
  IgcTooltipComponent,
  IgcCardComponent,
  IgcAvatarComponent,
  IgcIconComponent
);

// region default
const metadata: Meta<IgcTooltipComponent> = {
  title: 'Tooltip',
  component: 'igc-tooltip',
  parameters: {
    docs: { description: { component: '' } },
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
    disableArrow: {
      type: 'boolean',
      description:
        'Whether to disable the rendering of the arrow indicator for the tooltip.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    inline: {
      type: 'boolean',
      description:
        'Improves positioning for inline based elements, such as links.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    offset: {
      type: 'number',
      description: 'The offset of the tooltip from the anchor.',
      control: 'number',
      table: { defaultValue: { summary: '6' } },
    },
    placement: {
      type: '"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',
      description:
        'Where to place the floating element relative to the parent anchor element.',
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
      table: { defaultValue: { summary: 'top' } },
    },
    anchor: {
      type: 'Element | string',
      description:
        'An element instance or an IDREF to use as the anchor for the tooltip.',
      options: ['Element', 'string'],
      control: { type: 'inline-radio' },
    },
    showTriggers: {
      type: 'string',
      description:
        'Which event triggers will show the tooltip.\nExpects a comma separate string of different event triggers.',
      control: 'text',
    },
    hideTriggers: {
      type: 'string',
      description:
        'Which event triggers will hide the tooltip.\nExpects a comma separate string of different event triggers.',
      control: 'text',
    },
    showDelay: {
      type: 'number',
      description:
        'Specifies the number of milliseconds that should pass before showing the tooltip.',
      control: 'number',
    },
    hideDelay: {
      type: 'number',
      description:
        'Specifies the number of milliseconds that should pass before hiding the tooltip.',
      control: 'number',
    },
    message: {
      type: 'string',
      description: 'Specifies a plain text as tooltip content.',
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
    disableArrow: false,
    inline: false,
    offset: 6,
    placement: 'top',
    message: '',
    sticky: false,
    showDelay: 200,
    hideDelay: 300,
    showTriggers: 'pointerenter',
    hideTriggers: 'pointerleave',
  },
};

export default metadata;

interface IgcTooltipArgs {
  /** Whether the tooltip is showing. */
  open: boolean;
  /** Whether to disable the rendering of the arrow indicator for the tooltip. */
  disableArrow: boolean;
  /** Improves positioning for inline based elements, such as links. */
  inline: boolean;
  /** The offset of the tooltip from the anchor. */
  offset: number;
  /** Where to place the floating element relative to the parent anchor element. */
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
  /** An element instance or an IDREF to use as the anchor for the tooltip. */
  anchor: Element | string;
  /**
   * Which event triggers will show the tooltip.
   * Expects a comma separate string of different event triggers.
   */
  showTriggers: string;
  /**
   * Which event triggers will hide the tooltip.
   * Expects a comma separate string of different event triggers.
   */
  hideTriggers: string;
  /** Specifies the number of milliseconds that should pass before showing the tooltip. */
  showDelay: number;
  /** Specifies the number of milliseconds that should pass before hiding the tooltip. */
  hideDelay: number;
  /** Specifies a plain text as tooltip content. */
  message: string;
  /** Specifies if the tooltip remains visible until the user closes it via the close button or Esc key. */
  sticky: boolean;
}
type Story = StoryObj<IgcTooltipArgs>;

// endregion

registerIcon(
  'home',
  'https://unpkg.com/material-design-icons@3.0.1/action/svg/production/ic_home_24px.svg'
);

export const Basic: Story = {
  render: (args) => html`
    <igc-tooltip anchor="kek" ?open=${args.open}>
      With an IDREF reference...
    </igc-tooltip>

    <igc-button>Focus me</igc-button>

    <igc-tooltip ?open=${args.open} show-triggers="focus" hide-triggers="blur">
      I will be shown until you blur the button above. Some super long text that
      never ends.
      <igc-icon name="home"></igc-icon>
    </igc-tooltip>

    <igc-input label="Password" required minlength="12"></igc-input>
    <igc-tooltip
      .showDelay=${args.showDelay}
      .hideDelay=${args.hideDelay}
      placement="bottom-end"
      offset="-4"
      disable-arrow
      ?open=${args.open}
      >Minimum of 12 characters</igc-tooltip
    >

    <div style="margin: 50px 50%;">
      <igc-button id="kek">TOP KEK</igc-button>
      <igc-tooltip placement="bottom-start" open
        >Initial open state</igc-tooltip
      >
      <igc-tooltip placement="right" anchor="kek">Right Tooltip</igc-tooltip>
      <igc-tooltip placement="left" anchor="kek">Left Tooltip</igc-tooltip>
    </div>

    <p>
      Here is some text with a
      <strong>element</strong>
      <igc-tooltip inline>😎</igc-tooltip>
      that has a tooltip.
    </p>

    <igc-tooltip anchor="build-info" inline>
      <igc-card>
        <div style="display:flex; flex-direction:row">
          <div>
            <igc-card-header>
              <igc-avatar
                slot="thumbnail"
                shape="rounded"
                src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
              >
              </igc-avatar>
              <h3 slot="title">HERE</h3>
              <h5 slot="subtitle">By Mellow D</h5>
            </igc-card-header>
            <igc-card-content>
              <p>
                Far far away, behind the word mountains, far from the countries
                Vokalia and Consonantia, there live the blind texts.
              </p>
            </igc-card-content>
            <igc-card-actions>
              <igc-button slot="start">PLAY ALBUM</igc-button>
              <igc-tooltip placement="right-start">
                <p>Look mom, tooltip inception!</p>
                <igc-tooltip placement="right-start">
                  <p>I can't stop...</p>
                  <igc-tooltip placement="right-start"> HELP! </igc-tooltip>
                </igc-tooltip>
              </igc-tooltip>
            </igc-card-actions>
          </div>
          <igc-card-media style="max-width: 96px">
            <img
              src="https://www.infragistics.com/angular-demos/assets/images/card/media/here_media.jpg"
            />
          </igc-card-media>
        </div>
      </igc-card>
    </igc-tooltip>
    <p><a id="build-info" href="#">Hover</a> for more!</p>

    <igc-input label="Change me"></igc-input>
    <igc-tooltip show-triggers="igcChange"
      >Congrats you've changed the value!</igc-tooltip
    >
  `,
};

function getValue() {
  return document.querySelector('igc-input')?.value;
}

export const Triggers: Story = {
  render: () => html`
    <igc-button>Pointerenter/Pointerleave (default)</igc-button>
    <igc-tooltip>
      I will show on pointerenter and hide on pointerleave
    </igc-tooltip>

    <igc-button> Focus/Blur </igc-button>
    <igc-tooltip show-triggers="focus" hide-triggers="blur">
      I will show on focus and hide on blur
    </igc-tooltip>

    <igc-button>Click</igc-button>
    <igc-tooltip show-triggers="click" hide-triggers="pointerleave,blur">
      I will show on click and hide on pointerleave or blur
    </igc-tooltip>

    <igc-button>Keydown</igc-button>
    <igc-tooltip show-triggers="keydown" hide-triggers="blur">
      I will show on keydown and hide on blur
    </igc-tooltip>

    <igc-input label="Change my value"></igc-input>
    <igc-tooltip show-triggers="igcChange">
      You've changed the value to ${getValue()}
    </igc-tooltip>
  `,
};

export const Toggle: Story = {
  render: (args) => {
    const tooltipId = 'toggle-tooltip';
    const buttonIdToggler = 'toggler-button';

    // Hook into the rendered DOM to attach click listener
    setTimeout(() => {
      const tooltip = document.getElementById(tooltipId) as IgcTooltipComponent;
      const button = document.getElementById(
        buttonIdToggler
      ) as HTMLButtonElement;

      if (tooltip && button) {
        button.addEventListener('click', () => tooltip.toggle());
      }
    });

    return html`
      <igc-button id=${buttonIdToggler}>Toggle</igc-button>
      <igc-button id="toggle-button">Toggle Tooltip</igc-button>
      <igc-tooltip
        id=${tooltipId}
        placement=${args.placement || 'bottom'}
        .disableArrow=${args.disableArrow}
        .showDelay=${args.showDelay}
        .hideDelay=${args.hideDelay}
        message=${args.message || 'Simple tooltip content'}
        show-triggers=${args.showTriggers}
        hide-triggers=${args.hideTriggers}
      >
        This tooltip toggles on button click!
      </igc-tooltip>
    `;
  },
};

export const ReallyBasic: Story = {
  render: (args) => html`
    <style>
      .container {
        display: flex;
        justify-content: center;
        padding: 32px;
      }
    </style>
    <igc-button onclick="tooltip.show()">Show</igc-button>
    <igc-button onclick="tooltip.hide()">Hide</igc-button>
    <igc-button onclick="tooltip.toggle()">Toggle</igc-button>
    <div class="container">
      <igc-button id="target">Hover me</igc-button>
      <igc-tooltip
        id="tooltip"
        anchor="target"
        ?open=${args.open}
        ?disable-arrow=${args.disableArrow}
        ?inline=${args.inline}
        .offset=${args.offset}
        .placement=${args.placement}
        .showDelay=${args.showDelay}
        .hideDelay=${args.hideDelay}
        .message=${args.message}
        .showTriggers=${args.showTriggers}
        .hideTriggers=${args.hideTriggers}
        .sticky=${args.sticky}
      ></igc-tooltip>
    </div>
  `,
};
