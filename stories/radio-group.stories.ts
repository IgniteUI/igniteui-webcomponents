import { html } from 'lit-html';
import '../igniteui-webcomponents.js';
import { Story } from './story.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { IgcRadioComponent } from '../src/components/radio/radio.js';

export default {
  title: 'Radio Group',
  component: 'igc-radio-group',
  argTypes: {
    labelPosition: {
      control: {
        type: 'inline-radio',
        options: ['before', 'after'],
      },
      defaultValue: 'after',
    },
    alignment: {
      control: {
        type: 'inline-radio',
        options: ['vertical', 'horizontal'],
      },
      defaultValue: 'vertical',
    },
    disabled: {
      control: 'boolean',
      description: 'Determines whether the radio is disabled.',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'false',
        },
      },
    },
  },
};

interface ArgTypes {
  alignment: 'vertical' | 'horizontal';
  labelPosition: 'before' | 'after';
  disabled: boolean;
}

interface Context {
  globals: { theme: string; direction: string };
}

const Template: Story<ArgTypes, Context> = (
  { alignment, labelPosition, disabled }: ArgTypes,
  { globals: { direction } }: Context
) => {
  const handleChange = (e: Event) => {
    console.log((e.target as IgcRadioComponent).value);
  };

  const handleFocus = (e: Event) => {
    console.log('focused', e.target);
  };

  const handleBlur = (e: Event) => {
    console.log('blurred', e.target);
  };

  return html`
  <div dir="${ifDefined(direction)}">
    <igc-radio-group
      alignment="${ifDefined(alignment)}"
      label-position="${ifDefined(labelPosition)}"
      .disabled="${ifDefined(disabled)}"
      @igcChange="${handleChange}"
    >
      <igc-radio
        name="fruit"
        value="apple"
        @igcFocus="${handleFocus}"
        @igcBlur="${handleBlur}"
      >Apple</igc-radio>
      <igc-radio name="fruit" value="orange" checked>Orange</igc-radio>
      <igc-radio name="fruit" value="mango">Mango</igc-radio>
      <igc-radio name="fruit" value="banana" disabled>Banana</igc-radio>
    </igc-radio>
  </div>
`;
};

export const Basic = Template.bind({});
