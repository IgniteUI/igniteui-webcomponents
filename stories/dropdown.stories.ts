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
    closeOnSelect: {
      type: 'boolean',
      description: 'Whether the dropdown should be hidden on selection.',
      control: 'boolean',
      defaultValue: true,
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
      type: '"scroll" | "block" | "close" | "none"',
      description:
        'Determines the behavior of the component during scrolling the container.',
      options: ['scroll', 'block', 'close', 'none'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'none',
    },
    flip: {
      type: 'boolean',
      description:
        "Whether the component should be flipped to the opposite side of the target once it's about to overflow the visible area.\nWhen true, once enough space is detected on its preferred side, it will flip back.",
      control: 'boolean',
      defaultValue: false,
    },
    closeOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component should be hidden on clicking outside of it.',
      control: 'boolean',
      defaultValue: true,
    },
    sameWidth: {
      type: 'boolean',
      description:
        "Whether the component's width should be the same as the target's one.",
      control: 'boolean',
    },
  },
};
export default metadata;
interface ArgTypes {
  closeOnSelect: boolean;
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
  scrollStrategy: 'scroll' | 'block' | 'close' | 'none';
  flip: boolean;
  closeOnOutsideClick: boolean;
  sameWidth: boolean;
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
    open = false,
    flip = false,
    closeOnOutsideClick = true,
    placement = 'bottom-start',
    scrollStrategy = 'block',
    closeOnSelect = true,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div style="position: relative; height: 400px">
    <igc-dropdown
      id="ddl1"
      ?open=${open}
      ?flip=${flip}
      ?close-on-outside-click=${closeOnOutsideClick}
      placement=${placement}
      .dir=${direction}
      scroll-strategy=${scrollStrategy}
      offset=${`10, 0`}
      .closeOnSelect=${closeOnSelect}
    >
      <igc-button slot="target">Dropdown 1</igc-button>
      <igc-dropdown-header>Tasks</igc-dropdown-header>
      <!-- ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )} -->
      ${items
        .slice(0, 2)
        .map((item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`)}
      ${html`<igc-dropdown-item disabled>${items[2]}</igc-dropdown-item>`}
      ${html`<igc-dropdown-item>${items[3]}</igc-dropdown-item>`}
      ${html`<igc-dropdown-item>${items[4]}</igc-dropdown-item>`}
      ${html`<igc-dropdown-item disabled>${items[5]}</igc-dropdown-item>`}
    </igc-dropdown>

    <div style="position: absolute; right: 0px;">
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
        .closeOnOutsideClick=${closeOnOutsideClick}
        .placement=${placement}
        .scrollStrategy=${scrollStrategy}
        .dir=${direction}
        .sameWidth=${true}
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
      style="position: absolute; bottom: 10px; left: 0px"
      id="ddl3"
      .open=${open}
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${'top-start'}
      .scrollStrategy=${scrollStrategy}
      .dir=${direction}
      .sameWidth=${true}
    >
      <input
        type="button"
        slot="target"
        style="width: 150px"
        value="Dropdown 3"
      />
      <!-- ${items.slice(0, 5).map((item) => html`<h4>${item}</h4>`)} -->
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
    <igc-dropdown
      style="position: fixed; bottom: 0px; right: 0px"
      id="ddl4"
      .open=${open}
      .flip=${true}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .dir=${direction}
    >
      <input
        slot="target"
        @click="${(ev: Event) => toggleDDL(ev, 'ddl4')}"
        style="width: 150px"
      />
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
