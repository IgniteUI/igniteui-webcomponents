import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  defineComponents,
  IgcSelectComponent,
  IgcSelectGroupComponent,
  IgcSelectHeaderComponent,
  IgcSelectItemComponent,
} from '../src/index.js';
import { Context, Story } from './story.js';

defineComponents(
  IgcSelectComponent,
  IgcSelectItemComponent,
  IgcSelectGroupComponent,
  IgcSelectHeaderComponent
);

// region default
const metadata = {
  title: 'Select',
  component: 'igc-select',
  argTypes: {
    value: {
      type: 'string | undefined',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
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
    label: {
      type: 'string',
      description: 'The label attribute of the control.',
      control: 'text',
    },
    placeholder: {
      type: 'string',
      description: 'The placeholder attribute of the control.',
      control: 'text',
    },
    dir: {
      type: '"ltr" | "rtl" | "auto"',
      options: ['ltr', 'rtl', 'auto'],
      control: {
        type: 'inline-radio',
      },
      defaultValue: 'auto',
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
      defaultValue: true,
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
  value: string | undefined;
  name: string;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  outlined: boolean;
  autofocus: boolean;
  label: string;
  placeholder: string;
  dir: 'ltr' | 'rtl' | 'auto';
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
      'igcFocus',
      'igcBlur',
      'igcChange',
      'igcOpening',
      'igcOpened',
      'igcClosing',
      'igcClosed',
    ],
  },
};

const items = [
  {
    text: 'Specification',
    value: 'spec',
    disabled: false,
    selected: false,
  },
  {
    text: 'Implementation',
    value: 'implementation',
    disabled: false,
    selected: false,
  },
  {
    text: 'Testing',
    value: 'testing',
    disabled: true,
    selected: false,
  },
  {
    text: 'Samples',
    value: 'samples',
    disabled: false,
    selected: false,
  },
  {
    text: 'Documentation',
    value: 'docs',
    disabled: false,
    selected: false,
  },
  {
    text: 'Builds',
    value: 'builds',
    disabled: true,
    selected: false,
  },
];
const Template: Story<ArgTypes, Context> = (
  {
    label,
    placeholder,
    value = 'docs',
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
  <igc-select
    value=${value}
    label=${ifDefined(label)}
    placeholder=${ifDefined(placeholder)}
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
    <footer slot="footer">Sample Footer</footer>
    <span slot="helper-text">Sample helper text.</span>
    <igc-select-header>Tasks</igc-select-header>
    ${items.map(
      (item) => html` <igc-select-item
        value=${item.value}
        ?disabled=${item.disabled}
        ?selected=${item.selected}
      >
        <igc-icon slot="prefix" name="home"></igc-icon>
        ${item.text}
        <igc-icon slot="suffix" name="github"></igc-icon>
      </igc-select-item>`
    )}
  </igc-select>
`;

const FormTemplate: Story<null, null> = () => checkoutForm;
const countries = [
  {
    continent: 'Europe',
    country: 'Bulgaria',
    value: 'bg',
    selected: true,
    disabled: false,
  },
  {
    continent: 'Europe',
    country: 'United Kingdom',
    value: 'uk',
    selected: false,
    disabled: true,
  },
  {
    continent: 'North America',
    country: 'United States of America',
    value: 'us',
    selected: false,
    disabled: false,
  },
  {
    continent: 'North America',
    country: 'Canada',
    value: 'ca',
    selected: false,
    disabled: false,
  },
  {
    continent: 'Asia',
    country: 'Japan',
    value: 'ja',
    selected: false,
    disabled: false,
  },
  {
    continent: 'Asia',
    country: 'India',
    value: 'in',
    selected: false,
    disabled: true,
  },
];

function groupBy(objectArray: any, property: string) {
  return objectArray.reduce(function (acc: any, obj: any) {
    const key = obj[property];

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

const checkoutForm = html`
  <igc-form>
    <igc-select>
      ${Object.entries(groupBy(countries, 'continent')).map(
        ([continent, countries]) => html`
          <igc-select-group>
            <igc-select-header slot="label">${continent}</igc-select-header>
            ${(countries as any).map(
              (item: any) => html`
                <igc-select-item
                  value=${item.value}
                  ?disabled=${item.disabled}
                  ?selected=${item.selected}
                  >${item.country}</igc-select-item
                >
              `
            )}
          </igc-select-group>
        `
      )}
    </igc-select>
  </igc-form>
`;

export const Basic = Template.bind({});
export const Form = FormTemplate.bind({});
