import { github, whiteHouse1 } from '@igniteui/material-icons-extended';
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import {
  IgcDropdownComponent,
  IgcDropdownItemComponent,
  IgcInputComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

const icons = [github, whiteHouse1];

icons.forEach((icon) => {
  registerIconFromText(icon.name, icon.value);
});

defineComponents(IgcDropdownComponent, IgcInputComponent);

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

const toggleDDL = (ev: Event, ddlId: string) => {
  const ddl = document.getElementById(ddlId) as IgcDropdownComponent;
  if (ddlId === 'ddl2') {
    const target = ev.target as HTMLElement;
    ddl.placement = target.id === 'ddlButton2' ? 'top-end' : 'bottom-start';
    ddl.toggle(ev.target as HTMLElement);
  } else {
    ev.stopPropagation();
    ddl.toggle();
  }
};

const items = [
  'Specification',
  'Implementation',
  'Testing',
  'Samples',
  'Documentation',
  'Builds',
];
const Template = ({
  open = false,
  flip = false,
  keepOpenOnOutsideClick = false,
  positionStrategy = 'absolute',
  placement = 'bottom-start',
  scrollStrategy = 'block',
  keepOpenOnSelect = false,
  sameWidth = false,
  distance = 0,
}: IgcDropdownArgs) => html`
  <div
    style="display: flex; align-items: flex-start; position: relative; height: 400px"
  >
    <igc-dropdown
      id="ddl1"
      ?open=${open}
      ?flip=${flip}
      ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
      placement=${placement}
      scroll-strategy=${scrollStrategy}
      distance=${distance}
      .sameWidth=${sameWidth}
      .positionStrategy=${positionStrategy}
      .keepOpenOnSelect=${keepOpenOnSelect}
    >
      <igc-button slot="target">Dropdown 1</igc-button>
      <igc-dropdown-header>Tasks</igc-dropdown-header>
      <!-- ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )} -->
      ${items
        .slice(0, 2)
        .map(
          (item) =>
            html`<igc-dropdown-item
              ><igc-icon slot="prefix" name="white-house-1"></igc-icon
              >${item}<igc-icon name="github" slot="suffix"></igc-icon
            ></igc-dropdown-item>`
        )}
      ${html`<igc-dropdown-item disabled
        ><igc-icon slot="prefix" name="white-house-1"></igc-icon
        >${items[2]}<igc-icon name="github" slot="suffix"></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item
        ><igc-icon slot="prefix" name="white-house-1"></igc-icon
        >${items[3]}<igc-icon name="github" slot="suffix"></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item
        ><igc-icon slot="prefix" name="white-house-1"></igc-icon
        >${items[4]}<igc-icon name="github" slot="suffix"></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item disabled
        ><igc-icon slot="prefix" name="white-house-1"></igc-icon
        >${items[5]}<igc-icon name="github" slot="suffix"></igc-icon
      ></igc-dropdown-item>`}
    </igc-dropdown>

    <div class="ig-scrollbar" style="display: flex;">
      <div style="position: absolute; right: 0px; top: 50px">
        <style>
          #ddl2::part(list) {
            height: 150px;
            width: 200px;
          }
        </style>
        <igc-button
          id="ddlButton"
          @click="${(ev: Event) => toggleDDL(ev, 'ddl2')}"
          >Dropdown 2.1</igc-button
        >
        <igc-button
          id="ddlButton2"
          @click="${(ev: Event) => toggleDDL(ev, 'ddl2')}"
          >Dropdown 2.2</igc-button
        >
        <igc-dropdown
          id="ddl2"
          .open=${open}
          .flip=${flip}
          .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
          .placement=${placement}
          .scrollStrategy=${scrollStrategy}
          .sameWidth=${sameWidth}
          .positionStrategy=${positionStrategy}
        >
          <igc-dropdown-group>
            <h3 slot="label">Research & Development</h3>
            ${items
              .slice(0, 3)
              .map(
                (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
              )}
          </igc-dropdown-group>
          <igc-dropdown-group>
            <h3 slot="label">Product Guidance</h3>
            ${items
              .slice(3, 5)
              .map(
                (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
              )}
          </igc-dropdown-group>
          <igc-dropdown-group>
            <h3 slot="label">Release Engineering</h3>
            <igc-dropdown-item
              ><igc-icon slot="prefix" name="home"></igc-icon>${items[5]}<span
                slot="suffix"
                >-</span
              ></igc-dropdown-item
            >
          </igc-dropdown-group>
        </igc-dropdown>
      </div>
    </div>

    <igc-dropdown
      id="ddl3"
      style="align-self: center;"
      distance=${distance}
      .open=${open}
      .flip=${flip}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
      .positionStrategy=${positionStrategy}
    >
      <igc-button slot="target">Dropdown 3</igc-button>
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>

    <igc-dropdown
      style="position: absolute; bottom: 10px; left: 0px"
      id="ddl4"
      .open=${open}
      .flip=${flip}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
      .positionStrategy=${positionStrategy}
    >
      <input
        type="button"
        slot="target"
        style="width: 150px"
        value="Dropdown 4"
      />
      <!-- ${items.slice(0, 5).map((item) => html`<h4>${item}</h4>`)} -->
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
    <igc-dropdown
      style="position: fixed; bottom: 0px; right: 0px"
      id="ddl5"
      .open=${open}
      .flip=${true}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .positionStrategy=${positionStrategy}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
    >
      <input slot="target" style="width: 150px" />
      <!-- ${items.slice(0, 5).map((item) => html`<h4>${item}</h4>`)} -->
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
  </div>
`;

const FormTemplate = () => checkoutForm;
const countries = [
  'Bulgaria',
  'United Kingdom',
  'USA',
  'Canada',
  'Japan',
  'India',
];
const scrollStrategy = 'block';
const checkoutForm = html`
  <!-- <div> -->
  <igc-form>
    <div>
      <igc-dropdown
        id="ddlCountry"
        @igcChange=${(_ev: CustomEvent) => {
          (document.getElementById('txtCountry') as IgcInputComponent).value = (
            _ev.detail as IgcDropdownItemComponent
          ).value;
        }}
        .scrollStrategy=${scrollStrategy}
      >
        <igc-input
          slot="target"
          type="text"
          label="Country"
          id="txtCountry"
          style="width: 150px"
        ></igc-input>
        <igc-dropdown-group>
          <igc-dropdown-header slot="label">Europe</igc-dropdown-header>
          ${countries
            .slice(0, 2)
            .map(
              (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
            )}
        </igc-dropdown-group>
        <igc-dropdown-group>
          <igc-dropdown-header slot="label">North America</igc-dropdown-header>
          ${countries
            .slice(2, 4)
            .map(
              (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
            )}
        </igc-dropdown-group>
        <igc-dropdown-group>
          <igc-dropdown-header slot="label">Asia</igc-dropdown-header>
          ${countries
            .slice(4)
            .map(
              (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
            )}
        </igc-dropdown-group>
      </igc-dropdown>
    </div>
  </igc-form>
  <!-- </div> -->
`;

export const Basic: Story = Template.bind({});
export const Form: Story = FormTemplate.bind({});
