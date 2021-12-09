import { html } from 'lit';
import { Context, Story } from './story.js';
import { IgcPlacement } from '../src/components/toggle/utilities.js';
import {
  defineComponents,
  IgcDropDownComponent,
  IgcInputComponent,
} from '../src/index.js';
import { igcToggle } from '../src/components/toggle/toggle.directive';
import { ISelectionEventArgs } from '../src/components/dropdown/dropdown.js';

defineComponents(IgcDropDownComponent, IgcInputComponent);
const placements = [
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
];

// region default
const metadata = {
  title: 'Dropdown',
  component: 'igc-dropdown',
  argTypes: {
    placement: {
      type: placements,
      control: 'select',
      options: placements,
      defaultValue: 'bottom-start',
    },
    open: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    strategy: {
      type: '"absolute" | "fixed"',
      options: ['absolute', 'fixed'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'absolute',
    },
    flip: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
    closeOnOutsideClick: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: true,
    },
    scrollStrategy: {
      type: '"absolute" | "close" | "block" | "noop"',
      options: ['absolute', 'close', 'block', 'noop'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'noop',
    },
    allowItemsFocus: {
      type: 'boolean',
      control: 'boolean',
      defaultValue: false,
    },
  },
};
export default metadata;
interface ArgTypes {
  placement: IgcPlacement;
  open: boolean;
  strategy: 'absolute' | 'fixed';
  flip: boolean;
  closeOnOutsideClick: boolean;
  scrollStrategy: 'absolute' | 'close' | 'block' | 'noop';
}
// end region

(metadata as any).parameters = {
  actions: {
    handles: ['igcSelect'],
  },
};
const toggleDDL = (ev: Event, ddlId: string) => {
  const ddl = document.getElementById(ddlId) as IgcDropDownComponent;
  ddl.target = ev.target as HTMLElement;
  ddl.toggle();
};

let toggleDir: any;
const showTooltip = (ev: Event) => {
  // const element = document.getElementById(elemId) as HTMLElement;
  toggleDir = igcToggle(ev.target as HTMLElement, true);
  console.log(toggleDir);
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
    flip = false,
    closeOnOutsideClick = true,
    placement = 'bottom-end',
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div style="display:flex; justify-content: space-between">
    <igc-button @click="${(ev: Event) => toggleDDL(ev, 'ddl1')}"
      >Dropdown 1</igc-button
    >
    <igc-dropdown
      id="ddl1"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
    >
      <igc-dropdown-header>Tasks</igc-dropdown-header>
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
    <igc-button @click="${(ev: Event) => toggleDDL(ev, 'ddl2')}"
      >Dropdown 1</igc-button
    >
    <igc-dropdown
      id="ddl2"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
    >
      <igc-dropdown-group>
        <h3>Research & Development</h3>
        ${items
          .slice(0, 3)
          .map((item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`)}
      </igc-dropdown-group>
      <igc-dropdown-group>
        <h3>Product Guidance</h3>
        ${items
          .slice(3, 5)
          .map((item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`)}
      </igc-dropdown-group>
      <igc-dropdown-group>
        <h3>Release Engineering</h3>
        <igc-dropdown-item>${items[5]}</igc-dropdown-item>
      </igc-dropdown-group>
    </igc-dropdown>
  </div>
  <div>
    <igc-input size="small" @click="${(ev: Event) => toggleDDL(ev, 'ddl3')}"
      >Dropdown 1</igc-input
    >
    <igc-dropdown
      id="ddl3"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
    >
      ${items.slice(0, 4).map((item) => html`<h4>${item}</h4>`)}
    </igc-dropdown>
  </div>
  <div style="display:flex; justify-content: space-between">
    <igc-button @click="${(ev: Event) => toggleDDL(ev, 'ddl4')}"
      >Dropdown 1</igc-button
    >
    <igc-dropdown
      id="ddl4"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
    >
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
  </div>
  <div>
    <!-- <igc-button id="btn" @mouseover="${(ev: Event) => showTooltip(ev)}"
      >Show tooltip</igc-button
    >
    <span
      ${(toggleDir = igcToggle(
      document.getElementById('btn') as HTMLElement,
      false
    ))}
      >I am a tooltip~</span
    > -->
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
const checkoutForm = html`
  <!-- <div> -->
  <igc-form>
    <div>
      <igc-input
        type="text"
        label="Country"
        id="txtCountry"
        size="small"
        @click="${(ev: Event) => toggleDDL(ev, 'ddlCountry')}"
        style="width: 150px"
      ></igc-input>
      <igc-dropdown
        id="ddlCountry"
        @igcSelect=${(_ev: CustomEvent) => {
          (document.getElementById('txtCountry') as IgcInputComponent).value = (
            _ev.detail as ISelectionEventArgs
          ).newItem?.textContent as string;
        }}
      >
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
