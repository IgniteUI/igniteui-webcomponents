import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  defineComponents,
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSelectGroupComponent,
} from '../src/index.js';
import { Context, Story } from './story.js';

defineComponents(
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSelectGroupComponent
);

// region default
const metadata = {
  title: 'Select',
  component: 'igc-select',
  argTypes: {
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
      defaultValue: '',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    required: {
      type: 'boolean',
      description: 'The required attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'The invalid attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    outlined: {
      type: 'boolean',
      description: 'The outlined attribute of the control.',
      control: 'boolean',
      defaultValue: false,
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
    },
    keepOpenOnSelect: {
      type: 'boolean',
      description: 'Whether the dropdown should be kept open on selection.',
      control: 'boolean',
      defaultValue: false,
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
    keepOpenOnOutsideClick: {
      type: 'boolean',
      description:
        'Whether the component should be kept open on clicking outside of it.',
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
      defaultValue: 'medium',
    },
  },
};
export default metadata;
interface ArgTypes {
  value: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  outlined: boolean;
  autofocus: boolean;
  keepOpenOnSelect: boolean;
  scrollStrategy: 'scroll' | 'block' | 'close';
  keepOpenOnOutsideClick: boolean;
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
  flip: boolean;
  distance: number;
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
    value,
    size = 'medium',
    open = false,
    disabled = false,
    outlined = false,
    invalid = false,
    required = false,
    autofocus = false,
  }: ArgTypes,
  { globals: { direction } }: Context
) => html`
  <div
    style="display: flex; align-items: flex-start; position: relative; height: 400px"
  >
    <igc-select
      value=${ifDefined(value)}
      size=${size}
      ?open=${open}
      ?autofocus=${autofocus}
      ?outlined=${outlined}
      ?required=${required}
      ?disabled=${disabled}
      ?invalid=${invalid}
      .dir=${direction}
    >
      <header slot="header">Sample Header</header>
      <span slot="prefix">home</span>
      <header slot="footer">Sample Footer</header>
      <igc-dropdown-header>Tasks</igc-dropdown-header>
      <!-- ${items.map(
        (item) => html`<igc-select-item>${item}</igc-select-item>`
      )} -->
      ${items
        .slice(0, 2)
        .map(
          (item) =>
            html`<igc-select-item
              ><igc-icon slot="prefix" name="home"></igc-icon>${item}<igc-icon
                name="github"
                slot="suffix"
              ></igc-icon
            ></igc-select-item>`
        )}
      ${html`<igc-select-item disabled
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[2]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-select-item>`}
      ${html`<igc-select-item
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[3]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-select-item>`}
      ${html`<igc-select-item
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[4]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-select-item>`}
      ${html`<igc-select-item disabled
        ><igc-icon slot="prefix" name="home"></igc-icon>${items[5]}<igc-icon
          name="github"
          slot="suffix"
        ></igc-icon
      ></igc-select-item>`}
    </igc-select>
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
  <igc-form>
    <igc-select>
      <igc-select-group>
        <igc-dropdown-header slot="label">Europe</igc-dropdown-header>
        ${countries
          .slice(0, 2)
          .map((item) => html`<igc-select-item>${item}</igc-select-item>`)}
      </igc-select-group>
      <igc-select-group>
        <igc-dropdown-header slot="label">North America</igc-dropdown-header>
        ${countries
          .slice(2, 4)
          .map((item) => html`<igc-select-item>${item}</igc-select-item>`)}
      </igc-select-group>
      <igc-select-group>
        <igc-dropdown-header slot="label">Asia</igc-dropdown-header>
        ${countries
          .slice(4)
          .map((item) => html`<igc-select-item>${item}</igc-select-item>`)}
      </igc-select-group>
    </igc-select>
  </igc-form>
`;

export const Basic = Template.bind({});
export const Form = FormTemplate.bind({});
