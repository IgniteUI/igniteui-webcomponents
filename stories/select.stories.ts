import { html } from 'lit';
import { github } from '@igniteui/material-icons-extended';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  Context,
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import { registerIconFromText } from '../src/components/icon/icon.registry';
import {
  defineComponents,
  IgcSelectComponent,
  IgcIconComponent,
} from '../src/index.js';
import { Meta, StoryObj } from '@storybook/web-components';

defineComponents(IgcSelectComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcSelectComponent> = {
  title: 'Select',
  component: 'igc-select',
  parameters: { docs: { description: {} } },
  argTypes: {
    value: {
      type: 'string | undefined',
      description: 'The value attribute of the control.',
      control: 'text',
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
      description: 'The direction attribute of the control.',
      options: ['ltr', 'rtl', 'auto'],
      control: { type: 'inline-radio' },
      defaultValue: 'auto',
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in form context.',
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      defaultValue: false,
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      defaultValue: false,
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
      control: { type: 'inline-radio' },
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
      control: { type: 'select' },
      defaultValue: 'bottom-start',
    },
    distance: {
      type: 'number',
      description: 'The distance from the target element.',
      control: 'number',
      defaultValue: '0',
    },
    size: {
      type: '"small" | "medium" | "large"',
      description: 'Determines the size of the component.',
      options: ['small', 'medium', 'large'],
      control: { type: 'inline-radio' },
      defaultValue: 'medium',
    },
  },
  args: {
    outlined: false,
    dir: 'auto',
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    scrollStrategy: 'scroll',
    keepOpenOnOutsideClick: false,
    open: false,
    placement: 'bottom-start',
    distance: '0',
    size: 'medium',
  },
};

export default metadata;

interface IgcSelectArgs {
  /** The value attribute of the control. */
  value: string | undefined;
  /** The outlined attribute of the control. */
  outlined: boolean;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** The label attribute of the control. */
  label: string;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The direction attribute of the control. */
  dir: 'ltr' | 'rtl' | 'auto';
  /** The name attribute of the control. */
  name: string;
  /** Makes the control a required field in form context. */
  required: boolean;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Whether the dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Determines the behavior of the component during scrolling the container. */
  scrollStrategy: 'scroll' | 'block' | 'close';
  /** Whether the component should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
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
  /** The distance from the target element. */
  distance: number;
  /** Determines the size of the component. */
  size: 'small' | 'medium' | 'large';
}
type Story = StoryObj<IgcSelectArgs>;

// endregion

Object.assign(metadata.parameters!, {
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
});

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
const Template = (
  {
    label = 'Sample Label',
    placeholder,
    name,
    value = 'docs',
    size = 'medium',
    open = false,
    disabled = false,
    outlined = false,
    invalid = false,
    required = false,
    autofocus = false,
  }: IgcSelectArgs,
  { globals: { direction } }: Context
) => html`
  <igc-select
    value=${value}
    label=${ifDefined(label)}
    name=${ifDefined(name)}
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
        ${item.text}
        <igc-icon slot="suffix" name="github"></igc-icon>
      </igc-select-item>`
    )}
  </igc-select>
`;

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

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  render: () => {
    return html`
      <form @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default select</legend>
          <igc-select
            value="bg"
            name="default-select"
            label="Countries (value through attribute)"
          >
            ${Object.entries(groupBy(countries, 'continent')).map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${(countries as any).map(
                    (item: any) => html`
                      <igc-select-item
                        value=${item.value}
                        ?disabled=${item.disabled}
                        >${item.country}</igc-select-item
                      >
                    `
                  )}
                </igc-select-group>
              `
            )}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
          <igc-select
            name="default-select-2"
            label="Countries (value through selected item)"
          >
            ${Object.entries(groupBy(countries, 'continent')).map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${(countries as any).map(
                    (item: any) => html`
                      <igc-select-item
                        value=${item.value}
                        ?selected=${item.selected}
                        ?disabled=${item.disabled}
                        >${item.country}</igc-select-item
                      >
                    `
                  )}
                </igc-select-group>
              `
            )}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset>
          <legend>Required select</legend>
          <igc-select name="required-select" label="Countries" required>
            ${Object.entries(groupBy(countries, 'continent')).map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${(countries as any).map(
                    (item: any) => html`
                      <igc-select-item
                        value=${item.value}
                        ?disabled=${item.disabled}
                        >${item.country}</igc-select-item
                      >
                    `
                  )}
                </igc-select-group>
              `
            )}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        <fieldset disabled>
          <legend>Disabled form group</legend>
          <igc-select label="Countries">
            ${Object.entries(groupBy(countries, 'continent')).map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${(countries as any).map(
                    (item: any) => html`
                      <igc-select-item
                        value=${item.value}
                        ?disabled=${item.disabled}
                        >${item.country}</igc-select-item
                      >
                    `
                  )}
                </igc-select-group>
              `
            )}
            <span slot="helper-text">Sample helper text.</span>
          </igc-select>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};

export const Basic: Story = Template.bind({});
