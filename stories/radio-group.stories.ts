import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

import { IgcRadioGroupComponent, defineComponents } from '../src/index.js';
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
      type: '"vertical" | "horizontal"',
      description: 'Alignment of the radio controls inside this group.',
      options: ['vertical', 'horizontal'],
      control: { type: 'inline-radio' },
      table: { defaultValue: { summary: 'vertical' } },
    },
  },
  args: { alignment: 'vertical' },
};

export default metadata;

interface IgcRadioGroupArgs {
  /** Alignment of the radio controls inside this group. */
  alignment: 'vertical' | 'horizontal';
}
type Story = StoryObj<IgcRadioGroupArgs>;

// endregion

Object.assign(metadata.parameters!, {
  actions: {
    handles: ['igcChange', 'igcFocus', 'igcBlur'],
  },
});

const radios = ['apple', 'orange', 'mango', 'banana'];
const titleCase = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase());

const Template = ({ alignment }: IgcRadioGroupArgs) => {
  return html`
    <igc-radio-group alignment="${ifDefined(alignment)}">
      ${radios.map(
        (v) =>
          html`<igc-radio name="fruit" value=${v}>${titleCase(v)}</igc-radio> `
      )}
    </igc-radio-group>
  `;
};

export const Basic: Story = Template.bind({});

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
          <legend>Same name scattered outside of group</legend>
          <igc-radio name="scattered-fruit" value="apple">Apple</igc-radio>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolore
              dolorum, corporis exercitationem laborum dignissimos sunt itaque
              ducimus, soluta blanditiis inventore est quae provident dolores,
              labore asperiores totam voluptate et minima.
            </p>
            <igc-radio name="scattered-fruit" value="banana">Banana</igc-radio>
            <igc-radio name="scattered-fruit" value="lemon">Lemon</igc-radio>
            <igc-input label="Search..."></igc-input>
            <igc-radio name="scattered-fruit" value="orange">Orange</igc-radio>
          </igc-radio-group>
          <p>...</p>
          <igc-radio-group alignment=${ifDefined(args.alignment)}>
            <igc-radio name="scattered-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
            <igc-radio name="scattered-fruit" value="strawberry"
              >Strawberry</igc-radio
            >
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
                  <div slot="value-missing">Please select a value!</div>
                </igc-radio>
              `
            )}
            <igc-radio name="required-fruit" disabled value="tomato"
              >Tomato</igc-radio
            >
          </igc-radio-group>
        </fieldset>
        ${formControls()}
      </form>
    `;
  },
};
