import type { Meta, StoryObj } from '@storybook/web-components';

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
      description: 'The offset of the tooltip from the anchor in pixels.',
      control: 'number',
      table: { defaultValue: { summary: '6' } },
    },
    placement: {
      type: 'IgcPlacement',
      description:
        'Where to place the floating element relative to the parent anchor element.',
      control: 'IgcPlacement',
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
    inline: false,
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
  /** Improves positioning for inline based elements, such as links. */
  inline: boolean;
  /** The offset of the tooltip from the anchor in pixels. */
  offset: number;
  /** Where to place the floating element relative to the parent anchor element. */
  placement: IgcPlacement;
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

    <igc-tooltip anchor="style-sheet-language" inline>
      <p inert>
        A <strong>style sheet language</strong>, or
        <strong>style language</strong>, is a computer language that expresses
        the presentation of structured documents. One attractive feature of
        structured documents is that the content can be reused in many contexts
        and presented in various ways. Different style sheets can be attached to
        the logical structure to produce different presentations.
      </p>
    </igc-tooltip>

    <igc-tooltip class="rich-tooltip" anchor="html" inline>
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

function getValue() {
  return document.querySelector('igc-input')?.value;
}

export const Triggers: Story = {
  render: (args) => html`
    <igc-button>Pointerenter/Pointerleave (default)</igc-button>
    <igc-tooltip ?sticky=${args.sticky}>
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
  tooltip.message = `I'm created on demand at ${new Date().toLocaleTimeString()}`;
  tooltip.anchor = 'dynamic-target';
  tooltip.showTriggers = 'focus, click';
  tooltip.hideTriggers = 'blur';
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
    const tooltipId = 'shared-tooltip';

    setTimeout(() => {
      const tooltip = document.getElementById(tooltipId) as any;
      const elementTooltip = document.querySelector(
        'igc-tooltip:not([id])'
      ) as any;
      const elementButton = document.getElementById('elementButton');

      // Set anchor for second tooltip dynamically
      if (elementTooltip && elementButton) {
        elementTooltip.anchor = elementButton;
        elementTooltip.show();
      }

      document.querySelectorAll('.tooltip-trigger').forEach((btn) => {
        btn.addEventListener('click', async () => {
          tooltip.show(btn);
        });
      });
    });

    return html`
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
        <igc-button id="first">Default Anchor</igc-button>
        <igc-button class="tooltip-trigger">Transient 1</igc-button>
        <igc-button class="tooltip-trigger">Transient 2</igc-button>
        <igc-button id="elementButton">Element Anchor</igc-button>
      </div>

      <igc-tooltip
        anchor="first"
        id="shared-tooltip"
        placement="top"
        ?sticky=${true}
      >
        This is a shared tooltip!
      </igc-tooltip>

      <igc-tooltip
        message="This is a tooltip with an element anchor"
      ></igc-tooltip>
    `;
  },
};
