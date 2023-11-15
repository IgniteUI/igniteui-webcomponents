import { github, whiteHouse1 } from '@igniteui/material-icons-extended';
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { range } from 'lit/directives/range.js';

import {
  IgcButtonComponent,
  IgcDropdownComponent,
  IgcIconComponent,
  IgcInputComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

const icons = [github, whiteHouse1];

icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

defineComponents(
  IgcDropdownComponent,
  IgcInputComponent,
  IgcButtonComponent,
  IgcIconComponent
);

// region default
const metadata: Meta<IgcDropdownComponent> = {
  title: 'Dropdown',
  component: 'igc-dropdown',
  parameters: {
    docs: { description: { component: 'Represents a DropDown component.' } },
    actions: {
      handles: [
        'igcChange',
        'igcOpening',
        'igcOpened',
        'igcClosing',
        'igcClosed',
      ],
    },
  },
  argTypes: {
    keepOpenOnSelect: {
      type: 'boolean',
      description: 'Whether the dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    placement: {
      type: '"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',
      description:
        'The preferred placement of the component around the target element.',
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
      table: { defaultValue: { summary: 'bottom-start' } },
    },
    positionStrategy: {
      type: '"absolute" | "fixed"',
      description: "Sets the component's positioning strategy.",
      options: ['absolute', 'fixed'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'absolute' } },
    },
    scrollStrategy: {
      type: '"scroll" | "block" | "close"',
      description:
        'Determines the behavior of the component during scrolling the container.',
      options: ['scroll', 'block', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'scroll' } },
    },
    flip: {
      type: 'boolean',
      description:
        "Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.\nWhen true, once enough space is detected on its preferred side, it will flip back.",
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    distance: {
      type: 'number',
      description: 'The distance from the target element.',
      control: 'number',
      table: { defaultValue: { summary: 0 } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the dropdown's width should be the same as the target's one.",
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    keepOpenOnSelect: false,
    open: false,
    placement: 'bottom-start',
    positionStrategy: 'absolute',
    scrollStrategy: 'scroll',
    flip: false,
    distance: 0,
    keepOpenOnOutsideClick: false,
    sameWidth: false,
  },
};

export default metadata;

interface IgcDropdownArgs {
  /** Whether the dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Sets the open state of the component. */
  open: boolean;
  /** The preferred placement of the component around the target element. */
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
  /** Sets the component's positioning strategy. */
  positionStrategy: 'absolute' | 'fixed';
  /** Determines the behavior of the component during scrolling the container. */
  scrollStrategy: 'scroll' | 'block' | 'close';
  /**
   * Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.
   * When true, once enough space is detected on its preferred side, it will flip back.
   */
  flip: boolean;
  /** The distance from the target element. */
  distance: number;
  /** Whether the component should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Whether the dropdown's width should be the same as the target's one. */
  sameWidth: boolean;
}
type Story = StoryObj<IgcDropdownArgs>;

// endregion

const Items = [
  'Specification',
  'Implementation',
  'Testing',
  'Samples',
  'Documentation',
  'Builds',
];

const overflows = Array.from(range(1, 51));

export const Basic: Story = {
  render: ({
    distance,
    open,
    flip,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    placement,
    positionStrategy,
    sameWidth,
  }) => html`
    <style>
      .dropdown-container {
        display: flex;
        gap: 2rem;
      }

      #dropdown-groups::part(base) {
        max-height: 350px;
      }

      #overflowing::part(base) {
        max-height: 350px;
      }
    </style>
    <div class="dropdown-container">
      <igc-dropdown
        id="dropdown"
        ?open=${open}
        ?flip=${flip}
        ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
        ?keep-open-on-select=${keepOpenOnSelect}
        ?same-width=${sameWidth}
        .placement=${placement}
        .positionStrategy=${positionStrategy}
        .distance=${distance}
      >
        <igc-button slot="target">Default</igc-button>
        <igc-dropdown-header>Tasks</igc-dropdown-header>
        ${Items.map(
          (item, idx) =>
            html`<igc-dropdown-item ?selected=${idx >= 3}
              >${item}</igc-dropdown-item
            >`
        )}
      </igc-dropdown>

      <igc-dropdown
        id="overflowing"
        same-width
        ?open=${open}
        ?flip=${flip}
        ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
        ?keep-open-on-select=${keepOpenOnSelect}
        .placement=${placement}
        .positionStrategy=${positionStrategy}
        .distance=${distance}
      >
        <igc-button slot="target">With vertical overflow</igc-button>
        <igc-dropdown-header>Tasks</igc-dropdown-header>
        ${overflows.map(
          (i) => html`<igc-dropdown-item>Item ${i}</igc-dropdown-item>`
        )}
      </igc-dropdown>

      <igc-dropdown id="dropdown-groups">
        <igc-button slot="target">Groups</igc-button>
        <igc-dropdown-item>HTML</igc-dropdown-item>
        <igc-dropdown-item>CSS</igc-dropdown-item>
        <hr />
        <igc-dropdown-group>
          <span slot="label">Interpreted</span>
          <igc-dropdown-item>JavaScript</igc-dropdown-item>
          <igc-dropdown-item>Python</igc-dropdown-item>
          <igc-dropdown-item>Lua</igc-dropdown-item>
        </igc-dropdown-group>
        <igc-dropdown-group>
          <span slot="label">Compiled</span>
          <igc-dropdown-item>Rust</igc-dropdown-item>
          <igc-dropdown-item>Go</igc-dropdown-item>
          <igc-dropdown-item>C/C++</igc-dropdown-item>
        </igc-dropdown-group>
        <hr />
        <igc-dropdown-item>Markdown</igc-dropdown-item>
        <igc-dropdown-item>LaTEX</igc-dropdown-item>
      </igc-dropdown>
    </div>
  `,
};
