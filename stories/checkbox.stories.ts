import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

import { IgcCheckboxComponent, defineComponents } from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcCheckboxComponent);

// region default
const metadata: Meta<IgcCheckboxComponent> = {
  title: 'Checkbox',
  component: 'igc-checkbox',
  parameters: {
    docs: {
      description: {
        component:
          'A check box allowing single values to be selected/deselected.',
      },
    },
    actions: { handles: ['igcChange'] },
  },
  argTypes: {
    indeterminate: {
      type: 'boolean',
      description: 'Draws the checkbox in indeterminate state.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    required: {
      type: 'boolean',
      description:
        'When set, makes the component a required field for validation.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
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
      table: { defaultValue: { summary: 'false' } },
    },
    invalid: {
      type: 'boolean',
      description: 'Sets the control into invalid state (visual state only).',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    value: {
      type: 'string',
      description: 'The value attribute of the control.',
      control: 'text',
    },
    checked: {
      type: 'boolean',
      description: 'The checked state of the control.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    labelPosition: {
      type: '"after" | "before"',
      description: 'The label position of the control.',
      options: ['after', 'before'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'after' } },
    },
  },
  args: {
    indeterminate: false,
    required: false,
    disabled: false,
    invalid: false,
    checked: false,
    labelPosition: 'after',
  },
};

export default metadata;

interface IgcCheckboxArgs {
  /** Draws the checkbox in indeterminate state. */
  indeterminate: boolean;
  /** When set, makes the component a required field for validation. */
  required: boolean;
  /** The name attribute of the control. */
  name: string;
  /** The disabled state of the component. */
  disabled: boolean;
  /** Sets the control into invalid state (visual state only). */
  invalid: boolean;
  /** The value attribute of the control. */
  value: string;
  /** The checked state of the control. */
  checked: boolean;
  /** The label position of the control. */
  labelPosition: 'after' | 'before';
}
type Story = StoryObj<IgcCheckboxArgs>;

// endregion

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A basic checkbox illustrating all available properties. Use the controls panel to explore available properties interactively.',
      },
    },
  },
  render: (args) => html`
    <igc-checkbox
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      ?required=${args.required}
      .value=${args.value}
      .name=${args.name}
      .labelPosition=${args.labelPosition}
      .invalid=${args.invalid}
      .indeterminate=${args.indeterminate}
    >
      Label
    </igc-checkbox>
  `,
};

export const Indeterminate: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'The **indeterminate** state visually indicates a partially selected condition and is commonly used in "select all" patterns. Toggling the parent updates all child checkboxes; toggling any child recalculates the parent state.',
      },
    },
  },
  render: () => {
    const onParentChange = (e: Event) => {
      const parent = e.target as IgcCheckboxComponent;
      document
        .querySelectorAll<IgcCheckboxComponent>('.child-cb')
        .forEach((cb) => {
          cb.checked = parent.checked;
        });
    };
    const onChildChange = () => {
      const children = [
        ...document.querySelectorAll<IgcCheckboxComponent>('.child-cb'),
      ];
      const checkedCount = children.filter((cb) => cb.checked).length;
      const parent =
        document.querySelector<IgcCheckboxComponent>('#parent-cb')!;
      parent.indeterminate = checkedCount > 0 && checkedCount < children.length;
      parent.checked = checkedCount === children.length;
    };
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem;"
      >
        <igc-checkbox id="parent-cb" indeterminate @igcChange=${onParentChange}>
          Select all
        </igc-checkbox>
        <div
          style="margin-inline-start: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;"
        >
          <igc-checkbox class="child-cb" checked @igcChange=${onChildChange}>
            Option 1
          </igc-checkbox>
          <igc-checkbox class="child-cb" @igcChange=${onChildChange}>
            Option 2
          </igc-checkbox>
          <igc-checkbox class="child-cb" checked @igcChange=${onChildChange}>
            Option 3
          </igc-checkbox>
        </div>
      </div>
    `;
  },
};

export const LabelPosition: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          "The `labelPosition` property controls whether the label appears before or after the checkbox indicator. Defaults to `'after'`.",
      },
    },
  },
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;"
    >
      <igc-checkbox label-position="after">Label after (default)</igc-checkbox>
      <igc-checkbox label-position="before">Label before</igc-checkbox>
    </div>
  `,
};

export const States: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Visual overview of all checkbox states: unchecked, checked, indeterminate, disabled, disabled checked, invalid, and checked invalid.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; padding: 1rem;">
      <igc-checkbox>Unchecked</igc-checkbox>
      <igc-checkbox checked>Checked</igc-checkbox>
      <igc-checkbox indeterminate>Indeterminate</igc-checkbox>
      <igc-checkbox disabled>Disabled</igc-checkbox>
      <igc-checkbox checked disabled>Checked &amp; Disabled</igc-checkbox>
      <igc-checkbox invalid>Invalid</igc-checkbox>
      <igc-checkbox checked invalid>Checked &amp; Invalid</igc-checkbox>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates checkbox behaviour inside an HTML `<form>` element, including required validation, indeterminate state, initial checked state, and disabled fieldsets.',
      },
    },
  },
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default section</legend>
          <igc-checkbox name="checkbox">Checkbox 1</igc-checkbox>
        </fieldset>

        <fieldset>
          <legend>Initial checked state</legend>
          <igc-checkbox name="checkbox-initial" value="initial" checked
            >Checked initial state</igc-checkbox
          >
        </fieldset>

        <fieldset disabled>
          <legend>Disabled section</legend>
          <igc-checkbox name="checkbox-disabled">Checkbox 2</igc-checkbox>
        </fieldset>

        <fieldset>
          <legend>Required section</legend>
          <igc-checkbox required name="required-checkbox">
            Required checkbox
            <div slot="value-missing">This field is required!</div>
          </igc-checkbox>
        </fieldset>

        <fieldset>
          <legend>Indeterminate with required state</legend>
          <igc-checkbox name="required-indeterminate" indeterminate required>
            Are you sure?
            <div slot="helper-text">
              You do want to check me before submit..
            </div>
            <div slot="invalid">Mhm, nope, not gonna happen!</div>
          </igc-checkbox>
        </fieldset>

        ${formControls()}
      </form>
    `;
  },
};
