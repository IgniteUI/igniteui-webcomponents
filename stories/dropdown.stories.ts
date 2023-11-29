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
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the dropdown's width should be the same as the target's one.",
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on selection.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component dropdown should be kept open on clicking outside of it.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
  },
  args: {
    placement: 'bottom-start',
    positionStrategy: 'absolute',
    scrollStrategy: 'scroll',
    flip: false,
    distance: 0,
    sameWidth: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
  },
};

export default metadata;

interface IgcDropdownArgs {
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
  /** Whether the dropdown's width should be the same as the target's one. */
  sameWidth: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
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
].map(
  (each) => html`<igc-dropdown-item value=${each}>${each}</igc-dropdown-item>`
);

const overflowItems = Array.from(range(1, 51)).map(
  (each) =>
    html`<igc-dropdown-item value=${each}>Item ${each}</igc-dropdown-item>`
);

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
        ${Items}
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
        ${overflowItems}
      </igc-dropdown>
    </div>
  `,
};

const gdpEurope = [
  {
    country: 'Luxembourg',
    value: '135,605',
    flag: `https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Flag_of_Luxembourg.svg/23px-Flag_of_Luxembourg.svg.png`,
  },
  {
    country: 'Ireland',
    value: '112,248',
    flag: `https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/23px-Flag_of_Ireland.svg.png`,
  },
  {
    country: 'Switzerland',
    value: '102,865',
    flag: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Flag_of_Switzerland_%28Pantone%29.svg/15px-Flag_of_Switzerland_%28Pantone%29.svg.png`,
  },
].map(
  ({ country, flag, value }) =>
    html`<igc-dropdown-item value=${country}>
      <img slot="prefix" src=${flag} alt="Flag of ${country}" />
      ${country} ${value}
    </igc-dropdown-item>`
);

const gdpAmericas = [
  {
    country: 'United States',
    value: '80,412',
    flag: `https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/23px-Flag_of_the_United_States.svg.png`,
  },
  {
    country: 'Canada',
    value: '53,247',
    flag: `https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/23px-Flag_of_Canada_%28Pantone%29.svg.png`,
  },
  {
    country: 'Puerto Rico',
    value: '37,093',
    flag: `https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Flag_of_Puerto_Rico.svg/23px-Flag_of_Puerto_Rico.svg.png`,
  },
].map(
  ({ country, flag, value }) =>
    html`<igc-dropdown-item value=${country}>
      <img slot="prefix" src=${flag} alt="Flag of ${country}" />
      ${country} ${value}
    </igc-dropdown-item>`
);

export const GroupsAndHeaders: Story = {
  args: {
    sameWidth: true,
  },
  render: ({
    open,
    keepOpenOnOutsideClick,
    keepOpenOnSelect,
    distance,
    flip,
    placement,
    positionStrategy,
    sameWidth,
  }) => html`
    <style>
      igc-dropdown-header {
        text-align: start;
      }
      img {
        width: 23px;
        height: 12px;
      }
      .group-title {
        font-size: 0.75rem;
      }
    </style>
    <igc-dropdown
      id="groups-and-headers"
      ?open=${open}
      ?flip=${flip}
      ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
      ?keep-open-on-select=${keepOpenOnSelect}
      ?same-width=${sameWidth}
      .placement=${placement}
      .positionStrategy=${positionStrategy}
      .distance=${distance}
    >
      <igc-button slot="target"
        >GDP (in USD) per capita by country (IMF)</igc-button
      >

      <igc-dropdown-group>
        <p class="group-title" slot="label">
          UN Region: <strong>Europe</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        ${gdpEurope}
      </igc-dropdown-group>

      <igc-dropdown-group>
        <p slot="label" class="group-title">
          UN Region: <strong>Americas</strong>
        </p>
        <igc-dropdown-header>Estimate for 2023</igc-dropdown-header>
        ${gdpAmericas}
      </igc-dropdown-group>
    </igc-dropdown>
  `,
};

export const WithNonSlottedTarget: Story = {
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
      .container {
        display: flex;
        justify-content: space-between;
      }
    </style>
    <div class="container">
      <igc-button id="1st" onclick="dropdown.show('1st')">First</igc-button>
      <igc-button id="2nd" onclick="dropdown.show('2nd')">Second</igc-button>
      <igc-button id="3rd" onclick="dropdown.show('3rd')">Third</igc-button>
      <igc-button id="4th" onclick="dropdown.show('4th')">Fourth</igc-button>
    </div>
    <igc-input
      id="input"
      style="max-width: 15rem"
      label="Focus me"
      onfocus="dropdown.show('input')"
    ></igc-input>

    <igc-dropdown
      id="dropdown"
      .distance=${distance}
      ?open=${open}
      ?flip=${flip}
      ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
      ?keep-open-on-select=${keepOpenOnSelect}
      .placement=${placement}
      .positionStrategy=${positionStrategy}
      ?same-width=${sameWidth}
    >
      <igc-dropdown-item>1</igc-dropdown-item>
      <igc-dropdown-item>2</igc-dropdown-item>
      <igc-dropdown-item>3</igc-dropdown-item>
    </igc-dropdown>
  `,
};
