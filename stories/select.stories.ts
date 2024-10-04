import {
  arrowDownLeft,
  arrowUpLeft,
  github,
} from '@igniteui/material-icons-extended';
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { groupBy } from '../src/components/common/util.js';
import {
  IgcIconComponent,
  IgcSelectComponent,
  defineComponents,
  registerIconFromText,
} from '../src/index.js';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcSelectComponent, IgcIconComponent);

for (const each of [github, arrowDownLeft, arrowUpLeft]) {
  registerIconFromText(each.name, each.value);
}

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
    distance: {
      type: 'number',
      description: 'The distance of the select dropdown from its input.',
      control: 'number',
      table: { defaultValue: { summary: 0 } },
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
    placement: {
      type: '"top" | "top-start" | "top-end" | "bottom" | "bottom-start" | "bottom-end" | "right" | "right-start" | "right-end" | "left" | "left-start" | "left-end"',
      description:
        'The preferred placement of the select dropdown around its input.',
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
    scrollStrategy: {
      type: '"scroll" | "block" | "close"',
      description:
        'Determines the behavior of the component during scrolling of the parent container.',
      options: ['scroll', 'block', 'close'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'scroll' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
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
      description: 'The disabled state of the component.',
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
    outlined: false,
    autofocus: false,
    distance: 0,
    placement: 'bottom-start',
    scrollStrategy: 'scroll',
    required: false,
    disabled: false,
    invalid: false,
    keepOpenOnSelect: false,
    keepOpenOnOutsideClick: false,
    open: false,
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
  /** The distance of the select dropdown from its input. */
  distance: number;
  /** The label attribute of the control. */
  label: string;
  /** The placeholder attribute of the control. */
  placeholder: string;
  /** The preferred placement of the select dropdown around its input. */
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
  /** Determines the behavior of the component during scrolling of the parent container. */
  scrollStrategy: 'scroll' | 'block' | 'close';
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Control the validity of the control. */
  invalid: boolean;
  /** Whether the component dropdown should be kept open on selection. */
  keepOpenOnSelect: boolean;
  /** Whether the component dropdown should be kept open on clicking outside of it. */
  keepOpenOnOutsideClick: boolean;
  /** Sets the open state of the component. */
  open: boolean;
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
].map(
  (item) =>
    html`<igc-select-item
      .value=${item.value}
      ?disabled=${item.disabled}
      ?selected=${item.selected}
      >${item.text}</igc-select-item
    >`
);

const countries = Object.entries(
  groupBy(
    [
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
    ],
    'continent'
  )
);

export const Basic: Story = {
  args: {
    label: 'Assign task',
    value: 'docs',
  },

  render: (args) => html`
    <igc-select
      .value=${args.value}
      .label=${args.label}
      .name=${args.name}
      .placeholder=${args.placeholder}
      .placement=${args.placement}
      .scrollStrategy=${args.scrollStrategy}
      .distance=${args.distance}
      ?open=${args.open}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=${args.keepOpenOnSelect}
      ?autofocus=${args.autofocus}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      <igc-select-header>Available tasks:</igc-select-header>
      ${items}
      <span slot="helper-text">Choose a task to assign.</span>
    </igc-select>
  `,
};

export const WithGroups: Story = {
  args: {
    label: 'Select a country',
  },

  render: (args) => html`
    <igc-select
      .value=${args.value}
      .label=${args.label}
      .name=${args.name}
      .placeholder=${args.placeholder}
      .placement=${args.placement}
      .scrollStrategy=${args.scrollStrategy}
      .distance=${args.distance}
      ?open=${args.open}
      ?keep-open-on-outside-click=${args.keepOpenOnOutsideClick}
      ?keep-open-on-select=${args.keepOpenOnSelect}
      ?autofocus=${args.autofocus}
      ?outlined=${args.outlined}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    >
      ${countries.map(
        ([continent, countries]) => html`
          <igc-select-group>
            <igc-select-header slot="label">${continent}</igc-select-header>
            ${countries.map(
              (item) => html`
                <igc-select-item value=${item.value} ?disabled=${item.disabled}
                  >${item.country}</igc-select-item
                >
              `
            )}
          </igc-select-group>
        `
      )}
      <span slot="helper-text">Choose a country.</span>
    </igc-select>
  `,
};

export const InitialValue: Story = {
  args: { value: '1' },
  render: ({ value }) => html`
    <style>
      igc-select {
        margin-bottom: 2rem;
      }
    </style>
    <igc-select value=${value} label="Initial through value attribute">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2">Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>
    </igc-select>

    <igc-select label="Through selected attribute on igc-select-item">
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3" selected>Third</igc-select-item>

      <span slot="helper-text">
        If there are multiple items with the <code>selected</code> attribute,
        the last one will take precedence and set the initial value of the
        component.
      </span>
    </igc-select>

    <igc-select label="Both set on initial render" value=${value}>
      <igc-select-item value="1">First</igc-select-item>
      <igc-select-item value="2" selected>Second</igc-select-item>
      <igc-select-item value="3">Third</igc-select-item>

      <span slot="helper-text">
        If both are set on initial render, then the
        <code>selected</code> attribute of the child (if any) item will take
        precedence over the <code>value</code> attribute of the select.
      </span>
    </igc-select>
  `,
};

export const Slots: Story = {
  render: () => html`
    <style>
      .template {
        background-color: hsl(var(--ig-primary-A200));
        color: hsl(var(--ig-primary-A200-contrast));
        padding: 0.5rem;
      }

      igc-select::part(list) {
        max-height: 50vh;
      }
    </style>
    <igc-select label="Select component with all slots">
      <igc-icon name=${github.name} slot="prefix"></igc-icon>
      <igc-icon name=${github.name} slot="suffix"></igc-icon>

      <igc-icon name=${arrowDownLeft.name} slot="toggle-icon"></igc-icon>
      <igc-icon name=${arrowUpLeft.name} slot="toggle-icon-expanded"></igc-icon>

      <section class="template" slot="header">This is a header</section>
      <section class="template" slot="footer">This is a footer</section>

      <span slot="helper-text">Helper text</span>

      <igc-select-header>Tasks</igc-select-header>
      ${items}

      <igc-select-header>Countries</igc-select-header>
      ${countries.map(
        ([continent, countries]) => html`
          <igc-select-group>
            <igc-select-header slot="label">${continent}</igc-select-header>
            ${countries.map(
              (item) => html`
                <igc-select-item value=${item.value} ?disabled=${item.disabled}
                  >${item.country}</igc-select-item
                >
              `
            )}
          </igc-select-group>
        `
      )}
    </igc-select>
  `,
};

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
            ${countries.map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${countries.map(
                    (item) => html`
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
            ${countries.map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${countries.map(
                    (item) => html`
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
            ${countries.map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${countries.map(
                    (item) => html`
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
            ${countries.map(
              ([continent, countries]) => html`
                <igc-select-group>
                  <igc-select-header slot="label"
                    >${continent}</igc-select-header
                  >
                  ${countries.map(
                    (item) => html`
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
