import { html } from 'lit';
import { Context, Story } from './story.js';
import {
  defineComponents,
  IgcDropDownComponent,
  IgcInputComponent,
} from '../src/index.js';
import { ISelectionChangeEventArgs } from '../src/components/dropdown/dropdown.js';

defineComponents(IgcDropDownComponent, IgcInputComponent);

// region default
const metadata = {
  title: 'Dropdown',
  component: 'igc-dropdown',
  argTypes: {
    keepOpenOnSelect: {
      type: 'boolean',
      description: 'Whether the dropdown should be kept open on selection.',
      control: 'boolean',
      defaultValue: false,
    },
    open: {
      type: 'boolean',
      description: 'Sets the open state of the component.',
      control: 'boolean',
      defaultValue: false,
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
      control: {
        type: 'select',
      },
      defaultValue: 'bottom-start',
    },
    positionStrategy: {
      type: '"absolute" | "fixed"',
      description: "Sets the component's positioning strategy.",
      options: ['absolute', 'fixed'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'absolute',
    },
    scrollStrategy: {
      type: '"scroll" | "block" | "close"',
      description:
        'Determines the behavior of the component during scrolling the container.',
      options: ['scroll', 'block', 'close'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'scroll',
    },
    flip: {
      type: 'boolean',
      description:
        "Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.\nWhen true, once enough space is detected on its preferred side, it will flip back.",
      control: 'boolean',
      defaultValue: false,
    },
    distance: {
      type: 'number',
      description: 'The distance from the target element.',
      control: 'number',
      defaultValue: '0',
    },
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component should be kept open on clicking outside of it.',
      control: 'boolean',
      defaultValue: false,
    },
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the dropdown's width should be the same as the target's one.",
      control: 'boolean',
      defaultValue: false,
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'large',
    },
  },
};
export default metadata;
interface ArgTypes {
  keepOpenOnSelect: boolean;
  open: boolean;
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
  positionStrategy: 'absolute' | 'fixed';
  scrollStrategy: 'scroll' | 'block' | 'close';
  flip: boolean;
  distance: number;
  keepOpenOnOutsideClick: boolean;
  sameWidth: boolean;
  size: 'small' | 'medium' | 'large';
}
// endregion

(metadata as any).parameters = {
  actions: {
    handles: [
      'igcChange',
      'igcOpening',
      'igcOpened',
      'igcClosing',
      'igcClosed',
    ],
  },
};

const toggleDDL = (ev: Event, ddlId: string) => {
  const ddl = document.getElementById(ddlId) as IgcDropDownComponent;
  if (ddlId === 'ddl2') {
    const styles: Partial<CSSStyleDeclaration> = {
      height: `150px`,
    };
    Object.assign((ddl?.shadowRoot?.children[1] as HTMLElement).style, styles);
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
const Template: Story<ArgTypes, Context> = (
  {
    size = 'large',
    open = false,
    flip = false,
    keepOpenOnOutsideClick = false,
    positionStrategy = 'absolute',
    placement = 'bottom-start',
    scrollStrategy = 'block',
    keepOpenOnSelect = false,
    sameWidth = false,
    distance = 0,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div
    style="display: flex; align-items: flex-start; position: relative; height: 400px"
  >
    <igc-dropdown
      id="ddl1"
      size=${size}
      ?open=${open}
      ?flip=${flip}
      ?keep-open-on-outside-click=${keepOpenOnOutsideClick}
      placement=${placement}
      .dir=${direction}
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
              ><igc-icon slot="prefix" name="home"></igc-icon>${item}<igc-icon
                name="github"
                slot="suffix"
              ></igc-icon
            ></igc-dropdown-item>`
        )}
      ${html`<igc-dropdown-item disabled
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[2]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[3]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[4]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-dropdown-item>`}
      ${html`<igc-dropdown-item disabled
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[5]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-dropdown-item>`}
    </igc-dropdown>

    <div style="position: absolute; right: 0px; top: 50px">
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
        size=${size}
        .open=${open}
        .flip=${flip}
        .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
        .placement=${placement}
        .scrollStrategy=${scrollStrategy}
        .sameWidth=${sameWidth}
        .positionStrategy=${positionStrategy}
        .dir=${direction}
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
          <h3>Product Guidance</h3>
          ${items
            .slice(3, 5)
            .map(
              (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
            )}
        </igc-dropdown-group>
        <igc-dropdown-group>
          <h3>Release Engineering</h3>
          <igc-dropdown-item>${items[5]}</igc-dropdown-item>
        </igc-dropdown-group>
      </igc-dropdown>
    </div>

    <igc-dropdown
      id="ddl3"
      style="align-self: center;"
      distance=${distance}
      size=${size}
      .open=${open}
      .flip=${flip}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
      .positionStrategy=${positionStrategy}
      .dir=${direction}
    >
      <igc-button slot="target">Dropdown 3</igc-button>
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>

    <igc-dropdown
      style="position: absolute; bottom: 10px; left: 0px"
      id="ddl4"
      size=${size}
      .open=${open}
      .flip=${flip}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
      .positionStrategy=${positionStrategy}
      .dir=${direction}
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
      size=${size}
      .open=${open}
      .flip=${true}
      .keepOpenOnOutsideClick=${keepOpenOnOutsideClick}
      .placement=${placement}
      .positionStrategy=${positionStrategy}
      .scrollStrategy=${scrollStrategy}
      .sameWidth=${sameWidth}
      .dir=${direction}
    >
      <input slot="target" style="width: 150px" />
      <!-- ${items.slice(0, 5).map((item) => html`<h4>${item}</h4>`)} -->
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
  </div>
`;

const FormTemplate: Story<null, null> = () => checkoutForm;
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
            _ev.detail as ISelectionChangeEventArgs
          ).newItem?.textContent as string;
        }}
        .scrollStrategy=${scrollStrategy}
      >
        <igc-input
          slot="target"
          type="text"
          label="Country"
          id="txtCountry"
          size="small"
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

export const Basic = Template.bind({});
export const Form = FormTemplate.bind({});
