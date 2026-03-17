import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcRadioComponent,
  IgcRadioGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import {
  disableStoryControls,
  formControls,
  formSubmitHandler,
} from './story.js';

defineComponents(IgcRadioGroupComponent, IgcRadioComponent);

// region default
const metadata: Meta<IgcRadioGroupComponent> = {
  title: 'RadioGroup',
  component: 'igc-radio-group',
  parameters: {
    docs: {
      description: {
        component:
          'The igc-radio-group component unifies one or more igc-radio buttons.',
      },
    },
  },
  argTypes: {
    alignment: {
      type: '"horizontal" | "vertical"',
      description: 'Alignment of the radio controls inside this group.',
      options: ['horizontal', 'vertical'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
    name: {
      type: 'string',
      description: 'Gets/Sets the name for all child igc-radio components.',
      control: 'text',
    },
    value: {
      type: 'string',
      description:
        'Gets/Sets the checked igc-radio element that matches `value`',
      control: 'text',
    },
  },
  args: { alignment: 'vertical' },
};

export default metadata;

interface IgcRadioGroupArgs {
  /** Alignment of the radio controls inside this group. */
  alignment: 'horizontal' | 'vertical';
  /** Gets/Sets the name for all child igc-radio components. */
  name: string;
  /** Gets/Sets the checked igc-radio element that matches `value` */
  value: string;
}
type Story = StoryObj<IgcRadioGroupArgs>;

// endregion

const radios = ['apple', 'orange', 'mango', 'banana'];
const titleCase = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase());

export const Default: Story = {
  args: {
    name: 'default-state',
    value: 'mango',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A basic radio group with a pre-selected value set via the `value` attribute. Use the **Controls** panel to change the selected value or switch alignment.',
      },
    },
  },
  render: (args) => html`
    <igc-radio-group
      alignment=${ifDefined(args.alignment)}
      name=${ifDefined(args.name)}
      value=${ifDefined(args.value)}
    >
      <igc-radio value="apple">Apple</igc-radio>
      <igc-radio value="orange">Orange</igc-radio>
      <igc-radio value="mango">Mango</igc-radio>
      <igc-radio value="banana">Banana</igc-radio>
    </igc-radio-group>
  `,
};

export const Alignment: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the two `alignment` values — `vertical` (default) and `horizontal` — side by side.',
      },
    },
  },
  render: () => html`
    <style>
      .alignment-demo {
        display: flex;
        gap: 3rem;
        flex-wrap: wrap;
        align-items: flex-start;
      }

      .alignment-demo > div {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .alignment-demo label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ig-gray-700);
      }
    </style>
    <div class="alignment-demo">
      <div>
        <label>Vertical (default)</label>
        <igc-radio-group name="align-v" value="orange">
          <igc-radio value="apple">Apple</igc-radio>
          <igc-radio value="orange">Orange</igc-radio>
          <igc-radio value="mango">Mango</igc-radio>
          <igc-radio value="banana">Banana</igc-radio>
        </igc-radio-group>
      </div>
      <div>
        <label>Horizontal</label>
        <igc-radio-group alignment="horizontal" name="align-h" value="mango">
          <igc-radio value="apple">Apple</igc-radio>
          <igc-radio value="orange">Orange</igc-radio>
          <igc-radio value="mango">Mango</igc-radio>
          <igc-radio value="banana">Banana</igc-radio>
        </igc-radio-group>
      </div>
    </div>
  `,
};

export const Form: Story = {
  argTypes: disableStoryControls(metadata),
  parameters: {
    docs: {
      description: {
        story:
          'Form integration demo covering default state, pre-selected value, disabled fieldset, and required validation with a custom `value-missing` slot message.',
      },
    },
  },
  render: () => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default</legend>
          <igc-radio-group>
            ${radios.map(
              (e) =>
                html`<igc-radio name="default-fruit" value=${e}>
                  ${titleCase(e)}
                </igc-radio>`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset>
          <legend>Initial value</legend>
          <igc-radio-group name="initial-fruit" value="mango">
            ${radios.map(
              (e) => html`<igc-radio value=${e}>${titleCase(e)}</igc-radio>`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-radio-group>
            ${radios.map(
              (e) =>
                html`<igc-radio name="disabled-fruit" value=${e}>
                  ${titleCase(e)}
                </igc-radio>`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset>
          <legend>Required</legend>
          <igc-radio-group>
            ${radios.map(
              (e) => html`
                <igc-radio name="required-fruit" required value=${e}>
                  ${titleCase(e)}
                </igc-radio>
              `
            )}
            <igc-radio name="required-fruit" value="tomato">
              Tomato
              <div slot="value-missing">Please select a value!</div>
            </igc-radio>
          </igc-radio-group>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
