import { html } from 'lit';
import { Context, Story } from './story.js';
import { IgcPlacement } from '../src/components/toggle/utilities.js';
import {
  defineComponents,
  IgcDropDownComponent,
  IgcInputComponent,
} from '../src/index.js';
import { ISelectionChangeEventArgs } from '../src/components/dropdown/dropdown.js';

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
  },
};
export default metadata;
interface ArgTypes {
  placement: IgcPlacement;
  open: boolean;
  strategy: 'absolute' | 'fixed';
  flip: boolean;
  closeOnOutsideClick: boolean;
  scrollStrategy: 'scroll' | 'close' | 'block' | 'noop';
}
// end region

(metadata as any).parameters = {
  actions: {
    handles: ['igcSelect'],
  },
};
const toggleDDL = (ev: Event, ddlId: string) => {
  console.log(ev);
  const ddl = document.getElementById(ddlId) as IgcDropDownComponent;
  ddl.toggle();
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
    scrollStrategy = 'block',
  }: // offset = { x: 20, y: 20 },
  ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div style="position: relative; height: 400px">
    <igc-dropdown
      id="ddl1"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
      .scrollStrategy=${scrollStrategy}
    >
      <igc-button slot="target" @click="${(ev: Event) => toggleDDL(ev, 'ddl1')}"
        >Dropdown 1</igc-button
      >
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
    <igc-dropdown
      style="position: absolute; top: 0px; right: 0px;"
      id="ddl2"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .scrollStrategy=${scrollStrategy}
      .dir=${direction}
    >
      <igc-button slot="target" @click="${(ev: Event) => toggleDDL(ev, 'ddl2')}"
        >Dropdown 1</igc-button
      >
      <igc-dropdown-group>
        <h3 slot="label">Research & Development</h3>
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
    <igc-dropdown
      style="position: absolute; bottom: 0px; left: 0px"
      id="ddl3"
      .flip=${flip}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${'top-start'}
      .dir=${direction}
    >
      <input
        type="button"
        slot="target"
        @click="${(ev: Event) => toggleDDL(ev, 'ddl3')}"
        style="width: 150px"
      />
      <!-- ${items.slice(0, 5).map((item) => html`<h4>${item}</h4>`)} -->
      ${items.map(
        (item) => html`<igc-dropdown-item>${item}</igc-dropdown-item>`
      )}
    </igc-dropdown>
    <igc-dropdown
      style="position: fixed; bottom: 0px; right: 0px"
      id="ddl4"
      .flip=${true}
      .closeOnOutsideClick=${closeOnOutsideClick}
      .placement=${placement}
      .dir=${direction}
    >
      <input
        type="button"
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
        @igcSelect=${(_ev: CustomEvent) => {
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
          @click="${(ev: Event) => toggleDDL(ev, 'ddlCountry')}"
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
