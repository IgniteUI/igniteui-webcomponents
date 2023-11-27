import { github } from '@igniteui/material-icons-extended';
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';
import {
  IgcIconComponent,
  IgcSelectComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';

defineComponents(IgcSelectComponent, IgcIconComponent);
registerIconFromText(github.name, github.value);

// region default
const metadata: Meta<IgcSelectComponent> = {
  title: 'Select',
  component: 'igc-select',
  parameters: {
    docs: {
      description: {
        component: 'Represents a control that provides a menu of options.',
      },
    },
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
  },
  argTypes: {
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    outlined: {
      type: 'boolean',
      description: 'The outlined attribute of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    autofocus: {
      type: 'boolean',
      description: 'The autofocus attribute of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
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
    required: {
      type: 'boolean',
      description: 'Makes the control a required field in a form context.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    name: {
      type: 'string',
      description: 'The name attribute of the control.',
      control: 'text',
    },
    disabled: {
      type: 'boolean',
      description: 'The disabled state of the component',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
    invalid: {
      type: 'boolean',
      description: 'Control the validity of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: false } },
    },
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
    outlined: false,
    autofocus: false,
    required: false,
    disabled: false,
    invalid: false,
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

interface IgcSelectArgs {
  /** The value attribute of the control. */
  value: string;
  /** The outlined attribute of the control. */
  outlined: boolean;
  /** The autofocus attribute of the control. */
  autofocus: boolean;
  /** The label attribute of the control. */
  label: string;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** Makes the control a required field in a form context. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
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
type Story = StoryObj<IgcSelectArgs>;

// endregion

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
const Template = ({
  label = 'Sample Label',
  placeholder,
  name,
  value = 'docs',
  open = false,
  disabled = false,
  outlined = false,
  invalid = false,
  required = false,
  autofocus = false,
}: IgcSelectArgs) => html`
  <igc-select
    value=${value}
    label=${ifDefined(label)}
    name=${ifDefined(name)}
    placeholder=${ifDefined(placeholder)}
    ?open=${open}
    ?autofocus=${autofocus}
    ?outlined=${outlined}
    ?required=${required}
    ?disabled=${disabled}
    ?invalid=${invalid}
  >
    <header slot="header">Sample Header</header>
    <footer slot="footer">Sample Footer</footer>
    <span slot="helper-text">Sample helper text.</span>
    <igc-select-header>Tasks</igc-select-header>
    ${items.map(
      (item) =>
        html` <igc-select-item
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

export const Basic: Story = Template.bind({});

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
