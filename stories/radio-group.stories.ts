import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import {
  IgcRadioGroupComponent,
  defineComponents,
} from 'igniteui-webcomponents';
import { formControls, formSubmitHandler } from './story.js';

defineComponents(IgcRadioGroupComponent);

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

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcChange'],
  },
});

const radios = ['apple', 'orange', 'mango', 'banana'];
const titleCase = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase());

export const Default: Story = {
  args: {
    name: 'default-state',
    value: 'mango',
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

export const Form: Story = {
  render: (args) => {
    return html`
      <form action="" @submit=${formSubmitHandler}>
        <fieldset>
          <legend>Default</legend>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            ${radios.map(
              (e) =>
                html`<igc-radio name="default-fruit" value=${e}
                  >${titleCase(e)}</igc-radio
                >`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset>
          <legend>Initial value</legend>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            ${radios.map(
              (e) =>
                html`<igc-radio name="initial-fruit" checked value=${e}
                  >${titleCase(e)}</igc-radio
                >`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset disabled>
          <legend>Disabled</legend>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            ${radios.map(
              (e) =>
                html`<igc-radio name="default-fruit" value=${e}
                  >${titleCase(e)}</igc-radio
                >`
            )}
          </igc-radio-group>
        </fieldset>

        <fieldset>
          <legend>Required</legend>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            ${radios.map(
              (e) => html`
                <igc-radio name="required-fruit" required value=${e}>
                  ${titleCase(e)}
                </igc-radio>
              `
            )}
            <igc-radio name="required-fruit" value="tomato"
              >Tomato
              <div slot="value-missing">Please select a value!</div>
            </igc-radio>
          </igc-radio-group>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
