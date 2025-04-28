import type { Meta, StoryObj } from '@storybook/web-components-vite';

import {
  IgcAvatarComponent,
  IgcButtonComponent,
  IgcCardComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcTooltipComponent,
  type PopoverPlacement,
  defineComponents,
  registerIcon,
} from 'igniteui-webcomponents';
import { html } from 'lit';
import { disableStoryControls } from './story.js';

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
    disableArrow: {
      type: 'boolean',
      description:
        'Whether to disable the rendering of the arrow indicator for the tooltip.',
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
      table: { defaultValue: { summary: 'pointerenter' } },
    },
    hideTriggers: {
      type: 'string',
      description:
        'Which event triggers will hide the tooltip.\nExpects a comma separate string of different event triggers.',
      control: 'text',
      table: { defaultValue: { summary: 'pointerleave, click' } },
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
    offset: 6,
    placement: 'top',
    showTriggers: 'pointerenter',
    hideTriggers: 'pointerleave, click',
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
  /** Whether to disable the rendering of the arrow indicator for the tooltip. */
  disableArrow: boolean;
  /** The offset of the tooltip from the anchor in pixels. */
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
    <div style="margin: 10dvh 5dvw">
      <igc-button id="basic-tooltip"> Hover over me </igc-button>
    </div>

    <igc-tooltip
      anchor="basic-tooltip"
      .disableArrow=${args.disableArrow}
      .offset=${args.offset}
      .hideDelay=${args.hideDelay}
      .showDelay=${args.showDelay}
      .placement=${args.placement}
      .open=${args.open}
      .sticky=${args.sticky}
      .showTriggers=${args.showTriggers}
      .hideTriggers=${args.hideTriggers}
    >
      Hello from the tooltip!
    </igc-tooltip>
  `,
};

const Positions = ['top', 'bottom', 'left', 'right'].flatMap((each) => [
  each,
  `${each}-start`,
  `${each}-end`,
]) as Array<PopoverPlacement & {}>;

export const Positioning: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => html`
    <style>
      #tooltip-position {
        align-content: center;
        margin: 25dvh 25dvw;
        width: 50dvw;
        height: 50dvh;
        background-color: var(--ig-primary-500);
        color: var(--ig-primary-500-contrast);
        box-shadow: var(--ig-elevation-2);
      }
    </style>

    <div id="tooltip-position">
      <h2 style="text-align: center">Supported placements</h2>
    </div>
    ${Positions.map(
      (pos) => html`
        <igc-tooltip anchor="tooltip-position" .placement=${pos}>
          <div>
            <strong>${pos}</strong>
          </div>
        </igc-tooltip>
      `
    )}
  `,
};

export const Inline: Story = {
  render: () => html`
    <style>
      .article {
        max-width: 35vmax;

        & img {
          object-fit: contain;
          width: 16rem;
          height: 16rem;
        }
      }

      .rich-tooltip::part(base) {
        max-width: 35vmax;
      }

      .rich {
        display: grid;
        grid-template-columns: 1fr 1fr;

        & img {
          object-fit: contain;
          width: 16rem;
          height: 9rem;
        }
      }
    </style>

    <div class="article">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Official_CSS_Logo.svg/1024px-Official_CSS_Logo.svg.png"
        alt="CSS Logo"
      />
      <p>
        <strong>Cascading Style Sheets (CSS)</strong> is a
        <a
          id="style-sheet-language"
          href="https://en.wikipedia.org/wiki/Style_sheet_language"
          >style sheet language</a
        >
        used for specifying the presentation and styling of a document written
        in a markup language such as
        <a id="html" href="https://en.wikipedia.org/wiki/HTML">HTML</a> or
        <a id="xml" href="https://en.wikipedia.org/wiki/XML">XML</a>
        (including XML dialects such as SVG, MathML or XHTML). CSS is a
        cornerstone technology of the World Wide Web, alongside HTML and
        JavaScript.
      </p>
    </div>

    <igc-tooltip class="rich-tooltip" anchor="xml">
      <div inert class="rich">
        <p>
          <strong>Extensible Markup Language (XML)</strong> is a markup language
          and file format for storing, transmitting, and reconstructing data. It
          defines a set of rules for encoding documents in a format that is both
          human-readable and machine-readable. The World Wide Web Consortium's
          XML 1.0 Specification of 1998 and several other related
          specifications—all of them free open standards—define XML.
        </p>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Extensible_Markup_Language_%28XML%29_logo.svg/1920px-Extensible_Markup_Language_%28XML%29_logo.svg.png"
          alt="XML Logo"
        />
      </div>
    </igc-tooltip>

    <igc-tooltip anchor="style-sheet-language">
      <p inert>
        A <strong>style sheet language</strong>, or
        <strong>style language</strong>, is a computer language that expresses
        the presentation of structured documents. One attractive feature of
        structured documents is that the content can be reused in many contexts
        and presented in various ways. Different style sheets can be attached to
        the logical structure to produce different presentations.
      </p>
    </igc-tooltip>

    <igc-tooltip class="rich-tooltip" anchor="html">
      <div inert class="rich">
        <p>
          Hypertext Markup Language (HTML) is the standard markup language for
          documents designed to be displayed in a web browser. It defines the
          content and structure of web content. It is often assisted by
          technologies such as Cascading Style Sheets (CSS) and scripting
          languages such as JavaScript, a programming language.
        </p>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/1024px-HTML5_logo_and_wordmark.svg.png"
          alt="HTML5 Logo"
        />
      </div>
    </igc-tooltip>
  `,
};

export const Triggers: Story = {
  render: () => html`
    <style>
      #triggers-container {
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
        gap: 1rem;

        & igc-card {
          max-width: 320px;
        }

        & igc-card-header {
          min-height: 5rem;
        }

        & igc-card-content {
          display: flex;
          height: 100%;
          flex-direction: column;
          gap: 0.5rem;
          justify-content: space-between;
        }
      }
    </style>
    <div id="triggers-container">
      <igc-card>
        <igc-card-header>
          <h4 slot="title">Default triggers</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            Hovering over the button bellow will show the default configuration
            of a tooltip component which is <strong>pointer enter</strong> for
            showing the tooltip and <strong>pointer leave</strong> or
            <strong>click</strong> for hiding once shown.
          </p>

          <igc-button id="triggers-default">Hover over me</igc-button>

          <igc-tooltip anchor="triggers-default">
            I am show on pointer enter and hidden on pointer leave and/or click.
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Focus based</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            In this instance, the tooltip is bound to show on its anchor
            <strong>focus</strong> and will hide when its anchor is
            <strong>blurred</strong>.
          </p>
          <p>Try to navigate with a Tab key to the anchor to see the effect.</p>

          <igc-button id="triggers-focus-blur">Focus me</igc-button>

          <igc-tooltip
            anchor="triggers-focus-blur"
            show-delay="0"
            hide-delay="0"
            show-triggers="focus"
            hide-triggers="blur"
          >
            I am shown on focus and hidden on blur.
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Same trigger(s) for showing and hiding</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            The same trigger can be bound to both show and hide the tooltip. The
            button below has its tooltip bound to show/hide on
            <strong>click</strong>.
          </p>

          <igc-button id="triggers-click">Click</igc-button>

          <igc-tooltip
            anchor="triggers-click"
            show-triggers="click"
            hide-triggers="click"
          >
            I am show on click and will hide on anchor click.
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Keyboard interactions</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            Keyboard interactions are also supported. The button below has its
            tooltip bound to show on a <strong>keypress</strong> and hide on a
            <strong>keypress</strong> or <strong>blur</strong>.
          </p>

          <p>Try it out by focusing the button and pressing a key.</p>

          <igc-button id="triggers-keypress">Press a key</igc-button>

          <igc-tooltip
            anchor="triggers-keypress"
            show-triggers="keypress"
            hide-triggers="keypress blur"
          >
            I am shown on a keypress and will hide on a keypress or blur.
          </igc-tooltip>
        </igc-card-content>
      </igc-card>

      <igc-card>
        <igc-card-header>
          <h4 slot="title">Custom events</h4>
        </igc-card-header>
        <igc-card-content>
          <p>
            The tooltip supports any DOM event including custom ones. Try typing
            a value in the input below and then "commit" it by blurring the
            input. The tooltip will be shown when the
            <strong>igcChange</strong> event is fired from the input.
          </p>

          <igc-input id="triggers-custom" label="Username"></igc-input>

          <igc-tooltip anchor="triggers-custom" show-triggers="igcChange">
            Value changed!
          </igc-tooltip>
        </igc-card-content>
      </igc-card>
    </div>
  `,
};

export const Default: Story = {
  render: () => html`
    <igc-button id="button">Hover over me</igc-button>
    <igc-tooltip anchor="button">
      <h1>Showing a tooltip!</h1>
    </igc-tooltip>
  `,
};

function createDynamicTooltip() {
  const tooltip = document.createElement('igc-tooltip');
  tooltip.message = `Created on demand at ${new Date().toLocaleTimeString()}`;
  tooltip.anchor = 'dynamic-target';
  tooltip.id = 'dynamic';

  const previousTooltip = document.querySelector('#dynamic');
  const target = document.querySelector('#dynamic-target')!;

  previousTooltip
    ? previousTooltip.replaceWith(tooltip)
    : target.after(tooltip);

  tooltip.show();
}

export const DynamicTooltip: Story = {
  render: () => html`
    <igc-button @click=${createDynamicTooltip}>Create tooltip</igc-button>
    <igc-button id="dynamic-target">Target of the dynamic tooltip</igc-button>
  `,
};

export const SharedTooltipMultipleAnchors: Story = {
  render: () => {
    return html`
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <igc-button id="first">Default Anchor</igc-button>
        <igc-button
          onpointerenter="sharedTooltip.show(transient1)"
          id="transient1"
          >Transient 1</igc-button
        >
        <igc-button
          onpointerenter="sharedTooltip.show(transient2)"
          id="transient2"
          >Transient 2</igc-button
        >
        <igc-button
          onpointerenter="sharedTooltip.show(transient3)"
          id="transient3"
          >Transient 3</igc-button
        >
        <igc-button onclick="sharedTooltip.anchor='transient1'"
          >Switch default anchor to be Transient 1</igc-button
        >
      </div>

      <igc-tooltip anchor="first" sticky id="sharedTooltip" placement="top">
        This is a shared tooltip!
      </igc-tooltip>
    `;
  },
};
